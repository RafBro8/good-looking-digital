import { NextResponse } from "next/server";

import { getDb, isDatabaseConfigured } from "@/lib/db";

/**
 * Is this site actually working?
 *
 * Exists for an external monitor, which is the only thing that can answer that
 * question honestly. Vercel's own dashboard reports on Vercel: it stays green
 * while the page it serves from the edge cache is fine and the database behind
 * the contact form has been unreachable for two days. A check from outside,
 * against something that touches the database, is what catches that.
 *
 * So this does the one thing a static page cannot: it asks Mongo whether it is
 * there. If the answer is no, the form is broken and enquiries are being lost,
 * which is the failure worth being woken up for.
 */

/** Never cached. A cached "ok" is a monitor watching a photograph. */
export const dynamic = "force-dynamic";

/**
 * Said out loud rather than left to be inferred.
 *
 * force-dynamic stops Next prerendering this, and measured against a
 * production build the response carries no cache-control header at all -
 * which is not the same as saying "do not store this". Any proxy between the
 * monitor and the site is then free to apply its own heuristics, and a cached
 * "ok" would have the monitor reporting green through an outage.
 */
const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

/**
 * Well under the five minute gap between checks, and under Vercel's function
 * limit, so a hung database returns a failure rather than a timeout the
 * monitor has to interpret.
 */
const PING_TIMEOUT_MS = 4000;

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE });
  }

  try {
    const db = await getDb();
    await Promise.race([
      db.command({ ping: 1 }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("ping timed out")), PING_TIMEOUT_MS),
      ),
    ]);

    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (error) {
    // Logged in full for us, and deliberately not returned. This endpoint is
    // public and unauthenticated, so the response says whether the site works
    // and nothing else - no driver message, no host, no version, nothing that
    // describes the shape of the infrastructure to someone probing it.
    console.error("[health] database unreachable", error);
    return NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE });
  }
}
