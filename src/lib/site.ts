/**
 * Single source of truth for site-wide content.
 * Copy lives here rather than in components so it can be edited without
 * touching layout code, and so the same service list can feed a page,
 * a sitemap and structured data.
 */

export const site = {
  name: "Good Looking Digital",
  tagline: "Looks good. Works even better.",
  description:
    "Websites, branding and marketing for local businesses. Custom applications, portals and automated testing for companies that outgrew their website.",
  url: "https://goodlookingdigital.com",
  email: "hello@goodlookingdigital.com",
  base: "Mokena, Illinois",
  reach: "Chicagoland and remote",
} as const;

/** Towns that get their own landing page in Stage 07. */
export const serviceArea = [
  "Mokena",
  "Frankfort",
  "New Lenox",
  "Orland Park",
  "Tinley Park",
  "Homer Glen",
] as const;

export type PathId = "grow" | "platform";

export interface ServicePath {
  id: PathId;
  /** Mono label above the heading. */
  eyebrow: string;
  title: string;
  blurb: string;
  services: { name: string; price: string }[];
  cta: string;
  href: string;
}

export const paths: ServicePath[] = [
  {
    id: "grow",
    eyebrow: "Path 01 — local business",
    title: "Grow my business",
    blurb:
      "You need customers to find you, trust you, and call you. We build the whole chain, not just the website.",
    services: [
      { name: "Website design and build", price: "from $2,000" },
      { name: "Logo and brand identity", price: "from $600" },
      { name: "Google Business Profile", price: "from $350" },
      { name: "QR signage and print", price: "at cost + 20%" },
      { name: "Hosting and care", price: "$95–$250/mo" },
    ],
    cta: "See what this costs",
    href: "/grow",
  },
  {
    id: "platform",
    eyebrow: "Path 02 — platform work",
    title: "Build my platform",
    blurb:
      "Your customers need to log in, do something real, and come back. That is software, and it is built differently.",
    services: [
      { name: "Custom web applications", price: "after discovery" },
      { name: "Customer and staff portals", price: "from $8,000" },
      { name: "Playwright test automation", price: "from $2,500" },
      { name: "Platform assessment", price: "$750–$1,500" },
      { name: "Ongoing engineering", price: "retainer" },
    ],
    cta: "Book a technical call",
    href: "/platform",
  },
];

/** Headline numbers. Each has to be defensible if a prospect asks. */
export const proofPoints = [
  { figure: "9 yrs", note: "Full-stack engineering, not a template reseller" },
  { figure: "100%", note: "Of critical flows covered by automated tests" },
  { figure: "< 1s", note: "Target load time on every page we ship" },
  {
    figure: "1",
    note: "Person who answers when you call. Always the same one",
  },
];

export interface Capability {
  name: string;
  description: string;
  path: PathId | "both";
}

export const capabilities: Capability[] = [
  {
    name: "Websites",
    description:
      "Designed and built from scratch. No templates, no page builders, no monthly ransom for editing your own text.",
    path: "grow",
  },
  {
    name: "Brand & identity",
    description:
      "Logo, palette and type that survive being printed on a truck door and shrunk into a profile picture.",
    path: "grow",
  },
  {
    name: "Local presence",
    description:
      "Google Business Profile, local search and social pages configured so people in your service area actually find you.",
    path: "grow",
  },
  {
    name: "Applications",
    description:
      "Customer portals, staff dashboards, logins, databases and the integrations that connect them to what you already run.",
    path: "platform",
  },
  {
    name: "Test automation",
    description:
      "Playwright suites over the flows that lose you money when they break. Wired into CI — on your application or ours.",
    path: "platform",
  },
  {
    name: "Care & hosting",
    description:
      "Updates, monitoring, backups and a person who answers. From $95/mo, cancel whenever.",
    path: "both",
  },
];

export interface WorkItem {
  title: string;
  tag: string;
  summary: string;
  path: PathId;
  /** Concept projects must say so — never imply a client that does not exist. */
  concept?: boolean;
}

export const work: WorkItem[] = [
  {
    title: "Front Yard Famous",
    tag: "Local business",
    summary:
      "Booking site and showcase for a yard greeting company. Built to take orders while the owner sleeps.",
    path: "grow",
  },
  {
    title: "Customer service portal",
    tag: "Platform",
    summary:
      "Account login, order history and document upload. Cut the phone calls asking where an order had got to.",
    path: "platform",
    concept: true,
  },
  {
    title: "Playwright regression suite",
    tag: "Automation",
    summary:
      "Checkout, login and permissions covered end to end. Runs on every push and catches breaks before customers do.",
    path: "platform",
    concept: true,
  },
];

/**
 * Sample rows for the test-run panel — the credibility moment carried over
 * from concept C. Written in customer language, not test-file names.
 */
export const testRun = {
  build: "CI #418",
  browsers: "chromium, firefox, webkit",
  duration: "3.79s",
  specs: [
    { name: "customer signs in", ms: "412ms" },
    { name: "quote form submits", ms: "638ms" },
    { name: "lead reaches the inbox", ms: "1.1s" },
    { name: "booking survives a refresh", ms: "509ms" },
    { name: "portal blocks the wrong user", ms: "287ms" },
    { name: "works on a five-year-old phone", ms: "844ms" },
  ],
} as const;
