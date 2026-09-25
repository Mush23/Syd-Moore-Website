<role>
You are a senior front-end engineer and accessibility specialist. You build fast, static, content-driven websites with Astro and ship them on Cloudflare Pages. You write clean, well-commented TypeScript and CSS, and you sweat the UX details.
</role>

<project>
Build, from an empty folder, the official author website for Syd Moore (sydmoore.com), a British novelist from Essex. She writes witty, spooky mysteries rooted in real history: the Section W wartime occult thrillers, the Essex Witch Museum Mysteries, and standalone ghost stories.

The site has four jobs:
1. Sell her books, with local-bookshop-first buy links.
2. Grow her newsletter.
3. Serve festival bookers, librarians and press.
4. Tell her story: Essex, the witch trials, her activism.

The full discovery brief is in docs/brief.md. It is the single source of truth for copy, book data, page structure, design tokens, redirects and structured data. Read all of it before planning.

The brief was written for a Framer build. Ignore its Framer-specific instructions (Framer CMS, on-page editing, Mailchimp, Framer JSON-LD placeholders). Where this prompt and the brief disagree, this prompt wins on technology and the brief wins on content.
</project>

<constraints>
- Running costs as close to £0 as possible: free hosting, free CMS, free analytics. The only fixed cost is the domain.
- Syd is not technical. She must be able to add a book, an event or a news post through a web form, without touching code or layout.
- UK audience: en-GB spelling, £ prices, dates written as "8 October 2026".
- Launch-critical: the Home, Book template and Section W pages must be production-ready first. The Final Act of Daphne Devine publishes on 8 October 2026.
</constraints>

<stack>
Use exactly this stack. If you hit a hard blocker, stop and tell me.

**Core build**
- Astro (latest stable) with static output and strict TypeScript.
- Content collections with Zod schemas in src/content: books, series, events, news. One Markdown or YAML file per entry.
- Plain CSS with custom properties for the design tokens. No Tailwind and no UI framework.
- Zero client-side JavaScript except three small vanilla-TypeScript islands: the buy-panel format tabs, the mobile buy sheet and the mobile menu.
- Self-host the fonts with Fontsource (Fraunces, Inter, IBM Plex Mono), subset to Latin, with font-display: swap. No requests to Google Fonts (UK GDPR).
- Images through astro:assets: AVIF/WebP, a responsive srcset, and explicit width and height.

**Editing**
- Pages CMS (pagescms.org), configured by a .pages.yml at the repo root.
- The .pages.yml mirrors the Zod schemas field for field.
- Labels and help text are written for a non-technical author.

**Hosting and forms**
- Cloudflare Pages. Build command `npm run build`, output folder `dist`.
- Redirects in public/_redirects and security headers in public/_headers.
- Newsletter: Kit (free plan) through a plain HTML form that posts to Kit's form endpoint, progressively enhanced. The form ID comes from the site config.
- Contact form: a Cloudflare Pages Function that validates the input, checks a Cloudflare Turnstile token and a honeypot field, and emails Syd through Cloudflare's send_email binding to a verified address. If that isn't possible on Pages, fall back to publishing the agent and publicist contacts with mailto links, and tell me.

**Analytics, feeds and scheduling**
- Cloudflare Web Analytics, which is cookieless. Its token comes from config. The site sets no cookies, so it needs no cookie banner.
- @astrojs/sitemap, and @astrojs/rss for the news feed.
- A scheduled rebuild: a GitHub Actions workflow that calls a Cloudflare Pages deploy hook every day at 06:00 UK time. This flips "Pre-order" to "Out now" on publication day and moves past events into the archive, with no one touching the site.
</stack>

<content_rules>
**Seeding**
- Create all 15 books from the brief's Bibliography table and its "Book page copy" section.
- Create all 3 series, plus the events and pages the brief lists.
- Use the brief's copy word for word.

**Never invent anything**
- No quotes, reviews, dates, ISBNs, prices, awards, retailer URLs or biographical facts beyond what the brief contains.
- Leave unknown fields empty.
- List every empty or uncertain field in docs/CONTENT-TODO.md, grouped by page, so Syd knows exactly what to supply. Include the brief's "To confirm" items.

**Book status**
- Each book has a status field with two values, `auto` or `coming-soon`.
- With `auto`: a publication date in the future shows "Pre-order", and a date today or earlier shows "Out now". Work this out at build time.
- `coming-soon` shows "Coming soon" and hides the buy buttons.

**Missing and draft content**
- When a cover image is missing, render an accessible typographic placeholder cover in the series accent colour, showing the title, series and author. That way every page builds before the real covers arrive.
- Hide any page section whose content is empty, such as the history note, extract or quotes. Never show placeholder text publicly.
- Exclude entries marked `draft: true` from the build.
</content_rules>

<pages>
Build every page in the brief's sitemap at the URLs it gives:

- `/` (Home)
- `/books` and `/books/[slug]`
- `/series/[slug]`
- `/about`
- `/essex-girls-and-witches`
- `/events`
- `/news` and `/news/[slug]`
- `/press`
- `/contact`
- `/newsletter`
- `/privacy`
- `/accessibility`
- a 404 page

Follow the brief's section-by-section layout for the Home page and the Book template exactly.
</pages>

<components>
**BuyPanel**
- **Format tabs.** Paperback, Ebook and Audiobook, using the WAI-ARIA tabs pattern with arrow-key support. Hide any tab that has no links.
- **Disclosure.** Put this line above the buttons, word for word: "Ad · Some of these links pay Syd a small commission. Buying local helps Essex bookshops most."
- **Retailer order.**
  - Paperback: Read on Sea (Leigh-on-Sea) first and visually primary, then Bookshop.org, Waterstones, Hive, Blackwell's and Amazon UK.
  - Ebook: Kindle, Apple Books, Kobo and Google Play.
  - Audiobook: Audible and Libro.fm.
- **Empty links.** Don't render a retailer whose URL is empty.
- **Link markup.** Each link is `<a rel="sponsored noopener">` with an aria-label such as "Buy The Grand Illusion from Waterstones (opens retailer site)".
- **Button wording.** The verb follows the status: "Buy from" or "Pre-order from". "Coming soon" shows a newsletter prompt instead of buttons.
- **Phones (below 810px).**
  - The panel collapses to a sticky "Buy [title]" bar.
  - The bar opens a bottom sheet built on the native `<dialog>` element. Focus is trapped inside it, Esc closes it, and focus returns to the bar.
  - The bar never covers the element that has keyboard focus.

**Affiliate links**
- Keep the affiliate IDs (Bookshop.org, Amazon tag, Awin) in src/config/site.ts.
- Only build a retailer URL from an ISBN if you have confirmed that retailer's URL pattern in its official documentation. Otherwise use the explicit URL field alone.

**Other components**
- Header with navigation
- Footer, including the Amazon Associates statement
- BookCard
- SeriesReadingOrder
- QuoteBlock
- EventRow, with an .ics "Add to calendar" link
- NewsletterBand
- StatusTag
- PlaceholderCover
</components>

<design>
Apply the brief's "Design system and accessibility" section exactly:

- colour tokens and type
- breakpoints of 1200, 810 and 390 px, with a 16px side gutter on phones
- covers at 2:3, never cropped
- the component behaviour it describes

The direction is "archive noir": aged paper, ink-dark bands and one accent colour per series. Keep it editorial with generous white space. No stock photos, no parallax and no autoplaying carousels. Keep motion to 200ms or less, and switch it off under prefers-reduced-motion.
</design>

<seo>
**Page metadata**
- Page titles, meta descriptions and canonical URLs follow the brief's patterns, and each page's are unique.
- Open Graph and Twitter cards on every page.
- Generate a 1200×630 social image for each book at build time: the cover on the night background with the title. Use a default site image as the fallback.

**Structured data (JSON-LD)**
- Person on / and /about.
- Book on each book page, with workExample editions, isPartOf BookSeries and position.
- Event on the events page.
- Generate it all from content, and validate the output against the schema.org types in a test.

**Redirects and site files**
- public/_redirects contains every mapping in the brief's redirect table as a 301, plus sensible trailing-slash handling.
- Generate sitemap.xml, robots.txt and the news RSS feed.
</seo>

<quality_gates>
All of these must pass before every commit:

- `npm run build` completes with no content-schema warnings.
- `astro check` passes.
- Playwright tests pass:
  - every route renders
  - every book page shows the title and series position
  - where retailer links exist, the disclosure sits above the buy buttons, and empty retailers aren't rendered
  - the tabs work from the keyboard
  - the mobile sheet opens, traps focus and closes with Esc
  - the 404 page works
- axe-core (through @axe-core/playwright) reports zero WCAG 2.2 A/AA violations on every route.
- There are no broken internal links or missing images.
- Lighthouse CI (mobile) meets these budgets on /, /books/the-final-act-of-daphne-devine and /series/section-w:

| Lighthouse category | Minimum score |
|---|---|
| Performance | 95 |
| Accessibility | 100 |
| Best Practices | 95 |
| SEO | 100 |

Run the same checks in a GitHub Actions CI workflow.
</quality_gates>

<way_of_working>
1. **Plan first.** Start in plan mode and read docs/brief.md in full. Then give me the file tree, the content schemas, an outline of .pages.yml, your assumptions, and the build order below. Wait for my go-ahead before writing any code.

2. **Build in this order.** Commit after each step with a clear message.
   - a. Scaffold, tokens, fonts, base layout, header and footer
   - b. Content schemas, .pages.yml, and the seeded content (all 15 books)
   - c. The launch-critical pages: Book template with BuyPanel, the Section W series page, and Home
   - d. About, Newsletter, Contact (with the Pages Function), Privacy, Accessibility and 404
   - e. The remaining series pages, the Books index with its filter, Events, News, Press, and Essex Girls & Witches
   - f. SEO: JSON-LD, social images, sitemap, redirects and headers
   - g. Tests, CI, Lighthouse and the scheduled rebuild
   - h. Documentation

3. **Keep CLAUDE.md current.** Put a CLAUDE.md at the repo root covering stack decisions, conventions, commands, current status and next steps. Update it at the end of every step. I pick up the work on a second machine from git plus CLAUDE.md.

4. **Only ask when the decision is mine.** That means accounts, money and legal wording. For anything else, pick the sensible default, record it in CLAUDE.md, and carry on.

5. **Leave production to me.** Don't create accounts, deploy to production or touch DNS. Prepare everything so I can do those steps by following docs/DEPLOY.md.
</way_of_working>

<deliverables>
**The repository**
- The complete Astro repo, passing every quality gate.

**README.md**
- How to run the site locally.
- A one-page guide for Syd with numbered Pages CMS steps for each of these tasks:
  - Add a new book
  - Add an event
  - Post news
  - Change the featured book

**docs/DEPLOY.md**, covering:
- setting up the GitHub repo
- connecting Cloudflare Pages
- environment variables
- the Kit form ID
- Turnstile keys
- Email Routing and the send_email binding
- the Web Analytics token
- the deploy hook for the scheduled rebuild
- the DNS cut-over for sydmoore.com, with a rollback plan
- registering sydmoore.co.uk and sydmoore.uk and forwarding both to sydmoore.com

**docs/CONTENT-TODO.md**
- Everything that is missing or unconfirmed.

**Final summary**
- What's done, what's stubbed, and the result of each quality gate.
</deliverables>
