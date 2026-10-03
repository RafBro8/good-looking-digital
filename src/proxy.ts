import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps every host but the real one out of the search index.
 *
 * Vercel keeps `good-looking-digital.vercel.app` serving the same deployment
 * as the live domain, and it is fully crawlable: 200, `Allow: /`, no noindex.
 * Left alone it competes with the real site for the same pages.
 *
 * Redirecting it was the alternative and was rejected: it is the fallback when
 * something is wrong with the domain, which is exactly when you least want it
 * bouncing you somewhere else. So it keeps working and is simply not indexed.
 *
 * Canonical tags are the primary defence and every page now carries one. This
 * is the belt to those braces, and the only thing that helps for a URL a
 * crawler reached without parsing the HTML.
 *
 * The host is written out rather than imported from `site.ts`. Proxy is
 * bundled separately and may be deployed to the CDN, so the docs warn against
 * leaning on shared modules; importing `site` would also pull the whole copy
 * deck into the edge bundle to read one string. If the domain ever changes,
 * `site.url` and this constant change together.
 */
const CANONICAL_HOST = "goodlookingdigital.com";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Set by the proxy in front of us, and the host the visitor actually asked
  // for, which is the one a crawler would index.
  const host = request.headers.get("host");

  if (host && host !== CANONICAL_HOST) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  // Everything except the build output and files served straight from disk,
  // none of which a crawler indexes on its own.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
