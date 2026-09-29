import { test, expect } from "@playwright/test";

import { towns } from "@/lib/towns";
import { serviceArea } from "@/lib/site";

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

  /**
   * The doorway-page guard, as a test rather than a good intention.
   *
   * Seven town pages are only defensible while each says something that could
   * only be said about that town. That erodes quietly - a phrase reused here,
   * a paragraph adapted there - and by the time it is obvious there are seven
   * pages to rewrite. Overlap is measured on four-word sequences, which
   * catches a reworded template as well as a copied one.
   *
   * The three written so far sit at 0.2% or below. Ten percent is a long way
   * past drift and well short of a false alarm.
   */
  test("no two town pages say the same thing", () => {
    const shingles = (text: string) => {
      const words = text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
      const set = new Set<string>();
      for (let i = 0; i + 4 <= words.length; i++) {
        set.add(words.slice(i, i + 4).join(" "));
      }
      return set;
    };

    const localText = towns.map((town) => ({
      name: town.name,
      grams: shingles(
        town.local
          .map((section) => `${section.title} ${section.body}`)
          .join(" "),
      ),
    }));

    for (let i = 0; i < localText.length; i++) {
      for (let j = i + 1; j < localText.length; j++) {
        const a = localText[i];
        const b = localText[j];
        const shared = [...a.grams].filter((gram) => b.grams.has(gram)).length;
        const union = new Set([...a.grams, ...b.grams]).size;
        const overlap = union === 0 ? 0 : shared / union;

        expect(
          overlap,
          `${a.name} and ${b.name} share ${(overlap * 100).toFixed(1)}% of their phrasing`,
        ).toBeLessThan(0.1);
      }
    }
  });

  /**
   * A town page names its neighbours by hand, so the list can be ordered by
   * how close they actually are. That ordering is worth keeping and it is
   * also what makes the list capable of going stale: adding a town to
   * serviceArea updates the footer, /grow and /contact automatically, and
   * updates none of these. Lockport was added on 2026-09-29 and needed seven
   * separate edits, which is exactly the kind of thing to be told about
   * rather than to notice later.
   */
  test("every town names all of its neighbours", () => {
    const area = [...serviceArea];

    for (const town of towns) {
      const named = new Set([town.name, ...town.nearby]);
      const missing = area.filter((place) => !named.has(place));

      expect(
        missing,
        `${town.name} does not mention ${missing.join(", ")}`,
      ).toEqual([]);

      // And nothing invented: every neighbour has to be somewhere we say we
      // work, or the page is claiming a service area the site does not.
      const strangers = town.nearby.filter(
        (place) => !area.includes(place as (typeof serviceArea)[number]),
      );
      expect(
        strangers,
        `${town.name} lists ${strangers.join(", ")}, which is not in serviceArea`,
      ).toEqual([]);
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
