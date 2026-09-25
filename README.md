# sydmoore.com

The official website of novelist Syd Moore: static Astro site, edited with Pages CMS, hosted free on GitHub Pages.

- **Brief and source of truth for content:** [`docs/brief.md`](docs/brief.md)
- **Going live:** [`docs/DEPLOY.md`](docs/DEPLOY.md)
- **What Syd still needs to supply:** [`docs/CONTENT-TODO.md`](docs/CONTENT-TODO.md)
- **Notes for developers and Claude:** [`CLAUDE.md`](CLAUDE.md)

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run verify     # type check, build, and all tests
```

---

## Guide for Syd: updating the website

You make every change in **Pages CMS** at <https://app.pagescms.org>. Sign in with the email invitation you received. When you press **Save**, the website updates itself within about a minute.

### Add a new book

1. Open **Books** and click **Add an entry**.
2. Fill in the **Title**, **Series** and **Reading-order position**. For a new novel, also fill in **Book number in the series**.
3. Set **UK publication date**. Leave **Status** on *Automatic*: the book shows "Pre-order" until that date and "Out now" after it. If the date isn't confirmed yet, choose *Coming soon*.
4. Write the **Hook line** (one sentence) and the **Description**.
5. Add the ISBNs, formats and publisher.
6. Upload the **Cover image**.
7. Under **Where to buy**, paste the link for each shop you want a button for. Leave any shop empty to hide it. Amazon fills itself in from the ISBN.
8. Tick **Draft** if you're not ready for it to appear, then **Save**.

### Add an event

1. Open **Events**, then **Add an entry**.
2. Fill in the title, start time (UK time), venue, town and type, plus the price and tickets link if there are any.
3. **Save**. The event appears under "Coming up" and on the home page, and moves itself to "Past events" afterwards.

### Post news

1. Open **News**, then **Add an entry**.
2. Write a headline, choose the date, and add a one- or two-sentence summary and the post itself.
3. **Save**.

### Change the book at the top of the home page

1. Open **Books** and find the book currently featured. Untick **Feature on the home page** and **Save**.
2. Open the new book, tick **Feature on the home page**, and **Save**.

Only one book should be ticked at a time.

### Edit About, Press, Privacy and other pages

Open **Pages**, choose the page, edit the text and **Save**.

If something looks wrong after saving, don't worry: every change is kept, so any version can be restored.
