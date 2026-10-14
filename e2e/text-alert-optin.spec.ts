import { expect, test } from "@playwright/test";

import { CONSENT_DISCLOSURE, CONSENT_LABEL, digitsOf } from "@/lib/consent";
import { withDb } from "./support/db";

/**
 * The text alert opt-in.
 *
 * Every assertion here exists because of a specific carrier rejection. The
 * first version of this programme put consent in clause 12.6 of the client
 * services agreement and was turned down under code 30923: agreeing to be
 * texted was a condition of buying a website.
 *
 * So these are not our rules and not our wording, and that is exactly why
 * they need a spec. Each one is a sentence or an attribute that somebody could
 * tidy, improve or refactor away without anything appearing to break, and the
 * failure would be invisible - no 404, no error, just a campaign that is
 * quietly non-compliant until messages stop arriving.
 */

/** A number that is obviously not a real person's. */
const TEST_MOBILE = "630-555-0188";

test.describe("the text alert opt-in", () => {
  // Three attempts per hour on this route, and all three engines submit from
  // 127.0.0.1, so they share one bucket. Same reasoning as lead capture.
  test.beforeEach(async () => {
    await withDb((db) => db.collection("rate_limits").deleteMany({}));
  });

  test("the opt-in page makes clear that consent is not a condition of purchase", async ({
    page,
  }) => {
    await page.goto("/text-alerts");

    const body = (await page.locator("main").innerText()).replace(/\s+/g, " ");

    // The phrase the reviewers look for. "Optional" on its own does not
    // satisfy them, and neither does a sentence that only talks about price.
    expect(body, "the not-a-condition disclosure").toContain(
      "not a condition of purchase",
    );
    // Canonical rates wording. Reads worse than the alternative and is the
    // one that counts, so both are on the site and only this is asserted.
    expect(body, "the canonical rates disclosure, unreworded").toContain(
      "Message and data rates may apply.",
    );
    expect(body, "how to stop them").toContain("Reply STOP");
    expect(body, "the registered brand is named").toContain(
      "Good Looking Digital LLC",
    );

    // A reviewer follows these from the opt-in page itself.
    await expect(page.locator('main a[href="/privacy"]')).not.toHaveCount(0);
    await expect(page.locator('main a[href="/terms"]')).not.toHaveCount(0);
  });

  /**
   * A preselected consent box is named explicitly as a rejection cause, so
   * this is checked on a fresh load and again after a reload - a value
   * restored by the browser or by form state would be just as preselected as
   * one written into the markup.
   */
  test("the consent box starts unchecked, every time", async ({ page }) => {
    await page.goto("/text-alerts");

    const box = page.locator("#consent");
    await expect(box).not.toBeChecked();

    await page.reload();
    await expect(page.locator("#consent")).not.toBeChecked();
  });

  test("an unticked box is refused, and nothing is recorded", async ({
    page,
  }) => {
    await page.goto("/text-alerts");

    const phone = "630-555-0199";
    await page.locator("#name").fill("Unticked Box");
    await page.locator("#phone").fill(phone);
    await page.getByRole("button", { name: /turn the alerts on/i }).click();

    // Marked on the control, not only coloured. Someone tabbing back to the
    // checkbox has to be told it is the problem.
    await expect(page.locator("#consent")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.locator("#consent-error")).not.toBeEmpty();

    // And the important half: refusing has to mean refusing. An opt-in we
    // did not record is an opt-in that did not happen.
    const found = await withDb((db) =>
      db.collection("sms_consents").countDocuments({ phone: digitsOf(phone) }),
    );
    expect(found, "nothing was written for an unticked box").toBe(0);
  });

  /**
   * The one that matters a year from now.
   *
   * A consent record that quotes different words from the ones on screen is
   * worse than no record at all - it is a record of something that never
   * happened. The page and the API both read one constant, and this proves
   * they still agree after it reaches the database.
   */
  test("a ticked box is recorded with the words that were on the screen", async ({
    page,
  }) => {
    await page.goto("/text-alerts");

    // Read the wording off the rendered page rather than trusting the import,
    // so a page that stopped rendering the constant would fail here.
    const shown = (await page.locator("fieldset").innerText()).replace(
      /\s+/g,
      " ",
    );
    expect(shown).toContain(CONSENT_LABEL);
    expect(shown).toContain(CONSENT_DISCLOSURE);

    await page.locator("#name").fill("Marcus Bell");
    await page.locator("#business").fill("Bell Roofing");
    await page.locator("#phone").fill(TEST_MOBILE);
    await page.locator("#consent").check();
    await page.getByRole("button", { name: /turn the alerts on/i }).click();

    // Longer than the default five seconds on purpose. This is the only spec
    // in the file that makes a real round trip through the route and into
    // Mongo, and on a loaded machine webkit was still showing "Saving..."
    // when the assertion gave up - a slow test, not a broken one.
    await expect(page.getByRole("status")).toContainText(/recorded/i, {
      timeout: 20_000,
    });

    const record = await withDb((db) =>
      db
        .collection("sms_consents")
        .findOne({ phone: digitsOf(TEST_MOBILE) }, { sort: { at: -1 } }),
    );

    expect(record, "the consent reached the database").not.toBeNull();
    expect(record?.consent).toBe(true);
    expect(record?.name).toBe("Marcus Bell");
    expect(record?.business).toBe("Bell Roofing");
    // Stored as typed and as digits: one for reading back to a client, one so
    // two spellings of a number are the same number.
    expect(record?.phoneAsGiven).toBe(TEST_MOBILE);
    expect(record?.label).toBe(CONSENT_LABEL);
    expect(record?.disclosure).toBe(CONSENT_DISCLOSURE);
  });
});
