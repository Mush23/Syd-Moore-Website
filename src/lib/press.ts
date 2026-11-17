/**
 * Articles, interviews and coverage. One list, `selectedPress` in
 * src/content/pages/press.md, feeds three places:
 *
 * - the Press page shows all of it, grouped by type;
 * - the About page shows the pieces Syd wrote and her interviews;
 * - a book page shows the entries whose `book` is that book.
 */
import type { CollectionEntry } from "astro:content";

export type PressItem = NonNullable<CollectionEntry<"pages">["data"]["selectedPress"]>[number];
export type PressKind = PressItem["kind"];

/** Display order of the groups, with their headings and icons. */
export const PRESS_GROUPS: { kind: PressKind; heading: string; icon: string }[] = [
  { kind: "by-syd", heading: "Written by Syd", icon: "pen-line" },
  { kind: "interview", heading: "Interviews", icon: "mic" },
  { kind: "feature", heading: "Features and reviews", icon: "newspaper" },
  { kind: "news", heading: "In the news", icon: "megaphone" },
];

/** Items in their groups, keeping the order they have in the file. Empty groups are dropped. */
export function groupPress(items: PressItem[] = [], kinds?: PressKind[]) {
  return PRESS_GROUPS.filter((g) => !kinds || kinds.includes(g.kind))
    .map((g) => ({ ...g, items: items.filter((i) => i.kind === g.kind) }))
    .filter((g) => g.items.length > 0);
}

export function pressForBook(items: PressItem[] = [], bookId: string): PressItem[] {
  return items.filter((i) => i.book === bookId);
}
