import { NextResponse } from "next/server";

import {
  hasConsentErrors,
  looksLikeConsentSpam,
  normalizeConsent,
  validateConsent,
  type ConsentInput,
  type StoredConsent,
} from "@/lib/consent";
import { ensureIndexes, getDb, isDatabaseConfigured } from "@/lib/db";
import { notifyOwnerOfConsent } from "@/lib/notify";
import { overRateLimit } from "@/lib/rate-limit";

/**
 * Records a text alert opt-in.
 *
 * Deliberately not symmetrical with the lead route. A lead that cannot be
 * stored still has to be acknowledged somehow, because the person on the
 * other end has written something and losing it loses the enquiry. A consent
 * that cannot be stored must fail loudly instead: an opt-in we did not record
 * is an opt-in that did not happen, and reporting it as saved would leave us
 * texting a number with nothing to show for why.
 *
 * Nothing is sent to the number here. Not even a confirmation text, which
 * would be the obvious thing to do and is exactly how you end up texting a
 * number a stranger typed in.
 */

export async function POST(request: Request) {
  let body: Partial<ConsentInput>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "That request could not be read." },
      { status: 400 },
    );
  }

  // Bots get a success response, same as the lead form. Telling them they
  // were caught only teaches whoever wrote them to try something else.
  if (looksLikeConsentSpam(body)) {
    return NextResponse.json({ ok: true });
  }

  const errors = validateConsent(body);
  if (hasConsentErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  if (!isDatabaseConfigured()) {
    console.error("[consent] MONGODB_URI is not set - refusing to pretend");
    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not record that just now, and we will not turn the alerts on without a record of you asking. Please email us and we will sort it out.",
      },
      { status: 503 },
    );
  }

  // Tighter than the lead form. A client turns this on once, so three
  // attempts in an hour is already somebody mistyping their own number.
  if (await overRateLimit(request, "consent", { max: 3 })) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "That is a few attempts in a short time. Give it an hour, or just email us.",
      },
      { status: 429 },
    );
  }

  const consent: StoredConsent = {
    ...normalizeConsent(body as ConsentInput),
    at: new Date(),
    userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? undefined,
  };

  try {
    await ensureIndexes();
    await (await getDb()).collection("sms_consents").insertOne({ ...consent });
  } catch (error) {
    console.error("[consent] could not store the consent", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not record that just now, and we will not turn the alerts on without a record of you asking. Please email us and we will sort it out.",
      },
      { status: 503 },
    );
  }

  // Recorded. The email is a convenience and its failure changes nothing
  // about whether the consent exists.
  const emailed = await notifyOwnerOfConsent(consent).catch(() => false);
  if (!emailed) {
    console.error(
      "[consent] RECORDED BUT NOT EMAILED - check the sms_consents collection",
      consent.phone,
    );
  }

  return NextResponse.json({ ok: true });
}
