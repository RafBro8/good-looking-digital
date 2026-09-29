#!/usr/bin/env node
/**
 * Makes a QR code a sign shop can actually print, and the guide that goes with it.
 *
 *   node scripts/make-qr.js https://clientsite.com/s/wolf-rd
 *   node scripts/make-qr.js https://clientsite.com/s/wolf-rd --distance 15
 *   node scripts/make-qr.js https://clientsite.com/s/wolf-rd --name wolf-road-sign
 *
 * The code itself is the easy part and is not what anybody is paying for - the
 * pattern is deterministic, and any compliant generator produces the same one.
 * What free QR websites get wrong is everything around it: a fixed-size PNG
 * that goes soft when a sign shop enlarges it, a quiet zone cropped away by a
 * designer, a redirect through a third party that can expire or start
 * charging, and no idea how big the thing needs to be printed.
 *
 * So this emits two files:
 *
 *   <name>.svg                 vector, so it scales to a van door
 *   <name>-print-guide.html    the numbers and rules, plus a test sheet
 *
 * The test sheet matters more than it looks. The arithmetic below is a good
 * guide and nothing more: real scanning depends on the camera, the light and
 * whether somebody is holding a coffee. Print the sheet, walk backwards, and
 * write down what actually worked.
 */

const fs = require("node:fs");
const path = require("node:path");
const QRCode = require("qrcode");
const jsQR = require("jsqr");

/**
 * M, deliberately.
 *
 * L is fragile once a sign has been rained on for a season. H sounds safer but
 * adds modules, and more modules at the same printed size means smaller ones,
 * which is the thing that actually stops a code scanning. H only earns its
 * place when a logo is punched through the middle, which is a bad idea
 * outdoors anyway.
 */
const ERROR_CORRECTION = "M";

/** Four modules of clear space on every side. Not negotiable, and the most commonly broken rule. */
const QUIET_ZONE_MODULES = 4;

/**
 * Default scanning distance in feet: somebody on the pavement, across a small
 * front lawn. Deliberately not two feet, because the number this produces is
 * the lesson - a code readable from ten feet has to be about a foot across,
 * which is most of a yard sign. Somebody standing at the sign is a different
 * job and a much smaller code.
 */
const DEFAULT_DISTANCE_FT = 10;

/**
 * The widely used guide is that a code scans from about ten times its width.
 * That holds for a code of roughly twenty-five modules, which is what a short
 * URL produces - so longer URLs need to be scaled up from that baseline, and
 * this is where "keep the link short" stops being advice and becomes inches.
 */
const BASELINE_MODULES = 25;
const DISTANCE_TO_WIDTH_RATIO = 10;

function parseArgs(argv) {
  const args = argv.slice(2);
  const url = args.find((a) => !a.startsWith("--"));

  if (!url) {
    console.error(
      "Usage: node scripts/make-qr.js <url> [--distance 10] [--name slug] [--out dir]",
    );
    process.exit(1);
  }

  const flag = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i === -1 ? fallback : args[i + 1];
  };

  const distance = Number(flag("distance", DEFAULT_DISTANCE_FT));
  if (!Number.isFinite(distance) || distance <= 0) {
    console.error("--distance must be a positive number of feet");
    process.exit(1);
  }

  return {
    url,
    distance,
    name: flag("name", slugify(url)),
    out: flag("out", path.join(process.cwd(), "qr-output")),
  };
}

function slugify(url) {
  try {
    const { hostname, pathname } = new URL(url);
    const tail = pathname.replace(/\/+$/, "").split("/").filter(Boolean).pop();
    return (tail ?? hostname)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  } catch {
    console.error(`"${url}" is not a valid URL. Include the https://`);
    process.exit(1);
  }
}

/**
 * Reads back what was just encoded, using a different library, and refuses to
 * write anything that does not come back identical.
 *
 * A generator that emits a code it has never checked is exactly the sloppiness
 * the service page complains about in everybody else. The module matrix is
 * painted into a pixel buffer rather than rasterising the SVG, because that
 * needs no rendering stack and tests the part that actually matters.
 */
function verifyDecodes(url) {
  const { modules } = QRCode.create(url, {
    errorCorrectionLevel: ERROR_CORRECTION,
  });
  const n = modules.size;
  const scale = 4;
  const side = (n + QUIET_ZONE_MODULES * 2) * scale;
  const pixels = new Uint8ClampedArray(side * side * 4).fill(255);

  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      if (!modules.get(x, y)) continue;
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const row = (y + QUIET_ZONE_MODULES) * scale + dy;
          const col = (x + QUIET_ZONE_MODULES) * scale + dx;
          const i = (row * side + col) * 4;
          pixels[i] = 0;
          pixels[i + 1] = 0;
          pixels[i + 2] = 0;
        }
      }
    }
  }

  const read = jsQR(pixels, side, side);
  if (!read || read.data !== url) {
    throw new Error(
      "the generated code does not read back as the URL it was made from.\n" +
        `  wanted: ${url}\n` +
        `  got:    ${read ? read.data : "nothing decodable"}`,
    );
  }
}

/** Module count of the generated symbol, quiet zone excluded. */
function moduleCount(url) {
  const { modules } = QRCode.create(url, {
    errorCorrectionLevel: ERROR_CORRECTION,
  });
  return modules.size;
}

function minimumWidthInches(modules, distanceFt) {
  const inches = distanceFt * 12;
  const baseline = inches / DISTANCE_TO_WIDTH_RATIO;
  // Scaled so a denser code gets physically bigger rather than quietly failing.
  return (baseline * modules) / BASELINE_MODULES;
}

function round(n, places = 1) {
  return Number(n.toFixed(places));
}

function printGuide({ url, name, distance, modules, minWidth, svg }) {
  // Sizes that fit on a sheet of paper, not sizes derived from the target
  // distance - at ten feet the minimum is over a foot across and the one
  // artifact meant to be printed could not be. Each printable size is
  // labelled with the distance it should manage, which is the claim the
  // person holding the phone is about to test.
  const sizes = [1, 1.5, 2, 3];

  const reachOf = (inches) => {
    const feet =
      (inches * DISTANCE_TO_WIDTH_RATIO * BASELINE_MODULES) / modules / 12;
    return feet < 3 ? `~${Math.round(feet * 12)} in` : `~${round(feet, 1)} ft`;
  };

  const sample = (inches) => `
      <figure class="sample">
        <div class="code" style="width:${inches}in;height:${inches}in">${svg}</div>
        <figcaption>
          <strong>${inches}in</strong> wide<br />
          <span>should reach ${reachOf(inches)}</span><br />
          <span class="blank">actually _______</span>
        </figcaption>
      </figure>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${name} - QR print guide</title>
<style>
  @page { margin: 0.6in; }
  body { font: 15px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; color: #14191a; max-width: 7.2in; margin: 0 auto; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .08em; margin: 28px 0 8px; color: #45514f; }
  .meta { color: #45514f; font-size: 13px; margin: 0 0 8px; word-break: break-all; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  td { border-bottom: 1px solid #ddd; padding: 7px 0; vertical-align: top; }
  td:first-child { color: #45514f; width: 42%; }
  strong.big { font-size: 19px; }
  ul { margin: 6px 0; padding-left: 18px; }
  li { margin: 5px 0; }
  .samples { display: flex; flex-wrap: wrap; gap: 26px; align-items: flex-end; margin-top: 10px; }
  .sample { margin: 0; text-align: center; }
  .code svg { width: 100%; height: 100%; display: block; }
  figcaption { font-size: 12px; margin-top: 6px; color: #45514f; }
  .blank { color: #14191a; }
  .note { background: #f7f2e8; padding: 10px 12px; font-size: 13.5px; }
  @media print { .samples { page-break-inside: avoid; } }
</style>
</head>
<body>
  <h1>${name}</h1>
  <p class="meta">Points at <strong>${url}</strong></p>

  <h2>What the printer needs to know</h2>
  <table>
    <tr><td>Minimum printed width</td><td><strong class="big">${round(minWidth, 2)} inches</strong> to be read from ${distance} ft</td></tr>
    <tr><td>Clear space around it</td><td>At least ${QUIET_ZONE_MODULES} modules on every side. It is already built into the file - do not crop it</td></tr>
    <tr><td>Colour</td><td>Dark on light, high contrast. Not reversed out - a meaningful share of scanners fail on inverted codes</td></tr>
    <tr><td>File</td><td>${name}.svg, vector. Scale it freely; do not use a screenshot or a PNG</td></tr>
    <tr><td>Do not</td><td>Place a logo over the centre, tint it, stretch it, or round the corners</td></tr>
  </table>

  <h2>Why the size is what it is</h2>
  <p>This code is <strong>${modules} x ${modules} modules</strong>, which follows from the length of the link.
  A code scans from roughly ten times its own width, and a denser code needs to be proportionally larger
  to keep each module big enough for a camera to resolve. A shorter link would have made this smaller.</p>
  <p class="note"><strong>A code on a yard sign works for somebody walking up to it, and will never work
  for somebody driving past.</strong> If the sign is meant for traffic, print a phone number instead.</p>

  <h2>Test sheet</h2>
  <p>Print this page at 100% - no scaling, no fit-to-page. Walk backwards from each code with a
  phone and write down where it stops working. If the real number is well under the predicted one,
  the sign needs a bigger code or a shorter link. That measurement beats every figure above it.</p>
  <div class="samples">${sizes.map(sample).join("")}</div>
</body>
</html>
`;
}

async function main() {
  const { url, name, distance, out } = parseArgs(process.argv);

  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: ERROR_CORRECTION,
    margin: QUIET_ZONE_MODULES,
    color: { dark: "#000000", light: "#ffffff" },
  });

  // Nothing is written until the code reads back as the URL it came from.
  verifyDecodes(url);

  const modules = moduleCount(url);
  const minWidth = minimumWidthInches(modules, distance);

  const dir = path.join(out, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${name}.svg`), svg);
  fs.writeFileSync(
    path.join(dir, `${name}-print-guide.html`),
    printGuide({ url, name, distance, modules, minWidth, svg }),
  );

  console.log(`${name}`);
  console.log(`  points at        ${url}`);
  console.log(
    `  symbol           ${modules} x ${modules} modules, error correction ${ERROR_CORRECTION}`,
  );
  console.log(
    `  minimum width    ${round(minWidth, 2)}in to read from ${distance}ft`,
  );
  if (url.length > 40) {
    console.log(
      `  NOTE             the link is ${url.length} characters, which is what made the code this dense.`,
    );
    console.log(
      `                   A shorter path would scan from further at the same printed size.`,
    );
  }
  console.log(`  written to       ${path.relative(process.cwd(), dir)}`);
  console.log(
    `\n  Open the print guide, print at 100%, and check the real distances before ordering.`,
  );
}

main();
