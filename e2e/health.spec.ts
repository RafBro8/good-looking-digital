import { test, expect } from "@playwright/test";

/**
 * The endpoint an external monitor watches.
 *
 * Worth testing precisely because nothing on the site links to it, so a break
 * here is silent: the monitor would keep reporting whatever the endpoint last
 * said, and the first sign of trouble would be a client asking why nobody
 * answered their enquiry.
 */

test.describe("health check", () => {
  test("reports ok, and says so in a way a keyword check can read", async ({
    request,
  }) => {
    const res = await request.get("/api/health");

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    // UptimeRobot matches on the raw body, not on parsed JSON. If the shape
    // ever changes to something like {"status":"healthy"}, the monitor keeps
    // passing while watching for a word that is no longer there.
    expect(await res.text()).toContain('"ok":true');
  });

  test("says nothing about the infrastructure behind it", async ({
    request,
  }) => {
    const body = await (await request.get("/api/health")).text();

    // Public and unauthenticated, so the response must not describe what it
    // is talking to. A failure message naming a driver, a host or a version
    // is a free map for anyone probing the site.
    for (const leak of [
      "mongo",
      "mongodb",
      "atlas",
      "localhost",
      "127.0.0.1",
    ]) {
      expect(body.toLowerCase(), `leaks ${leak}`).not.toContain(leak);
    }
  });

  test("is not cached", async ({ request }) => {
    const res = await request.get("/api/health");
    const cacheControl = (res.headers()["cache-control"] ?? "").toLowerCase();

    // A cached response makes the monitor watch a photograph: the database
    // could be down for an hour while a stored "ok" is served from the edge.
    expect(cacheControl).toMatch(/no-store|no-cache|max-age=0/);
  });

  test("is kept out of search results", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /api/");
  });
});
