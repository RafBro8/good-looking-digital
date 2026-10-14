import type { Metadata } from "next";
import Link from "next/link";

import { Container, Eyebrow, Section } from "@/components/ui";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SmsOptInForm } from "@/components/SmsOptInForm";
import { site } from "@/lib/site";

/**
 * The text alert opt-in page.
 *
 * Exists because the first version of this programme was rejected by the
 * carriers under code 30923: consent lived in clause 12.6 of the client
 * services agreement, which made agreeing to be texted a condition of buying
 * a website. That reading was correct, so the mechanism changed rather than
 * the description of it.
 *
 * A reviewer loads this url and has to be able to see, without a login:
 *
 *   - who sends the messages, what they say and how often
 *   - a checkbox that starts unchecked
 *   - the words "Message and data rates may apply." and the STOP instruction
 *   - that consent is not a condition of purchase, stated plainly
 *   - links to the privacy policy and the terms
 *
 * All five are covered by an e2e spec, because every one of them is a sentence
 * somebody could tidy away without anything appearing to break.
 */

export const metadata: Metadata = {
  title: "Turn on text alerts",
  description:
    "Optional text alerts for Good Looking Digital clients: a message to your phone each time someone enquires through your website. Not a condition of any service, and you can stop them at any time.",
  alternates: { canonical: "/text-alerts" },
};

const programme = [
  {
    term: "Who sends them",
    detail:
      "Good Looking Digital LLC, Mokena, Illinois. Messages come from one number, and that number is ours.",
  },
  {
    term: "What they say",
    detail:
      "That an enquiry has arrived on your site: who it is from, how to reach them, and a few words of what they wrote. The full message is in the email, as it always was.",
  },
  {
    term: "How often",
    detail:
      "One message per enquiry. For most businesses that is a few a week. There is no schedule, no digest and no marketing of any kind on this programme.",
  },
  {
    term: "What it costs",
    detail:
      "Nothing from us. Message frequency varies. Message and data rates may apply from your own carrier.",
  },
  {
    term: "How to stop them",
    detail:
      "Reply STOP to any message and they stop immediately. Reply HELP for our contact details. Or just email us and ask, which works the same.",
  },
  {
    term: "Who never gets texted",
    detail:
      "The people who fill in forms on your website. They are not on this programme and never will be. The alerts go to you about them, not to them.",
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
            <h1 className="mt-3 max-w-[24ch] text-4xl">
              Get a text when someone enquires
            </h1>
            <p className="text-ink-2 measure mt-6 text-lg">
              An email is easy to miss on a roof or under a sink. If you would
              rather your phone buzzed, this page turns that on. It is for
              existing {site.name} clients, and it is the only way onto the
              programme.
            </p>
          </Container>
        </section>

        {/* ---------- the part the carriers care about, and so should a client
             ---------- */}
        <Section divided>
          <Container>
            <div className="border-grow bg-grow-soft border-l-2 p-[clamp(1.25rem,1rem+1.5vw,2rem)]">
              <p className="text-ink measure text-lg font-semibold">
                This is optional, and it is separate from everything else.
              </p>
              <p className="text-ink-2 measure mt-4">
                Consent is not a condition of purchase or of any service we
                provide. Your website, your care plan and your price are
                identical whether you tick the box below or never open this page
                again. Signing our client services agreement does not sign you
                up to anything here, and nobody is added by us on your behalf.
              </p>
              <p className="text-ink-2 measure mt-4">
                Would rather just have the email? Then there is nothing to do.
                Close the page. The email alerts carry on exactly as they are,
                and we will not ask you about this again.
              </p>
            </div>
          </Container>
        </Section>

        {/* ---------- programme details ---------- */}
        <Section divided>
          <Container>
            <Eyebrow tone="platform">What you would be agreeing to</Eyebrow>
            <dl className="mt-8">
              {programme.map((row) => (
                <div
                  key={row.term}
                  className="border-rule grid gap-2 border-b py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] md:gap-8"
                >
                  <dt className="text-lg font-semibold tracking-tight">
                    {row.term}
                  </dt>
                  <dd className="text-ink-2 m-0 text-sm leading-relaxed">
                    {row.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </Section>

        {/* ---------- the form ---------- */}
        <Section divided>
          <Container>
            <Eyebrow>Turn them on</Eyebrow>
            <h2 className="mt-3 max-w-[22ch] text-3xl">
              Your number, and your permission
            </h2>
            <p className="text-ink-2 measure mt-5">
              Give us the mobile you want the alerts on. It does not have to be
              the number on your website, and we do not use it for anything
              else.
            </p>

            <div className="mt-9 max-w-[52rem]">
              <SmsOptInForm />
            </div>
          </Container>
        </Section>

        {/* ---------- the number itself ---------- */}
        <Section divided>
          <Container>
            <Eyebrow tone="platform">What happens to the number</Eyebrow>
            <p className="text-ink-2 measure mt-4">
              It is stored with the date, and with a copy of the exact words you
              ticked, so the record says what was agreed rather than just that
              something was. It is used to send you your own enquiry alerts and
              nothing else. We do not sell or share your SMS opt-in data or
              personal information with third parties for marketing purposes.
            </p>
            <p className="text-ink-2 measure mt-6">
              The full detail is in the{" "}
              <Link href="/privacy" className="underline">
                privacy policy
              </Link>
              , and the programme terms are under SMS Terms in the{" "}
              <Link href="/terms" className="underline">
                terms of service
              </Link>
              .
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
          </Container>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
