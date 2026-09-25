import type { APIRoute } from "astro";
import { site } from "../config/site";

export const GET: APIRoute = () =>
  new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /contact/thanks",
      "Disallow: /newsletter/thanks",
      "",
      `Sitemap: ${new URL("/sitemap-index.xml", site.url).toString()}`,
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
