import { test, expect } from "@playwright/test";

/**
 * What crawlers are told, and what a screen reader is told.
 *
 * Both were found by walking the site rather than by a failing test: three
 * pages that exist for one person holding one link were fully indexable, and
 * the form marked its errors visually without marking them in the accessibility
 * tree at all.
 */

/** Reached only from a QR code, a signed email link, or by knowing the path. */
const PRIVATE_PAGES = ["/start", "/handled", "/design-system"];

const PUBLIC_PAGES = [
  "",
  "/grow",
  "/platform",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
];

test.describe("what search engines are told", () => {
  test("robots.txt disallows the pages that are not for searchers", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBeTruthy();

    const body = await res.text();
    expect(body).toContain("User-Agent: *");
    expect(body).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);

    for (const page of [...PRIVATE_PAGES, "/api/"]) {
      expect(body, `${page} is disallowed`).toContain(`Disallow: ${page}`);
    }
  });

  test("the sitemap lists every public page and no private one", async ({
    request,
  }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    expect(locs.length).toBe(PUBLIC_PAGES.length);

    for (const page of PUBLIC_PAGES) {
      expect(
        locs.some((loc) => new URL(loc).pathname === (page || "/")),
        `sitemap lists ${page || "/"}`,
      ).toBeTruthy();
    }

    for (const page of PRIVATE_PAGES) {
      expect(
        locs.some((loc) => new URL(loc).pathname === page),
        `sitemap does not list ${page}`,
      ).toBeFalsy();
    }
  });

  /**
   * Disallow alone is not enough. A page that is only disallowed can still be
   * listed in results if something links to it — the crawler simply never
   * fetches it. noindex is the half that keeps it out.
   */
  test("the private pages also carry noindex", async ({ page }) => {
    for (const path of PRIVATE_PAGES) {
      await page.goto(path);
      await expect(
        page.locator('meta[name="robots"]'),
        `${path} is noindex`,
      ).toHaveAttribute("content", /noindex/);
    }
  });

  test("the public pages are left indexable", async ({ page }) => {
    await page.goto("/grow");
    const robots = page.locator('meta[name="robots"]');
    if ((await robots.count()) > 0) {
      await expect(robots).not.toHaveAttribute("content", /noindex/);
    }
  });
});

test.describe("the form tells a screen reader what is wrong", () => {
  test("an invalid field is marked, and its message is tied to it", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: /send it/i }).click();

    for (const name of ["name", "email", "message"]) {
      const field = page.locator(`#${name}`);
      await expect(field, `${name} is marked invalid`).toHaveAttribute(
        "aria-invalid",
        "true",
      );

      // The described-by target must exist and hold the message a sighted
      // visitor sees. An id pointing at nothing reads as silence.
      const describedBy = await field.getAttribute("aria-describedby");
      expect(describedBy, `${name} points at its error`).toBe(`${name}-error`);
      await expect(page.locator(`#${describedBy}`)).not.toBeEmpty();
    }
  });

  test("optional fields are not marked invalid or required", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: /send it/i }).click();

    for (const name of ["phone", "business"]) {
      const field = page.locator(`#${name}`);
      await expect(field).not.toHaveAttribute("aria-invalid", "true");
      await expect(field).not.toHaveAttribute("aria-required", "true");
    }
  });

  test("the required fields say so in the accessibility tree", async ({
    page,
  }) => {
    await page.goto("/contact");

    // Not the native required attribute on purpose: that hands validation to
    // the browser and loses the wording, which is the same wording the server
    // returns. aria-required states the fact without taking over.
    for (const name of ["name", "email", "message"]) {
      await expect(page.locator(`#${name}`)).toHaveAttribute(
        "aria-required",
        "true",
      );
    }
  });
});
