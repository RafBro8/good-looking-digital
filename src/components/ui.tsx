import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

function cx(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Page gutter and max width. Everything on the site sits inside one of these. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "mx-auto w-full max-w-[76rem] px-[clamp(1.1rem,0.4rem+2.6vw,3rem)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Vertical rhythm between major page bands, with an optional hairline above. */
export function Section({
  as: Tag = "section",
  divided = false,
  className,
  children,
}: {
  as?: ElementType;
  divided?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cx(
        "py-[clamp(2.75rem,1.5rem+4vw,5rem)]",
        divided && "border-rule border-t",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Uppercase mono label. `tone` ties it to one of the two customer paths. */
export function Eyebrow({
  tone = "muted",
  className,
  children,
}: {
  tone?: "muted" | "grow" | "platform";
  className?: string;
  children: ReactNode;
}) {
  const tones = {
    muted: "text-muted",
    grow: "text-grow",
    platform: "text-platform",
  };
  return <p className={cx("label", tones[tone], className)}>{children}</p>;
}

type ButtonProps = {
  variant?: "solid" | "outline" | "quiet";
  tone?: "ink" | "grow" | "platform";
} & ComponentPropsWithoutRef<"a">;

/**
 * Anchor-based button. Tone follows the customer path it belongs to so the
 * colour keeps carrying information rather than becoming decoration.
 */
export function Button({
  variant = "solid",
  tone = "ink",
  className,
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-tight transition-colors duration-200";

  const solid = {
    ink: "bg-ink text-paper hover:bg-ink-2",
    grow: "bg-grow text-grow-ink hover:opacity-90",
    platform: "bg-platform text-platform-ink hover:opacity-90",
  };

  const outline = {
    ink: "border border-rule-strong text-ink hover:border-ink",
    grow: "border border-grow text-grow hover:bg-grow-soft",
    platform: "border border-platform text-platform hover:bg-platform-soft",
  };

  const quiet = {
    ink: "text-ink hover:text-muted px-0 py-0",
    grow: "text-grow hover:opacity-75 px-0 py-0",
    platform: "text-platform hover:opacity-75 px-0 py-0",
  };

  const variants = { solid, outline, quiet };

  return (
    <a className={cx(base, variants[variant][tone], className)} {...rest}>
      {children}
    </a>
  );
}

/** Hairline rule. Used instead of card borders wherever possible. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cx("border-rule border-0 border-t", className)} />;
}
