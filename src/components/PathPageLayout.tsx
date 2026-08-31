import Link from "next/link";

import { Container, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pathContent, paths, site, type PathId } from "@/lib/site";

/**
 * Shared skeleton for /grow and /platform. Both buyers get the same structure —
 * offer, services, process, differentiator, questions, call to action — but the
 * accent colour, copy and voice differ, which is the whole point of the split.
 */
export function PathPageLayout({
  pathId,
  children,
}: {
  pathId: PathId;
  children?: React.ReactNode;
}) {
  const path = paths.find((p) => p.id === pathId)!;
  const content = pathContent[pathId];
  const isGrow = pathId === "grow";

  const accentText = isGrow ? "text-grow" : "text-platform";
  const accentBg = isGrow
    ? "bg-grow text-grow-ink"
    : "bg-platform text-platform-ink";
  const accentBorder = isGrow ? "border-grow" : "border-platform";

  return (
    <>
      <SiteHeader />

      <main>
        {/* ---------- hero ---------- */}
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(2rem,1rem+3vw,3.5rem)]">
          <Container>
            <p
              className={`label rise flex items-center gap-3 before:block before:h-px before:w-7 before:content-[''] ${accentText} ${
                isGrow
                  ? "before:bg-[var(--grow)]"
                  : "before:bg-[var(--platform)]"
              }`}
              style={{ "--delay": "0ms" } as React.CSSProperties}
            >
              {path.eyebrow}
            </p>

            <h1
              className="rise mt-7 max-w-[14ch] text-5xl"
              style={{ "--delay": "90ms" } as React.CSSProperties}
            >
              {content.heroTitle}
            </h1>

            <p
              className="text-ink-2 rise mt-8 max-w-[46ch] text-xl"
              style={{ "--delay": "170ms" } as React.CSSProperties}
            >
              {content.heroLede}
            </p>

            <div
              className="rise mt-9 flex flex-wrap gap-3"
              style={{ "--delay": "240ms" } as React.CSSProperties}
            >
              <Link
                href="/contact"
                className={`px-6 py-3.5 text-sm font-bold transition-opacity duration-200 hover:opacity-90 ${accentBg}`}
              >
                {content.ctaLabel} →
              </Link>
              <a
                href={site.phoneHref}
                className="border-rule-strong text-ink hover:border-ink border px-6 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200"
              >
                Call {site.phone}
              </a>
              <Link
                href={isGrow ? "/platform" : "/grow"}
                className="text-muted hover:text-ink self-center text-sm transition-colors duration-200"
              >
                {isGrow
                  ? "I need software instead"
                  : "I need a website instead"}
              </Link>
            </div>
          </Container>
        </section>

        {/* ---------- services and prices ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow tone={pathId}>What you get</Eyebrow>
              <h2 className="mt-3 max-w-[20ch] text-3xl">
                {isGrow
                  ? "Everything that makes people call you"
                  : "What we build, and what it costs"}
              </h2>
              <p className="text-ink-2 measure mt-4">
                Prices are starting points, not menu items — the real number
                comes after we understand the work. Nothing here is a package
                you have to take whole.
              </p>
            </Reveal>

            <div className="mt-10">
              {path.services.map((service, i) => (
                <Reveal key={service.name} delay={i * 60}>
                  <div className="border-rule grid max-w-[46rem] grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-4 border-b py-4">
                    <span className="label tnum text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg font-semibold tracking-tight">
                      {service.name}
                    </span>
                    <span className="label tnum text-muted whitespace-nowrap">
                      {service.price}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ---------- differentiator ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <div className="grid items-start gap-[clamp(2rem,1rem+4vw,4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Reveal>
                <Eyebrow tone={pathId}>{content.featureEyebrow}</Eyebrow>
                <h2 className="mt-3 max-w-[18ch] text-3xl">
                  {content.featureTitle}
                </h2>
                <p className="text-ink-2 mt-5 max-w-[44ch]">
                  {content.featureBody}
                </p>
              </Reveal>

              <Reveal delay={120}>
                <ul className={`border-t-2 pt-4 ${accentBorder}`}>
                  {content.featurePoints.map((point) => (
                    <li
                      key={point}
                      className="border-rule text-ink-2 grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 border-b py-3 text-sm"
                    >
                      <span aria-hidden="true" className={accentText}>
                        →
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ---------- process ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow tone={pathId}>{content.processTitle}</Eyebrow>
              <h2 className="mt-3 max-w-[20ch] text-3xl">
                {isGrow
                  ? "Four steps, and you know where you are in all of them"
                  : "Four steps, priced so you can stop after any of them"}
              </h2>
            </Reveal>

            <ol className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
              {content.process.map((step, i) => (
                <Reveal key={step.title} delay={i * 90}>
                  <li className="border-rule flex h-full flex-col gap-3 border-t-2 pt-4 lg:border-t-2">
                    <span className={`label tnum ${accentText}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl">{step.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {step.body}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </Container>
        </section>

        {/* page-specific block, injected by each route */}
        {children}

        {/* ---------- questions ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow tone={pathId}>Questions people actually ask</Eyebrow>
              <h2 className="mt-3 max-w-[20ch] text-3xl">
                The awkward ones, answered up front
              </h2>
            </Reveal>

            <dl className="mt-10 max-w-[52rem]">
              {content.faqs.map((faq, i) => (
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
                    {content.ctaTitle}
                  </h2>
                  <p className="mt-5 max-w-[44ch] text-white/80">
                    {content.ctaBody}
                  </p>
                </div>
                <Link
                  href="/contact"
                  className={`px-7 py-4 text-sm font-bold whitespace-nowrap transition-opacity duration-200 hover:opacity-90 ${accentBg}`}
                >
                  {content.ctaLabel} →
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
