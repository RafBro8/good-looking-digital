import { test, expect } from "@playwright/test";

import {
  allProjects,
  caseStudyProjects,
  featuredProjects,
  READY_MADE_PRICE,
  workGroups,
} from "@/lib/work";

/**
 * The showcase makes three claims that are cheap to break and expensive to get
 * wrong: that every link goes somewhere real and says it opens a new tab, that
 * the badges match what is actually for sale, and that the numbering is a
 * single run rather than two groups restarting at one.
 *
 * Everything here is derived from work.ts rather than written out, so adding a
 * project updates the expectations instead of invalidating them. A hand-kept
 * copy is how the sitemap spec caught this project in the first place.
 *
 * Deliberately absent: a test that fetches the ten external sites. It is the
 * most valuable check imaginable for a page whose whole claim is "these are
 * live", and it would fail on somebody else's outage or a cold start. Link rot
 * belongs in a scheduled job, not in the gate on a pull request.
 */

const forSale = allProjects.filter((p) => p.forSale);

test.describe("the work showcase", () => {
  test("every project link is external, safe, and says it opens a new tab", async ({
    page,
  }) => {
    await page.goto("/work");

    const links = page.locator('main a[target="_blank"]');
    await expect(links).toHaveCount(allProjects.length);

    for (const project of allProjects) {
      const link = page.locator(`main a[href="${project.url}"]`);
      await expect(link, `${project.name} is linked once`).toHaveCount(1);

      expect(project.url, `${project.name} is https`).toMatch(/^https:\/\//);
      await expect(link).toHaveAttribute("rel", /noopener/);

      const label = await link.getAttribute("aria-label");
      expect(label, `${project.name} names itself`).toContain(project.name);
      expect(label, `${project.name} warns about the new tab`).toContain(
        "new tab",
      );
    }
  });

  test("no project is listed twice", async () => {
    const urls = allProjects.map((p) => p.url);
    const ids = allProjects.map((p) => p.id);
    expect(new Set(urls).size, "urls are unique").toBe(urls.length);
    expect(new Set(ids).size, "ids are unique").toBe(ids.length);
  });

  test("the numbering runs straight through both groups", async ({ page }) => {
    await page.goto("/work");

    const expected = allProjects.map((_, i) => String(i + 1).padStart(2, "0"));
    // The number used to sit inside the row's single anchor. It does not any
    // more: the row is a div so that the case study link can be a real link
    // beside the stretched one, so this reads the spans directly. Nothing
    // else on the page is a two-digit aria-hidden span.
    const shown = await page
      .locator("main span[aria-hidden='true']")
      .filter({ hasText: /^\d\d$/ })
      .allTextContents();

    expect(shown).toEqual(expected);
  });

  test("the badges match what is actually for sale, and the offer states a price", async ({
    page,
  }) => {
    await page.goto("/work");

    await expect(
      page.getByText("Available to buy", { exact: true }),
    ).toHaveCount(forSale.length);

    // The badge is a promise; the section below it has to pay the promise off.
    await expect(
      page.getByRole("heading", { name: /made yours, live in a week/i }),
    ).toBeVisible();
    await expect(
      page.getByText(READY_MADE_PRICE, { exact: true }),
    ).toBeVisible();
  });

  test("the home page shows the showcase and links to the rest of it", async ({
    page,
  }) => {
    await page.goto("/");

    for (const project of featuredProjects) {
      await expect(
        page.locator(`main a[href="${project.url}"]`),
        `${project.name} is on the home page`,
      ).toHaveCount(1);
    }

    await expect(page.locator('main a[href="/work"]')).toHaveCount(1);
    await expect(page.locator('header a[href="/work"]').first()).toBeVisible();
  });

  test("only the projects with a case study link to one", async ({ page }) => {
    await page.goto("/work");

    const links = page.locator('main a[href^="/work/"]');
    await expect(links).toHaveCount(caseStudyProjects.length);

    for (const project of caseStudyProjects) {
      await expect(
        page.locator(`main a[href="/work/${project.caseStudy.slug}"]`),
        `${project.name} links to its case study once`,
      ).toHaveCount(1);
    }
  });

  /**
   * The stretched link is the part most likely to break silently. If the
   * ::after stops covering the row the page still looks right and only the
   * click target shrinks to the width of the title, which nobody notices
   * until a visitor cannot open anything.
   */
  test("the whole row is the live link, and the case study link sits above it", async ({
    page,
  }) => {
    const project = caseStudyProjects[0];
    const studyHref = `/work/${project.caseStudy.slug}`;
    await page.goto("/work");

    const row = page
      .locator(`main a[href="${project.url}"]`)
      .locator("xpath=ancestor::div[contains(@class,'group')][1]");

    await row.scrollIntoViewIfNeeded();
    const box = await row.boundingBox();
    expect(box, "the row has a box").not.toBeNull();

    /**
     * Asks the browser what is actually under a point, rather than clicking
     * and following it. Clicking the live link would open somebody else's
     * site, which this file deliberately never does; and a popup's url is
     * still empty in WebKit until it navigates, so reading it races.
     *
     * elementFromPoint returns the anchor that owns the stretched ::after,
     * since a pseudo-element hit resolves to its originating element.
     */
    const hitAt = (x: number, y: number) =>
      page.evaluate(
        ([px, py]) =>
          document
            .elementFromPoint(px, py)
            ?.closest("a")
            ?.getAttribute("href") ?? null,
        [x, y],
      );

    // Well away from the title, near the bottom of the row, where only the
    // stretched ::after can be covering. If it ever stops reaching, the page
    // still looks right and the click target silently shrinks to the title.
    expect(
      await hitAt(box!.x + box!.width * 0.4, box!.y + box!.height - 20),
      "the row body opens the live site",
    ).toBe(project.url);

    const studyBox = await page
      .locator(`main a[href="${studyHref}"]`)
      .boundingBox();
    expect(
      await hitAt(
        studyBox!.x + studyBox!.width / 2,
        studyBox!.y + studyBox!.height / 2,
      ),
      "the case study link wins over the stretched link beneath it",
    ).toBe(studyHref);

    await page.locator(`main a[href="${studyHref}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${studyHref}$`));
  });

  test("a case study names its project and still sends you to the live site", async ({
    page,
  }) => {
    for (const project of caseStudyProjects) {
      await page.goto(`/work/${project.caseStudy.slug}`);

      await expect(
        page.getByRole("heading", { level: 1, name: project.caseStudy.title }),
      ).toBeVisible();

      const live = page.locator(`main a[href="${project.url}"]`);
      await expect(live, `${project.name} links to itself`).toHaveCount(1);
      await expect(live).toHaveAttribute("target", "_blank");
      await expect(live).toHaveAttribute("rel", /noopener/);

      await expect(page.locator('main a[href="/work"]')).toHaveCount(1);
    }
  });

  test("both groups render, each with its own heading", async ({ page }) => {
    await page.goto("/work");

    for (const group of workGroups) {
      await expect(
        page.getByRole("heading", { name: group.title }),
        `${group.id} group has its heading`,
      ).toBeVisible();
    }
  });
});
