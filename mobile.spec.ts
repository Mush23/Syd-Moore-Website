import { test, expect } from "@playwright/test";

test.describe("phone layout", () => {
  test("sticky buy bar opens a bottom sheet that traps focus and closes with Esc", async ({ page }) => {
    await page.goto("/books/the-grand-illusion");
    const bar = page.locator("[data-buy-bar]");
    const opener = bar.locator("[data-buy-open]");

    // Scroll the in-page buy panel out of view so the bar slides in.
    await page.locator("#order-heading").scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute("data-visible", "true");

    await opener.click();
    const sheet = page.locator("[data-buy-sheet]");
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveJSProperty("open", true);

    // Focus stays inside the modal dialog.
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => !!document.activeElement?.closest("[data-buy-sheet]"));
      expect(inside).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("menu button opens and closes the navigation", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator(".menu-toggle");
    await expect(toggle).toBeVisible();
    await expect(page.locator("#site-nav")).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#site-nav")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  });

  test("no horizontal scroll on key pages", async ({ page }) => {
    for (const route of ["/", "/books", "/books/the-final-act-of-daphne-devine", "/series/section-w", "/events"]) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, route).toBeLessThanOrEqual(0);
    }
  });
});
