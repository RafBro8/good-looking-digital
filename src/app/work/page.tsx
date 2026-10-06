import type { Metadata } from "next";
import Link from "next/link";

import { Container, Eyebrow, Section } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { WorkGroup, WorkProject } from "@/lib/work";
import { workGroups, workMeta } from "@/lib/work";

export const metadata: Metadata = {
  title: workMeta.metaTitle,
  description: workMeta.metaDescription,
  alternates: { canonical: "/work" },
};

const projectCount = workGroups.reduce((n, g) => n + g.projects.length, 0);
const saleCount = workGroups
  .flatMap((g) => g.projects)
  .filter((p) => p.forSale).length;

/**
 * The index each group starts counting from, so the numbering runs 01 to 10
 * across both groups rather than restarting. Worked out once at module scope:
 * accumulating it during render mutates a variable the renderer may replay.
 */
const groupStarts = workGroups.reduce<number[]>((acc, group, i) => {
  acc.push(i === 0 ? 1 : acc[i - 1] + workGroups[i - 1].projects.length);
  return acc;
}, []);

/**
 * One project, as a full-width row rather than a card.
 *
 * A card grid would make ten projects read as ten equivalent tiles, which is
 * exactly the undifferentiated wall we are trying not to build. A row gives the
 * hook enough width to land as a sentence, and the hairline between rows does
 * the work a border would otherwise do on every side.
 */
function WorkRow({
  project,
  index,
  tone,
}: {
  project: WorkProject;
  index: number;
  tone: "grow" | "platform";
}) {
  const isGrow = tone === "grow";

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener"
      className={`group border-rule block border-t py-[clamp(1.75rem,1rem+2.5vw,3rem)] transition-colors duration-200 ${
        isGrow ? "hover:bg-grow-soft" : "hover:bg-platform-soft"
      }`}
    >
      <div className="flex flex-col gap-x-[clamp(1.5rem,1rem+3vw,4rem)] gap-y-5 md:flex-row">
        {/* index + category rail */}
        <div className="flex shrink-0 items-baseline gap-4 md:w-[9rem] md:flex-col md:items-start md:gap-2">
          <span
            className={`font-display text-2xl leading-none tabular-nums ${
              isGrow ? "text-grow" : "text-platform"
            }`}
            aria-hidden="true"
          >
            {String(index).padStart(2, "0")}
          </span>
          <span className="label text-muted">{project.kind}</span>
        </div>

        {/* the substance */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="text-2xl">{project.name}</h3>
            {project.forSale ? (
              <span
                className={`label border px-2 py-1 ${
                  isGrow
                    ? "border-grow text-grow"
                    : "border-platform text-platform"
                }`}
              >
                Available to buy
              </span>
            ) : null}
          </div>

          <p className="font-display mt-3 max-w-[30ch] text-xl leading-snug sm:text-2xl">
            {project.hook}
          </p>

          <p className="text-ink-2 measure mt-4">{project.blurb}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ul className="flex flex-wrap gap-x-2 gap-y-2">
              {project.built.map((item) => (
                <li
                  key={item}
                  className="border-rule text-muted border px-2 py-1 text-xs"
                >
                  {item}
                </li>
              ))}
            </ul>

            <span
              className={`text-sm font-semibold transition-colors duration-200 ${
                isGrow
                  ? "text-grow group-hover:text-ink"
                  : "text-platform group-hover:text-ink"
              }`}
            >
              {project.host}{" "}
              <span aria-hidden="true" className="inline-block">
                &rarr;
              </span>
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function WorkSection({ group, start }: { group: WorkGroup; start: number }) {
  return (
    <Section divided>
      <Container>
        <Reveal>
          <Eyebrow tone={group.id}>{group.eyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-[20ch] text-3xl">{group.title}</h2>
          <p className="text-ink-2 measure mt-5">{group.lede}</p>
        </Reveal>

        <div className="mt-[clamp(2rem,1.25rem+2.5vw,3.25rem)]">
          {group.projects.map((project, i) => (
            <Reveal key={project.id} delay={i * 40}>
              <WorkRow project={project} index={start + i} tone={group.id} />
            </Reveal>
          ))}
          <hr className="border-rule border-0 border-t" />
        </div>
      </Container>
    </Section>
  );
}

export default function WorkPage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ---------- hero ---------- */}
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(1.5rem,1rem+2vw,2.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow>{workMeta.eyebrow}</Eyebrow>
              <h1 className="mt-3 max-w-[16ch] text-4xl">{workMeta.title}</h1>
              <p className="text-ink-2 measure mt-6 text-lg">{workMeta.lede}</p>

              <dl className="mt-9 flex flex-wrap gap-x-[clamp(2rem,1rem+4vw,4.5rem)] gap-y-5">
                <div>
                  <dt className="label text-muted">Projects</dt>
                  <dd className="font-display mt-1 text-3xl tabular-nums">
                    {projectCount}
                  </dd>
                </div>
                <div>
                  <dt className="label text-grow">For sale today</dt>
                  <dd className="font-display text-grow mt-1 text-3xl tabular-nums">
                    {saleCount}
                  </dd>
                </div>
                {/* The joke carries the argument: a portfolio of pictures is
                    asking to be believed, a portfolio of links is not. */}
                <div>
                  <dt className="label text-muted">Screenshots</dt>
                  <dd className="font-display mt-1 text-3xl tabular-nums">0</dd>
                </div>
              </dl>
            </Reveal>
          </Container>
        </section>

        {workGroups.map((group, i) => (
          <WorkSection key={group.id} group={group} start={groupStarts[i]} />
        ))}

        {/* ---------- close ---------- */}
        <Section divided>
          <Container>
            <Reveal>
              <h2 className="max-w-[20ch] text-3xl">
                Every one of those opened in a new tab, which is the point.
              </h2>
              <p className="text-ink-2 measure mt-5">
                A portfolio of screenshots asks you to take somebody&rsquo;s
                word for it. These are live, so you can click the buttons, break
                something, and see what happens. If one of them is close to what
                you need, the next step is a twenty-minute call.
              </p>
              <p className="mt-7">
                <Link
                  href="/contact"
                  className="bg-ink text-paper hover:bg-ink-2 inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-tight transition-colors duration-200"
                >
                  Book a call
                </Link>
              </p>
            </Reveal>
          </Container>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
