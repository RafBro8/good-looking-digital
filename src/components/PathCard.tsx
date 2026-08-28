import Link from "next/link";

import { Eyebrow } from "@/components/ui";
import type { ServicePath } from "@/lib/site";

/**
 * One of the two doors from concept A, wearing concept B's typography.
 * The whole card is the click target; the accent colour identifies the path.
 */
export function PathCard({ path }: { path: ServicePath }) {
  const isGrow = path.id === "grow";

  return (
    <Link
      href={path.href}
      className={`group bg-surface flex flex-col gap-5 p-[clamp(1.5rem,1rem+2vw,2.75rem)] transition-colors duration-200 ${
        isGrow ? "hover:bg-grow-soft" : "hover:bg-platform-soft"
      }`}
    >
      <Eyebrow tone={isGrow ? "grow" : "platform"}>{path.eyebrow}</Eyebrow>

      <h2 className="max-w-[13ch] text-3xl">{path.title}</h2>

      <p className="text-ink-2 max-w-[36ch]">{path.blurb}</p>

      <ul className="mt-1 flex flex-col">
        {path.services.map((service) => (
          <li
            key={service.name}
            className="border-rule flex items-baseline justify-between gap-4 border-b py-2.5 text-sm"
          >
            <span className="text-ink-2">{service.name}</span>
            <span className="label tnum text-muted whitespace-nowrap">
              {service.price}
            </span>
          </li>
        ))}
      </ul>

      <span
        className={`mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold ${
          isGrow ? "text-grow" : "text-platform"
        }`}
      >
        {path.cta}
        <span
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  );
}
