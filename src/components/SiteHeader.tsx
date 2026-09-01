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

          <nav className="hidden items-center gap-7 md:flex">
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
                by class order, so hidden on the component itself loses. */}
            <span className="hidden sm:inline-flex">
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
      </Container>
    </header>
  );
}
