import { NextResponse } from "next/server";

import { ensureIndexes, getDb, isDatabaseConfigured } from "@/lib/db";
import {
  hasErrors,
  looksLikeSpam,
  normalizeLead,
  validateLead,
  type LeadInput,
  type StoredLead,
} from "@/lib/leads";
import {
  confirmToSender,
  isNotificationConfigured,
  isSmsConfigured,
  notifyOwner,
  notifyOwnerBySms,
} from "@/lib/notify";

/**
 * Lead intake.
 *
 * Ordering is deliberate: store first, notify second. A lead safely in the
 * database is a lead that is not lost, so email failures are logged and
 * swallowed rather than surfaced as an error to someone who did nothing wrong.
 * The only failure a visitor is told about is one where we genuinely did not
 * keep their message — and then they get the email address instead.
 *
 * Runs on Vercel rather than the Render service on purpose: a free Render
 * instance sleeps and takes about a minute to wake, which is a minute a
 * prospect spends looking at a form that has not submitted.
 */

const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 };

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || request.headers.get("x-real-ip") || "unknown";
}

/**
 * Rate limiting through Mongo rather than memory: serverless invocations do
 * not share memory, so an in-process counter would reset constantly and
 * enforce nothing. Records carry a TTL so nothing has to clean up after them.
 */
async function overRateLimit(key: string): Promise<boolean> {
  if (key === "unknown") return false;

  try {
    const db = await getDb();
    const now = new Date();
    const since = new Date(now.getTime() - RATE_LIMIT.windowMs);

    const recent = await db
      .collection("rate_limits")
      .countDocuments({ key, at: { $gte: since } });

    if (recent >= RATE_LIMIT.max) return true;

    await db.collection("rate_limits").insertOne({
      key,
      at: now,
      expiresAt: new Date(now.getTime() + RATE_LIMIT.windowMs),
    });

    return false;
  } catch (error) {
    // A limiter that is down must not become a closed door.
    console.error("[leads] rate limit check failed, allowing through", error);
    return false;
  }
}

export async function POST(request: Request) {
  let body: Partial<LeadInput>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "That request could not be read." },
      { status: 400 },
    );
  }

  // Bots get a success response. Telling them they were caught only teaches
  // whoever wrote them to try something else.
  if (looksLikeSpam(body)) {
    return NextResponse.json({ ok: true });
  }

  const errors = validateLead(body);
  if (hasErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  if (!isDatabaseConfigured()) {
    console.error("[leads] MONGODB_URI is not set — cannot accept the lead");
    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not save your message just now. Please email us directly and it will reach us.",
      },
      { status: 503 },
    );
  }

  if (await overRateLimit(clientKey(request))) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "That is a few messages in a short time. Give it an hour, or email us directly.",
      },
      { status: 429 },
    );
  }

  const lead: StoredLead = {
    ...normalizeLead(body as LeadInput),
    receivedAt: new Date(),
    userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? undefined,
  };

  try {
    await ensureIndexes();
    await (await getDb()).collection("leads").insertOne({ ...lead });
  } catch (error) {
    console.error("[leads] could not store the lead", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not save your message just now. Please email us directly and it will reach us.",
      },
      { status: 503 },
    );
  }

  // Stored safely. From here nothing may turn into an error for the visitor.
  // SMS runs alongside email rather than instead of it: the text is the nudge,
  // the email carries the detail and is what gets replied to.
  const [ownerEmailed, ownerTexted, senderConfirmed] = await Promise.all([
    notifyOwner(lead).catch(() => false),
    notifyOwnerBySms(lead).catch(() => false),
    confirmToSender(lead).catch(() => false),
  ]);

  if (!ownerEmailed && !ownerTexted) {
    // Say why, not just that. When this fires on a real lead the difference
    // between "no key in this build" and "the provider rejected us" is the
    // difference between a one-minute fix and an hour of guessing — and the
    // provider's own dashboard shows nothing at all in the first case.
    console.error(
      "[leads] STORED BUT NOT NOTIFIED — check the leads collection",
      lead.email,
      {
        emailConfigured: isNotificationConfigured(),
        smsConfigured: isSmsConfigured(),
        ownerEmailed,
        ownerTexted,
        senderConfirmed,
      },
    );
  }

  return NextResponse.json({ ok: true, confirmationSent: senderConfirmed });
}
