import Link from "next/link";

import { BrandMark } from "@/components/BrandMark";
import { Container } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/site";

/**
 * Only routes that exist. Work joins when Stage 07 lands — a nav link that
 * 404s costs more trust than a shorter menu does.
 */
const nav = [
  { label: "Grow", href: "/grow" },
  { label: "Platform", href: "/platform" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  return (
    <header className="border-rule/70 bg-paper/80 sticky top-0 z-50 border-b backdrop-blur-md">
      {/* The two paths, declared before a single word is read. Lives inside the
          sticky header so the signature stays visible the whole way down. */}
      <div className="flex h-1" aria-hidden="true">
        <span className="bg-grow flex-1" />
        <span className="bg-platform flex-1" />
      </div>

      <Container>
        <div className="flex items-center justify-between gap-4 py-3.5">
          {/* Mark plus wordmark. The mark is aria-hidden because the words
              right beside it already say the name. */}
          <Link
            href="/"
            className="text-ink flex items-center gap-2 sm:gap-2.5"
          >
            <BrandMark className="w-[3.1rem] shrink-0 sm:w-[3.6rem]" />
            <span className="font-display text-base font-semibold tracking-tight whitespace-nowrap sm:text-lg">
              Good Looking <span className="text-grow">Digital</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink-2 hover:text-ink text-sm transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href={site.phoneHref}
              className="text-ink hover:text-grow -mx-1 px-1 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-200"
            >
              {site.phone}
            </a>
            {/* Wrapped rather than given a hidden class directly: Tailwind
                resolves competing display utilities by stylesheet order, not
                by class order, so hidden on the component itself loses.
                Below lg the toggle lives in the compact row instead, so
                exactly one is on screen at any width. */}
            <span className="hidden lg:inline-flex">
              <ThemeToggle />
            </span>
            <Link
              href="/contact"
              className="bg-ink text-paper hover:bg-ink-2 hidden px-4 py-2 text-sm font-semibold transition-colors duration-200 sm:inline-block"
            >
              Book a call
            </Link>
          </div>
        </div>

        {/* Phones and tablets get their own row. Without it the only way off
            the current page is to scroll to the footer of it. Four links fit
            across a 375px screen, which is why this is a row rather than a
            hamburger — a menu you must open to reveal four words is a tap
            nobody needs to make.

            The handover is at lg, not md. The single-row desktop header needs
            799px for its three groups and md turns it on at 768, so it wrapped
            and pushed the page sideways at exactly iPad-portrait width. This
            layout is comfortable there. */}
        <div className="border-rule/60 flex items-center justify-between gap-3 border-t py-0.5 lg:hidden">
          {/* py-3 on the links rather than the row: it buys a 44px tap target
              on a control a contractor uses one-handed, and costs nothing in
              header height because the row's own padding shrinks to match. */}
          <nav className="flex items-center gap-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink-2 hover:text-ink py-3 text-sm transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle className="py-3" />
        </div>
      </Container>
    </header>
  );
}
