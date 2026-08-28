import { Button, Container, Eyebrow, Section } from "@/components/ui";
import { PathCard } from "@/components/PathCard";
import { TestRunPanel } from "@/components/TestRunPanel";
import { paths, site } from "@/lib/site";

export const metadata = {
  title: "Design system",
  description:
    "Stage 02 — the palette, type scale and components the Good Looking Digital site is built from.",
};

const swatches = [
  { name: "paper", token: "--paper", className: "bg-paper" },
  { name: "surface", token: "--surface", className: "bg-surface" },
  { name: "surface-2", token: "--surface-2", className: "bg-surface-2" },
  { name: "ink", token: "--ink", className: "bg-ink" },
  { name: "ink-2", token: "--ink-2", className: "bg-ink-2" },
  { name: "muted", token: "--muted", className: "bg-muted" },
  { name: "rule", token: "--rule", className: "bg-rule" },
  { name: "grow", token: "--grow", className: "bg-grow" },
  { name: "grow-soft", token: "--grow-soft", className: "bg-grow-soft" },
  { name: "platform", token: "--platform", className: "bg-platform" },
  {
    name: "platform-soft",
    token: "--platform-soft",
    className: "bg-platform-soft",
  },
  { name: "pass", token: "--pass", className: "bg-pass" },
];

const scale = [
  { name: "5xl", className: "text-5xl", note: "hero only" },
  { name: "4xl", className: "text-4xl", note: "page titles" },
  { name: "3xl", className: "text-3xl", note: "section headings" },
  { name: "2xl", className: "text-2xl", note: "card headings" },
  { name: "xl", className: "text-xl", note: "lede paragraphs" },
];

export default function DesignSystemPage() {
  return (
    <main>
      {/* ---------- masthead ---------- */}
      <Container>
        <header className="border-rule-strong border-b py-[clamp(2.5rem,1.5rem+5vw,5rem)]">
          <Eyebrow>Stage 02 — foundation</Eyebrow>
          <h1 className="mt-5 max-w-[16ch] text-4xl">
            The design system, before the site
          </h1>
          <p className="measure text-ink-2 mt-5 text-xl">
            Structure from concept A, surface from B, proof from C. Two signal
            colours carry the two customer paths and nothing else uses them, so
            colour stays information rather than decoration.
          </p>
          <p className="measure text-ink-2 mt-4">
            Switch your system between light and dark — every token below is
            defined for both, and the accents were picked to hold contrast on
            either ground.
          </p>
        </header>
      </Container>

      {/* ---------- palette ---------- */}
      <Container>
        <Section>
          <Eyebrow tone="grow">Palette</Eyebrow>
          <h2 className="mt-3 text-2xl">
            Cool neutrals, two warm-cool signals
          </h2>
          <div className="border-rule bg-rule mt-8 grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-px border">
            {swatches.map((swatch) => (
              <div key={swatch.name} className="bg-surface p-3">
                <div
                  className={`border-rule h-14 w-full border ${swatch.className}`}
                />
                <p className="label text-ink mt-2.5">{swatch.name}</p>
                <p className="label text-muted mt-0.5">{swatch.token}</p>
              </div>
            ))}
          </div>
        </Section>
      </Container>

      {/* ---------- type ---------- */}
      <Container>
        <Section divided>
          <Eyebrow tone="platform">Typography</Eyebrow>
          <h2 className="mt-3 text-2xl">
            Fraunces for voice, Archivo for work, JetBrains for data
          </h2>
          <p className="measure text-ink-2 mt-4">
            A serif display against a grotesque body is what separates this from
            the identical sans-on-sans look every competitor around Mokena is
            using. Mono is reserved for labels, prices and anything with digits.
          </p>

          <div className="mt-9 flex flex-col gap-6">
            {scale.map((step) => (
              <div
                key={step.name}
                className="border-rule grid items-baseline gap-x-6 gap-y-1 border-b pb-5 sm:grid-cols-[5rem_minmax(0,1fr)]"
              >
                <span className="label text-muted">
                  {step.name} · {step.note}
                </span>
                <p className={`${step.className} font-display`}>
                  Looks good. Works even better.
                </p>
              </div>
            ))}
            <div className="border-rule grid items-baseline gap-x-6 gap-y-1 border-b pb-5 sm:grid-cols-[5rem_minmax(0,1fr)]">
              <span className="label text-muted">base · body</span>
              <p className="measure text-ink-2">
                We design and build websites for businesses around Chicagoland —
                and the software behind them when a website is no longer enough.
                Every site we ship gets tested like software.
              </p>
            </div>
            <div className="grid items-baseline gap-x-6 gap-y-1 sm:grid-cols-[5rem_minmax(0,1fr)]">
              <span className="label text-muted">label · mono</span>
              <p className="label text-ink">
                Mokena, Illinois — and anywhere with a browser
              </p>
            </div>
          </div>
        </Section>
      </Container>

      {/* ---------- buttons ---------- */}
      <Container>
        <Section divided>
          <Eyebrow>Controls</Eyebrow>
          <h2 className="mt-3 text-2xl">
            Buttons carry their path&rsquo;s tone
          </h2>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="#" tone="ink">
              Start a project
            </Button>
            <Button href="#" tone="grow">
              Grow my business
            </Button>
            <Button href="#" tone="platform">
              Build my platform
            </Button>
            <Button href="#" variant="outline" tone="ink">
              Book an assessment
            </Button>
            <Button href="#" variant="outline" tone="grow">
              See pricing
            </Button>
          </div>
        </Section>
      </Container>

      {/* ---------- the split ---------- */}
      <Container>
        <Section divided>
          <Eyebrow>The split</Eyebrow>
          <h2 className="mt-3 text-2xl">
            Concept A&rsquo;s two doors, in the new palette
          </h2>
          <p className="measure text-ink-2 mt-4">
            This is the component the whole homepage turns on. A roofer and a
            technology director should each know which side is theirs within a
            second of the page loading.
          </p>
          <div className="border-rule bg-rule mt-8 grid gap-px border sm:grid-cols-2">
            {paths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        </Section>
      </Container>

      {/* ---------- proof ---------- */}
      <Container>
        <Section divided>
          <Eyebrow tone="platform">Proof</Eyebrow>
          <h2 className="mt-3 text-2xl">The test run, moved off the hero</h2>
          <div className="mt-8 grid items-center gap-[clamp(1.5rem,1rem+3vw,3.5rem)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div>
              <p className="measure text-ink-2">
                In concept C this led the page, which read as intimidating to a
                local client. Here it sits on the platform side, where it does
                the same job without asking a landscaper to care about browser
                matrices.
              </p>
              <p className="measure text-ink-2 mt-4">
                The spec names are written the way a customer would describe
                them, not the way the files are named. That is the difference
                between proof and jargon.
              </p>
            </div>
            <TestRunPanel />
          </div>
        </Section>
      </Container>

      {/* ---------- footer ---------- */}
      <Container>
        <footer className="border-rule-strong flex flex-wrap justify-between gap-3 border-t py-8">
          <p className="label text-muted">
            {site.name} — {site.base}
          </p>
          <p className="label text-muted">Stage 02 · design system</p>
        </footer>
      </Container>
    </main>
  );
}
