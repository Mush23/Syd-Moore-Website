import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { allRoutes, books, redirectsFile } from "./helpers";

const DISCLOSURE = "Ad · Some of these links pay Syd a small commission.";

test.describe("every page", () => {
  for (const route of allRoutes) {
    test(`${route} renders, has one h1 and passes axe (WCAG 2.2 AA)`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status(), `status for ${route}`).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/sydmoore\.com/);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }
});

test.describe("book pages", () => {
  for (const book of books) {
    test(`${book.slug}: title, series position and buy panel`, async ({ page }) => {
      await page.goto(`/books/${book.slug}`);
      await expect(page.locator("h1")).toHaveText(book.data.title);
      await expect(page.locator(".series-label").first()).not.toBeEmpty();

      const panel = page.locator("[data-buy-panel]");
      await expect(panel).toBeVisible();

      const links = panel.locator("a[rel~='sponsored']");
      const count = await links.count();
      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute("href");
        expect(href, "no empty retailer links").toMatch(/^https:\/\//);
      }

      if (count > 0) {
        // The disclosure must come before the first retailer button in the page.
        const order = await panel.evaluate((el, text) => {
          const disclosure = [...el.querySelectorAll("p")].find((p) => p.textContent?.includes(text));
          const firstLink = el.querySelector("a[rel~='sponsored']");
          if (!disclosure || !firstLink) return "missing";
          return disclosure.compareDocumentPosition(firstLink) & Node.DOCUMENT_POSITION_FOLLOWING ? "before" : "after";
        }, DISCLOSURE);
        expect(order).toBe("before");
      }
    });

    test(`${book.slug}: valid Book structured data`, async ({ page }) => {
      await page.goto(`/books/${book.slug}`);
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      const data = blocks.map((b) => JSON.parse(b));
      const ld = data.find((d) => d["@type"] === "Book");
      expect(ld, "Book JSON-LD present").toBeTruthy();
      expect(ld["@context"]).toBe("https://schema.org");
      expect(ld.name).toBe(book.data.title);
      expect(ld.author?.name).toBe("Syd Moore");
      for (const ed of ld.workExample ?? []) {
        expect(ed["@type"]).toBe("Book");
        expect(ed.isbn).toMatch(/^97[89]\d{10}$/);
        expect(ed.bookFormat).toMatch(/^https:\/\/schema\.org\//);
      }
    });
  }
});

test("format tabs work from the keyboard", async ({ page }) => {
  await page.goto("/books/the-grand-illusion");
  const tabs = page.locator('[data-buy-panel] [role="tab"]');
  await expect(tabs.first()).toBeVisible();
  const n = await tabs.count();
  expect(n).toBeGreaterThan(1);

  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.first()).toHaveAttribute("aria-selected", "false");

  const panelId = await tabs.nth(1).getAttribute("aria-controls");
  await expect(page.locator(`#${panelId}`)).toBeVisible();

  await page.keyboard.press("Home");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tabs.nth(n - 1)).toHaveAttribute("aria-selected", "true");
});

test("coming-soon books have no buy buttons", async ({ page }) => {
  await page.goto("/books/strange-maven");
  await expect(page.locator("[data-buy-panel] a[rel~='sponsored']")).toHaveCount(0);
  await expect(page.locator("[data-buy-panel]")).toContainText("Coming soon");
});

test("404 page", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("This page has vanished.");
});

test("no broken internal links or images", async ({ page, request }) => {
  const seen = new Set<string>();
  for (const route of allRoutes) {
    await page.goto(route);
    const urls = await page.evaluate(() => [
      ...[...document.querySelectorAll("a[href]")].map((a) => (a as HTMLAnchorElement).href),
      ...[...document.querySelectorAll("img[src]")].map((i) => (i as HTMLImageElement).src),
    ]);
    for (const u of urls) {
      const url = new URL(u);
      if (url.origin !== "http://localhost:4321") continue;
      const key = url.pathname;
      if (seen.has(key)) continue;
      seen.add(key);
      const res = await request.get(key);
      expect(res.status(), `${key} (linked from ${route})`).toBe(200);
    }
  }
});

test("redirect map covers the old site's URLs", () => {
  const expected: [string, string][] = [
    ["/biography", "/about"],
    ["/blog", "/news"],
    ["/essex-witch-museum", "/series/essex-witch-museum-mysteries"],
    ["/syd-moore-strange-magic", "/books/strange-magic"],
    ["/syd-moore-strange-fascination", "/books/strange-fascination"],
    ["/syd-moore-the-drowning-pool", "/books/the-witching-hour"],
    ["/noirwich-the-witching-hour", "/news"],
  ];
  for (const [from, to] of expected) {
    expect(redirectsFile).toMatch(new RegExp(`^${from}\\s+${to}\\s+301$`, "m"));
    expect(redirectsFile).toMatch(new RegExp(`^${from}/\\s+${to}\\s+301$`, "m"));
  }
});
