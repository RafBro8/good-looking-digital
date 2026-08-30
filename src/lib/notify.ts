import { site } from "@/lib/site";
import type { StoredLead } from "@/lib/leads";

/**
 * Lead notifications.
 *
 * Called over plain fetch rather than through a vendor SDK, so switching from
 * Resend to Postmark, SendGrid or SMTP is a change to this file alone and adds
 * no dependency to the project.
 *
 * Every function here is deliberately failure-tolerant. A lead that is safely
 * in the database must never be reported as failed because an email provider
 * had a bad minute — the visitor would fill the form in again or, more likely,
 * give up.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function config() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.LEAD_NOTIFICATION_EMAIL ?? site.email,
    from: process.env.LEAD_FROM_EMAIL ?? `Good Looking Digital <${site.email}>`,
  };
}

export function isNotificationConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

async function send(payload: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const { apiKey, from } = config();
  if (!apiKey) return false;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      console.error("[notify] provider rejected the message", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[notify] could not reach the provider", error);
    return false;
  }
}

const TWILIO_BASE = "https://api.twilio.com/2010-04-01/Accounts";

function smsConfig() {
  return {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM_NUMBER,
    to: process.env.LEAD_SMS_TO,
  };
}

export function isSmsConfigured(): boolean {
  const c = smsConfig();
  return Boolean(c.sid && c.token && c.from && c.to);
}

/**
 * Texts you when a lead arrives.
 *
 * Only ever to your own number — never to the person who enquired. Texting a
 * consumer without a recorded opt-in is a TCPA problem in the US, and a lead
 * form submission is not consent to be texted. Adding customer SMS later means
 * an explicit opt-in checkbox and A2P 10DLC registration, not just a new
 * recipient here.
 *
 * Kept under 320 characters so it lands as at most two segments. The detail
 * lives in the email; this exists so a phone in a pocket buzzes.
 */
export async function notifyOwnerBySms(lead: StoredLead): Promise<boolean> {
  const { sid, token, from, to } = smsConfig();
  if (!sid || !token || !from || !to) return false;

  const who = lead.business ? `${lead.name} (${lead.business})` : lead.name;
  const gist = lead.message.replace(/\s+/g, " ").slice(0, 90);

  const body = [
    `New enquiry — ${who}`,
    lead.phone ? lead.phone : lead.email,
    `"${gist}${lead.message.length > 90 ? "..." : ""}"`,
    lead.source ? `via ${lead.source}` : null,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 320);

  try {
    const res = await fetch(`${TWILIO_BASE}/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    });

    if (!res.ok) {
      console.error("[notify] sms provider rejected the message", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[notify] could not reach the sms provider", error);
    return false;
  }
}

/** Goes to you. Reply-to is the lead, so replying in your inbox just works. */
export async function notifyOwner(lead: StoredLead): Promise<boolean> {
  const { to } = config();

  const lines = [
    `New enquiry via ${site.url}`,
    "",
    `Name:      ${lead.name}`,
    `Email:     ${lead.email}`,
    lead.phone ? `Phone:     ${lead.phone}` : null,
    lead.business ? `Business:  ${lead.business}` : null,
    `Path:      ${lead.path}`,
    lead.budget ? `Budget:    ${lead.budget}` : null,
    lead.source ? `Source:    ${lead.source}` : null,
    "",
    "Message",
    "-------",
    lead.message,
    "",
    `Received ${lead.receivedAt.toISOString()}`,
  ].filter(Boolean);

  return send({
    to,
    subject: `New enquiry — ${lead.name}${lead.business ? ` (${lead.business})` : ""}`,
    text: lines.join("\n"),
    replyTo: lead.email,
  });
}

/**
 * Goes to the person who enquired. Silence after submitting a form is the
 * single most common reason someone assumes it did not work and calls a
 * competitor instead.
 */
export async function confirmToSender(lead: StoredLead): Promise<boolean> {
  const text = [
    `Hi ${lead.name.split(" ")[0]},`,
    "",
    "Thanks for getting in touch — your message reached us and it is not sitting in a queue somewhere.",
    "",
    "You will get a real reply from a person, usually within one business day. If it is urgent, just reply to this email and it comes straight back to us.",
    "",
    "For reference, here is what you sent:",
    "",
    lead.message,
    "",
    "— Good Looking Digital",
    site.url,
  ].join("\n");

  return send({
    to: lead.email,
    subject: "We got your message — Good Looking Digital",
    text,
  });
}
