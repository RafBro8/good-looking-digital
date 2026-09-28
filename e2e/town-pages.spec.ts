import { test, expect } from "@playwright/test";

import { towns } from "@/lib/towns";

/**
 * Town landing pages.
 *
 * These live at the root - /web-design-mokena, not /areas/mokena - so the
 * dynamic segment sits alongside /about, /grow and every other top-level
 * route. Two things have to stay true, and neither is obvious from reading
 * the code: static routes must still win, and an unknown slug must 404 rather
 * than render an empty shell.
 *
 * The third thing is editorial rather than technical. A town page exists to
 * say we are nearby and then send people to the service pages for the detail.
 * The moment one starts explaining a service itself, seven town pages become
 * seven copies of the same content, which is the doorway pattern these were
 * built to avoid. "links out rather than explaining" is asserted here because
 * it is the rule most likely to erode quietly.
 */

/** Every route that existed before the dynamic segment was added. */
const STATIC_ROUTES = [
  "/",
  "/grow",
  "/platform",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/start",
  "/design-system",
];

test.describe("town pages", () => {
  for (const town of towns) {
    test(`${town.slug} renders and points at the service pages`, async ({
      page,
    }) => {
      const response = await page.goto(`/${town.slug}`);
      expect(response?.status()).toBe(200);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toContainText(town.name);
      await expect(page).toHaveTitle(new RegExp(town.metaTitle));

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical).toContain(`/${town.slug}`);

      // The whole point: it links out. A town page with no service links is
      // one that has started explaining things itself.
      const serviceLinks = await page
        .locator('main a[href^="/services/"]')
        .count();
      expect(
        serviceLinks,
        "a town page links to the service pages",
      ).toBeGreaterThanOrEqual(5);
    });
  }

  test("the dynamic segment does not swallow the rest of the site", async ({
    page,
  }) => {
    // A root-level [townPage] sits next to every static route. Static wins,
    // but that is a convention rather than something the code states, so it
    // gets checked rather than assumed.
    for (const route of STATIC_ROUTES) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} still resolves`).toBe(200);
    }
  });

  test("a town we do not serve is a 404, not an empty page", async ({
    page,
  }) => {
    for (const path of ["/web-design-nowhere", "/totally-unknown-path"]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should 404`).toBe(404);
    }
  });

  test("a town page says where it works and invents no reviews", async ({
    page,
  }) => {
    for (const town of towns) {
      await page.goto(`/${town.slug}`);

      const raw = await page
        .locator('script[type="application/ld+json"]')
        .textContent();
      const data = JSON.parse(raw!);

      expect(data["@type"]).toBe("ProfessionalService");
      expect(data.name).toContain("LLC");

      const served = data.areaServed.map((a: { name: string }) => a.name);
      expect(served, `${town.name} is in its own areaServed`).toContain(
        town.name,
      );

      expect(data.aggregateRating, "no invented ratings").toBeUndefined();
      expect(data.review, "no invented reviews").toBeUndefined();
    }
  });
});
