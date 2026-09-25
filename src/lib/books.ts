import { getCollection, type CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import { site } from "../config/site";
import { buildNow } from "./dates";

export type Book = CollectionEntry<"books">;
export type Series = CollectionEntry<"series">;
export type Status = "out-now" | "pre-order" | "coming-soon";

/* ---------------- Collections ---------------- */

export async function getBooks(): Promise<Book[]> {
  const books = await getCollection("books", ({ data }) => !data.draft);
  return books.sort((a, b) => a.data.order - b.data.order);
}

export async function getSeriesList(): Promise<Series[]> {
  const all = await getCollection("series");
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getSeries(slug: string): Promise<Series | undefined> {
  return (await getSeriesList()).find((s) => s.id === slug);
}

export async function booksInSeries(slug: string): Promise<Book[]> {
  return (await getBooks()).filter((b) => b.data.series === slug);
}

/** The book in the home-page hero: the one ticked "Featured", else the newest. */
export async function getFeaturedBook(): Promise<Book> {
  const books = await getBooks();
  const featured = books.find((b) => b.data.featured);
  if (featured) return featured;
  return [...books]
    .filter((b) => b.data.status !== "coming-soon")
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())[0];
}

/* ---------------- Status ---------------- */

export function bookStatus(book: Book, now: Date = buildNow()): Status {
  if (book.data.status === "coming-soon") return "coming-soon";
  return book.data.pubDate.getTime() > now.getTime() ? "pre-order" : "out-now";
}

export const statusLabel: Record<Status, string> = {
  "out-now": "Out now",
  "pre-order": "Pre-order",
  "coming-soon": "Coming soon",
};

/** "Section W · Book 1", or the series note for collections. */
export function seriesPosition(book: Book, series?: Series): string {
  const name = series?.data.shortName ?? "";
  if (book.data.seriesNumber) return `${name} · Book ${book.data.seriesNumber}`.replace(/^ · /, "");
  if (book.data.seriesNote) return `${name} · ${book.data.seriesNote}`.replace(/^ · /, "");
  return name;
}

/* ---------------- Covers ---------------- */

const coverFiles = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/covers/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

/** Find an uploaded cover by file name (Pages CMS writes "/covers/<file>"). */
export function coverImage(book: Book): ImageMetadata | undefined {
  const file = book.data.cover?.split("/").pop();
  if (!file) return undefined;
  const hit = Object.entries(coverFiles).find(([path]) => path.endsWith(`/${file}`));
  return hit?.[1].default;
}

export function coverAlt(book: Book): string {
  return `Cover of ${book.data.title} by Syd Moore`;
}

/* ---------------- Retailers ---------------- */

export type FormatTab = "print" | "ebook" | "audio";
type RetailerKey = keyof Book["data"]["links"];

export interface Retailer {
  key: RetailerKey;
  label: string;
  tab: FormatTab;
  primary?: boolean;
}

/** Display order is the brief's local-first order. */
export const RETAILERS: Retailer[] = [
  { key: "readOnSea", label: "Read on Sea, Leigh-on-Sea", tab: "print", primary: true },
  { key: "bookshop", label: "Bookshop.org", tab: "print" },
  { key: "waterstones", label: "Waterstones", tab: "print" },
  { key: "hive", label: "Hive", tab: "print" },
  { key: "blackwells", label: "Blackwell's", tab: "print" },
  { key: "amazon", label: "Amazon UK", tab: "print" },
  { key: "kindle", label: "Kindle", tab: "ebook" },
  { key: "appleBooks", label: "Apple Books", tab: "ebook" },
  { key: "kobo", label: "Kobo", tab: "ebook" },
  { key: "googlePlay", label: "Google Play", tab: "ebook" },
  { key: "audible", label: "Audible", tab: "audio" },
  { key: "libroFm", label: "Libro.fm", tab: "audio" },
];

export const TAB_LABELS: Record<FormatTab, string> = {
  print: "Paperback",
  ebook: "Ebook",
  audio: "Audiobook",
};

/** ISBN-13 (978 prefix) to ISBN-10. Amazon uses the ISBN-10 as the ASIN for print books. */
export function isbn13to10(isbn13: string): string | undefined {
  if (!/^978\d{10}$/.test(isbn13)) return undefined;
  const core = isbn13.slice(3, 12);
  const sum = core.split("").reduce((acc, d, i) => acc + Number(d) * (10 - i), 0);
  const check = (11 - (sum % 11)) % 11;
  return core + (check === 10 ? "X" : String(check));
}

function withAmazonTag(url: string): string {
  if (!site.affiliates.amazonTag) return url;
  const u = new URL(url);
  u.searchParams.set("tag", site.affiliates.amazonTag);
  return u.toString();
}

export interface BuyLink {
  retailer: Retailer;
  url: string;
}

/** Retailer links grouped by format tab, in display order. Empty tabs are dropped. */
export function buyLinks(book: Book): { tab: FormatTab; label: string; links: BuyLink[] }[] {
  const explicit = book.data.links ?? {};
  const printIsbn = book.data.isbn.paperback ?? book.data.isbn.hardback;

  const resolved: BuyLink[] = [];
  for (const r of RETAILERS) {
    let url = explicit[r.key] || "";
    // Amazon: build from the print ISBN when no link is given.
    if (!url && r.key === "amazon" && printIsbn) {
      const asin = isbn13to10(printIsbn);
      if (asin) url = `https://www.amazon.co.uk/dp/${asin}`;
    }
    if (url && (r.key === "amazon" || r.key === "kindle")) url = withAmazonTag(url);
    if (url) resolved.push({ retailer: r, url });
  }

  const tabs: FormatTab[] = ["print", "ebook", "audio"];
  const printLabel = book.data.formats.includes("paperback")
    ? "Paperback"
    : book.data.formats.includes("hardback")
      ? "Hardback"
      : "Print";
  return tabs
    .map((tab) => ({
      tab,
      label: tab === "print" ? printLabel : TAB_LABELS[tab],
      links: resolved.filter((l) => l.retailer.tab === tab),
    }))
    .filter((t) => t.links.length > 0);
}

/** Human-readable formats list: "Paperback, ebook and audiobook". */
export function formatsText(book: Book): string {
  const names: Record<string, string> = {
    hardback: "hardback", paperback: "paperback", ebook: "ebook", audiobook: "audiobook", "large-print": "large print",
  };
  const list = book.data.formats.map((f) => names[f]);
  if (list.length === 0) return "";
  const text = list.length === 1 ? list[0] : `${list.slice(0, -1).join(", ")} and ${list.at(-1)}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function bookUrl(book: Book): string {
  return `/books/${book.id}`;
}
