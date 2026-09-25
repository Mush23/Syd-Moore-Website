// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://sydmoore.com",
  output: "static",
  // Clean URLs without trailing slashes: /about is served from about.html on Cloudflare Pages.
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "auto" },
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  integrations: [
    sitemap({
      filter: (page) => !/\/(contact|newsletter)\/thanks$/.test(page.replace(/\/$/, "")),
    }),
  ],
});
