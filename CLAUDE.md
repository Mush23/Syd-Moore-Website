# CLAUDE.md: sydmoore.com

Author website for novelist Syd Moore. Read `docs/brief.md` for content and design decisions, and `docs/BUILD_PROMPT.md` for the original build spec.

## Stack (decided)

- **Astro 7** (Zod 4 via `astro/zod`), static output, strict TypeScript. Needs Node 22.12+ (`.nvmrc` = 22). `build.format: "file"` and `trailingSlash: "never"` give clean URLs (`/about`) on Cloudflare Pages.
- **Content collections** (`src/content.config.ts`): books, series, events, news, pages. Markdown with YAML frontmatter, one file per entry.
- **Pages CMS** (`.pages.yml`) edits the same files. Keep `.pages.yml` and the Zod schemas in step.
- **Plain CSS** with tokens in `src/styles/tokens.css`. No Tailwind, no UI framework.
- **Client JS is limited to:** buy-panel tabs and mobile sheet (`BuyPanel.astro`), mobile menu (`Header.astro`), and the bio copy button (`CopyBio.astro`).
- **Fonts** self-hosted with Fontsource (Fraunces, Inter, IBM Plex Mono). No Google Fonts requests.
  - The Latin Fraunces and Inter files are preloaded in `BaseLayout.astro`.
  - `tokens.css` defines size-matched fallback faces built from fonts already on the device (Georgia and Arial; Noto Serif and Roboto for Android; Liberation and Times for Linux and ChromeOS), so text doesn't re-wrap when the web fonts load. Keep every platform covered: GitHub's Linux runners showed a layout shift of about 0.13 on some runs when only the Windows and Apple fonts were listed. Recalculate the numbers with `@capsizecss/metrics` if a typeface changes.
- **Hosting:** Hostinger (LiteSpeed), where the domain's DNS and Syd's email already are. Chosen by the owner on 17 Nov 2026 in place of GitHub Pages. Full steps are in `docs/DEPLOY.md`.
  - **Pipeline:** `.github/workflows/publish-hostinger.yml` builds with `DEPLOY_TARGET=hostinger` on every push to `main` and daily, and commits the result to the `live` branch. Hostinger's GitHub connection (hPanel → Advanced → Git) deploys that branch. No credentials are stored in the repository or in GitHub.
  - **`integrations/hostinger.mjs`** writes `.htaccess` into the build:
    - www and the .co.uk domain redirect to `https://sydmoore.com`, and HTTP to HTTPS;
    - true 301s from `public/_redirects` (a trailing `/*` is a catch-all, Hostinger only);
    - tidy URLs (`/about` from `about.html`), the 404 page, security headers and cache headers;
    - every `.php` request and the old WordPress folders are refused, and LiteSpeed's page cache is switched off, so nothing left from the WordPress site can run or be served;
    - a "keep out" `robots.txt` on every host except sydmoore.com (a `RewriteCond` on the host name swaps in `robots-staging.txt`), so a staging copy isn't crawled.
  - **LiteSpeed quirk:** `Header ... env=!NAME` is not honoured on Hostinger; the header is sent every time. A first version used it to send `noindex` on staging only, and the staging test showed it would have gone out on the live host too. Never use negated `env=` on a Header line; use `RewriteCond %{HTTP_HOST}`.
  - **Never edit `.htaccess` on the server** or use hPanel features that rewrite it. Every deploy replaces it.
  - **`npm run check:host <url>`** (`scripts/check-host.mjs`) checks a deployed copy: pages, redirects, headers, caching, robots rules and that WordPress addresses are refused. Add `-- --ip=77.37.37.196` to ask the server directly when a copy has no DNS record or certificate. Run it after any change to the `.htaccess` rules. The rules can't be tested locally, because nothing here runs LiteSpeed.
  - **`live` is a build output branch.** Never edit it by hand, and never merge it anywhere. CI ignores it.
- **Preview copy:** GitHub Pages at `mush23.github.io/Syd-Moore-Website`, published by `.github/workflows/deploy.yml`. This is also what a plain `npm run build` produces, and what the tests run against.
  - `integrations/github-pages.mjs` runs after that build:
    - turns `public/_redirects` into forwarding pages (`/old.html` and `/old/index.html`);
    - copies `x.html` to `x/index.html` where a folder `x/` exists, because GitHub Pages prefers the folder;
    - when `SITE_BASE` is set, prefixes root-relative URLs and adds `noindex`.
  - `SITE_BASE` comes from `actions/configure-pages` (`/Syd-Moore-Website`). Write internal links as plain root-relative paths (`/books`); the integration handles the prefix.
  - To test that build locally from Git Bash: `MSYS_NO_PATHCONV=1 SITE_BASE=/Syd-Moore-Website npm run build`.
- **Security policy:** the CSP and referrer policy are `<meta>` tags in `BaseLayout.astro` (so they also apply on the preview copy). Update the CSP there if you add a third-party script or form. On Hostinger, `.htaccess` adds the headers a meta tag can't set (framing, HSTS, nosniff, permissions).
- **Newsletter:** Kit free plan via a plain HTML form (`PUBLIC_KIT_FORM_ACTION`).
- **Contact form:** switched off. The contact page shows the agent's details (it does this whenever `PUBLIC_CONTACT_FORM` isn't `true`). Hostinger can run PHP, so a form could be added there later.
  - `functions/api/contact.ts` (Turnstile + Resend) is kept, unused, in case the site ever moves to Cloudflare. A hosted form service could be added instead, with its domain added to the CSP `form-action`.
- **Analytics:** Cloudflare Web Analytics (it works on any host). It's cookieless, so there's no cookie banner.
- **Build-time settings** (`PUBLIC_KIT_FORM_ACTION`, `PUBLIC_CF_ANALYTICS_TOKEN`, `PUBLIC_AMAZON_TAG`) are GitHub repository variables, passed in by both publishing workflows.
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

### Icons (17 Nov 2026)

The owner asked for icons to be used wherever possible, through one standard system.

- **One component:** `src/components/Icon.astro`. It wraps Astro Icon (`astro-icon`, registered in `astro.config.mjs`), which writes SVG into the page at build time. There is no icon font and no extra JavaScript.
  - UI icons are Lucide: `<Icon name="calendar" />`.
  - Brand logos are Simple Icons: `<Icon name="simple-icons:instagram" />`.
  - Custom SVGs can go in `src/icons/` (Astro Icon's default folder).
- **Don't add icons any other way** (no pasted SVG, emoji or icon fonts). The ✦ ornament on eyebrows and quote cards is the one exception; an eyebrow that contains an `<Icon>` drops the ✦ automatically.
- **Accessibility:** icons are decorative (`aria-hidden`) because text sits beside them. An icon-only control needs its own accessible name: see `SocialLinks.astro`, which uses `aria-label` and a 44px target.
- **Helper classes** (in `global.css`): `.icon-lead` and `.icon-trail` for spacing in running text, `.icon-accent` for the series or brass colour. Flex containers such as `.btn` and `.eyebrow` space icons with `gap`.
- **Where icon names live:**
  - menu items and social accounts: `site.nav` and `site.social` in `src/config/site.ts`;
  - book-detail labels, quick facts and buy-panel format tabs: small lookup maps in their own files, with `info` as the fallback.
- **Social links:** `SocialLinks.astro` renders `site.social` in the footer, the Contact and About pages and the home "Meet Syd" tile. The same list feeds `sameAs` structured data, so update both when an account changes.
- Icons are always written inline (`is:inline`), not shared through a sprite: several first appear inside elements that start hidden, where a sprite is unreliable.

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
  - Real covers vary in shape (about 1.53 to 1.61 tall), so `Cover.astro` shows an image at its own ratio: never cropped, never padded. The 2:3 box is only for placeholders.
  - In rows and grids, wrap the cover in `.cover-slot` (see `global.css`). It is a fixed-height slot with the cover standing on its bottom edge, so a row shares a baseline like books on a shelf.
  - `coverAlt` is optional alt text for a cover that shows a different title (e.g. *The Witching Hour* currently uses the earlier *Drowning Pool* cover).
- **Photos of Syd:** `src/assets/photos/syd-moore-portrait.jpg` (About page; the file name is what `about.astro` looks for) and `syd-moore-woodland.jpg` (home "Meet Syd" tile). Re-encode any new photo before committing so no camera or location data goes into the public repository (`sharp(file).rotate().jpeg()` drops it).
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

- **Live at https://sydmoore.com on Hostinger since 17 Nov 2026.** It replaced a small WordPress site (one page, two posts). `npm run check:host https://sydmoore.com` passed 112 of 115 that day; the three misses were the .co.uk not yet connected and a redirect-chain check that has since been corrected.
- The switch happened earlier than the owner intended: they followed the "switch" steps straight after a merge. The owner then chose to keep the new site live. Lesson: never put go-live steps in the same message as routine steps. Give them only after the owner says they are ready.
- A spare preview copy still publishes to https://mush23.github.io/Syd-Moore-Website/ (noindex).
- `npm run check` is clean, `npm test` passes (66, with 1 skipped while no book is "coming soon"), and Lighthouse scores 96 to 99 for performance on CI and 100 for accessibility, best practices and SEO.
- Review quotes: 20 added on 17 Nov 2026. Each was checked against its source page, and the link is stored in the quote's `url` field (not displayed). See `docs/CONTENT-TODO.md` for what still needs Syd's or the publisher's approval.
- **The About page is first-person text drafted from the brief, not written or approved by Syd.** It is live. The owner was offered a third-person rewrite and has not yet decided.
- Local tooling notes (Windows, Git Bash):
  - Tests and LHCI reuse whatever is on port 4321, so stop the dev server first or they test unbuilt pages.
  - Don't export `MSYS_NO_PATHCONV` when running LHCI: it stops `CHROME_PATH` being converted.

### Hosting facts

- sydmoore.com: registered at OnlyDomains, nameservers at Hostinger (`ns1/ns2.dns-parking.com`), website and email at Hostinger (MX `mx1/mx2.hostinger.co.uk`). Email must never be disturbed.
- Hostinger's GitHub connection deploys the `live` branch into `public_html`. The deploy lays the build over the folder; it did not remove the staging folder beside it.
- www.sydmoore.com already redirects to the bare domain. Over plain http it takes two hops, because Hostinger forces HTTPS before `.htaccess` runs.
- sydmoore.co.uk: registered at OnlyDomains and still on OnlyDomains' nameservers on 17 Nov 2026. The bare name showed OnlyDomains' parking page, `www` forwarded over http only, and https didn't connect. The fix is to park it on Hostinger and move its nameservers there (`docs/DEPLOY.md`, stage 6); `.htaccess` then redirects all four forms.
- The owner has the Hostinger and OnlyDomains logins. Never ask for them. They carry out the hPanel steps themselves.
- Still to tidy on the server: the staging copy in `public_html/new` (reachable at /new/), the `new` subdomain, any WordPress files left in `public_html`, and the unused WordPress database.
- A DNS record the owner added for `new.sydmoore.com` never reached Hostinger's nameservers (the zone serial didn't change). Unexplained. If DNS edits are needed again, check that first.

### CI

- Runs on every push to any branch except `live` (a pull request shows the result for its branch).
- Lighthouse runs three times per page, and a "Report Lighthouse scores" step repeats the scores as notices on the run page. The full log needs a GitHub sign-in, but notices can be read by anyone, including through the API (`/check-runs/<job id>/annotations`).
- GitHub's runners are slower than a desktop and have no GPU. Speed scores there run a few points below local ones, so leave headroom above the 95 budget.

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

1. Server tidy-up with the owner: delete `public_html/new`, the `new` subdomain and any WordPress leftovers, then re-run `npm run check:host https://sydmoore.com`.
2. Connect sydmoore.co.uk (`docs/DEPLOY.md`, stage 6) and re-run the check: all six .co.uk and www forms should pass.
3. Settle the About page wording with the owner or Syd.
4. Work through `docs/CONTENT-TODO.md` with Syd: higher-resolution covers, photo credits, quote approvals, the privacy notice.
5. Set up Kit so newsletter sign-up works (`docs/DEPLOY.md`, Newsletter).
6. Submit `https://sydmoore.com/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
7. Test with VoiceOver on an iPhone. The brief's checklist asks for this and it can't be automated.
