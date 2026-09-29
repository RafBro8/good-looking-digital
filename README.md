# Good Looking Digital

Production website for Good Looking Digital - web design, development, and hosting for local businesses around Chicagoland, and custom applications and test automation for companies that outgrew their website.

**Looks good. Works even better.**

## Stack

| Layer     | Choice                                            |
| --------- | ------------------------------------------------- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript   |
| Styling   | Tailwind CSS v4 (CSS-first config, no JS config)  |
| Fonts     | Fraunces, Archivo, JetBrains Mono via `next/font` |
| Hosting   | Vercel                                            |
| Database  | MongoDB Atlas (Stage 06)                          |
| Services  | Render (Stage 06)                                 |
| E2E tests | Playwright (Stage 08)                             |

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

| Script                 | Purpose                             |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Dev server                          |
| `npm run build`        | Production build with type checking |
| `npm run lint`         | ESLint                              |
| `npm run format`       | Prettier, including class sorting   |
| `npm run format:check` | Verify formatting without writing   |

## Brand assets

Originals from the designer live in `brand-source/` and are **not** in
`public/` - anything in `public` is served, and each original is over a
megabyte. Web assets are generated from them:

```bash
node scripts/recolour-mark.js brand-source/mark-black.png public/brand
```

That script does two things the originals needed:

**Recolours** the mark from its original blue-to-magenta into the site
palette. A rigid hue rotation cannot do this - the source spans about 80
degrees while teal-to-amber spans 145, so the range has to be stretched. The
map is also piecewise, because 59% of the mark sits in one narrow blue band
and a linear map dumps all of it into green. Stops are aligned to the real
token hues: 173 for `--platform`, 18 for `--grow`.

**Cuts out the background**, which was baked in with no alpha channel. A
brightness threshold alone would punch holes in the mark, since its own shadow
faces are nearly as dark as the background, so the fill runs inward from the
borders and only removes what is actually connected to the outside. A second
pass removes enclosed background - the counter inside the D - which is safe
at a threshold of 4 because the histogram is empty between there and the
shadows at 20.

Re-run it after changing any stop and check the result on both themes before
committing.

## Environment

Lead capture needs two services. Copy `.env.example` to `.env.local` for local
development and set the same names in the Vercel project settings for
production.

| Variable                  | Purpose                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`             | Atlas connection string. Required - without it the form returns a 503 and offers the email address instead. |
| `MONGODB_DB`              | Database name. Optional, defaults to `good_looking_digital`.                                                |
| `RESEND_API_KEY`          | Email provider key. Without it leads are still stored, but no notification is sent.                         |
| `LEAD_NOTIFICATION_EMAIL` | Where enquiries go. Falls back to the site address.                                                         |
| `LEAD_FROM_EMAIL`         | Sender. Must be on a domain verified with the provider.                                                     |

**Secrets never enter the repository.** `.env.local` is gitignored;
`.env.example` holds names and comments only.

### Texting yourself when a lead arrives

Email carries the detail; the text exists so a phone buzzes. A contractor on a
roof reads a text and does not read email, and the competitor who replies in
five minutes wins the job.

Set the four `TWILIO_*` and `LEAD_SMS_TO` variables and it starts working.
Leave them unset and nothing breaks - SMS is treated exactly like email, as a
best effort after the lead is already safely stored.

**Never text the person who enquired.** The SMS goes only to your own number.
In the US, texting a consumer without a recorded opt-in is a TCPA problem, and
submitting a form is not consent to be texted. Adding customer SMS later means
an explicit opt-in checkbox, a record of that consent, and A2P 10DLC
registration - not just another recipient in `notify.ts`.

### A database for local development

Atlas is for production. Locally, a disposable container is quicker and cannot
damage anything:

```bash
docker run -d --name gld-mongo-test -p 27019:27017 mongo:7
```

Then set `MONGODB_URI=mongodb://localhost:27019` in `.env.local`. Remove it
with `docker rm -f gld-mongo-test` when it is no longer wanted. Port 27019 is
deliberate - 27017 and 27018 are often already taken by other projects.

Inspect what landed:

```bash
docker exec gld-mongo-test mongosh good_looking_digital --eval "db.leads.find().pretty()"
```

### How a lead is handled

Store first, notify second. A lead safely in the database is a lead that is
not lost, so email failures are logged and swallowed rather than shown to
someone who did nothing wrong. The only failure a visitor sees is one where
the message genuinely was not kept - and then they are given the email
address.

Spam protection is a honeypot field plus a rate limit of five submissions per
IP per hour. The limiter counts through Mongo rather than memory, because
serverless invocations do not share memory and an in-process counter would
enforce nothing. If the limiter itself fails it allows the request through: a
broken limiter must not become a closed door.

The lead API runs on Vercel rather than the Render service, deliberately. A
free Render instance sleeps and takes about a minute to wake, which is a
minute a prospect spends looking at a form that has not submitted. Render
remains available for client platform work that needs a persistent service.

## Design system

The visual language combines three explored directions:

- **Structure** - the two-door customer split, where colour carries information rather than decoration
- **Surface** - Fraunces display type, editorial spacing, restraint
- **Proof** - the passing test-run panel, placed on the platform path

Two signal colours map to the two customer paths and are used for nothing else:

| Token        | Meaning                                   |
| ------------ | ----------------------------------------- |
| `--grow`     | Local business path (burnt amber)         |
| `--platform` | Platform and engineering path (deep teal) |
| `--pass`     | Status only - a passing test              |

Every token is defined for light and dark. **Accent values are derived, not chosen by eye** - `--grow`, `--muted` and `--grow-soft` were solved to clear a 4.5:1 contrast ratio against their backgrounds in both themes. Changing them by hand without re-checking contrast will regress accessibility.

Tokens live in `src/app/globals.css` and are exposed to Tailwind through `@theme inline`.

## Structure

```
src/
  app/
    globals.css        design tokens, both themes, base layer
    layout.tsx         fonts and site-wide metadata
    page.tsx           design system reference page
  components/
    ui.tsx             Container, Section, Eyebrow, Button, Rule
    PathCard.tsx       one of the two customer doors
    TestRunPanel.tsx   the test-run proof panel
  lib/
    site.ts            site copy, service paths, pricing - single source of truth
```

Copy and pricing live in `src/lib/site.ts` so they can be edited without touching layout code, and so the same data can later feed pages, the sitemap, and structured data.

## Scripts

### `make-qr.js` - QR codes a sign shop can print

```bash
node scripts/make-qr.js https://clientsite.com/s/wolf-rd
node scripts/make-qr.js https://clientsite.com/s/wolf-rd --distance 15 --name wolf-road
```

Writes `qr-output/<name>/` containing the code as **SVG** and a printable
**print guide**: the minimum width for the distance you want it read from, the
rules a sign shop needs (quiet zone, contrast, no logo through the middle), and
a test sheet of the same code at four printable sizes with the distance each
should reach and a blank to write down what it actually managed.

Error correction is **M** and the quiet zone is four modules. The code is
**decoded again with a second library before anything is written** - nothing
ships that does not read back as the URL it was made from.

Two things it will tell you that people get wrong: a longer link needs a
physically larger code for the same scan distance, and a code on a yard sign
works for somebody walking up to it and never for somebody driving past.

### `refresh-test-panel.js` - update the homepage test panel

```bash
node scripts/refresh-test-panel.js --check   # report drift, change nothing
node scripts/refresh-test-panel.js           # update from the latest green CI run
```

Pulls artefacts from a successful CI run, takes the slowest engine per spec and
the slowest engine's total, and refuses to write if any engine failed. Run
prettier afterwards. CI artefacts are kept 14 days.

## Build stages

Built in reviewed stages, each one shown and approved before it ships.

Done: the design system, the homepage, the two buyer paths, pricing, about,
lead capture with follow-up reminders, Playwright coverage running in CI across
three engines, a health endpoint for monitoring from outside, a page for each
of the nine services, and landing pages for seven of the eight towns served.

Remaining: case studies once there are projects worth showing, and launch -
which is waiting on the domain being attached.

## Note on `AGENTS.md`

`AGENTS.md` is generated by `next dev` and is committed deliberately - deleting it only causes it to be recreated as an uncommitted change.
