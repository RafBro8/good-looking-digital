"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/** If the observer has not reported by now, show the content regardless. */
const FAILSAFE_MS = 1800;

/**
 * Reveals its children once they scroll into view.
 *
 * The hidden state lives in CSS behind html[data-js="true"], so this only has
 * to flip an attribute. Because the hidden state is opacity 0, the failure mode
 * is an invisible page — so there are three separate guarantees that content
 * always ends up visible:
 *
 *   1. no JS at all      → html[data-js] is never set, CSS never hides anything
 *   2. reduced motion    → shown immediately, no transition
 *   3. no observer fires → failsafe timer shows it anyway
 *
 * (3) matters more than it looks: IntersectionObserver only fires while the
 * page is actually rendering frames, so a tab opened in the background can sit
 * with nothing revealed until it is focused.
 */
export function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const show = () => node.setAttribute("data-shown", "true");

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      show();
      return;
    }

    const failsafe = window.setTimeout(show, FAILSAFE_MS);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          window.setTimeout(show, delay);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(node);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className ?? ""}`}>
      {children}
    </div>
  );
}
