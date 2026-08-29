import type { Metadata } from "next";

import { Container, Eyebrow } from "@/components/ui";
import { PathPageLayout } from "@/components/PathPageLayout";
import { Reveal } from "@/components/Reveal";
import { TestRunPanel } from "@/components/TestRunPanel";
import { pathContent, stack } from "@/lib/site";

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

      {/* The stack, where a technical reader will look for it — not buried
          in an FAQ three screens further down. */}
      <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
        <Container>
          <Reveal>
            <Eyebrow tone="platform">What we work in</Eyebrow>
            <h2 className="mt-3 max-w-[22ch] text-3xl">
              Nine years of it, three of them at CVS Health
            </h2>
            <p className="text-ink-2 measure mt-4">
              Listed so you can check for a match before spending a call on it.
              If your stack is not here, say so — adjacent is often fine, and we
              will tell you when it is not.
            </p>
          </Reveal>

          <div className="mt-10 flex flex-col gap-7">
            {stack.map((group, i) => (
              <Reveal key={group.group} delay={i * 70}>
                <div className="border-rule grid gap-x-8 gap-y-3 border-t pt-4 md:grid-cols-[10rem_minmax(0,1fr)]">
                  <p className="label text-platform">{group.group}</p>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="border-rule text-ink-2 border px-2.5 py-1 text-sm"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
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
