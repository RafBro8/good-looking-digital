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

export type CaseStudySection = { title: string; body: string };

/**
 * The long version of a project, for the reader who clicked.
 *
 * Only some projects have one, and that is the point: a case study is written
 * when there is something worth saying, not generated for every row so the
 * grid looks even. A row without one simply has no second link.
 *
 * There are deliberately no numbers in this shape. No conversion lift, no
 * "40% faster", no visitor counts. There are no paying clients behind these
 * yet, so any figure would be invented, and a portfolio that opens with a
 * fabricated statistic has told you what it is on the first line.
 */
export type CaseStudy = {
  /** URL segment under /work. */
  slug: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lede: string;
  /** Who this is for and what was actually wrong. */
  brief: CaseStudySection[];
  /** The decisions worth defending, and the reasoning behind them. */
  decisions: CaseStudySection[];
  /** Said plainly, because saying what you did not build reads as confidence. */
  limits: string[];
  /**
   * What this project *is* commercially: our own product, a demo, or a
   * finished site for sale. Stated outright rather than left to be inferred
   * from a missing client name.
   */
  standing: string;
  ctaTitle: string;
  ctaBody: string;
};

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
  /** The long version, if one has been written. See CaseStudy. */
  caseStudy?: CaseStudy;
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
    caseStudy: {
      slug: "kreworx",
      metaTitle: "Kreworx: dispatch software for home-services contractors",
      metaDescription:
        "How Kreworx was built: four seats on the same morning, drag-to-reschedule dispatch, and a customer link that replaces the 'what time are they coming' phone call.",
      eyebrow: "Case study",
      title: "The same morning, seen from four different seats",
      lede: "Dispatch software is four products wearing one name. The owner, the dispatcher, the technician and the customer all need the same Tuesday, and every one of them needs it to look different. Kreworx is built around that, and the demo lets you sit in any of the four chairs.",
      brief: [
        {
          title: "The group chat is the system",
          body: "A four-van contractor runs the day across a whiteboard, a paper diary and a group chat, held together by one person who remembers everything. It works, right up until that person takes a holiday, or two people move the same job, or a customer rings about an appointment nobody wrote down.",
        },
        {
          title: "Four people, four different mornings",
          body: "The owner wants to know what got done and what is owed. The dispatcher wants the board and the gaps in it. The technician wants his own day and nobody else's. The customer wants one thing: a time. Software that serves one of them well and the rest badly gets abandoned by the three it failed.",
        },
        {
          title: "The call that costs the most and is worth the least",
          body: "'What time are they coming' is the most common inbound call a service business takes. It interrupts whoever picks up, it tells the customer nothing they could not have been told automatically, and it happens again an hour later.",
        },
      ],
      decisions: [
        {
          title: "Four seats, and no sign-up to reach them",
          body: "The demo opens on a role picker rather than a login. Pick the owner, the dispatcher, the lead technician or the customer, and switch at any time. A single demo account would only ever show one of the four products, and a prospect who saw the dispatcher view would never learn why a technician tolerates carrying it around all day.",
        },
        {
          title: "Drag the job, do not fill in a form",
          body: "Rescheduling happens under pressure, usually with a phone against one ear. A modal with a date picker and a Save button is three decisions where there should be one gesture. The job moves on the board and everyone else's view moves with it.",
        },
        {
          title: "The customer gets a link, not an account",
          body: "Nobody is installing an app to find out when the furnace engineer arrives. The customer receives a text with a link, the link shows the day, and when the job moves the link already knows. No password, nothing to download, and nothing to delete afterwards.",
        },
        {
          title: "The board shows state, not just time",
          body: "A job waiting on a part cannot happen today however much room the calendar says there is. Done, on site, and parts on order each read differently at a glance, because a dispatcher scanning for the next gap is pattern matching rather than reading.",
        },
        {
          title: "The data resets every night",
          body: "It is a demo, so it is built to be broken. Move everything, cancel everything, and it is back by morning. Nothing in it is real: Northline Mechanical, its crews and its customers are all invented.",
        },
      ],
      limits: [
        "It does not take payments. The owner view tells you what is owed, and collecting it is somebody else's job.",
        "No accounting or payroll integration. A contractor already has one of each, and the useful version of this is an export rather than a second place to keep the same numbers.",
        "Map tiles are a free tier, which is right for a demo and would be a paid plan for a real fleet.",
        "It is built for a handful of vans rather than a hundred. The fleet that needs seat-based enterprise pricing is not the one this is for.",
      ],
      standing:
        "Kreworx is our own product rather than client work, which is why it carries no client logo. It exists to be shown, and for the right contractor, to be installed and run as theirs.",
      ctaTitle: "Running the day out of a group chat?",
      ctaBody:
        "Open the demo, sit in whichever chair matches your job, and see whether the board is better than the whiteboard. If it is, the next step is a twenty-minute call about what your version would need.",
    },
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

/**
 * The ready-made offer.
 *
 * A badge saying "available to buy" with no price and no terms is an
 * unfinished sentence on a page that is otherwise trying to close, so the
 * numbers live here and the showcase states them plainly.
 */
export const readyMade = {
  eyebrow: "Ready to buy",
  title: "A finished site, made yours, live in a week",
  lede: "Three of the sites above are built, tested and waiting. You are not commissioning a design, you are buying one that already exists and having it turned into your business.",
  // Raised from $1,500 on 7 Oct 2026. At $1,500 this undercut professional
  // template setup ($2,000 to $3,000) while delivering a finished custom site
  // with the business name and domain included. $2,000 matches that band for a
  // better product and leaves a clear $1,500 step down from the custom build.
  price: "$2,000",
  priceNote:
    "One price, whichever of the three you take. Half to start, half when you approve it.",
  includes: [
    {
      title: "The name, and the .com",
      body: "The business name is part of the package and the domain is transferred to you. A name people remember is worth more than most of what a website costs.",
    },
    {
      title: "Your content in place of ours",
      body: "Services, prices, hours, staff and contact details. The demo wording comes out and yours goes in before anything goes live.",
    },
    {
      title: "Forms that reach you",
      body: "Enquiries and bookings arrive in your inbox rather than disappearing. Tested before handover, not after.",
    },
    {
      title: "Live, on your domain",
      body: "Hosting set up, certificate issued, Google Business Profile connected. You get the keys to all of it.",
    },
  ],
  excludes: {
    title: "What it does not include",
    body: "Photographs of your own business, which you supply or we shoot separately. Every demo above uses stock imagery, and a site showing somebody else's premises is a promise you cannot keep when a customer walks through the door.",
  },
  careNote:
    "Hosting and care is separate, from $95 a month. The site is yours either way.",
  cta: "Ask about a ready-made site",
};

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

export const allProjects: WorkProject[] = workGroups.flatMap((g) => g.projects);

/**
 * The projects that have a written case study, in showcase order.
 *
 * Derived rather than listed, so the sitemap, the route and the showcase all
 * learn about a new one by it existing. The hand-kept copy of a list like this
 * is what broke the build when /work was added.
 */
export const caseStudyProjects: (WorkProject & { caseStudy: CaseStudy })[] =
  allProjects.filter(
    (p): p is WorkProject & { caseStudy: CaseStudy } => p.caseStudy !== undefined,
  );

export function projectByCaseStudySlug(slug: string) {
  return caseStudyProjects.find((p) => p.caseStudy.slug === slug);
}

/** Where a project's case study lives, for the showcase row to link at. */
export function caseStudyHref(project: WorkProject): string | null {
  return project.caseStudy ? `/work/${project.caseStudy.slug}` : null;
}

/**
 * The four shown on the home page.
 *
 * Chosen to span rather than to flatter: one ready-made site, one application
 * for a local business, one product, one engineering project. A visitor who
 * reads only this row should still learn that both halves of the business
 * exist.
 */
const FEATURED_IDS = [
  "front-street",
  "kreworx",
  "sealmark",
  "release-sentinel",
];

export const featuredProjects: WorkProject[] = FEATURED_IDS.map((id) => {
  const found = allProjects.find((p) => p.id === id);
  if (!found) throw new Error(`featured project "${id}" is not in workGroups`);
  return found;
});

/** Which group a project belongs to, so the home row can colour it correctly. */
export function audienceOf(project: WorkProject): WorkAudience {
  const group = workGroups.find((g) => g.projects.includes(project));
  return group ? group.id : "grow";
}

export const workTeaser = {
  eyebrow: "Showcase",
  title: "Ten live projects, not ten screenshots",
  lede: `Every site and application we have built is on the public internet, and every one of them opens in a new tab from here. ${forSaleCount} are finished sites you can buy outright at $2,000, business name included.`,
  cta: "See all ten",
};
