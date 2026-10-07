import Link from "next/link";

import { Container, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { audienceOf, featuredProjects, workTeaser } from "@/lib/work";

/**
 * The showcase, on the home page.
 *
 * /work is behind a nav link, and most visitors never touch nav. Four projects
 * here, spanning both halves of the business, with the rest one click away.
 *
 * Deliberately no thumbnails: the showcase argues that a portfolio of pictures
 * asks to be believed while a portfolio of links does not, and a row of
 * screenshots here would undercut it on the way in.
 */
export function WorkTeaser() {
  return (
    <section className="border-rule border-t py-[clamp(3rem,2rem+4vw,5.5rem)]">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <Eyebrow>{workTeaser.eyebrow}</Eyebrow>
              <h2 className="mt-3 max-w-[18ch] text-3xl">{workTeaser.title}</h2>
            </div>
            <Link
              href="/work"
              className="text-ink hover:text-muted text-sm font-semibold transition-colors duration-200"
            >
              {workTeaser.cta} &rarr;
            </Link>
          </div>
          <p className="text-ink-2 measure mt-5">{workTeaser.lede}</p>
        </Reveal>

        <ul className="mt-[clamp(2rem,1.25rem+2.5vw,3rem)] grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProjects.map((project, i) => {
            const isGrow = audienceOf(project) === "grow";
            return (
              <Reveal key={project.id} delay={i * 70}>
                <li className="list-none">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener"
                    aria-label={`${project.name}, ${project.kind}. Opens ${project.host} in a new tab.`}
                    /* Same reason as the rows on /work: a phone never fires
                       hover, so the pressed state has to carry the signal. */
                    className={`group -m-3 block rounded-sm p-3 transition-colors duration-200 ${
                      isGrow
                        ? "hover:bg-grow-soft active:bg-grow-soft"
                        : "hover:bg-platform-soft active:bg-platform-soft"
                    }`}
                  >
                    <span
                      className={`label block ${isGrow ? "text-grow" : "text-platform"}`}
                    >
                      {project.kind}
                    </span>
                    <span className="font-display mt-2 block text-xl tracking-tight">
                      {project.name}
                    </span>
                    <span className="text-ink-2 mt-2 block max-w-[28ch] text-sm">
                      {project.hook}
                    </span>
                    <span
                      className={`group-hover:text-ink mt-3 block text-sm font-semibold transition-colors duration-200 ${
                        isGrow ? "text-grow" : "text-platform"
                      }`}
                    >
                      {project.host} <span aria-hidden="true">&rarr;</span>
                    </span>
                  </a>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
