#!/usr/bin/env node
/**
 * Refreshes the test-run panel on the homepage from a real CI run.
 *
 * The panel's whole argument is that the figures are real, which means they
 * have to come from somewhere real. Doing that by hand went stale five times
 * in three weeks - the suite grew from 16 specs to 63 while the panel went on
 * claiming 31 - so it is a script now.
 *
 *   node scripts/refresh-test-panel.js            latest successful CI run
 *   node scripts/refresh-test-panel.js 36603590015   a specific run
 *   node scripts/refresh-test-panel.js --check    report drift, change nothing
 *
 * Needs the gh CLI, authenticated. Artifacts are kept 14 days, so a run older
 * than that will have nothing to download.
 *
 * Per spec it takes the SLOWEST of the three engines, and for the total the
 * slowest engine's whole run. Worst case rather than best: quoting the
 * fastest number would be the same flattery as inventing one.
 */

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PROJECTS = ["chromium", "firefox", "webkit"];
const SITE = path.join(__dirname, "..", "src", "lib", "site.ts");

function gh(args) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function latestSuccessfulRun() {
  const rows = JSON.parse(
    gh([
      "run",
      "list",
      "--workflow",
      "ci.yml",
      "--status",
      "success",
      "--limit",
      "1",
      "--json",
      "databaseId,headSha,displayTitle",
    ]),
  );
  if (!rows.length) throw new Error("no successful CI run found");
  return rows[0];
}

/** Every spec in a results.json, flattened out of the nested suites. */
function specsOf(report) {
  const out = [];
  const walk = (suite) => {
    (suite.specs ?? []).forEach((spec) => out.push(spec));
    (suite.suites ?? []).forEach(walk);
  };
  (report.suites ?? []).forEach(walk);
  return out;
}

function formatMs(ms) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

function collect(runId) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gld-panel-"));
  try {
    gh(["run", "download", String(runId), "-D", dir]);

    /** Slowest duration per spec title, and the slowest engine's total. */
    const slowest = new Map();
    const order = [];
    let totalMs = 0;
    let engines = 0;

    for (const project of PROJECTS) {
      const file = path.join(
        dir,
        `playwright-report-${project}`,
        "results.json",
      );
      if (!fs.existsSync(file)) {
        throw new Error(
          `no results.json for ${project} - was the run complete?`,
        );
      }
      engines += 1;
      const report = JSON.parse(fs.readFileSync(file, "utf8"));

      if (report.stats.unexpected > 0) {
        throw new Error(
          `${project} had ${report.stats.unexpected} failing tests. ` +
            `The panel only ever shows a run that passed.`,
        );
      }
      totalMs = Math.max(totalMs, report.stats.duration);

      for (const spec of specsOf(report)) {
        // Longest attempt, so a retry does not quietly report the fast one.
        const ms = Math.max(
          ...spec.tests.flatMap((t) => t.results.map((r) => r.duration)),
        );
        if (!slowest.has(spec.title)) order.push(spec.title);
        slowest.set(spec.title, Math.max(slowest.get(spec.title) ?? 0, ms));
      }
    }

    if (engines !== PROJECTS.length) throw new Error("expected three engines");

    return {
      specs: order.map((name) => ({ name, ms: formatMs(slowest.get(name)) })),
      duration: formatMs(totalMs),
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function currentPanel() {
  const src = fs.readFileSync(SITE, "utf8");
  const block = src.match(/export const testRun = \{[\s\S]*?\n\} as const;/);
  if (!block) throw new Error("could not find testRun in site.ts");
  return {
    src,
    block: block[0],
    count: (block[0].match(/name: "/g) ?? []).length,
    duration: block[0].match(/duration: "([^"]+)"/)[1],
  };
}

function render(run, existing) {
  const header = existing.block.slice(0, existing.block.indexOf("  specs: ["));
  const specs = run.specs
    .map((s) => `    { name: ${JSON.stringify(s.name)}, ms: "${s.ms}" },`)
    .join("\n");

  return (
    header.replace(/duration: "[^"]+"/, `duration: "${run.duration}"`) +
    `  specs: [\n${specs}\n  ],\n} as const;`
  );
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const explicit = args.find((a) => /^\d+$/.test(a));

  const run = explicit
    ? { databaseId: explicit, displayTitle: "(specified)" }
    : latestSuccessfulRun();

  console.log(`Run ${run.databaseId}  ${run.displayTitle}`);

  const fresh = collect(run.databaseId);
  const existing = currentPanel();

  console.log(`  panel says  ${existing.count} specs, ${existing.duration}`);
  console.log(`  run says    ${fresh.specs.length} specs, ${fresh.duration}`);

  const same =
    existing.count === fresh.specs.length &&
    existing.duration === fresh.duration &&
    fresh.specs.every((s) => existing.block.includes(JSON.stringify(s.name)));

  if (same) {
    console.log("  up to date.");
    return;
  }

  if (check) {
    console.log("  STALE. Run without --check to update.");
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(
    SITE,
    existing.src.replace(existing.block, render(fresh, existing)),
  );
  console.log(`  updated src/lib/site.ts. Run prettier, then check the diff.`);
}

main();
