/**
 * Site-wide settings. Values that differ per environment (IDs, keys) come from
 * PUBLIC_* environment variables set in Cloudflare Pages — see docs/DEPLOY.md.
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

  /** The lead "buy local" shop. Book pages link to it when a readOnSea URL is set. */
  localShop: { name: "Read on Sea", town: "Leigh-on-Sea", url: "https://readonsea.co.uk/" },

  /** Only accounts confirmed in the brief. Add X and Instagram once Syd confirms them. */
  social: [
    { label: "Bluesky", url: "https://bsky.app/profile/sydmoore.bsky.social" },
    { label: "Facebook", url: "https://www.facebook.com/SydMooreWriter" },
  ],

  /** Profiles used in Person structured data. */
  sameAs: [
    "https://en.wikipedia.org/wiki/Syd_Moore",
    "https://www.goodreads.com/author/show/5008398.Syd_Moore",
    "https://bsky.app/profile/sydmoore.bsky.social",
    "https://www.marjacq.com/syd-moore",
  ],

  nav: [
    { label: "Books", href: "/books" },
    { label: "About", href: "/about" },
    { label: "Essex Girls & Witches", href: "/essex-girls-and-witches" },
    { label: "Events", href: "/events" },
    { label: "Press", href: "/press" },
  ],

  disclosure:
    "Ad · Some of these links pay Syd a small commission. Buying local helps Essex bookshops most.",
  amazonStatement: "As an Amazon Associate, Syd Moore earns from qualifying purchases.",
} as const;
