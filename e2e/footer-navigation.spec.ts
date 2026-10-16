import { test, expect, type Page } from "@playwright/test";

import { socialLinks } from "@/lib/site";

/**
 * Footer service links.
 *
 * These pointed at /grow and /platform with no fragment, four labels each. The
 * first click navigated and every click after it did nothing, because the
 * router was already on that URL - reported from the live site, not caught
 * here, which is why these specs exist now.
 *
 * Fragments fixed the no-op and left a second problem: every link arrived at a
 * row in a price table, so they all felt like the same destination. They now
 * point at service pages instead. Two services keep the old behaviour on
 * purpose - Platform assessment and Ongoing engineering have no page of their
 * own - so the footer carries both kinds of link and both are checked here.
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

/** Every service href in the footer, on whichever page we are standing. */
async function footerServiceHrefs(page: Page): Promise<string[]> {
  return page
    .locator("footer a")
    .evaluateAll((links) =>
      links
        .map((a) => a.getAttribute("href") ?? "")
        .filter((h) => h.startsWith("/services/") || h.includes("#")),
    );
}

test.describe("footer service links", () => {
  test("every footer service link resolves to something real", async ({
    page,
  }) => {
    await page.goto("/grow");

    const hrefs = await footerServiceHrefs(page);
    expect(hrefs.length).toBeGreaterThan(0);

    // A page link must not 404; a fragment link must point at a row that is
    // actually on the page it names. Both kinds live in this footer.
    for (const href of hrefs) {
      if (href.startsWith("/services/")) {
        const response = await page.request.get(href);
        expect(response.status(), `${href} should not 404`).toBe(200);
        continue;
      }

      const [target, id] = href.split("#");
      await page.goto(target);
      await expect(page.locator(`#${id}`), `${target} has #${id}`).toHaveCount(
        1,
      );
    }
  });

  /**
   * The reported bug, as a test. Three different services in a row, each
   * landing somewhere different - the second and third are the ones that used
   * to do nothing at all.
   */
  test("clicking one service after another moves each time", async ({
    page,
  }) => {
    await page.goto("/grow");

    // Each destination is named rather than matched loosely. Waiting for
    // /services/ alone resolves instantly from the second click onwards,
    // because the URL already matches it - so the assertion read the previous
    // page. CI caught this on all three engines; it never failed locally
    // because the navigation happened to win the race.
    const targets = [
      ["Websites", "/services/website-design"],
      ["Branding", "/services/logo-design"],
      ["Lead capture", "/services/lead-capture"],
    ] as const;

    const seen: string[] = [];
    for (const [label, destination] of targets) {
      await (await footerLink(page, label)).click();
      await page.waitForURL(`**${destination}`);
      seen.push(new URL(page.url()).pathname);
    }

    expect(new Set(seen).size, `landed on ${seen.join(", ")}`).toBe(3);
  });

  test("a footer link from one path reaches the other path's service", async ({
    page,
  }) => {
    await page.goto("/grow");
    await (await footerLink(page, "Applications")).click();

    await expect(page).toHaveURL(/\/services\/custom-software$/);
    await expect(page.locator("h1")).toContainText(
      "Custom software development",
    );
  });

  /**
   * A service with no page of its own still has to work. Assessments is the
   * one that proves the fallback, because it points at a row rather than a
   * page and would be the first thing to break if the fallback were dropped.
   */
  test("a service with no page of its own still reaches its row", async ({
    page,
  }) => {
    await page.goto("/platform");
    await (await footerLink(page, "Assessments")).click();

    await expect(page).toHaveURL(/\/platform#platform-assessment$/);
    await expect(page.locator("[data-current]")).toHaveAttribute(
      "id",
      "platform-assessment",
    );
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

  test("arriving cold on a fragment marks the row too", async ({ page }) => {
    await page.goto("/platform#playwright-test-automation");
    await expect(page.locator("[data-current]")).toHaveAttribute(
      "id",
      "playwright-test-automation",
    );
  });
});

test.describe("service pages and the rows they came from", () => {
  /**
   * The link back out of a service page has to land on a row that exists and
   * mark it. This is the path that used to be driven from the footer, and the
   * highlight is still the thing that tells you which of eight near-identical
   * rows you asked for.
   */
  test("the row you clicked is the row that gets marked", async ({ page }) => {
    await page.goto("/services/logo-design");
    await page
      .locator("a")
      .filter({ hasText: "beside everything else" })
      .click();

    await expect(page).toHaveURL(/\/grow#logo-and-brand-identity$/);
    await expect(page.locator("[data-current]")).toHaveCount(1);
    await expect(page.locator("[data-current]")).toHaveAttribute(
      "id",
      "logo-and-brand-identity",
    );
  });

  test("a service row links to the page that describes it", async ({
    page,
  }) => {
    await page.goto("/grow");
    await page
      .locator("#lead-capture-and-follow-up a")
      .filter({ hasText: "Lead capture & follow-up" })
      .click();

    await expect(page).toHaveURL(/\/services\/lead-capture$/);
    await expect(page.locator("h1")).toContainText("Lead capture");
  });

  /**
   * A row with no service page must not pretend to have one. Platform
   * assessment and Ongoing engineering are plain text by decision, and a
   * regression here would be a link to nowhere.
   */
  test("a row with no page of its own is not a link", async ({ page }) => {
    await page.goto("/platform");

    await expect(
      page.locator("#platform-assessment a"),
      "Platform assessment has no service page",
    ).toHaveCount(0);
    await expect(
      page.locator("#ongoing-engineering a"),
      "Ongoing engineering has no service page",
    ).toHaveCount(0);
  });
});

/**
 * The four profile links.
 *
 * Guarded because each failure here is invisible on the page. A wrong url
 * still renders a perfect icon, and the Google one in particular has a near
 * identical sibling, the g.page review link, that would turn the footer into
 * a request for reviews from strangers who have never hired us.
 */
test.describe("social profile links", () => {
  test("every social link leaves the site safely and says where it goes", async ({
    page,
  }) => {
    await page.goto("/");

    const links = page.locator("footer a[target='_blank']");
    await expect(links).toHaveCount(socialLinks.length);

    for (const social of socialLinks) {
      const link = page.locator(`footer a[href="${social.href}"]`);

      await expect(link, `${social.label} is linked`).toHaveCount(1);

      // Without rel, the opened tab can reach back through window.opener.
      await expect(link, `${social.label} is safe`).toHaveAttribute(
        "rel",
        /noopener/,
      );

      // An unlabelled glyph announces as "link" and nothing else.
      await expect(link, `${social.label} is named`).toHaveAttribute(
        "aria-label",
        /Opens in a new tab\.$/,
      );

      // 44px is the accessibility floor, and these are four small targets
      // sitting next to each other at the bottom of a phone screen.
      const box = await link.boundingBox();
      expect(
        box?.width ?? 0,
        `${social.label} is tappable`,
      ).toBeGreaterThanOrEqual(44);
      expect(
        box?.height ?? 0,
        `${social.label} is tappable`,
      ).toBeGreaterThanOrEqual(44);
    }
  });

  /**
   * The review url belongs in a completion email and on a leave-behind card,
   * given to someone who actually hired us. On the website it would be an
   * open invitation to non-customers, which Google filters and which costs
   * more than it gains while there are no reviews to show.
   */
  test("the Google link opens the profile, not the review form", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("footer a[href*='/review']")).toHaveCount(0);
    await expect(page.locator("footer a[href*='g.page']")).toHaveCount(0);
  });
});
