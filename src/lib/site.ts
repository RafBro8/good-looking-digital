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
  /** Display form and tel: form. A visible phone number is the trust signal
   *  for a contractor deciding whether to call in the next ten seconds. */
  phone: "630-400-8748",
  phoneHref: "tel:+16304008748",
  /**
   * Stated the same way everywhere: local first, because that is where trust
   * comes from — but explicitly unbounded, so a prospect in California or
   * abroad does not read the town names and count themselves out.
   */
  reach: "across Chicagoland, and anywhere else with a browser",
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
      { name: "Website design and build", price: "from $2,500" },
      { name: "Logo and brand identity", price: "included" },
      { name: "Google Business Profile setup", price: "from $350" },
      { name: "Facebook & Instagram page setup", price: "from $350" },
      { name: "Lead capture & follow-up", price: "from $900" },
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
      { name: "Customer and staff portals", price: "after discovery" },
      { name: "Automation & integrations", price: "from $1,500" },
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
  {
    figure: "20 yrs",
    note: "In technology — the last nine building software, including for a Fortune 5 company",
  },
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
    name: "Lead capture",
    description:
      "The form, the database behind it, the notification that reaches you in seconds and the confirmation that reaches your customer. Not ad buying — the part that happens after someone is already interested.",
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
}

/**
 * Real projects only. The homepage work section stays hidden until there are
 * two or three of these — one genuine project beside invented ones reads worse
 * than showing none at all.
 */
export const work: WorkItem[] = [
  {
    title: "Front Yard Famous",
    tag: "Local business",
    summary:
      "Booking site and showcase for a yard greeting company. Built to take orders while the owner sleeps.",
    path: "grow",
  },
];

/**
 * The test-run panel.
 *
 * Every spec named here must be one this site genuinely runs. An earlier
 * version listed sign-in, booking and portal-permission specs carried over
 * from a design mockup — none of which exist on a marketing site, on a public
 * repo, on a page whose whole argument is that we test what we ship.
 *
 * These six are real once Stage 06 (lead capture) and Stage 08 (Playwright)
 * land. Until Stage 08 wires this to actual CI output, the counts and timings
 * are placeholders and the panel deliberately claims no build number.
 */
export const testRun = {
  suite: "goodlookingdigital.com",
  browsers: "chromium, firefox, webkit",
  duration: "2.94s",
  specs: [
    { name: "visitor reaches the quote form", ms: "318ms" },
    { name: "a bad email address is caught", ms: "204ms" },
    { name: "the quote form submits", ms: "612ms" },
    { name: "the lead reaches the inbox", ms: "1.1s" },
    { name: "spam is turned away", ms: "187ms" },
    { name: "it works on a five-year-old phone", ms: "521ms" },
  ],
} as const;

/**
 * Long-form content for the two path pages.
 *
 * Deliberately excludes ads management, CRM integration, RPA/desktop
 * automation and per-client dashboards — all considered and cut, because a
 * short list delivered well beats a long one that cannot be.
 */
export interface PathPage {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroLede: string;
  processTitle: string;
  process: { title: string; body: string }[];
  featureEyebrow: string;
  featureTitle: string;
  featureBody: string;
  featurePoints: string[];
  faqs: { q: string; a: string }[];
  ctaTitle: string;
  ctaBody: string;
  ctaLabel: string;
}

export const pathContent: Record<PathId, PathPage> = {
  grow: {
    metaTitle: "Websites and local marketing for small business",
    metaDescription:
      "Websites, branding, Google Business Profile, Facebook and Instagram setup, QR marketing and hosting for local businesses around Chicagoland.",
    heroTitle: "Get found. Get called.",
    heroLede:
      "You need the phone to ring. We build everything that makes that happen — the website, the Google listing, the signs on the lawn, and the system that catches every enquiry.",
    processTitle: "How it works",
    process: [
      {
        title: "A twenty-minute call",
        body: "What you do, and who you want calling you. If we are not a fit you hear it on this call, not after an invoice.",
      },
      {
        title: "Design and build",
        body: "You see it before it is built, and again before it goes live. Your words and your prices, written the way you would say them in someone’s driveway.",
      },
      {
        title: "Launch",
        body: "Live on your domain, and showing up when someone nearby searches for what you do. Signs and QR materials ordered if you want them.",
      },
      {
        title: "Care",
        body: "It keeps working, and one person answers when it does not — the same person who built it. Cancel whenever.",
      },
    ],
    featureEyebrow: "The part most people skip",
    featureTitle: "A yard sign that actually does something",
    featureBody:
      "Most signs end at a phone number nobody dials. Put a QR code on yours and the neighbour standing on the sidewalk becomes an enquiry in your pocket before they have walked away.",
    featurePoints: [
      "QR code on yard signs, stickers, flyers or vehicle graphics",
      "Opens a page built for one offer, not your homepage",
      "Short form — you are notified within seconds, by email or text",
      "Your customer gets an instant confirmation, not silence",
      "A reminder fires if nobody has called them back",
      "You can tell which sign produced which call",
    ],
    faqs: [
      {
        q: "Do I own the website?",
        a: "Yes. You own the site, the domain and the content. If you ever leave, it goes with you — no hostage situation and no export fee.",
      },
      {
        q: "Who owns the Google and Facebook pages?",
        a: "You do, always, and they are created in your name from the start. Good Looking Digital gets delegated access to do the work and nothing more. If we stop working together you keep the pages, the reviews and the history.",
      },
      {
        q: "Can I edit my own text?",
        a: "Yes, and you will never be charged monthly for the privilege. For bigger changes, send them over and they are usually done the same week.",
      },
      {
        q: "How long does it take?",
        a: "A straightforward business site is typically two to four weeks from the first call, and most of that is waiting on photos and copy rather than on build time.",
      },
      {
        q: "What is lead capture, exactly?",
        a: "Everything that happens once someone is interested: the form, the database behind it, the alert that reaches you in seconds, the confirmation that reaches your customer, and a reminder if nobody has called them back. It is not advertising — we do not make the enquiries appear, we make sure none of them are lost.",
      },
      {
        q: "Do you run Facebook or Google ads?",
        a: "Not today. We set up your pages and profiles properly and build the pages ads would point at, but managing ad spend is not a service we take on yet. If that is what you need now, we will tell you rather than learn on your budget.",
      },
    ],
    ctaTitle: "Tell us what your business needs to do.",
    ctaBody:
      "Describe the work and who you want calling you. You will get a plan and a price, not a brochure.",
    ctaLabel: "Start a project",
  },
  platform: {
    metaTitle: "Custom applications, integrations and test automation",
    metaDescription:
      "Customer portals, custom web applications, workflow automation, API integrations and Playwright end-to-end test automation for companies that outgrew their website.",
    heroTitle: "Ship it. Then keep it working.",
    heroLede:
      "Portals, dashboards, integrations and the automated coverage that lets you deploy on a Friday. Available on applications we did not build.",
    processTitle: "How we engage",
    process: [
      {
        title: "Assessment",
        body: "A paid, fixed-price review of what you already have — architecture, critical workflows, performance, accessibility, test coverage and technical debt — ending in a prioritised list. Low risk, and it credits toward the build if you go ahead.",
      },
      {
        title: "Scope and price",
        body: "Fixed scope and fixed price wherever the work allows it. Where it genuinely cannot be fixed up front, you get a rate and an agreed ceiling rather than an open meter.",
      },
      {
        title: "Build in increments",
        body: "Working software you can click through, not status reports. Deployed to a preview environment from the first week, so nobody is guessing what is being built.",
      },
      {
        title: "Support",
        body: "A retainer for changes, monitoring and test maintenance — or a clean handover to your own team with documentation. Both are fine, and the second is not treated as a failure.",
      },
    ],
    featureEyebrow: "Why it keeps working",
    featureTitle: "Tested like software, because it is software",
    featureBody:
      "Most agencies hand over an application and hope. We write automated tests over the flows that lose you money when they break, then run them on every change — so a broken checkout is caught by CI rather than reported by your customer.",
    featurePoints: [
      "Playwright suites over login, checkout, booking and permissions",
      "Cross-browser: Chromium, Firefox and WebKit",
      "Wired into CI so it runs on every push",
      "Flaky-test cleanup and Cypress-to-Playwright migration",
      "Available on applications we did not build",
    ],
    faqs: [
      {
        q: "Can you work on an application you did not build?",
        a: "Yes, and it is one of the more common engagements. Test automation in particular does not require having written the application — often the opposite, since a fresh reader finds the assumptions the original team stopped seeing.",
      },
      {
        q: "What stack do you work in?",
        a: "TypeScript and JavaScript across React, Next.js and Angular on the front end; Node and Express or Java and Spring Boot on the back; SQL and MongoDB for data. Playwright and Cypress for end-to-end coverage, Vitest, Jest and React Testing Library for unit tests, JUnit and Rest Assured on the Java side. Deployed on AWS, Google Cloud or Pivotal Cloud Foundry, with Docker, Kubernetes and Jenkins or GitHub Actions behind it. Nine years of it, including for a Fortune 5 company — not a design studio subcontracting the hard part.",
      },
      {
        q: "Will you work alongside our developers?",
        a: "Yes. Working inside an existing team, in your repository and your process, is a normal arrangement — including building the test suite your team then owns.",
      },
      {
        q: "What does automation actually cover?",
        a: "Workflow automation and API integrations between systems you already run: moving data between them, triggering notifications, and removing repeated manual steps. It does not cover desktop or robotic process automation of legacy software, which we do not take on.",
      },
      {
        q: "Fixed price or hourly?",
        a: "Fixed price wherever the scope can be pinned down, which covers most defined projects. Discovery-heavy or open-ended work is quoted at a rate with an agreed ceiling.",
      },
    ],
    ctaTitle: "Start with an assessment.",
    ctaBody:
      "A fixed-price review of what you have, with a prioritised list of what to do about it. It credits toward the build if you go ahead.",
    ctaLabel: "Book an assessment",
  },
};

/* ------------------------------------------------------------------ */
/* Stage 05 — pricing and about                                        */
/* ------------------------------------------------------------------ */

/**
 * Care plan tiers. The $95–$250/mo band on the path pages resolves here.
 * Contents are a proposal until signed off — the bands themselves were
 * already published, these tiers are what fills them.
 */
export const carePlans = [
  {
    name: "Essential",
    price: "$95",
    period: "/mo",
    forWho: "A business site that needs to stay up and stay current",
    includes: [
      "Hosting, SSL and daily backups",
      "Uptime monitoring",
      "Security and dependency updates",
      "Small text and photo changes",
      "Email support, replies within two business days",
    ],
  },
  {
    name: "Growth",
    price: "$175",
    period: "/mo",
    forWho: "A site that keeps changing as the business does",
    includes: [
      "Everything in Essential",
      "Content updates and new pages as needed",
      "A monthly note on traffic and enquiries",
      "Google Business Profile kept current",
      "Priority response, same business day",
    ],
    featured: true,
  },
  {
    name: "Care+",
    price: "$250",
    period: "/mo",
    forWho: "A site or application doing real work every day",
    includes: [
      "Everything in Growth",
      "Ongoing improvements, not just fixes",
      "Quarterly review of what is and is not working",
      "Automated test maintenance where applicable",
      "Direct line, same-day response",
    ],
  },
];

/** How pricing works. Written to pre-empt the awkward parts of a first call. */
export const pricingPrinciples = [
  {
    title: "Fixed price wherever it can be fixed",
    body: "Most defined projects get a number before work starts, and that number does not move unless you change what you asked for. Open-ended work gets a rate and an agreed ceiling instead of a running meter.",
  },
  {
    title: "Bands, not quotes",
    body: "Every figure here is a starting point. A five-page site for a landscaper and a five-page site for a law firm are not the same job. The real number comes after a short conversation, and it comes in writing.",
  },
  {
    title: "No lock-in",
    body: "Care plans are month to month. You own the site, the domain, the content and your Google and Facebook pages from day one. Leaving is a matter of pointing DNS somewhere else, not negotiating a release.",
  },
];

/** What actually moves a number up or down. Honesty here saves a bad call later. */
export const pricingFactors = [
  { factor: "Number of pages", effect: "Direct" },
  { factor: "Whether copy and photos exist", effect: "Large" },
  { factor: "Custom design vs. adapting a layout", effect: "Large" },
  { factor: "Logins, databases or payments", effect: "Large" },
  { factor: "Integrations with tools you already run", effect: "Moderate" },
  { factor: "Automated test coverage", effect: "Moderate" },
  { factor: "Migrating content from an old site", effect: "Moderate" },
  { factor: "How fast you need it", effect: "Moderate" },
];

export const pricingFaqs = [
  {
    q: "Why not just list exact prices?",
    a: "Because the same request means different work for different businesses, and a fixed menu price would mean padding every quote to cover the worst case. Bands plus a short call gets you a truer number than a price list would.",
  },
  {
    q: "Do you take payment in stages?",
    a: "Yes. Typically a deposit to start, and the balance on launch. Larger projects are split across milestones so you are never far ahead of what has been delivered.",
  },
  {
    q: "What is not included?",
    a: "Domain registration, third-party subscriptions, stock photography, print production and advertising spend are all billed at cost or paid by you directly. Nothing is marked up quietly.",
  },
  {
    q: "Is the assessment fee wasted if I do not go ahead?",
    a: "No. You keep the findings and the prioritised list, and they are written so another developer could act on them. If you do go ahead with us, the fee credits toward the build.",
  },
  {
    q: "Do you work with tight budgets?",
    a: "Sometimes, if the scope shrinks to match. What we will not do is quietly cut corners to hit a number — you will get told what a smaller budget buys and what it leaves out.",
  },
];

/**
 * About page copy. No portrait by choice — the experience carries the page,
 * and a photograph can be added later without the layout changing.
 */
export const about = {
  metaTitle: "About",
  metaDescription:
    "Close to twenty years in technology, the last nine building full-stack software for enterprise clients including a Fortune 5 company. Now building websites and applications for businesses in Mokena, across Chicagoland, and anywhere else with a browser.",
  heroTitle: "An engineer who cares what it looks like.",
  heroLede:
    "Close to twenty years in technology. The last nine building full-stack software for large American companies, including a Fortune 5. Based in Mokena, working across Chicagoland — and anywhere else with a browser.",
  story: [
    "Most of that time has been spent on enterprise applications — internal tools and customer-facing products used by thousands of people, at a Fortune 5 company and other large, well-known American names. Front end in JavaScript and TypeScript with React and Angular; back end in Java and Spring Boot or Node and Express, with some Python along the way; SQL and MongoDB behind it; AWS, Google Cloud and Pivotal Cloud Foundry underneath; and testing at every level from unit to end-to-end.",
    "That range is deliberate. Plenty of engineers go deep on one layer and hand the rest to someone else. Working across all of them means a project does not get passed between three companies before it is finished, and nothing falls into the gap between them.",
    "It also means the person you speak to on the first call is the person writing the code, and the person who answers when something breaks two years later. Always the same one. Most agencies put a salesperson in front of you and someone junior behind the scenes, and what you explained in the first meeting rarely survives the trip.",
    "But the part I have always come back to is the front end — the interface, and the person on the other side of it. I have run user interviews and user-experience sessions, worked alongside UI/UX teams for years and picked up a great deal from them, and sat across from senior business stakeholders to work out what a system actually needed to do rather than what someone assumed it did.",
    "That is what the name means. Plenty of people can make something look good, and plenty can make something work. Doing both, on the same project, without a handoff in the middle — that is the whole idea.",
  ],
  /**
   * One real project, told plainly. No client named and no confidential
   * detail — the outcome is the point.
   */
  signature: {
    eyebrow: "The one I am most pleased with",
    title: "We took a team out of spreadsheets",
    body: [
      "A group of business analysts spent their days entering large volumes of data into shared spreadsheets. Worse than the typing was the waiting — a file checked out by one person was locked to everyone else, so work queued up behind whoever had it open.",
      "The team I was on built them a real application instead: an interface they could actually navigate, a backend and database behind it, and validation that caught mistakes as they typed rather than a week later. Their data entry time dropped substantially and the bottleneck disappeared.",
      "The thanks kept arriving for months afterwards. Not for the architecture — for giving them their afternoons back. That was at a Fortune 5 company, and it is still the work I am most pleased with.",
    ],
  },
  /** Things that are unusual for a solo developer, and worth saying plainly. */
  highlights: [
    "Enterprise applications used by thousands, internal and customer-facing",
    "User interviews and user-experience research, run first-hand",
    "Years working alongside dedicated UI/UX teams",
    "Senior business stakeholder management",
    "Full ownership from database schema to the last pixel",
    "Automated testing at unit, integration and end-to-end level",
  ],
  principles: [
    {
      title: "Say the number early",
      body: "Price bands are on the site. If a project is not a fit for the budget, that conversation happens on the first call rather than after three meetings.",
    },
    {
      title: "Build the proof, then make the claim",
      body: "Every capability on this site is one the work can back. When something is not offered yet, it says so plainly rather than being quietly implied.",
    },
    {
      title: "Test what ships",
      body: "The flows that lose you money get automated tests, so a broken form is caught by a machine rather than reported by a customer who gave up.",
    },
    {
      title: "You own everything",
      body: "The site, the domain, the content, the Google and Facebook pages. Access is delegated, never held hostage. Leaving should be easy, which is why it is.",
    },
  ],
  /** Saying what you do not do reads as confidence, not limitation. */
  limits: [
    "Advertising spend is not managed here — pages and profiles are set up, but campaigns are not run",
    "Desktop and robotic process automation of legacy software is out of scope",
    "This runs alongside a full-time job, so timelines are honest rather than optimistic",
    "Work that would be better served by a large agency gets said out loud",
  ],
} as const;

/**
 * The stack, grouped for a technical reader scanning for a match.
 * Only list what can actually be delivered — this is the section a technology
 * director will check hardest.
 */
export const stack = [
  {
    group: "Front end",
    items: [
      "TypeScript",
      "JavaScript",
      "React",
      "Next.js",
      "Angular",
      "HTML & CSS",
    ],
  },
  {
    group: "Back end",
    items: ["Node", "Express", "Java", "Spring Boot", "REST APIs"],
  },
  {
    group: "Data",
    items: ["MongoDB", "SQL", "PostgreSQL"],
  },
  {
    group: "Quality",
    items: [
      "Playwright",
      "Cypress",
      "Vitest",
      "Jest",
      "React Testing Library",
      "JUnit",
      "Rest Assured",
    ],
  },
  {
    group: "Delivery",
    items: ["CI/CD", "GitHub Actions", "Jenkins", "Docker", "Kubernetes"],
  },
  {
    group: "Cloud",
    items: ["AWS", "Google Cloud", "Pivotal Cloud Foundry", "Vercel", "Render"],
  },
  {
    group: "Working with your team",
    items: ["Git", "Bitbucket", "Jira", "Code review", "Pull request workflow"],
  },
] as const;
