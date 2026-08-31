#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @description Asserts documented component vars and the Spinner root cascade in Chromium
 * @input --storybook-dir <path> [--port <n>]
 * @output One line per check; exit 1 if a theme or root override cannot reach its painted owner
 *
 * A public var is a promise: set it on the component's theme target and the
 * component changes. Nothing in the unit suite can check that promise. jsdom
 * resolves no cascade, so the TreeList and Spinner theme tests assert on the
 * generated CSS text instead — which says the declaration was emitted, not that
 * it wins. A var can be documented, read, and emitted and still be beaten to
 * the element by a rule the theme cannot outrank.
 *
 * So this reproduces what a themer does. `Theme` injects component overrides as
 * `@layer astryx-theme { <selector> { … } }` (packages/core/src/theme/Theme.tsx),
 * and that is the exact shape written here, against the documented target class
 * — not against the element, which would prove a cascade a theme has no
 * selector for. Three ways to fail, all of them shipped at least once:
 *
 *   1. nothing declares the var          — no component reads it (#5012)
 *   2. the declaring element carries no documented target class
 *                                        — a theme has nothing to select
 *   3. the theme rule loses               — an inline write or an unlayered
 *                                           declaration outranks it (#4530)
 *
 * The generic pass stops at the value arriving on the declared element; it does
 * not prove the component paints with it. Spinner's focused regression below
 * continues through computed SVG geometry and stroke paint because its public
 * root and painted target are different elements.
 */

const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {pathToFileURL} = require('node:url');

const args = process.argv.slice(2);
const getArg = name => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const storybookDir = getArg('storybook-dir') || 'apps/storybook/dist';
const port = Number(getArg('port') || 6011);

/** Distinctive enough that a coincidental match is not a concern. */
const SENTINEL = '9987px';

/**
 * Stories tried per component before the var is reported unrenderable. A var
 * only some states declare (`--button-icon-only-aspect` needs `isIconOnly`)
 * is not reachable from the first story, so the sweep runs until one declares
 * it — the common case still exits on the first. The cap only bounds a
 * component with an unusually long story list.
 */
const STORY_BUDGET = 30;

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function createServer(dir, listenPort) {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const filePath = path
        .join(dir, req.url === '/' ? 'index.html' : req.url)
        .split('?')[0];

      const resolved = path.resolve(filePath);
      if (!resolved.startsWith(path.resolve(dir))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      fs.readFile(resolved, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': CONTENT_TYPES[path.extname(resolved)] || 'text/plain',
        });
        res.end(data);
      });
    });

    server.listen(listenPort, () => resolve(server));
  });
}

/**
 * The public vars and the target classes their component documents, read from
 * the same enumeration `theme targets` and `theme build` read — so a var added
 * to a doc is guarded here without anyone remembering to add it.
 */
async function documentedVars(repoRoot) {
  const discovery = path.join(
    repoRoot,
    'packages/cli/foundation/discovery/theming-targets.mjs',
  );
  const {collectThemingVars, collectThemingTargets} = await import(
    pathToFileURL(discovery).href
  );
  const coreSrc = path.join(repoRoot, 'packages/core/src');
  const [vars, targets] = await Promise.all([
    collectThemingVars(coreSrc),
    collectThemingTargets(coreSrc),
  ]);
  return vars.map(v => ({
    ...v,
    classNames: targets
      .filter(t => t.component === v.component)
      .map(t => t.className),
  }));
}

/** Story ids for a component, in declaration order. */
function storiesFor(index, component) {
  return Object.values(index.entries || {})
    .filter(e => e.type === 'story' && e.title.split('/').pop() === component)
    .map(e => e.id);
}

/**
 * In the page: find the element that declares `name`, check it carries one of
 * the component's documented target classes, then override through that class
 * from `@layer astryx-theme` and read the value back.
 */
function reachInPage([name, classNames, sentinel]) {
  const declaring = [...document.querySelectorAll('*')].find(el => {
    if (!getComputedStyle(el).getPropertyValue(name).trim()) return false;
    const parent = el.parentElement;
    return !parent || !getComputedStyle(parent).getPropertyValue(name).trim();
  });
  if (!declaring) return {status: 'undeclared'};

  const target = classNames.find(c => declaring.classList.contains(c));
  if (!target) {
    return {
      status: 'unselectable',
      classes: [...declaring.classList].filter(c => c.startsWith('astryx-')),
    };
  }

  const before = getComputedStyle(declaring).getPropertyValue(name).trim();
  const style = document.createElement('style');
  style.textContent = `@layer astryx-theme { .${target} { ${name}: ${sentinel}; } }`;
  document.head.appendChild(style);
  const after = getComputedStyle(declaring).getPropertyValue(name).trim();
  style.remove();

  return {
    status: after === sentinel ? 'reaches' : 'inert',
    target,
    before,
    after,
  };
}

async function probe(context, entry, index) {
  const ids = storiesFor(index, entry.component).slice(0, STORY_BUDGET);
  if (ids.length === 0) {
    return {status: 'nostory'};
  }
  let last = {status: 'undeclared'};
  for (const id of ids) {
    const page = await context.newPage();
    try {
      await page.goto(
        `http://localhost:${port}/iframe.html?id=${id}&viewMode=story`,
        {waitUntil: 'networkidle', timeout: 30000},
      );
      const result = await page.evaluate(reachInPage, [
        entry.name,
        entry.classNames,
        SENTINEL,
      ]);
      if (result.status !== 'undeclared') return {...result, story: id};
      last = {...result, story: id};
    } finally {
      await page.close();
    }
  }
  return last;
}

/**
 * Spinner's labelled public root and painted theme target are different
 * elements. This browser fixture proves the private bridge keeps the normal
 * theme path and all three root styling escape hatches in the promised order.
 */
async function probeSpinnerCascade(context, index) {
  const id = 'core-spinner--theme-cascade-contract';
  if (!Object.values(index.entries || {}).some(entry => entry.id === id)) {
    return {status: 'nostory'};
  }

  const page = await context.newPage();
  try {
    await page.goto(
      `http://localhost:${port}/iframe.html?id=${id}&viewMode=story`,
      {waitUntil: 'networkidle', timeout: 30000},
    );
    await page.waitForSelector('[data-spinner-cascade="root-class"]', {
      timeout: 20000,
    });
    const readings = await page.evaluate(() => {
      const read = name => {
        const root = document.querySelector(`[data-spinner-cascade="${name}"]`);
        const status = root?.matches('[role="status"]')
          ? root
          : root?.querySelector('[role="status"]');
        const circles = status?.querySelectorAll('circle');
        const svg = status?.querySelector('svg');
        if (
          !(root instanceof HTMLElement) ||
          !(status instanceof HTMLElement) ||
          !svg ||
          circles?.length !== 2
        ) {
          return {name, error: 'missing root, status, svg, or circles'};
        }
        const statusStyle = getComputedStyle(status);
        const svgStyle = getComputedStyle(svg);
        const box = status.getBoundingClientRect();
        return {
          name,
          rootHasTarget: root.classList.contains('astryx-spinner'),
          statusHasTarget: status.classList.contains('astryx-spinner'),
          publicDiameter: statusStyle
            .getPropertyValue('--spinner-diameter')
            .trim(),
          publicStroke: statusStyle
            .getPropertyValue('--spinner-stroke-width')
            .trim(),
          rootDiameter: statusStyle
            .getPropertyValue('--_spinner-root-diameter')
            .trim(),
          rootStroke: statusStyle
            .getPropertyValue('--_spinner-root-stroke')
            .trim(),
          box: [box.width, box.height],
          svgBox: [svgStyle.width, svgStyle.height],
          radius: getComputedStyle(circles[1]).r,
          strokeWidth: getComputedStyle(circles[1]).strokeWidth,
          arcPaint: getComputedStyle(circles[1]).stroke,
          trackPaint: getComputedStyle(circles[0]).stroke,
        };
      };
      return [
        read('theme-unlabelled'),
        read('theme-labelled'),
        read('root-style'),
        read('root-xstyle'),
        read('root-class'),
      ];
    });

    const expected = {
      'theme-unlabelled': [74, 30, 7, 'rgb(71, 72, 73)', 'rgb(74, 75, 76)', ''],
      'theme-labelled': [74, 30, 7, 'rgb(71, 72, 73)', 'rgb(74, 75, 76)', ''],
      'root-style': [50, 20, 5, 'rgb(1, 2, 3)', 'rgb(4, 5, 6)', '40px'],
      'root-xstyle': [54, 21, 6, 'rgb(7, 8, 9)', 'rgb(10, 11, 12)', '42px'],
      'root-class': [60, 22, 8, 'rgb(13, 14, 15)', 'rgb(16, 17, 18)', '44px'],
    };
    const near = (value, number) =>
      Math.abs(Number.parseFloat(String(value)) - number) < 0.05;
    const failed = readings.find(reading => {
      const want = expected[reading.name];
      return (
        reading.error ||
        !reading.statusHasTarget ||
        (reading.name !== 'theme-unlabelled' && reading.rootHasTarget) ||
        reading.publicDiameter !== '60px' ||
        reading.publicStroke !== '7px' ||
        reading.rootDiameter !== want[5] ||
        !near(reading.box?.[0], want[0]) ||
        !near(reading.box?.[1], want[0]) ||
        !near(reading.svgBox?.[0], want[0]) ||
        !near(reading.svgBox?.[1], want[0]) ||
        !near(reading.radius, want[1]) ||
        !near(reading.strokeWidth, want[2]) ||
        reading.arcPaint !== want[3] ||
        reading.trackPaint !== want[4]
      );
    });
    return failed == null
      ? {status: 'reaches', readings}
      : {status: 'failed', reading: failed};
  } finally {
    await page.close();
  }
}

async function run() {
  const repoRoot = process.cwd();
  const dir = path.resolve(repoRoot, storybookDir);
  if (!fs.existsSync(dir)) {
    console.error(`Storybook build not found at ${dir}`);
    return 1;
  }
  const indexPath = path.join(dir, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.error(`Storybook index not found at ${indexPath}`);
    return 1;
  }
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  const entries = await documentedVars(repoRoot);
  if (entries.length === 0) {
    console.error(
      'No public component vars were enumerated. The docs cannot have lost ' +
        'all of them at once — the enumeration is broken.',
    );
    return 1;
  }

  const server = await createServer(dir, port);
  const browser = await chromium.launch();
  const failures = [];

  try {
    const context = await browser.newContext({
      viewport: {width: 900, height: 700},
    });

    for (const entry of entries) {
      const r = await probe(context, entry, index);
      const where = `${entry.component} ${entry.name}`;
      if (r.status === 'reaches') {
        console.log(
          `✓ ${where} — .${r.target} sets it (${r.before} → ${r.after})`,
        );
        continue;
      }
      failures.push(where);
      if (r.status === 'nostory') {
        console.error(`✗ ${where}: no story renders ${entry.component}`);
      } else if (r.status === 'undeclared') {
        console.error(
          `✗ ${where}: nothing declares it — no element in any ${entry.component} story has a value (#5012)`,
        );
      } else if (r.status === 'unselectable') {
        console.error(
          `✗ ${where}: declared on an element carrying no documented target class ` +
            `(has ${r.classes.join(', ') || 'none'}) — a theme has no selector for it`,
        );
      } else {
        console.error(
          `✗ ${where}: .${r.target} in @layer astryx-theme did not win — stayed ${r.after} (#4530)`,
        );
      }
    }

    const spinnerCascade = await probeSpinnerCascade(context, index);
    if (spinnerCascade.status === 'reaches') {
      console.log(
        '✓ Spinner labelled root overrides — theme, style, xstyle, and className precedence reaches the ring',
      );
    } else {
      failures.push('Spinner labelled root override precedence');
      console.error(
        `✗ Spinner labelled root override precedence: ${JSON.stringify(spinnerCascade)}`,
      );
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (failures.length > 0) {
    console.error(
      `\nFailing: ${failures.length} theme reachability check(s) — ` +
        `${failures.join(', ')}. A documented override that cannot reach its ` +
        `painted owner is worse than no override.`,
    );
    return 1;
  }
  console.log(
    `\nAll ${entries.length} public component vars and the Spinner root override cascade are reachable.`,
  );
  return 0;
}

run()
  .then(code => {
    process.exitCode = code;
  })
  .catch(e => {
    console.error('Theme var reachability guard failed:', e);
    process.exit(1);
  });
