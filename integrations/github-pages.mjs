/**
 * GitHub Pages support, run after `astro build`.
 *
 * GitHub Pages can't read Cloudflare's `_redirects` or `_headers` files, so:
 *
 * 1. Redirects: each rule in public/_redirects becomes a small HTML page that
 *    forwards visitors (meta refresh + JS) and tells search engines the new
 *    address (canonical link). Written as both /old.html and /old/index.html
 *    so /old and /old/ both work.
 * 2. Headers: the CSP and referrer policy move into <meta> tags in
 *    BaseLayout.astro; the two Cloudflare-only files are removed from dist/.
 * 3. Sub-folder address: until sydmoore.com points at GitHub, the site lives at
 *    https://<user>.github.io/<repo>/. When SITE_BASE is set (the deploy
 *    workflow passes it from actions/configure-pages), every root-relative URL
 *    in the built HTML and CSS gets that prefix, and every page is marked
 *    noindex so the preview never competes with sydmoore.com in search.
 *    With a custom domain SITE_BASE is empty and this step does nothing.
 */
import { readFile, writeFile, readdir, rm, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function parseRedirects(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split(/\s+/))
    .filter(([from, to]) => from && to && !from.includes("*"))
    .map(([from, to]) => ({ from: from.replace(/\/$/, ""), to }));
}

function redirectPage(target, canonical) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<title>Page moved</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${esc(canonical)}">
<meta http-equiv="refresh" content="0; url=${esc(target)}">
<script>location.replace(${JSON.stringify(target)} + location.hash)</script>
</head>
<body>
<p>This page has moved to <a href="${esc(target)}">${esc(target)}</a>.</p>
</body>
</html>
`;
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/** Prefix root-relative URLs ("/books", not "//cdn…") in attributes and CSS url(). */
function prefix(text, base, isCss) {
  if (isCss) return text.replace(/url\((["']?)\/(?!\/)/g, `url($1${base}/`);
  return text
    .replace(/(\s(?:href|src|action|poster|srcset)=["'])\/(?!\/)/g, `$1${base}/`)
    .replace(/(,\s*)\/(?!\/)(?=[^"'\s,]+\s+\d+[wx])/g, `$1${base}/`) // later srcset entries
    .replace(/url\((["']?)\/(?!\/)/g, `url($1${base}/`);
}

export default function githubPages() {
  let site = "https://sydmoore.com";
  return {
    name: "github-pages",
    hooks: {
      "astro:config:done": ({ config }) => {
        if (config.site) site = config.site.replace(/\/$/, "");
      },
      "astro:build:done": async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const base = (process.env.SITE_BASE ?? "").replace(/\/$/, "");

        if (base) {
          for (const file of await walk(dist)) {
            const isCss = file.endsWith(".css");
            if (!isCss && !file.endsWith(".html")) continue;
            let text = await readFile(file, "utf8");
            text = prefix(text, base, isCss);
            if (!isCss && !text.includes('name="robots"')) {
              text = text.replace(/<head>/i, '<head><meta name="robots" content="noindex">');
            }
            await writeFile(file, text);
          }
          logger.info(`Links prefixed with ${base} and pages marked noindex (preview address)`);
        }

        // GitHub Pages sends /books to /books/ when a books/ folder exists, then
        // looks for books/index.html. Copy books.html there so both work.
        for (const file of await walk(dist)) {
          if (!file.endsWith(".html")) continue;
          const folder = file.slice(0, -5);
          const index = path.join(folder, "index.html");
          try {
            if ((await readdir(folder)).includes("index.html")) continue;
          } catch {
            continue; // no folder of the same name
          }
          await writeFile(index, await readFile(file));
        }

        // After prefixing, so these already-complete targets aren't prefixed twice.
        const rules = parseRedirects(await readFile(path.join(dist, "_redirects"), "utf8"));
        for (const { from, to } of rules) {
          const page = redirectPage(base + to, site + to);
          const file = path.join(dist, from + ".html");
          await mkdir(path.dirname(file), { recursive: true });
          await writeFile(file, page);
          await mkdir(path.join(dist, from), { recursive: true });
          await writeFile(path.join(dist, from, "index.html"), page);
        }
        await rm(path.join(dist, "_redirects"), { force: true });
        await rm(path.join(dist, "_headers"), { force: true });
        logger.info(`${rules.length} redirect pages written`);
      },
    },
  };
}
