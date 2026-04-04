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

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_REQUEST_URL = "**/plugins/modal-dialog-sample/plugin.js";
const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Opens the profile-avatar dropdown. */
async function openProfileMenu(
  page: import("@playwright/test").Page,
): Promise<void> {
  const btn = page.getByTestId("profile_user_icon_button");
  await expect(btn).toBeVisible();
  await btn.click();
}

/** Opens the profile menu and clicks the plugin item. */
async function clickAboutItem(
  page: import("@playwright/test").Page,
): Promise<void> {
  await openProfileMenu(page);
  await page.getByTestId("modal-dialog-sample-about").click();
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe("Modal Dialog Sample Plugin — IModalDialog via profile menu", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withModalDialogPlugin"),
    );
  });

  // ── 1. Profile menu item is registered ────────────────────────────────────

  test('"About Plugin" item is visible in the profile menu', async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openProfileMenu(page);

    const profileMenuItem = page.getByTestId("modal-dialog-sample-about");

    await expect(profileMenuItem).toBeVisible();
  });

  // ── 2. Clicking the item opens the modal ──────────────────────────────────

  test("Clicking the item opens the modal dialog", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickAboutItem(page);

    await expect(page.getByTestId("modal-dialog")).toBeVisible();
  });

  // ── 3. Modal header contains the correct title ────────────────────────────

  test("Modal dialog header shows the correct title", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickAboutItem(page);

    await expect(page.locator(".modal-header")).toContainText(
      "About Modal Dialog Sample",
    );
  });

  // ── 4. Modal body contains the description text ───────────────────────────

  test("Modal body renders the plugin description text", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickAboutItem(page);

    const dialog = page.getByTestId("modal-dialog");
    await expect(dialog).toContainText("This plugin demonstrates IModalDialog");
  });

  // ── 5. Footer "Close" button is rendered ──────────────────────────────────

  test("Modal footer contains the Close button", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickAboutItem(page);

    const closeButton = page.getByRole("button", { name: "Close" });

    await expect(closeButton).toBeVisible();
  });

  // ── 6. "Close" button dismisses the dialog ────────────────────────────────

  test("Clicking the Close button dismisses the modal", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickAboutItem(page);

    await expect(page.getByTestId("modal-dialog")).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();

    await expect(page.getByTestId("modal-dialog")).not.toBeVisible();
  });

  // ── 7. × button (onClose) dismisses the dialog ───────────────────────────

  test("Clicking the × button dismisses the modal via onClose", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickAboutItem(page);

    await expect(page.getByTestId("modal-dialog")).toBeVisible();

    // The × close button inside the modal header.
    await page.getByTestId("aside_header_close_icon_button").click();

    await expect(page.getByTestId("modal-dialog")).not.toBeVisible();
  });
});

