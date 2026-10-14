import type { Metadata } from "next";
import Link from "next/link";

import { Container, Eyebrow, Section } from "@/components/ui";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";

/**
 * Terms of Service.
 *
 * Two jobs. The first is the ordinary one: a business selling websites should
 * have terms covering its own, and this site had none.
 *
 * The second is a mobile carrier requirement. Registering an A2P 10DLC
 * campaign means a reviewer checks that the terms page is titled "Terms of
 * Service" or "Terms & Conditions", carries an SMS Terms section, states the
 * rates disclosure in the canonical wording, and names the registered brand.
 * All four are load-bearing and all four are covered by an e2e spec.
 *
 * SMS Terms reproduces clause 12.6 of the client services agreement in full
 * rather than summarising it, because the opt-in proof field points here and
 * a reviewer has to read the exact words a client agrees to.
 */

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for using goodlookingdigital.com, and the SMS terms of the lead alert programme: who receives messages, how often, and how to stop them.",
  alternates: { canonical: "/terms" },
};

/** Clause 12.6, word for word as it appears in the signed agreement. */
const CLAUSE = `If your plan includes lead alerts by text, you are asking us to text the mobile number you give us each time someone submits a form on your site. Those texts go only to you, never to the person who enquired. Standard message and data rates from your carrier may apply. Reply STOP to any of them and they stop, and tell us if the number changes. You can turn them off at any time by asking.`;

const siteTerms = [
  {
    term: "This site is information, not an offer",
    detail:
      "Prices and descriptions here tell you what we do and roughly what it costs. They are not a quote and not a contract. A quote is a written Statement of Work, and nothing is agreed until both of us have signed one.",
  },
  {
    term: "Sending an enquiry does not hire us",
    detail:
      "Using the contact form starts a conversation. The work itself is governed by our client services agreement, which you would read and sign before anything begins.",
  },
  {
    term: "What is ours",
    detail:
      "The words, design and code of this site are ours. The demonstration sites we link to are ours or our clients', and the logos and stock photography in them belong to whoever owns them.",
  },
  {
    term: "No warranty on the site itself",
    detail:
      "We keep this site accurate and online, but it is published as it stands. What we warrant about work we do for you is set out in the agreement, not here.",
  },
  {
    term: "Governing law",
    detail:
      "Illinois, and any dispute belongs in the courts of Will County. The same as the client services agreement, so the two never disagree.",
  },
];

const smsFacts = [
  {
    term: "Who gets messages",
    detail:
      "Only our own clients, and only those whose plan includes lead alerts. Never the people who fill in a form on a client's website, and never anyone who contacts us.",
  },
  {
    term: "What the messages say",
    detail:
      "That an enquiry has arrived on your site, who it is from, how to reach them, and the first line of what they wrote. Nothing else is ever sent on this programme.",
  },
  {
    term: "How often",
    detail:
      "One message per enquiry. For most businesses that is a few a week. There is no schedule, no digest and no marketing.",
  },
  {
    term: "Cost",
    detail:
      "We do not charge you per message. Your own mobile carrier may charge you at its usual rates.",
  },
  {
    term: "Stopping them",
    detail:
      "Reply STOP to any message and they stop immediately. You can also just ask us. Reply HELP for contact details.",
  },
  {
    term: "Carriers",
    detail:
      "Carriers are not liable for delayed or undelivered messages.",
  },
];

function Facts({ rows }: { rows: { term: string; detail: string }[] }) {
  return (
    <dl className="mt-8">
      {rows.map((row) => (
        <div
          key={row.term}
          className="border-rule grid gap-2 border-b py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] md:gap-8"
        >
          <dt className="text-lg font-semibold tracking-tight">{row.term}</dt>
          <dd className="text-ink-2 m-0 text-sm leading-relaxed">
            {row.detail}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function TermsPage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ---------- hero ---------- */}
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(1.5rem,1rem+2vw,2.5rem)]">
          <Container>
            <Eyebrow>Terms of Service</Eyebrow>
            <h1 className="mt-3 max-w-[20ch] text-4xl">
              Terms of Service
            </h1>
            <p className="text-ink-2 measure mt-6 text-lg">
              Short, because there is not much to say about a website that
              tells you what we do. The terms that matter are in the agreement
              you would sign before any work starts. {site.legalName}, Mokena,
              Illinois.
            </p>
          </Container>
        </section>

        {/* ---------- using the site ---------- */}
        <Section divided>
          <Container>
            <Eyebrow>Using this site</Eyebrow>
            <Facts rows={siteTerms} />
          </Container>
        </Section>

        {/* ---------- sms terms ---------- */}
        <Section divided>
          <Container>
            <Eyebrow tone="platform">SMS Terms</Eyebrow>
            <h2 className="mt-3 max-w-[22ch] text-3xl">
              The lead alert text messages
            </h2>

            <div className="border-grow bg-grow-soft mt-7 border-l-2 p-[clamp(1.25rem,1rem+1.5vw,2rem)]">
              <p className="text-ink-2 measure">
                If you have sent us an enquiry, or filled in a form on a site
                we built for somebody else,{" "}
                <span className="text-ink font-semibold">
                  you will never be texted by us.
                </span>{" "}
                This programme sends messages in one direction only: from{" "}
                {site.legalName} to a business owner, about their own
                enquiries, because they asked us in writing to do it.
              </p>
            </div>

            <Facts rows={smsFacts} />

            {/* The canonical disclosure wording. The carriers check for this
                phrase; "standard message and data rates from your carrier may
                apply" reads better and does not satisfy them. Both appear on
                this page, which is allowed - this one must not be reworded. */}
            <p className="text-ink measure mt-8 font-semibold">
              Message and data rates may apply.
            </p>
          </Container>
        </Section>

        {/* ---------- consent ---------- */}
        <Section divided>
          <Container>
            <Eyebrow tone="platform">How consent is given</Eyebrow>
            <p className="text-ink-2 measure mt-4">
              In writing, by signing our client services agreement. There is no
              tick box, no keyword to text, and no way to end up on this
              programme by accident. The clause below is clause 12.6 of that
              agreement, reproduced word for word.
            </p>

            <figure className="border-rule-strong bg-surface-2 mt-8 max-w-[68ch] border-l-2 p-[clamp(1.25rem,1rem+1.5vw,2rem)]">
              <figcaption className="label text-muted">
                Client services agreement, clause 12.6
              </figcaption>
              <p className="font-display mt-4 text-lg leading-relaxed">
                <span className="font-semibold">
                  Text alerts, if you ask for them.
                </span>{" "}
                {CLAUSE}
              </p>
            </figure>

            <p className="text-ink-2 measure mt-8">
              Signed agreements are kept on file as the record of consent. A
              client who has not signed one does not receive messages, and a
              client who asks us to stop is removed the same day.
            </p>
          </Container>
        </Section>

        {/* ---------- contact ---------- */}
        <Section divided>
          <Container>
            <Eyebrow>Questions, or to stop messages</Eyebrow>
            <p className="text-ink-2 measure mt-4">
              Reply STOP to any message, or reach us directly.
            </p>
            <p className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <a
                href={site.phoneHref}
                className="text-ink hover:text-grow text-lg font-semibold transition-colors duration-200"
              >
                {site.phone}
              </a>{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-ink hover:text-grow text-lg font-semibold [overflow-wrap:anywhere] transition-colors duration-200"
              >
                {site.email}
              </a>
            </p>
            <p className="text-ink-2 mt-8 text-sm">
              What we do with the number itself, and everything else we
              collect, is in the{" "}
              <Link href="/privacy" className="underline">
                privacy policy
              </Link>
              .
            </p>
          </Container>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
