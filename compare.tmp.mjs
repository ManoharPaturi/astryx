// Temporary: side-by-side + difference overlay vs the reference. Not shipped.
import {chromium} from 'playwright';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';

const REF =
  '/Users/ernesttien/.cursor/projects/Users-ernesttien-astryx/assets/image-0cb4892d-c24e-4c62-8dfd-67f6b45980cf.png';
const MINE = process.env.MINE || '.tmp-figma/v4/panel.png';
const OUT = process.env.OUT || '.tmp-figma/v4';
mkdirSync(OUT, {recursive: true});

const b64 = p => `data:image/png;base64,${readFileSync(p).toString('base64')}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('about:blank');

const results = await page.evaluate(
  async ({ref, mine}) => {
    const load = async src => {
      const i = new Image();
      i.src = src;
      await i.decode();
      return i;
    };
    const a = await load(ref);
    const bImg = await load(mine);
    const W = 311;
    const H = Math.max(a.height, Math.round((bImg.height / bImg.width) * W));

    const draw = (img, w, h) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const x = c.getContext('2d');
      x.fillStyle = '#fff';
      x.fillRect(0, 0, w, h);
      x.drawImage(img, 0, 0, w, Math.round((img.height / img.width) * w));
      return x.getImageData(0, 0, w, h);
    };
    const A = draw(a, W, H);
    const B = draw(bImg, W, H);

    // Side by side with a gutter.
    const sbs = document.createElement('canvas');
    sbs.width = W * 2 + 24;
    sbs.height = H;
    const sx = sbs.getContext('2d');
    sx.fillStyle = '#9aa';
    sx.fillRect(0, 0, sbs.width, sbs.height);
    sx.putImageData(A, 0, 0);
    sx.putImageData(B, W + 24, 0);

    // Difference: red where the two disagree.
    const diff = document.createElement('canvas');
    diff.width = W;
    diff.height = H;
    const dx = diff.getContext('2d');
    const out = dx.createImageData(W, H);
    let changed = 0;
    for (let i = 0; i < A.data.length; i += 4) {
      const d =
        Math.abs(A.data[i] - B.data[i]) +
        Math.abs(A.data[i + 1] - B.data[i + 1]) +
        Math.abs(A.data[i + 2] - B.data[i + 2]);
      const hit = d > 90;
      if (hit) changed++;
      out.data[i] = hit ? 230 : 250;
      out.data[i + 1] = hit ? 30 : 250;
      out.data[i + 2] = hit ? 60 : 250;
      out.data[i + 3] = 255;
    }
    dx.putImageData(out, 0, 0);

    // Per-row disagreement, to localise vertical drift.
    const rows = [];
    for (let y = 0; y < H; y++) {
      let n = 0;
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const d =
          Math.abs(A.data[i] - B.data[i]) +
          Math.abs(A.data[i + 1] - B.data[i + 1]) +
          Math.abs(A.data[i + 2] - B.data[i + 2]);
        if (d > 90) n++;
      }
      rows.push(n);
    }
    // Collapse into bands of sustained disagreement.
    const bands = [];
    let start = null;
    for (let y = 0; y <= H; y++) {
      const hot = (rows[y] ?? 0) > W * 0.08;
      if (hot && start === null) start = y;
      if (!hot && start !== null) {
        if (y - start > 4) bands.push([start, y - 1]);
        start = null;
      }
    }

    return {
      sbs: sbs.toDataURL('image/png'),
      diff: diff.toDataURL('image/png'),
      pctChanged: +((changed / (W * H)) * 100).toFixed(2),
      refH: a.height,
      mineH: Math.round((bImg.height / bImg.width) * W),
      bands,
    };
  },
  {ref: b64(REF), mine: b64(MINE)},
);

const save = (dataUrl, name) =>
  writeFileSync(
    `${OUT}/${name}`,
    Buffer.from(dataUrl.split(',')[1], 'base64'),
  );
save(results.sbs, 'side-by-side.png');
save(results.diff, 'diff.png');
console.log({
  pctChanged: results.pctChanged,
  refHeight: results.refH,
  mineHeight: results.mineH,
  mismatchBands: results.bands,
});
await browser.close();
