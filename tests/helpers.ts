import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

/** Read a content file's frontmatter as simple key/value pairs (enough for tests). */
function front(file: string): Record<string, string> {
  const text = readFileSync(file, "utf8");
  const block = text.split("---")[1] ?? "";
  const out: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

function published(dir: string) {
  const full = path.join(root, "src/content", dir);
  return readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.md$/, ""), data: front(path.join(full, f)) }))
    .filter((e) => e.data.draft !== "true");
}

export const books = published("books");
export const series = published("series");
export const news = published("news");

export const staticRoutes = [
  "/",
  "/books",
  "/about",
  "/essex-girls-and-witches",
  "/events",
  "/news",
  "/press",
  "/contact",
  "/newsletter",
  "/privacy",
  "/accessibility",
];

export const allRoutes = [
  ...staticRoutes,
  ...series.map((s) => `/series/${s.slug}`),
  ...books.map((b) => `/books/${b.slug}`),
  ...news.map((n) => `/news/${n.slug}`),
];

export const redirectsFile = readFileSync(path.join(root, "public/_redirects"), "utf8");
