import { site } from "@/lib/site";
import type { StoredLead } from "@/lib/leads";
import type { StoredConsent } from "@/lib/consent";

/**
 * Lead notifications.
 *
 * Called over plain fetch rather than through a vendor SDK, so switching from
 * Resend to Postmark, SendGrid or SMTP is a change to this file alone and adds
 * no dependency to the project.
 *
 * Every function here is deliberately failure-tolerant. A lead that is safely
 * in the database must never be reported as failed because an email provider
 * had a bad minute - the visitor would fill the form in again or, more likely,
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

/**
 * Prefer the Messaging Service over the bare number.
 *
 * The A2P 10DLC campaign is registered against a Messaging Service, not
 * against a phone number, and so is everything configured alongside it: the
 * opt-out keywords (STOP, CANCEL, QUIT, OPTOUT, UNSUBSCRIBE, STOPALL, REVOKE,
 * END), the opt-in keywords, HELP, and the branded replies each one sends.
 * Those replies are what the registered campaign declares we send, so a
 * message that does not go through the service risks answering HELP with
 * something other than what the carriers were told.
 *
 * TWILIO_FROM_NUMBER stays as a fallback so an account without a service
 * still sends rather than silently going quiet.
 */
function smsConfig() {
  return {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    from: process.env.TWILIO_FROM_NUMBER,
    to: process.env.LEAD_SMS_TO,
  };
}

export function isSmsConfigured(): boolean {
  const c = smsConfig();
  // Either sender will do, but one of them has to be set.
  return Boolean(c.sid && c.token && (c.messagingServiceSid || c.from) && c.to);
}

/**
 * Texts you when a lead arrives.
 *
 * Only ever to your own number - never to the person who enquired. Texting a
 * consumer without a recorded opt-in is a TCPA problem in the US, and a lead
 * form submission is not consent to be texted. Adding customer SMS later means
 * an explicit opt-in checkbox and A2P 10DLC registration, not just a new
 * recipient here.
 *
 * Kept under 320 characters so it lands as at most two segments. The detail
 * lives in the email; this exists so a phone in a pocket buzzes.
 */
export async function notifyOwnerBySms(lead: StoredLead): Promise<boolean> {
  const { sid, token, messagingServiceSid, from, to } = smsConfig();
  if (!sid || !token || !to) return false;
  if (!messagingServiceSid && !from) return false;

  const who = lead.business ? `${lead.name} (${lead.business})` : lead.name;

  /**
   * Anything a stranger typed that looks like a link comes out before the
   * quote is built. Two reasons, and the second is the one that bites.
   *
   * A text alert should never hand you a live link written by someone you
   * have not met. And the A2P campaign declares that these messages contain
   * no embedded links: carriers filter on that, so one enquirer pasting a url
   * would turn a registered-clean message into a blocked one, silently.
   *
   * Nothing is lost. The email carries the message in full.
   */
  const gist = lead.message
    .replace(/\s+/g, " ")
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, "[link]")
    // The lookbehind spares email addresses. An email is not an embedded
    // link, and without it "marcus@bellroofing.com" became "marcus@[link]".
    .replace(
      /(?<![@\w])[\w-]+\.(?:com|net|org|io|co|uk|biz|info)\b\S*/gi,
      "[link]",
    )
    .trim()
    .slice(0, 90);

  /**
   * The brand name leads and the opt-out closes, and neither is decoration.
   * US carriers vet the sample messages against an A2P 10DLC campaign, and
   * they expect a recipient to be able to tell who is texting them and how to
   * make it stop. A text from an unrecognised number reading only "New
   * enquiry" fails both tests, and would fail them for the client too.
   *
   * Whatever is changed here has to be changed in the registered campaign
   * samples as well, or the samples stop describing what is actually sent.
   */
  const body = [
    `${site.name}: new enquiry`,
    who,
    lead.phone ? lead.phone : lead.email,
    `"${gist}${lead.message.length > 90 ? "..." : ""}"`,
    lead.source ? `via ${lead.source}` : null,
    "Reply STOP to opt out.",
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
      body: new URLSearchParams({
        To: to,
        Body: body,
        ...(messagingServiceSid
          ? { MessagingServiceSid: messagingServiceSid }
          : { From: from as string }),
      }),
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

/**
 * Tells you a client has turned text alerts on.
 *
 * Nothing is automated off the back of this on purpose. The number goes on
 * the alert list by hand, after a look at whether the name matches a real
 * client - which is the whole reason a stranger finding the opt-in page and
 * typing a number into it is a junk row rather than a problem.
 *
 * The disclosure is quoted in full because this email is the copy of the
 * consent record that lands somewhere a person actually reads.
 */
export async function notifyOwnerOfConsent(
  consent: StoredConsent,
): Promise<boolean> {
  const { to } = config();

  const lines = [
    `A client opted in to text alerts via ${site.url}/text-alerts`,
    "",
    `Name:      ${consent.name}`,
    consent.business ? `Business:  ${consent.business}` : null,
    `Mobile:    ${consent.phoneAsGiven}`,
    `Digits:    ${consent.phone}`,
    `At:        ${consent.at.toISOString()}`,
    `Wording:   version ${consent.version}`,
    "",
    "They ticked",
    "----------",
    consent.label,
    "",
    "Having read",
    "-----------",
    consent.disclosure,
    "",
    "Nothing has been turned on automatically. Add the number to LEAD_SMS_TO",
    "once you have checked it against the signed agreement.",
  ].filter(Boolean);

  return send({
    to,
    subject: `Text alerts opt-in - ${consent.name}${consent.business ? ` (${consent.business})` : ""}`,
    text: lines.join("\n"),
  });
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
    // What they say, next to what the page recorded. The two disagreeing is
    // informative rather than a problem: somebody who saw the truck and
    // searched a week later arrives via Google and says so themselves.
    lead.heardFrom
      ? `Heard via: ${lead.heardFrom}${
          lead.heardFromOther ? ` - ${lead.heardFromOther}` : ""
        }`
      : null,
    "",
    "Message",
    "-------",
    lead.message,
    "",
    `Received ${lead.receivedAt.toISOString()}`,
  ].filter(Boolean);

  return send({
    to,
    subject: `New enquiry - ${lead.name}${lead.business ? ` (${lead.business})` : ""}`,
    text: lines.join("\n"),
    replyTo: lead.email,
  });
}

/**
 * The follow-up nudge for an enquiry nobody answered.
 *
 * Subject deliberately says "still" - in an inbox it has to read as a second
 * mention of something already seen, not as a new enquiry, or it gets replied
 * to twice.
 */
export async function remindOwner(
  subject: string,
  text: string,
): Promise<boolean> {
  const { to } = config();
  return send({ to: process.env.LEAD_REMINDER_EMAIL ?? to, subject, text });
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
    "Thanks for getting in touch - your message reached us and it is not sitting in a queue somewhere.",
    "",
    "You will get a real reply from a person, usually within one business day. If it is urgent, just reply to this email and it comes straight back to us.",
    "",
    "For reference, here is what you sent:",
    "",
    lead.message,
    "",
    "- Good Looking Digital",
    site.url,
  ].join("\n");

  return send({
    to: lead.email,
    subject: "We got your message - Good Looking Digital",
    text,
  });
}
