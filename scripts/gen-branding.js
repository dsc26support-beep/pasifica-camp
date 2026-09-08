// One-off: generate app icon / splash / header PNGs from the approved
// Logo Option 1 (P-monogram). Background is keyed to transparent and the mark
// is composited onto brand charcoal (#0D0D0D) so there are no seams.
// Run: node scripts/gen-branding.js
const Jimp = require('jimp-compact');
const path = require('path');

const UP = '/root/.claude/uploads/f460e5c0-0bee-5004-bab8-111844af1293';
const OUT = path.join(process.cwd(), 'assets', 'branding');
const CHARCOAL = 0x0D0D0DFF;

// Detected bounds (fractions of the 1254px square):
const MARK_TOP = 0.165;   // just above first gold row (0.182)
const MARK_BOT = 0.575;   // gap between mark and wordmark (0.565–0.609)

// Turn near-black background pixels transparent (keeps gold; interior negative
// space of the P becomes transparent, which reads as charcoal on our canvas).
function keyOutBlack(img) {
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx], g = this.bitmap.data[idx + 1], b = this.bitmap.data[idx + 2];
    if (r < 24 && g < 24 && b < 24) this.bitmap.data[idx + 3] = 0;
  });
  return img;
}

(async () => {
  const src = await Jimp.read(path.join(UP, 'f258603c-image.png')); // Option 1, 1254²
  const board = src.bitmap.width;

  const markRaw = src.clone().crop(0, Math.round(board * MARK_TOP), board, Math.round(board * (MARK_BOT - MARK_TOP)));
  const mark = keyOutBlack(markRaw.clone()).autocrop({ tolerance: 0.002, cropOnlyFrames: false });

  // Full logo with transparent background (for headers on any surface)
  const fullTransparent = keyOutBlack(src.clone());

  // App icon: mark on charcoal, ~74% of frame
  const icon = new Jimp(1024, 1024, CHARCOAL);
  const s1 = mark.clone().scaleToFit(720, 720);
  icon.composite(s1, (1024 - s1.bitmap.width) >> 1, (1024 - s1.bitmap.height) >> 1);
  await icon.writeAsync(path.join(OUT, 'app-icon.png'));

  // Adaptive foreground: transparent bg, mark within Android safe zone (~62%)
  const adaptive = new Jimp(1024, 1024, 0x00000000);
  const s2 = mark.clone().scaleToFit(620, 620);
  adaptive.composite(s2, (1024 - s2.bitmap.width) >> 1, (1024 - s2.bitmap.height) >> 1);
  await adaptive.writeAsync(path.join(OUT, 'adaptive-icon.png'));

  // Splash: full logo centered on charcoal portrait
  const splash = new Jimp(1284, 2778, CHARCOAL);
  const ls = fullTransparent.clone().autocrop().scaleToFit(860, 860);
  splash.composite(ls, (1284 - ls.bitmap.width) >> 1, (2778 - ls.bitmap.height) >> 1);
  await splash.writeAsync(path.join(OUT, 'splash.png'));

  // In-app header/logo assets (transparent so they sit on charcoal headers)
  await fullTransparent.clone().resize(1024, 1024).writeAsync(path.join(OUT, 'pasifika-campus-logo-primary.png'));
  await mark.clone().scaleToFit(512, 512).writeAsync(path.join(OUT, 'logo-mark.png'));

  console.log('done: mark', mark.bitmap.width + 'x' + mark.bitmap.height);
})().catch((e) => { console.error(e); process.exit(1); });
