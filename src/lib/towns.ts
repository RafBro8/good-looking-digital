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

  {
    slug: "web-design-new-lenox",
    name: "New Lenox",
    metaTitle: "Web design in New Lenox, Illinois",
    metaDescription:
      "Websites, branding and lead capture for New Lenox trades and small businesses. Built fifteen minutes away in Mokena, by the person who writes the code.",
    lede: "New Lenox is fifteen minutes from our desk in Mokena. Close enough to meet at the job rather than working the whole thing out over email and hoping we understood each other.",
    local: [
      {
        title: "A hospital, and everybody who works around it",
        body: "Silver Cross employs something like three and a half thousand people here, which is a remarkable number for a village this size. It pulls in everyone who serves them - the trades, the food, the services - and it is why New Lenox has more small businesses chasing local customers than a place this size normally would.",
      },
      {
        title: "Built for how a contractor actually gets hired",
        body: "Somebody wants a deck, a bathroom, a floor. They ask a neighbour, then they look you up to see whether you are real. What decides it is photographs of work you have actually done and a number that gets answered, which is a different job from a site selling products.",
      },
      {
        title: "A website you are not embarrassed to send",
        body: "Plenty of good trades here are still on something built years ago that looks wrong on a phone. It does not lose you the customers who already know you. It loses the ones deciding between you and the other name they were given.",
      },
      {
        title: "Fifteen minutes up Route 30",
        body: "Near enough to come and photograph the work properly, which matters more than most people expect. Photographs of the actual job beat stock images of somebody else's kitchen every time, and they are the part nobody can copy from you.",
      },
    ],
    nearby: [
      "Mokena",
      "Frankfort",
      "Tinley Park",
      "Orland Park",
      "Homer Glen",
      "Lemont",
    ],
    ctaTitle: "Show us the work. We will do the rest.",
    ctaBody:
      "Photographs of a few jobs and twenty minutes on the phone is genuinely most of what this takes to start.",
  },

  {
    slug: "web-design-frankfort",
    name: "Frankfort",
    metaTitle: "Web design in Frankfort, Illinois",
    metaDescription:
      "Websites and branding for Frankfort boutiques, restaurants and professional services. Built to look like the shop you already run, by an engineer ten minutes away.",
    lede: "Frankfort has a downtown people choose to walk around, which is rarer than it sounds. If somebody has already decided your shopfront is worth stopping at, the website should not be the thing that undoes it.",
    local: [
      {
        title: "A downtown that earns its visitors",
        body: "Breidert Green runs a farmers' market, outdoor concerts, craft fairs and a car show, and the Historic District holds boutiques, restaurants and more than thirty professional services. These are businesses whose customers have already seen them in person, which changes what the website has to do.",
      },
      {
        title: "It has to match the room",
        body: "Somebody who liked your shop enough to look you up will notice if the site looks nothing like the place they stood in. Type, colour and photography carry that, and they are decisions rather than settings - which is the part a template cannot do for you.",
      },
      {
        title: "Found by people already coming here",
        body: "Frankfort pulls visitors for the market, the trail and the festivals. They look up where to eat and what is open while they are standing on Kansas Street. Being findable in that moment is worth more than ranking for anything broader.",
      },
      {
        title: "Ten minutes away",
        body: "Close enough to see the space before designing anything for it. A shop, a studio or a practice has a look already, and the useful version of this job starts by paying attention to it rather than proposing something from scratch.",
      },
    ],
    nearby: [
      "Mokena",
      "New Lenox",
      "Tinley Park",
      "Orland Park",
      "Homer Glen",
      "Lemont",
    ],
    ctaTitle: "Let us come and see it.",
    ctaBody:
      "Tell us about the business and what you want more of. You get a plan and a price in writing, not a mood board.",
  },
];
