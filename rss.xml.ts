import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { site } from "../config/site";

export const GET: APIRoute = async (context) => {
  const posts = (await getCollection("news", ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return rss({
    title: "Syd Moore: news",
    description: "New books, events and announcements from Syd Moore.",
    site: context.site ?? site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.summary,
      pubDate: p.data.date,
      link: `/news/${p.id}`,
    })),
    customData: "<language>en-gb</language>",
  });
};
