// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the theme input walk and digest.
 *
 * The contract these pin is narrow but load-bearing: the digest must change
 * when ANY local input changes — that is the false negative it exists to close
 * — and it must refuse to produce a digest at all when it cannot see the whole
 * input set, because a partial digest is indistinguishable from a complete one
 * at the point where `doctor` reads it.
 */

import {describe, it, expect, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
  collectThemeInputs,
  themeInputsDigest,
  readSpecifiers,
} from './theme-inputs.mjs';

const tmpDirs = [];
function mkProject(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-inputs-'));
  tmpDirs.push(dir);
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), {recursive: true});
    fs.writeFileSync(abs, content);
  }
  return dir;
}
afterEach(() => {
  while (tmpDirs.length) fs.rmSync(tmpDirs.pop(), {recursive: true, force: true});
});

describe('readSpecifiers', () => {
  it('finds static imports, re-exports and requires', () => {
    const {specifiers} = readSpecifiers(
      [
        "import a from './a';",
        "import {b} from './b.ts';",
        "import './side-effect';",
        "export {c} from './c';",
        "const d = require('./d');",
        "const e = await import('./e');",
      ].join('\n'),
    );
    expect(specifiers).toEqual(
      expect.arrayContaining(['./a', './b.ts', './side-effect', './c', './d', './e']),
    );
  });

  it('ignores a commented-out import', () => {
    const {specifiers} = readSpecifiers("// import x from './ghost';\nimport y from './real';");
    expect(specifiers).toEqual(['./real']);
  });

  it('reports a computed dynamic import as unfollowable', () => {
    expect(readSpecifiers("const m = await import(name);").dynamic).toBe(true);
    expect(readSpecifiers("const m = await import('./fixed');").dynamic).toBe(false);
  });
});

describe('collectThemeInputs', () => {
  it('follows the local import graph transitively', () => {
    const dir = mkProject({
      'theme.ts': "import {a} from './tokens';\nexport const t = a;",
      'tokens.ts': "import {b} from './palette';\nexport const a = b;",
      'palette.ts': 'export const b = 1;',
    });
    const {files, complete} = collectThemeInputs(path.join(dir, 'theme.ts'));
    expect(complete).toBe(true);
    expect(files.map(f => path.basename(f))).toEqual(['palette.ts', 'theme.ts', 'tokens.ts']);
  });

  it('reports unverifiable when a bare specifier cannot be resolved from here', () => {
    // This USED to assert that bare specifiers were ignored as "packages,
    // covered by the version fields". That assumption is what let a changed
    // workspace package pass as fresh, so it is gone: an input that cannot be
    // accounted for makes the graph unverifiable, never silently complete.
    const dir = mkProject({
      'theme.ts': "import {defineTheme} from '@astryxdesign/core/theme';\nexport const t = 1;",
    });
    expect(collectThemeInputs(path.join(dir, 'theme.ts')).complete).toBe(false);
  });

  it('resolves a .js specifier to the .ts on disk, as the loader does', () => {
    const dir = mkProject({
      'theme.ts': "import {a} from './tokens.js';\nexport const t = a;",
      'tokens.ts': 'export const a = 1;',
    });
    const {files, complete} = collectThemeInputs(path.join(dir, 'theme.ts'));
    expect(complete).toBe(true);
    expect(files.map(f => path.basename(f))).toContain('tokens.ts');
  });

  it('resolves a directory import through its index', () => {
    const dir = mkProject({
      'theme.ts': "import {a} from './tokens';\nexport const t = a;",
      'tokens/index.ts': 'export const a = 1;',
    });
    expect(collectThemeInputs(path.join(dir, 'theme.ts')).complete).toBe(true);
  });

  it('is incomplete when a relative import does not resolve', () => {
    const dir = mkProject({'theme.ts': "import {a} from './missing';\nexport const t = a;"});
    expect(collectThemeInputs(path.join(dir, 'theme.ts')).complete).toBe(false);
  });

  it('terminates on a cycle', () => {
    const dir = mkProject({
      'a.ts': "import './b';\nexport const a = 1;",
      'b.ts': "import './a';\nexport const b = 1;",
    });
    const {files, complete} = collectThemeInputs(path.join(dir, 'a.ts'));
    expect(complete).toBe(true);
    expect(files).toHaveLength(2);
  });
});

describe('themeInputsDigest', () => {
  it('is stable across repeated calls', () => {
    const dir = mkProject({'theme.ts': 'export const t = 1;'});
    const entry = path.join(dir, 'theme.ts');
    expect(themeInputsDigest(entry).digest).toBe(themeInputsDigest(entry).digest);
  });

  it('changes when an IMPORTED file changes but the entry does not', () => {
    // The whole reason this module exists. The entry is untouched — its mtime,
    // its bytes, everything — and the theme is still a different theme.
    const dir = mkProject({
      'theme.ts': "import {a} from './tokens';\nexport const t = a;",
      'tokens.ts': 'export const a = "#ff3366";',
    });
    const entry = path.join(dir, 'theme.ts');
    const before = themeInputsDigest(entry).digest;
    fs.writeFileSync(path.join(dir, 'tokens.ts'), 'export const a = "#00ff00";');
    expect(themeInputsDigest(entry).digest).not.toBe(before);
  });

  it('changes when the entry itself changes', () => {
    const dir = mkProject({'theme.ts': 'export const t = 1;'});
    const entry = path.join(dir, 'theme.ts');
    const before = themeInputsDigest(entry).digest;
    fs.writeFileSync(entry, 'export const t = 2;');
    expect(themeInputsDigest(entry).digest).not.toBe(before);
  });

  it('does not change when a file OUTSIDE the graph changes', () => {
    const dir = mkProject({
      'theme.ts': 'export const t = 1;',
      'unrelated.ts': 'export const u = 1;',
    });
    const entry = path.join(dir, 'theme.ts');
    const before = themeInputsDigest(entry).digest;
    fs.writeFileSync(path.join(dir, 'unrelated.ts'), 'export const u = 2;');
    expect(themeInputsDigest(entry).digest).toBe(before);
  });

  it('is identical for the same theme in a different directory', () => {
    // Paths are hashed relative to the entry, so a checkout elsewhere — or CI —
    // must not report every artifact as stale.
    const files = {
      'theme.ts': "import {a} from './tokens';\nexport const t = a;",
      'tokens.ts': 'export const a = 1;',
    };
    const one = themeInputsDigest(path.join(mkProject(files), 'theme.ts')).digest;
    const two = themeInputsDigest(path.join(mkProject(files), 'theme.ts')).digest;
    expect(one).toBe(two);
    expect(one).not.toBeNull();
  });

  it('refuses a digest rather than returning a partial one', () => {
    const dir = mkProject({'theme.ts': "import './missing';\nexport const t = 1;"});
    const {digest, complete} = themeInputsDigest(path.join(dir, 'theme.ts'));
    expect(complete).toBe(false);
    expect(digest).toBeNull();
  });

  it('refuses a digest for an entry that does not exist', () => {
    const dir = mkProject({'other.ts': 'export const o = 1;'});
    expect(themeInputsDigest(path.join(dir, 'nope.ts')).digest).toBeNull();
  });
});

describe('themeInputsDigest — every input is accounted for, not just relative ones', () => {
  // A bare specifier is NOT automatically an external package. In a workspace,
  // `@myapp/tokens` is local source that changes with no version bump. Skipping
  // bare specifiers let a changed workspace token package leave the digest
  // identical, so doctor reported "in step with source" — the same false green
  // this module exists to remove, through a different door.
  function workspace() {
    const dir = mkProject({
      'packages/tokens/package.json': JSON.stringify({name: '@myapp/tokens', version: '1.2.3', main: 'index.js'}),
      'packages/tokens/index.js': 'export const accent = "#ff3366";',
      'theme.ts': "import {accent} from '@myapp/tokens';\nexport const t = accent;",
    });
    fs.mkdirSync(path.join(dir, 'node_modules/@myapp'), {recursive: true});
    fs.symlinkSync(path.join(dir, 'packages/tokens'), path.join(dir, 'node_modules/@myapp/tokens'));
    return dir;
  }

  it('follows a symlinked workspace package as SOURCE even with a real version', () => {
    // The version string cannot classify this. A workspace package carrying a
    // normal 1.2.3 was fingerprinted as immutable, its source changed, and the
    // digest did not move — a false green. Resolution decides, not the version.
    const dir = workspace();
    const {digest, complete} = themeInputsDigest(path.join(dir, 'theme.ts'));
    expect(complete).toBe(true);
    const before = digest;
    fs.writeFileSync(path.join(dir, 'packages/tokens/index.js'), 'export const accent = "#00ff00";');
    expect(themeInputsDigest(path.join(dir, 'theme.ts')).digest).not.toBe(before);
  });

  it('fingerprints a real dependency by name@version', () => {
    const dir = mkProject({
      'node_modules/dep/package.json': JSON.stringify({name: 'dep', version: '1.0.0', main: 'index.js'}),
      'node_modules/dep/index.js': 'module.exports = {};',
      'theme.ts': "import d from 'dep';\nexport const t = d;",
    });
    const before = themeInputsDigest(path.join(dir, 'theme.ts')).digest;
    fs.writeFileSync(
      path.join(dir, 'node_modules/dep/package.json'),
      JSON.stringify({name: 'dep', version: '1.0.1', main: 'index.js'}),
    );
    expect(themeInputsDigest(path.join(dir, 'theme.ts')).digest).not.toBe(before);
  });

  it('fingerprints a RELEASED package instead of walking its file tree', () => {
    // A linked monorepo core is hundreds of dist files: walking it blows the
    // input bound and reports the whole theme unverifiable, which is how this
    // check would become useless in the repo that owns it.
    const dir = mkProject({
      'node_modules/big/package.json': JSON.stringify({name: 'big', version: '2.0.0', main: 'index.js'}),
      'node_modules/big/index.js': "export * from './a';",
      'node_modules/big/a.js': 'export const a = 1;',
      'theme.ts': "import {a} from 'big';\nexport const t = a;",
    });
    const {files, packages, complete} = collectThemeInputs(path.join(dir, 'theme.ts'));
    expect(complete).toBe(true);
    expect(files).toHaveLength(1); // the entry only — the package was not walked
    expect(packages).toEqual(['big@2.0.0']);
  });

  it('reports unverifiable for a bare specifier that resolves to nothing', () => {
    const dir = mkProject({'theme.ts': "import x from 'not-installed';\nexport const t = x;"});
    const {digest, complete} = themeInputsDigest(path.join(dir, 'theme.ts'));
    expect(complete).toBe(false);
    expect(digest).toBeNull();
  });

  it('treats a computed require() as unfollowable, like a computed import()', () => {
    expect(readSpecifiers('const x = require(name);').dynamic).toBe(true);
    expect(readSpecifiers("const x = require('./fixed');").dynamic).toBe(false);
  });
});

describe('readSpecifiers — prose about importing is not an import', () => {
  // THE BUG THIS EXISTS FOR: core's <Theme> prints a perf hint containing an
  // example import inside a template literal. The walk read it as two
  // unresolvable specifiers, marked the graph incomplete, and suppressed the
  // digest — so EVERY real build recorded `Inputs: unverifiable` and the
  // freshness check could never verify anything. Unit tests all passed; only
  // building an actual app surfaced it.
  const warnHint = [
    'warnOnce(`theme-injection:${theme.name}`, `Theme`,',
    '  `"${theme.name}" is using runtime style injection.\\n` +',
    "  `  import {${theme.name}Theme} from '@astryxdesign/theme-${theme.name}/built';\\n` +",
    "  `  import '@astryxdesign/theme-${theme.name}/theme.css';\\n`);",
  ].join('\n');

  it('ignores an import written inside a template literal', () => {
    expect(readSpecifiers(warnHint)).toEqual({specifiers: [], dynamic: false});
  });

  it('keeps a real import that sits beside such prose', () => {
    const src = `import {tokens} from './tokens';\n${warnHint}`;
    expect(readSpecifiers(src).specifiers).toEqual(['./tokens']);
  });

  it('still treats a genuinely computed specifier as unfollowable', () => {
    expect(readSpecifiers('const x = require(name);').dynamic).toBe(true);
    expect(readSpecifiers('const y = await import(name);').dynamic).toBe(true);
  });

  it('a theme importing real core stays VERIFIABLE end to end', () => {
    // The end-to-end shape of the bug: any theme whose graph reaches a module
    // containing import-shaped prose must still produce a digest.
    const dir = mkProject({
      'node_modules/dep/package.json': JSON.stringify({name: 'dep', version: '1.0.0', main: 'index.js'}),
      'node_modules/dep/index.js': `export const x = 1;\n${warnHint}`,
      'theme.ts': "import {x} from 'dep';\nexport const t = x;",
    });
    const {digest, complete} = themeInputsDigest(path.join(dir, 'theme.ts'));
    expect(complete).toBe(true);
    expect(digest).not.toBeNull();
  });
});
