/**
 * 1200×630 social-sharing images, generated at build time with Satori + Resvg.
 * One per book (cover on the night background with the title), plus a default.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";
import { getBooks, getSeriesList, seriesPosition, type Book, type Series } from "../../lib/books";

const W = 1200;
const H = 630;
const ACCENT: Record<string, string> = { oxblood: "#E08A7A", "witch-green": "#7FBFA8", brass: "#D9A441" };
const ACCENT_BG: Record<string, string> = { oxblood: "#8E2B2B", "witch-green": "#2E5E4E", brass: "#8A5A12" };

const fontFile = (pkg: string, file: string) => path.join(process.cwd(), "node_modules", pkg, "files", file);
let fonts: { name: string; data: Buffer; weight: 400 | 500 | 600; style: "normal" }[] | undefined;
async function loadFonts() {
  fonts ??= [
    { name: "Fraunces", data: await readFile(fontFile("@fontsource/fraunces", "fraunces-latin-600-normal.woff")), weight: 600, style: "normal" },
    { name: "Inter", data: await readFile(fontFile("@fontsource/inter", "inter-latin-400-normal.woff")), weight: 400, style: "normal" },
    { name: "Plex", data: await readFile(fontFile("@fontsource/ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff")), weight: 500, style: "normal" },
  ];
  return fonts;
}

async function coverDataUri(book: Book): Promise<string | undefined> {
  const file = book.data.cover?.split("/").pop();
  if (!file) return undefined;
  const full = path.join(process.cwd(), "src", "assets", "covers", file);
  if (!existsSync(full)) return undefined;
  const png = await sharp(full).resize({ height: 500 }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node =>
  ({ type, props: { style: { display: "flex", ...style }, children, ...extra } });

function placeholderCover(title: string, seriesName: string, accent: string): Node {
  return el("div", {
    width: 333, height: 500, flexDirection: "column", justifyContent: "space-between",
    padding: "48px 34px", background: ACCENT_BG[accent] ?? "#8A5A12", color: "#FFFCF5",
    borderRadius: 4, boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
  }, [
    el("div", { fontFamily: "Plex", fontSize: 18, letterSpacing: 2 }, seriesName.toUpperCase()),
    el("div", { fontFamily: "Fraunces", fontSize: 42, lineHeight: 1.05 }, title),
    el("div", { fontFamily: "Fraunces", fontSize: 24, borderTop: "1px solid rgba(255,252,245,0.6)", paddingTop: 16 }, "Syd Moore"),
  ]);
}

async function render(tree: Node): Promise<Response> {
  const svg = await satori(tree as never, { width: W, height: H, fonts: await loadFonts() });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
}

export const getStaticPaths: GetStaticPaths = async () => {
  const books = await getBooks();
  const series = await getSeriesList();
  return [
    ...books.map((book) => ({ params: { slug: book.id }, props: { book, series: series.find((s) => s.id === book.data.series) } })),
    { params: { slug: "default" }, props: {} },
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const { book, series } = props as { book?: Book; series?: Series };

  if (!book) {
    return render(el("div", {
      width: W, height: H, background: "#16141A", color: "#EFE8DA", flexDirection: "column",
      justifyContent: "center", padding: "0 96px",
    }, [
      el("div", { fontFamily: "Plex", fontSize: 24, letterSpacing: 3, color: "#D9A441" }, "AUTHOR"),
      el("div", { fontFamily: "Fraunces", fontSize: 112, marginTop: 12 }, "Syd Moore"),
      el("div", { fontFamily: "Inter", fontSize: 34, marginTop: 20, color: "#B8AF9F", maxWidth: 900 },
        "Mysteries with history in their bones: Section W and the Essex Witch Museum Mysteries."),
    ]));
  }

  const accent = series?.data.accent ?? "brass";
  const cover = await coverDataUri(book);
  const coverNode: Node = cover
    ? { type: "img", props: { src: cover, width: 333, height: 500, style: { borderRadius: 4, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" } } }
    : placeholderCover(book.data.title, series?.data.shortName ?? "", accent);

  return render(el("div", {
    width: W, height: H, background: "#16141A", color: "#EFE8DA", alignItems: "center", padding: "0 80px", gap: 64,
  }, [
    coverNode,
    el("div", { flexDirection: "column", flex: 1 }, [
      el("div", { fontFamily: "Plex", fontSize: 22, letterSpacing: 3, color: ACCENT[accent] }, seriesPosition(book, series).toUpperCase()),
      el("div", { fontFamily: "Fraunces", fontSize: book.data.title.length > 28 ? 60 : 76, lineHeight: 1.05, marginTop: 16 }, book.data.title),
      el("div", { fontFamily: "Inter", fontSize: 30, lineHeight: 1.35, marginTop: 24, color: "#B8AF9F" }, book.data.hook),
      el("div", { fontFamily: "Fraunces", fontSize: 34, marginTop: 36, color: "#D9A441" }, "Syd Moore"),
    ]),
  ]));
};
