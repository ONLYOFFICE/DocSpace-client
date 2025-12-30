// (c) Copyright Ascensio System SIA 2009-2025
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
import { endpoints } from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";

test.describe("My documents context menu", () => {
  test.beforeEach(async ({ mockRequest }) => {
    await mockRequest.router([
      endpoints.aiConfig,
      endpoints.settingsWithQuery,
      endpoints.colorTheme,
      endpoints.build,
      endpoints.capabilities,
      endpoints.selfEmailActivatedClient,
      endpoints.tariff,
      endpoints.quota,
      endpoints.additionalSettings,
      endpoints.getPortal,
      endpoints.companyInfo,
      endpoints.cultures,
      endpoints.root,
      endpoints.invitationSettings,
      endpoints.filesSettings,
      endpoints.webPlugins,

      endpoints.thirdPartyCapabilities,
      endpoints.thirdParty,
      endpoints.docService,
    ]);
  });

  test("Folder menu", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.myDocumentsList]);

    await page.goto("/rooms/personal/filter?folder=12764");

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

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_folder-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_folder-move.png",
    ]);
  });

  test("DOCX Document menu", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.myDocumentsList]);

    await page.goto("/rooms/personal/filter?folder=12764");

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

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_docx-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_docx-move.png",
    ]);

    const downloadMenu = page.getByTestId("option_download").first();
    await downloadMenu.hover();
    await expect(downloadMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_docx-download.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_docx-more.png",
    ]);
  });

  test("PPTX Presentation menu", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.myDocumentsList]);

    await page.goto("/rooms/personal/filter?folder=12764");

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

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_pptx-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_pptx-move.png",
    ]);

    const downloadMenu = page.getByTestId("option_download").first();
    await downloadMenu.hover();
    await expect(downloadMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_pptx-download.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_pptx-more.png",
    ]);
  });

  test("XLSX Spreadsheet menu", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.myDocumentsList]);

    await page.goto("/rooms/personal/filter?folder=12764");

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

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_xlsx-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_xlsx-move.png",
    ]);

    const downloadMenu = page.getByTestId("option_download").first();
    await downloadMenu.hover();
    await expect(downloadMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_xlsx-download.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_xlsx-more.png",
    ]);
  });

  test("PDF Form menu", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.myDocumentsList]);

    await page.goto("/rooms/personal/filter?folder=12764");

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

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_pdf-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_pdf-move.png",
    ]);

    const downloadMenu = page.getByTestId("option_download").first();
    await downloadMenu.hover();
    await expect(downloadMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_pdf-download.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_pdf-more.png",
    ]);
  });

  test("Image menu", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.myDocumentsList]);

    await page.goto("/rooms/personal/filter?folder=12764");

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

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_image-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_image-move.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_image-more.png",
    ]);
  });

  test("Media menu", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.myDocumentsList]);

    await page.goto("/rooms/personal/filter?folder=12764");

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

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_media-share.png",
    ]);

    const moveMenu = page.getByTestId("option_move-or-copy");
    await moveMenu.hover();
    await expect(moveMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_media-move.png",
    ]);

    const moreMenu = page.getByTestId("option_info");
    await moreMenu.hover();
    await expect(moreMenu).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "files-context-menu_media-more.png",
    ]);
  });
});
