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

const PLUGIN_REQUEST_URL = "**/plugins/create-dialog-sample/plugin.js";

const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";
const DLG = "create_plugin_folder";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Opens the Actions main-button dropdown. */
async function openMainButton(
  page: import("@playwright/test").Page,
): Promise<void> {
  const btn = page.getByTestId("main-button");
  await expect(btn).toBeVisible();
  await btn.click();
}

/**
 * Opens the main-button dropdown → hovers "More" to reveal plugin items →
 * clicks the "Create Plugin Folder" item.
 */
async function clickCreateFolderItem(
  page: import("@playwright/test").Page,
): Promise<void> {
  await openMainButton(page);
  const more = page.getByTestId("more-plugins");
  await expect(more).toBeVisible();
  await more.hover();
  await page.getByTestId("create-dialog-sample-create-folder").click();
}

test.describe("Create Dialog Sample Plugin — ICreateDialog via main button", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withCreateDialogPlugin"),
    );
  });

  // ── 1. Plugin item appears in the "More" submenu ───────────────────────────

  test('"Create Plugin Folder" item is visible in the More submenu', async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openMainButton(page);
    const more = page.getByTestId("more-plugins");
    await expect(more).toBeVisible();
    await more.hover();

    await expect(
      page.getByTestId("create-dialog-sample-create-folder"),
    ).toBeVisible();
  });

  // ── 2. Clicking the item opens the create dialog ───────────────────────────

  test("Clicking the item opens the create dialog with the correct title", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickCreateFolderItem(page);

    const header = page.locator(".modal-header");
    await expect(header).toContainText("Create Plugin Folder");
  });

  // ── 3. The text input is pre-filled with startValue ────────────────────────

  test("Dialog input is pre-filled with the startValue", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickCreateFolderItem(page);

    const input = page.getByTestId(`${DLG}_text_input`);
    await expect(input).toBeVisible();
    await expect(input).toHaveValue("My Plugin Folder");
  });

  // ── 4. The combobox is rendered with the default selection ─────────────────

  test("Dialog combobox is rendered with the default folder-type option", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickCreateFolderItem(page);

    const combobox = page.getByTestId(`${DLG}_combobox`);
    await expect(combobox).toBeVisible();
    await expect(combobox).toContainText("Private Folder");
  });

  // ── 5. Saving with the default name shows a success toast ─────────────────

  test("Clicking Create with the default name shows a success toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickCreateFolderItem(page);

    await page.getByTestId(`${DLG}_save_button`).click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText(
      '"My Plugin Folder" created as Private Folder',
    );
  });

  // ── 6. Changing the name is reflected in the toast ────────────────────────

  test("Typing a custom name shows it in the success toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickCreateFolderItem(page);

    const input = page.getByTestId(`${DLG}_text_input`);
    await input.fill("Design Assets");

    await page.getByTestId(`${DLG}_save_button`).click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText(
      '"Design Assets" created as Private Folder',
    );
  });

  // ── 7. Cancel button closes the dialog ────────────────────────────────────

  test("Clicking Cancel closes the dialog without a toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickCreateFolderItem(page);

    await expect(page.getByTestId(`${DLG}_text_input`)).toBeVisible();

    await page.getByTestId(`${DLG}_cancel_button`).click();

    await expect(page.getByTestId(`${DLG}_text_input`)).not.toBeVisible();
    await expect(page.getByTestId("toast-content")).not.toBeVisible();
  });
});

