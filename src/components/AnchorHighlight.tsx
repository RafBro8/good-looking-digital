"use client";

import { useEffect } from "react";

/**
 * Marks the row the address bar is pointing at.
 *
 * CSS :target should do this on its own, and on a full page load it does -
 * which is why the rows keep their target: classes as well. But the footer
 * links are client-side navigations, and those update location.hash through
 * the history API without firing hashchange. Measured on this site: after
 * clicking a second footer link, location.hash was the new row while :target
 * still matched the previous one. A highlight that is right on a cold load
 * and one behind after that is worse than no highlight, because it points
 * confidently at the wrong line.
 *
 * So the attribute is set here instead, from location.hash, on every event
 * that can change it - including a delegated click, which is the one the
 * router does not announce.
 */
export function AnchorHighlight() {
  useEffect(() => {
    const apply = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      for (const row of document.querySelectorAll("[data-anchor-row]")) {
        row.toggleAttribute("data-current", Boolean(id) && row.id === id);
      }
    };

    /**
     * The router moves the hash through history.pushState, which fires no
     * event of its own - not hashchange, not popstate. Two timing guesses
     * failed here before this: one animation frame after the click was too
     * early, and a 700ms watch window passed alone and flaked in a loaded
     * parallel run, because the budget expired before the router got there.
     *
     * So take the signal rather than estimate it. Wrapping pushState and
     * replaceState means the highlight updates on the exact call that changes
     * the URL, with no polling and nothing to outrun. location.hash is already
     * current by the time these return.
     */
    const patched = (["pushState", "replaceState"] as const).map((name) => {
      const original = history[name];
      history[name] = function (
        this: History,
        ...args: Parameters<History["pushState"]>
      ) {
        const result = original.apply(this, args);
        apply();
        return result;
      };
      return [name, original] as const;
    });

    apply();
    // Still needed: back and forward, and any plain anchor that does not go
    // through the router at all.
    window.addEventListener("hashchange", apply);
    window.addEventListener("popstate", apply);

    return () => {
      window.removeEventListener("hashchange", apply);
      window.removeEventListener("popstate", apply);
      for (const [name, original] of patched) history[name] = original;
    };
  }, []);

  return null;
}
