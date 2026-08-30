"use client";

import { useRef, useState } from "react";

import {
  BUDGET_OPTIONS,
  hasErrors,
  validateLead,
  type FieldErrors,
  type LeadInput,
} from "@/lib/leads";
import { site } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

const PATHS = [
  { value: "grow", label: "A website and getting found" },
  { value: "platform", label: "An application, portal or testing" },
  { value: "not sure", label: "Not sure yet" },
] as const;

const field =
  "border-rule bg-surface text-ink focus:border-ink w-full border px-3 py-2.5 text-base transition-colors duration-200 outline-none";

/**
 * The quote form.
 *
 * Validates on the client for instant feedback and again on the server, which
 * is the copy that actually enforces anything. On failure it always offers the
 * email address — a form that cannot submit must never be a dead end.
 */
export function LeadForm({ source }: { source?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const input: Partial<LeadInput> = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      business: String(data.get("business") ?? ""),
      path: data.get("path") as LeadInput["path"],
      budget: (data.get("budget") as LeadInput["budget"]) || undefined,
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
      source,
    };

    const clientErrors = validateLead(input);
    if (hasErrors(clientErrors)) {
      setErrors(clientErrors);
      setStatus("idle");
      // Move focus to the first problem rather than leaving it to be hunted.
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
      const res = await fetch("/api/leads", {
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
        <h3 className="text-2xl">That reached us.</h3>
        <p className="text-ink-2 mt-3 max-w-[46ch]">
          A confirmation is on its way to your inbox. You will get a real reply
          from a person, usually within one business day.
        </p>
        <p className="text-muted mt-4 text-sm">
          Nothing arrived? Email{" "}
          <a href={`mailto:${site.email}`} className="text-grow font-semibold">
            {site.email}
          </a>{" "}
          and it comes straight to the same place.
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

        <Field label="Email" name="email" error={errors.email} required>
          <input
            id="email"
            name="email"
            type="email"
            className={field}
            autoComplete="email"
          />
        </Field>

        <Field label="Phone" name="phone" error={errors.phone} optional>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={field}
            autoComplete="tel"
          />
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

      <Field label="What do you need?" name="path" error={errors.path}>
        <select id="path" name="path" className={field} defaultValue="not sure">
          {PATHS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Budget in mind" name="budget" optional>
        <select id="budget" name="budget" className={field} defaultValue="">
          <option value="">Prefer not to say</option>
          {BUDGET_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="About the project"
        name="message"
        error={errors.message}
        required
      >
        <textarea
          id="message"
          name="message"
          rows={5}
          className={`${field} resize-y`}
          placeholder="What you do, what you want to happen that is not happening now, and roughly when you would like it live."
        />
      </Field>

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
          {status === "sending" ? "Sending…" : "Send it →"}
        </button>
        <p className="text-muted text-sm">
          No newsletter, no CRM sequence. Just a reply.
        </p>
      </div>
    </form>
  );
}

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
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="label text-muted flex gap-2">
        {label}
        {required && <span className="text-grow">required</span>}
        {optional && <span className="text-rule-strong">optional</span>}
      </label>
      {children}
      {error && (
        <p className="text-fail text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
