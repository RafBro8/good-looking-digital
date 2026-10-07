import { test, expect } from "@playwright/test";

import { allProjects, featuredProjects, workGroups } from "@/lib/work";

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
    const shown = await page
      .locator("main a[target='_blank'] span[aria-hidden='true']")
      .filter({ hasText: /^\d\d$/ })
      .allTextContents();

    expect(shown).toEqual(expected);
  });

  test("the badges match what is actually for sale, and the offer states a price", async ({
    page,
  }) => {
    await page.goto("/work");

    await expect(page.getByText("Available to buy", { exact: true })).toHaveCount(
      forSale.length,
    );

    // The badge is a promise; the section below it has to pay the promise off.
    await expect(
      page.getByRole("heading", { name: /made yours, live in a week/i }),
    ).toBeVisible();
    await expect(page.getByText("$1,500", { exact: true })).toBeVisible();
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
    await expect(
      page.locator('header a[href="/work"]').first(),
    ).toBeVisible();
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
