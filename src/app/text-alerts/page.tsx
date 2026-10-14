import type { Metadata } from "next";
import Link from "next/link";

import { Container, Eyebrow, Section } from "@/components/ui";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";

/**
 * The SMS programme terms.
 *
 * This page exists because a mobile carrier demanded it. Registering an A2P
 * 10DLC campaign requires three public urls: a privacy policy, a terms page
 * for the programme, and proof of how consent is collected. This page is the
 * second and third of those, which is why clause 12.6 is reproduced in full
 * rather than summarised - a reviewer has to be able to read the exact words
 * a client agrees to.
 *
 * It is linked from the privacy policy and from the footer, but it is not a
 * marketing page and nothing here is trying to sell anything. If it reads
 * like a compliance document that is because it is one.
 */

export const metadata: Metadata = {
  title: "Text alerts",
  description:
    "The terms of the lead alert text message programme: who receives messages, how often, how to stop them, and the clause clients agree to.",
  alternates: { canonical: "/text-alerts" },
};

/** Clause 12.6, word for word as it appears in the signed agreement. */
const CLAUSE = `If your plan includes lead alerts by text, you are asking us to text the mobile number you give us each time someone submits a form on your site. Those texts go only to you, never to the person who enquired. Standard message and data rates from your carrier may apply. Reply STOP to any of them and they stop, and tell us if the number changes. You can turn them off at any time by asking.`;

const facts = [
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
      "We do not charge you per message. Standard message and data rates from your own mobile carrier may apply.",
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

export default function TextAlertsPage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ---------- hero ---------- */}
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(1.5rem,1rem+2vw,2.5rem)]">
          <Container>
            <Eyebrow>Text alerts</Eyebrow>
            <h1 className="mt-3 max-w-[20ch] text-4xl">
              The terms of the lead alert text messages
            </h1>
            <p className="text-ink-2 measure mt-6 text-lg">
              A short page covering one small thing: the text message we send a
              client when an enquiry lands on their website. If you are reading
              this because you found it in a footer, it almost certainly does
              not apply to you.
            </p>
          </Container>
        </section>

        {/* ---------- who this is not for ---------- */}
        <Section divided>
          <Container>
            <div className="border-grow bg-grow-soft border-l-2 p-[clamp(1.25rem,1rem+1.5vw,2rem)]">
              <Eyebrow tone="grow">Before anything else</Eyebrow>
              <p className="text-ink-2 measure mt-4">
                If you have sent us an enquiry, or filled in a form on a site we
                built for somebody else,{" "}
                <span className="text-ink font-semibold">
                  you will never be texted by us.
                </span>{" "}
                This programme sends messages in one direction only: from us to
                a business owner, about their own enquiries, because they asked
                us in writing to do it.
              </p>
            </div>
          </Container>
        </Section>

        {/* ---------- the facts ---------- */}
        <Section divided>
          <Container>
            <Eyebrow>How the programme works</Eyebrow>
            <dl className="mt-8">
              {facts.map((fact) => (
                <div
                  key={fact.term}
                  className="border-rule grid gap-2 border-b py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] md:gap-8"
                >
                  <dt className="text-lg font-semibold tracking-tight">
                    {fact.term}
                  </dt>
                  <dd className="text-ink-2 m-0 text-sm leading-relaxed">
                    {fact.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </Section>

        {/* ---------- consent, which is the part carriers check ---------- */}
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
              Reply STOP to any message, or reach us directly. We are{" "}
              {site.legalName}, in Mokena, Illinois.
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
              What we do with the number itself is in the{" "}
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
