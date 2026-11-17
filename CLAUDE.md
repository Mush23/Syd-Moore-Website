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
- **Hosting:** GitHub Pages, published by `.github/workflows/deploy.yml` on every push to `main` and daily at 05:00 UTC. The owner chose this over Cloudflare Pages on 25 Sep 2026 to keep everything in GitHub.
  - `integrations/github-pages.mjs` runs after the build:
    - turns `public/_redirects` into forwarding pages (`/old.html` and `/old/index.html`);
    - copies `x.html` to `x/index.html` where a folder `x/` exists, because GitHub Pages prefers the folder;
    - when `SITE_BASE` is set, prefixes root-relative URLs and adds `noindex`.
  - `SITE_BASE` comes from `actions/configure-pages`. It's `/Syd-Moore-Website` on the github.io preview and empty once sydmoore.com is attached. Write internal links as plain root-relative paths (`/books`); the integration handles the prefix.
  - Security headers aren't possible on GitHub Pages. The CSP and referrer policy are `<meta>` tags in `BaseLayout.astro`, so update the CSP there if you add a third-party script or form.
  - To test the preview build locally from Git Bash: `MSYS_NO_PATHCONV=1 SITE_BASE=/Syd-Moore-Website npm run build`. Without `MSYS_NO_PATHCONV`, Git Bash rewrites the path.
- **Newsletter:** Kit free plan via a plain HTML form (`PUBLIC_KIT_FORM_ACTION`).
- **Contact form:** switched off. GitHub Pages can't run server code, so the contact page shows the agent's details (it does this whenever `PUBLIC_CONTACT_FORM` isn't `true`).
  - `functions/api/contact.ts` (Turnstile + Resend) is kept, unused, in case the site ever moves to Cloudflare. A hosted form service could be added instead, with its domain added to the CSP `form-action`.
- **Analytics:** Cloudflare Web Analytics (it works on any host). It's cookieless, so there's no cookie banner.
- **Build-time settings** (`PUBLIC_KIT_FORM_ACTION`, `PUBLIC_CF_ANALYTICS_TOKEN`, `PUBLIC_AMAZON_TAG`) are GitHub repository variables, passed in by `deploy.yml`.
- **Social images:** `src/pages/og/[slug].png.ts`, built with Satori + Resvg at build time. These use static `@fontsource/*` .woff files because Satori can't read woff2.

## Design (refreshed 25 Sep 2026)

The owner found the first build too plain. From three mockups they chose "A's header, B's quote and series panels, clean background". The colours, fonts and page structure from the brief are unchanged.

- **Candlelit night bands** (`.band-candle` in `global.css`, used with `.band-night`): a glow in the series colour plus a film-grain texture (`--grain` in `tokens.css`). Used on the home hero and the series-page heroes.
- **Home hero:**
  - fanned covers (the featured book plus up to two earlier books in its series, which are decorative);
  - a faint large series initial behind (e.g. "W");
  - copy in a thin gold frame with ✦ ornaments, and an italic hook.
- **Praise:** `QuoteBlock size="large"` is a centred italic pull quote under a big decorative quote mark, placed straight after the hero.
- **Series panels** (`.panel-tint`, colour from `--accent-tint`): on the home page they show every cover in the series, each linking to its book. The Books page groups use them too.
- **Background:** plain paper, with no texture outside the night bands.
- **Site review (25 Sep 2026):** a full-site review plus research into 14 comparable author sites led to these changes:
  - a one-line "what Syd writes" strap at the top of the home hero (it reuses `site.description` wording);
  - book-number captions and "Start here" under the covers in the home series panels;
  - a third home panel for the standalones;
  - a "New to the series? Start with…" line on book pages;
  - `/faq`, built entirely from the content collections, with FAQPage JSON-LD;
  - Contact replaces Press in the header (Press stays in the footer and on Contact).
  Content-dependent ideas from the research are in `docs/CONTENT-TODO.md`.
- **Placeholder covers:** spine shading, grain, an inner frame and a book-like shadow. Title sizes scale with the cover width (container units), so small covers don't break words.

### Modern layer (17 Nov 2026)

The owner still found the site "a bit plain" and asked for a modern, fancy look. Colours and typefaces are unchanged; depth, scale and motion were added. This supersedes the gold frame around the hero copy.

- **Motion is CSS-only** (end of `global.css`) and all of it is inside `prefers-reduced-motion: no-preference`:
  - `.reveal` rises in on scroll (`animation-timeline: view()`; browsers without it just show the content);
  - cross-page view transitions, with covers morphing between a card and its book page. The shared name is `cover-<book id>`, set in `BookCard.astro`, the home series panels and `Book3D` with `morph`. A name must be unique on a page, so don't add it to a second copy of the same cover.
- **`Book3D.astro`:** a CSS 3D book (page block, floor shadow, straightens on hover). Used in the home hero and as the main cover on book pages.
- **Header:** dark glass. `body` is night and `<main>` carries the paper colour, so the header blends with the top of every page.
- **Page headers:** `.page-header` paints a full-width night band with the border-image trick. Keep its `background-color` as well: axe can't see border-image and would fail the contrast check. `.bleed-night` does the same for an element inside `.container` (the book-page title block).
- **Home:** gradient display title, status pill, a figures strip, series showcases with a ghost book count, `PraiseWall.astro`, and a bento grid.
  - The figures are counts from the book files, plus "2× CWA Short Story Dagger shortlists" from the press fact sheet. Update that one by hand if the fact sheet changes.
  - The praise wall reads `quotes` from the book files (one per book first, repeats removed). On phones it is a swipeable row; nothing auto-rotates.
- **Buttons** are pills; `--radius` is 14px; cards use 18–24px.
- **Screenshots:** full-page captures must emulate reduced motion, otherwise `.reveal` blocks below the fold are captured at opacity 0.

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

## Status (17 Nov 2026)

- Live at https://mush23.github.io/Syd-Moore-Website/ (GitHub Pages preview; sydmoore.com not yet moved). `main` has the first design refresh.
- Branch `modern-redesign` (built on `review-improvements`, which was never merged) holds the site-review changes, the modern design layer and the extra review quotes. One pull request covers all three.
- On that branch: `npm run check` is clean, `npm test` passes 66 of 66, and `npm run lhci` scores 100 / 100 / 100 / 100 with CLS 0.
- Review quotes: 20 added on 17 Nov 2026. Each was checked against its source page, and the link is stored in the quote's `url` field (not displayed). See `docs/CONTENT-TODO.md` for what still needs Syd's or the publisher's approval.
- Local tooling notes (Windows, Git Bash):
  - Tests and LHCI reuse whatever is on port 4321, so stop the dev server first or they test unbuilt pages.
  - Don't export `MSYS_NO_PATHCONV` when running LHCI: it stops `CHROME_PATH` being converted.

### Decisions made while finishing

- Upgraded to Astro 7 (current) rather than staying on Astro 5. Only small code changes were needed.
- TypeScript is pinned to 6.x because `@astrojs/check` doesn't support 7 yet.
- Astro 7's HTML compression drops a line break between text and an inline element. Write `{" "}` where a sentence breaks onto a new line before a link.
- `npm audit` (Sep 2026) flags:
  - a moderate `fflate` issue via Satori, which only runs at build time on our own font files;
  - dev-only issues in `@lhci/cli`.
  None of them reach visitors. Recheck when Satori or LHCI release updates.

- Switched hosting to GitHub Pages (same branch). A local crawl of the sub-folder preview build, served the way GitHub Pages serves it, found no broken links, fonts or redirects across 34 pages. Tests and Lighthouse are unchanged (65/65, 100s).

## Next steps

1. Merge the `modern-redesign` pull request and check the live preview.
2. Work through `docs/CONTENT-TODO.md` with Syd: covers and the portrait first, then quote approvals.
3. Set up Kit so newsletter sign-up works (`docs/DEPLOY.md`, step 3).
4. Move sydmoore.com over only once the launch content is ready (`docs/DEPLOY.md`, step 6).
5. Before launch, test with VoiceOver on an iPhone. The brief's checklist asks for this and it can't be automated.
