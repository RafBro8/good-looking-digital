"use client";

import { useState } from "react";

/**
 * The button behind a "already dealt with it?" link in a reminder email.
 *
 * A button rather than a link because mail clients prefetch links, and a
 * prefetched GET would mark enquiries handled that nobody had read. Clicking
 * the link only opens this page; the state change needs a deliberate press.
 */

type State = "idle" | "working" | "done" | "failed";

export function MarkHandled({ id, token }: { id: string; token: string }) {
  const [state, setState] = useState<State>("idle");

  async function submit() {
    setState("working");
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(id)}/handled`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setState(res.ok ? "done" : "failed");
    } catch {
      setState("failed");
    }
  }

  if (state === "done") {
    return (
      <div className="border-rule bg-raise rounded-lg border p-6">
        <p className="text-ink font-semibold">Marked as handled.</p>
        <p className="text-ink-2 mt-2">
          No reminder will be sent for this enquiry. You can close this tab.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={submit}
        disabled={state === "working"}
        className="bg-ink text-canvas rounded-lg px-6 py-3 font-semibold transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
      >
        {state === "working" ? "Marking…" : "Yes, I have dealt with this"}
      </button>

      {state === "failed" && (
        <p className="text-ink-2 mt-4" role="alert">
          That did not work. The link may have been altered in transit — try
          opening it again from the original email.
        </p>
      )}
    </div>
  );
}
