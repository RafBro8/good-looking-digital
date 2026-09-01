/**
 * The logo mark, drawn inline rather than loaded as an image.
 *
 * Inline is the point: the strokes take `currentColor`, so the mark follows the
 * theme and whatever colour its container sets without a second file, a variant
 * swap, or a network request. The same three paths live in
 * brand-source/vector/gld-mark.svg, which is the file that goes to a printer.
 *
 * Geometry is documented in that file. The short version: cap height 48, stroke
 * 11, G a circle at r 18.5, D an ellipse at rx 24 / ry 18.5 so its counter is
 * not strangled by its own stem.
 */

const PATH_G = "M37.75 11.62 A18.5 18.5 0 1 0 37.75 36.38 L37.75 24 L28 24";
const PATH_L = "M62 6 L62 42 L80 42";
const PATH_D = "M98 42.5 L98 5.5 A24 18.5 0 0 1 98 42.5";

export function BrandMark({
  className,
  tone = "current",
  label,
}: {
  className?: string;
  /** "current" inherits colour from the container. "two" says both paths. */
  tone?: "current" | "two";
  /**
   * Accessible name. Leave it off wherever the wordmark is already adjacent —
   * a mark and a name that both announce "Good Looking Digital" is one too many.
   */
  label?: string;
}) {
  const two = tone === "two";

  return (
    <svg
      viewBox="0 0 127.5 48"
      className={`h-auto ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={11}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true, focusable: false })}
    >
      <path d={PATH_G} {...(two && { stroke: "var(--grow)" })} />
      <path d={PATH_L} {...(two && { stroke: "var(--ink)" })} />
      <path d={PATH_D} {...(two && { stroke: "var(--platform)" })} />
    </svg>
  );
}
