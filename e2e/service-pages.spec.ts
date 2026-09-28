import { test, expect } from "@playwright/test";

import { services, servicePrice } from "@/lib/services";

/**
 * The nine service pages.
 *
 * Navigation to them is covered in footer-navigation.spec.ts; this file is
 * about the pages themselves - that each one exists, says who it is, shows the
 * price its row in paths[] says it costs, and does not quietly 404 or render
 * empty when a slug is wrong.
 *
 * The cases are generated from services[] rather than listed, so a tenth
 * service is covered the moment it is added. A hand-kept list here would go
 * stale exactly the way the sitemap's did.
 */

test.describe("service pages", () => {
  for (const service of services) {
    test(`${service.slug} renders and says what it costs`, async ({ page }) => {
      const response = await page.goto(`/services/${service.slug}`);
      expect(response?.status(), "page should not 404").toBe(200);

      // One h1, and it names the service rather than the site.
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(service.title);

      await expect(page).toHaveTitle(new RegExp(service.metaTitle));

      // The price comes from the row in paths[], never from a copy kept here.
      // If the two ever drift, servicePrice throws at build time - this proves
      // the number also survives the trip to the page.
      await expect(page.getByText(servicePrice(service)).first()).toBeVisible();
    });
  }

  test("every service page is indexable and canonical", async ({ page }) => {
    for (const service of services) {
      await page.goto(`/services/${service.slug}`);

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical, `${service.slug} canonical`).toContain(
        `/services/${service.slug}`,
      );

      // These exist to be found. A noindex here would waste the whole point
      // of writing them, and it is the sort of thing that gets copied in from
      // /start without anybody noticing.
      const robots = await page
        .locator('meta[name="robots"]')
        .count()
        .then(async (n) =>
          n
            ? await page.locator('meta[name="robots"]').getAttribute("content")
            : "",
        );
      expect(robots ?? "", `${service.slug} robots`).not.toContain("noindex");
    }
  });

  test("a slug that does not exist is a 404, not an empty page", async ({
    page,
  }) => {
    // dynamicParams is false, so an unknown slug must 404 rather than render
    // the shell with nothing in it. A stale link should look broken, because
    // it is.
    const response = await page.goto("/services/not-a-real-service");
    expect(response?.status()).toBe(404);
  });

  test("each page describes itself to a search engine, and claims nothing extra", async ({
    page,
  }) => {
    for (const service of services) {
      await page.goto(`/services/${service.slug}`);

      const raw = await page
        .locator('script[type="application/ld+json"]')
        .textContent();
      expect(raw, `${service.slug} has structured data`).toBeTruthy();

      const data = JSON.parse(raw!);
      expect(data["@type"]).toBe("Service");
      expect(data.name).toBe(service.title);
      expect(data.provider?.name).toContain("LLC");

      // No invented reviews. There are none yet, and structured data that
      // claims otherwise is both a lie and a manual action waiting to happen.
      expect(data.aggregateRating, "no invented ratings").toBeUndefined();
      expect(data.review, "no invented reviews").toBeUndefined();
    }
  });
});
