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
   * The exact `name` of every matching row in paths[].services.
   *
   * Prices are read from those rows rather than repeated here, so a price can
   * never be right on the path page and stale on the service page. A typo
   * fails loudly at build time instead of quietly showing the wrong number.
   *
   * Usually one entry. It is a list because a page can legitimately cover two
   * rows - Google and Facebook presence is one job sold as two line items -
   * and splitting it into two near-identical pages would be worse for both a
   * reader and a search engine than covering it once properly.
   */
  sourceNames: string[];
  /**
   * Appended to the price when the number alone would mislead. "each" on a
   * page covering two separately priced rows, so "from $350" cannot be read
   * as the total for both.
   */
  priceSuffix?: string;
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

  const prices = service.sourceNames.map((name) => {
    const row = path?.services.find((s) => s.name === name);

    if (!row) {
      throw new Error(
        `services.ts: "${name}" does not match any row in paths[${service.path}]. ` +
          `The service list and the price list have drifted apart.`,
      );
    }

    return row.price;
  });

  // Covering two rows only works while they cost the same. The moment they
  // diverge, one number cannot honestly describe both, and the page needs
  // splitting or its own explicit wording - so fail rather than pick one.
  const distinct = [...new Set(prices)];
  if (distinct.length > 1) {
    throw new Error(
      `services.ts: "${service.slug}" covers rows priced differently (${distinct.join(", ")}). ` +
        `A single price cannot describe both.`,
    );
  }

  return service.priceSuffix
    ? `${distinct[0]} ${service.priceSuffix}`
    : distinct[0];
}

/**
 * The row on /grow or /platform this service expands on. Where a page covers
 * two rows they sit next to each other in the list, so the first is close
 * enough to land the reader in the right place.
 */
export function serviceRowHref(service: ServiceDetail): string {
  return `/${service.path}#${serviceAnchor(service.sourceNames[0])}`;
}

export function serviceBySlug(slug: string): ServiceDetail | undefined {
  return services.find((s) => s.slug === slug);
}

export const services: ServiceDetail[] = [
  {
    slug: "website-design",
    path: "grow",
    sourceNames: ["Website design and build"],
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

  {
    slug: "logo-design",
    path: "grow",
    sourceNames: ["Logo and brand identity"],
    metaTitle: "Logo and brand identity",
    metaDescription:
      "Logo design, colour palette and type for small businesses in Mokena and across Chicagoland. Drawn to work on a van door, a yard sign and a profile picture. Included with a website build.",
    eyebrow: "Branding",
    title: "Logo and brand identity",
    lede: "A mark that still reads at the size of a profile picture and still looks right three feet wide on the side of a van. Plus the colours and type that go with it, so everything carrying your name looks like it came from the same business.",
    included: [
      {
        title: "A mark that survives every size",
        body: "The test is not how it looks on a designer's screen. It is whether it still reads on a yard sign from across the street, on a van door at forty miles an hour, and shrunk into a circle on a Facebook profile. Those are three different problems, and the logo gets drawn to survive all of them.",
      },
      {
        title: "Colours and type, not just a logo",
        body: "A logo on its own is not an identity. You get a small palette and a pair of typefaces chosen to sit with it, so an invoice, a sign and a website look like one business rather than three that happen to share a name.",
      },
      {
        title: "Legible in one colour",
        body: "Some places give you exactly one colour - a stamp, an embroidered shirt, a vinyl cut, a newspaper ad. A logo that falls apart in black and white was never finished, so yours gets checked that way before anyone signs it off.",
      },
      {
        title: "Every file you will actually be asked for",
        body: "Vector files for anything printed, so a sign shop can scale it as far as it likes without it going soft at the edges. Flat one-colour versions. Correctly sized images for social profiles. Handed over in a labelled folder so you are never guessing which one to send.",
      },
      {
        title: "Yours outright",
        body: "You own the artwork and the source files. No licence, no annual fee, and no asking permission before you put it on something.",
      },
    ],
    process: [
      {
        title: "What you actually do",
        body: "Twenty minutes on the phone about the work, the customers and who else is competing for them. Most of the useful material comes from how you describe the jobs you like, not from a mood board.",
      },
      {
        title: "Two or three directions",
        body: "Options that genuinely differ from each other, rather than one real idea flanked by two weak ones put there to make it look better.",
      },
      {
        title: "Refine the one you pick",
        body: "Spacing, weight, how it behaves small, how it behaves in a single colour. This is where a rough idea becomes something you can hand to a sign shop.",
      },
      {
        title: "Handover",
        body: "The full set of files, labelled, with a short note on which version to send where.",
      },
    ],
    notIncluded: [
      "Trademark searches and registration - nothing gets knowingly copied, but clearing a name legally is a trademark attorney's job rather than ours",
      "Printing of any kind - artwork is supplied print-ready and you take it to whichever printer or sign shop you prefer",
      "Rebranding a business that already has signage, vehicles and stationery out in the field, which is a considerably bigger job than this",
    ],
    faqs: [
      {
        q: "Why does the price say included?",
        a: "Because a new website carrying a logo that does not match it is half a job. Branding comes with a website build rather than being sold alongside it. If you want the logo without the site, say so and it gets priced on its own.",
      },
      {
        q: "What if I already have a logo?",
        a: "Then we use it. The work becomes making sure it is properly set up - the file formats you will be asked for, a palette and type that sit with it, and a one-colour version if you do not already have one. That is usually faster and cheaper than starting again, and we will say so rather than talk you into a redesign.",
      },
      {
        q: "How many options do I get?",
        a: "Two or three real directions, then proper refinement on the one you choose. Not fifty thumbnails - that makes a decision harder, not easier.",
      },
      {
        q: "Can it go on a vehicle or a large sign?",
        a: "Yes, and that is specifically what the vector files are for - a wrap installer or sign shop will ask for exactly those. Worth mentioning a vehicle wrap up front though, because it changes how wide the mark wants to be drawn.",
      },
      {
        q: "Do I own it?",
        a: "Yes, outright, including the source files. No licence and no annual fee.",
      },
    ],
    ctaTitle: "Let us see what you do.",
    ctaBody:
      "Tell us about the work and the customers you want more of. You get real options and a price in writing, not a mood board.",
  },

  {
    slug: "lead-capture",
    path: "grow",
    sourceNames: ["Lead capture & follow-up"],
    metaTitle: "Lead capture and follow-up",
    metaDescription:
      "The form, the database behind it, the alert that reaches you in seconds, the confirmation your customer gets, and a reminder if nobody called back. Running on this site today.",
    eyebrow: "Lead capture",
    title: "Lead capture and follow-up",
    lede: "The most expensive enquiry is the one that arrived and nobody answered. The advertising was already paid for and the customer was already interested - then it landed in a spam folder, or got read on a phone between jobs and forgotten. This is everything that happens after someone decides to contact you.",
    included: [
      {
        title: "A form that works, and is tested",
        body: "Short, because every extra field costs you enquiries. Usable one-handed on a phone. Readable by a screen reader, with errors that say what is actually wrong. Automated tests run over it on every change, because a contact form that quietly stops working is the most expensive bug a small business site can have.",
      },
      {
        title: "Stored, not just emailed",
        body: "Email is where enquiries go to die - a spam filter, a full mailbox, a bad moment. Every enquiry is written to a database first, so the email failing to arrive stops being a way to lose work.",
      },
      {
        title: "You know within seconds",
        body: "A notification reaches you as soon as the form is sent, carrying what you need in order to call the person back. Not a daily digest, and not a dashboard you have to remember to open.",
      },
      {
        title: "Your customer hears back immediately",
        body: "An automatic confirmation goes out, so nobody is left wondering whether the form worked. Silence after sending a form is exactly why people contact three businesses instead of one.",
      },
      {
        title: "A reminder if nobody called back",
        body: "When an enquiry sits unanswered past a threshold you choose, you get chased about it - once, inside working hours, never overnight. One nudge, because a reminder arriving every hour gets muted, and a muted reminder protects nothing.",
      },
      {
        title: "You can tell where they came from",
        body: "An enquiry from a yard sign, a Google listing and a Facebook post look different in the record, so you can find out which of them is actually worth the money.",
      },
    ],
    process: [
      {
        title: "Work out what you need to know",
        body: "Which questions genuinely help you quote the job, and which ones simply cost you enquiries. Usually fewer than people expect.",
      },
      {
        title: "Build and wire it up",
        body: "The form, the storage, the notification and the confirmation, connected and tested end to end rather than assumed to work.",
      },
      {
        title: "Set the follow-up rules",
        body: "How long an enquiry may sit before you get chased, and the hours a reminder is allowed to arrive.",
      },
      {
        title: "Tune it on real enquiries",
        body: "Real ones behave differently from test ones. The thresholds are worth adjusting once traffic is genuine rather than guessed up front.",
      },
    ],
    notIncluded: [
      "Advertising - this does not make enquiries appear, it makes sure none of the ones you get go missing",
      "Replacing a CRM you already run - connecting to one is automation work and gets quoted separately",
      "Answering the enquiries, which remains the part only you can do",
    ],
    faqs: [
      {
        q: "Is this the same thing as advertising?",
        a: "No, and the difference is worth being clear about. Advertising is how somebody finds out you exist. This is what happens after they have already decided to contact you. We do not make enquiries appear - we make sure none of them are lost.",
      },
      {
        q: "Does this actually run anywhere, or is it a promise?",
        a: "It runs on this site. The form you would use to contact us is the same one, with the same storage, the same notification and the same follow-up reminder behind it. The lead path here is covered by automated tests, which is how we know it still works rather than assuming it does.",
      },
      {
        q: "What if I miss the notification anyway?",
        a: "That is precisely what the reminder exists for. If an enquiry has been sitting unanswered past your threshold, you get told - once, inside the hours you set. It is meant to say this was missed, not you are busy.",
      },
      {
        q: "Where does my customer's information go?",
        a: "Into a database only you have access to, and nowhere else. Not sold, not used for advertising, not shared. Whatever gets built for you comes with a privacy notice describing accurately what actually happens to it, rather than boilerplate copied from somewhere else.",
      },
      {
        q: "Can I tell which sign or page produced a call?",
        a: "Yes. Where an enquiry came from is recorded alongside it, so a QR code on a yard sign and a link in a Google listing are distinguishable afterwards. That is how you work out which one is worth continuing with.",
      },
    ],
    ctaTitle: "Stop losing the ones you already paid for.",
    ctaBody:
      "Tell us how enquiries reach you now, and where you think they go missing. You get a plan and a price in writing.",
  },

  {
    slug: "google-business-profile",
    path: "grow",
    sourceNames: [
      "Google Business Profile setup",
      "Facebook & Instagram page setup",
    ],
    priceSuffix: "each",
    metaTitle: "Google Business Profile and Facebook setup",
    metaDescription:
      "Google Business Profile, Facebook and Instagram pages set up properly for small businesses in Mokena and across Chicagoland. Created in your name, verified, and consistent with your website.",
    eyebrow: "Local presence",
    title: "Google and Facebook presence",
    lede: "Being findable in the places people actually look. A Google listing that appears when somebody nearby searches for what you do, and social pages that read as a working business rather than an abandoned one.",
    included: [
      {
        title: "The Google listing, set up properly",
        body: "Categories, service area, hours, description, services and photos. Most of the value sits in the category and the service area, which are also the two things most often set wrong - and a wrong category quietly keeps you out of searches you should be winning.",
      },
      {
        title: "Verified, which is the part people abandon",
        body: "Google will not show a listing it has not verified, and it chooses the verification method rather than letting you pick. It takes days rather than minutes, and it is the step most people start and never finish.",
      },
      {
        title: "Photos that do actual work",
        body: "Listings with real photographs get contacted more than listings without. You will be told exactly what to photograph and from where, which is usually less work than people expect.",
      },
      {
        title: "Facebook and Instagram, set up as a business",
        body: "Proper business pages rather than personal profiles, carrying the same name, hours, service area and contact details as everything else.",
      },
      {
        title: "The same details in every place",
        body: "Name, address and phone written identically across your site, your Google listing and your social pages. Search engines treat that agreement as evidence you are a real business, and disagreement as a reason to trust none of them.",
      },
      {
        title: "In your name from the start",
        body: "Created under your account with delegated access for us, never the other way round. If we stop working together you keep the pages, the reviews and the history.",
      },
    ],
    process: [
      {
        title: "Gather the details",
        body: "Hours, service area, the categories that match what you actually do, and a short list of photographs worth taking.",
      },
      {
        title: "Create and verify",
        body: "The listing goes up and verification starts. This is the slow part, so it gets started first rather than last.",
      },
      {
        title: "Fill it in properly",
        body: "Description, services, photos and the questions people ask. An empty verified listing is only marginally better than none.",
      },
      {
        title: "Hand over",
        body: "Access confirmed as yours, with a short note on how to post and what is worth posting.",
      },
    ],
    notIncluded: [
      "Advertising spend on Google, Facebook or anywhere else - profiles get set up, campaigns are not run here",
      "Day-to-day social posting and content creation. Keeping a Google profile current is part of the Growth care plan; running your social accounts is not a service offered here",
      "Removing or disputing existing bad reviews, which is between you and the platform",
    ],
    faqs: [
      {
        q: "Who owns the pages?",
        a: "You do, always, and they are created in your name from the start. Good Looking Digital gets delegated access to do the work and nothing more. If we stop working together you keep the pages, the reviews and the history.",
      },
      {
        q: "Will this get me to the top of Google?",
        a: "Nobody can promise that, and anybody who does is guessing. What a properly set up profile does is make you eligible to appear when somebody nearby searches for what you do. Eligible is not the same as first, and the distance between them is mostly reviews and time.",
      },
      {
        q: "How long does verification take?",
        a: "Usually a few days, occasionally a couple of weeks. Google picks the method and you cannot choose it, which is why it gets started at the beginning rather than left to the end.",
      },
      {
        q: "What if someone already set up a listing for me?",
        a: "Then it gets claimed back into your name rather than a second one being created. Duplicate listings actively work against you, because Google splits the signals between them and neither ranks as well as one would.",
      },
      {
        q: "Do I need Facebook and Instagram if I only care about Google?",
        a: "No. Google is the one that gets you called. The social pages are worth having so your details agree everywhere and so you do not look absent, but if you only want the Google listing then that is a smaller job and it gets priced as one.",
      },
    ],
    ctaTitle: "Get found where people are looking.",
    ctaBody:
      "Tell us what you do and the towns you cover. The listing goes up in your name, and verification starts the same week.",
  },

  {
    slug: "qr-signage",
    path: "grow",
    sourceNames: ["QR codes and landing pages"],
    metaTitle: "QR codes for signs and vehicles",
    metaDescription:
      "A QR code on your own domain, the short tracked link behind it, and the page it opens. Supplied as vector so it scales to any sign. You print it wherever you like.",
    eyebrow: "QR marketing",
    title: "QR codes that keep working",
    lede: "Most yard signs end at a phone number nobody dials. A QR code turns the person standing on the pavement into an enquiry before they have walked away - but only if it points somewhere worth landing, and only if nobody else can switch it off. Offered on sites we built or host, because the tracked link has to live on your own domain.",
    included: [
      {
        title: "The code as a vector file",
        body: "Supplied as SVG, so it scales from a business card to a van door without softening at the edges. A PNG off a free generator is a fixed grid of pixels, and blown up to sign size the edges blur into each other - which is exactly what stops a camera reading it.",
      },
      {
        title: "It points at your domain, not somebody else's",
        body: "Free QR sites usually route through their own redirect. When that service expires, starts charging or simply shuts down, every sign you printed dies with it. Yours points at your own address, so nobody else is holding the other end.",
      },
      {
        title: "A short link, which is why it scans from further",
        body: "The more characters a code carries, the more squares it needs, and the smaller each square becomes at the same printed size. A short path scans from roughly twice the distance of the same code carrying tracking parameters - so the tracking lives in the link itself rather than trailing off the end of it.",
      },
      {
        title: "You can tell which sign produced which call",
        body: "Each code gets its own short path, so a sign on one road and a flyer left at the hardware store are distinguishable afterwards. That is how you find out which one is worth repeating.",
      },
      {
        title: "A page built for one thing",
        body: "The code opens a page about the offer on the sign, not your homepage. Somebody who scanned a sign about gutter cleaning should land on gutter cleaning rather than a menu of everything you do.",
      },
      {
        title: "The numbers your printer will ask for",
        body: "The minimum printed width for the distance you want it read from, how much clear space it needs around it, and why a logo must not go through the middle. Hand it to whoever makes the sign.",
      },
    ],
    process: [
      {
        title: "Pick the one offer",
        body: "A code opening a menu converts badly. Decide the single thing the sign is about before anything else happens.",
      },
      {
        title: "Build the page and the short link",
        body: "A single-purpose page, fast on a phone held one-handed at the kerbside, behind a short path that records where the scan came from.",
      },
      {
        title: "Generate and check the code",
        body: "Vector output, error correction chosen for outdoors, clear space enforced. Then printed at several sizes and actually scanned from a distance, because the arithmetic is a guide and a real phone is the test.",
      },
      {
        title: "You take it from there",
        body: "The file and the numbers are yours. Your sign shop lays it out, or you drop it into a sticker order yourself.",
      },
    ],
    notIncluded: [
      "Sign artwork and layout - you get the code and the measurements, and your sign shop does the design, which they do every day and usually include with a print order",
      "Printing, the physical signs, putting them out, and any permit your town wants before you do",
      "The form, storage, notifications and follow-up behind the page, which is lead capture and is priced separately",
    ],
    faqs: [
      {
        q: "Why pay for this when QR generators are free?",
        a: "Because the code is the easy part and it is not what you are buying. A free generator gives you a pixel image pointing through somebody else's redirect, with no way to tell which sign produced which call. You are paying for a link on your own domain that cannot be switched off, a page worth landing on, and knowing which sign worked.",
      },
      {
        q: "Do you design the sign itself?",
        a: "No. You get the code as a scalable file plus the measurements it needs, and your sign shop does the layout - it is what they do all day, and most of them include it with the print order. It keeps you free to shop on price and means nobody is marking printing up.",
      },
      {
        q: "How big does the code need to be?",
        a: "Roughly a tenth of the distance you want it read from, so a code read from ten feet away wants to be around a foot across. Which is worth knowing before you order: a code on a yard sign works for somebody walking past it, and will never work for somebody driving past it.",
      },
      {
        q: "Can I change where it points after it is printed?",
        a: "Yes, and that is the point of it living on your domain. The printed sign never has to change - what it opens can, as often as you like, including pointing it somewhere seasonal and then back again.",
      },
      {
        q: "Does this work if my website is on Wix or Squarespace?",
        a: "Usually not, and it is better to say so now. The short tracked link has to be added to your own site, which needs a level of control those builders do not give you. This works best on a site we built or host.",
      },
    ],
    ctaTitle: "Give the sign somewhere worth going.",
    ctaBody:
      "Tell us the offer and how far away you want it read from. You get the code, the link behind it, and the page it opens.",
  },

  {
    slug: "hosting-and-care",
    path: "grow",
    sourceNames: ["Hosting and care"],
    metaTitle: "Hosting and care plans",
    metaDescription:
      "Hosting, monitoring, security updates and small changes for small business websites, from $95 a month. Month to month, and the same person who built it answers.",
    eyebrow: "Care",
    title: "Hosting and care plans",
    lede: "A website is not furniture. The things around it keep moving - browsers, certificates, the software underneath, the businesses you connect to - and a site nobody maintains stops working quietly rather than loudly. This is what keeps it working, and who answers when it does not.",
    included: [
      {
        title: "Hosting that is genuinely fast",
        body: "Served from the edge, close to whoever is asking for it, with a certificate that renews itself. Not a cheap shared server three states away with four hundred other sites on it.",
      },
      {
        title: "Instant rollback",
        body: "If an update breaks something, the previous version is back live in under a minute. That is a property of how the site is deployed rather than a promise to work quickly under pressure.",
      },
      {
        title: "Watched from outside",
        body: "Checked every few minutes from somewhere that is not us, because a site reporting on its own health is a night watchman asleep at the desk. If it stops answering, we find out before you do.",
      },
      {
        title: "Security and dependency updates",
        body: "The software a site sits on gets patched. Left alone for a year, it becomes the easiest way in - and the overwhelming majority of small business sites that get defaced were simply out of date.",
      },
      {
        title: "Small changes included",
        body: "Text, prices, photos, opening hours, a new team member. Send them over rather than working out how to do it yourself at nine in the evening.",
      },
      {
        title: "A person who answers",
        body: "The same person who built it. Not a ticket queue, and not somebody junior reading from a runbook written by whoever left last.",
      },
    ],
    notIncluded: [
      "Advertising and campaign management of any kind",
      "Substantial new features or a redesign, which are quoted as projects rather than absorbed into a monthly plan",
      "Third-party subscriptions you hold directly, such as a domain, a booking tool or stock photography",
    ],
    faqs: [
      {
        q: "What are the tiers?",
        a: "Three, from $95 to $250 a month, and the full breakdown is on the pricing page. The short version: Essential keeps the site up and current, Growth keeps it changing as the business does, and Care+ is for a site or application doing real work every day.",
      },
      {
        q: "Do I have to take a care plan?",
        a: "No. The site is yours and you can host it yourself or with anyone else. What you give up is the monitoring, the updates and the person who answers, which is a perfectly reasonable trade right up until the morning something breaks.",
      },
      {
        q: "Can I cancel?",
        a: "Yes, month to month, and you keep the site. Leaving means pointing your domain somewhere else rather than negotiating a release with anybody.",
      },
      {
        q: "What happens if the site goes down at two in the morning?",
        a: "Monitoring notices and an alert fires. Whether it is fixed at two in the morning depends on what broke and which plan you are on. This business runs alongside a full-time job, which is said plainly here rather than dressed up as round-the-clock support.",
      },
      {
        q: "Are there backups?",
        a: "The site itself lives in version control, so any previous version can be put back live. Where there is a database behind it, Atlas takes an automatic daily snapshot that cannot be switched off, so the data can be restored as well as the code.",
      },
    ],
    ctaTitle: "Keep it working.",
    ctaBody:
      "Tell us what you have and where it is hosted now. You get a straight answer about which plan fits, or that you do not need one.",
  },
];
