import type { Metadata } from "next";
import Link from "next/link";

import { Container, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  carePlans,
  paths,
  pricingFactors,
  pricingFaqs,
  pricingPrinciples,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "What things cost at Good Looking Digital — websites, branding, local presence, lead capture, custom applications, test automation and monthly care plans. Starting points, not menu prices.",
};

export default function PricingPage() {
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
              Starting points, not menu prices
            </p>

            <h1
              className="rise mt-7 max-w-[14ch] text-5xl"
              style={{ "--delay": "90ms" } as React.CSSProperties}
            >
              What things cost.
            </h1>

            <p
              className="text-ink-2 rise mt-8 max-w-[48ch] text-xl"
              style={{ "--delay": "170ms" } as React.CSSProperties}
            >
              Most agencies make you book a call to find out whether they are
              affordable. Here are the numbers, with the honest caveat that the
              real one comes after a short conversation.
            </p>
          </Container>
        </section>

        {/* ---------- how pricing works ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow>How this works</Eyebrow>
              <h2 className="mt-3 max-w-[20ch] text-3xl">
                Three things worth knowing before the numbers
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-x-10 gap-y-9 md:grid-cols-3">
              {pricingPrinciples.map((principle, i) => (
                <Reveal key={principle.title} delay={i * 90}>
                  <div className="border-ink flex h-full flex-col gap-3 border-t-2 pt-4">
                    <span className="label tnum text-grow">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl">{principle.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {principle.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ---------- the two service tables ---------- */}
        {paths.map((path) => {
          const isGrow = path.id === "grow";
          return (
            <section
              key={path.id}
              className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]"
            >
              <Container>
                <Reveal>
                  <Eyebrow tone={path.id}>{path.eyebrow}</Eyebrow>
                  <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
                    <h2 className="text-3xl">{path.title}</h2>
                    <Link
                      href={path.href}
                      className={`text-sm font-semibold hover:opacity-75 ${
                        isGrow ? "text-grow" : "text-platform"
                      }`}
                    >
                      What this includes →
                    </Link>
                  </div>
                </Reveal>

                <div className="mt-8">
                  {path.services.map((service, i) => (
                    <Reveal key={service.name} delay={i * 50}>
                      <div className="border-rule flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b py-4">
                        <span className="text-lg font-semibold tracking-tight">
                          {service.name}
                        </span>
                        <span
                          className={`label tnum whitespace-nowrap ${
                            isGrow ? "text-grow" : "text-platform"
                          }`}
                        >
                          {service.price}
                        </span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </Container>
            </section>
          );
        })}

        {/* ---------- care plans ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow>Monthly care</Eyebrow>
              <h2 className="mt-3 max-w-[22ch] text-3xl">
                The part that keeps working after launch
              </h2>
              <p className="text-ink-2 measure mt-4">
                Month to month, cancel whenever. A site nobody maintains is a
                liability within a year — this is the difference between a site
                you own and a site you inherit problems from.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {carePlans.map((plan, i) => (
                <Reveal key={plan.name} delay={i * 90}>
                  <div
                    className={`flex h-full flex-col gap-4 border-t-2 pt-5 ${
                      plan.featured ? "border-grow" : "border-rule-strong"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-xl">{plan.name}</h3>
                      {plan.featured && (
                        <span className="label text-grow">Most chosen</span>
                      )}
                    </div>

                    <p className="font-display text-ink text-4xl leading-none font-semibold tracking-tight">
                      {plan.price}
                      <span className="text-muted text-lg font-normal">
                        {plan.period}
                      </span>
                    </p>

                    <p className="text-muted text-sm leading-relaxed">
                      {plan.forWho}
                    </p>

                    <ul className="mt-1 flex flex-col">
                      {plan.includes.map((item) => (
                        <li
                          key={item}
                          className="border-rule text-ink-2 grid grid-cols-[1rem_minmax(0,1fr)] gap-2.5 border-b py-2.5 text-sm"
                        >
                          <span aria-hidden="true" className="text-grow">
                            →
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ---------- what moves the number ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <div className="grid gap-[clamp(2rem,1rem+4vw,4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <Reveal>
                <Eyebrow tone="platform">What moves the number</Eyebrow>
                <h2 className="mt-3 max-w-[18ch] text-3xl">
                  Why two similar jobs quote differently
                </h2>
                <p className="text-ink-2 mt-5 max-w-[42ch]">
                  The single biggest factor is usually the least technical one:
                  whether your words and photographs already exist. A business
                  that arrives with both often lands near the bottom of a band.
                </p>
              </Reveal>

              <Reveal delay={120}>
                <div className="border-ink border-t-2 pt-4">
                  {pricingFactors.map((row) => (
                    <div
                      key={row.factor}
                      className="border-rule flex items-baseline justify-between gap-4 border-b py-3"
                    >
                      <span className="text-ink-2 text-sm">{row.factor}</span>
                      <span className="label text-muted whitespace-nowrap">
                        {row.effect}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ---------- questions ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow>Questions about money</Eyebrow>
              <h2 className="mt-3 max-w-[20ch] text-3xl">
                The ones people feel rude asking
              </h2>
            </Reveal>

            <dl className="mt-10 max-w-[52rem]">
              {pricingFaqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 50}>
                  <div className="border-rule grid gap-2 border-b py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-8">
                    <dt className="text-lg font-semibold tracking-tight">
                      {faq.q}
                    </dt>
                    <dd className="text-ink-2 m-0 text-sm leading-relaxed">
                      {faq.a}
                    </dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </Container>
        </section>

        {/* ---------- closing ---------- */}
        <section className="canvas py-[clamp(3rem,2rem+5vw,6rem)]">
          <Container>
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div>
                  <h2 className="max-w-[16ch] text-4xl text-white">
                    Get a real number.
                  </h2>
                  <p className="mt-5 max-w-[44ch] text-white/80">
                    Describe the job in a few lines and you will get a written
                    price, not a discovery call disguised as one.
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
