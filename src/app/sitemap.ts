import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * The pages worth indexing, and nothing else.
 *
 * Deliberately excludes /start (a QR destination, meaningless without the
 * card in someone's hand), /handled (reached only from a signed link in a
 * reminder email) and /design-system (an internal reference). All three are
 * marked noindex in their own metadata; leaving them out here as well means
 * the two statements agree rather than contradicting each other.
 *
 * URLs are built from site.url, so they follow the real domain the moment it
 * is attached rather than needing a second edit here.
 */

const PAGES = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/grow", changeFrequency: "monthly", priority: 0.9 },
  { path: "/platform", changeFrequency: "monthly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "yearly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PAGES.map((page) => ({
    url: `${site.url}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
