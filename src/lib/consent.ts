/**
 * The text alert opt-in.
 *
 * This exists because of a rejected A2P 10DLC campaign. The first attempt put
 * consent inside clause 12.6 of the client services agreement, which a carrier
 * reviewer read as "you cannot buy the service without agreeing to be texted"
 * and rejected under code 30923. They are right that that is what it was.
 *
 * So consent is its own act now, on its own page, after the agreement is
 * already signed. Three properties are load-bearing and all three are checked
 * by an e2e spec:
 *
 *   it is separate   nothing else on the client's plan depends on it, and the
 *                    page says so in those words
 *   it is unchecked  the box starts empty, every time, with no prefill
 *   it is recorded   the exact wording shown is stored next to the number, so
 *                    a year from now we can say what was agreed to, not just
 *                    that something was
 *
 * Nothing here sends a message. Submitting this form writes a record; the
 * number is added to the alert list by hand afterwards. That is deliberate:
 * a stranger who finds this page and types somebody else's number creates a
 * junk row and nothing else.
 */

/**
 * The words beside the checkbox, and the words stored with the record.
 *
 * One constant rather than two copies, because a consent record that quotes
 * different wording from the page is worse than no record - it is a record of
 * something that never happened. The page renders this; the API stores it.
 *
 * Carrier-mandated phrasing, do not reword:
 *   "Message and data rates may apply."
 *   consent is not a condition of purchase or service
 */
export const CONSENT_LABEL = "Yes, text me when an enquiry arrives on my site.";

export const CONSENT_DISCLOSURE = [
  "Good Looking Digital LLC will text the mobile number above each time someone submits a form on your website. One message per enquiry, which for most businesses is a few a week. No marketing, no schedule, no digest.",
  "Consent is not a condition of purchase or of any service we provide. Your plan, your price and your website are exactly the same whether you tick this or not.",
  "Message frequency varies. Message and data rates may apply. Reply STOP to cancel, HELP for help.",
].join(" ");

/**
 * Bumped whenever the wording above changes materially. Lets a record say
 * which version of the disclosure the person actually saw, which is the
 * question that matters if a consent is ever questioned.
 */
export const CONSENT_VERSION = "2026-10-14";

export interface ConsentInput {
  name: string;
  business?: string;
  phone: string;
  /** Must be true. A false or absent value is a form that was not opted in. */
  consent?: boolean;
  /** Honeypot, same as the lead form. Real people never see it. */
  website?: string;
}

export interface StoredConsent {
  name: string;
  business?: string;
  /** Digits only, so two spellings of one number are one number. */
  phone: string;
  /** As typed, for reading back. The normalised form is what gets compared. */
  phoneAsGiven: string;
  consent: true;
  /** What was on the screen, verbatim. The whole point of the record. */
  label: string;
  disclosure: string;
  version: string;
  at: Date;
  userAgent?: string;
}

export type ConsentErrors = Partial<Record<keyof ConsentInput, string>>;

const MAX = { name: 120, business: 160, phone: 40 } as const;

/** Digits only. A US mobile is ten of them, or eleven starting with a 1. */
export function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

function looksLikeUsMobile(value: string): boolean {
  const digits = digitsOf(value);
  if (digits.length === 11) return digits.startsWith("1");
  return digits.length === 10;
}

export function validateConsent(input: Partial<ConsentInput>): ConsentErrors {
  const errors: ConsentErrors = {};

  const name = (input.name ?? "").trim();
  if (name.length < 2) {
    errors.name = "We need a name to match this to your account.";
  } else if (name.length > MAX.name) {
    errors.name = "That is longer than we can store.";
  }

  const business = (input.business ?? "").trim();
  if (business.length > MAX.business) {
    errors.business = "That is longer than we can store.";
  }

  const phone = (input.phone ?? "").trim();
  if (!phone) {
    errors.phone = "The alerts need a mobile number to go to.";
  } else if (phone.length > MAX.phone) {
    errors.phone = "That is longer than a phone number.";
  } else if (!looksLikeUsMobile(phone)) {
    errors.phone = "Ten digits, including the area code.";
  }

  // The one field that is allowed to block the form. Submitting this page
  // with the box empty is not a decision we should record either way: there
  // is nothing to store and nothing to turn on.
  if (input.consent !== true) {
    errors.consent = "Tick the box if you want the alerts turned on.";
  }

  return errors;
}

export function hasConsentErrors(errors: ConsentErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function looksLikeConsentSpam(input: Partial<ConsentInput>): boolean {
  return Boolean(input.website && input.website.trim().length > 0);
}

export function normalizeConsent(
  input: ConsentInput,
): Omit<StoredConsent, "at" | "userAgent"> {
  const business = (input.business ?? "").trim();

  return {
    name: input.name.trim(),
    ...(business ? { business } : {}),
    phone: digitsOf(input.phone),
    phoneAsGiven: input.phone.trim(),
    consent: true,
    label: CONSENT_LABEL,
    disclosure: CONSENT_DISCLOSURE,
    version: CONSENT_VERSION,
  };
}
