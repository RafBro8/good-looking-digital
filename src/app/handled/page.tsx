import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui";
import { MarkHandled } from "@/components/MarkHandled";

export const metadata: Metadata = {
  title: "Mark an enquiry as handled",
  // Reached only from a link in a reminder email, and the URL carries a token.
  // Nothing here belongs in a search result.
  robots: { index: false, follow: false },
};

/**
 * The landing page for the "already dealt with it?" link in a reminder.
 *
 * Renders a button and changes nothing on its own, which is deliberate: this
 * page is fetched by mail clients and link scanners before a human ever sees
 * it, so the act of loading it must be harmless.
 */
export default async function HandledPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id : "";
  const token = typeof params.t === "string" ? params.t : "";

  return (
    <main className="min-h-screen">
      <div className="flex h-1" aria-hidden="true">
        <span className="bg-grow flex-1" />
        <span className="bg-platform flex-1" />
      </div>

      <Container>
        <div className="mx-auto max-w-[40rem] py-[clamp(2rem,1.5rem+3vw,3.5rem)]">
          <Link
            href="/"
            className="font-display text-ink text-lg font-semibold tracking-tight"
          >
            Good Looking <span className="text-grow">Digital</span>
          </Link>

          {id && token ? (
            <>
              <h1 className="mt-8 text-3xl">Mark this enquiry as handled?</h1>
              <p className="text-ink-2 mt-5">
                This stops the follow-up reminder for enquiry{" "}
                <span className="font-mono text-sm">{id.slice(-6)}</span>. It
                does not change the enquiry itself, and nobody is emailed.
              </p>

              <div className="mt-8">
                <MarkHandled id={id} token={token} />
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-8 text-3xl">That link is incomplete.</h1>
              <p className="text-ink-2 mt-5">
                Open it again from the reminder email — the address carries a
                token that identifies the enquiry, and it may have been cut
                short on the way here.
              </p>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}
