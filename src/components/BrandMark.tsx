import Image from "next/image";

/**
 * The logo mark, presented as a framed object.
 *
 * The source renders have no alpha channel — each is baked onto an opaque
 * rectangle — so the mark cannot float on the page background without showing
 * a visible square. Rather than fight that, the square is made deliberate: the
 * mark sits in its own frame, the way a photograph would.
 *
 * Two files because the baked background has to match the surrounding theme.
 * CSS picks which one shows, using the same three-state pattern as the palette
 * (bare :root, OS preference, explicit stamp) so there is no flash and no
 * hydration mismatch.
 */
export function BrandMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`border-rule relative overflow-hidden border ${className ?? ""}`}
    >
      <Image
        src="/brand/mark-navy-800.webp"
        alt="The Good Looking Digital mark — a ribbon monogram forming a G and a D as a continuous loop"
        width={800}
        height={800}
        priority={priority}
        className="mark-dark h-auto w-full"
      />
      <Image
        src="/brand/mark-light-800.webp"
        alt=""
        aria-hidden="true"
        width={800}
        height={800}
        priority={priority}
        className="mark-light h-auto w-full"
      />
    </div>
  );
}
