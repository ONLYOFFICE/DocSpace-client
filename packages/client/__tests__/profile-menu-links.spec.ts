import type { Page } from "@playwright/test";

import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

// A nested page on purpose: a relative href resolves against it, so a link
// that only works from the root shows up here as a 404 tab.
const START_URL = "/rooms/shared/filter";

const openProfileMenu = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${START_URL}`);

  await page.getByTestId("profile_user_icon_button").click();

  await expect(page.locator(".p-contextmenu-enter-done")).toBeVisible();
};

// Every tab the context opens, by the first URL it commits to. New tabs have
// no MSW behind them and soon bounce to /login, so the committed URL is the
// one the click asked for.
const collectNewTabs = (page: Page) => {
  const urls: Promise<string>[] = [];

  page.context().on("page", (tab) => {
    urls.push(
      tab
        .waitForURL((url) => url.href !== "about:blank", { timeout: 5000 })
        .then(() => new URL(tab.url()).pathname)
        .catch(() => tab.url()),
    );
  });

  return () => Promise.all(urls);
};

test.describe("Profile menu links", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfByTypeHandler(TEST_PORT, "owner"),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
    );
  });

  for (const [item, path] of [
    ["user-menu-profile", "/profile/login"],
    ["user-menu-accounts", "/accounts/people/filter"],
    ["user-menu-settings", "/portal-settings"],
  ] as const) {
    test(`middle-click on ${item} opens one tab at ${path}`, async ({
      page,
      baseUrl,
    }) => {
      await openProfileMenu(page, baseUrl);

      const newTabs = collectNewTabs(page);

      // The item opens the tab itself (onClick on mousedown), and the browser
      // would open the href as well unless the menu cancels auxclick.
      await page.getByTestId(item).locator("a").click({ button: "middle" });

      await expect.poll(async () => (await newTabs()).length).toBe(1);
      // Give a second, late tab the chance to show up before the final count.
      await page.waitForTimeout(1000);

      expect(await newTabs()).toEqual([path]);
      // The current tab stays where it was.
      expect(new URL(page.url()).pathname).toBe(START_URL);
    });
  }
});
