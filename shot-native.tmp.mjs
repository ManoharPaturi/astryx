// Temporary: screenshot a template page and report console errors. Not shipped.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const PORT = process.env.PORT || '5210';
const SLUG = process.env.SLUG || 'figma-design-panel-native';
const OUT = process.env.OUT || '.tmp-figma/native';
const WIDTH = Number(process.env.WIDTH || 420);
mkdirSync(OUT, {recursive: true});

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: {width: 900, height: 1400},
  deviceScaleFactor: 2,
});
const logs = [];
page.on('console', m => {
  if (m.type() === 'error' || m.type() === 'warning') {
    logs.push(`[${m.type()}] ${m.text()}`);
  }
});
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));

await page.goto(
  `http://localhost:${PORT}/packages/cli/assets/templates/pages/${SLUG}`,
  {waitUntil: 'networkidle'},
);
await page.waitForTimeout(600);

const target = await page.evaluate(w => {
  const el = [...document.querySelectorAll('div')].find(
    d => Math.round(d.getBoundingClientRect().width) === w,
  );
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    x: r.x + scrollX,
    y: r.y + scrollY,
    width: r.width,
    height: r.height,
  };
}, WIDTH);

if (target) {
  await page.screenshot({path: `${OUT}/panel.png`, clip: target});
  console.log(`panel ${Math.round(target.width)}x${Math.round(target.height)}`);
} else {
  console.log('!! panel element not found at width', WIDTH);
}
await page.screenshot({path: `${OUT}/full.png`, fullPage: true});

const noise = /runtime style injection|pre-built theme|astryx theme build|^\s*$|^import |^For custom themes/;
const real = logs.filter(l => !noise.test(l));
console.log(real.length ? `\n--- console ---\n${real.join('\n')}` : '\nconsole clean');
console.log('done →', OUT);
await browser.close();
