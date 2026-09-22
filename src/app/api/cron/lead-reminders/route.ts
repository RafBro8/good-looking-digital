import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/lib/db";
import { isNotificationConfigured, remindOwner } from "@/lib/notify";
import {
  findLeadsNeedingReminder,
  markReminded,
  ownerReminderText,
  reminderAfterHours,
  withinSendingWindow,
} from "@/lib/reminders";

/**
 * The reminder sweep.
 *
 * Runs on a schedule, finds enquiries that have gone quiet, sends one nudge
 * each and records that it did. Everything about when a lead counts as quiet
 * lives in lib/reminders.ts; this route is the trigger and the guard rail.
 *
 * Not on Vercel Cron today: the Hobby plan caps cron at a single run per day,
 * and an expression firing more often than that fails at deploy time rather
 * than quietly under-running. A once-a-day sweep is a next-day summary, not a
 * follow-up. So a GitHub Actions schedule calls this endpoint every half hour
 * instead. Moving to Vercel Cron on Pro is a vercel.json entry and deleting
 * the workflow - the endpoint does not change.
 */

/** Never prerendered or cached: it has side effects and a clock. */
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;

  // No secret configured means the endpoint stays shut rather than open.
  // A public URL that emails people on demand is not a thing to ship.
  if (!expected) return false;

  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${expected}`;
}

/**
 * Tests cannot wait eight hours, so the sweep accepts the moment it should
 * evaluate against. Gated behind its own environment flag, which only the
 * Playwright web server sets - an authorized caller in production still
 * cannot move the clock, because being able to would mean being able to
 * reach back and re-send every reminder the system ever suppressed.
 */
function evaluationTime(request: Request): Date {
  if (process.env.ALLOW_TEST_CLOCK !== "1") return new Date();

  const override = new URL(request.url).searchParams.get("now");
  if (!override) return new Date();

  const parsed = new Date(override);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    console.error("[reminders] MONGODB_URI is not set - nothing to sweep");
    return NextResponse.json(
      { ok: false, reason: "database-not-configured" },
      { status: 503 },
    );
  }

  const now = evaluationTime(request);

  // Checked before the query rather than after: outside the window there is
  // nothing to do, and a lead that is quiet at 3am is still quiet at 8.
  if (!withinSendingWindow(now)) {
    return NextResponse.json({
      ok: true,
      skipped: "outside-sending-window",
      reminded: 0,
    });
  }

  let candidates;
  try {
    candidates = await findLeadsNeedingReminder(now);
  } catch (error) {
    console.error("[reminders] could not read the leads collection", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  // Ids rather than a bare count, so a run can be audited afterwards and so
  // parallel tests can assert on their own lead instead of a global total.
  // Ids are not personal data, and the endpoint is authenticated anyway.
  const consideredIds = candidates.map((lead) => lead._id.toString());

  if (candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      reminded: 0,
      considered: 0,
      consideredIds,
    });
  }

  if (!isNotificationConfigured()) {
    // Deliberately not marked as reminded. Marking them would mean the one
    // reminder each lead gets was spent on an email that never left, and
    // nothing would ever chase them again.
    console.error(
      "[reminders] RESEND_API_KEY is not set - leads are going unchased",
      { considered: candidates.length },
    );
    return NextResponse.json(
      {
        ok: false,
        reason: "email-not-configured",
        considered: candidates.length,
        consideredIds,
      },
      { status: 503 },
    );
  }

  let reminded = 0;

  for (const lead of candidates) {
    const sent = await remindOwner(
      `Still unanswered - ${lead.name}${lead.business ? ` (${lead.business})` : ""}`,
      ownerReminderText(lead, now),
    ).catch(() => false);

    // Only records the reminder when one actually went out, so a provider
    // outage delays the nudge rather than cancelling it.
    if (sent) {
      await markReminded(lead._id.toString(), now).catch((error) =>
        console.error("[reminders] sent but could not mark", error),
      );
      reminded += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    considered: candidates.length,
    consideredIds,
    reminded,
    afterHours: reminderAfterHours(),
  });
}
