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

  // The brand may give way at 320, and must not at a normal phone width.
  // Making the wordmark shrinkable is what stops the phone number being
  // clipped; the cost of getting it wrong is an ellipsis in the company
  // name on every page, which is its own kind of broken.
  const wordmark = header.locator("a span").first();
  const clipped = await wordmark.evaluate(
    (el) => el.scrollWidth - el.clientWidth,
  );
  expect(
    clipped,
    "the company name is ellipsized at 375px",
  ).toBeLessThanOrEqual(1);

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

/**
 * 320px is the narrowest width anything real uses — the original iPhone SE,
 * some older Androids, and the width WCAG measures reflow at. It is also the
 * width a desktop page reaches when someone zooms to 400%.
 *
 * It was broken here for a while, and quietly: the header ran 29px past the
 * viewport, the page does not scroll sideways, so the overflow was simply
 * clipped — and what fell off the edge was the last digits of the phone
 * number. A header that silently truncates the number is worse than one that
 * looks cramped, because nothing about it appears wrong.
 */
test.describe("the narrowest phone anybody still uses", () => {
  test.use({ viewport: { width: 320, height: 568 }, isMobile: true });

  test("nothing is clipped at 320px, least of all the phone number", async ({
    page,
  }) => {
    for (const path of ["/", "/grow", "/platform", "/contact"]) {
      await page.goto(path);

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `${path} overflows at 320px`).toBeLessThanOrEqual(0);
    }

    await page.goto("/");

    // The number has to be whole. Clipped, it is worse than absent: it looks
    // like a phone number and dials nothing.
    const phone = page
      .locator("header")
      .getByRole("link", { name: /630-400-8748/ });
    await expect(phone).toBeVisible();

    const clipped = await phone.evaluate(
      (el) =>
        el.getBoundingClientRect().right - document.documentElement.clientWidth,
    );
    expect(clipped, "the phone number is cut off at 320px").toBeLessThanOrEqual(
      0,
    );

    // The header stays two rows. An earlier attempt at this fixed 320 by
    // wrapping the row and made the header 168px tall on a 360px phone,
    // which ate a quarter of the screen before any content appeared.
    const headerHeight = await page
      .locator("header")
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(headerHeight, "the header grew a row").toBeLessThan(150);
  });
});
