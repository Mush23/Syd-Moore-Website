/** "Add to calendar" files. Times are written in Europe/London with a VTIMEZONE block. */
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { site } from "../../config/site";

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await getCollection("events", ({ data }) => !data.draft);
  return events.map((event) => ({ params: { slug: event.id }, props: { event } }));
};

const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const local = (s: string) => s.replace(/[-:]/g, "") + "00"; // 2026-06-27T13:30 -> 20260627T133000

/** Fold lines longer than 75 octets, as RFC 5545 requires. */
const fold = (line: string) => line.match(/.{1,74}/g)!.join("\r\n ");

export const GET: APIRoute = ({ props }) => {
  const { event } = props as { event: CollectionEntry<"events"> };
  const e = event.data;
  const end = e.end ?? (() => {
    // Default to one hour when no end time is given.
    const [d, t] = e.start.split("T");
    const [h, m] = t.split(":").map(Number);
    return `${d}T${String(Math.min(h + 1, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  })();
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//sydmoore.com//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/London",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0000",
    "TZOFFSETTO:+0100",
    "TZNAME:BST",
    "DTSTART:19700329T010000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0000",
    "TZNAME:GMT",
    "DTSTART:19701025T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${event.id}@sydmoore.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/London:${local(e.start)}`,
    `DTEND;TZID=Europe/London:${local(end)}`,
    `SUMMARY:${icsText(e.title)}`,
    `LOCATION:${icsText(`${e.venue}, ${e.town}`)}`,
    `URL:${e.ticketUrl || new URL("/events", site.url).toString()}`,
    `DESCRIPTION:${icsText(e.ticketUrl ? `Tickets: ${e.ticketUrl}` : "Syd Moore event")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].map(fold);

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
};
