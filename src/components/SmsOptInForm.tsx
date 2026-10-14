"use client";

import Link from "next/link";
import { cloneElement, isValidElement, useRef, useState } from "react";

import {
  CONSENT_DISCLOSURE,
  CONSENT_LABEL,
  hasConsentErrors,
  validateConsent,
  type ConsentErrors,
  type ConsentInput,
} from "@/lib/consent";
import { site } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "border-rule bg-surface text-ink focus:border-ink w-full border px-3 py-2.5 text-base transition-colors duration-200 outline-none";

/**
 * The text alert opt-in form.
 *
 * Three things about it are requirements rather than choices, and each one is
 * the reason a carrier rejected the first version of this programme:
 *
 *   the box starts unchecked, with no defaultChecked and no prefill from
 *   anywhere. A preselected consent box is named explicitly as a rejection
 *   cause.
 *
 *   the disclosure is rendered from the same constant the API stores, so the
 *   record and the screen cannot drift apart.
 *
 *   the box is the only field allowed to block submission, and the page says
 *   plainly that not filling this in costs the client nothing. Consent has to
 *   be refusable to be consent.
 */
export function SmsOptInForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ConsentErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const input: Partial<ConsentInput> = {
      name: String(data.get("name") ?? ""),
      business: String(data.get("business") ?? ""),
      phone: String(data.get("phone") ?? ""),
      consent: data.get("consent") === "yes",
      website: String(data.get("website") ?? ""),
    };

    const clientErrors = validateConsent(input);
    if (hasConsentErrors(clientErrors)) {
      setErrors(clientErrors);
      setStatus("idle");
      const firstKey = Object.keys(clientErrors)[0];
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${firstKey}"]`)
        ?.focus();
      return;
    }

    setErrors({});
    setStatus("sending");
    setMessage(null);

    try {
      const res = await fetch("/api/text-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await res.json().catch(() => ({}));

      if (res.ok && payload.ok) {
        setStatus("sent");
        return;
      }

      if (payload.errors) {
        setErrors(payload.errors);
        setStatus("idle");
        return;
      }

      setStatus("error");
      setMessage(payload.message ?? "Something went wrong at our end.");
    } catch {
      setStatus("error");
      setMessage("We could not reach the server. Your connection, or ours.");
    }
  }

  if (status === "sent") {
    return (
      <div
        className="border-grow bg-grow-soft border-l-2 p-6"
        role="status"
        aria-live="polite"
      >
        <h3 className="text-2xl">Recorded.</h3>
        <p className="text-ink-2 mt-3 max-w-[48ch]">
          We have your number and a copy of exactly what you agreed to. A person
          checks it against your account before the alerts start, so give it a
          day rather than expecting a test message now.
        </p>
        <p className="text-muted mt-4 text-sm">
          Changed your mind in the meantime? Reply STOP to any message, or email{" "}
          <a href={`mailto:${site.email}`} className="text-grow font-semibold">
            {site.email}
          </a>{" "}
          and it is off.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5">
      {/* Honeypot. Hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" error={errors.name} required>
          <input id="name" name="name" className={field} autoComplete="name" />
        </Field>

        <Field
          label="Business name"
          name="business"
          error={errors.business}
          optional
        >
          <input id="business" name="business" className={field} />
        </Field>
      </div>

      <Field
        label="Mobile number for the alerts"
        name="phone"
        error={errors.phone}
        required
      >
        <input
          id="phone"
          name="phone"
          type="tel"
          className={field}
          autoComplete="tel"
          placeholder="630 400 8748"
        />
      </Field>

      {/* The consent itself. Unchecked, unprefilled, and sitting above the
          disclosure it refers to rather than below it, so nobody ticks a box
          whose terms are further down the page than the button. */}
      <fieldset className="border-rule-strong mt-2 border-l-2 pl-5">
        <legend className="label text-muted">
          Your consent
          <span className="text-rule-strong ml-2">optional</span>
        </legend>

        <label
          htmlFor="consent"
          className="mt-3 flex cursor-pointer items-start gap-3"
        >
          <input
            id="consent"
            name="consent"
            type="checkbox"
            value="yes"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="accent-grow mt-1 h-5 w-5 shrink-0"
          />
          <span className="text-ink text-base font-semibold">
            {CONSENT_LABEL}
          </span>
        </label>

        {errors.consent && (
          <p id="consent-error" className="text-fail mt-2 text-sm" role="alert">
            {errors.consent}
          </p>
        )}

        <p className="text-ink-2 mt-4 max-w-[62ch] text-sm leading-relaxed">
          {CONSENT_DISCLOSURE}
        </p>

        <p className="text-muted mt-3 text-sm">
          <Link href="/terms" className="hover:text-ink underline">
            Terms of Service
          </Link>
          {" and "}
          <Link href="/privacy" className="hover:text-ink underline">
            Privacy Policy
          </Link>
          .
        </p>
      </fieldset>

      {status === "error" && message && (
        <div
          className="border-fail text-ink border-l-2 py-2 pl-4 text-sm"
          role="alert"
        >
          {message} You can always email{" "}
          <a href={`mailto:${site.email}`} className="font-semibold underline">
            {site.email}
          </a>
          .
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-grow text-grow-ink px-7 py-3.5 text-sm font-bold transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
        >
          {status === "sending" ? "Saving..." : "Turn the alerts on"}
        </button>
        <p className="text-muted text-sm">
          Nothing is sent to your phone until a person has checked this.
        </p>
      </div>
    </form>
  );
}

/**
 * Wraps one control with its label and error. Same wiring as the lead form:
 * aria-invalid marks the control, aria-describedby ties the message to it,
 * and aria-required states the fact without handing validation to the browser
 * and losing our wording.
 *
 * The consent checkbox does not use this. It sits inside its own label, which
 * cloneElement here cannot reach, so it carries the three attributes itself.
 */
function Field({
  label,
  name,
  error,
  required,
  optional,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const errorId = `${name}-error`;

  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
        "aria-required": required ? true : undefined,
      })
    : children;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="label text-muted flex gap-2">
        {label}
        {required && <span className="text-grow">required</span>}
        {optional && <span className="text-rule-strong">optional</span>}
      </label>
      {control}
      {error && (
        <p id={errorId} className="text-fail text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
