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

test.describe("Shared with me", () => {
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

  test("should navigate to shared with me page", async ({
    page,
    mockRequest,
  }) => {
    // Setup mock endpoints for authenticated user and folder data
    await mockRequest.router([endpoints.sharedWithMe]);

    // Navigate to shared with me page
    await page.goto("/shared-with-me/filter?folder=4");

    // Wait for the page to load and table to be visible
    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    // Find the file link with more flexible selector (a tag anywhere within table-list-item)
    const title = table.locator(".table-list-item a").first();

    // Wait for the element to be visible and have text
    await expect(title).toBeVisible();
    await expect(title).toHaveText("share test");
  });

  test("should handle empty shared files list", async ({
    page,
    mockRequest,
  }) => {
    // Create empty mock data
    await mockRequest.router([endpoints.sharedWithMeEmpty]);

    await page.goto("/shared-with-me/filter?folder=4");

    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();

    // Should not have any table list items

    await expect(emptyView).toHaveScreenshot([
      "desktop",
      "shared-with-me",
      "shared-with-me-empty.png",
    ]);
  });

  test("should remove shared file via context menu and display empty state", async ({
    page,
    mockRequest,
    wsMock,
  }) => {
    await mockRequest.router([
      endpoints.sharedWithMe,
      endpoints.settingsWithSocket,
    ]);

    await wsMock.setupWebSocketMock();

    await page.goto("/shared-with-me/filter?folder=4");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const contextMenuButton = table.getByTestId("context-menu-button").first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const removeFromListOption = page.getByTestId(
      "remove-shared-folder-or-file",
    );
    await expect(removeFromListOption).toBeVisible();

    await removeFromListOption.click();

    const deleteDialog = page.getByTestId("delete-dialog");

    const submitButton = deleteDialog.getByTestId("delete_dialog_modal_submit");

    await expect(submitButton).toBeVisible();

    await mockRequest.router([endpoints.shareDelete]);

    submitButton.click();

    const loader = table.getByTestId("loader").first();

    await expect(loader).toBeVisible();

    wsMock.emitModifyFolder({
      cmd: "delete",
      id: 1,
      type: "file",
      data: "",
    });

    await loader.waitFor({ state: "detached" });

    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();

    wsMock.closeConnection();
  });

  test("should remove shared file via header menu and display empty state", async ({
    page,
    mockRequest,
    wsMock,
  }) => {
    await mockRequest.router([
      endpoints.sharedWithMe,
      endpoints.settingsWithSocket,
    ]);

    await wsMock.setupWebSocketMock();

    await page.goto("/shared-with-me/filter?folder=4");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const fileRow = table.locator("#file_1");
    await expect(fileRow).toBeVisible();

    const icon = fileRow.getByTestId("room-icon");

    await icon.click();

    const checkBox = fileRow.getByRole("checkbox");

    await checkBox.check();

    const removeFromListOption = page.locator(
      "#menu-remove-from-shared-with-me",
    );
    await expect(removeFromListOption).toBeVisible();

    await removeFromListOption.click();

    const deleteDialog = page.getByTestId("delete-dialog");

    const submitButton = deleteDialog.getByTestId("delete_dialog_modal_submit");

    await expect(submitButton).toBeVisible();

    await mockRequest.router([endpoints.shareDelete]);

    submitButton.click();

    const loader = table.getByTestId("loader").first();

    await expect(loader).toBeVisible();

    wsMock.emitModifyFolder({
      cmd: "delete",
      id: 1,
      type: "file",
      data: "",
    });

    await loader.waitFor({ state: "detached" });

    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();

    wsMock.closeConnection();
  });

  test("should display 'Shared By' column in shared with me table header", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.sharedWithMe]);

    await page.goto("/shared-with-me/filter?folder=4");

    const table = page.getByTestId("table-header");
    await expect(table).toBeVisible();

    const sharedByColumn = table.getByTestId("column-SharedByShareWithMe");
    await expect(sharedByColumn).toBeVisible();
  });

  test("should hide 'Shared By' column when disabled in table settings", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.sharedWithMe]);

    await page.goto("/shared-with-me/filter?folder=4");

    const tableHeader = page.getByTestId("table-header");
    await expect(tableHeader).toBeVisible();

    const tableSettings = tableHeader.getByTestId("settings-block");
    await expect(tableSettings).toBeVisible();

    tableSettings.click();

    const sharedByOption = page.getByTestId(
      "table_settings_SharedByShareWithMe",
    );

    await expect(sharedByOption).toBeVisible();

    await sharedByOption.uncheck();

    const sharedByColumn = tableHeader.getByTestId(
      "column-SharedByShareWithMe",
    );
    await expect(sharedByColumn).not.toBeVisible();
  });

  test("should display 'Access Level' column in shared with me table header", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.sharedWithMe]);

    await page.goto("/shared-with-me/filter?folder=4");

    const table = page.getByTestId("table-header");
    await expect(table).toBeVisible();

    const accessLevelColumn = table.getByTestId(
      "column-AccessLevelShareWithMe",
    );
    await expect(accessLevelColumn).toBeVisible();
  });

  test("should hide 'Access Level' column when disabled in table settings", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.sharedWithMe]);

    await page.goto("/shared-with-me/filter?folder=4");

    const tableHeader = page.getByTestId("table-header");
    await expect(tableHeader).toBeVisible();

    const tableSettings = tableHeader.getByTestId("settings-block");
    await expect(tableSettings).toBeVisible();

    tableSettings.click();

    const accessLevelOption = page.getByTestId(
      "table_settings_AccessLevelShareWithMe",
    );

    await expect(accessLevelOption).toBeVisible();

    await accessLevelOption.uncheck();

    const accessLevelColumn = tableHeader.getByTestId(
      "column-AccessLevelShareWithMe",
    );
    await expect(accessLevelColumn).not.toBeVisible();
  });
});
