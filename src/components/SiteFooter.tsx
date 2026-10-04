import Link from "next/link";

import { Container } from "@/components/ui";
import { serviceHrefForRow } from "@/lib/services";
import { townHref } from "@/lib/towns";
import { paths, serviceArea, site } from "@/lib/site";

/**
 * Both service columns come from paths[] rather than from a hand-written list
 * here. The old list was four labels pointing at /grow and four at /platform,
 * with no fragment on any of them - so the first click navigated and every
 * click after it was a no-op, because the router was already on that URL.
 * Generating the links from the same data as the rows they point at means a
 * renamed service moves its own link with it.
 *
 * Fragments then replaced that, and every link still felt like the same
 * destination - because it was: a row in a price table is not somewhere to
 * arrive. serviceHrefForRow now sends each label to its own service page, and
 * falls back to the row only for the two services that deliberately have no
 * page of their own.
 */
function ServiceColumn({ pathId }: { pathId: "grow" | "platform" }) {
  const path = paths.find((p) => p.id === pathId)!;
  const hover = pathId === "grow" ? "hover:text-grow" : "hover:text-platform";

  return (
    <div>
      <p className="label text-muted">
        {pathId === "grow" ? "Grow" : "Platform"}
      </p>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {path.services
          .filter((service) => service.footerLabel)
          .map((service) => (
            <li key={service.name}>
              <Link
                href={serviceHrefForRow(pathId, service.name)}
                className={`text-ink-2 ${hover} transition-colors duration-200`}
              >
                {service.footerLabel}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-rule border-t">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-ink text-lg font-semibold tracking-tight">
              Good Looking <span className="text-grow">Digital</span>
            </p>
            <p className="text-muted mt-2 max-w-[28ch] text-sm">
              {site.tagline}
            </p>
          </div>

          <ServiceColumn pathId="grow" />

          <ServiceColumn pathId="platform" />

          <div>
            <p className="label text-muted">Serving</p>
            {/* Towns with a page of their own link to it. Lockport is
                served and named here like the rest, and has no page, so it
                stays plain text rather than pointing at a 404. */}
            <p className="text-ink-2 mt-3 text-sm leading-relaxed">
              {serviceArea.map((town, i) => {
                const href = townHref(town);
                return (
                  <span key={town}>
                    {i > 0 && " · "}
                    {href ? (
                      <Link
                        href={href}
                        className="hover:text-grow transition-colors duration-200"
                      >
                        {town}
                      </Link>
                    ) : (
                      town
                    )}
                  </span>
                );
              })}{" "}
              - {site.reach}.
            </p>
            <a
              href={site.phoneHref}
              className="text-ink hover:text-grow mt-4 block text-lg font-semibold transition-colors duration-200"
            >
              {site.phone}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="text-ink-2 hover:text-grow mt-1.5 inline-block text-sm font-semibold [overflow-wrap:anywhere] transition-colors duration-200"
            >
              {site.email}
            </a>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              <Link
                href="/pricing"
                className="text-ink-2 hover:text-ink text-sm transition-colors duration-200"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-ink-2 hover:text-ink text-sm transition-colors duration-200"
              >
                About
              </Link>
              <Link
                href="/sign"
                className="text-ink-2 hover:text-ink text-sm transition-colors duration-200"
              >
                Sign a document
              </Link>
              <Link
                href="/privacy"
                className="text-ink-2 hover:text-ink text-sm transition-colors duration-200"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>

        <div className="border-rule flex flex-wrap justify-between gap-3 border-t py-6">
          <p className="label text-muted">
            © {new Date().getFullYear()} {site.legalName} - {site.base}
          </p>
          <p className="label text-muted">Built and tested in-house</p>
        </div>
      </Container>
    </footer>
  );
}
