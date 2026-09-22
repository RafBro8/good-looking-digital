import type { Metadata } from "next";
import Link from "next/link";

import { Container, Eyebrow } from "@/components/ui";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Good Looking Digital collects when you use this site, why, who processes it, and what we never do with it. No cookies, no tracking scripts, and nothing loaded from a third party.",
};

/**
 * The privacy notice.
 *
 * Written against the code rather than from a template, and every claim here
 * is checkable: the form fields are in src/lib/leads.ts, the storage is in
 * src/app/api/leads/route.ts, and the only live outbound call is the Resend
 * one in src/lib/notify.ts. If any of that changes, this page changes with it
 * - a policy describing behaviour the software does not have is the same
 * failure as a test panel describing tests that do not exist.
 *
 * notify.ts also contains a Twilio path that texts the owner. It is dormant:
 * it returns before any network call unless all four TWILIO_ and LEAD_SMS_
 * variables are set, and none are in production. It was listed here as a
 * processor once, which described something that was not happening. If those
 * variables are ever set, add Twilio back to the processors below first.
 */

const UPDATED = "18 September 2026";

const collected = [
  {
    field: "Your name",
    required: true,
    why: "So we can reply to a person rather than an address.",
  },
  {
    field: "Email address",
    required: true,
    why: "To send the confirmation and to answer you.",
  },
  {
    field: "Phone number",
    required: false,
    why: "Only if you would rather be called than emailed.",
  },
  {
    field: "Business name",
    required: false,
    why: "Context, so the reply is about your situation.",
  },
  {
    field: "What you need, and budget",
    required: false,
    why: "To tell you honestly whether we are a fit before either of us spends time.",
  },
  {
    field: "Your message",
    required: true,
    why: "It is the enquiry.",
  },
];

const processors = [
  {
    name: "Vercel",
    role: "Hosts this website and runs the code that receives your enquiry.",
  },
  {
    name: "MongoDB Atlas",
    role: "Stores enquiries, on servers in the United States.",
  },
  {
    name: "Resend",
    role: "Delivers the notification to us, the confirmation to you, and our own follow-up reminder to us.",
  },
  {
    name: "Google Workspace",
    role: "Our email. Your message ends up in an inbox there once we are notified.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(1.5rem,1rem+2vw,2.5rem)]">
          <Container>
            <p className="label text-muted flex items-center gap-3 before:block before:h-px before:w-7 before:bg-[var(--grow)] before:content-['']">
              Last updated {UPDATED}
            </p>
            <h1 className="mt-7 max-w-[16ch] text-5xl">
              What we collect, and what we never do with it
            </h1>
            <p className="text-ink-2 mt-8 max-w-[52ch] text-xl">
              Short, specific, and true. Everything below describes what this
              site actually does - you can check it against the source, which is
              public.
            </p>
          </Container>
        </section>

        {/* ---------- the short version ---------- */}
        <section className="border-rule border-t py-[clamp(2.25rem,1.5rem+3vw,3.75rem)]">
          <Container>
            <div className="border-grow bg-grow-soft border-l-2 p-[clamp(1.25rem,1rem+1.5vw,2rem)]">
              <Eyebrow tone="grow">The short version</Eyebrow>
              <ul className="mt-5 grid gap-3">
                {[
                  "We collect what you type into the contact form, plus the ordinary technical details every website receives.",
                  "We use it to reply to you. That is the whole purpose.",
                  "We never sell it, rent it, or share it for anyone else's marketing.",
                  "There are no cookies and no tracking scripts on this site.",
                  "Ask us what we hold and we will tell you. Ask us to delete it and we will.",
                ].map((line) => (
                  <li
                    key={line}
                    className="text-ink-2 grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3"
                  >
                    <span aria-hidden="true" className="text-grow">
                      →
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        {/* ---------- who we are ---------- */}
        <section className="border-rule border-t py-[clamp(2.25rem,1.5rem+3vw,3.75rem)]">
          <Container>
            <div className="grid gap-[clamp(1.5rem,1rem+3vw,4rem)] lg:grid-cols-[14rem_minmax(0,1fr)]">
              <Eyebrow>Who we are</Eyebrow>
              <div className="grid max-w-[62ch] gap-4">
                <p className="text-ink-2">
                  {site.name} is a web design and software business, and is
                  responsible for the information described on this page.
                </p>
                <p className="text-ink-2">
                  If you want anything on this page explained, or you want to
                  know what we hold about you, email{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-grow font-semibold"
                  >
                    {site.email}
                  </a>{" "}
                  or call{" "}
                  <a href={site.phoneHref} className="text-grow font-semibold">
                    {site.phone}
                  </a>
                  . A person answers.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* ---------- what you give us ---------- */}
        <section className="border-rule border-t py-[clamp(2.25rem,1.5rem+3vw,3.75rem)]">
          <Container>
            <Eyebrow>What you give us</Eyebrow>
            <h2 className="mt-3 max-w-[22ch] text-3xl">
              Only what is in the contact form
            </h2>
            <p className="text-ink-2 measure mt-4">
              There is one form on this site. These are all of its fields, and
              why each one exists.
            </p>

            <div className="mt-9 max-w-[52rem]">
              {collected.map((item) => (
                <div
                  key={item.field}
                  className="border-rule grid gap-x-6 gap-y-1 border-b py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-semibold tracking-tight">
                      {item.field}
                    </span>
                    <span className="label text-muted">
                      {item.required ? "required" : "optional"}
                    </span>
                  </div>
                  <p className="text-ink-2 text-sm leading-relaxed">
                    {item.why}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-ink-2 measure mt-8">
              Once your enquiry is here, we add two notes of our own:{" "}
              <strong>whether it has been answered</strong> and{" "}
              <strong>whether we have reminded ourselves to answer it</strong>.
              Nothing about you - they exist so an enquiry cannot quietly go
              unanswered, which is the failure this whole form is meant to
              prevent. The reminder goes to us. You are never emailed because we
              were slow.
            </p>
            <p className="text-ink-2 measure mt-4">
              We also record <strong>when</strong> the enquiry arrived and the{" "}
              <strong>browser identification string</strong> your device sends
              with every request. That second one tells us whether the form is
              being used on a phone or a desktop, which is how we know the site
              works for the people using it.
            </p>
            <p className="text-ink-2 measure mt-4">
              To stop the form being abused, we briefly note the{" "}
              <strong>network address</strong> a submission came from so the
              same source cannot send hundreds of messages an hour.{" "}
              <strong>
                Those records delete themselves automatically after one hour
              </strong>{" "}
              and are never connected to your enquiry.
            </p>
            <p className="text-ink-2 measure mt-4">
              And like every website, this one runs on a host, and the host
              keeps an ordinary record of requests - which page, when, from
              which network address, and which browser. We can see those
              records, and they tell us roughly how busy the site is. We do not
              use them to work out who you are, we do not connect them to your
              enquiry, and we do not run any analytics service on top of them.
            </p>
          </Container>
        </section>

        {/* ---------- what we do not do ---------- */}
        <section className="border-rule border-t py-[clamp(2.25rem,1.5rem+3vw,3.75rem)]">
          <Container>
            <div className="grid gap-[clamp(2rem,1rem+4vw,4.5rem)] lg:grid-cols-2">
              <div>
                <Eyebrow tone="platform">What we do not do</Eyebrow>
                <h2 className="mt-3 max-w-[18ch] text-3xl">
                  The list most sites cannot write
                </h2>
                <p className="text-ink-2 mt-5 max-w-[42ch]">
                  Nothing on these pages is loaded from anywhere else. Even the
                  fonts are served from our own domain, so no other company
                  learns that you visited.
                </p>
              </div>

              <ul className="border-rule-strong border-t-2 pt-4">
                {[
                  "We set no cookies. Not one, of any kind.",
                  "We run no analytics service, and no tracking scripts of any kind.",
                  "There are no advertising pixels, and no social network buttons that report back.",
                  "We load no third-party scripts, fonts, or images.",
                  "We do not sell, rent, or trade your information.",
                  "We do not add you to a newsletter or a marketing sequence.",
                  "We do not build a profile of you, or track you between visits.",
                  "We never text you.",
                ].map((line) => (
                  <li
                    key={line}
                    className="border-rule text-ink-2 grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 border-b py-3 text-sm"
                  >
                    <span aria-hidden="true" className="text-platform">
                      -
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        {/* ---------- processors ---------- */}
        <section className="border-rule border-t py-[clamp(2.25rem,1.5rem+3vw,3.75rem)]">
          <Container>
            <Eyebrow>Who else handles it</Eyebrow>
            <h2 className="mt-3 max-w-[24ch] text-3xl">
              Four companies, each doing one job
            </h2>
            <p className="text-ink-2 measure mt-4">
              Some of the machinery behind the site belongs to other companies.
              These are the only ones your enquiry passes through, and each is
              named so you can read their terms if you want to. None of them is
              permitted to use your information for their own purposes.
            </p>

            <div className="mt-9 max-w-[52rem]">
              {processors.map((processor) => (
                <div
                  key={processor.name}
                  className="border-rule grid gap-x-6 gap-y-1 border-b py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
                >
                  <span className="font-semibold tracking-tight">
                    {processor.name}
                  </span>
                  <p className="text-ink-2 text-sm leading-relaxed">
                    {processor.role}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ---------- keeping and deleting ---------- */}
        <section className="border-rule border-t py-[clamp(2.25rem,1.5rem+3vw,3.75rem)]">
          <Container>
            <div className="grid gap-[clamp(1.5rem,1rem+3vw,4rem)] lg:grid-cols-[14rem_minmax(0,1fr)]">
              <Eyebrow>How long we keep it</Eyebrow>
              <div className="grid max-w-[62ch] gap-4">
                <p className="text-ink-2">
                  Enquiries are kept for as long as they are useful - a
                  conversation that goes quiet in March can matter in October,
                  and we would rather remember who you are than ask you to
                  explain yourself twice.
                </p>
                <p className="text-ink-2">
                  We are not going to pretend there is an automatic timer,
                  because there is not one.{" "}
                  <strong>
                    Ask us to delete your enquiry and we will remove it, and
                    confirm that we have, within thirty days.
                  </strong>{" "}
                  The only records that expire on their own are the abuse
                  prevention ones described above, which go after an hour.
                </p>
                <p className="text-ink-2">
                  If we work together, project information is covered by the
                  agreement we sign rather than by this page.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* ---------- your browser ---------- */}
        <section className="border-rule border-t py-[clamp(2.25rem,1.5rem+3vw,3.75rem)]">
          <Container>
            <div className="grid gap-[clamp(1.5rem,1rem+3vw,4rem)] lg:grid-cols-[14rem_minmax(0,1fr)]">
              <Eyebrow>Stored on your device</Eyebrow>
              <div className="grid max-w-[62ch] gap-4">
                <p className="text-ink-2">
                  One thing, and it never leaves your browser. If you use the
                  light and dark switch, we remember which you chose so the site
                  does not change under you on your next visit.
                </p>
                <p className="text-ink-2">
                  It is not a cookie, it is not sent to us, and it contains one
                  word. Clearing your browser data removes it.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* ---------- rights + security ---------- */}
        <section className="border-rule border-t py-[clamp(2.25rem,1.5rem+3vw,3.75rem)]">
          <Container>
            <div className="grid gap-[clamp(2rem,1rem+4vw,4.5rem)] lg:grid-cols-2">
              <div className="grid gap-4">
                <Eyebrow tone="grow">What you can ask for</Eyebrow>
                <p className="text-ink-2 max-w-[44ch]">
                  Email{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-grow font-semibold"
                  >
                    {site.email}
                  </a>{" "}
                  and ask us to send you everything we hold about you, correct
                  something that is wrong, or delete it entirely. We will do it
                  within thirty days, and we will not ask you why.
                </p>
                <p className="text-ink-2 max-w-[44ch]">
                  You do not need to quote a regulation at us. Asking is enough.
                </p>
              </div>

              <div className="grid gap-4">
                <Eyebrow tone="platform">How it is protected</Eyebrow>
                <p className="text-ink-2 max-w-[44ch]">
                  Everything travels over an encrypted connection. This site
                  refuses unencrypted requests outright, and the database
                  connection cannot be made in the clear. Our database provider
                  encrypts what it stores.
                </p>
                <p className="text-ink-2 max-w-[44ch]">
                  The account our website uses to reach the database can read
                  and write enquiries and nothing else - it cannot reach any
                  other data, even if the credentials leaked.
                </p>
                <p className="text-ink-2 max-w-[44ch]">
                  No system is perfect. If something goes wrong that affects
                  you, we will tell you what happened rather than hope you do
                  not notice.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* ---------- closing ---------- */}
        <section className="border-rule border-t py-[clamp(2.25rem,1.5rem+3vw,4rem)]">
          <Container>
            <div className="grid gap-6">
              <div className="grid max-w-[62ch] gap-4">
                <Eyebrow>Children, and changes</Eyebrow>
                <p className="text-ink-2">
                  This site is for businesses. It is not aimed at children, and
                  we do not knowingly collect anything from anyone under
                  sixteen.
                </p>
                <p className="text-ink-2">
                  If this notice changes we will change the date at the top. If
                  a change actually affects what happens to your information, we
                  will say what changed rather than quietly reissue the page.
                </p>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-8 pt-4">
                <p className="text-muted max-w-[46ch] text-sm">
                  Questions about any of this go to the same place everything
                  else does.
                </p>
                <Link
                  href="/contact"
                  className="bg-grow text-grow-ink px-7 py-4 text-sm font-bold whitespace-nowrap transition-opacity duration-200 hover:opacity-90"
                >
                  Ask us →
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
