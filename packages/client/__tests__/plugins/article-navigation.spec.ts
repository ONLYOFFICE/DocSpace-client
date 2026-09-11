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

import type { Page } from "@playwright/test";

import {
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  selfActivationStatusHandler,
  selfByTypeHandler,
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
const FILES_KEY = "article-navigation-sample-files";
const SETTINGS_KEY = "article-navigation-sample-settings";

// Section pages: `/p/<item key>`, prefixed with the base path of the section
// the item appears in.
const FILES_PAGE_URL = `/p/${FILES_KEY}`;
const SETTINGS_PAGE_URL = `/portal-settings/p/${SETTINGS_KEY}`;

// Nav items are rendered by NavMenu, which exposes the item id as data-item-id.
const navItem = (key: string) => `[data-item-id="plugin-navigation-${key}"]`;

// Page roots and controls, from the ids the sample gives its own elements.
const FILES_PAGE = `#${FILES_KEY}-page`;
const SETTINGS_PAGE = `#${SETTINGS_KEY}-page`;
const TOAST_BUTTON = "#article-navigation-sample-toast-btn";

/** Opens a portal page and waits for the plugin bundle to be served. */
const openWithPlugin = async (page: Page, url: string) => {
  const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
  await page.goto(url);
  await pluginLoaded;
};

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
  //
  // Both items pin themselves to one section, so each sidebar holds exactly one
  // of them. An entry showing up in the wrong section is the mistake a plugin
  // author hits soonest, which is why it is checked first.

  test("Only the files item is shown in the files sidebar", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${PERSONAL_FOLDER_URL}`);

    const filesItem = page.locator(navItem(FILES_KEY));

    await expect(filesItem).toBeVisible();
    await expect(filesItem).toContainText("Sample files");

    // `appears: [Section.Settings]` keeps this one out of the files sidebar.
    await expect(page.locator(navItem(SETTINGS_KEY))).toHaveCount(0);
  });

  test("Only the settings item is shown in the portal settings sidebar", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${PORTAL_SETTINGS_URL}`);

    const settingsItem = page.locator(navItem(SETTINGS_KEY));

    await expect(settingsItem).toBeVisible();
    await expect(settingsItem).toContainText("Sample settings");

    await expect(page.locator(navItem(FILES_KEY))).toHaveCount(0);
  });

  test("A room admin does not get the admin-only settings item", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "roomAdmin"));

    await openWithPlugin(page, `${baseUrl}${PERSONAL_FOLDER_URL}`);

    // The files item declares no `usersTypes`, so it survives any role.
    await expect(page.locator(navItem(FILES_KEY))).toBeVisible();

    // `usersTypes: [owner, fullAdmin]` keeps the settings item out of the
    // store altogether, so the settings sidebar has nothing to render either.
    await page.goto(`${baseUrl}${PORTAL_SETTINGS_URL}`);
    await expect(page.locator(navItem(SETTINGS_KEY))).toHaveCount(0);
  });

  // ── 2. Opening a section page ────────────────────────────────────────────────

  test("Clicking the files item opens its plugin page", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${PERSONAL_FOLDER_URL}`);

    await page.locator(navItem(FILES_KEY)).click();

    await page.waitForURL(`**${FILES_PAGE_URL}`);

    const pageRoot = page.locator(FILES_PAGE);
    await expect(pageRoot).toBeVisible();
    await expect(
      pageRoot.getByRole("heading", { name: "Sample files page" }),
    ).toBeVisible();

    // The component reads the signed-in profile through `useCurrentUser`, so
    // the mocked owner's display name has to reach the plugin.
    await expect(pageRoot).toContainText("Administrator");

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-article-navigation",
      "article-navigation_files-page.png",
    ]);
  });

  test("Opening the plugin page by URL renders the component", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${FILES_PAGE_URL}`);

    await expect(page.locator(FILES_PAGE)).toBeVisible();
    expect(page.url()).toContain(FILES_PAGE_URL);
  });

  test("The open item is marked active in the sidebar", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${FILES_PAGE_URL}`);

    await expect(page.locator(FILES_PAGE)).toBeVisible();

    const filesItem = page.locator(navItem(FILES_KEY));
    await expect(filesItem).toBeVisible();
    await expect(filesItem).toHaveClass(/active/);
  });

  // ── 3. Section layout ────────────────────────────────────────────────────────
  //
  // The page pads itself by 20px inside a full-width section body, so a wrong
  // box model shows up here as a horizontal scrollbar rather than as something
  // a screenshot would catch.

  test("The plugin page does not overflow the section body horizontally", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${FILES_PAGE_URL}`);

    const pageRoot = page.locator(FILES_PAGE);
    await expect(pageRoot).toBeVisible();

    const overflow = await pageRoot.evaluate((root) => {
      const content = root.closest(".section-wrapper-content");

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
    await openWithPlugin(page, `${baseUrl}${PORTAL_SETTINGS_URL}`);

    await page.locator(navItem(SETTINGS_KEY)).click();

    await page.waitForURL(`**${SETTINGS_PAGE_URL}`);

    const pageRoot = page.locator(SETTINGS_PAGE);
    await expect(pageRoot).toBeVisible();
    await expect(
      pageRoot.getByRole("heading", { name: "Sample settings page" }),
    ).toBeVisible();

    await expect(pageRoot.getByTestId("toggle-button-input")).not.toBeChecked();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-article-navigation",
      "article-navigation_settings-page.png",
    ]);
  });

  // ── 5. Actions from the rendered component ───────────────────────────────────

  test("The files page button fires a success toast", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${FILES_PAGE_URL}`);

    const button = page.locator(TOAST_BUTTON);
    await expect(button).toBeVisible();
    await button.click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("Hello, Administrator");
  });

  test("The settings toggle flips and reports both states through a toast", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}${SETTINGS_PAGE_URL}`);

    const pageRoot = page.locator(SETTINGS_PAGE);
    // The kit's toggle wrapper collapses to 0x0 — its label is absolutely
    // positioned — so the label is the element that can actually be clicked.
    const toggle = pageRoot.getByTestId("toggle-button-container");
    const toggleInput = toggle.getByTestId("toggle-button-input");

    await expect(toggleInput).not.toBeChecked();

    await toggle.click();

    await expect(toggleInput).toBeChecked();

    const toast = page.getByTestId("toast-content").first();
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "info");
    await expect(toast).toContainText("Sample feature on");

    await toggle.click();

    await expect(toggleInput).not.toBeChecked();
    await expect(page.getByText("Sample feature off")).toBeVisible();
  });

  // ── 6. Route guards ──────────────────────────────────────────────────────────

  test("An unknown item key is redirected away from the plugin route", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}/p/unknown-plugin-item`);

    await page.waitForURL((url) => !url.pathname.startsWith("/p/"));
  });

  test("An item is not reachable from a section it does not appear in", async ({
    page,
    baseUrl,
  }) => {
    await openWithPlugin(page, `${baseUrl}/p/${SETTINGS_KEY}`);

    // The item is limited to Settings, so the files route must not open it.
    await page.waitForURL((url) => !url.pathname.startsWith("/p/"));
    await expect(page.locator(SETTINGS_PAGE)).toHaveCount(0);
  });
});

