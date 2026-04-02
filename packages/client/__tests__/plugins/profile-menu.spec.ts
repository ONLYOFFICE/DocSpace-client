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

const PLUGIN_REQUEST_URL = "**/plugins/profile-menu/plugin.js";

// Personal folder — app is fully authenticated here.
const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Click the profile avatar to open the profile dropdown menu. */
async function openProfileMenu(
  page: import("@playwright/test").Page,
): Promise<void> {
  const profileIconButton = page.getByTestId("profile_user_icon_button");
  await expect(profileIconButton).toBeVisible();
  await profileIconButton.click();
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe("Profile Menu Sample Plugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withProfileMenuPlugin"),
    );
  });

  // ── 1. Items visible ─────────────────────────────────────────────────────────

  test("Profile menu plugin items are visible after opening the menu", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openProfileMenu(page);

    const accountInfoItem = page.locator("#profile-menu-sample-account-info");
    const quickHelpItem = page.locator("#profile-menu-sample-quick-help");

    await expect(accountInfoItem).toBeVisible();
    await expect(quickHelpItem).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-profile-menu",
      "profile-menu_items.png",
    ]);
  });

  // ── 2. Account Info item click ────────────────────────────────────────────────

  test("Account Info item fires a success toast", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openProfileMenu(page);

    await page.locator("#profile-menu-sample-account-info").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("Account info requested!");
  });

  // ── 3. Quick Help item click ──────────────────────────────────────────────────

  test("Quick Help item fires an info toast", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openProfileMenu(page);

    await page.locator("#profile-menu-sample-quick-help").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "info");
    await expect(toast).toContainText("Quick help opened!");
  });
});

