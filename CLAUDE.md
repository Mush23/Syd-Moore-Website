# CLAUDE.md: sydmoore.com

Author website for novelist Syd Moore. Read `docs/brief.md` for content and design decisions, and `docs/BUILD_PROMPT.md` for the original build spec.

## Stack (decided)

- **Astro 7** (Zod 4 via `astro/zod`), static output, strict TypeScript. Needs Node 22.12+ (`.nvmrc` = 22). `build.format: "file"` and `trailingSlash: "never"` give clean URLs (`/about`) on Cloudflare Pages.
- **Content collections** (`src/content.config.ts`): books, series, events, news, pages. Markdown with YAML frontmatter, one file per entry.
- **Pages CMS** (`.pages.yml`) edits the same files. Keep `.pages.yml` and the Zod schemas in step.
- **Plain CSS** with tokens in `src/styles/tokens.css`. No Tailwind, no UI framework.
- **Client JS is limited to:** buy-panel tabs and mobile sheet (`BuyPanel.astro`), mobile menu (`Header.astro`), and the bio copy button (`CopyBio.astro`).
- **Fonts** self-hosted with Fontsource (Fraunces, Inter, IBM Plex Mono). No Google Fonts requests.
  - The Latin Fraunces and Inter files are preloaded in `BaseLayout.astro`, and `tokens.css` defines size-matched "Fraunces Fallback" and "Inter Fallback" faces (Georgia and Arial with `size-adjust`), so text doesn't shift when the fonts load. Keep both if the font files change.
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

## Status (25 Sep 2026)

- Installed, built and tested for the first time on branch `finish-and-test`.
- `npm run check`: 0 errors, 0 warnings, 0 hints. `npm run build`: 32 pages, no warnings.
- `npm test`: all 65 Playwright tests pass (routes, axe WCAG 2.2 AA, buy panel, keyboard tabs, phone sheet, links, redirects).
- `npm run lhci`: 100 / 100 / 100 / 100 (mobile) on `/`, the Final Act book page and `/series/section-w`.
- Screenshots of the four key pages at 1200px and 390px were checked against the brief: no horizontal scroll, covers at 2:3, buttons at least 44px.
- The repo's first commit had every file flattened into the root by the browser upload. The folder structure was restored from the original zip; contents were unchanged.

### Decisions made while finishing

- Upgraded to Astro 7 (current) rather than staying on Astro 5. Only small code changes were needed.
- TypeScript is pinned to 6.x because `@astrojs/check` doesn't support 7 yet.
- Astro 7's HTML compression drops a line break between text and an inline element. Write `{" "}` where a sentence breaks onto a new line before a link.
- `npm audit` (Sep 2026) flags:
  - a moderate `fflate` issue via Satori, which only runs at build time on our own font files;
  - dev-only issues in `@lhci/cli`.
  None of them reach visitors. Recheck when Satori or LHCI release updates.

## Next steps

1. Merge the `finish-and-test` pull request.
2. Deploy to Cloudflare Pages following `docs/DEPLOY.md`. Check the `*.pages.dev` URL before any DNS change.
3. Work through `docs/CONTENT-TODO.md` with Syd, covers and the portrait first.
4. Before launch, test with VoiceOver on an iPhone. The brief's checklist asks for this and it can't be automated.
