/**
 * Site-wide settings. Values that differ per environment (IDs, keys) come from
 * PUBLIC_* repository variables in GitHub (Settings → Secrets and variables → Actions → Variables) — see docs/DEPLOY.md.
 */
const env = import.meta.env;

export const site = {
  name: "Syd Moore",
  url: "https://sydmoore.com",
  locale: "en-GB",
  title: "Syd Moore · Author of Section W and the Essex Witch Museum Mysteries",
  description:
    "Syd Moore writes witty, spooky mysteries rooted in real Essex history: the Section W wartime thrillers and the Essex Witch Museum Mysteries.",

  newsletter: {
    name: "Strange Tidings",
    /** Paste the form "action" URL from Kit's HTML embed code. Empty = sign-up hidden. */
    kitFormAction: (env.PUBLIC_KIT_FORM_ACTION as string | undefined) ?? "",
  },

  contact: {
    /** Set PUBLIC_CONTACT_FORM=true once Resend and Turnstile are configured. */
    formEnabled: env.PUBLIC_CONTACT_FORM === "true",
    turnstileSiteKey: (env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined) ?? "",
  },

  analytics: {
    /** Cloudflare Web Analytics token (cookieless). Empty = no analytics script. */
    cloudflareToken: (env.PUBLIC_CF_ANALYTICS_TOKEN as string | undefined) ?? "",
  },

  affiliates: {
    /** Amazon Associates UK store ID, e.g. "sydmoore-21". Empty = plain links. */
    amazonTag: (env.PUBLIC_AMAZON_TAG as string | undefined) ?? "",
  },

  /** Syd's social accounts. `icon` is a Simple Icons name (see src/components/Icon.astro). */
  social: [
    { label: "Facebook", url: "https://www.facebook.com/SydMooreWriter/", icon: "simple-icons:facebook" },
    { label: "Instagram", url: "https://www.instagram.com/sydmoorewriter/", icon: "simple-icons:instagram" },
    { label: "X", url: "https://x.com/SydMoore1", icon: "simple-icons:x" },
    { label: "Bluesky", url: "https://bsky.app/profile/sydmoore.bsky.social", icon: "simple-icons:bluesky" },
  ],

  /** Profiles used in Person structured data. */
  sameAs: [
    "https://en.wikipedia.org/wiki/Syd_Moore",
    "https://www.goodreads.com/author/show/5008398.Syd_Moore",
    "https://bsky.app/profile/sydmoore.bsky.social",
    "https://www.marjacq.com/syd-moore",
    "https://www.facebook.com/SydMooreWriter",
    "https://www.instagram.com/sydmoorewriter/",
    "https://x.com/SydMoore1",
  ],

  nav: [
    { label: "Books", href: "/books", icon: "library" },
    { label: "About", href: "/about", icon: "user-round" },
    { label: "Essex Girls & Witches", href: "/essex-girls-and-witches", icon: "flame" },
    { label: "Events", href: "/events", icon: "calendar" },
    { label: "Contact", href: "/contact", icon: "mail" },
  ],

  disclosure:
    "Ad · Some of these links pay Syd a small commission.",
  amazonStatement: "As an Amazon Associate, Syd Moore earns from qualifying purchases.",
} as const;
