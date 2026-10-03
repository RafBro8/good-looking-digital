import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * Strict-Transport-Security is deliberately absent: Vercel already sends
 * `max-age=63072000` on this domain, and setting it here as well would send
 * the header twice. If the site ever moves off Vercel, add it here.
 *
 * Content-Security-Policy is also absent, and is a separate piece of work.
 * Next.js injects inline scripts for hydration, so a strict policy needs a
 * per-request nonce through middleware. Added carelessly it renders a blank
 * page, so it does not belong in the same change as these four.
 */
const securityHeaders = [
  {
    // Stops a browser second-guessing a declared content type, which is how
    // an uploaded file gets treated as a script.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Send the full URL to ourselves, only the origin to other sites, and
    // nothing at all when leaving HTTPS. Keeps page paths out of other
    // people's analytics.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Nothing should ever frame this site. Clickjacking works by putting a
    // real page under an invisible one and stealing the clicks.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // The site asks for none of these, so refuse them for itself and for
    // anything it embeds. An empty list means "no origin, including this one".
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
