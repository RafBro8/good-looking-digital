"use client";

import { useEffect } from "react";

/**
 * Marks the row the address bar is pointing at.
 *
 * CSS :target should do this on its own, and on a full page load it does —
 * which is why the rows keep their target: classes as well. But the footer
 * links are client-side navigations, and those update location.hash through
 * the history API without firing hashchange. Measured on this site: after
 * clicking a second footer link, location.hash was the new row while :target
 * still matched the previous one. A highlight that is right on a cold load
 * and one behind after that is worse than no highlight, because it points
 * confidently at the wrong line.
 *
 * So the attribute is set here instead, from location.hash, on every event
 * that can change it — including a delegated click, which is the one the
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

    const applySoon = () => requestAnimationFrame(apply);

    /**
     * The router updates location.hash at a moment it does not announce, and
     * measurably later than the next animation frame — a single rAF after the
     * click left the highlight a navigation behind. So watch for the change
     * rather than guessing when it lands: re-apply each frame until the hash
     * moves, and give up shortly after in the case where it never does,
     * because clicking the link for the row you are already on is legitimate
     * and applying twice is harmless.
     */
    const WATCH_MS = 700;

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href*='#']");
      if (!link) return;

      const startedAt = performance.now();
      const hashBefore = window.location.hash;

      const watch = () => {
        apply();
        const changed = window.location.hash !== hashBefore;
        if (changed || performance.now() - startedAt > WATCH_MS) return;
        requestAnimationFrame(watch);
      };

      requestAnimationFrame(watch);
    };

    apply();
    window.addEventListener("hashchange", applySoon);
    window.addEventListener("popstate", applySoon);
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("hashchange", applySoon);
      window.removeEventListener("popstate", applySoon);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
