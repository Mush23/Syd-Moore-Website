# Putting sydmoore.com live (Hostinger)

The site has been live at <https://sydmoore.com> on Hostinger since 17 November 2026. Hostinger is also where the domain's settings and Syd's email are, so nothing about the domain or email changed.

All six stages below were done on 17 November 2026 and are kept as a record. sydmoore.co.uk uses the nameservers Hostinger gave for it (`solar.dns-parking.com` and `lunar.dns-parking.com`). The only optional job left is deleting the unused WordPress database (see "Afterwards").

## How publishing works

1. Someone changes the site: a save in Pages CMS, or a code change merged into `main` on GitHub.
2. GitHub builds the site (`.github/workflows/publish-hostinger.yml`) and saves the finished files on a branch called `live`.
3. Hostinger notices the change to `live` and copies the files onto the server. This is Hostinger's own GitHub connection (hPanel → Advanced → Git). No password or key is stored anywhere.

The same build runs every morning at about 05:10 UTC, so "Pre-order" becomes "Out now" on publication day. If nothing changed, nothing is published.

A spare preview copy also publishes to <https://mush23.github.io/Syd-Moore-Website/> (`.github/workflows/deploy.yml`). Search engines are told to ignore it.

## What the server does

`integrations/hostinger.mjs` writes a `.htaccess` file into every build. It makes the server:

- send `www.sydmoore.com`, `sydmoore.co.uk` and `www.sydmoore.co.uk` to `https://sydmoore.com`;
- always use HTTPS;
- permanently redirect every old address listed in `public/_redirects` (add new ones there);
- serve tidy addresses (`/about`, not `/about.html` or `/about/`) and the site's own 404 page;
- send security headers, and refuse every `.php` address and the old WordPress folders, so nothing left over from WordPress can run;
- tell search engines to keep out of any copy on another host name, such as `new.sydmoore.com`.

Never edit `.htaccess` on the server, and don't use hPanel features that rewrite it (Force HTTPS, Redirects, Hotlink protection): every publish replaces the file.

## Checking a copy of the site

```bash
npm run check:host https://new.sydmoore.com   # the test copy
npm run check:host https://sydmoore.com       # the live site
```

Add `-- --ip=77.37.37.196` (the server's address, the same number as the domain's A record) to ask the server directly. Use it when a copy has no address record or certificate yet.

This checks pages, tidy addresses, every old-address redirect, the 404 page, security headers, caching and the search-engine rules. It changes nothing.

---

## Going live, step by step

Do the stages in order. Stages 1 to 3 don't affect the current website at all.

### Stage 1: back up the WordPress site

1. Log in at <https://hpanel.hostinger.com>.
2. Click **Websites**, then **Manage site** (or **Dashboard**) next to sydmoore.com.
3. In the left menu, click **Backups** (it may be under **Files**).
4. Under **Files backups**, pick the newest date and click **Download**. Save the `.tar.gz` file somewhere safe.
5. Under **Database backups**, pick the database and newest date, and click **Download**. Save the `.sql.gz` file with it.

Hostinger also keeps its own backups, so the old site can be restored from this same page.

### Stage 2: create a test address

1. Still in the sydmoore.com dashboard, click **Domains**, then **Subdomains** in the left menu.
2. In the subdomain box, type `new` so it reads `new.sydmoore.com`.
3. Leave **Custom folder for subdomain** unticked.
4. Click **Create**.

This creates an empty folder, `public_html/new`, for the test copy.

If `new.sydmoore.com` still can't be found after 15 minutes, the address record wasn't added. Add it by hand: hPanel → **Domains** → sydmoore.com → **DNS / Nameservers** → **DNS records**. Add one record with **Type** `A`, **Name** `new`, **Points to** the same number as the existing `@` A record, and save. Don't change or delete any other record: the MX ones run Syd's email.

### Stage 3: connect Hostinger to GitHub

1. In the left menu, click **Advanced**, then **Git**.
2. Click **Connect with GitHub**.
3. A GitHub window opens. Sign in if asked, choose **Only select repositories**, pick **Syd-Moore-Website**, and click **Install & Authorize**.
4. Back in Hostinger, select **Syd-Moore-Website** and click **Next**.
5. Set:
   - **Branch:** `live` (not `main`)
   - **Root directory:** click **Change** and choose `public_html/new`
6. Click **Deploy**.

After a minute, <https://new.sydmoore.com> shows the new site. If the address shows a security warning at first, wait 15 minutes for Hostinger to issue its certificate (hPanel → **Security** → **SSL** shows the status).

### Stage 4: check the test copy

Run `npm run check:host https://new.sydmoore.com` and look through the site by hand. Fix anything that fails before going further.

On 17 November 2026 the test copy passed every check when the server was asked directly (`--ip`), and a real browser loaded all 30 pages from it. The public address `new.sydmoore.com` never appeared, because no address record reached Hostinger's name servers. That doesn't block going live: the real address already has its record and certificate.

### Stage 5: switch the real address over

This is the moment the old WordPress site is replaced. Choose a quiet time. Nothing is deleted first, so there is no gap with a broken site.

1. hPanel → **Advanced** → **Git**. Open the **⋮** menu and click **Disconnect from repository** (not "Disconnect GitHub").
2. Connect **Syd-Moore-Website** again, with:
   - **Branch:** `live`
   - **Root directory:** `public_html`
3. Click **Deploy**. If Hostinger says the folder must be empty, stop and follow "If the folder must be empty" below.
4. Run `npm run check:host https://sydmoore.com`. It checks that the new site is being served and that every old WordPress address is refused.
5. In Google Search Console and Bing Webmaster Tools, submit `https://sydmoore.com/sitemap-index.xml`.

To undo: hPanel → **Backups** → restore the files and database from before the switch.

**Tidy up afterwards.** The WordPress files are still in `public_html`. They can't run any more (the server refuses them), but remove them within a few days:

1. hPanel → **Files** → **File Manager** → `public_html`.
2. Delete the folders `wp-admin`, `wp-content` and `wp-includes`, every file whose name starts with `wp-`, plus `index.php`, `xmlrpc.php`, `license.txt` and `readme.html`.
3. Delete the `new` folder, then delete the `new` subdomain under **Domains** → **Subdomains**.
4. Don't delete `.htaccess`, `index.html`, `_astro`, `books`, `og` or anything else the new site put there. If unsure, leave it and ask.
5. Run the check again.

**If the folder must be empty.** In File Manager, open `public_html`, select everything and delete it (the stage 1 backup has a copy), then go back to step 2. The site shows an error for the minute or two in between.

### Stage 6: sydmoore.co.uk

The .co.uk is registered at OnlyDomains and needs pointing at Hostinger. The server then forwards it to `https://sydmoore.com` (with and without `www`, with and without `https`).

1. In hPanel, open the sydmoore.com dashboard and click **Domains** → **Parked Domains**.
2. Type `sydmoore.co.uk` and click **Park**. Note the two nameservers it shows (they should be `ns1.dns-parking.com` and `ns2.dns-parking.com`).
3. Log in at <https://www.onlydomains.com>. Click **Domains** → **My Domains** → **sydmoore.co.uk**.
4. Find **Nameservers** (or **DNS Settings**), choose custom nameservers, enter the two from step 2, and save.
5. Wait up to 24 hours. Then run `npm run check:host https://sydmoore.com`, which also tests all four .co.uk addresses.

Do **not** change the nameservers of sydmoore.com itself. They already point at Hostinger.

### Afterwards

- The WordPress database is no longer used. It can be deleted from hPanel → **Databases** once everyone is happy with the new site.
- Email is untouched by all of the above. It runs on the domain's mail settings, which never change.

---

## Settings (repository variables)

These are public values baked into the pages at build time. Add them in GitHub → the repository → **Settings → Secrets and variables → Actions → Variables tab → New repository variable**. The site republishes on the next push or the next morning; to republish straight away, open **Actions → Publish to Hostinger → Run workflow**.

| Name | What it is |
| --- | --- |
| `PUBLIC_KIT_FORM_ACTION` | Kit form action URL (see Newsletter) |
| `PUBLIC_CF_ANALYTICS_TOKEN` | Web Analytics token (see Visitor statistics) |
| `PUBLIC_AMAZON_TAG` | Amazon Associates UK store ID, e.g. `sydmoore-21` |

Until a value is set, that feature stays hidden. For example, the newsletter page says sign-up opens soon.

## Newsletter (Kit, free plan)

1. Create a Kit account in Syd's name and create a form (**Grow → Landing pages & forms → Create → Form → Inline**).
2. In the form settings, set **After subscribing → Redirect to an external page** = `https://sydmoore.com/newsletter/thanks`.
3. Open **Publish → HTML** and copy the form's `action="…"` URL into `PUBLIC_KIT_FORM_ACTION`.
4. If that URL isn't on `app.kit.com` or `app.convertkit.com`, add its domain to `form-action` in the Content-Security-Policy `<meta>` tag in `src/layouts/BaseLayout.astro`.
5. The free plan doesn't send automated welcome sequences; send the welcome email by hand or upgrade later.

## Visitor statistics (optional, cookieless)

Cloudflare Web Analytics works on any host and sets no cookies, so the site needs no cookie banner.

1. Create a free Cloudflare account, then go to **Analytics & Logs → Web Analytics → Add a site** and enter `sydmoore.com`.
2. Copy the token from the snippet it shows into `PUBLIC_CF_ANALYTICS_TOKEN`.

## Pages CMS (for Syd)

1. Go to <https://app.pagescms.org>, sign in with GitHub, and install the Pages CMS GitHub app on this repository.
2. Open the repository in Pages CMS. The forms come from `.pages.yml`.
3. Invite Syd by email from **Settings → Collaborators**. She doesn't need a GitHub account.
4. Every save is a commit to `main`, and the live site updates in a few minutes.

## Contact form

The site has no contact form: the Contact page gives the agent's details. Hostinger can run one (a small PHP script), so it can be added later if Syd wants it. `functions/api/contact.ts` is an unused Cloudflare version kept for reference.
