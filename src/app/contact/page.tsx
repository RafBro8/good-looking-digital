import type { Metadata } from "next";

import { Container, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LeadForm } from "@/components/LeadForm";
import { serviceArea, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Tell us what your business needs to do. Websites and local marketing for small businesses, custom applications and test automation for companies that outgrew theirs.",
};

const helpful = [
  "What your business does, and where",
  "What you want to happen that is not happening now",
  "Whether you have an existing site or application",
  "Roughly what you had in mind to spend",
  "When you would like it live",
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(2rem,1rem+3vw,3.5rem)]">
          <Container>
            <p
              className="label text-muted rise flex items-center gap-3 before:block before:h-px before:w-7 before:bg-[var(--grow)] before:content-['']"
              style={{ "--delay": "0ms" } as React.CSSProperties}
            >
              {site.base} — and anywhere with a browser
            </p>

            <h1
              className="rise mt-7 max-w-[14ch] text-5xl"
              style={{ "--delay": "90ms" } as React.CSSProperties}
            >
              Tell us what it needs to do.
            </h1>

            <p
              className="text-ink-2 rise mt-8 max-w-[46ch] text-xl"
              style={{ "--delay": "170ms" } as React.CSSProperties}
            >
              You will get a plan and a price, not a brochure. If we are not the
              right fit, you will hear that early rather than after an invoice.
            </p>

            <div
              className="rise mt-10"
              style={{ "--delay": "240ms" } as React.CSSProperties}
            >
              <a
                href={`mailto:${site.email}`}
                className="font-display text-ink hover:text-grow text-lg [overflow-wrap:anywhere] transition-colors duration-200 sm:text-2xl md:text-3xl"
              >
                {site.email}
              </a>
            </div>
          </Container>
        </section>

        {/* The form. Source is tagged so a QR code or campaign can be told
            apart from someone who simply found the page. */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <div className="grid gap-[clamp(2rem,1rem+4vw,4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <Reveal>
                <Eyebrow tone="grow">Tell us about it</Eyebrow>
                <h2 className="mt-3 max-w-[16ch] text-3xl">
                  Two minutes, and you get a real answer
                </h2>
                <p className="text-ink-2 mt-5 max-w-[40ch]">
                  Everything except your name, email and a description is
                  optional. Budget helps, but leaving it blank has never stopped
                  anyone getting a reply.
                </p>
              </Reveal>

              <Reveal delay={110}>
                <LeadForm source="contact-page" />
              </Reveal>
            </div>
          </Container>
        </section>

        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <div className="grid gap-[clamp(2rem,1rem+4vw,4.5rem)] lg:grid-cols-2">
              <Reveal>
                <Eyebrow tone="grow">What helps</Eyebrow>
                <h2 className="mt-3 max-w-[18ch] text-3xl">
                  Five lines is plenty
                </h2>
                <p className="text-ink-2 mt-5 max-w-[42ch]">
                  No discovery questionnaire and nothing you have to prepare.
                  Whatever you can tell us in a few lines is enough to work out
                  whether there is a project here.
                </p>
                <p className="text-muted mt-4 max-w-[42ch] text-sm">
                  Prefer email? The address above reaches exactly the same
                  place.
                </p>
              </Reveal>

              <Reveal delay={120}>
                <ul className="border-ink border-t-2 pt-4">
                  {helpful.map((item) => (
                    <li
                      key={item}
                      className="border-rule text-ink-2 grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 border-b py-3 text-sm"
                    >
                      <span aria-hidden="true" className="text-grow">
                        →
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </Container>
        </section>

        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow tone="platform">Service area</Eyebrow>
              <p className="text-ink-2 measure mt-4">
                Based in {site.base}. Working across{" "}
                {serviceArea
                  .filter((town) => !site.base.startsWith(town))
                  .join(", ")}{" "}
                and the surrounding suburbs — {site.reach}. Distance has never
                been the thing that decides whether a project works.
              </p>
            </Reveal>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
