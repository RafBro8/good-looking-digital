import crypto from "node:crypto";

import { getDb } from "@/lib/db";
import type { StoredLead } from "@/lib/leads";
import { site } from "@/lib/site";

/**
 * Follow-up reminders for enquiries nobody answered.
 *
 * The immediate notification is the real signal. This exists for the case
 * where that one was missed — read on a phone between jobs and forgotten, or
 * buried under everything else that arrived that morning. A lead nobody
 * replies to is the most expensive kind, because the work was already paid
 * for in advertising, signage or someone's afternoon.
 *
 * Deliberately one reminder, not a sequence. A nudge that arrives every hour
 * gets muted, and a muted reminder protects nothing.
 *
 * On a client deployment this same sweep will copy Good Looking Digital, so a
 * lead going cold is noticed even when the business owner is on a roof. That
 * copy must name nobody and quote nothing — a client reference and a short id,
 * no customer name, number or message. Knowing an enquiry is going cold is the
 * whole service; the customer's details are the client's business, and there
 * is no reason for them to accumulate in our inbox. Their own notification
 * carries the detail, because they are the ones who have to make the call.
 * Not built here: this site has one owner and no clients yet.
 */

/**
 * Long enough that a reminder means "this was missed" rather than "you are
 * busy". At four hours it fires while a contractor is still on the roof and
 * teaches them to ignore it; at eight, an enquiry that arrived at nine in the
 * morning is chased at five, which is when someone can actually act on it.
 *
 * Per-deployment rather than hardcoded, because a client competing on response
 * time may genuinely want four, and it is their business, not ours.
 */
export function reminderAfterHours(): number {
  const raw = Number(process.env.LEAD_REMINDER_AFTER_HOURS);
  return Number.isFinite(raw) && raw > 0 ? raw : 8;
}

/**
 * The hours a reminder may be sent, in local time. Serverless runs in UTC,
 * so the zone has to be stated rather than assumed — otherwise "nothing
 * overnight" silently means nothing between 8pm and 8am in Greenwich, which
 * is the middle of the afternoon here.
 */
const WINDOW = { startHour: 8, endHour: 20 };

function timeZone(): string {
  return process.env.LEAD_REMINDER_TIMEZONE ?? "America/Chicago";
}

export function withinSendingWindow(now: Date): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone(),
      hour: "numeric",
      hour12: false,
    }).format(now),
  );

  // Intl renders midnight as 24 in some environments, 0 in others.
  const local = hour === 24 ? 0 : hour;
  return local >= WINDOW.startHour && local < WINDOW.endHour;
}

/**
 * Signs the mark-as-handled link.
 *
 * A bare lead id in a URL would let anyone who guessed one silence a
 * reminder, and ids are not secret — they travel in emails. The token is an
 * HMAC over the id with a server-side secret, so it can be verified without
 * being stored and cannot be produced by anyone who does not hold the secret.
 *
 * No expiry on purpose. A lead you come back to on Monday must still be
 * markable, and the link does nothing except record that a human dealt with
 * an enquiry they were already told about.
 */
function secret(): string | undefined {
  return process.env.LEAD_ACTION_SECRET;
}

export function handledToken(leadId: string): string | undefined {
  const key = secret();
  if (!key) return undefined;
  return crypto.createHmac("sha256", key).update(leadId).digest("hex");
}

export function verifyHandledToken(leadId: string, token: string): boolean {
  const expected = handledToken(leadId);
  if (!expected) return false;

  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  // Length check first: timingSafeEqual throws on a mismatch rather than
  // returning false, and the length of a hex digest is not a secret.
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function handledUrl(leadId: string): string | undefined {
  const token = handledToken(leadId);
  if (!token) return undefined;

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
  return `${base}/handled?id=${encodeURIComponent(leadId)}&t=${token}`;
}

export interface ReminderCandidate extends StoredLead {
  _id: { toString(): string };
}

/**
 * Enquiries that have gone quiet: old enough to count as missed, not marked
 * handled, and not already chased.
 */
export async function findLeadsNeedingReminder(
  now: Date,
  limit = 50,
): Promise<ReminderCandidate[]> {
  const db = await getDb();
  const cutoff = new Date(
    now.getTime() - reminderAfterHours() * 60 * 60 * 1000,
  );

  return db
    .collection<StoredLead>("leads")
    .find({
      receivedAt: { $lte: cutoff },
      respondedAt: { $exists: false },
      remindedAt: { $exists: false },
    })
    .sort({ receivedAt: 1 })
    .limit(limit)
    .toArray() as unknown as Promise<ReminderCandidate[]>;
}

export async function markReminded(leadId: string, at: Date): Promise<void> {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  await db
    .collection("leads")
    .updateOne({ _id: new ObjectId(leadId) }, { $set: { remindedAt: at } });
}

/**
 * Records that a human has dealt with the enquiry.
 *
 * Only ever sets the field when it is absent, so a second click does not
 * rewrite the time the first one recorded.
 */
export async function markResponded(
  leadId: string,
  at: Date,
): Promise<"marked" | "already" | "missing"> {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");

  let id: InstanceType<typeof ObjectId>;
  try {
    id = new ObjectId(leadId);
  } catch {
    return "missing";
  }

  const result = await db
    .collection("leads")
    .updateOne(
      { _id: id, respondedAt: { $exists: false } },
      { $set: { respondedAt: at } },
    );

  if (result.modifiedCount === 1) return "marked";
  const exists = await db.collection("leads").countDocuments({ _id: id });
  return exists ? "already" : "missing";
}

/**
 * The reminder body for the site's own owner.
 *
 * This one carries the detail, because on goodlookingdigital.com the owner and
 * the recipient are the same person and the enquiry was already sent to them
 * in full. On a client deployment the copy that goes to Good Looking Digital
 * is the minimal variant below, which names no one.
 */
export function ownerReminderText(lead: ReminderCandidate, now: Date): string {
  const hours = Math.round(
    (now.getTime() - lead.receivedAt.getTime()) / (60 * 60 * 1000),
  );
  const link = handledUrl(lead._id.toString());

  return [
    `This enquiry has been sitting for ${hours} hours with no reply recorded.`,
    "",
    `Name:      ${lead.name}`,
    `Email:     ${lead.email}`,
    lead.phone ? `Phone:     ${lead.phone}` : null,
    lead.business ? `Business:  ${lead.business}` : null,
    lead.source ? `Source:    ${lead.source}` : null,
    "",
    "Message",
    "-------",
    lead.message,
    "",
    link ? `Already dealt with it? ${link}` : null,
    "",
    `Received ${lead.receivedAt.toISOString()}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}
