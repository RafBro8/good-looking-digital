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
