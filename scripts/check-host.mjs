/**
 * Checks a deployed copy of the site on Hostinger: pages, tidy addresses,
 * old-address redirects, the 404 page, security headers and search-engine rules.
 *
 *   node scripts/check-host.mjs https://new.sydmoore.com     (a staging copy)
 *   node scripts/check-host.mjs https://sydmoore.com         (the live site)
 *
 * Exit code 0 means every check passed. Nothing is changed on the server.
 */
import { readFileSync } from "node:fs";
import { parseRedirects } from "../integrations/hostinger.mjs";

const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Usage: node scripts/check-host.mjs https://new.sydmoore.com");
  process.exit(2);
}
const CANONICAL = "sydmoore.com";
const host = new URL(base).host;
const isLive = host === CANONICAL;

const results = [];
const ok = (name, pass, detail = "") => results.push({ name, pass, detail });
const get = (path, init = {}) => fetch(base + path, { redirect: "manual", ...init });
const sameSite = (location, path) => {
  const u = new URL(location, base);
  return u.host === host && u.pathname === path;
};

// 1. Pages load at tidy addresses.
for (const p of ["/", "/books", "/about", "/books/strange-magic", "/series/section-w", "/faq", "/events", "/contact", "/news", "/press"]) {
  const r = await get(p);
  ok(`page ${p}`, r.status === 200 && (r.headers.get("content-type") ?? "").includes("text/html"), `status ${r.status}`);
}

// 2. Untidy forms of an address are sent to the tidy one.
for (const [from, to] of [["/about.html", "/about"], ["/about/", "/about"], ["/books/", "/books"], ["/index.html", "/"], ["/books/strange-magic.html", "/books/strange-magic"]]) {
  const r = await get(from);
  const loc = r.headers.get("location") ?? "";
  ok(`tidy ${from} -> ${to}`, r.status === 301 && sameSite(loc, to), `status ${r.status} location ${loc}`);
}

// 3. Every old address in public/_redirects is a true 301 to its new page.
const rules = parseRedirects(readFileSync(new URL("../public/_redirects", import.meta.url), "utf8"));
for (const rule of rules) {
  const sample = rule.from + (rule.wildcard ? "/anything-else" : "");
  const r = await get(sample);
  const loc = r.headers.get("location") ?? "";
  ok(`old address ${sample} -> ${rule.to}`, r.status === 301 && sameSite(loc, rule.to), `status ${r.status} location ${loc}`);
  if (r.status === 301) {
    const target = await get(rule.to);
    ok(`  ${rule.to} exists`, target.status === 200, `status ${target.status}`);
  }
}

// 4. A missing page gives a real 404 with the site's own page.
{
  const r = await get("/this-page-does-not-exist");
  const body = await r.text();
  ok("404 page", r.status === 404 && body.includes("This page has vanished"), `status ${r.status}`);
}

// 5. Private files stay private.
for (const p of ["/.htaccess", "/.git/config"]) {
  const r = await get(p);
  ok(`private ${p}`, r.status === 403 || r.status === 404, `status ${r.status}`);
}

// 6. Security headers.
{
  const r = await get("/");
  const h = (n) => r.headers.get(n) ?? "";
  ok("header X-Content-Type-Options", h("x-content-type-options").includes("nosniff"), h("x-content-type-options"));
  ok("header X-Frame-Options", /deny/i.test(h("x-frame-options")), h("x-frame-options"));
  ok("header Referrer-Policy", h("referrer-policy").includes("strict-origin"), h("referrer-policy"));
  ok("header Content-Security-Policy", h("content-security-policy").includes("frame-ancestors"), h("content-security-policy"));
  ok("header Permissions-Policy", h("permissions-policy").includes("camera"), h("permissions-policy"));
  if (base.startsWith("https://")) ok("header Strict-Transport-Security", h("strict-transport-security").includes("max-age"), h("strict-transport-security"));

  // 7. Search engines: only the real address may be indexed. This also proves the
  // server applies the "only on this host" condition rather than ignoring it.
  const robots = h("x-robots-tag");
  const marker = h("x-canonical-host");
  if (isLive) {
    ok("live site can be indexed", !/noindex/i.test(robots), `X-Robots-Tag: ${robots || "(none)"}`);
    ok("live site sends the canonical marker", marker === "yes", `X-Canonical-Host: ${marker || "(none)"}`);
  } else {
    ok("staging copy is hidden from search", /noindex/i.test(robots), `X-Robots-Tag: ${robots || "(none)"}`);
    // If this marker appears on staging, the server ignores "env=" and the live site would be hidden from search too.
    ok("server applies host-only rules correctly", marker === "", `X-Canonical-Host: ${marker || "(none)"}`);
  }
}

// 8. Hashed files are cached for a long time; pages are always re-checked.
{
  const html = await (await get("/")).text();
  const asset = html.match(/\/_astro\/[^"' )]+\.(?:woff2|avif|webp|js|css)/)?.[0];
  if (asset) {
    const r = await get(asset);
    ok(`asset ${asset.slice(0, 40)}… cached`, r.status === 200 && /max-age=31536000/.test(r.headers.get("cache-control") ?? ""), `status ${r.status} cache-control ${r.headers.get("cache-control")}`);
  } else ok("found a hashed asset to test", false);
  const page = await get("/about");
  ok("pages are re-checked", /max-age=0/.test(page.headers.get("cache-control") ?? ""), `cache-control ${page.headers.get("cache-control")}`);
}

// 9. http:// is sent to https://.
if (base.startsWith("https://")) {
  try {
    const r = await fetch(base.replace("https://", "http://") + "/about", { redirect: "manual" });
    const loc = r.headers.get("location") ?? "";
    ok("http goes to https", r.status === 301 && loc.startsWith("https://"), `status ${r.status} location ${loc}`);
  } catch (e) {
    ok("http goes to https", false, String(e.message ?? e));
  }
}

// 10. On the live site, the other host names all lead to it.
if (isLive) {
  for (const alias of ["https://www.sydmoore.com", "http://www.sydmoore.com", "http://sydmoore.co.uk", "http://www.sydmoore.co.uk", "https://sydmoore.co.uk", "https://www.sydmoore.co.uk"]) {
    try {
      const r = await fetch(alias + "/books", { redirect: "manual" });
      const loc = r.headers.get("location") ?? "";
      ok(`${alias} -> https://${CANONICAL}`, r.status === 301 && loc === `https://${CANONICAL}/books`, `status ${r.status} location ${loc}`);
    } catch (e) {
      ok(`${alias} -> https://${CANONICAL}`, false, String(e.cause?.code ?? e.message ?? e));
    }
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.pass ? "" : `   [${r.detail}]`}`);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed for ${base}`);
process.exit(failed.length ? 1 : 0);
