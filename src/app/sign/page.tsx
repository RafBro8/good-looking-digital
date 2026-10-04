import type { Metadata } from "next";
import Link from "next/link";

import { Button, Container, Eyebrow, Section } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { signing, site } from "@/lib/site";

export const metadata: Metadata = {
  title: signing.metaTitle,
  description: signing.metaDescription,
  alternates: { canonical: "/sign" },
};

export default function SignPage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ---------- hero ---------- */}
        <section className="pt-[clamp(2.5rem,1.5rem+5vw,5rem)] pb-[clamp(2rem,1rem+3vw,3.5rem)]">
          <Container>
            <Reveal>
              <Eyebrow tone="grow">{signing.eyebrow}</Eyebrow>
              <h1 className="mt-3 max-w-[18ch] text-4xl">{signing.title}</h1>
              <p className="text-ink-2 measure mt-6 text-lg">{signing.lede}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button
                  href={signing.toolUrl}
                  tone="grow"
                  target="_blank"
                  rel="noopener"
                >
                  Open the signing tool
                </Button>
                <p className="text-muted text-sm">
                  Opens {signing.toolName} in a new tab. Free, no sign-up.
                </p>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* ---------- how it works ---------- */}
        <Section divided>
          <Container>
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-3 max-w-[22ch] text-3xl">
                Three steps, no account.
              </h2>
            </Reveal>

            <ol className="mt-10 grid gap-10 md:grid-cols-3">
              {signing.steps.map((step, index) => (
                <li key={step.title}>
                  <Reveal delay={index * 80}>
                    <p className="label text-grow">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                    <p className="text-ink-2 mt-2 text-sm leading-relaxed">
                      {step.body}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        {/* ---------- install it ---------- */}
        <Section divided>
          <Container>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <Reveal>
                <Eyebrow>Keep it on your device</Eyebrow>
                <h2 className="mt-3 max-w-[20ch] text-3xl">
                  Install it once and it works offline.
                </h2>
                <p className="text-ink-2 mt-5 text-sm leading-relaxed">
                  You never have to install anything, and the tool works
                  perfectly well in a browser tab. But if you sign things often,
                  installing it puts an icon on your computer or phone. It then
                  opens in its own window and keeps working with no internet
                  connection at all.
                </p>
                <p className="text-muted mt-4 text-sm leading-relaxed">
                  Every browser hides this in a different place, which is why it
                  is worth spelling out.
                </p>
              </Reveal>

              <Reveal delay={80}>
                <dl className="divide-rule divide-y">
                  {signing.install.map((option) => (
                    <div key={option.where} className="py-4 first:pt-0">
                      <dt className="text-sm font-semibold">{option.where}</dt>
                      <dd className="text-ink-2 mt-1 text-sm leading-relaxed">
                        {option.how}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </Container>
        </Section>

        {/* ---------- why it is private ---------- */}
        <Section divided>
          <Container>
            <Reveal>
              <Eyebrow>Why we point you here</Eyebrow>
              <h2 className="mt-3 max-w-[24ch] text-3xl">
                Your contract is nobody else&rsquo;s business.
              </h2>
            </Reveal>

            <ul className="measure mt-8 grid gap-4">
              {signing.privacy.map((point, index) => (
                <li key={point}>
                  <Reveal delay={index * 70}>
                    <p className="text-ink-2 flex gap-3 text-base leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="bg-grow mt-2.5 block h-px w-5 shrink-0"
                      />
                      {point}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ul>

            <Reveal delay={240}>
              <p className="text-muted measure mt-8 text-sm leading-relaxed">
                Most signing services upload your document to their servers to
                work. This one does not, because it does not have any. We built
                it that way on purpose, and we built it ourselves.
              </p>
            </Reveal>
          </Container>
        </Section>

        {/* ---------- the lead line ---------- */}
        <Section divided>
          <Container>
            <Reveal>
              <div className="border-rule bg-surface-2 border p-[clamp(1.75rem,1rem+3vw,3rem)]">
                <Eyebrow tone="platform">For businesses</Eyebrow>
                <h2 className="mt-3 max-w-[26ch] text-2xl">
                  Want signing built into your own website?
                </h2>
                <p className="text-ink-2 measure mt-4 text-base leading-relaxed">
                  We can put it on your site under your own branding, with your
                  documents ready to go and the signed file sent wherever it
                  needs to land. It is the same tool you just used, which is one
                  way of showing what we build.
                </p>
                <div className="mt-6">
                  <Button href="/contact" variant="outline" tone="platform">
                    Talk to us about it
                  </Button>
                </div>
              </div>
            </Reveal>
          </Container>
        </Section>

        {/* ---------- back out ---------- */}
        <Section divided>
          <Container>
            <p className="text-muted text-sm">
              Signing something we sent you, and stuck?{" "}
              <Link
                href="/contact"
                className="text-ink hover:text-grow underline underline-offset-4"
              >
                Tell us
              </Link>{" "}
              or call {site.phone} and we will walk you through it.
            </p>
          </Container>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
