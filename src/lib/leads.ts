/**
 * Lead shape, validation, and the rules that keep junk out.
 *
 * Validation lives here rather than in the route so the same rules run on the
 * client for instant feedback and on the server for actual enforcement. Client
 * validation is a courtesy; the server copy is the one that matters.
 */

export const PATH_OPTIONS = ["grow", "platform", "not sure"] as const;
export type LeadPath = (typeof PATH_OPTIONS)[number];

export const BUDGET_OPTIONS = [
  "Not sure yet",
  "Under $2,000",
  "$2,000 - $5,000",
  "$5,000 - $15,000",
  "$15,000+",
] as const;
export type LeadBudget = (typeof BUDGET_OPTIONS)[number];

/**
 * What the person says brought them here.
 *
 * Optional, and deliberately short. Asking is cruder than reading a referrer
 * and far more complete: it is the only thing that catches a recommendation
 * from a past client, or somebody who saw the business somewhere and searched
 * for it a week later, both of which every analytics tool records as "Google".
 *
 * At ten enquiries a year the answers can simply be read. That is the whole
 * reason this is a question on a form rather than a tracking script.
 */
export const HEARD_FROM_OPTIONS = [
  "Google",
  "Facebook",
  "Someone recommended me",
  "Scanned a QR code",
  "Other",
] as const;
export type LeadHeardFrom = (typeof HEARD_FROM_OPTIONS)[number];

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  business?: string;
  path: LeadPath;
  budget?: LeadBudget;
  message: string;
  /** Honeypot. Real people never see it, so anything here is a bot. */
  website?: string;
  /** Where the visitor came from - a QR code, a page, a campaign. */
  source?: string;
  /**
   * What they say brought them here. Kept separate from `source`, which the
   * page sets automatically: the two will sometimes disagree, and that
   * disagreement is itself worth seeing.
   */
  heardFrom?: LeadHeardFrom;
  /** Their own words, and only meaningful when heardFrom is "Other". */
  heardFromOther?: string;
}

export type FieldErrors = Partial<Record<keyof LeadInput, string>>;

const MAX = {
  name: 120,
  email: 200,
  phone: 40,
  business: 160,
  message: 4000,
  source: 120,
  heardFromOther: 120,
} as const;

/**
 * Deliberately permissive. An address either routes or it does not, and a
 * clever regex mostly rejects real people with unusual addresses.
 */
function looksLikeEmail(value: string): boolean {
  if (value.length > MAX.email) return false;
  const at = value.indexOf("@");
  if (at < 1 || at !== value.lastIndexOf("@")) return false;
  const domain = value.slice(at + 1);
  return (
    domain.length > 2 &&
    domain.includes(".") &&
    !domain.startsWith(".") &&
    !domain.endsWith(".") &&
    !/\s/.test(value)
  );
}

export function validateLead(input: Partial<LeadInput>): FieldErrors {
  const errors: FieldErrors = {};

  const name = (input.name ?? "").trim();
  if (!name) errors.name = "Please tell us your name.";
  else if (name.length > MAX.name) errors.name = "That name is too long.";

  const email = (input.email ?? "").trim();
  if (!email) errors.email = "We need an email address to reply to.";
  else if (!looksLikeEmail(email))
    errors.email = "That does not look like an email address.";

  const phone = (input.phone ?? "").trim();
  if (phone.length > MAX.phone) errors.phone = "That phone number is too long.";

  const business = (input.business ?? "").trim();
  if (business.length > MAX.business)
    errors.business = "That business name is too long.";

  const message = (input.message ?? "").trim();
  if (!message) errors.message = "Tell us a little about the project.";
  else if (message.length < 10)
    errors.message = "A sentence or two would help - what needs doing?";
  else if (message.length > MAX.message)
    errors.message = "That is longer than we can accept. Trim it a little.";

  if (input.path && !PATH_OPTIONS.includes(input.path))
    errors.path = "Pick one of the options.";

  /**
   * Note what is deliberately absent: choosing "Other" and typing nothing is
   * not an error. The question is optional, and blocking a submission over an
   * unanswered nicety would trade an enquiry for a data point. "Other" with no
   * detail still says "none of the channels I know about", which is useful.
   */
  if (input.heardFrom && !HEARD_FROM_OPTIONS.includes(input.heardFrom))
    errors.heardFrom = "Pick one of the options.";

  const heardFromOther = (input.heardFromOther ?? "").trim();
  if (heardFromOther.length > MAX.heardFromOther)
    errors.heardFromOther = "Keep that one short.";

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** A filled honeypot means a bot. Never tell it that we noticed. */
export function looksLikeSpam(input: Partial<LeadInput>): boolean {
  return Boolean((input.website ?? "").trim());
}

export interface StoredLead extends Omit<LeadInput, "website"> {
  receivedAt: Date;
  userAgent?: string;
  /**
   * Set when someone has actually dealt with this enquiry. Absent means
   * nobody has, which is the whole basis of the follow-up reminder: the
   * question "has this gone cold" has to be answerable without a human
   * remembering to record anything they did not already have to do.
   */
  respondedAt?: Date;
  /** Set when the reminder went out, so it goes out once and not every hour. */
  remindedAt?: Date;
}

/** Trim and clamp before anything reaches the database or an inbox. */
export function normalizeLead(
  input: LeadInput,
): Omit<StoredLead, "receivedAt"> {
  const clamp = (value: string | undefined, max: number) =>
    (value ?? "").trim().slice(0, max) || undefined;

  return {
    name: (input.name ?? "").trim().slice(0, MAX.name),
    email: (input.email ?? "").trim().slice(0, MAX.email),
    phone: clamp(input.phone, MAX.phone),
    business: clamp(input.business, MAX.business),
    path: PATH_OPTIONS.includes(input.path) ? input.path : "not sure",
    budget: input.budget,
    message: (input.message ?? "").trim().slice(0, MAX.message),
    source: clamp(input.source, MAX.source),
    heardFrom: HEARD_FROM_OPTIONS.includes(input.heardFrom as LeadHeardFrom)
      ? (input.heardFrom as LeadHeardFrom)
      : undefined,
    // Dropped unless "Other" is the answer. Somebody who types a note, then
    // changes their mind and picks Google, should not have the orphaned text
    // stored against an answer it no longer belongs to.
    heardFromOther:
      input.heardFrom === "Other"
        ? clamp(input.heardFromOther, MAX.heardFromOther)
        : undefined,
  };
}
