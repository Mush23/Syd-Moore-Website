/**
 * Checks a deployed copy of the site on Hostinger: pages, tidy addresses,
 * old-address redirects, the 404 page, security headers and search-engine rules.
 *
 *   node scripts/check-host.mjs https://new.sydmoore.com     (a staging copy)
 *   node scripts/check-host.mjs https://sydmoore.com         (the live site)
 *
 * Add --ip=<server address> to ask the server directly, without looking the
 * name up. Use it for a copy whose address record or certificate doesn't exist
 * yet. Requests then go over plain HTTP to that IP with the right Host name,
 * and with "X-Forwarded-Proto: https" so the server treats them as secure:
 *
 *   node scripts/check-host.mjs https://new.sydmoore.com --ip=77.37.37.196
 *
 * Exit code 0 means every check passed. Nothing is changed on the server.
 */
import http from "node:http";
import { readFileSync } from "node:fs";
import { parseRedirects } from "../integrations/hostinger.mjs";

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:\/\//.test(a)) ?? "").replace(/\/$/, "");
const ip = args.find((a) => a.startsWith("--ip="))?.slice(5);
if (!base) {
  console.error("Usage: node scripts/check-host.mjs https://new.sydmoore.com [--ip=77.37.37.196]");
  process.exit(2);
}
const CANONICAL = "sydmoore.com";
const host = new URL(base).host;
const isLive = host === CANONICAL;

/** One request, never following redirects. Returns { status, headers.get(name), text() } in both modes. */
function request(url) {
  if (!ip) return fetch(url, { redirect: "manual" });
  const u = new URL(url);
  return new Promise((resolve, reject) => {
    const headers = { Host: u.host, "User-Agent": "sydmoore-check-host" };
    if (u.protocol === "https:") headers["X-Forwarded-Proto"] = "https";
    const req = http.request({ host: ip, port: 80, path: u.pathname + u.search, method: "GET", headers }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (d) => (body += d));
      res.on("end", () => resolve({ status: res.statusCode, headers: { get: (n) => res.headers[n.toLowerCase()] ?? null }, text: async () => body }));
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timed out")));
    req.end();
  });
}

const results = [];
const ok = (name, pass, detail = "") => results.push({ name, pass, detail });
const get = (path) => request(base + path);
const sameSite = (location, path) => {
  const u = new URL(location, base);
  return u.host === host && u.pathname === path;
};

// 1. Pages and feeds load at tidy addresses.
for (const p of ["/", "/books", "/about", "/books/strange-magic", "/series/section-w", "/faq", "/events", "/contact", "/news", "/press"]) {
  const r = await get(p);
  ok(`page ${p}`, r.status === 200 && (r.headers.get("content-type") ?? "").includes("text/html"), `status ${r.status}`);
}
for (const p of ["/rss.xml", "/sitemap-index.xml", "/og/default.png", "/favicon.svg"]) {
  const r = await get(p);
  ok(`file ${p}`, r.status === 200, `status ${r.status}`);
}

// 2. Untidy forms of an address are sent to the tidy one.
for (const [from, to] of [["/about.html", "/about"], ["/about/", "/about"], ["/books/", "/books"], ["/index.html", "/"], ["/books/index.html", "/books"], ["/books/strange-magic.html", "/books/strange-magic"]]) {
  const r = await get(from);
  const loc = r.headers.get("location") ?? "";
  ok(`tidy ${from} -> ${to}`, r.status === 301 && sameSite(loc, to), `status ${r.status} location ${loc}`);
}

// 3. Every old address in public/_redirects is a true 301 to its new page, with and without a trailing slash.
const rules = parseRedirects(readFileSync(new URL("../public/_redirects", import.meta.url), "utf8"));
for (const rule of rules) {
  for (const sample of rule.wildcard ? [`${rule.from}/anything-else`] : [rule.from, `${rule.from}/`]) {
    const r = await get(sample);
    const loc = r.headers.get("location") ?? "";
    ok(`old address ${sample} -> ${rule.to}`, r.status === 301 && sameSite(loc, rule.to), `status ${r.status} location ${loc}`);
  }
  const target = await get(rule.to);
  ok(`  ${rule.to} exists`, target.status === 200, `status ${target.status}`);
}

// 4. A missing page gives a real 404 with the site's own page.
{
  const r = await get("/this-page-does-not-exist");
  const body = await r.text();
  ok("404 page", r.status === 404 && body.includes("This page has vanished"), `status ${r.status}`);
}

// 5. Private files stay private, and certificate checks are left alone.
for (const p of ["/.htaccess", "/.git/config", "/_astro/.htaccess"]) {
  const r = await get(p);
  ok(`private ${p}`, r.status === 403 || r.status === 404, `status ${r.status}`);
}
// Nothing from the old WordPress site can run or be read.
for (const p of ["/wp-login.php", "/xmlrpc.php", "/index.php", "/wp-admin/", "/wp-content/uploads/anything.jpg", "/wp-json/"]) {
  const r = await get(p);
  ok(`old WordPress address ${p} is refused`, r.status === 403 || r.status === 404 || r.status === 410, `status ${r.status}`);
}
{
  const r = await get("/");
  ok("home page is the new site, not from WordPress's cache", !r.headers.get("x-litespeed-cache") && !(await r.text()).includes("wp-content"), `x-litespeed-cache: ${r.headers.get("x-litespeed-cache") ?? "(none)"}`);
}
{
  const r = await get("/.well-known/acme-challenge/check-host-test");
  ok("certificate checks are not redirected", r.status === 404, `status ${r.status} location ${r.headers.get("location") ?? ""}`);
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
  ok("header Strict-Transport-Security", h("strict-transport-security").includes("max-age"), h("strict-transport-security"));

  // 7. Search engines: only the real address may be crawled and indexed.
  const robotsHeader = h("x-robots-tag");
  const robotsTxt = await (await get("/robots.txt")).text();
  const keepOut = /^Disallow:\s*\/\s*$/m.test(robotsTxt);
  ok("no noindex header", !/noindex/i.test(robotsHeader), `X-Robots-Tag: ${robotsHeader || "(none)"}`);
  if (isLive) {
    ok("live site welcomes search engines", !keepOut && robotsTxt.includes("Sitemap:"), robotsTxt.slice(0, 80).replace(/\n/g, " | "));
  } else {
    ok("staging copy tells search engines to keep out", keepOut, robotsTxt.slice(0, 80).replace(/\n/g, " | "));
  }
}

// 8. Hashed files are cached for a long time and have the right type; pages are always re-checked.
{
  const html = await (await get("/")).text();
  const font = html.match(/\/_astro\/[^"' )]+\.woff2/)?.[0];
  const image = html.match(/\/_astro\/[^"' )]+\.avif/)?.[0];
  for (const [asset, type] of [[font, "font/woff2"], [image, "image/avif"]]) {
    if (!asset) { ok(`found a ${type} file to test`, false); continue; }
    const r = await get(asset);
    ok(`${type} file cached for a year`, r.status === 200 && /max-age=31536000/.test(r.headers.get("cache-control") ?? ""), `status ${r.status} cache-control ${r.headers.get("cache-control")}`);
    ok(`${type} file has the right type`, (r.headers.get("content-type") ?? "").startsWith(type), r.headers.get("content-type") ?? "");
  }
  const page = await get("/about");
  ok("pages are re-checked", /max-age=0/.test(page.headers.get("cache-control") ?? ""), `cache-control ${page.headers.get("cache-control")}`);
}

// 9. http:// is sent to https://.
try {
  const r = await request(`http://${host}/about`);
  const loc = r.headers.get("location") ?? "";
  ok("http goes to https", r.status === 301 && loc === `https://${host}/about`, `status ${r.status} location ${loc}`);
} catch (e) {
  ok("http goes to https", false, String(e.cause?.code ?? e.message ?? e));
}

/** Follow up to three redirects. Returns the final address and whether every hop was permanent. */
async function follow(url) {
  let permanent = true;
  for (let hop = 0; hop < 3; hop++) {
    const r = await request(url);
    const loc = r.headers.get("location");
    if (r.status < 300 || r.status >= 400 || !loc) return { url, status: r.status, permanent };
    if (r.status !== 301 && r.status !== 308) permanent = false;
    url = new URL(loc, url).toString();
  }
  return { url, status: 0, permanent };
}

// 10. On the live site, the other host names all lead to it. Two hops are fine
// (Hostinger turns http into https before this site's rules run), as long as
// each hop is permanent and the last stop is the real address.
if (isLive) {
  const aliases = ip
    ? ["https://www.sydmoore.com", "https://sydmoore.co.uk", "https://www.sydmoore.co.uk"]
    : ["https://www.sydmoore.com", "http://www.sydmoore.com", "http://sydmoore.co.uk", "http://www.sydmoore.co.uk", "https://sydmoore.co.uk", "https://www.sydmoore.co.uk"];
  for (const alias of aliases) {
    try {
      const end = await follow(`${alias}/books`);
      ok(`${alias} -> https://${CANONICAL}`, end.url === `https://${CANONICAL}/books` && end.status === 200 && end.permanent, `ended at ${end.url} (status ${end.status}${end.permanent ? "" : ", not permanent"})`);
    } catch (e) {
      ok(`${alias} -> https://${CANONICAL}`, false, String(e.cause?.code ?? e.message ?? e));
    }
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.pass ? "" : `   [${r.detail}]`}`);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed for ${base}${ip ? ` (asked directly at ${ip})` : ""}`);
process.exit(failed.length ? 1 : 0);
