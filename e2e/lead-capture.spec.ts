import { expect, test } from "@playwright/test";

import { TEST_DB, uniqueEmail, withDb } from "./support/db";

/**
 * The lead pipeline, tested through the browser rather than around it.
 *
 * These five specs plus the small-screen one are exactly what the test run
 * panel on the homepage names. If a spec here is renamed, renamed it in
 * src/lib/site.ts too - a panel describing tests that do not exist is worse
 * than no panel.
 */

test.describe("lead capture", () => {
  test("visitor reaches the quote form", async ({ page }) => {
    await page.goto("/");

    // The journey a local business actually takes: the amber door, then the
    // call to action, then the form. Not a direct hop to /contact.
    await page
      .getByRole("link", { name: /grow my business/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/grow$/);

    await page
      .getByRole("link", { name: /start a project/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/contact$/);

    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.getByRole("button", { name: /send it/i })).toBeVisible();
  });

  test("a bad email address is caught", async ({ page }) => {
    await page.goto("/contact");

    await page.locator("#name").fill("Tomasz Wnuk");
    await page.locator("#email").fill("not-an-address");
    await page
      .getByRole("textbox", { name: /about the project/i })
      .fill("Residential electrician in Frankfort looking for a new website.");

    await page.getByRole("button", { name: /send it/i }).click();

    await expect(page.getByRole("alert").first()).toContainText(
      /does not look like an email/i,
    );
    // Still on the form. Nothing was accepted.
    await expect(page.getByRole("button", { name: /send it/i })).toBeVisible();
    await expect(page.getByText(/that reached us/i)).toHaveCount(0);
  });

  test("the quote form submits", async ({ page }) => {
    const email = uniqueEmail("submits");
    await page.goto("/contact");

    await page.locator("#name").fill("Dana Whitfield");
    await page.locator("#email").fill(email);
    await page
      .getByRole("textbox", { name: /about the project/i })
      .fill("Salon in Mokena. Booking is by phone and we keep missing calls.");

    await page.getByRole("button", { name: /send it/i }).click();

    await expect(page.getByRole("status")).toContainText(/that reached us/i);
  });

  test("the lead is stored, not lost", async ({ page }) => {
    const email = uniqueEmail("stored");
    await page.goto("/contact");

    await page.locator("#name").fill("Marcus Bell");
    await page.locator("#email").fill(email);
    await page.locator("#business").fill("Bell Roofing");
    await page
      .getByRole("textbox", { name: /about the project/i })
      .fill("Roofing company in Tinley Park. We need to be found on Google.");

    await page.getByRole("button", { name: /send it/i }).click();
    await expect(page.getByRole("status")).toContainText(/that reached us/i);

    // The response said yes. This checks the database agrees, which is the
    // claim that actually matters to whoever filled the form in.
    const stored = await withDb((db) =>
      db.collection("leads").findOne({ email }),
    );

    expect(stored, `no lead stored for ${email} in ${TEST_DB}`).not.toBeNull();
    expect(stored?.name).toBe("Marcus Bell");
    expect(stored?.business).toBe("Bell Roofing");
    // Untouched optional fields are absent, never null. An absent field is the
    // honest representation of "they did not tell us".
    expect(stored).not.toHaveProperty("budget");
  });

  /**
   * /grow tells a visitor "you can tell which sign produced which call", and
   * until now nothing checked it. The source field was captured and /start
   * passed it, but no spec asserted it survived to the database - the same
   * shape as the follow-up reminder that was described on the page for weeks
   * before any code existed. A claim about attribution is worth exactly as
   * much as the record it leaves behind.
   */
  test("a lead from the QR page records where it came from", async ({
    page,
  }) => {
    const email = uniqueEmail("qr-source");
    await page.goto("/start");

    await page.locator("#name").fill("Priya Raman");
    await page.locator("#email").fill(email);
    await page
      .getByRole("textbox", { name: /about the project/i })
      .fill("Scanned the code on a yard sign in Frankfort. Need a quote.");

    await page.getByRole("button", { name: /send it/i }).click();
    await expect(page.getByRole("status")).toContainText(/that reached us/i);

    const stored = await withDb((db) =>
      db.collection("leads").findOne({ email }),
    );

    expect(stored, `no lead stored for ${email} in ${TEST_DB}`).not.toBeNull();
    expect(stored?.source).toBe("qr");
  });

  test("spam is turned away", async ({ request }) => {
    const email = uniqueEmail("spam");

    // Fills the honeypot, which no person can see or reach by tabbing.
    const response = await request.post("/api/leads", {
      data: {
        name: "Cheap SEO Services",
        email,
        path: "grow",
        message: "Boost your ranking today, click here for a free audit.",
        website: "http://link-farm.example",
      },
    });

    // A bot is told it succeeded. Telling it otherwise only teaches whoever
    // wrote it to try something else.
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });

    const stored = await withDb((db) =>
      db.collection("leads").findOne({ email }),
    );
    expect(stored, "honeypot submission reached the database").toBeNull();
  });

  test("a lead is never falsely reported as emailed", async ({ request }) => {
    const email = uniqueEmail("honesty");

    // The test server runs with no RESEND_API_KEY on purpose, so no
    // confirmation can be sent. The response must say so rather than promise
    // the visitor an email that will never arrive.
    const response = await request.post("/api/leads", {
      data: {
        name: "Priya Raman",
        email,
        path: "platform",
        message: "We have a customer portal that nobody can use on a phone.",
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.confirmationSent).toBe(false);

    // Stored anyway. A notification failure must never lose the lead.
    const stored = await withDb((db) =>
      db.collection("leads").findOne({ email }),
    );
    expect(
      stored,
      "lead was dropped when email could not be sent",
    ).not.toBeNull();
  });
});
