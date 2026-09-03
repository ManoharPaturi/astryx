// Temporary capture harness for the Figma panel study. Not shipped.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const PORT = process.env.PORT || '5199';
const OUT = process.env.OUT || '.tmp-figma/v1';
mkdirSync(OUT, {recursive: true});

const url = `http://localhost:${PORT}/packages/cli/assets/templates/pages/figma-design-panel`;
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: {width: 700, height: 1200},
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

const errors = [];
page.on('console', m => {
  if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', e => errors.push(`[pageerror] ${e.message}`));

await page.goto(url, {waitUntil: 'networkidle'});
await page.waitForTimeout(1200);

// The panel is the single fixed-width card on the stage.
const panel = await page.evaluate(() => {
  const el = [...document.querySelectorAll('div')].find(
    d => Math.round(d.getBoundingClientRect().width) === 311,
  );
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {x: r.x, y: r.y, width: r.width, height: r.height};
});

if (panel) {
  await page.screenshot({path: `${OUT}/panel.png`, clip: panel});
  console.log('panel', panel);
} else {
  console.log('!! panel element not found');
}
await page.screenshot({path: `${OUT}/full.png`});

if (errors.length) {
  console.log('\n--- console ---');
  console.log([...new Set(errors)].slice(0, 25).join('\n'));
}

await browser.close();
console.log('done →', OUT);
