import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { growServiceLinks, townBySlug, townHref, towns } from "@/lib/towns";
import { site } from "@/lib/site";

/**
 * Town landing pages, at the root so the URL reads web-design-mokena rather
 * than areas/mokena - that is the phrasing people actually search for.
 *
 * A root-level dynamic segment sits alongside /about, /grow and the rest.
 * Static segments win over dynamic ones, so those pages are unaffected, and
 * dynamicParams is false so anything not in towns[] 404s instead of rendering
 * an empty shell. Both are verified by e2e/town-pages.spec.ts rather than
 * trusted.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return towns.map((town) => ({ townPage: town.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ townPage: string }>;
}): Promise<Metadata> {
  const { townPage } = await params;
  const town = townBySlug(townPage);

  if (!town) return {};

  return {
    title: town.metaTitle,
    description: town.metaDescription,
    alternates: { canonical: `/${town.slug}` },
  };
}

export default async function TownPage({
  params,
}: {
  params: Promise<{ townPage: string }>;
}) {
  const { townPage } = await params;
  const town = townBySlug(townPage);

  if (!town) notFound();

  const services = growServiceLinks();

  /**
   * Says where the business is and where it works, and stops there.
   *
   * areaServed lists the towns rather than drawing a radius, because the towns
   * are what we can honestly claim. No aggregateRating: there are no reviews,
   * and inventing them is a manual action waiting to happen.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.legalName,
    description: town.metaDescription,
    url: `${site.url}/${town.slug}`,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mokena",
      addressRegion: "IL",
      addressCountry: "US",
    },
    areaServed: [town.name, ...town.nearby].map((name) => ({
      "@type": "City",
      name,
      addressRegion: "IL",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Built from our own constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <main>
        {/* ---------- hero ---------- */}
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(2rem,1rem+3vw,3.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow tone="grow">{town.name}, Illinois</Eyebrow>
              <h1 className="mt-3 max-w-[20ch] text-4xl">
                Web design in {town.name}
              </h1>
              <p className="text-ink-2 measure mt-6 text-lg">{town.lede}</p>
            </Reveal>
          </Container>
        </section>

        {/* ---------- why here ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
              {town.local.map((item, i) => (
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

        {/* ---------- what we do, linked out ----------
            Deliberately names and links, and describes nothing. The
            description belongs on the service page; repeating it here is how
            seven town pages become seven copies of the same content. */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow tone="grow">
                What we do for {town.name} businesses
              </Eyebrow>
              <p className="text-ink-2 measure mt-4">
                Prices and what each one involves are on its own page. Nothing
                here is a package you have to take whole.
              </p>
            </Reveal>

            <ul className="mt-8 grid max-w-[46rem] gap-x-10 sm:grid-cols-2">
              {services.map((service, i) => (
                <Reveal key={service.href} delay={i * 50}>
                  <li className="border-rule border-b py-3">
                    <Link
                      href={service.href}
                      className="text-grow text-base font-semibold hover:opacity-75"
                    >
                      {service.name} →
                    </Link>
                  </li>
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>

        {/* ---------- nearby ---------- */}
        <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow tone="grow">Also working in</Eyebrow>
              {/* Neighbours link to their own page where there is one. It
                  is how these pages reach each other at all - nothing else
                  on the site points from one town to the next. */}
              <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                {town.nearby.map((name) => {
                  const href = townHref(name);
                  return (
                    <li key={name} className="label text-ink">
                      {href ? (
                        <Link
                          href={href}
                          className="hover:text-grow transition-colors duration-200"
                        >
                          {name}
                        </Link>
                      ) : (
                        name
                      )}
                    </li>
                  );
                })}
                <li className="label text-muted">{site.reach}</li>
              </ul>
            </Reveal>
          </Container>
        </section>

        {/* ---------- closing ---------- */}
        <section className="canvas py-[clamp(3rem,2rem+5vw,6rem)]">
          <Container>
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div>
                  <h2 className="max-w-[16ch] text-4xl text-white">
                    {town.ctaTitle}
                  </h2>
                  <p className="mt-5 max-w-[44ch] text-white/80">
                    {town.ctaBody}
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
