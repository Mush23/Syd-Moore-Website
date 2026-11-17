# Putting sydmoore.com live (Hostinger)

The live site is hosted on Hostinger, where the domain's settings and Syd's email already are. Nothing about the domain or email needs to change.

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
- send security headers;
- hide any copy on another host name, such as `new.sydmoore.com`, from search engines.

Never edit `.htaccess` on the server, and don't use hPanel features that rewrite it (Force HTTPS, Redirects, Hotlink protection): every publish replaces the file.

## Checking a copy of the site

```bash
npm run check:host https://new.sydmoore.com   # the test copy
npm run check:host https://sydmoore.com       # the live site
```

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

### Stage 5: switch the real address over

This is the moment the old WordPress site is replaced. Choose a quiet time.

1. hPanel → **Advanced** → **Git**. Open the **⋮** menu and click **Disconnect from repository** (not "Disconnect GitHub").
2. Left menu → **Files** → **File Manager**. Open `public_html`.
3. Select everything **except** the `new` folder and delete it. This removes WordPress (the backup from stage 1 has a copy). Old WordPress files left on a server are a security risk, so don't skip this.
4. Back in **Advanced** → **Git**, connect **Syd-Moore-Website** again, with:
   - **Branch:** `live`
   - **Root directory:** `public_html`
5. Click **Deploy**.
6. Run `npm run check:host https://sydmoore.com`.
7. In Google Search Console and Bing Webmaster Tools, submit `https://sydmoore.com/sitemap-index.xml`.

To undo: hPanel → **Backups** → restore the files and database from before the switch.

### Stage 6: sydmoore.co.uk

The .co.uk is registered at OnlyDomains and needs pointing at Hostinger. The server then forwards it to `https://sydmoore.com` (with and without `www`, with and without `https`).

1. In hPanel, open the sydmoore.com dashboard and click **Domains** → **Parked Domains**.
2. Type `sydmoore.co.uk` and click **Park**. Note the two nameservers it shows (they should be `ns1.dns-parking.com` and `ns2.dns-parking.com`).
3. Log in at <https://www.onlydomains.com>. Click **Domains** → **My Domains** → **sydmoore.co.uk**.
4. Find **Nameservers** (or **DNS Settings**), choose custom nameservers, enter the two from step 2, and save.
5. Wait up to 24 hours. Then run `npm run check:host https://sydmoore.com`, which also tests all four .co.uk addresses.

Do **not** change the nameservers of sydmoore.com itself. They already point at Hostinger.

### Afterwards

- Delete the test copy: hPanel → **Domains** → **Subdomains** → delete `new`, then delete the `public_html/new` folder in File Manager.
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
