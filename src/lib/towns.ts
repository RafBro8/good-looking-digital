import { paths } from "@/lib/site";
import { serviceForRow } from "@/lib/services";

/**
 * One page per town in the service area.
 *
 * The job of a town page is proximity, not explanation. It says who we are and
 * that we are genuinely here, then links to the service pages for the actual
 * substance. If a town page explained the services itself, the same
 * explanation would sit on seven URLs, which is precisely the doorway-page
 * pattern Google penalises site-wide - and the one every competitor for these
 * search terms is currently using. A search for "web design Mokena" returns
 * page after page of /illinois/mokena/ templates from national agencies. The
 * way to beat them is not to write a better template.
 *
 * So the rule for every `local` entry below: it must be something that could
 * only be written about this town, and it must be true. A population figure is
 * neither.
 */

export interface TownSection {
  title: string;
  body: string;
}

export interface TownDetail {
  /** The whole URL segment, e.g. "web-design-mokena". */
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  lede: string;
  /** What could only be said about this town. */
  local: TownSection[];
  /** Other towns named on this page, in order of how close they are. */
  nearby: string[];
  ctaTitle: string;
  ctaBody: string;
}

export function townBySlug(slug: string): TownDetail | undefined {
  return towns.find((t) => t.slug === slug);
}

/**
 * The Grow services, with their pages. Town pages carry these links and no
 * description - the description lives on the page being linked to.
 *
 * Platform work is deliberately absent. Nobody searches for custom software
 * with a town name attached; they search by stack and capability. A town page
 * that tried to sell both would do neither well.
 */
export function growServiceLinks(): { name: string; href: string }[] {
  const grow = paths.find((p) => p.id === "grow")!;

  return grow.services
    .map((row) => {
      const service = serviceForRow("grow", row.name);
      return service
        ? { name: row.name, href: `/services/${service.slug}` }
        : null;
    })
    .filter((link): link is { name: string; href: string } => link !== null);
}

export const towns: TownDetail[] = [
  {
    slug: "web-design-mokena",
    name: "Mokena",
    metaTitle: "Web design in Mokena, Illinois",
    metaDescription:
      "Websites, branding and lead capture for Mokena businesses, built by an engineer who actually lives here. Not a national agency with a Mokena page.",
    lede: "Good Looking Digital is based in Mokena. Not a national agency with a Mokena page bolted onto it - one engineer who lives here, works here, and can meet you at your shop.",
    local: [
      {
        title: "We are actually here",
        body: "Search for a web designer in Mokena and you will mostly find template pages from agencies three states away, with the village name dropped into a sentence. This is a business registered in Illinois and run from Mokena, and the person who answers the phone is the person who writes the code.",
      },
      {
        title: "This is a trades town",
        body: "Pipefitters Local 597 runs one of the best construction apprenticeships in the country from here, and ABC Supply and Gordon Electric are both in the village. If you are a contractor in Mokena you are in good company - and a website built for a contractor is a genuinely different job from one built for a boutique.",
      },
      {
        title: "Front Street, and being findable on it",
        body: "The downtown sits on the Metra Rock Island line, and the village runs a TIF district with grants toward facade and sign improvements. If you are opening on Front Street, the sign and the website are the same problem in two materials: being found, and looking like you mean it.",
      },
      {
        title: "Close enough to shake your hand",
        body: "Fifteen minutes to New Lenox, Frankfort, Tinley Park or Orland Park. Near enough to meet at your shop, photograph the work properly, and go through the wording with you, rather than doing the whole job over email and hoping.",
      },
    ],
    nearby: [
      "New Lenox",
      "Frankfort",
      "Tinley Park",
      "Orland Park",
      "Homer Glen",
      "Lemont",
    ],
    ctaTitle: "Twenty minutes, and a straight answer.",
    ctaBody:
      "Tell us what you do and who you want calling you. If it is not a fit you hear it on that call, not after an invoice.",
  },
];
