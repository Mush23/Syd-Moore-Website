/**
 * Hostinger support, run after `astro build` when DEPLOY_TARGET=hostinger.
 *
 * Hostinger serves the site with LiteSpeed, which reads Apache-style .htaccess
 * files. This writes them into dist/:
 *
 * - dist/.htaccess
 *     one address (www and the .co.uk domain go to https://sydmoore.com), HTTPS
 *     only, true 301 redirects built from public/_redirects, tidy addresses
 *     (/about is served from about.html), the 404 page, security headers, and a
 *     "keep out" robots.txt on any other host name, such as a staging subdomain.
 * - dist/robots-staging.txt
 *     that "keep out" file.
 * - dist/_astro/.htaccess
 *     a one-year cache for files whose names contain a content hash.
 * - dist/og/.htaccess
 *     a one-day cache for social images.
 *
 * Never edit .htaccess on the server: every deploy replaces it. Change the
 * rules here, or the redirects in public/_redirects.
 */
import { readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

/** Every other host name that should send visitors to the canonical address. */
const ALIAS_HOSTS = ["www.sydmoore.com", "sydmoore.co.uk", "www.sydmoore.co.uk"];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * public/_redirects lines are "from to 301". A trailing "/*" on `from` matches
 * everything under that path. "/x" and "/x/" need only be listed once here.
 */
export function parseRedirects(text) {
  const seen = new Set();
  const rules = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const [from, to, status = "301"] = line.split(/\s+/);
    if (!from || !to) continue;
    const wildcard = from.endsWith("/*");
    const base = from.replace(/\/\*$/, "").replace(/\/$/, "").replace(/^\//, "");
    if (!base) continue;
    const key = `${base}${wildcard ? "/*" : ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rules.push({ from: `/${base}`, pattern: wildcard ? `^${escapeRe(base)}(/.*)?$` : `^${escapeRe(base)}/?$`, to, status, wildcard });
  }
  // Exact addresses first, so "/tag/x" wins over "/tag/*".
  return [...rules.filter((r) => !r.wildcard), ...rules.filter((r) => r.wildcard)];
}

export function buildHtaccess({ host, redirects }) {
  const hostRe = escapeRe(host);
  const aliasRe = ALIAS_HOSTS.map(escapeRe).join("|");
  return `# Written at build time by integrations/hostinger.mjs. Do not edit on the server:
# every deploy replaces this file. Old-address redirects come from public/_redirects.

Options -Indexes -MultiViews
DirectorySlash Off
DirectoryIndex index.html
ErrorDocument 404 /404.html
AddDefaultCharset UTF-8
AddType image/avif .avif
AddType font/woff2 .woff2
AddType text/calendar .ics

<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /

# Leave certificate checks alone, then keep every other dot file (.git, .htaccess) private.
RewriteRule ^\\.well-known/ - [L]
RewriteRule (^|/)\\. - [F,L]

# This site has no PHP. Refuse every .php request and the old WordPress folders, so
# files left behind by the WordPress site it replaced can never run or be read.
# (If a PHP contact form is ever added, exempt that one file above these lines.)
RewriteRule \\.php$ - [F,L]
RewriteRule ^(wp-admin|wp-includes|wp-content|wp-json)(/|$) - [F,L]

# 1. One address: www and the .co.uk domain go to https://${host}
RewriteCond %{HTTP_HOST} ^(${aliasRe})\\.?(:[0-9]+)?$ [NC]
RewriteRule ^ https://${host}%{REQUEST_URI} [R=301,L]

# 2. Always HTTPS
RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !=https
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

# 3. A copy on any other host name (such as a staging subdomain) tells search
#    engines to keep out. Only ${host} serves the real robots.txt.
RewriteCond %{HTTP_HOST} !^${hostRe}\\.?(:[0-9]+)?$ [NC]
RewriteRule ^robots\\.txt$ /robots-staging.txt [L]

# 4. Addresses from the old site (public/_redirects)
${redirects.map((r) => `RewriteRule ${r.pattern} ${r.to} [R=${r.status},L]`).join("\n")}

# 5. Tidy addresses: no index.html, no .html, no trailing slash
RewriteCond %{THE_REQUEST} \\s/+index\\.html[\\s?] [NC]
RewriteRule ^ / [R=301,L]
RewriteCond %{THE_REQUEST} \\s/+(.+)/index\\.html[\\s?] [NC]
RewriteRule ^ /%1 [R=301,L]
RewriteCond %{THE_REQUEST} \\s/+(.+)\\.html[\\s?] [NC]
RewriteRule ^ /%1 [R=301,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.+)/$ /$1 [R=301,L]

# 6. Serve /about from about.html (two ways of finding the file, for safety)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.+)$ /$1.html [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.+)$ /$1.html [L]
</IfModule>

# The WordPress site used LiteSpeed's page cache. Never answer from it.
<IfModule LiteSpeed>
CacheLookup off
</IfModule>

<IfModule mod_headers.c>
# Security headers. The rest of the content policy is a <meta> tag in each page.
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set X-Frame-Options "DENY"
Header always set Content-Security-Policy "frame-ancestors 'none'"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
Header always set Strict-Transport-Security "max-age=31536000"
# Do not make a Header line depend on "env=!NAME". Hostinger's LiteSpeed does
# not honour the negated form and sends the header every time (tested 17 Nov
# 2026: a noindex header meant only for staging was also sent on the real host
# name). For anything that depends on the host name, use a RewriteCond on
# %{HTTP_HOST}, as rule 3 does.

# Pages are always checked for a newer version.
<FilesMatch "\\.(html|xml|txt)$">
Header set Cache-Control "public, max-age=0, must-revalidate"
</FilesMatch>
</IfModule>
`;
}

const cacheHtaccess = (seconds, immutable) => `# Written at build time by integrations/hostinger.mjs.
<IfModule mod_headers.c>
Header set Cache-Control "public, max-age=${seconds}${immutable ? ", immutable" : ""}"
</IfModule>
`;

export default function hostinger() {
  let host = "sydmoore.com";
  return {
    name: "hostinger",
    hooks: {
      "astro:config:done": ({ config }) => {
        if (config.site) host = new URL(config.site).host;
      },
      "astro:build:done": async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const redirects = parseRedirects(await readFile(path.join(dist, "_redirects"), "utf8"));
        await writeFile(path.join(dist, ".htaccess"), buildHtaccess({ host, redirects }));
        await writeFile(path.join(dist, "_astro", ".htaccess"), cacheHtaccess(31536000, true));
        await writeFile(path.join(dist, "og", ".htaccess"), cacheHtaccess(86400, false));
        await writeFile(path.join(dist, "robots-staging.txt"), "# This is a test copy of the site. The real one is at https://" + host + "/\nUser-agent: *\nDisallow: /\n");
        // Cloudflare-format files have no meaning on Hostinger.
        await rm(path.join(dist, "_redirects"), { force: true });
        await rm(path.join(dist, "_headers"), { force: true });
        logger.info(`.htaccess written with ${redirects.length} redirects`);
      },
    },
  };
}
