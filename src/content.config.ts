/**
 * Content schemas. Keep these in step with .pages.yml, which gives Syd the
 * editing forms for the same fields in Pages CMS.
 */
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** Pages CMS can save untouched fields as "" or null: treat both as "not set". */
const blank = (v: unknown) => (v === "" || v === null ? undefined : v);
const opt = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blank, schema.optional());

const isbn = opt(
  z.string().regex(/^97[89]\d{10}$/, "ISBN-13: 13 digits starting 978 or 979, no hyphens"),
);

const url = z.preprocess(blank, z.string().url().optional());

/** A retailer link for every button the buy panel can show. Empty = hidden. */
const links = z.preprocess(blank, z
  .object({
    readOnSea: url,
    bookshop: url,
    waterstones: url,
    hive: url,
    blackwells: url,
    amazon: url,
    kindle: url,
    appleBooks: url,
    kobo: url,
    googlePlay: url,
    audible: url,
    libroFm: url,
  })
  .partial()
  .default({}));

export const SERIES_SLUGS = ["section-w", "essex-witch-museum-mysteries", "standalones"] as const;

const books = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/books" }),
  schema: z.object({
    title: z.string(),
    series: z.enum(SERIES_SLUGS),
    /** Only for numbered novels (1, 2, 3…). Leave empty for story collections. */
    seriesNumber: opt(z.number().int().positive()),
    /** Reading-order position inside the series. Decimals slot collections between novels. */
    order: z.number(),
    /** Short note shown instead of a number, e.g. "Christmas stories". */
    seriesNote: opt(z.string()),
    /** auto: Pre-order before the publication date, Out now after it. */
    status: z.enum(["auto", "coming-soon"]).default("auto"),
    featured: z.boolean().default(false),
    /** UK publication date of the current edition (YYYY-MM-DD). */
    pubDate: z.coerce.date(),
    /** Free text for an earlier first edition, e.g. "October 2012". */
    firstPublished: opt(z.string()),
    formerTitle: opt(z.string()),
    imprint: opt(z.string()),
    pages: opt(z.number().int().positive()),
    narrator: opt(z.string()),
    formats: z.preprocess(blank, z
      .array(z.enum(["hardback", "paperback", "ebook", "audiobook", "large-print"]))
      .default([])),
    isbn: z.preprocess(blank, z
      .object({ paperback: isbn, hardback: isbn, ebook: isbn, audio: isbn })
      .default({})),
    hook: z.string().max(140),
    quotes: z.preprocess(blank, z.array(z.object({ text: z.string(), source: z.string() })).default([])),
    /** Syd's "history behind the book" note (Markdown). Hidden when empty. */
    historyNote: opt(z.string()),
    /** Cover file name inside src/assets/covers (Pages CMS writes /covers/<file>). */
    cover: opt(z.string()),
    /** PDF extract path inside /public, e.g. /extracts/strange-magic.pdf */
    extract: opt(z.string()),
    links,
    seoTitle: opt(z.string().max(60)),
    seoDescription: opt(z.string().max(155)),
    draft: z.boolean().default(false),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/series" }),
  schema: z.object({
    name: z.string(),
    shortName: z.string(),
    accent: z.enum(["oxblood", "witch-green", "brass"]),
    order: z.number(),
    label: z.string(),
    tagline: z.string(),
    startHere: z.string(),
    notes: z.array(z.string()).default([]),
  }),
});

/** Event times are UK wall-clock times ("2026-10-08T19:00"), shown in Europe/London. */
const localDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Use YYYY-MM-DDTHH:mm");

const events = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/events" }),
  schema: z.object({
    title: z.string(),
    start: localDateTime,
    end: opt(localDateTime),
    venue: z.string(),
    town: z.string(),
    type: z.enum(["talk", "signing", "workshop", "festival", "launch", "other"]),
    price: opt(z.string()),
    ticketUrl: url,
    book: opt(z.string()),
    draft: z.boolean().default(false),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().max(200),
    image: opt(z.string()),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      updated: z.coerce.date().optional(),
      intro: z.string().optional(),
      shortBio: z.string().optional(),
      mediumBio: z.string().optional(),
      quickFacts: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      agentName: z.string().optional(),
      agentAgency: z.string().optional(),
      agentUrl: url,
      publicistName: z.string().optional(),
      publicistEmail: z.string().optional(),
      selectedPress: z
        .array(z.object({ title: z.string(), outlet: z.string(), date: z.string().optional(), url: z.string().url() }))
        .optional(),
      talkTopics: z.array(z.string()).optional(),
    })
    .passthrough(),
});

export const collections = { books, series, events, news, pages };
