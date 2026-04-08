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
  sharedWithMeHandler,
  TypeSettings,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_REQUEST_URL = "**/plugins/navigation-sample/plugin.js";

// Personal folder — starting point for all tests.
const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// Target for the Actions.navigate demo item.
const SHARED_WITH_ME_URL = "/shared-with-me/filter?folder=4";

// row-0 = folder, row-1 = .mp4 (video), row-2 = .jpg (image), row-3 = .docx (file)
const ROW_DOCX = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Opens the three-dot context menu for a table row. */
async function openContextMenu(
  page: import("@playwright/test").Page,
  rowIndex: number,
) {
  const table = page.getByTestId("table-body");
  await expect(table).toBeVisible();

  const row = table.getByTestId(`table-row-${rowIndex}`);
  const menuButton = row.getByTestId("context-menu-button").first();
  await expect(menuButton).toBeVisible();
  await menuButton.click();
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe("Navigation Sample Plugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      sharedWithMeHandler(TEST_PORT),
      webPluginsHandler(TEST_PORT, "withNavigationPlugin"),
    );
  });

  // ── 1. Actions.navigate ───────────────────────────────────────────────────────

  test("clicking Navigate routes to Shared-with-me and fires the chained toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openContextMenu(page, ROW_DOCX);

    const navigateItem = page
      .getByTestId("navigation-sample-navigate")
      .first();
    await expect(navigateItem).toBeVisible();
    await navigateItem.click();

    // URL must change to the Shared-with-me section.
    await page.waitForURL(`**${SHARED_WITH_ME_URL}**`);
    expect(page.url()).toContain(SHARED_WITH_ME_URL);

    // The navigate action fires, then the chained showToast executes.
    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("Navigating to Shared with me");
  });

  // ── 2. Actions.openInfoPanel ──────────────────────────────────────────────────

  test("info panel shows Details tab after openInfoPanel with infoPanelTab: info_details", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    // Select the docx row first so the info panel has a file to display.
    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();
    const row = table.getByTestId(`table-row-${ROW_DOCX}`);
    await row.getByTestId("room-icon-image").click();

    await openContextMenu(page, ROW_DOCX);

    const openPanelItem = page
      .getByTestId("navigation-sample-open-panel")
      .first();
    await expect(openPanelItem).toBeVisible();
    await openPanelItem.click();

    // Info panel is open and the Details tab content is active.
    await expect(page.getByTestId("info_panel_aside_header")).toBeVisible();
    await expect(
      page.getByTestId("info_panel_files_view_details"),
    ).toBeVisible();

    await page.mouse.move(0, 0);
  });
});
