# Deploying sydmoore.com (GitHub Pages)

Everything here is free except the domain renewal. The site is hosted on GitHub Pages and published by `.github/workflows/deploy.yml`.

## How publishing works

- Every push to `main` (including every save in Pages CMS) builds the site and publishes it within a few minutes.
- The same workflow runs every morning at 05:00 UTC, so "Pre-order" becomes "Out now" on publication day and past events move into the archive.
  - GitHub pauses scheduled runs after 60 days without any commits. If that happens, open **Actions → Deploy to GitHub Pages** and click **Enable workflow**.
- `.github/workflows/ci.yml` runs the checks on every pull request and every push to `main`: type check, build, Playwright tests with axe accessibility checks, and Lighthouse budgets.

## 1. Turn on GitHub Pages (once)

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Go to **Actions → Deploy to GitHub Pages → Run workflow** (or merge anything into `main`).
4. When it finishes, the site is at `https://mush23.github.io/Syd-Moore-Website/`.

While the site lives at that sub-folder address, the build adds the sub-folder to every link and marks every page `noindex`, so this preview never competes with sydmoore.com in search results (see `integrations/github-pages.mjs`).

## 2. Settings (repository variables)

These are public values baked into the pages at build time. Add them in **Settings → Secrets and variables → Actions → Variables tab → New repository variable**, then re-run the deploy workflow.

| Name | What it is |
| --- | --- |
| `PUBLIC_KIT_FORM_ACTION` | Kit form action URL (step 3) |
| `PUBLIC_CF_ANALYTICS_TOKEN` | Web Analytics token (step 4) |
| `PUBLIC_AMAZON_TAG` | Amazon Associates UK store ID, e.g. `sydmoore-21` |

Until a value is set, that feature stays hidden. For example, the newsletter page says sign-up opens soon.

## 3. Newsletter (Kit, free plan)

1. Create a Kit account in Syd's name and create a form (**Grow → Landing pages & forms → Create → Form → Inline**).
2. In the form settings, set **After subscribing → Redirect to an external page** = `https://sydmoore.com/newsletter/thanks`.
3. Open **Publish → HTML** and copy the form's `action="…"` URL into `PUBLIC_KIT_FORM_ACTION`.
4. If that URL isn't on `app.kit.com` or `app.convertkit.com`, add its domain to `form-action` in the Content-Security-Policy `<meta>` tag in `src/layouts/BaseLayout.astro`.
5. The free plan doesn't send automated welcome sequences; send the welcome email by hand or upgrade later.

## 4. Visitor statistics (optional, cookieless)

Cloudflare Web Analytics works on any host and sets no cookies, so the site needs no cookie banner.

1. Create a free Cloudflare account, then go to **Analytics & Logs → Web Analytics → Add a site** and enter `sydmoore.com`.
2. Copy the token from the snippet it shows into `PUBLIC_CF_ANALYTICS_TOKEN`, then re-run the deploy workflow.

## 5. Pages CMS (for Syd)

1. Go to <https://app.pagescms.org>, sign in with GitHub, and install the Pages CMS GitHub app on this repository.
2. Open the repository in Pages CMS. The forms come from `.pages.yml`.
3. Invite Syd by email from **Settings → Collaborators**. She doesn't need a GitHub account.
4. Every save is a commit to `main`, and the site republishes in a few minutes.

## 6. Moving sydmoore.com (DNS cut-over)

Do this last, once the github.io preview looks right and the launch items in `docs/CONTENT-TODO.md` are done. This replaces the current live site.

1. **Record the current setup first.** Note where sydmoore.com's DNS is managed (usually the domain registrar), and screenshot every existing record, especially **MX** and **TXT** records if Syd has email on the domain. Leave those alone.
2. **Verify the domain with GitHub** (stops anyone else claiming it): your GitHub profile picture → **Settings → Pages → Add a domain**, enter `sydmoore.com`, and add the TXT record it shows at the registrar.
3. **Point the domain at GitHub** at the registrar:
   - Replace the bare domain's **A** records with these four: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Optionally add **AAAA** records: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.
   - Set **www** as a **CNAME** to `mush23.github.io`.
4. **Attach the domain.** Repository **Settings → Pages → Custom domain** → `sydmoore.com` → **Save**. When the DNS check passes (minutes to a few hours), tick **Enforce HTTPS**.
5. **Republish.** Run **Actions → Deploy to GitHub Pages → Run workflow**. The build now sees the custom domain, drops the sub-folder and the `noindex` tags, and the site goes live at `https://sydmoore.com`.
6. **Check it.** Test `/biography`, `/syd-moore-strange-magic` and the other old URLs in `public/_redirects`; each should forward to its new page.
7. **Submit the sitemap.** In Google Search Console and Bing Webmaster Tools, submit `https://sydmoore.com/sitemap-index.xml`.

## What GitHub Pages can't do (and what we do instead)

| Cloudflare feature in the original plan | On GitHub Pages |
| --- | --- |
| `_redirects` 301s from old URLs | Forwarding pages built from `public/_redirects` (keep adding rules there). Each has a canonical link to the new page, which search engines follow, though a true 301 is slightly stronger. |
| `_headers` security headers | CSP and referrer policy are `<meta>` tags in `BaseLayout.astro`. HTTPS is enforced by GitHub. Anti-framing and HSTS headers aren't available. |
| Contact form (Pages Function + Turnstile + Resend) | Not possible without a server. The contact page lists the agent's details instead. `functions/api/contact.ts` is kept but unused. A hosted form service (e.g. Formspree) could be added later. |
| Long cache headers on `/_astro/*` | GitHub sets its own caching (10 minutes). Lighthouse still scores 100. |
