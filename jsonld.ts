/** schema.org structured data, generated from content. */
import { site } from "../config/site";
import type { Book, Series } from "./books";
import { isoLondon } from "./dates";
import type { CollectionEntry } from "astro:content";

const abs = (path: string) => new URL(path, site.url).toString();

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Syd Moore",
    jobTitle: "Novelist",
    url: site.url,
    sameAs: site.sameAs,
  };
}

const FORMAT_URI: Record<string, string> = {
  paperback: "https://schema.org/Paperback",
  hardback: "https://schema.org/Hardcover",
  ebook: "https://schema.org/EBook",
  audio: "https://schema.org/AudiobookFormat",
};

export function bookLd(book: Book, series: Series | undefined, imageUrl?: string) {
  const d = book.data;
  const editions = (Object.entries(d.isbn) as [string, string | undefined][])
    .filter(([, isbn]) => Boolean(isbn))
    .map(([format, isbn]) => ({
      "@type": "Book",
      bookFormat: FORMAT_URI[format],
      isbn,
      ...(format === "paperback" || format === "hardback"
        ? { datePublished: d.pubDate.toISOString().slice(0, 10) }
        : {}),
      ...(d.imprint ? { publisher: { "@type": "Organization", name: d.imprint } } : {}),
      ...(format === "audio" && d.narrator ? { readBy: { "@type": "Person", name: d.narrator } } : {}),
    }));

  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: d.title,
    url: abs(`/books/${book.id}`),
    author: { "@type": "Person", name: "Syd Moore", url: abs("/about") },
    description: d.hook,
    inLanguage: "en-GB",
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(series && series.id !== "standalones"
      ? {
          isPartOf: { "@type": "BookSeries", name: series.data.name, url: abs(`/series/${series.id}`) },
          ...(d.seriesNumber ? { position: d.seriesNumber } : {}),
        }
      : {}),
    ...(d.formerTitle ? { alternateName: d.formerTitle } : {}),
    ...(editions.length ? { workExample: editions } : {}),
  };
}

export function eventLd(event: CollectionEntry<"events">) {
  const e = event.data;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    startDate: isoLondon(e.start),
    ...(e.end ? { endDate: isoLondon(e.end) } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: e.venue,
      address: { "@type": "PostalAddress", addressLocality: e.town, addressCountry: "GB" },
    },
    performer: { "@type": "Person", name: "Syd Moore" },
    organizer: { "@type": "Person", name: "Syd Moore", url: site.url },
    ...(e.ticketUrl ? { offers: { "@type": "Offer", url: e.ticketUrl, availability: "https://schema.org/InStock" } } : {}),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: "en-GB",
  };
}
