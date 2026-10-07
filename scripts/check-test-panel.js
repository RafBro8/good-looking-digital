/**
 * Keeps the test panel on the home page honest.
 *
 * The panel lists every Playwright spec by name and shows the count beneath
 * it. That is a credibility claim about our own work, so it has to match the
 * suite rather than approximate it. It drifted once already: the suite grew to
 * 69 while the page still said 63, and nothing noticed until somebody read the
 * screen.
 *
 * This compares the names in site.ts against the real suite and fails if they
 * disagree. It reads the suite with `playwright test --list`, which does not
 * boot the app or touch a database, so it belongs in the lint job rather than
 * the end-to-end one.
 *
 *   node scripts/check-test-panel.js
 *
 * Durations are not checked. They are measured worst-case figures from a real
 * run and cannot be derived here; when the list changes, re-measure them.
 */

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const SITE = path.join(__dirname, "..", "src", "lib", "site.ts");

function listedInPanel() {
  const src = fs.readFileSync(SITE, "utf8");
  const block = src.split("export const testRun = {")[1];
  if (!block) throw new Error("testRun block not found in site.ts");
  const specs = block.split("\n};")[0];
  return [...specs.matchAll(/name: "([^"]*)"/g)].map((m) => m[1]);
}

function titlesInSuite() {
  const raw = execFileSync(
    "npx",
    ["playwright", "test", "--list", "--reporter=json"],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024, shell: true },
  );
  const report = JSON.parse(raw.slice(raw.indexOf("{")));

  const titles = new Set();
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) titles.add(spec.title);
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of report.suites ?? []) walk(suite);
  return titles;
}

const listed = listedInPanel();
const actual = titlesInSuite();

const missing = [...actual].filter((t) => !listed.includes(t));
const extra = listed.filter((t) => !actual.has(t));

if (missing.length === 0 && extra.length === 0) {
  console.log(`test panel matches the suite: ${listed.length} specs`);
  process.exit(0);
}

console.error("The test panel on the home page no longer matches the suite.\n");
if (missing.length) {
  console.error(`Missing from site.ts (${missing.length}):`);
  for (const t of missing) console.error(`  + ${t}`);
}
if (extra.length) {
  console.error(`\nListed but no longer in the suite (${extra.length}):`);
  for (const t of extra) console.error(`  - ${t}`);
}
console.error(
  "\nUpdate testRun.specs in src/lib/site.ts, with durations from a real run.",
);
process.exit(1);
