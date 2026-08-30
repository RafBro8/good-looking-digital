import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui";
import { LeadForm } from "@/components/LeadForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Scanned a code or picked up a card? Tell us what you need and you will get a real reply from a person.",
  // A QR destination has no business in search results — it exists for the
  // person holding the card, not for a crawler.
  robots: { index: false, follow: true },
};

/**
 * QR destination. Short URL, one purpose, no navigation.
 *
 * Deliberately not the homepage: someone standing on a driveway with a phone
 * has about ten seconds of patience, and every link that is not the form is a
 * way to lose them. No header, no menu, no footer columns.
 */
export default function StartPage() {
  return (
    <main className="min-h-screen">
      <div className="flex h-1" aria-hidden="true">
        <span className="bg-grow flex-1" />
        <span className="bg-platform flex-1" />
      </div>

      <Container>
        <div className="mx-auto max-w-[46rem] py-[clamp(2rem,1.5rem+3vw,3.5rem)]">
          <Link
            href="/"
            className="font-display text-ink text-lg font-semibold tracking-tight"
          >
            Good Looking <span className="text-grow">Digital</span>
          </Link>

          <h1 className="mt-8 max-w-[15ch] text-4xl">Tell us what you need.</h1>

          <p className="text-ink-2 mt-5 max-w-[42ch] text-lg">
            A few lines is plenty. You will get a real reply from a person —
            usually within one business day, and never an automated sequence.
          </p>

          <div className="mt-10">
            <LeadForm source="qr" />
          </div>

          <p className="text-muted mt-10 text-sm">
            Would rather email or call it in?{" "}
            <a
              href={`mailto:${site.email}`}
              className="text-ink hover:text-grow font-semibold [overflow-wrap:anywhere] transition-colors duration-200"
            >
              {site.email}
            </a>
          </p>

          <p className="label text-muted mt-8">
            {site.name} — {site.base}
          </p>
        </div>
      </Container>
    </main>
  );
}
