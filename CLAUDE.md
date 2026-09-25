# CLAUDE.md: sydmoore.com

Author website for novelist Syd Moore. Read `docs/brief.md` for content and design decisions, and `docs/BUILD_PROMPT.md` for the original build spec.

## Stack (decided)

- **Astro 5**, static output, strict TypeScript. `build.format: "file"` and `trailingSlash: "never"` give clean URLs (`/about`) on Cloudflare Pages.
- **Content collections** (`src/content.config.ts`): books, series, events, news, pages. Markdown with YAML frontmatter, one file per entry.
- **Pages CMS** (`.pages.yml`) edits the same files. Keep `.pages.yml` and the Zod schemas in step.
- **Plain CSS** with tokens in `src/styles/tokens.css`. No Tailwind, no UI framework.
- **Client JS is limited to:** buy-panel tabs and mobile sheet (`BuyPanel.astro`), mobile menu (`Header.astro`), and the bio copy button (`CopyBio.astro`).
- **Fonts** self-hosted with Fontsource (Fraunces, Inter, IBM Plex Mono). No Google Fonts requests.
- **Hosting:** Cloudflare Pages. `public/_redirects` holds 301s from the old site; `public/_headers` holds the CSP and security headers.
- **Newsletter:** Kit free plan via a plain HTML form (`PUBLIC_KIT_FORM_ACTION`).
- **Contact form:** Pages Function `functions/api/contact.ts` with Turnstile, a honeypot, and email through **Resend**.
  - Deviation from the build prompt, which suggested Cloudflare's `send_email` binding. That binding's Pages Functions support was unclear and Cloudflare lists sending as a Workers Paid feature.
  - Resend's free plan (3,000 emails a month) works from any function with a plain `fetch`.
- **Analytics:** Cloudflare Web Analytics, which is cookieless, so there's no cookie banner.
- **Social images:** `src/pages/og/[slug].png.ts`, built with Satori + Resvg at build time. These use static `@fontsource/*` .woff files because Satori can't read woff2.

## Conventions

- **Never invent content.** No quotes, dates, ISBNs, URLs or biographical facts beyond `docs/brief.md`. Anything missing goes in `docs/CONTENT-TODO.md`.
- **Book status** is computed at build time (`bookStatus` in `src/lib/books.ts`): `auto` gives Pre-order before `pubDate` and Out now after it. The daily rebuild workflow keeps this current.
- **Event times** are UK wall-clock strings (`2026-10-08T19:00`) handled by `src/lib/dates.ts`.
- **Buy links:**
  - Retailer order and labels live in `RETAILERS` in `src/lib/books.ts`.
  - Empty links are hidden.
  - Amazon print links are generated from the ISBN (ISBN-10 = ASIN), and the Associates tag comes from `PUBLIC_AMAZON_TAG`.
  - The "Ad" disclosure must stay above the buttons (CAP Code).
- **Covers:** files go in `src/assets/covers/`. A book's `cover` field holds the file name (Pages CMS writes `/covers/<file>`). Missing covers render a typographic placeholder.
- **Accessibility:** WCAG 2.2 AA. Colour pairs in `tokens.css` are pre-checked; don't add new text colours without checking contrast.
- **Spelling:** en-GB throughout.

## Commands

```bash
npm run dev       # local dev server
npm run build     # static build to dist/
npm run check     # astro check (types)
npm test          # Playwright: routes, buy panel, keyboard, axe, links, redirects, mobile sheet
npm run lhci      # Lighthouse budgets (perf ≥ 95, a11y 100, best practices ≥ 95, SEO 100)
```

## Status (24 Sep 2026)

- All source files are written: pages, components, content for 15 books, 3 series, 2 events (1 draft) and 1 news post, plus CMS config, CI, the daily rebuild and the docs.
- **Not yet run:** `npm install`, the build and the tests. The build environment's network blocked the npm registry.
- **First thing to do:** run `npm install && npm run verify` and fix anything that fails. Then commit `package-lock.json`.

## Next steps

1. `npm install && npm run verify`; fix any build or type errors.
2. Pin the dependency versions from the resulting lockfile.
3. Deploy to Cloudflare Pages following `docs/DEPLOY.md`.
4. Work through `docs/CONTENT-TODO.md` with Syd, covers and the portrait first.
