# Content to supply or confirm

Last reviewed 25 September 2026. Everything below is either missing or unconfirmed. The site builds and works without these, and empty sections stay hidden. Items marked **launch** matter before 8 October 2026.

## Whole site

- [ ] **launch** Author portrait: save as `src/assets/photos/syd-moore-portrait.jpg` (2–3 options, with photographer credit and a written licence)
- [ ] **launch** Kit newsletter form: create the form, paste its action URL into `PUBLIC_KIT_FORM_ACTION`, and set Kit's "after subscribing" redirect to `https://sydmoore.com/newsletter/thanks`
- [ ] **launch** Read on Sea: agree to be the lead "Buy local" button, and send their Bookshop.org product links (or confirm the shop link format) for each title; say whether they'll handle signed copies
- [ ] **launch** Syd to approve the privacy notice. It now names GitHub as the host, and there's no contact form: visitors email her or her agent instead.
- [ ] Decide whether a contact form is wanted. GitHub Pages can't run one itself, but a hosted form service can be added.
- [ ] Amazon Associates UK store ID → `PUBLIC_AMAZON_TAG`
- [ ] Bookshop.org, Waterstones (Awin) and Hive (Webgains) affiliate links for each book
- [ ] Confirm X (@SydMoore1) and Instagram (@sydmoorewriter) are active, then add them to `site.social` in `src/config/site.ts`
- [ ] Which other Essex bookshops stock Syd's books (for the "Find Syd's books in Essex" block on /books)
- [ ] Tagline choice from the brief, and confirm the newsletter name *Strange Tidings*

## Books

- [ ] **launch** High-resolution covers for all 14 published titles plus *The Final Act of Daphne Devine* (upload in Pages CMS → Books → Cover)
- [ ] **launch** Check every description against the publisher-approved blurb (drafts are in each book file)
- [ ] **launch** Confirm the praise quotes can be used on the site (Oneworld and HarperCollins publicity)
- [ ] *The Final Act of Daphne Devine*: a review quote of its own once reviews arrive. It currently shows Erin Kelly's quote about *The Grand Illusion*, labelled as such, as the brief suggests.
- [ ] "The history behind the book" note for each novel, 100–200 words (start with Section W)
- [ ] Extracts (PDF) if the publishers allow them
- [ ] Verify the ebook ISBNs (taken from Simon & Schuster listings) and the audiobook ISBN for *The Great Deception*
- [ ] *Strange Maven*: confirm the date (Waterstones says 6 January 2028; Fantastic Fiction says 2027) and a description
- [ ] Series numbering for the Christmas collections and *The Strange Casebook* (retailers number them differently)
- [ ] *If on a Winter's Night a Traveller Passes By* (2013 Kindle story): keep or drop? It is saved as a draft; add a description and link, then untick Draft to publish
- [ ] Kindle, Apple Books, Kobo, Google Play, Hive and Libro.fm links where available
- [ ] Waterstones link for *The Strange Casebook* (ebook) if one exists

## About and press

- [ ] **launch** Syd to rewrite the first-person About text in her own voice (`src/content/pages/about.md`)
- [ ] Approve the short and medium bios
- [ ] Exact years she presented *Pulp* (Wikipedia says 1997–2001)
- [ ] Whether *Witch West* is still in development
- [ ] EGLF co-founders to credit (Wikipedia names Elsa James, Jo Farrugia and Sarah Mayhew)
- [ ] Her role in the documentary *Witchcraft & Stilettos* (then add it to the Essex Girls & Witches page)
- [ ] Whether she still works with Metal
- [ ] Oneworld publicist's name and email (Pages CMS → Pages → Press and media)
- [ ] Talk topics, rough fee range and travel area

## Events

- [ ] **launch** *Final Act* launch: venue (ideally Read on Sea), date and time. A draft event is ready in Events.
- [ ] All confirmed events from October 2026 onward

## Old site

- [ ] Crawl the old sydmoore.com (e.g. Screaming Frog, free up to 500 URLs) and add any missing URLs to `public/_redirects`
- [ ] The old post "Noirwich: The Witching Hour" couldn't be retrieved; it currently redirects to /news. Recreate it in News if it's worth keeping.
