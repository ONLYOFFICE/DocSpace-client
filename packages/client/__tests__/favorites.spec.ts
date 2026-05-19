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
  favoritesHandler,
  myDocumentsHandler,
  rootHandler,
  settingsHandler,
  TypeSettings,
  addFileToFavoritesHandler,
  deleteFavoritesHandler,
  getFileHandler,
  getFileInfoHandler,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

test.describe("Favorites", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("should navigate to favorites page", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(rootHandler(TEST_PORT), favoritesHandler(TEST_PORT));

    await page.goto(`${baseUrl}/files/favorite/filter?folder=1`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const title = table.locator(".table-list-item a").first();

    await expect(title).toBeVisible();
    await expect(title).toHaveText("New document");

    await expectScreenshot(page, ["desktop", "favorites", "favorites.png"]);
  });

  test("should handle empty favorites list", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      favoritesHandler(TEST_PORT, "empty"),
    );

    await page.goto(`${baseUrl}/files/favorite/filter?folder=1`);

    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "favorites",
      "favorites-empty.png",
    ]);
  });

  test("should remove file from favorites", async ({
    page,
    mockRequest,
    wsMock,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
      rootHandler(TEST_PORT),
      favoritesHandler(TEST_PORT),
    );
    await wsMock.setupWebSocketMock();

    await page.goto(`${baseUrl}/files/favorite/filter?folder=1`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const title = table.locator(".table-list-item a").first();

    await expect(title).toBeVisible();
    await expect(title).toHaveText("New document");

    await title.click({ button: "right" });

    const removeFromFavorites = page.getByTestId("remove-from-favorites");
    await expect(removeFromFavorites).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "favorites",
      "favorites-context-menu.png",
    ]);

    mockRequest.use(
      deleteFavoritesHandler(TEST_PORT),
      getFileHandler(TEST_PORT),
    );

    await removeFromFavorites.click();

    wsMock.emitModifyFolder({
      cmd: "delete",
      id: 1,
      type: "file",
      data: "",
    });

    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();

    wsMock.closeConnection();
  });

  test("should context menu for favorite folder", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      favoritesHandler(TEST_PORT, "success_many"),
    );

    await page.goto(`${baseUrl}/files/favorite/filter?folder=1`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="favorites-cell-name-0"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expectScreenshot(page, [
      "desktop",
      "favorites",
      "favorites-folder-context-menu.png",
    ]);
  });

  test("should context menu for favorite file via link", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      favoritesHandler(TEST_PORT, "success_many"),
    );

    await page.goto(`${baseUrl}/files/favorite/filter?folder=1`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="favorites-cell-name-1"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expectScreenshot(page, [
      "desktop",
      "favorites",
      "favorites-file-via-link-context-menu.png",
    ]);
  });

  test("should context menu for favorite file from room", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      favoritesHandler(TEST_PORT, "success_many"),
    );

    await page.goto(`${baseUrl}/files/favorite/filter?folder=1`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="favorites-cell-name-2"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expectScreenshot(page, [
      "desktop",
      "favorites",
      "favorites-file-from-room-context-menu.png",
    ]);
  });

  test("should context menu for favorite shared file", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      favoritesHandler(TEST_PORT, "success_many"),
    );

    await page.goto(`${baseUrl}/files/favorite/filter?folder=1`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="favorites-cell-name-3"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expectScreenshot(page, [
      "desktop",
      "favorites",
      "favorites-file-shared-context-menu.png",
    ]);
  });

  test("should context menu for favorite archive", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      favoritesHandler(TEST_PORT, "success_many"),
    );

    await page.goto(`${baseUrl}/files/favorite/filter?folder=1`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="favorites-cell-name-4"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expectScreenshot(page, [
      "desktop",
      "favorites",
      "favorites-archive-context-menu.png",
    ]);
  });

  test("should context menu for favorite image", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      favoritesHandler(TEST_PORT, "success_many"),
    );

    await page.goto(`${baseUrl}/files/favorite/filter?folder=1`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="favorites-cell-name-5"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await page.addStyleTag({
      content: `
        .react-tooltip {
          display: none !important;
        }
      `,
    });
    await expectScreenshot(page, [
      "desktop",
      "favorites",
      "favorites-image-context-menu.png",
    ]);
  });

  test("should add file from my documents to favorites", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(rootHandler(TEST_PORT), myDocumentsHandler(TEST_PORT));

    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const title = table.locator(".table-list-item a").first();
    await expect(title).toBeVisible();
    await expect(title).toHaveText("Test document");

    await title.click({ button: "right" });

    const markAsFavorite = page.getByTestId("mark-as-favorite");
    await expect(markAsFavorite).toBeVisible();

    mockRequest.use(
      addFileToFavoritesHandler(TEST_PORT),
      getFileInfoHandler(TEST_PORT),
    );

    await markAsFavorite.click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
  });
});
