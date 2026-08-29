import type { Metadata } from "next";

import { Container, Eyebrow } from "@/components/ui";
import { PathPageLayout } from "@/components/PathPageLayout";
import { Reveal } from "@/components/Reveal";
import { TestRunPanel } from "@/components/TestRunPanel";
import { pathContent } from "@/lib/site";

export const metadata: Metadata = {
  title: pathContent.platform.metaTitle,
  description: pathContent.platform.metaDescription,
};

/** What a paid assessment actually inspects — the entry offer made concrete. */
const assessmentScope = [
  "Architecture and data model",
  "Critical user workflows",
  "Mobile and responsive behaviour",
  "Performance and load times",
  "Accessibility",
  "Existing test coverage",
  "Deployment and release process",
  "Security considerations",
  "Technical debt, ranked by cost",
];

export default function PlatformPage() {
  return (
    <PathPageLayout pathId="platform">
      {/* The proof panel and the assessment scope — the two things that turn a
          technical browser into a technical enquiry. */}
      <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
        <Container>
          <div className="grid items-center gap-[clamp(2rem,1rem+4vw,4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <Reveal>
              <Eyebrow tone="platform">A real run</Eyebrow>
              <h2 className="mt-3 max-w-[18ch] text-3xl">
                This is what gets handed over
              </h2>
              <p className="text-ink-2 mt-5 max-w-[44ch]">
                Not a coverage percentage in a report — a suite that runs on
                every push and names the workflows in language your business
                actually uses. When one goes red, everyone knows what broke and
                who it affects.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <TestRunPanel />
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
        <Container>
          <Reveal>
            <Eyebrow tone="platform">The entry point</Eyebrow>
            <h2 className="mt-3 max-w-[22ch] text-3xl">
              Start with an assessment, not a contract
            </h2>
            <p className="text-ink-2 measure mt-4">
              Handing a stranger a large build is a lot to ask. An assessment is
              fixed-price, takes about a week, and ends with a prioritised list
              you own — whether or not you hire us to act on it. If you do, the
              fee credits toward the work.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <ul className="mt-9 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {assessmentScope.map((item) => (
                <li
                  key={item}
                  className="border-rule text-ink-2 flex items-baseline gap-3 border-t py-3 text-sm"
                >
                  <span aria-hidden="true" className="text-platform">
                    →
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={160}>
            <p className="label text-muted mt-8">
              $750–$1,500 · roughly one week · credited toward the build
            </p>
          </Reveal>
        </Container>
      </section>
    </PathPageLayout>
  );
}
