import Link from "next/link";

import { Container, Eyebrow } from "@/components/ui";
import { PathCard } from "@/components/PathCard";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TestRunPanel } from "@/components/TestRunPanel";
import { capabilities, paths, proofPoints, site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ================= hero =================
            Variant 2's composition at Variant 1's headline scale: the index
            column stands in for the photograph we deliberately do not have,
            and the two coloured buttons route both buyers immediately. */}
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(2rem,1rem+3vw,3.5rem)]">
          <Container>
            <div className="grid items-end gap-[clamp(2rem,1rem+4vw,4.5rem)] lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
              <div>
                <p
                  className="label text-muted rise flex items-center gap-3 before:block before:h-px before:w-7 before:bg-[var(--grow)] before:content-['']"
                  style={{ "--delay": "0ms" } as React.CSSProperties}
                >
                  {site.region} — and anywhere with a browser
                </p>

                <h1
                  className="rise mt-7 max-w-[13ch] text-6xl"
                  style={{ "--delay": "90ms" } as React.CSSProperties}
                >
                  Looks good. Works{" "}
                  <em className="text-grow not-italic">even better</em>.
                </h1>

                <p
                  className="text-ink-2 rise mt-8 max-w-[40ch] text-xl"
                  style={{ "--delay": "170ms" } as React.CSSProperties}
                >
                  Websites and branding for local businesses. Applications,
                  portals and automated testing for companies that outgrew their
                  website.
                </p>

                <div
                  className="rise mt-9 flex flex-wrap gap-3"
                  style={{ "--delay": "240ms" } as React.CSSProperties}
                >
                  <Link
                    href="/grow"
                    className="bg-grow text-grow-ink px-6 py-3.5 text-sm font-bold transition-opacity duration-200 hover:opacity-90"
                  >
                    Grow my business →
                  </Link>
                  <Link
                    href="/platform"
                    className="bg-platform text-platform-ink px-6 py-3.5 text-sm font-bold transition-opacity duration-200 hover:opacity-90"
                  >
                    Build my platform →
                  </Link>
                </div>
              </div>

              {/* The index — typography doing the job an image would */}
              <ol
                className="border-ink rise border-t-2 pt-3"
                style={{ "--delay": "320ms" } as React.CSSProperties}
              >
                {capabilities.map((capability, i) => (
                  <li
                    key={capability.name}
                    className="border-rule grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-3 border-b py-2.5"
                  >
                    <span className="label tnum text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-sm font-semibold tracking-tight ${
                        capability.path === "grow"
                          ? "text-grow"
                          : capability.path === "platform"
                            ? "text-platform"
                            : "text-ink"
                      }`}
                    >
                      {capability.name}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Container>

          {/* Ticker — the industries and systems we build for */}
          <div className="border-rule mt-[clamp(2rem,1.5rem+2.5vw,3.25rem)] overflow-hidden border-y py-3.5 whitespace-nowrap">
            <div className="ticker-track">
              {[0, 1].map((copy) => (
                <span
                  key={copy}
                  className="label text-muted"
                  aria-hidden={copy === 1}
                >
                  {[
                    "Roofers",
                    "Landscapers",
                    "Salons",
                    "Dentists",
                    "Contractors",
                    "Realtors",
                    "Restaurants",
                    "Attorneys",
                    "Customer portals",
                    "Booking systems",
                    "Staff dashboards",
                  ].join("  ·  ")}
                  {"  ·  "}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============= canvas + the split =============
            The two doors overlap the canvas rather than sitting below it —
            the layering is what stops this reading as a stack of boxes. */}
        <section id="paths" className="relative">
          <div
            className="canvas h-[clamp(11rem,7rem+18vw,22rem)] w-full"
            aria-hidden="true"
          />

          <Container>
            <div className="relative -mt-[clamp(6rem,4rem+10vw,13rem)]">
              <Reveal>
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-2xl text-white drop-shadow-sm">
                    Two kinds of client. One standard of work.
                  </h2>
                  <p className="label text-white/80">Choose your side</p>
                </div>
              </Reveal>

              <div className="border-rule bg-rule grid gap-px border shadow-[var(--shadow-md)] sm:grid-cols-2">
                {paths.map((path, i) => (
                  <Reveal key={path.id} delay={i * 110}>
                    <PathCard path={path} />
                  </Reveal>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ================= proof ================= */}
        <section className="py-[clamp(3rem,2rem+4vw,5.5rem)]">
          <Container>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {proofPoints.map((point, i) => (
                <Reveal key={point.figure} delay={i * 80}>
                  <p className="font-display text-ink text-4xl leading-none font-semibold tracking-tight">
                    {point.figure}
                  </p>
                  <p className="text-muted mt-3 max-w-[22ch] text-sm">
                    {point.note}
                  </p>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ================= capabilities ================= */}
        <section className="border-rule border-t py-[clamp(3rem,2rem+4vw,5.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow>What we do</Eyebrow>
              <h2 className="mt-3 max-w-[18ch] text-3xl">
                Everything between an idea and a customer calling you
              </h2>
            </Reveal>

            <div className="mt-12">
              {capabilities.map((capability, i) => (
                <Reveal key={capability.name} delay={i * 60}>
                  <div className="border-rule group grid items-baseline gap-x-8 gap-y-2 border-b py-6 md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.6fr)]">
                    <span className="label tnum text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3
                      className={`text-xl transition-colors duration-200 ${
                        capability.path === "grow"
                          ? "group-hover:text-grow"
                          : capability.path === "platform"
                            ? "group-hover:text-platform"
                            : "group-hover:text-ink-2"
                      }`}
                    >
                      {capability.name}
                    </h3>
                    <p className="text-ink-2 text-sm leading-relaxed">
                      {capability.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ================= proof panel ================= */}
        <section className="border-rule border-t py-[clamp(3rem,2rem+4vw,5.5rem)]">
          <Container>
            <div className="grid items-center gap-[clamp(2rem,1rem+4vw,4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <Reveal>
                <Eyebrow tone="platform">Why it keeps working</Eyebrow>
                <h2 className="mt-3 max-w-[16ch] text-3xl">
                  Every site we ship gets tested like software
                </h2>
                <p className="text-ink-2 mt-5 max-w-[42ch]">
                  Most agencies hand over a website and hope. We write automated
                  tests over the flows that lose you money when they break —
                  then run them on every change, so a broken booking form is
                  caught by us rather than reported by your customer.
                </p>
                <p className="text-ink-2 mt-4 max-w-[42ch]">
                  We do this on applications we did not build, too.
                </p>
                <Link
                  href="/platform"
                  className="text-platform mt-7 inline-block text-sm font-semibold hover:opacity-75"
                >
                  Explore platform work →
                </Link>
              </Reveal>

              <Reveal delay={120}>
                <TestRunPanel />
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ================= closing ================= */}
        <section className="canvas py-[clamp(3.5rem,2rem+6vw,7rem)]">
          <Container>
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div>
                  <h2 className="max-w-[16ch] text-4xl text-white">
                    Tell us what your business needs to{" "}
                    <em className="text-grow not-italic">do</em>.
                  </h2>
                  <p className="mt-5 max-w-[44ch] text-white/80">
                    Describe the work and who you want calling you. You will get
                    a plan and a price, not a brochure.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="bg-grow text-grow-ink px-7 py-4 text-sm font-bold whitespace-nowrap transition-opacity duration-200 hover:opacity-90"
                >
                  Start a project →
                </Link>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
