import type { Metadata } from "next";
import Link from "next/link";

import { Container, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { about, proofPoints, serviceArea, site } from "@/lib/site";

export const metadata: Metadata = {
  title: about.metaTitle,
  description: about.metaDescription,
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ---------- hero ---------- */}
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(2rem,1rem+3vw,3.5rem)]">
          <Container>
            <p
              className="label text-muted rise flex items-center gap-3 before:block before:h-px before:w-7 before:bg-[var(--grow)] before:content-['']"
              style={{ "--delay": "0ms" } as React.CSSProperties}
            >
              {site.base}
            </p>

            <h1
              className="rise mt-7 max-w-[15ch] text-5xl"
              style={{ "--delay": "90ms" } as React.CSSProperties}
            >
              {about.heroTitle}
            </h1>

            <p
              className="text-ink-2 rise mt-8 max-w-[50ch] text-xl"
              style={{ "--delay": "170ms" } as React.CSSProperties}
            >
              {about.heroLede}
            </p>
          </Container>
        </section>

        {/* ---------- the bio ----------
            No portrait by choice. The experience carries the page, so the copy
            gets a proper reading measure rather than being squeezed beside an
            image slot that is not there. */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <div className="grid gap-[clamp(1.5rem,1rem+3vw,4rem)] lg:grid-cols-[14rem_minmax(0,1fr)]">
              <Reveal>
                <Eyebrow tone="grow">Who you are hiring</Eyebrow>
              </Reveal>

              <Reveal delay={90}>
                <div className="flex flex-col gap-5">
                  {about.story.map((para) => (
                    <p
                      key={para.slice(0, 24)}
                      className="text-ink-2 max-w-[62ch] text-lg leading-relaxed"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ---------- highlights ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <div className="grid gap-[clamp(1.5rem,1rem+3vw,4rem)] lg:grid-cols-[14rem_minmax(0,1fr)]">
              <Reveal>
                <Eyebrow tone="platform">Not typical for a solo shop</Eyebrow>
              </Reveal>

              <Reveal delay={90}>
                <ul className="border-ink border-t-2 pt-4">
                  {about.highlights.map((item) => (
                    <li
                      key={item}
                      className="border-rule text-ink-2 grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 border-b py-3.5"
                    >
                      <span aria-hidden="true" className="text-platform">
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

        {/* ---------- the signature project ---------- */}
        <section className="canvas py-[clamp(3rem,2rem+4vw,5.5rem)]">
          <Container>
            <Reveal>
              <p className="label text-white/70">{about.signature.eyebrow}</p>
              <h2 className="mt-4 max-w-[18ch] text-4xl text-white">
                {about.signature.title}
              </h2>
              <div className="mt-7 flex flex-col gap-4">
                {about.signature.body.map((para) => (
                  <p
                    key={para.slice(0, 24)}
                    className="max-w-[58ch] text-lg leading-relaxed text-white/80"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </Reveal>
          </Container>
        </section>

        {/* ---------- proof ---------- */}
        <section className="py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {proofPoints.map((point, i) => (
                <Reveal key={point.figure} delay={i * 80}>
                  <p className="font-display text-ink text-4xl leading-none font-semibold tracking-tight">
                    {point.figure}
                  </p>
                  <p className="text-muted mt-3 max-w-[24ch] text-sm">
                    {point.note}
                  </p>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ---------- principles ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow>How the work runs</Eyebrow>
              <h2 className="mt-3 max-w-[20ch] text-3xl">
                Four things you can hold us to
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2">
              {about.principles.map((principle, i) => (
                <Reveal key={principle.title} delay={i * 80}>
                  <div className="border-ink flex h-full flex-col gap-3 border-t-2 pt-4">
                    <span className="label tnum text-grow">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl">{principle.title}</h3>
                    <p className="text-muted max-w-[44ch] text-sm leading-relaxed">
                      {principle.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ---------- limits ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <div className="grid gap-[clamp(2rem,1rem+4vw,4.5rem)] lg:grid-cols-2">
              <Reveal>
                <Eyebrow tone="platform">What this is not</Eyebrow>
                <h2 className="mt-3 max-w-[18ch] text-3xl">
                  The limits, said out loud
                </h2>
                <p className="text-ink-2 mt-5 max-w-[42ch]">
                  Every agency site lists what it does. Fewer list what they
                  will turn down, which is the more useful half if you are
                  trying to work out whether to call.
                </p>
              </Reveal>

              <Reveal delay={120}>
                <ul className="border-rule-strong border-t-2 pt-4">
                  {about.limits.map((limit) => (
                    <li
                      key={limit}
                      className="border-rule text-ink-2 grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 border-b py-3 text-sm"
                    >
                      <span aria-hidden="true" className="text-muted">
                        —
                      </span>
                      <span>{limit}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ---------- closing ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+4vw,5rem)]">
          <Container>
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div>
                  <h2 className="max-w-[18ch] text-3xl">
                    Based in {site.base}. Working wherever there is a browser.
                  </h2>
                  <p className="text-muted mt-4 max-w-[46ch] text-sm">
                    {serviceArea.join(" · ")} — and remotely for everyone else.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="bg-grow text-grow-ink px-7 py-4 text-sm font-bold whitespace-nowrap transition-opacity duration-200 hover:opacity-90"
                >
                  Start a project →
                </Link>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
