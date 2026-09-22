import { test, expect, type Page } from "@playwright/test";

/**
 * Footer service links.
 *
 * These pointed at /grow and /platform with no fragment, four labels each. The
 * first click navigated and every click after it did nothing, because the
 * router was already on that URL - reported from the live site, not caught
 * here, which is why these specs exist now.
 */

const HEADER_CLEARANCE_SLACK = 2;

async function footerLink(page: Page, label: string) {
  return page.locator("footer a").filter({ hasText: new RegExp(`^${label}$`) });
}

async function headerHeight(page: Page): Promise<number> {
  return page
    .locator("header")
    .first()
    .evaluate((el) => el.getBoundingClientRect().height);
}

test.describe("footer service links", () => {
  test("every footer service link points at a row that exists", async ({
    page,
  }) => {
    for (const path of ["/grow", "/platform"]) {
      await page.goto(path);

      const hrefs = await page
        .locator("footer a")
        .evaluateAll((links) =>
          links
            .map((a) => a.getAttribute("href") ?? "")
            .filter((h) => h.includes("#")),
        );

      expect(hrefs.length).toBeGreaterThan(0);

      for (const href of hrefs) {
        const [target, id] = href.split("#");
        // Only rows on the page we are looking at; the other column points
        // at the other path and is checked on that pass.
        if (target !== path) continue;
        await expect(
          page.locator(`#${id}`),
          `${path} footer links to #${id}`,
        ).toHaveCount(1);
      }
    }
  });

  /**
   * The reported bug, as a test. Three clicks in a row from the footer, each
   * landing somewhere different - the second and third are the ones that used
   * to do nothing at all.
   */
  test("clicking one service after another moves each time", async ({
    page,
  }) => {
    await page.goto("/grow");

    const positions: number[] = [];
    for (const label of ["Websites", "Branding", "QR marketing", "Branding"]) {
      await (await footerLink(page, label)).click();
      await page.waitForFunction(
        (expected) => window.location.hash === expected,
        `#${{ Websites: "website-design-and-build", Branding: "logo-and-brand-identity", "QR marketing": "qr-signage-artwork" }[label]}`,
      );
      positions.push(await page.evaluate(() => Math.round(window.scrollY)));
    }

    // First three are distinct rows, so three distinct offsets.
    expect(new Set(positions.slice(0, 3)).size).toBe(3);

    // Returning to a row already visited lands back on it. Compared with a
    // tolerance rather than exactly: the reveal animations settle content
    // above the row between visits, which moves the page by a few pixels.
    // The claim worth testing is "it went back to that row", not that two
    // scroll offsets match to the pixel.
    expect(Math.abs(positions[3] - positions[1])).toBeLessThan(40);
  });

  test("a linked row is not hidden under the sticky header", async ({
    page,
  }) => {
    await page.goto("/platform#playwright-test-automation");

    const header = await headerHeight(page);
    const top = await page
      .locator("#playwright-test-automation")
      .evaluate((el) => el.getBoundingClientRect().top);

    expect(top).toBeGreaterThanOrEqual(header - HEADER_CLEARANCE_SLACK);
  });

  /**
   * The highlight has to name the row you asked for, not the one before it.
   *
   * CSS :target alone did exactly that: the footer links are client-side
   * navigations, which update location.hash without firing hashchange, and
   * :target was measured a full navigation behind. A highlight that is right
   * on a cold load and wrong afterwards points confidently at the wrong line,
   * so this walks several rows in a row and checks each one.
   */
  test("the row you clicked is the row that gets marked", async ({ page }) => {
    await page.goto("/grow");

    const rows = [
      ["Branding", "logo-and-brand-identity"],
      ["QR marketing", "qr-signage-artwork"],
      ["Websites", "website-design-and-build"],
      // Back to one already visited, and then the same one twice: clicking
      // the row you are already on must leave it marked, not toggle it off.
      ["Branding", "logo-and-brand-identity"],
      ["Branding", "logo-and-brand-identity"],
    ] as const;

    for (const [label, id] of rows) {
      await (await footerLink(page, label)).click();
      await expect(page.locator("[data-current]")).toHaveCount(1);
      await expect(page.locator("[data-current]")).toHaveAttribute("id", id);
    }
  });

  test("arriving cold on a fragment marks the row too", async ({ page }) => {
    await page.goto("/platform#playwright-test-automation");
    await expect(page.locator("[data-current]")).toHaveAttribute(
      "id",
      "playwright-test-automation",
    );
  });

  test("a footer link from one path reaches the other path's row", async ({
    page,
  }) => {
    await page.goto("/grow");
    await (await footerLink(page, "Customer portals")).click();

    await expect(page).toHaveURL(/\/platform#customer-and-staff-portals$/);
    await expect(page.locator("#customer-and-staff-portals")).toContainText(
      "Customer and staff portals",
    );
  });
});
