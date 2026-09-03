// Temporary: dump box geometry for the fill row internals. Not shipped.
import {chromium} from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 900, height: 1200}});
await page.goto('http://localhost:5199/packages/cli/assets/templates/pages/figma-design-panel', {
  waitUntil: 'networkidle',
});

const out = await page.evaluate(() => {
  const panel = [...document.querySelectorAll('div')].find(
    d => Math.round(d.getBoundingClientRect().width) === 311,
  );
  const base = panel.getBoundingClientRect();
  const rel = el => {
    const r = el.getBoundingClientRect();
    return [
      Math.round(r.x - base.x),
      Math.round(r.y - base.y),
      Math.round(r.width),
      Math.round(r.height),
    ];
  };
  // The first fill row: find the group labelled "FFFFFF fill".
  const groups = [...panel.querySelectorAll('[role="group"], div')].filter(d =>
    (d.getAttribute('aria-label') || '').includes('fill'),
  );
  const dump = [];
  const row = panel.querySelectorAll('div');
  // Walk the DOM under the first fill row and report every box on that line.
  const firstInput = [...panel.querySelectorAll('input')].find(
    i => i.value === 'FFFFFF',
  );
  let node = firstInput;
  while (node && node !== panel) {
    dump.push({
      tag: node.tagName,
      cls: (node.className || '').toString().slice(0, 40),
      box: rel(node),
      pad: getComputedStyle(node).padding,
      bg: getComputedStyle(node).backgroundColor,
    });
    node = node.parentElement;
  }
  const pctInput = [...panel.querySelectorAll('input')].find(
    i => Math.abs(i.getBoundingClientRect().y - firstInput.getBoundingClientRect().y) < 4 && i !== firstInput,
  );
  const pctChain = [];
  let n2 = pctInput;
  while (n2 && n2 !== panel) {
    pctChain.push({
      tag: n2.tagName,
      box: rel(n2),
      pad: getComputedStyle(n2).padding,
      minW: getComputedStyle(n2).minWidth,
      flex: getComputedStyle(n2).flex,
      bg: getComputedStyle(n2).backgroundColor,
    });
    n2 = n2.parentElement;
  }
  // Siblings of the % addon
  const pctGroup = pctChain.find(c => c.box[2] === 67);
  return {nameChain: dump, pctChain, groups: groups.map(rel)};
});

console.log(JSON.stringify(out, null, 1));
await browser.close();
