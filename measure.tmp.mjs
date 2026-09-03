// Temporary: sample exact colors from the Figma panel reference. Not shipped.
import {chromium} from 'playwright';
import {readFileSync} from 'node:fs';

const SRC =
  '/Users/ernesttien/.cursor/projects/Users-ernesttien-astryx/assets/image-0cb4892d-c24e-4c62-8dfd-67f6b45980cf.png';
const dataUrl = `data:image/png;base64,${readFileSync(SRC).toString('base64')}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('about:blank');

const out = await page.evaluate(async src => {
  const img = new Image();
  img.src = src;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const {data, width} = ctx.getImageData(0, 0, img.width, img.height);
  const hex = (x, y) => {
    const i = (y * width + x) * 4;
    return (
      '#' +
      [data[i], data[i + 1], data[i + 2]]
        .map(v => v.toString(16).padStart(2, '0'))
        .join('')
    );
  };
  // Darkest pixel in a box — approximates the true text colour.
  const darkest = (x0, y0, x1, y1) => {
    let best = 1e9;
    let at = null;
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const i = (y * width + x) * 4;
        const l = data[i] + data[i + 1] + data[i + 2];
        if (l < best) {
          best = l;
          at = hex(x, y);
        }
      }
    return at;
  };
  return {
    avatarFill: hex(20, 22),
    avatarFill2: hex(40, 40),
    shareFill: hex(250, 22),
    shareText: hex(252, 30),
    fieldFill: hex(120, 240),
    tabSelFill: hex(15, 70),
    divider: hex(150, 104),
    textPrimary: darkest(22, 128, 72, 146),
    textPrototype: darkest(96, 70, 161, 90),
    textStroke: darkest(22, 828, 64, 848),
    prefixX: darkest(30, 274, 42, 292),
    percentSign: darkest(206, 682, 216, 700),
    valueNum: darkest(53, 275, 78, 290),
    fillHex: darkest(53, 684, 102, 698),
    plusIcon: darkest(272, 826, 298, 852),
    eyeIcon: darkest(232, 682, 258, 702),
  };
}, dataUrl);

console.log(out);
await browser.close();
