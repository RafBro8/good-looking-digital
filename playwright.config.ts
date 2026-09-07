import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for goodlookingdigital.com.
 *
 * These exist to make a claim on the site true. The homepage shows a test run
 * panel naming six specs; every one of them is in e2e/, runs here, and the
 * numbers published in src/lib/site.ts come from an actual run rather than
 * from imagination.
 *
 * Three engines because the site says three engines. Chromium alone would be
 * cheaper and would make "chromium, firefox, webkit" a lie.
 */

/**
 * Escape hatch for machines where the engine download is blocked. This one
 * sits behind a TLS-intercepting antivirus that times out Playwright's CDN
 * fetch, so PW_SYSTEM_CHROME=1 runs the chromium project against the Chrome
 * already installed. CI never sets it and always uses the pinned engines, so
 * the numbers published on the site come from the real thing.
 */
const useSystemChrome = process.env.PW_SYSTEM_CHROME === "1";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * Tests never touch Atlas.
 *
 * The production database user is scoped to readWrite on one database, which
 * is deliberate, and widening it so tests could reach a second one would trade
 * real security for convenience. So the suite points at a throwaway Mongo
 * instead: the gld-mongo-test container locally, a service container in CI.
 *
 *   docker start gld-mongo-test
 */
const TEST_MONGODB_URI =
  process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27019";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/support/global-setup.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(useSystemChrome ? { channel: "chrome" as const } : {}),
      },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],

  webServer: {
    // Production build, not dev: dev-only overlays and slower first paints
    // would make the published timings flattering and unrepresentative.
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: BASE_URL,
    // Always a fresh server. Reusing one keeps the previous run's
    // environment, so a change to the env block below would silently not
    // apply — which cost an hour of confusion once already.
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      // Overrides whatever .env.local holds, so a local run cannot write into
      // Atlas even by accident.
      MONGODB_URI: TEST_MONGODB_URI,
      MONGODB_DB: "good_looking_digital_test",
      // Blanked, not merely absent. Next loads .env.local for `next start`,
      // so a real key would be picked up and the suite would send mail on
      // every run. An empty value makes isNotificationConfigured() false, so
      // the route returns before any network call — which is the condition
      // the "never falsely reported as emailed" spec is actually asserting on.
      RESEND_API_KEY: "",
    },
  },
});
