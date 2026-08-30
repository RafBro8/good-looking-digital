import Link from "next/link";

import { Container } from "@/components/ui";
import { serviceArea, site } from "@/lib/site";

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

          <div>
            <p className="label text-muted">Grow</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {["Websites", "Branding", "Google presence", "QR marketing"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="/grow"
                      className="text-ink-2 hover:text-grow transition-colors duration-200"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <p className="label text-muted">Platform</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {[
                "Web applications",
                "Customer portals",
                "Playwright testing",
                "Assessments",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/platform"
                    className="text-ink-2 hover:text-platform transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label text-muted">Serving</p>
            <p className="text-ink-2 mt-3 text-sm leading-relaxed">
              {serviceArea.join(" · ")} — {site.reach}.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="text-ink hover:text-grow mt-4 inline-block text-sm font-semibold [overflow-wrap:anywhere] transition-colors duration-200"
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
            </div>
          </div>
        </div>

        <div className="border-rule flex flex-wrap justify-between gap-3 border-t py-6">
          <p className="label text-muted">
            © {new Date().getFullYear()} {site.name} — {site.base}
          </p>
          <p className="label text-muted">Built and tested in-house</p>
        </div>
      </Container>
    </footer>
  );
}
