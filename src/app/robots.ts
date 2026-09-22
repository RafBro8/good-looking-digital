import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Crawlers are welcome everywhere except the three pages that exist for a
 * specific person holding a specific link.
 *
 * Each of those also carries its own noindex, which is the setting that
 * actually keeps a page out of results - a Disallow here only stops the page
 * being fetched, and a URL that is linked from somewhere else can still be
 * listed without ever being crawled. Both are set so neither has to be the
 * only line of defence.
 *
 * /api is disallowed because there is nothing there a search engine should
 * be spending its crawl budget on.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/start", "/handled", "/design-system"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
