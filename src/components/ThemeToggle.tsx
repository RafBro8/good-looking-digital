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
      <span className="theme-label-dark inline-flex items-center gap-2">
        <span aria-hidden="true">◑</span>
        Dark
      </span>
      <span className="theme-label-light inline-flex items-center gap-2">
        <span aria-hidden="true">◐</span>
        Light
      </span>
    </button>
  );
}
