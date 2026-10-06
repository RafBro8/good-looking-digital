/**
 * The showcase.
 *
 * Two groups, because there are two buyers. A contractor deciding whether we
 * can make their phone ring has no use for a release quality gate, and a
 * technical team evaluating us for software work is not moved by a salon site.
 * Showing both to everyone in one undifferentiated grid serves neither.
 *
 * Every url here is the address the project actually lives at. Where a project
 * has its own domain it is shown on that domain, because a .com says the work
 * was finished and a vercel.app subdomain says it was parked.
 */

export type WorkAudience = "grow" | "platform";

export type WorkProject = {
  id: string;
  name: string;
  /** What it is, in four words or fewer. Sits above the name. */
  kind: string;
  url: string;
  /** The address as a human reads it. */
  host: string;
  /** The line that earns the click. */
  hook: string;
  /** What it actually does. */
  blurb: string;
  /** Honest stack. No padding. */
  built: string[];
  /** Ready-made sites a client can buy as they stand, name included. */
  forSale?: boolean;
};

export type WorkGroup = {
  id: WorkAudience;
  eyebrow: string;
  title: string;
  lede: string;
  projects: WorkProject[];
};

export const workMeta = {
  metaTitle: "Work",
  metaDescription:
    "Websites, applications and engineering projects built by Good Looking Digital, all live and open in a new tab.",
  eyebrow: "Showcase",
  title: "Ten things you can open right now.",
  lede: "Not screenshots, and not a slide deck. Every one of these is live on the public internet, and every link below opens the real thing. Three of them are for sale as they stand.",
};

const localBusiness: WorkProject[] = [
  {
    id: "good-build",
    name: "The Good Build Co.",
    kind: "Residential construction",
    url: "https://thegoodbuildco.com",
    host: "thegoodbuildco.com",
    hook: "A builder's website that does not open with a stock photo of a hard hat on a desk.",
    blurb:
      "A residential construction company from first scroll to quote request. The whole job is convincing a homeowner that these people will turn up on the day they said they would, so the site spends its space on finished work and plain answers rather than on adjectives.",
    built: ["React", "Vite", "Tailwind"],
    forSale: true,
  },
  {
    id: "front-street",
    name: "Front Street Salon & Spa",
    kind: "Salon and day spa",
    url: "https://front-street-salon.vercel.app",
    host: "front-street-salon.vercel.app",
    hook: "Prices on the page, where a salon's prices belong.",
    blurb:
      "A full salon and day spa, with a booking flow you can walk end to end and gift cards you can buy. Salons that hide their prices lose bookings to the one down the road that does not, so this one puts the number next to the treatment and gets on with it.",
    built: ["Static HTML", "No framework", "No backend"],
    forSale: true,
  },
  {
    id: "big-day",
    name: "Big Day Yard Co.",
    kind: "Celebration displays",
    url: "https://big-day-yard-co-demo.vercel.app",
    host: "big-day-yard-co-demo.vercel.app",
    hook: "Enormous letters on a lawn, sold properly.",
    blurb:
      "Birthday and celebration displays, booked by date because the stock is physical and the date is the whole product. A seasonal, deeply local business of exactly the kind a general-purpose template cannot serve without a fight.",
    built: ["React", "Vite", "Node API"],
    forSale: true,
  },
  {
    id: "kreworx",
    name: "Kreworx",
    kind: "Field operations",
    url: "https://kreworx.com",
    host: "kreworx.com",
    hook: "Dispatch, crews, customers and the money, without the clipboard.",
    blurb:
      "Drag a job across the board to reschedule it, watch the crews move on a live map, and send the customer a link that answers 'what time are they coming' so nobody has to pick up the phone. Built for home-services contractors who are currently running the day out of a group chat.",
    built: ["React", "Node", "MongoDB", "Live map", "Realtime"],
  },
  {
    id: "provisio",
    name: "Provisio",
    kind: "Appointment booking",
    url: "https://provisio-ten.vercel.app",
    host: "provisio-ten.vercel.app",
    hook: "Booking for people who sell their time rather than a thing.",
    blurb:
      "Consultants, coaches and tutors. Availability, bookings, reminders and a client view, with unit and end-to-end tests wired into CI so that a change to the calendar cannot quietly break the booking it was supposed to protect.",
    built: ["React", "Node", "MongoDB", "Playwright", "CI"],
  },
  {
    id: "certaops",
    name: "CertaOps",
    kind: "Operations dashboard",
    url: "https://certaops.com",
    host: "certaops.com",
    hook: "Every lead, from the first ring to the final invoice.",
    blurb:
      "Leads, quotes, scheduled jobs and follow-ups on one board. Aimed squarely at the service business currently running on a notebook, a whiteboard and one person's very good memory, which works right up until that person takes a holiday.",
    built: ["React", "Vite", "Tailwind"],
  },
  {
    id: "sealmark",
    name: "Sealmark",
    kind: "Signing",
    url: "https://sealmark.app",
    host: "sealmark.app",
    hook: "Signing that never uploads your document anywhere.",
    blurb:
      "Sign a PDF, a photograph of a paper form, or a plain text file, and seal it so that changing a single byte afterwards shows. The whole thing runs in the browser: the file never leaves the device, which is the one promise most signing services cannot make.",
    built: ["TypeScript", "Browser only", "Installable"],
  },
];

const technical: WorkProject[] = [
  {
    id: "release-sentinel",
    name: "Release Sentinel",
    kind: "Release quality gate",
    url: "https://release-sentinel-dashboard.vercel.app",
    host: "release-sentinel-dashboard.vercel.app",
    hook: "Answers 'can we ship this?' and shows its working.",
    blurb:
      "Tracks releases, test runs and defects, then returns READY, AT RISK or BLOCKED along with every reason it reached that verdict. The point is the reasons: a gate that only says no teaches nobody anything. Spring Boot and PostgreSQL, with the schema under version control.",
    built: ["Java", "Spring Boot", "PostgreSQL", "Flyway", "Testcontainers"],
  },
  {
    id: "claritas",
    name: "Claritas E2E",
    kind: "Automated testing",
    url: "https://claritas-e2e.vercel.app",
    host: "claritas-e2e.vercel.app",
    hook: "End-to-end testing for people who do not live in a terminal.",
    blurb:
      "A window into automated test runs with no command line, no IDE and no YAML to edit. Built on the observation that the people who most need to know whether the tests passed are usually the people least equipped to find out.",
    built: ["React", "Node", "Realtime", "Playwright"],
  },
  {
    id: "dataguard",
    name: "DataGuard Quality Auditor",
    kind: "Data quality",
    url: "https://github.com/RafBro8/dataguard-quality-auditor",
    host: "github.com/RafBro8",
    hook: "For the moment somebody hands you a CSV and swears it is clean.",
    blurb:
      "Profiles a dataset, applies rules to it and produces a report on what is actually wrong. Python, run from the command line, and the only project here with no website, because a thing that reads spreadsheets does not need one.",
    built: ["Python", "CI"],
  },
];

export const workGroups: WorkGroup[] = [
  {
    id: "grow",
    eyebrow: "For local business",
    title: "Websites and software that make the phone ring",
    lede: "Built for the person who owns the business, not for a design award. Three of these are finished sites available to buy outright, business name included.",
    projects: localBusiness,
  },
  {
    id: "platform",
    eyebrow: "For technical teams",
    title: "Engineering projects",
    lede: "Tools built for people who ship software. Test suites, migrations and continuous integration in all of them, because on this side of the fence that is the actual product.",
    projects: technical,
  },
];

export const forSaleCount = localBusiness.filter((p) => p.forSale).length;
