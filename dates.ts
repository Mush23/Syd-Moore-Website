/** Date helpers. Everything is shown in UK time and en-GB format ("8 October 2026"). */

export const TZ = "Europe/London";

/** "8 October 2026" */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(date);
}

/** "October 2026" */
export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: TZ }).format(date);
}

/** Offset of Europe/London from UTC, in minutes, at a given instant (0 in winter, 60 in summer). */
function londonOffsetMinutes(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** Parse a UK wall-clock time "YYYY-MM-DDTHH:mm" into the correct instant. */
export function fromLondon(local: string): Date {
  const [d, t] = local.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm] = t.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, day, hh, mm));
  const offset = londonOffsetMinutes(guess);
  return new Date(guess.getTime() - offset * 60000);
}

/** ISO 8601 with the London offset, e.g. 2026-06-27T13:30:00+01:00 (for structured data). */
export function isoLondon(local: string): string {
  const instant = fromLondon(local);
  const off = londonOffsetMinutes(instant);
  const sign = off >= 0 ? "+" : "-";
  const hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, "0");
  const mm = String(Math.abs(off) % 60).padStart(2, "0");
  return `${local}:00${sign}${hh}:${mm}`;
}

/** Parts for an event date block: { day: "27", month: "Jun", weekday: "Sat", time: "1:30pm" } */
export function eventParts(local: string) {
  const at = fromLondon(local);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { ...o, timeZone: TZ }).format(at);
  const time = f({ hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", "").toLowerCase();
  return {
    day: f({ day: "numeric" }),
    month: f({ month: "short" }),
    year: f({ year: "numeric" }),
    weekday: f({ weekday: "long" }),
    full: f({ weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    time,
  };
}

/** Today's date at build time (the daily scheduled rebuild keeps this fresh). */
export function buildNow(): Date {
  return new Date();
}
