# Good Looking Digital

Production website for Good Looking Digital — web design, development, and hosting for local businesses around Chicagoland, and custom applications and test automation for companies that outgrew their website.

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

## Environment

Lead capture needs two services. Copy `.env.example` to `.env.local` for local
development and set the same names in the Vercel project settings for
production.

| Variable                  | Purpose                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`             | Atlas connection string. Required — without it the form returns a 503 and offers the email address instead. |
| `MONGODB_DB`              | Database name. Optional, defaults to `good_looking_digital`.                                                |
| `RESEND_API_KEY`          | Email provider key. Without it leads are still stored, but no notification is sent.                         |
| `LEAD_NOTIFICATION_EMAIL` | Where enquiries go. Falls back to the site address.                                                         |
| `LEAD_FROM_EMAIL`         | Sender. Must be on a domain verified with the provider.                                                     |

**Secrets never enter the repository.** `.env.local` is gitignored;
`.env.example` holds names and comments only.

### How a lead is handled

Store first, notify second. A lead safely in the database is a lead that is
not lost, so email failures are logged and swallowed rather than shown to
someone who did nothing wrong. The only failure a visitor sees is one where
the message genuinely was not kept — and then they are given the email
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

- **Structure** — the two-door customer split, where colour carries information rather than decoration
- **Surface** — Fraunces display type, editorial spacing, restraint
- **Proof** — the passing test-run panel, placed on the platform path

Two signal colours map to the two customer paths and are used for nothing else:

| Token        | Meaning                                   |
| ------------ | ----------------------------------------- |
| `--grow`     | Local business path (burnt amber)         |
| `--platform` | Platform and engineering path (deep teal) |
| `--pass`     | Status only — a passing test              |

Every token is defined for light and dark. **Accent values are derived, not chosen by eye** — `--grow`, `--muted` and `--grow-soft` were solved to clear a 4.5:1 contrast ratio against their backgrounds in both themes. Changing them by hand without re-checking contrast will regress accessibility.

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
    site.ts            site copy, service paths, pricing — single source of truth
```

Copy and pricing live in `src/lib/site.ts` so they can be edited without touching layout code, and so the same data can later feed pages, the sitemap, and structured data.

## Build stages

This site is being built in reviewed stages. Current: **Stage 02 — foundation**.

Remaining: homepage, the two buyer paths, services and pricing, lead capture, case studies and local SEO, Playwright coverage, launch.

## Note on `AGENTS.md`

`AGENTS.md` is generated by `next dev` and is committed deliberately — deleting it only causes it to be recreated as an uncommitted change.
