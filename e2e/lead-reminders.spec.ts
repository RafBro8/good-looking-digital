import { test, expect, type APIRequestContext } from "@playwright/test";
import crypto from "node:crypto";

import { withDb, uniqueEmail } from "./support/db";

/**
 * The follow-up reminder.
 *
 * Nobody can wait eight hours inside a test, so the sweep endpoint accepts the
 * moment it should evaluate against — gated behind ALLOW_TEST_CLOCK, which
 * only the Playwright web server sets. The lead is inserted with a real
 * timestamp and the clock is moved forward instead, which exercises the actual
 * query rather than a fake one.
 *
 * These specs must match the values in playwright.config.ts: an eight hour
 * threshold, and a fixed secret for both the cron header and the link HMAC.
 */

const CRON_SECRET = "e2e-cron-secret";
const ACTION_SECRET = "e2e-action-secret";

/** Mid-morning in America/Chicago, so the sending window is always open. */
function chicagoMorning(): Date {
  const d = new Date();
  d.setUTCHours(15, 0, 0, 0);
  return d;
}

function hoursBefore(moment: Date, hours: number): Date {
  return new Date(moment.getTime() - hours * 60 * 60 * 1000);
}

function tokenFor(id: string): string {
  return crypto.createHmac("sha256", ACTION_SECRET).update(id).digest("hex");
}

/** Inserts straight into Mongo: the route would stamp its own receivedAt. */
async function seedLead(receivedAt: Date, extra: Record<string, unknown> = {}) {
  return withDb(async (db) => {
    const result = await db.collection("leads").insertOne({
      name: "Dana Reyes",
      email: uniqueEmail("reminder"),
      business: "Reyes Roofing",
      path: "grow",
      message: "Need a quote for a roof replacement on a two storey house.",
      receivedAt,
      ...extra,
    });
    return result.insertedId.toString();
  });
}

async function sweep(request: APIRequestContext, now: Date) {
  return request.get(
    `/api/cron/lead-reminders?now=${encodeURIComponent(now.toISOString())}`,
    { headers: { Authorization: `Bearer ${CRON_SECRET}` } },
  );
}

/**
 * Which leads the sweep picked up.
 *
 * Specs run in parallel across three engines against one database, so every
 * run sees leads seeded by other tests. A global count would be whatever the
 * rest of the suite happened to be doing at that moment; the only stable
 * question is whether this test's own lead was considered.
 */
async function consideredBySweep(
  request: APIRequestContext,
  now: Date,
): Promise<string[]> {
  const res = await sweep(request, now);
  const body = await res.json();
  return body.consideredIds ?? [];
}

async function leadById(id: string) {
  return withDb(async (db) => {
    const { ObjectId } = await import("mongodb");
    return db.collection("leads").findOne({ _id: new ObjectId(id) });
  });
}

test.describe("lead follow-up reminders", () => {
  /**
   * Proves the lead is selected, not that mail left the building. The suite
   * runs with RESEND_API_KEY blank so a test run can never email a real
   * person, which means the send itself is the one step CI cannot exercise.
   * Naming this "is reminded" would claim a coverage that does not exist.
   */
  test("an unanswered lead past the threshold is picked up by the sweep", async ({
    request,
  }) => {
    const now = chicagoMorning();
    const id = await seedLead(hoursBefore(now, 9));

    const first = await sweep(request, now);
    const body = await first.json();

    // RESEND_API_KEY is blank under test, so no mail leaves the machine and
    // the sweep reports that rather than pretending it chased anyone.
    expect(body.reason).toBe("email-not-configured");
    expect(body.consideredIds).toContain(id);

    // The lead stays unmarked, which is the point: a reminder that never
    // sent must not consume the single reminder the lead is entitled to.
    const lead = await leadById(id);
    expect(lead?.remindedAt).toBeUndefined();
  });

  test("a lead inside the threshold is left alone", async ({ request }) => {
    const now = chicagoMorning();
    const id = await seedLead(hoursBefore(now, 2));

    // Two hours old is not a missed lead.
    expect(await consideredBySweep(request, now)).not.toContain(id);
  });

  test("a lead already marked handled is never chased", async ({ request }) => {
    const now = chicagoMorning();
    const id = await seedLead(hoursBefore(now, 30), {
      respondedAt: hoursBefore(now, 29),
    });

    expect(await consideredBySweep(request, now)).not.toContain(id);
  });

  test("a lead already reminded is not reminded again", async ({ request }) => {
    const now = chicagoMorning();
    const id = await seedLead(hoursBefore(now, 30), {
      remindedAt: hoursBefore(now, 20),
    });

    expect(await consideredBySweep(request, now)).not.toContain(id);
  });

  test("nothing is sent outside the sending window", async ({ request }) => {
    const middleOfTheNight = new Date();
    // 07:00 UTC is 01:00 or 02:00 in Chicago depending on the season, and
    // both are firmly inside the hours this feature refuses to email in.
    middleOfTheNight.setUTCHours(7, 0, 0, 0);
    await seedLead(hoursBefore(middleOfTheNight, 12));

    const res = await sweep(request, middleOfTheNight);
    const body = await res.json();

    expect(body.skipped).toBe("outside-sending-window");
    expect(body.reminded).toBe(0);
  });

  test("the sweep refuses a caller without the secret", async ({ request }) => {
    const bare = await request.get("/api/cron/lead-reminders");
    expect(bare.status()).toBe(401);

    const wrong = await request.get("/api/cron/lead-reminders", {
      headers: { Authorization: "Bearer not-the-secret" },
    });
    expect(wrong.status()).toBe(401);
  });
});

test.describe("marking a lead handled", () => {
  test("a valid token marks the lead, and a second click is still fine", async ({
    request,
  }) => {
    const id = await seedLead(hoursBefore(chicagoMorning(), 9));

    const first = await request.post(`/api/leads/${id}/handled`, {
      data: { token: tokenFor(id) },
    });
    expect(first.ok()).toBeTruthy();
    expect((await first.json()).state).toBe("marked");

    const lead = await leadById(id);
    expect(lead?.respondedAt).toBeTruthy();

    const second = await request.post(`/api/leads/${id}/handled`, {
      data: { token: tokenFor(id) },
    });
    expect(second.ok()).toBeTruthy();
    expect((await second.json()).state).toBe("already");
  });

  test("a forged or missing token is refused", async ({ request }) => {
    const id = await seedLead(hoursBefore(chicagoMorning(), 9));

    const forged = await request.post(`/api/leads/${id}/handled`, {
      data: { token: "a".repeat(64) },
    });
    expect(forged.status()).toBe(403);

    const none = await request.post(`/api/leads/${id}/handled`, { data: {} });
    expect(none.status()).toBe(403);

    const lead = await leadById(id);
    expect(lead?.respondedAt).toBeUndefined();
  });

  /**
   * The one that matters most. Mail clients and link scanners fetch URLs in a
   * message before a human opens it, so if a GET marked leads handled the
   * feature would silence itself on every enquiry nobody had read.
   */
  test("fetching the link does not mark anything — only the button does", async ({
    request,
    page,
  }) => {
    const id = await seedLead(hoursBefore(chicagoMorning(), 9));
    const token = tokenFor(id);

    const prefetch = await request.get(`/api/leads/${id}/handled`);
    expect(prefetch.status()).toBe(405);

    await page.goto(`/handled?id=${id}&t=${token}`);
    await expect(
      page.getByRole("heading", { name: /mark this enquiry as handled/i }),
    ).toBeVisible();

    // Loading the page changed nothing.
    expect((await leadById(id))?.respondedAt).toBeUndefined();

    await page.getByRole("button", { name: /dealt with this/i }).click();
    await expect(page.getByText(/marked as handled/i)).toBeVisible();

    expect((await leadById(id))?.respondedAt).toBeTruthy();
  });
});
