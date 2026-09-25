# Deploying sydmoore.com

Everything here is free except the domain renewal. Allow about an hour for the first setup.

## 1. GitHub

1. Push this repository to GitHub (private is fine).
2. The CI workflow (`.github/workflows/ci.yml`) runs on every push: type check, build, Playwright tests with axe accessibility checks, and Lighthouse budgets.

## 2. Cloudflare Pages

1. Create a free Cloudflare account and go to **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick this repository. Settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable `NODE_VERSION` = `22`
3. Deploy. You'll get a `*.pages.dev` preview URL. Check it before touching DNS.

## 3. Environment variables

In the Pages project, go to **Settings → Variables and secrets** and add these for **Production** (and Preview if you want forms to work there):

| Name | Type | What it is |
| --- | --- | --- |
| `PUBLIC_KIT_FORM_ACTION` | Text | Kit form action URL (see step 4) |
| `PUBLIC_CF_ANALYTICS_TOKEN` | Text | Web Analytics token (step 6) |
| `PUBLIC_AMAZON_TAG` | Text | Amazon Associates UK store ID, e.g. `sydmoore-21` |
| `PUBLIC_CONTACT_FORM` | Text | `true` once step 5 is done |
| `PUBLIC_TURNSTILE_SITE_KEY` | Text | Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile secret key |
| `RESEND_API_KEY` | Secret | Resend API key |
| `CONTACT_TO` | Text | The inbox that receives contact messages |
| `CONTACT_FROM` | Text | e.g. `sydmoore.com <website@sydmoore.com>` |

`PUBLIC_*` values are baked in at build time, so **redeploy** after changing them.

## 4. Newsletter (Kit, free plan)

1. Create a Kit account in Syd's name and create a form (**Grow → Landing pages & forms → Create → Form → Inline**).
2. In the form settings, set **After subscribing → Redirect to an external page** = `https://sydmoore.com/newsletter/thanks`.
3. Open **Publish → HTML** and copy the form's `action="…"` URL into `PUBLIC_KIT_FORM_ACTION`.
4. If that URL isn't on `app.kit.com` or `app.convertkit.com`, add its domain to `form-action` in `public/_headers`.
5. The free plan doesn't send automated welcome sequences; send the welcome email by hand or upgrade later.

## 5. Contact form (Turnstile + Resend, both free)

1. **Turnstile:** Cloudflare dashboard → **Turnstile → Add widget**, hostname `sydmoore.com`, mode Managed. Copy the site key and secret key into the variables above.
2. **Resend:** create an account, add and verify the domain `sydmoore.com` (it gives you DNS records to add in Cloudflare), then create an API key.
3. Set `CONTACT_TO`, `CONTACT_FROM`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, then `PUBLIC_CONTACT_FORM=true` and redeploy.
4. Until this is done, the contact page shows the agent's details instead of a form.

## 6. Analytics (cookieless)

Cloudflare dashboard → **Analytics & Logs → Web Analytics → Add a site** → sydmoore.com. Copy the token into `PUBLIC_CF_ANALYTICS_TOKEN` and redeploy. It sets no cookies, so the site needs no cookie banner.

## 7. Daily rebuild

1. Pages project → **Settings → Builds → Deploy hooks → Add** (name it "daily", branch `main`). Copy the URL.
2. GitHub repo → **Settings → Secrets and variables → Actions → New secret** named `CF_PAGES_DEPLOY_HOOK` with that URL.
3. `.github/workflows/daily-rebuild.yml` then rebuilds every morning, which flips "Pre-order" to "Out now" on publication day.

## 8. Pages CMS (for Syd)

1. Go to <https://app.pagescms.org>, sign in with GitHub, and install the Pages CMS GitHub app on this repository.
2. Open the repository in Pages CMS. The forms come from `.pages.yml`.
3. Invite Syd by email from **Settings → Collaborators**. She doesn't need a GitHub account.
4. Every save is a commit; Cloudflare rebuilds the site in about a minute.

## 9. Moving sydmoore.com (DNS cut-over)

Do this last, once the `*.pages.dev` site looks right.

1. **Record the current setup first.** Note where sydmoore.com's DNS is hosted, and screenshot every existing record (especially **MX** records if Syd has email on the domain).
2. **Add the domain to Cloudflare** (free plan) and let it import the records. Check that the MX and TXT records match your screenshot.
3. **Change the nameservers** at the domain registrar to the two Cloudflare gives you.
4. **Attach the domain.** Pages project → **Custom domains → Set up a domain** → `sydmoore.com`, then again for `www.sydmoore.com`. Redirect `www` to the bare domain with a Bulk Redirect or a Page Rule.
5. **Check it.** Test `/biography`, `/syd-moore-strange-magic/` and the other old URLs in `public/_redirects`; each should 301 to its new page.
6. **Submit the sitemap.** In Google Search Console and Bing Webmaster Tools, submit `https://sydmoore.com/sitemap-index.xml`.

**Rollback:** change the nameservers back at the registrar (or restore the old A/CNAME records if DNS stayed put). The old site keeps working until its hosting ends, so don't cancel the old hosting for at least two weeks.

## 10. Extra domains

Register `sydmoore.co.uk` and `sydmoore.uk` (both were unregistered on 24 Sep 2026). Add them to Cloudflare and use a redirect rule to send everything to `https://sydmoore.com`.
