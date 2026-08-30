/**
 * Recolour the Good Looking Digital mark from its original blue/magenta into
 * the site palette (teal through green to amber), and separate it from its
 * baked background.
 *
 * Two problems, two techniques:
 *
 * 1. Hue. A rigid rotation cannot work — the source spans roughly 80 degrees
 *    (blue to magenta) while the target spans about 145 (teal to amber), so
 *    the range has to be stretched, not shifted.
 *
 * 2. Background. A global brightness threshold would punch holes in the mark,
 *    because its own shadow faces are as dark as the background. A flood fill
 *    inward from the borders only removes pixels actually connected to the
 *    outside, so enclosed dark areas survive.
 */

const sharp = require("sharp");
const path = require("path");

const SRC = process.argv[2];
const OUT_DIR = process.argv[3];

/**
 * Piecewise hue map, not linear.
 *
 * The source is not evenly spread: 59% of coloured pixels sit in the blue
 * 210-240 band and only a thin tail reaches magenta. A linear map therefore
 * dumps the bulk into green and the mark comes out looking like a highlighter.
 *
 * Instead the blue mass is compressed so it stays teal, and the sparse
 * violet-to-magenta tail is stretched out to reach amber. The result echoes the
 * site: teal dominant, amber on the highlights.
 */
const HUE_STOPS = [
  [205, 178], // cyan edge     -> light teal
  [222, 172], // deep blue     -> sits on --platform (172-175)
  [236, 152], // blue-violet   -> teal-green
  [247, 78], //  violet        -> green, kept to a narrow passage
  [258, 32], //  violet-magenta-> amber starts here. Moving this stop down the
  [300, 12], //  hot magenta      source range is what buys the extra warmth.
];

// The source averages 0.89 saturation. Nothing else on this site is that loud.
const SAT_SCALE = 0.72;

// Highlights are near-neon; pull the very brightest down without flattening.
const VALUE_KNEE = 0.8;

const BG_MAX_CHANNEL = 10;

// Matte erosion. The threshold above 0.5 pulls the edge inward past the
// black-contaminated ring; the softness is the width of the remaining ramp.
const EDGE_RADIUS = 2;
const EDGE_THRESHOLD = 0.66;
const EDGE_SOFTNESS = 0.3;

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d !== 0) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, mx === 0 ? 0 : d / mx, mx];
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function remapHue(h) {
  if (h <= HUE_STOPS[0][0]) return HUE_STOPS[0][1];
  const last = HUE_STOPS[HUE_STOPS.length - 1];
  if (h >= last[0]) return last[1];
  for (let i = 0; i < HUE_STOPS.length - 1; i++) {
    const [s0, d0] = HUE_STOPS[i];
    const [s1, d1] = HUE_STOPS[i + 1];
    if (h >= s0 && h <= s1) {
      const t = (h - s0) / (s1 - s0);
      return d0 + t * (d1 - d0);
    }
  }
  return last[1];
}

/** Ease the top of the value range so highlights stop looking neon. */
function tameValue(v) {
  return v <= VALUE_KNEE ? v : VALUE_KNEE + (v - VALUE_KNEE) * 0.6;
}

/**
 * Separable box blur over a float array. Used to turn a hard mask into a soft
 * one so the matte can be eroded and feathered in a single remap.
 */
function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const span = r * 2 + 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) {
        const xx = Math.min(w - 1, Math.max(0, x + k));
        sum += src[y * w + xx];
      }
      tmp[y * w + x] = sum / span;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) {
        const yy = Math.min(h - 1, Math.max(0, y + k));
        sum += tmp[yy * w + x];
      }
      out[y * w + x] = sum / span;
    }
  }
  return out;
}

/** Border-connected flood fill. Returns a Uint8Array mask, 1 = background. */
function backgroundMask(data, w, h, ch) {
  const mask = new Uint8Array(w * h);
  const stack = [];
  const isDark = (p) => {
    const i = p * ch;
    return Math.max(data[i], data[i + 1], data[i + 2]) < BG_MAX_CHANNEL;
  };

  for (let x = 0; x < w; x++) {
    stack.push(x, (h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    stack.push(y * w, y * w + w - 1);
  }

  while (stack.length) {
    const p = stack.pop();
    if (mask[p] || !isDark(p)) continue;
    mask[p] = 1;
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  return mask;
}

(async () => {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  const mask = backgroundMask(data, w, h, ch);
  let bgCount = 0;
  for (let i = 0; i < mask.length; i++) bgCount += mask[i];

  /*
   * Edge decontamination.
   *
   * The source was rendered on black, so its antialiased edge pixels are the
   * mark blended with black — genuinely dark. A binary cutout keeps them, and
   * on a light page that ring reads as an outline drawn around the logo.
   *
   * The two-background trick that would recover alpha exactly needs the black
   * and white renders to be pixel-aligned, and they are separate generations,
   * so instead the matte is eroded past the contaminated ring and feathered.
   * Blurring the binary mask and remapping above 0.5 does both at once: the
   * threshold pulls the edge inward, the ramp softens what is left.
   */
  const subject = new Float32Array(w * h);
  for (let p = 0; p < w * h; p++) {
    const i = p * ch;
    const enclosedBg =
      !mask[p] && Math.max(data[i], data[i + 1], data[i + 2]) < 4;
    subject[p] = mask[p] || enclosedBg ? 0 : 1;
  }
  const soft = boxBlur(subject, w, h, EDGE_RADIUS);

  const out = Buffer.from(data);
  let enclosed = 0;
  for (let p = 0; p < w * h; p++) {
    const i = p * ch;
    if (mask[p]) {
      out[i + 3] = 0; // background becomes transparent
      continue;
    }
    /*
     * Background the flood fill could not reach, because the ribbon encloses
     * it — the counter inside the D. Left alone it stays pure black, which is
     * invisible on a dark page and obviously wrong on a light one.
     *
     * Safe to cut by brightness: 8% of surviving pixels sit at max channel 0-1
     * and then the histogram collapses to near nothing until the mark own
     * shadows appear around 20. A threshold of 4 lands in that empty gap.
     */
    if (Math.max(data[i], data[i + 1], data[i + 2]) < 4) {
      out[i + 3] = 0;
      enclosed++;
      continue;
    }

    // Erode past the dark ring, then feather what remains.
    const a = Math.max(
      0,
      Math.min(1, (soft[p] - EDGE_THRESHOLD) / EDGE_SOFTNESS),
    );
    if (a <= 0) {
      out[i + 3] = 0;
      continue;
    }
    out[i + 3] = Math.round(a * 255);
    const [hue, s, v] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
    // Leave near-greys alone; recolouring them only muddies the highlights.
    if (s < 0.08) continue;
    const [r, g, b] = hsvToRgb(
      remapHue(hue),
      Math.min(1, s * SAT_SCALE),
      tameValue(v),
    );
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
  }

  const base = sharp(out, { raw: { width: w, height: h, channels: ch } });

  // Transparent master. One file now serves both themes, because there is no
  // baked background left to match.
  const master = await base
    .clone()
    .resize(1024, 1024)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await sharp(master).toFile(path.join(OUT_DIR, "mark-1024.png"));

  // Page use — WebP, transparent, a fraction of the weight.
  await sharp(master)
    .resize(800, 800)
    .webp({ quality: 90 })
    .toFile(path.join(OUT_DIR, "mark-800.webp"));

  // Favicon. Kept transparent so it sits on any browser chrome.
  await sharp(master)
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, "..", "..", "src", "app", "icon.png"));

  // Social profile picture. Platforms crop to a circle and composite on their
  // own colour, so this one gets an explicit ground rather than transparency.
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 11, g: 15, b: 15, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(master).resize(820, 820).toBuffer(),
        gravity: "center",
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, "profile-1024.png"));

  // Open Graph card, 1200x630. The mark is square, so it is centred on the
  // ground rather than stretched into a rectangle.
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 11, g: 15, b: 15, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(master).resize(520, 520).toBuffer(),
        gravity: "center",
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, "og-default.png"));

  console.log(
    "background removed:",
    ((100 * bgCount) / (w * h)).toFixed(1) +
      "% by flood fill, plus " +
      enclosed +
      " enclosed pixels",
  );
  console.log(
    "wrote mark-1024.png, mark-800.webp, profile-1024.png, og-default.png, src/app/icon.png",
  );
})();
