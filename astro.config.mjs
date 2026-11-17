// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import githubPages from "./integrations/github-pages.mjs";
import hostinger from "./integrations/hostinger.mjs";

// Where this build is going. "hostinger" is the live site at sydmoore.com (set by
// .github/workflows/publish-hostinger.yml). Anything else builds the GitHub Pages
// preview copy, which is also what local builds and the tests use.
const target = process.env.DEPLOY_TARGET === "hostinger" ? hostinger() : githubPages();

export default defineConfig({
  site: "https://sydmoore.com",
  output: "static",
  // Clean URLs without trailing slashes: /about is served from about.html.
  trailingSlash: "never",
  // "auto" inlines only small stylesheets. Inlining everything was measured (Nov 2026) and made
  // the first view slower, because the larger page delayed the font downloads.
  build: { format: "file", inlineStylesheets: "auto" },
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  integrations: [
    icon(),
    target,
    sitemap({
      filter: (page) => !/\/(contact|newsletter)\/thanks$/.test(page.replace(/\/$/, "")),
    }),
  ],
});
