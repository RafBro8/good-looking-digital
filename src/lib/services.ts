import { paths, serviceAnchor, type PathId } from "@/lib/site";

/**
 * One page per service.
 *
 * These exist because the footer used to point at a single row in a price
 * table, and every link therefore felt like the same destination - it was,
 * because "Branding" was one line in a table rather than a thing you could
 * read about. A service now has somewhere to go.
 *
 * They also carry the weight the town pages cannot. A town page's job is
 * proximity, not explanation: it says who we are and that we are nearby, then
 * links here for the substance. If a town page explained the service itself,
 * the same explanation would exist on every town URL, which is precisely the
 * doorway-page pattern Google penalises site-wide. Keeping the explanation in
 * exactly one place is what makes the local pages safe to build.
 *
 * Length is deliberately not uniform. Grow services are found by search and
 * read by someone deciding whether to call, so they answer objections at
 * length. Platform services are found by referral and read by someone checking
 * for a match, so they stay short - padding loses that reader rather than
 * convincing them.
 */

export interface ServiceSection {
  title: string;
  body: string;
}

export interface ServiceDetail {
  /** URL segment under /services. */
  slug: string;
  path: PathId;
  /**
   * The exact `name` of the matching row in paths[].services.
   *
   * Prices are read from that row rather than repeated here, so a price can
   * never be right on the path page and stale on the service page. A typo
   * fails loudly at build time instead of quietly showing the wrong number.
   */
  sourceName: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lede: string;
  /** The substance: what the money actually buys. */
  included: ServiceSection[];
  /** What happens, in order. Grow services only - Platform work varies too much. */
  process?: ServiceSection[];
  /** Said plainly, because saying what you do not do reads as confidence. */
  notIncluded?: string[];
  faqs?: { q: string; a: string }[];
  ctaTitle: string;
  ctaBody: string;
}

/**
 * The price for a service, read from the path page's own list.
 *
 * Throws rather than falling back. A missing match means the two lists have
 * drifted, and a build that fails is a better outcome than a page quietly
 * rendering without a price.
 */
export function servicePrice(service: ServiceDetail): string {
  const path = paths.find((p) => p.id === service.path);
  const row = path?.services.find((s) => s.name === service.sourceName);

  if (!row) {
    throw new Error(
      `services.ts: "${service.sourceName}" does not match any row in paths[${service.path}]. ` +
        `The service list and the price list have drifted apart.`,
    );
  }

  return row.price;
}

/** The row on /grow or /platform this service expands on. */
export function serviceRowHref(service: ServiceDetail): string {
  return `/${service.path}#${serviceAnchor(service.sourceName)}`;
}

export function serviceBySlug(slug: string): ServiceDetail | undefined {
  return services.find((s) => s.slug === slug);
}

export const services: ServiceDetail[] = [
  {
    slug: "website-design",
    path: "grow",
    sourceName: "Website design and build",
    metaTitle: "Website design and build",
    metaDescription:
      "Custom website design and build for small businesses in Mokena and across Chicagoland. Designed from scratch, fast on a phone, tested automatically, and yours to own.",
    eyebrow: "Websites",
    title: "Website design and build",
    lede: "Designed and built from scratch for your business, not adapted from a template three of your competitors are also using. It loads fast, works properly on a phone, and is built so the people who need you can find you and call you.",
    included: [
      {
        title: "Designed for your business, not chosen from a menu",
        body: "No page builder, no marketplace theme, no layout you will later recognise on someone else's site. The design starts from what you do, who you want calling you, and what a customer needs to see before they trust you with a job.",
      },
      {
        title: "Written so it sounds like you",
        body: "Most small business websites fail on the words rather than the design. Yours get written from a conversation about the work - your prices, your service area, your way of explaining what you do. You approve every line before it goes anywhere near the internet.",
      },
      {
        title: "Fast on a phone, on a bad connection",
        body: "Most of your customers will find you on a phone, often standing in a driveway with two bars of signal. Every page is built to load in under a second and to be usable one-handed. That is a measured target rather than a hope, and it is one of the things we test.",
      },
      {
        title: "Built to be found nearby",
        body: "Pages are structured so search engines can actually read them, with the titles, descriptions and local signals that belong there. Paired with a Google Business Profile, that is what puts you in front of someone searching for what you do in your town.",
      },
      {
        title: "Tested, so it keeps working",
        body: "Automated tests run over the parts that bring you work - the contact form, the phone links, the pages people land on - every time anything changes. A broken form gets caught by us rather than reported by a customer who gave up and called somebody else.",
      },
      {
        title: "Yours from the first day",
        body: "You own the site, the domain and the content. Hosting and care are a separate monthly plan you can cancel whenever you like, and leaving means pointing your domain somewhere else rather than negotiating a release.",
      },
    ],
    process: [
      {
        title: "A twenty-minute call",
        body: "What you do, who you want calling you, and what you already have. If this is not a fit you hear it on that call, not after an invoice.",
      },
      {
        title: "Design first, in your browser",
        body: "You see real pages at a real address before the final build starts. Changes at this stage cost nothing, which is exactly why the design comes first.",
      },
      {
        title: "Build and test",
        body: "The site gets built, then the automated tests get written over the flows that matter. You get a link and are actively encouraged to try to break it.",
      },
      {
        title: "Launch",
        body: "Live on your domain, submitted to Google, and wired so an enquiry reaches you within seconds of someone sending it.",
      },
    ],
    notIncluded: [
      "Advertising spend - we build the pages ads point at, but campaigns are not managed here",
      "Domain registration, stock photography and third-party subscriptions, which you pay directly and which are never quietly marked up",
      "Work that would genuinely be better served by a large agency, which gets said out loud rather than taken on",
    ],
    faqs: [
      {
        q: "How long does it take?",
        a: "A straightforward business site is typically two to four weeks from the first call, and most of that is waiting on photos and copy rather than on build time.",
      },
      {
        q: "What do you actually need from me?",
        a: "Photos of your work, your prices, and half an hour on the phone. That is genuinely the bottleneck on most projects - the building is rarely the part that holds things up.",
      },
      {
        q: "What if I already have a website?",
        a: "Then we start by working out whether it needs replacing or fixing. Sometimes the honest answer is that the site is fine and the real problem is that nobody can find it, which is a cheaper thing to solve and we will say so.",
      },
      {
        q: "Can I edit my own text?",
        a: "Yes, and you will never be charged monthly for the privilege. For bigger changes, send them over and they are usually done the same week.",
      },
      {
        q: "Do I own it?",
        a: "Yes. You own the site, the domain and the content. If you ever leave, it goes with you - no hostage situation and no export fee.",
      },
    ],
    ctaTitle: "Start with a twenty-minute call.",
    ctaBody:
      "Tell us what you do and who you want calling you. You get a plan and a price in writing, not a brochure.",
  },
];
