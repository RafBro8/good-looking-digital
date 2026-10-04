import { test, expect } from "@playwright/test";

import { signing } from "@/lib/site";

/**
 * The signing page.
 *
 * Its first job is to be the link in an email to a client who has just been
 * sent an agreement, so the things worth asserting are the ones that would
 * quietly strand that person: the page existing, the outbound link going to
 * the right tool, and the install instructions being there at all.
 *
 * The content is read from `signing` rather than copied here. A spec that
 * repeats the copy only proves the copy was pasted twice.
 */

test.describe("signing page", () => {
  test("exists, and leads with the objections rather than the feature", async ({
    page,
  }) => {
    const response = await page.goto("/sign");
    expect(response?.status(), "page should not 404").toBe(200);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(signing.title);
    await expect(page).toHaveTitle(new RegExp(signing.metaTitle));
  });

  test("the tool link opens sealmark and cannot reach back", async ({
    page,
  }) => {
    await page.goto("/sign");

    const link = page.getByRole("link", { name: "Open the signing tool" });
    await expect(link).toHaveAttribute("href", signing.toolUrl);
    await expect(link).toHaveAttribute("target", "_blank");
    // Without rel=noopener the opened tab can navigate this one.
    await expect(link).toHaveAttribute("rel", /noopener/);
  });

  test("tells you how to install it on every platform", async ({ page }) => {
    await page.goto("/sign");

    // The whole reason the page exists: the claim was already on sealmark.app,
    // the method was not. All four have to be present, not just the desktop one.
    for (const option of signing.install) {
      await expect(page.getByText(option.where, { exact: true })).toBeVisible();
    }
  });

  test("is reachable from the footer of another page", async ({ page }) => {
    await page.goto("/pricing");

    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Sign a document" })
      .click();
    await expect(page).toHaveURL(/\/sign$/);
    await expect(page.locator("h1")).toHaveText(signing.title);
  });

  test("is indexable and points at its own canonical", async ({ page }) => {
    await page.goto("/sign");

    // Unlike /start and /handled, this one is meant to be found.
    await expect(
      page.locator('meta[name="robots"][content*="noindex"]'),
    ).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/sign$/,
    );
  });

  test("is in the sitemap, because a page nobody finds is not a link", async ({
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/sign");
  });
});
