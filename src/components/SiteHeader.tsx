import Link from "next/link";

import { Container } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";

const nav = [
  { label: "Grow", href: "/grow" },
  { label: "Platform", href: "/platform" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
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
          <Link
            href="/"
            className="font-display text-ink text-lg font-semibold tracking-tight"
          >
            Good Looking <span className="text-grow">Digital</span>
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
            <ThemeToggle />
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
