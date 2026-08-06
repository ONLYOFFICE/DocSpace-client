// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import {
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_REQUEST_URL = "**/plugins/article-navigation/plugin.js";

const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";
const PORTAL_SETTINGS_URL = "/portal-settings/integration/plugins";

// Item keys declared by the sample plugin.
const OVERVIEW_KEY = "article-navigation-sample-overview";
const SETTINGS_KEY = "article-navigation-sample-settings";

// Nav items are rendered by NavMenu, which exposes the item id as data-item-id.
const navItem = (key: string) => `[data-item-id="plugin-navigation-${key}"]`;

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe("Article Navigation Sample Plugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withArticleNavigationPlugin"),
    );
  });

  // ── 1. `appears` filtering ───────────────────────────────────────────────────

  test("Only the item without `appears` is shown in the files sidebar", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const overview = page.locator(navItem(OVERVIEW_KEY));

    await expect(overview).toBeVisible();
    await expect(overview).toContainText("Sample Overview");

    // `appears: [Section.Settings]` keeps this one out of the files sidebar.
    await expect(page.locator(navItem(SETTINGS_KEY))).toHaveCount(0);

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-article-navigation",
      "article-navigation_files-sidebar.png",
    ]);
  });

  test("Both items are shown in the portal settings sidebar", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PORTAL_SETTINGS_URL}`);
    await pluginLoaded;

    await expect(page.locator(navItem(OVERVIEW_KEY))).toBeVisible();
    await expect(page.locator(navItem(SETTINGS_KEY))).toBeVisible();
  });

  // ── 2. Navigation and the skeleton → content swap ────────────────────────────

  test("Clicking the item opens its plugin page and swaps the skeleton for the loaded section", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await page.locator(navItem(OVERVIEW_KEY)).click();

    // `section` renders first, `onLoad` replaces it once the request resolves.
    await expect(page.locator(`#${OVERVIEW_KEY}-skeleton`)).toBeVisible();

    await page.waitForURL(`**/p/${OVERVIEW_KEY}`);

    const section = page.locator(`#${OVERVIEW_KEY}-section`);
    await expect(section).toBeVisible();
    await expect(page.locator(`#${OVERVIEW_KEY}-skeleton`)).toHaveCount(0);

    await expect(section).toContainText("Article navigation sample");
    await expect(section).toContainText("ArticleNavigation");

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-article-navigation",
      "article-navigation_overview-section.png",
    ]);
  });

  test("Opening the plugin page by URL renders the section", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}/p/${OVERVIEW_KEY}`);
    await pluginLoaded;

    await expect(page.locator(`#${OVERVIEW_KEY}-section`)).toBeVisible();
    expect(page.url()).toContain(`/p/${OVERVIEW_KEY}`);
  });

  test("The open item is marked active in the sidebar", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}/p/${OVERVIEW_KEY}`);
    await pluginLoaded;

    await expect(page.locator(`#${OVERVIEW_KEY}-section`)).toBeVisible();

    const overview = page.locator(navItem(OVERVIEW_KEY));
    await expect(overview).toBeVisible();
    await expect(overview).toHaveClass(/active/);
  });

  // ── 3. Section layout ────────────────────────────────────────────────────────
  //
  // The plugin box combines `widthProp: "100%"` with `paddingProp: "20px"`, which
  // only fits its container while the box is sized as border-box. Without it the
  // section body overflows by the horizontal padding and grows a scrollbar.

  test("The plugin section does not overflow the section body horizontally", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}/p/${OVERVIEW_KEY}`);
    await pluginLoaded;

    const section = page.locator(`#${OVERVIEW_KEY}-section`);
    await expect(section).toBeVisible();

    const overflow = await section.evaluate((box) => {
      const content = box.closest(".section-wrapper-content");

      if (!content) throw new Error("Section body wrapper was not found");

      return {
        scrollWidth: content.scrollWidth,
        clientWidth: content.clientWidth,
      };
    });

    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });

  // ── 4. Navigation from the settings sidebar ──────────────────────────────────

  test("The settings item opens its page inside the portal settings section", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PORTAL_SETTINGS_URL}`);
    await pluginLoaded;

    await page.locator(navItem(SETTINGS_KEY)).click();

    await page.waitForURL(`**/portal-settings/p/${SETTINGS_KEY}`);

    const section = page.locator(`#${SETTINGS_KEY}-section`);
    await expect(section).toBeVisible();
    await expect(section).toContainText("Sample settings");
  });

  // ── 5. Actions from the loaded section ───────────────────────────────────────

  test("The section button fires a success toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}/p/${OVERVIEW_KEY}`);
    await pluginLoaded;

    const button = page.locator(`#${OVERVIEW_KEY}-button button`);
    await expect(button).toBeVisible();
    await button.click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText(
      "Hello from the article navigation sample!",
    );
  });

  // ── 6. Route guards ──────────────────────────────────────────────────────────

  test("An unknown item key is redirected away from the plugin route", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}/p/unknown-plugin-item`);
    await pluginLoaded;

    await page.waitForURL((url) => !url.pathname.startsWith("/p/"));
  });

  test("An item is not reachable from a section it does not appear in", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}/p/${SETTINGS_KEY}`);
    await pluginLoaded;

    // The item is limited to Settings, so the files route must not open it.
    await page.waitForURL((url) => !url.pathname.startsWith("/p/"));
    await expect(page.locator(`#${SETTINGS_KEY}-section`)).toHaveCount(0);
  });
});
