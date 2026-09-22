import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/lib/db";
import { markResponded, verifyHandledToken } from "@/lib/reminders";

/**
 * Records that a human has dealt with an enquiry.
 *
 * POST only, and that is the whole point of the design. Mail clients and
 * security scanners fetch the links in a message before anyone reads it, so a
 * GET that marked a lead handled would silence reminders for enquiries nobody
 * had opened yet - the one failure this feature exists to prevent. The link in
 * the email therefore points at a page with a button, and the button posts
 * here.
 */

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let token = "";
  try {
    const body = (await request.json()) as { token?: unknown };
    token = typeof body.token === "string" ? body.token : "";
  } catch {
    token = "";
  }

  // Same answer for a bad token and a missing lead. Distinguishing them would
  // turn this into a way to ask whether a given id exists.
  if (!token || !verifyHandledToken(id, token)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  try {
    const result = await markResponded(id, new Date());

    if (result === "missing") {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    // "already" is a success from the clicker's point of view: the enquiry is
    // marked, which is what they wanted, and being told off for double
    // clicking helps nobody.
    return NextResponse.json({ ok: true, state: result });
  } catch (error) {
    console.error("[leads] could not mark the lead handled", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
