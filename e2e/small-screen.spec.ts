import { expect, test } from "@playwright/test";

/**
 * The small-screen guarantee.
 *
 * 375 x 667 is an iPhone SE — a phone from 2016 that plenty of tradespeople
 * still carry. It is also the width at which this site's header was broken
 * until recently: no navigation and no theme control below 768px, so the only
 * way off a page was to scroll to its footer. This spec exists so that cannot
 * come back unnoticed.
 */

test.use({ viewport: { width: 375, height: 667 }, isMobile: true });

test("it works on a five-year-old phone", async ({ page }) => {
  await page.goto("/");

  // The whole page, not just the header. A single overflowing element makes
  // every page on the site scroll sideways.
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow, "the page scrolls sideways").toBeLessThanOrEqual(0);

  // Navigation has to be reachable without hunting for it.
  const header = page.locator("header");
  for (const label of ["Grow", "Platform", "Pricing", "About"]) {
    await expect(
      header.getByRole("link", { name: label, exact: true }),
    ).toBeVisible();
  }

  // And the theme is the visitor's choice, not ours.
  await expect(
    header.getByRole("button", { name: /switch between light and dark/i }),
  ).toBeVisible();

  // Controls a contractor uses one-handed need a real target. 44px is the
  // accessibility floor; the phone link is the one that matters most.
  const phone = header.getByRole("link", { name: /630-400-8748/ });
  const box = await phone.boundingBox();
  expect(
    box?.height ?? 0,
    "phone link is too small to tap",
  ).toBeGreaterThanOrEqual(44);

  // The quote form must be usable, not merely present.
  await page.goto("/contact");
  const formOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(formOverflow, "the contact page scrolls sideways").toBeLessThanOrEqual(
    0,
  );

  await expect(page.locator("#name")).toBeVisible();
  const submit = page.getByRole("button", { name: /send it/i });
  await expect(submit).toBeVisible();

  const submitBox = await submit.boundingBox();
  expect(
    submitBox?.height ?? 0,
    "submit button is too small to tap",
  ).toBeGreaterThanOrEqual(44);
});
