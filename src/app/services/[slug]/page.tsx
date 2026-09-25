import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  serviceBySlug,
  servicePrice,
  serviceRowHref,
  services,
} from "@/lib/services";
import { site } from "@/lib/site";

/**
 * One page per service, generated from src/lib/services.ts.
 *
 * Statically generated at build time. dynamicParams is false so a slug that is
 * not in the list 404s rather than being rendered on demand - there is no
 * database behind this, so an unknown slug can only ever be a typo or a stale
 * link, and rendering an empty page for it would be worse than a 404.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceBySlug(slug);

  if (!service) return {};

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceBySlug(slug);

  // Unreachable while dynamicParams is false, and kept anyway: it is what
  // makes the type narrow, and it is the correct behaviour if that flag is
  // ever flipped.
  if (!service) notFound();

  const price = servicePrice(service);
  const isGrow = service.path === "grow";

  /**
   * Describes the service to a search engine.
   *
   * Deliberately modest: a provider, an area and a name. No aggregateRating
   * and no review count, because there are no reviews yet and inventing them
   * is both a lie and a manual action waiting to happen.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.metaDescription,
    serviceType: service.sourceName,
    provider: {
      "@type": "ProfessionalService",
      name: site.legalName,
      url: site.url,
      telephone: site.phone,
      email: site.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Mokena",
        addressRegion: "IL",
        addressCountry: "US",
      },
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: site.region,
    },
    url: `${site.url}/services/${service.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // The value is built above from our own constants, never from user
        // input, so there is nothing here that could carry a script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <main>
        {/* ---------- hero ---------- */}
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(2rem,1rem+3vw,3.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow tone={service.path}>{service.eyebrow}</Eyebrow>
              <h1 className="mt-3 max-w-[18ch] text-4xl">{service.title}</h1>
              <p className="text-ink-2 measure mt-6 text-lg">{service.lede}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <p className="label tnum text-ink">{price}</p>
                <Link
                  href={serviceRowHref(service)}
                  className={`text-sm font-semibold hover:opacity-75 ${
                    isGrow ? "text-grow" : "text-platform"
                  }`}
                >
                  See this beside everything else →
                </Link>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* ---------- what you get ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow tone={service.path}>What you get</Eyebrow>
            </Reveal>

            <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {service.included.map((item, i) => (
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
        </section>

        {/* ---------- how it works ---------- */}
        {service.process && (
          <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
            <Container>
              <Reveal>
                <Eyebrow tone={service.path}>How it works</Eyebrow>
              </Reveal>

              <ol className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {service.process.map((step, i) => (
                  <Reveal key={step.title} delay={i * 70}>
                    <li className="border-rule border-t pt-4">
                      <p className="label text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold tracking-tight">
                        {step.title}
                      </h2>
                      <p className="text-ink-2 mt-2 text-sm leading-relaxed">
                        {step.body}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </Container>
          </section>
        )}

        {/* ---------- limits ---------- */}
        {service.notIncluded && (
          <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
            <Container>
              <Reveal>
                <Eyebrow tone={service.path}>What this does not cover</Eyebrow>
                <ul className="border-rule-strong mt-6 max-w-[60ch] border-t-2 pt-4">
                  {service.notIncluded.map((limit) => (
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
          </section>
        )}

        {/* ---------- faqs ---------- */}
        {service.faqs && (
          <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
            <Container>
              <Reveal>
                <Eyebrow tone={service.path}>Questions</Eyebrow>
              </Reveal>

              <dl className="mt-8">
                {service.faqs.map((faq, i) => (
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
        )}

        {/* ---------- closing ---------- */}
        <section className="canvas py-[clamp(3rem,2rem+5vw,6rem)]">
          <Container>
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div>
                  <h2 className="max-w-[16ch] text-4xl text-white">
                    {service.ctaTitle}
                  </h2>
                  <p className="mt-5 max-w-[44ch] text-white/80">
                    {service.ctaBody}
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
