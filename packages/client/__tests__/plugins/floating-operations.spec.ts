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

const PLUGIN_REQUEST_URL = "**/plugins/floating-operations/plugin.js";
const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Opens the context menu of a table row by clicking its three-dot button.
 * rowIndex 2 is a .jpg image (FilesType.file — upload item is visible).
 * rowIndex 3 is a .docx file (FilesType.file — upload item is visible).
 */
async function openContextMenu(
  page: import("@playwright/test").Page,
  rowIndex: number,
): Promise<void> {
  const table = page.getByTestId("table-body");
  await expect(table).toBeVisible();

  const row = table.getByTestId(`table-row-${rowIndex}`);
  const menuButton = row.getByTestId("context-menu-button").first();
  await expect(menuButton).toBeVisible();
  await menuButton.click();
}

/** Opens the context menu and clicks the plugin upload item. */
async function clickUploadItem(
  page: import("@playwright/test").Page,
  rowIndex = 3,
): Promise<void> {
  await openContextMenu(page, rowIndex);
  await page.getByTestId("floating-operations-upload").first().click();
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe("Floating Operations Plugin — IFloatingOperationsButton via context menu", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withFloatingOperationsPlugin"),
    );
  });

  // ── 1. Context menu item is registered ────────────────────────────────────

  test('"Upload with progress" item is visible in the file context menu', async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openContextMenu(page, 3);

    const uploadItem = page.getByTestId("floating-operations-upload").first();
    await expect(uploadItem).toBeVisible();
  });

  // ── 2. Clicking the item shows the floating button ────────────────────────

  test("Clicking the item shows the floating operations button", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickUploadItem(page);

    const floatingButton = page.getByTestId("floating-button");
    await expect(floatingButton).toBeVisible();
  });

  // ── 3. Floating button shows progress (not yet completed) ─────────────────

  test("Floating button shows an in-progress state immediately after start", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickUploadItem(page);

    const floatingButton = page.getByTestId("floating-button");
    await expect(floatingButton).toBeVisible();

    // The progress element is rendered while the operation is ongoing.
    const progress = page.getByTestId("floating-button-progress");
    await expect(progress).toBeVisible();
  });

  // ── 4. Floating button reaches completed state ─────────────────────────────
  //
  // The plugin increments by 10 % every 200 ms → completion in ~2 s.
  // Playwright's default timeout is 30 s, so this is well within limits.

  test("Floating button shows the completed state after all operations finish", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickUploadItem(page);

    const floatingButton = page.getByTestId("floating-button");
    await expect(floatingButton).toBeVisible();

    // Wait for operationsCompleted to flip — the alert div switches to a
    // "completed" tick icon. Allow up to 10 s for the animation to settle.
    const alert = page.getByTestId("floating-button-alert");
    await expect(alert).toBeVisible({ timeout: 10_000 });
  });

  // ── 5. Cancel button dismisses the floating button ────────────────────────

  test("Clicking the cancel button removes the floating operations button", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickUploadItem(page);

    const floatingButton = page.getByTestId("floating-button");
    await expect(floatingButton).toBeVisible();

    // The cancel (x) icon is only visible on hover over the floating button.
    await floatingButton.hover();

    const cancelIcon = page.getByTestId("floating-button-close-icon");
    await expect(cancelIcon).toBeVisible();
    await cancelIcon.click();

    await expect(floatingButton).not.toBeVisible();
  });
});
