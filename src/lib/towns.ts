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
        body: "Fifteen minutes to New Lenox, Frankfort, Tinley Park or Orland Park. Near enough to sit down with you, look at the place properly and go through the wording in person, rather than doing the whole thing over email and hoping we understood each other.",
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
        body: "You take the pictures - a phone in decent daylight is genuinely enough - and we can tell you which ones are worth taking and which to leave out, which is the part most people get wrong. Your actual jobs beat stock images of somebody else's kitchen every time, and they are the one thing on the site nobody can copy from you.",
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

  {
    slug: "web-design-orland-park",
    name: "Orland Park",
    metaTitle: "Web design in Orland Park, Illinois",
    metaDescription:
      "Websites and lead capture for Orland Park businesses, built and tested by one senior engineer rather than briefed out by an agency. Fifteen minutes away in Mokena.",
    lede: "Orland Park has the busiest retail corridor for miles and is about to get busier. Amazon is building its first physical megastore in the country at 159th and LaGrange, and whatever you sell, the traffic past that corner is about to change.",
    local: [
      {
        title: "A corridor about to get a lot more crowded",
        body: "The Village Board approved 229,000 square feet on thirty-five acres at the old Petey's site. Sales tax money from it is already earmarked for widening the junction. More cars, more attention, and a very large competitor teaching everybody nearby to check their phone before deciding where to stop.",
      },
      {
        title: "We are not a marketing agency",
        body: "There are agencies here and some of them are genuinely good, which is worth saying plainly rather than pretending otherwise. This is a different thing: one senior engineer who builds the site and writes automated tests over the parts that bring you work, rather than a team that briefs the build out to somebody you never meet.",
      },
      {
        title: "Big enough that being second is expensive",
        body: "In a village of sixty thousand with a regional shopping draw, nobody has to settle for whoever appears first. They compare. Which means the gap between a site that answers their question in five seconds and one that makes them hunt for a phone number is measured in jobs, not in compliments.",
      },
      {
        title: "Down LaGrange Road, not across the country",
        body: "Most of the firms selling you a website in Orland Park will never set foot in it. We can come and see the place, which changes what gets built, and be back before the afternoon is over.",
      },
    ],
    nearby: [
      "Tinley Park",
      "Mokena",
      "Homer Glen",
      "New Lenox",
      "Frankfort",
      "Lemont",
    ],
    ctaTitle: "Before the corner changes.",
    ctaBody:
      "Tell us what you sell and who you want walking in. You get a plan and a price in writing, and an honest answer if you do not need us.",
  },

  {
    slug: "web-design-tinley-park",
    name: "Tinley Park",
    metaTitle: "Web design in Tinley Park, Illinois",
    metaDescription:
      "Websites, branding and lead capture for Tinley Park businesses. Built twenty minutes away, by the person who writes the code and tests it.",
    lede: "Tinley Park spent the last few years rebuilding its downtown, and Harmony Square finished it. A concert stage, an ice rink and new retail at Oak Park Avenue and North Street means more people walking past your door than last year.",
    local: [
      {
        title: "More footfall than you had last year",
        body: "Harmony Square draws people to Oak Park Avenue for a reason other than an errand, which is the hardest kind of visitor to attract and the easiest to waste. They arrive, they look up what is open, and they decide in about eight seconds.",
      },
      {
        title: "Fourteen hundred businesses is a crowded room",
        body: "That is roughly how many operate here, and the oldest has been trading since 1928. Plenty of them are excellent and nearly invisible online, because the website was built once and never touched again. That is a gap, and it is a cheaper one to close than most owners expect.",
      },
      {
        title: "People arriving by train are already holding a phone",
        body: "The Oak Park Avenue station puts visitors on the street with no idea where to go, deciding from whatever their phone shows them. That is a different kind of customer from somebody who drove here on purpose, and it rewards being easy to find far more than being clever.",
      },
      {
        title: "Twenty minutes, and the same person throughout",
        body: "Near enough to come and look before designing anything. And whoever answers the phone in a year is the person who built it, which is not how this usually goes.",
      },
    ],
    nearby: [
      "Orland Park",
      "Mokena",
      "New Lenox",
      "Frankfort",
      "Homer Glen",
      "Lemont",
    ],
    ctaTitle: "Catch them while they are standing there.",
    ctaBody:
      "Tell us what you do and who you want through the door. Twenty minutes on the phone is most of what this takes to start.",
  },

  {
    slug: "web-design-lemont",
    name: "Lemont",
    metaTitle: "Web design in Lemont, Illinois",
    metaDescription:
      "Websites and lead capture for Lemont businesses, from the historic downtown to the trades. Built nearby by an engineer, not briefed out to a template.",
    lede: "Lemont has fourteen blocks of downtown on the National Register and a national laboratory at the edge of the village. Very few towns this size hold both, and between them they decide who your customers are.",
    local: [
      {
        title: "Thirty-eight buildings nobody is allowed to spoil",
        body: "The downtown historic district has been on the National Register since 2016, limestone frontages and all, which is a genuine asset and a genuine constraint. You cannot rebuild the shopfront to get noticed. What you can change is what somebody finds when they look the place up first.",
      },
      {
        title: "Your neighbours include fourteen hundred scientists",
        body: "Argonne has a Lemont address, three and a half thousand staff, and fourteen hundred scientists and engineers, three quarters of whom hold doctorates. That is an unusually exacting local market. A site that looks like it was thrown together in an afternoon reads differently to people who spend their working lives on detail.",
      },
      {
        title: "Visitors who came for the canal",
        body: "The I and M Canal corridor brings people here for the trail, the history and the restaurants, and they arrive with no plan beyond lunch. Whether they find you is decided entirely by a phone, in the ten minutes between parking and deciding.",
      },
      {
        title: "Old building, current expectations",
        body: "A business trading out of an 1870s limestone storefront is still judged on a five inch screen. The charm does not carry across on its own, and photographs and words are the only part of it that travel.",
      },
    ],
    nearby: [
      "Homer Glen",
      "Orland Park",
      "Mokena",
      "Tinley Park",
      "New Lenox",
      "Frankfort",
    ],
    ctaTitle: "The building already works. Let us do the rest.",
    ctaBody:
      "Tell us what you do and who you want finding you. You get a plan and a price in writing, and a straight answer if it is not worth doing.",
  },

  {
    slug: "web-design-homer-glen",
    name: "Homer Glen",
    metaTitle: "Web design in Homer Glen, Illinois",
    metaDescription:
      "Websites and lead capture for Homer Glen nurseries, landscapers and trades. Built nearby, by the person who writes the code and tests it.",
    lede: "Homer Glen is the rare village that legislated its own quiet. It was the first municipality in Illinois, and the fourth community anywhere, to be named an International Dark Sky Community - which has an odd and useful consequence for anybody trading here.",
    local: [
      {
        title: "Nobody here wins with a brighter sign",
        body: "The 2007 lighting ordinance exists, in the village's own words, to remove the need for businesses to compete for attention by escalating their outdoor lighting. It works. It also means the usual way of shouting at passing traffic is simply unavailable to you, and whatever is left has to do the shouting instead.",
      },
      {
        title: "A village that grows things",
        body: "Bell Road alone holds a run of nurseries and garden centres, and the village keeps ordinances on landscaping, tree preservation and conservation design alongside the lighting one. This is a place with a settled idea of itself, and the businesses that fit it tend to be the ones that look like they belong.",
      },
      {
        title: "Most of the year decided in six weeks",
        body: "Anybody selling plants, mulch, mowing or planting knows the spring is the whole argument. Being easy to find in April is worth more than being findable in November, and a form that quietly stopped working in March is a year's difference rather than an inconvenience.",
      },
      {
        title: "No ticket queue, no account manager",
        body: "One person builds it, answers about it, and is still there in two years. For a business with an owner who does the quoting themselves, that tends to matter more than a longer list of services.",
      },
    ],
    nearby: [
      "Lemont",
      "Orland Park",
      "Mokena",
      "New Lenox",
      "Tinley Park",
      "Frankfort",
    ],
    ctaTitle: "Before the spring, not during it.",
    ctaBody:
      "Tell us what you do and when your season starts. The quiet months are when this gets built properly.",
  },
];
