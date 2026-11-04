/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  filesSettingsHandler,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import type { Page } from "@playwright/test";
import { expect, test, TEST_PORT } from "./fixtures/base";

const routeTestPlugin = async (page: Page) => {
  await page.route(/\/plugins\/test-plugin-one\/assets\//, (route) => {
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="2" fill="#657077"/></svg>',
    });
  });

  await page.route("**/plugins/test-plugin-one/plugin.js", (route) => {
    route.fulfill({
      contentType: "text/javascript",
      body: `
        window.Plugins = window.Plugins || {};
        window.Plugins.Testpluginone = {
          getContextMenuItems: function () {
            return new Map([
              [
                "plugin-test-action",
                {
                  key: "plugin-test-action",
                  label: "Test Plugin Action",
                  icon: "plugin-icon.png",
                  fileType: ["file"],
                  onItemClick: async function (id) {},
                },
              ],
            ]);
          },
        };
      `,
    });
  });

  return {
    loaded: page.waitForResponse("**/plugins/test-plugin-one/plugin.js"),
  };
};

const openDocxInfoPanelMenu = async (page: Page) => {
  await page
    .getByTestId("table-body")
    .getByTestId("table-row-3")
    .getByTestId("context-menu-button")
    .first()
    .click();

  await page.getByTestId("option_info").hover();
  await page.getByTestId("option_show-info").click();

  const infoOptions = page.locator("#info-options");
  await expect(infoOptions).toBeVisible();
  await infoOptions.click();

  await page.getByTestId("option_info").filter({ visible: true }).hover();
  await expect(
    page
      .getByTestId("option_show-version-history")
      .filter({ visible: true }),
  ).toBeVisible();
};

test.describe("My documents context menu", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
    );
  });

  test("Folder menu", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-0");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const shareMenu = page.getByTestId("option_share");
    await shareMenu.hover();
    await expect(shareMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_folder-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_folder-move.png",
    ]);
  });

  test("DOCX Document menu", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-3");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const shareMenu = page.getByTestId("option_share");

    await shareMenu.hover();
    await expect(shareMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_docx-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_docx-move.png",
    ]);

    const downloadMenu = page.getByTestId("option_download").first();
    await downloadMenu.hover();
    await expect(downloadMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_docx-download.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_docx-more.png",
    ]);
  });

  test("PPTX Presentation menu", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-4");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const shareMenu = page.getByTestId("option_share");

    await shareMenu.hover();
    await expect(shareMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_pptx-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_pptx-move.png",
    ]);

    const downloadMenu = page.getByTestId("option_download").first();
    await downloadMenu.hover();
    await expect(downloadMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_pptx-download.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_pptx-more.png",
    ]);
  });

  test("XLSX Spreadsheet menu", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-6");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const shareMenu = page.getByTestId("option_share");

    await shareMenu.hover();
    await expect(shareMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_xlsx-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_xlsx-move.png",
    ]);

    const downloadMenu = page.getByTestId("option_download").first();
    await downloadMenu.hover();
    await expect(downloadMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_xlsx-download.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_xlsx-more.png",
    ]);
  });

  test("PDF Form menu", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-5");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const shareMenu = page.getByTestId("option_share");

    await shareMenu.hover();
    await expect(shareMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_pdf-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_pdf-move.png",
    ]);

    const downloadMenu = page.getByTestId("option_download").first();
    await downloadMenu.hover();
    await expect(downloadMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_pdf-download.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_pdf-more.png",
    ]);
  });

  test("Image menu", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-2");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const shareMenu = page.getByTestId("option_share");

    await shareMenu.hover();
    await expect(shareMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_image-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_image-move.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_image-more.png",
    ]);
  });

  test("Media menu", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-1");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const shareMenu = page.getByTestId("option_share");

    await shareMenu.hover();
    await expect(shareMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_media-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_media-move.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_media-more.png",
    ]);
  });

  test("DOCX Document menu with plugin in More options", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      webPluginsHandler(TEST_PORT, "withData"),
    );

    const plugin = await routeTestPlugin(page);

    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    await plugin.loaded;

    const folderItem = table.getByTestId("table-row-3");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "files-context-menu_docx-plugin-more.png",
    ]);
  });

  test("DOCX Document menu in the info panel", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    await openDocxInfoPanelMenu(page);

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "info-panel-context-menu_docx-more.png",
    ]);
  });

  test("DOCX Document menu in the info panel with plugin in More options", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      webPluginsHandler(TEST_PORT, "withData"),
    );

    const plugin = await routeTestPlugin(page);

    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);
    await expect(page.getByTestId("table-body")).toBeVisible();
    await plugin.loaded;

    await openDocxInfoPanelMenu(page);

    await expect(
      page.getByText("Test Plugin Action").filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page.getByTestId("option_more-options").filter({ visible: true }),
    ).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "context-menu",
      "info-panel-context-menu_docx-plugin-more.png",
    ]);
  });
});
