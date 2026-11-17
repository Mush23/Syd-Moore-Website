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
- [x] X (@SydMoore1), Instagram (@sydmoorewriter) and Facebook links supplied by the site owner on 17 November 2026 and added to `site.social`. Syd should still confirm Bluesky is active.
- [ ] Which other Essex bookshops stock Syd's books (for the "Find Syd's books in Essex" block on /books)
- [ ] Tagline choice from the brief, and confirm the newsletter name *Strange Tidings*

## Books

- [ ] **launch** High-resolution covers for all 14 published titles plus *The Final Act of Daphne Devine* (upload in Pages CMS → Books → Cover)
- [ ] **launch** Check every description against the publisher-approved blurb (drafts are in each book file)
- [ ] **launch** Confirm the praise quotes can be used on the site (Oneworld and HarperCollins publicity). On 17 November 2026, 20 more quotes were added across ten books.
  - Each was checked word for word against the page it came from, and that page's link is saved with the quote (the "Where it was published" field in Pages CMS).
  - Nearly all come from Oneworld's own book pages. *The Witching Hour* quotes come from the publisher's description on Apple Books.
  - One is not from a publisher: the Blue Book Balloon blog review of *The Final Act of Daphne Devine*. Remove it in Pages CMS if Syd would rather not use it.
  - Long quotes were shortened with "…". Syd or the publisher may prefer the full versions.
- [ ] *The Final Act of Daphne Devine*: add press reviews of its own as they arrive. The publisher's page still lists only praise for *The Grand Illusion*, which the site shows labelled as such.
- [ ] The Sarah Perry quote was moved from *Strange Tricks* to *Strange Magic*. Oneworld's page shows she wrote it about *Strange Magic* ("Strange Magic is that rarest of things…"). The brief had it under *Strange Tricks*.
- [ ] *Witch Hunt*: HarperCollins's page is said to carry Guardian and other quotes, but it couldn't be opened to check the wording, so none were added.
- [ ] *The Grand Illusion*: Simon & Schuster's page is said to list more author endorsements (Barbara Nadel, Sophia Bennett, Emma Haughton and others). It couldn't be opened to check, so only the two that Oneworld also prints were added.
- [ ] *Strange Tricks*: a Peterborough Telegraph quote calls it the "sixth case", while the site numbers it Book 5. It was left out until the series numbering is settled.
- [ ] "The history behind the book" note for each novel, 100–200 words (start with Section W)
- [ ] Extracts (PDF) if the publishers allow them
- [ ] Verify the ebook ISBNs (taken from Simon & Schuster listings) and the audiobook ISBN for *The Great Deception*
- [ ] *Strange Maven*: confirm the date and a description. The sources disagree:
  - Waterstones says 6 January 2028 and Fantastic Fiction says 2027;
  - Oneworld's own page (seen 17 November 2026) shows "January 14, 2027" beside US prices, and a caption on the same page says "Out on 20th May 2027".
  The site still says "Coming soon" with no date until Syd confirms.
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

## Ideas from the review of other author websites (25 Sep 2026)

We looked at 14 comparable author sites (Ruth Ware, Val McDermid, Elly Griffiths, Ann Cleeves and others). These would add the most, roughly in order, and each needs something from Syd or her publishers:

- [ ] **A reason to join the newsletter:** a free short story or a Section W "classified file" for new subscribers. Only one of the 14 sites offers a freebie, and it's the strongest of them.
- [ ] **"Read an extract"** (first-chapter PDF) for each book. The publishers often supply these. The site already shows the button when `extract` is filled in.
- [ ] **Audiobook samples:** links or short clips from the audio publisher.
- [ ] **More praise per book** (3–6 quotes each) and any award or bestseller badges.
- [ ] **Extras hub:** real Essex places behind the books (a map), "the true history" notes, deleted scenes. This builds on the Essex Girls & Witches page and the "history behind the book" notes.
- [ ] **Press kit downloads:** credited high-resolution photos, cover files, the publicist's contact, and past interviews.
- [ ] **Reading-group guides** (PDF) for book clubs and libraries.
- [ ] **Signed or dedicated copies** through Read on Sea.
- [ ] **A scam warning** if Syd wants one (e.g. "Syd will never ask readers for money"). It has to be her own words.

## Old site

- [ ] Crawl the old sydmoore.com (e.g. Screaming Frog, free up to 500 URLs) and add any missing URLs to `public/_redirects`
- [ ] The old post "Noirwich: The Witching Hour" couldn't be retrieved; it currently redirects to /news. Recreate it in News if it's worth keeping.
