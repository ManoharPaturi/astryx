// One source of truth for "is StyleX actually going to compile here?".
//
// Two callers ask this question and MUST NOT disagree:
//   - api/doctor/theme-drift.mjs — diagnoses swizzled StyleX source
//   - foundation/agent-docs — decides whether to tell an agent to write xstyle
//
// They used to carry separate hardcoded plugin lists. With
// `@stylexjs/webpack-plugin` configured, doctor reported the swizzle as wired
// while the generated docs selected plain CSS — the diagnosis and the guidance
// pointing opposite ways about the same project. A shared module is the only
// arrangement that cannot drift.
//
// @input  A package directory.
// @output Whether a StyleX compiler is declared, and whether it is wired.
// @position foundation/discovery leaf. Node builtins only, so foundation and
//   api can both import it without crossing a package boundary.

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * StyleX compiler plugins. Swizzled StyleX source is inert without one.
 *
 * <!-- SYNC: packages/cli/assets/docs/styling.doc.mjs (bundler -> plugin table) -->
 */
export const STYLEX_COMPILERS = [
  // The first-party plugins `astryx docs styling` tells people to install.
  '@stylexjs/webpack-plugin',
  '@stylexjs/rollup-plugin',
  '@stylexjs/babel-plugin',
  '@stylexjs/postcss-plugin',
  // Community and SWC-based transforms.
  'vite-plugin-stylex',
  'unplugin-stylex',
  '@stylexswc/unplugin',
  '@stylexswc/nextjs-plugin',
  'stylex-webpack',
];

/** Build configs that could plausibly wire a StyleX plugin. */
const BUILD_CONFIG_FILES = [
  'vite.config.ts', 'vite.config.js', 'vite.config.mjs', 'vite.config.cjs',
  'next.config.ts', 'next.config.js', 'next.config.mjs', 'next.config.cjs',
  'webpack.config.ts', 'webpack.config.js', 'webpack.config.mjs', 'webpack.config.cjs',
  'rollup.config.ts', 'rollup.config.js', 'rollup.config.mjs', 'rollup.config.cjs',
  'babel.config.json', 'babel.config.js', 'babel.config.mjs', 'babel.config.cjs',
  '.babelrc', '.babelrc.json', '.babelrc.js',
  'postcss.config.js', 'postcss.config.mjs', 'postcss.config.cjs', 'postcss.config.json',
];

/**
 * Blank out comments while preserving offsets.
 *
 * A bare substring search counted a commented-out `// stylex()` as wiring and
 * reported a working setup for a project whose components render unstyled.
 *
 * @param {string} src
 * @returns {string}
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));
}

/**
 * Which of these plugins does this package DECLARE, walking up to `root`?
 *
 * A workspace dependency hoists and legitimately serves the app below it, so
 * the answer is not confined to the package's own package.json.
 *
 * @param {string} pkgDir
 * @param {string} [root]
 * @returns {{declared: string[], sawPackageJson: boolean}}
 */
export function declaredStyleXCompilers(pkgDir, root = pkgDir) {
  let dir = pkgDir;
  let sawPackageJson = false;
  for (let i = 0; i < 12; i++) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
      sawPackageJson = true;
      const deps = {...pkg.dependencies, ...pkg.devDependencies};
      const declared = STYLEX_COMPILERS.filter(c => c in deps);
      if (declared.length > 0) return {declared, sawPackageJson};
    } catch {
      /* no readable package.json here: keep walking */
    }
    if (dir === root) break;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return {declared: [], sawPackageJson};
}

/**
 * Is one of `plugins` referenced by a build config from `pkgDir` up to `root`,
 * in live code rather than a comment or prose?
 *
 * Text search on purpose — evaluating a consumer's build config is exactly the
 * code execution these callers refuse to do. A match must look like a
 * specifier or a call, so the plugin merely NAMED in a TODO does not count.
 *
 * @param {string} pkgDir
 * @param {string} plugins
 * @param {string} [root]
 * @returns {boolean}
 */
export function isStyleXConfigured(pkgDir, plugins, root = pkgDir) {
  const names = Array.isArray(plugins) ? plugins : [plugins];
  if (names.length === 0) return false;

  /**
   * The contents of every `plugins:`/`presets:` array in a config.
   *
   * Wiring means the plugin reaches the bundler's plugin list. Accepting any
   * call of the import counted `const unused = stylex();` beside
   * `plugins: []` — the plugin runs nowhere and the app compiles no StyleX.
   * Extracting the list and asking whether the plugin is IN it is the check
   * that matches what the bundler actually does.
   */
  const pluginLists = (/** @type {string} */ code) => {
    /** @type {string[]} */
    const lists = [];
    for (const m of code.matchAll(/\b(?:plugins|presets)\s*:\s*\[/g)) {
      let i = m.index + m[0].length;
      let depth = 1;
      const start = i;
      while (i < code.length && depth > 0) {
        if (code[i] === '[') depth += 1;
        else if (code[i] === ']') depth -= 1;
        i += 1;
      }
      lists.push(code.slice(start, i - 1));
    }
    return lists;
  };

  const referenced = (/** @type {string} */ src) => {
    const code = stripComments(src);
    const lists = pluginLists(code);
    return names.some(n => {
      const esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Named directly in a plugin list: `plugins: ['x']` or `plugins: [x()]`.
      const inList = lists.some(l =>
        new RegExp(`['"\`]${esc}['"\`]|\\b${esc}\\s*\\(`).test(l),
      );
      if (inList) return true;
      // Imported, then that binding used in a plugin list.
      const bind =
        new RegExp(`import\\s+(?:\\*\\s+as\\s+)?(\\w+)[^;]*?from\\s*['"\`]${esc}['"\`]`).exec(code) ??
        new RegExp(`(?:const|let|var)\\s+(\\w+)\\s*=\\s*require\\s*\\(\\s*['"\`]${esc}['"\`]`).exec(code);
      if (!bind) return false;
      const id = bind[1];
      return lists.some(l => new RegExp(`\\bnew\\s+${id}\\b|\\b${id}\\s*\\(|(^|[,\\s])${id}\\s*(,|$)`).test(l));
    });
  };

  let dir = pkgDir;
  for (let i = 0; i < 12; i++) {
    for (const name of BUILD_CONFIG_FILES) {
      const fp = path.join(dir, name);
      if (!fs.existsSync(fp)) continue;
      try {
        if (referenced(fs.readFileSync(fp, 'utf-8'))) return true;
      } catch {
        /* unreadable: try the next one */
      }
    }
    // package.json can carry babel/postcss config inline; JSON has no comments.
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
      const blob = JSON.stringify({babel: pkg.babel, postcss: pkg.postcss});
      if (names.some(n => blob.includes(n))) return true;
    } catch {
      /* fine */
    }
    if (dir === root) break;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return false;
}

/**
 * The single verdict both callers use.
 *
 * @param {string} pkgDir
 * @param {string} [root]
 * @returns {boolean|null} true = declared AND wired into a build config;
 *   false = not declared at all; null = declared but nothing references it,
 *   so it may never run — unverifiable, and never reported as working.
 */
export function styleXCompilerFor(pkgDir, root = pkgDir) {
  const {declared, sawPackageJson} = declaredStyleXCompilers(pkgDir, root);
  if (declared.length === 0) return sawPackageJson ? false : null;
  return isStyleXConfigured(pkgDir, declared, root) ? true : null;
}
