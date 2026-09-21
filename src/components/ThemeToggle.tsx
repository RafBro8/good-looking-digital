"use client";

/**
 * Explicit light/dark switch.
 *
 * Deliberately holds no React state: the current theme lives on <html> and the
 * two labels are swapped by CSS (see .theme-label-* in globals.css). That means
 * no hydration mismatch, no flash of the wrong label, and no effect at all.
 */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const stamped = root.getAttribute("data-theme");

    const current =
      stamped === "light" || stamped === "dark"
        ? stamped
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);

    try {
      localStorage.setItem("gld-theme", next);
    } catch {
      // storage blocked — the switch still works for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      className={`label border-rule-strong text-muted hover:border-ink hover:text-ink inline-flex items-center gap-2 border px-2.5 py-1.5 transition-colors duration-200 ${className ?? ""}`}
    >
      {/*
        The word goes at the narrowest widths, the symbol stays. At 320px the
        header ran 29px past the viewport and the page does not scroll
        sideways, so the overflow was clipped — and what got cut was the end
        of the phone number, which is the one thing a contractor is looking
        for. Dropping the word recovers about forty. This is inside the
        button rather than in the layout on purpose: an earlier attempt to
        wrap the header row fixed 320 and made the header 168px tall at 360.
        The button keeps its aria-label either way, so nothing is lost to a
        screen reader.
      */}
      <span className="theme-label-dark inline-flex items-center gap-2">
        <span aria-hidden="true">◑</span>
        <span className="max-[359px]:hidden">Dark</span>
      </span>
      <span className="theme-label-light inline-flex items-center gap-2">
        <span aria-hidden="true">◐</span>
        <span className="max-[359px]:hidden">Light</span>
      </span>
    </button>
  );
}
