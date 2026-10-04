import type { NextConfig } from "next";

/**
 * Content-Security-Policy, without a nonce, on purpose.
 *
 * Next's own documentation is explicit that nonces "must use dynamic
 * rendering". This site is almost entirely static, which is why it is fast
 * and why it is served from the edge rather than from a function on every
 * request. Trading that away to harden a brochure site with no logins, no
 * accounts and no user content rendered back to anyone would be a poor deal.
 *
 * So `'unsafe-inline'` stands for scripts and styles: Next injects inline
 * bootstrap scripts to hydrate, and the pages set inline custom properties
 * for their animation delays.
 *
 * What this policy is really for is the other half: every request this site
 * makes is same-origin, verified by watching the network on the live site,
 * and `default-src 'self'` is what keeps it that way. The privacy notice
 * promises nothing loads from a third party. This is the promise enforced by
 * the browser rather than by good intentions.
 *
 * `frame-ancestors`, `base-uri`, `form-action` and `object-src` are worth
 * having regardless, and none of them are weakened by inline scripts.
 */
const isDev = process.env.NODE_ENV === "development";

// React calls eval in development to rebuild stack traces across the server
// and client boundary. It never does in production, so the allowance stops at
// the dev server rather than shipping.
const devOnlyEval = isDev ? " 'unsafe-eval'" : "";

// Hot reload talks over a WebSocket, and `'self'` does not cover the `ws:`
// scheme in Chrome. Production has no such socket.
const devOnlySocket = isDev ? " ws: wss:" : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${devOnlyEval}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${devOnlySocket}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // `upgrade-insecure-requests` is deliberately absent. In production it has
  // nothing to do: Vercel sends HSTS for two years and every request this site
  // makes is same-origin HTTPS, so there is no insecure request to upgrade.
  // Against the test server, which is plain http on 127.0.0.1, it is actively
  // harmful: WebKit does not exempt loopback from the upgrade the way Chromium
  // and Firefox do, so client-side navigation fetches were rewritten to an
  // https port with nothing listening and the router silently stopped moving.
].join("; ");

/**
 * Security headers applied to every response.
 *
 * Strict-Transport-Security is deliberately absent: Vercel already sends
 * `max-age=63072000` on this domain, and setting it here as well would send
 * the header twice. If the site ever moves off Vercel, add it here.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
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
