import type { Metadata } from "next";

import { Container, Eyebrow } from "@/components/ui";
import { PathPageLayout } from "@/components/PathPageLayout";
import { Reveal } from "@/components/Reveal";
import { pathContent, serviceArea } from "@/lib/site";

export const metadata: Metadata = {
  title: pathContent.grow.metaTitle,
  description: pathContent.grow.metaDescription,
};

export default function GrowPage() {
  return (
    <PathPageLayout pathId="grow">
      {/* Service area — the local-trust signal, and the seed for the
          per-town landing pages built in Stage 07. */}
      <section className="border-rule border-t py-[clamp(2.75rem,2rem+3vw,4.5rem)]">
        <Container>
          <Reveal>
            <Eyebrow tone="grow">Where we work</Eyebrow>
            <h2 className="mt-3 max-w-[20ch] text-3xl">
              Close enough to shake your hand
            </h2>
            <p className="text-ink-2 measure mt-4">
              Being local matters for this kind of work. We can meet at your
              shop, photograph the job, and drop signage off ourselves. Plenty
              of clients are further afield and that works fine too — but if you
              are nearby, you get a person rather than a ticket queue.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {serviceArea.map((town) => (
                <li key={town} className="label text-ink">
                  {town}
                </li>
              ))}
              <li className="label text-muted">and surrounding Chicagoland</li>
            </ul>
          </Reveal>
        </Container>
      </section>
    </PathPageLayout>
  );
}
