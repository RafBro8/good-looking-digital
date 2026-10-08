import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container, Eyebrow, Section } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";
import {
  audienceOf,
  caseStudyProjects,
  projectByCaseStudySlug,
} from "@/lib/work";

/**
 * One page per case study, generated from the caseStudy field in work.ts.
 *
 * Only some projects have one, so this route is deliberately sparse: ten rows
 * in the showcase, two pages here. Writing a case study for every row to make
 * the set look complete would mean padding eight of them, and a reader can
 * tell. A row with nothing worth saying simply has no second link.
 *
 * Mirrors services/[slug]: statically generated, dynamicParams false so an
 * unknown slug 404s rather than rendering an empty page for a typo.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudyProjects.map((project) => ({
    slug: project.caseStudy.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectByCaseStudySlug(slug);

  if (!project) return {};

  return {
    title: project.caseStudy.metaTitle,
    description: project.caseStudy.metaDescription,
    alternates: { canonical: `/work/${project.caseStudy.slug}` },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectByCaseStudySlug(slug);

  // Unreachable while dynamicParams is false, and kept anyway: it is what
  // narrows the type, and it is the right behaviour if that flag is flipped.
  if (!project) notFound();

  const study = project.caseStudy;
  const isGrow = audienceOf(project) === "grow";
  const accent = isGrow ? "text-grow" : "text-platform";

  /**
   * Describes the project to a search engine.
   *
   * CreativeWork rather than Service: this is a thing that was made, not
   * something being sold by the hour. No aggregateRating, for the same reason
   * the service pages carry none. There are no reviews, and inventing them is
   * both a lie and a manual action waiting to happen.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    headline: study.title,
    description: study.metaDescription,
    url: `${site.url}/work/${study.slug}`,
    sameAs: project.url,
    about: project.kind,
    keywords: project.built.join(", "),
    author: {
      "@type": "ProfessionalService",
      name: site.legalName,
      url: site.url,
      telephone: site.phone,
      email: site.email,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Built above from our own constants, never from user input, so there
        // is nothing here that could carry a script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <main>
        {/* ---------- hero ---------- */}
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(2rem,1rem+3vw,3.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow tone={isGrow ? "grow" : "platform"}>
                {study.eyebrow}
              </Eyebrow>
              <h1 className="mt-3 max-w-[20ch] text-4xl">{study.title}</h1>
              <p className="text-ink-2 measure mt-6 text-lg">{study.lede}</p>

              {/* The live link stays the loudest thing on the page. A case
                  study that keeps a reader reading instead of sending them to
                  the real thing has argued against the showcase it came from. */}
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={`Open ${project.name} at ${project.host} in a new tab.`}
                  className={`inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-tight transition-opacity duration-200 hover:opacity-90 ${
                    isGrow
                      ? "bg-grow text-grow-ink"
                      : "bg-platform text-platform-ink"
                  }`}
                >
                  Open {project.host}{" "}
                  <span aria-hidden="true">&rarr;</span>
                </a>
                <Link
                  href="/work"
                  className="text-ink-2 hover:text-ink text-sm font-semibold transition-colors duration-200"
                >
                  All ten projects
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-2 gap-y-2">
                {project.built.map((item) => (
                  <li
                    key={item}
                    className="border-rule text-muted border px-2 py-1 text-xs"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </Container>
        </section>

        {/* ---------- the brief ---------- */}
        <Section divided>
          <Container>
            <Reveal>
              <Eyebrow tone={isGrow ? "grow" : "platform"}>
                What it is for
              </Eyebrow>
            </Reveal>

            <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {study.brief.map((item, i) => (
                <Reveal key={item.title} delay={i * 60}>
                  <div className="border-rule border-t pt-4">
                    <h2 className="text-lg font-semibold tracking-tight">
                      {item.title}
                    </h2>
                    <p className="text-ink-2 mt-2 text-sm leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ---------- the decisions ---------- */}
        <Section divided>
          <Container>
            <Reveal>
              <Eyebrow tone={isGrow ? "grow" : "platform"}>
                Decisions, and why
              </Eyebrow>
              <p className="text-ink-2 measure mt-4">
                The parts worth arguing about. Anything here could have gone the
                other way, and the reason it did not is the actual work.
              </p>
            </Reveal>

            <ol className="mt-[clamp(2rem,1.25rem+2vw,2.75rem)]">
              {study.decisions.map((item, i) => (
                <Reveal key={item.title} delay={i * 50}>
                  <li className="border-rule grid gap-x-[clamp(1.5rem,1rem+3vw,4rem)] gap-y-2 border-t py-6 md:grid-cols-[9rem_minmax(0,1fr)]">
                    <span
                      className={`font-display text-2xl leading-none tabular-nums ${accent}`}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-xl leading-snug sm:text-2xl">
                        {item.title}
                      </h2>
                      <p className="text-ink-2 measure mt-3">{item.body}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
              <li aria-hidden="true" className="border-rule border-t" />
            </ol>
          </Container>
        </Section>

        {/* ---------- limits ---------- */}
        <Section divided>
          <Container>
            <Reveal>
              <Eyebrow tone={isGrow ? "grow" : "platform"}>
                What it deliberately does not do
              </Eyebrow>
              <ul className="border-rule-strong mt-6 max-w-[60ch] border-t-2 pt-4">
                {study.limits.map((limit) => (
                  <li
                    key={limit}
                    className="border-rule text-ink-2 border-b py-3 text-sm leading-relaxed"
                  >
                    {limit}
                  </li>
                ))}
              </ul>
            </Reveal>
          </Container>
        </Section>

        {/* ---------- standing ---------- */}
        <Section divided>
          <Container>
            <Reveal>
              <Eyebrow tone={isGrow ? "grow" : "platform"}>
                Where this one stands
              </Eyebrow>
              <p className="font-display measure mt-4 text-xl leading-snug sm:text-2xl">
                {study.standing}
              </p>
            </Reveal>
          </Container>
        </Section>

        {/* ---------- closing ---------- */}
        <section className="canvas py-[clamp(3rem,2rem+5vw,6rem)]">
          <Container>
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div>
                  <h2 className="max-w-[18ch] text-4xl text-white">
                    {study.ctaTitle}
                  </h2>
                  <p className="mt-5 max-w-[44ch] text-white/80">
                    {study.ctaBody}
                  </p>
                </div>
                <Link
                  href="/contact"
                  className={`px-7 py-4 text-sm font-bold whitespace-nowrap transition-opacity duration-200 hover:opacity-90 ${
                    isGrow
                      ? "bg-grow text-grow-ink"
                      : "bg-platform text-platform-ink"
                  }`}
                >
                  Book a call &rarr;
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
