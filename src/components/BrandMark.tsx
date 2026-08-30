import Image from "next/image";

/**
 * The logo mark.
 *
 * The source renders were opaque with no alpha channel, and none of the six
 * baked backgrounds matched --paper in either theme. The mark is now cut out
 * and recoloured into the site palette by scripts/recolour-mark.js, so a single
 * transparent file works on both themes — no variant swap, no framed square.
 */
export function BrandMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/mark-800.webp"
      alt="The Good Looking Digital mark — a ribbon monogram forming a G and a D as one continuous loop"
      width={800}
      height={800}
      priority={priority}
      className={`h-auto w-full ${className ?? ""}`}
    />
  );
}
