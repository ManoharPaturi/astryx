// Temporary: measure the rendered panel's geometry against reference numbers.
import {chromium} from 'playwright';

const url =
  'http://localhost:5199/packages/cli/assets/templates/pages/figma-design-panel';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, {waitUntil: 'networkidle'});
await page.waitForTimeout(800);

const out = await page.evaluate(() => {
  const panel = [...document.querySelectorAll('div')].find(
    d => Math.round(d.getBoundingClientRect().width) === 311,
  );
  const P = panel.getBoundingClientRect();
  const rel = el => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x - P.x),
      y: Math.round(r.y - P.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  };
  const dividers = [...panel.querySelectorAll('.astryx-divider, hr')].map(
    d => rel(d).y,
  );
  const groups = [...panel.querySelectorAll('.astryx-input-group')].map(rel);
  const btns = [...panel.querySelectorAll('button')].map(b => ({
    ...rel(b),
    label: (b.getAttribute('aria-label') || b.textContent || '').slice(0, 22),
  }));
  const inputs = [...panel.querySelectorAll('input')].map(i => ({
    ...rel(i),
    v: i.value,
  }));
  const avatar = panel.querySelector('.astryx-avatar');
  const cb = panel.querySelector('input[type=checkbox]');
  return {
    panel: {w: Math.round(P.width), h: Math.round(P.height)},
    dividers,
    groups,
    inputs,
    avatar: avatar && rel(avatar),
    checkbox: cb && rel(cb.closest('.astryx-checkbox-indicator') || cb),
    buttons: btns.slice(0, 12),
  };
});

console.log(JSON.stringify(out, null, 1));
await browser.close();
