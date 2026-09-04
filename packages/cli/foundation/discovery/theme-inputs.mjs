// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme-inputs — the set of files a built theme was compiled FROM, and a
 * digest over their contents.
 *
 * This exists so freshness can be decided WITHOUT evaluating anything. A theme
 * entry `import`s tokens, palettes and helpers; the entry's own mtime says
 * nothing about those, so an entry-only check reports a theme as fresh after a
 * token file changed underneath it. Recompiling would answer correctly, but
 * compiling means jiti executing the theme and its whole import graph — real
 * code execution with a filesystem cache — which `doctor` must not do.
 *
 * So the build records a digest over every input, and `doctor` recomputes it
 * from disk. Reading and hashing files is the whole cost: no module is loaded,
 * no code runs, nothing is written.
 *
 * The walk is deliberately honest about its own limits. Every specifier is
 * ACCOUNTED FOR — none is assumed harmless. A specifier that resolves to source
 * inside the project is content-hashed like any other input; one that resolves
 * into `node_modules` is fingerprinted by its package identity and version,
 * which is what changes when a dependency changes; and anything that cannot be
 * resolved or followed at all makes the digest unavailable rather than wrong.
 *
 * That distinction is the whole point. A bare specifier is NOT automatically an
 * external package: in a workspace, `@myapp/tokens` is local source that changes
 * with no version bump at all. Treating bare specifiers as out of scope let a
 * changed workspace token package leave the digest identical, so `doctor`
 * reported "in step with source" — the same false green this module exists to
 * remove, coming back through a different door.
 *
 * @input  A theme entry file.
 * @output The transitive input set, and a content digest over it.
 * @position foundation/discovery leaf — used by api/theme/build (to record) and
 *   api/doctor (to verify). Node builtins only.
 */

import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {createRequire} from 'node:module';

/**
 * Extensions a theme module can resolve to, source before artifact.
 *
 * MUST match `THEME_MODULE_EXTENSIONS` in api/theme/build/build.mjs: the walk
 * has to pick the same file jiti would, or the digest describes a different
 * graph from the one that was compiled. `.js` sits after the TypeScript
 * extensions for the reason documented there — `theme build` writes `<name>.js`
 * beside `<name>.ts`, and resolving the artifact instead of the source made
 * theme inheritance silently evaporate.
 */
const EXTENSIONS = [
  '.ts', '.tsx', '.mts', '.cts', '.mtsx', '.ctsx', '.mjs', '.cjs', '.js', '.json',
];

/** Hard bound: a theme graph is small, and a cycle must not hang `doctor`. */
const MAX_INPUTS = 200;

/**
 * Blank the TEXT of template literals while KEEPING `${...}` interpolations,
 * preserving offsets, so prose about importing is not read as an import but
 * real code inside an interpolation still is.
 *
 * Found by building a real app: core's `<Theme>` prints a perf hint whose text
 * contains an example `import '@astryxdesign/theme-<name>/theme.css'`. The walk
 * read that as two unresolvable specifiers, declared the graph incomplete, and
 * every build then recorded `Inputs: unverifiable` — freshness could not verify
 * anything, in any real project, while every unit test passed.
 *
 * The first fix over-corrected and blanked interpolations too. That is the
 * opposite failure and worse: `${require('./tokens')}` is a REAL dependency, and
 * swallowing it left the digest unchanged when tokens changed — a stale theme
 * reported as current. Text is prose; an interpolation is code. Keep the code.
 *
 * Plain '' and "" strings are left alone: a real specifier lives in one, and the
 * surrounding grammar (`from`, `import(`, `require(`) is what makes it an
 * import. Template TEXT can never be a static specifier.
 *
 * @param {string} code
 * @returns {string}
 */
function blankLiterals(code) {
  let out = '';
  let i = 0;
  while (i < code.length) {
    if (code[i] !== '`') {
      out += code[i];
      i += 1;
      continue;
    }
    out += ' '; // the opening backtick itself is not code
    i += 1;
    while (i < code.length) {
      const c = code[i];
      if (c === '\\') {
        out += '  ';
        i += 2;
        continue;
      }
      if (c === '`') {
        out += ' ';
        i += 1;
        break;
      }
      if (c === '$' && code[i + 1] === '{') {
        // An interpolation is executable code — copy it through verbatim,
        // tracking brace depth so a nested object or template inside it does
        // not end the interpolation early.
        out += '  ';
        i += 2;
        let depth = 1;
        while (i < code.length && depth > 0) {
          const k = code[i];
          if (k === '{') depth += 1;
          else if (k === '}') depth -= 1;
          if (depth === 0) {
            out += ' ';
            i += 1;
            break;
          }
          out += k;
          i += 1;
        }
        continue;
      }
      // Keep newlines so line offsets, and the `^`-anchored alternatives in
      // the specifier patterns, still behave.
      out += c === '\n' ? '\n' : ' ';
      i += 1;
    }
  }
  return out;
}

/**
 * Every static specifier in a module, plus whether anything was unfollowable.
 *
 * Comments are blanked rather than removed so a commented-out import cannot
 * contribute a phantom input, and template-literal CONTENTS are blanked too:
 * over-collecting is NOT the safe direction it looks like. An import-shaped
 * line inside a warning string resolves to nothing, which marks the graph
 * incomplete, which suppresses the digest entirely — one line of prose in a
 * dependency silently disabled freshness checking for every project. What
 * cannot be a specifier must not be read as one.
 *
 * @param {string} src
 * @returns {{specifiers: string[], dynamic: boolean}}
 */
export function readSpecifiers(src) {
  const code = blankLiterals(
    src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1'),
  );

  /** @type {string[]} */
  const specifiers = [];
  // `import x from 's'`, `import 's'`, `export {x} from 's'`.
  for (const m of code.matchAll(/(?:^|[\s;}])(?:import|export)\b[^'"()]*?from\s*['"]([^'"]+)['"]/g)) {
    specifiers.push(m[1]);
  }
  for (const m of code.matchAll(/(?:^|[\s;}])import\s*['"]([^'"]+)['"]/g)) {
    specifiers.push(m[1]);
  }
  for (const m of code.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    specifiers.push(m[1]);
  }
  // Dynamic import or require with a literal is followable; with anything else
  // it is not. Both forms count: a computed `require(name)` hides an input just
  // as effectively as a computed `import(name)`.
  let dynamic = false;
  for (const m of code.matchAll(/\bimport\s*\(\s*([^)]*)\)/g)) {
    const arg = m[1].trim();
    const literal = /^['"]([^'"]+)['"]$/.exec(arg);
    if (literal) specifiers.push(literal[1]);
    else if (arg.length > 0) dynamic = true;
  }
  for (const m of code.matchAll(/\brequire\s*\(\s*([^)]*)\)/g)) {
    const arg = m[1].trim();
    if (arg.length > 0 && !/^['"][^'"]+['"]$/.test(arg)) dynamic = true;
  }
  return {specifiers, dynamic};
}

/**
 * Resolve a relative specifier the way the theme loader would.
 * @param {string} fromFile
 * @param {string} specifier
 * @returns {string|null}
 */
function resolveRelative(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [];
  if (path.extname(base)) {
    candidates.push(base);
    // `./tokens.js` in TypeScript source means `./tokens.ts` on disk.
    const stem = base.slice(0, -path.extname(base).length);
    for (const ext of EXTENSIONS) candidates.push(stem + ext);
  } else {
    for (const ext of EXTENSIONS) candidates.push(base + ext);
    for (const ext of EXTENSIONS) candidates.push(path.join(base, `index${ext}`));
  }
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {
      /* not this one */
    }
  }
  return null;
}

/**
 * Resolve a BARE specifier from the importing file, and classify what it is.
 *
 * A bare specifier addresses a PACKAGE, and the question is what identifies
 * that package's contents. Two answers, and picking the wrong one makes this
 * check lie in one direction or the other:
 *
 *   - An INSTALLED package is immutable in place: its files change only when
 *     the version does. Fingerprint `name@version`. Walking its file tree is
 *     unbounded and pointless — a linked monorepo `@astryxdesign/core` is
 *     several hundred dist files, which blows the input bound and reports the
 *     whole theme unverifiable.
 *   - A LINKED package (a workspace sibling, a `file:` dep, an npm-linked
 *     checkout) is live source. Its files change under a fixed version all day,
 *     which is the point of linking it. Content-hash it.
 *
 * The version string cannot tell these apart. An earlier version of this used
 * `0.0.0` as the workspace marker; a workspace package carrying a normal
 * `1.2.3` was then fingerprinted as immutable, its token source changed, and
 * `doctor` said "in step with source" — the same false green this module
 * exists to remove.
 *
 * What DOES tell them apart is how the specifier resolves. An installed package
 * lives under `node_modules` for real; a linked one is a symlink whose target
 * escapes it. `fs.realpathSync` is the whole test.
 *
 * @param {string} fromFile
 * @param {string} specifier
 * @returns {{kind: 'source', file: string} | {kind: 'package', id: string} | null}
 */
function resolveBare(fromFile, specifier) {
  let resolved;
  try {
    resolved = createRequire(fromFile).resolve(specifier);
  } catch {
    // Not resolvable from here. Could be a types-only import, a subpath the
    // exports map hides, or a genuinely missing dep — all unverifiable.
    return null;
  }
  // Node builtins resolve to bare names with no separator; they never change.
  if (!path.isAbsolute(resolved)) return {kind: 'package', id: `builtin:${specifier}`};

  let real;
  try {
    real = fs.realpathSync(resolved);
  } catch {
    real = resolved;
  }

  // Linked source: the resolved path went through node_modules, but the real
  // file does not live there. Its bytes are the only thing that tracks it.
  const installed = real.split(path.sep).includes('node_modules');
  if (!installed) return {kind: 'source', file: real};

  // A genuinely installed package: pin name@version.
  let dir = path.dirname(real);
  for (let i = 0; i < 12; i++) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (pkg.name) {
          // No version to pin against, and not linked either: unverifiable
          // rather than pinned to a string that never moves.
          return typeof pkg.version === 'string' && pkg.version.length > 0
            ? {kind: 'package', id: `${pkg.name}@${pkg.version}`}
            : null;
        }
      } catch {
        /* unreadable: fall through to the next parent */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // No readable package identity at all: cannot pin it.
  return null;
}

/**
 * The transitive set of files a theme entry is compiled from, plus the
 * identities of the packages it depends on.
 *
 * @param {string} entryFile - Absolute path to the theme entry.
 * @returns {{files: string[], packages: string[], complete: boolean}} `files`
 *   is sorted and includes the entry. `packages` is the sorted set of
 *   `name@version` fingerprints. `complete` is false when any input could not
 *   be accounted for, which makes the digest unusable as proof of freshness.
 */
export function collectThemeInputs(entryFile) {
  const entry = path.resolve(entryFile);
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {Set<string>} */
  const packages = new Set();
  const stack = [entry];
  let complete = true;

  while (stack.length > 0) {
    const file = stack.pop();
    if (!file || seen.has(file)) continue;
    if (seen.size >= MAX_INPUTS) {
      // A graph this size is not a theme. Refuse to claim a complete picture.
      complete = false;
      break;
    }
    let src;
    try {
      src = fs.readFileSync(file, 'utf-8');
    } catch {
      complete = false;
      continue;
    }
    seen.add(file);
    if (file.endsWith('.json')) continue;

    const {specifiers, dynamic} = readSpecifiers(src);
    if (dynamic) complete = false;
    for (const specifier of specifiers) {
      if (specifier.startsWith('.')) {
        const resolved = resolveRelative(file, specifier);
        if (resolved) stack.push(resolved);
        else complete = false;
        continue;
      }
      // Bare: local workspace source, an installed package, or unaccountable.
      const hit = resolveBare(file, specifier);
      if (!hit) complete = false;
      else if (hit.kind === 'source') stack.push(hit.file);
      else packages.add(hit.id);
    }
  }

  return {files: [...seen].sort(), packages: [...packages].sort(), complete};
}

/**
 * A content digest over a theme's whole input set.
 *
 * Local files are hashed by content, with paths relative to the entry so the
 * same theme digests identically in another checkout or in CI. Packages are
 * hashed by `name@version`, which is what changes when a dependency changes.
 *
 * @param {string} entryFile - Absolute path to the theme entry.
 * @returns {{digest: string|null, count: number, complete: boolean}} `digest`
 *   is null when the input set is incomplete — there is no such thing as a
 *   partial proof, so callers must treat it as "cannot verify".
 */
export function themeInputsDigest(entryFile) {
  const {files, packages, complete} = collectThemeInputs(entryFile);
  if (!complete || files.length === 0) {
    return {digest: null, count: files.length, complete: false};
  }
  const base = path.dirname(path.resolve(entryFile));
  const hash = crypto.createHash('sha256');
  for (const file of files) {
    hash.update(path.relative(base, file).split(path.sep).join('/'));
    hash.update('\0');
    try {
      hash.update(fs.readFileSync(file));
    } catch {
      return {digest: null, count: files.length, complete: false};
    }
    hash.update('\0');
  }
  for (const id of packages) {
    hash.update(id);
    hash.update('\0');
  }
  return {
    digest: hash.digest('hex').slice(0, 16),
    count: files.length + packages.length,
    complete: true,
  };
}
