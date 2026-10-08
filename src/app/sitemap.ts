import type { MetadataRoute } from "next";

import { services } from "@/lib/services";
import { towns } from "@/lib/towns";
import { site } from "@/lib/site";
import { caseStudyProjects } from "@/lib/work";

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
 *
 * The service pages are generated from services[] rather than listed, so a new
 * one appears here by existing. A hand-kept copy of that list would drift, and
 * a page missing from the sitemap is a page nobody finds.
 */

const PAGES = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/grow", changeFrequency: "monthly", priority: 0.9 },
  { path: "/platform", changeFrequency: "monthly", priority: 0.9 },
  // The proof behind both path pages, and the one a prospect sends to whoever
  // else has to agree before they can spend the money.
  { path: "/work", changeFrequency: "monthly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "yearly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.7 },
  // Indexable on purpose. Its first job is to be the link in an email to a
  // client who needs to sign something, but "sign a PDF without an account" is
  // the kind of low-competition phrase we can actually win.
  { path: "/sign", changeFrequency: "yearly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const fixed = PAGES.map((page) => ({
    url: `${site.url}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Below the two path pages they sit under, above the legal pages: a service
  // page is what somebody searching for the service should land on.
  const servicePages = services.map((service) => ({
    url: `${site.url}/services/${service.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Below /work itself, which is the page that lists them. A case study is
  // worth indexing on its own because it is the page that answers "have you
  // built anything like mine", but nobody arrives at the site looking for it.
  const caseStudyPages = caseStudyProjects.map((project) => ({
    url: `${site.url}/work/${project.caseStudy.slug}`,
    lastModified,
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  // Highest priority of the generated pages: a town page is the one a
  // local search should land on, and it is the reason the others get found.
  const townPages = towns.map((town) => ({
    url: `${site.url}/${town.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...fixed, ...servicePages, ...caseStudyPages, ...townPages];
}
