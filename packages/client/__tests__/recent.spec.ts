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
  recentHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

test.describe("Recent", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT),
      recentHandler(TEST_PORT, false),
    );
  });

  test("should handle empty recent files list", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      recentHandler(TEST_PORT, true),
    );

    await page.goto(`${baseUrl}/recent/filter?folder=28934`);

    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();
    await expectScreenshot(page,[
      "desktop",
      "recent",
      "recent-empty.png",
    ]);
  });

  test("should handle recent files list", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/recent/filter?folder=28934`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const title = table.locator(".table-list-item a").first();

    await expect(title).toBeVisible();
    await expect(title).toHaveText("Spreadsheet via link");

    await expectScreenshot(page,["desktop", "recent", "recent.png"]);
  });

  test("should context menu for recent file via link", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/recent/filter?folder=28934`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-0"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expectScreenshot(page,[
      "desktop",
      "recent",
      "recent-file-via-link-context-menu.png",
    ]);
  });

  test("should context menu for recent file from room", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/recent/filter?folder=28934`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-1"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expectScreenshot(page,[
      "desktop",
      "recent",
      "recent-file-from-room-context-menu.png",
    ]);
  });

  test("should context menu for recent file shared with me", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/recent/filter?folder=28934`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-2"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expectScreenshot(page,[
      "desktop",
      "recent",
      "recent-file-shared-with-me-context-menu.png",
    ]);
  });

  test("should context menu for recent archive", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/recent/filter?folder=28934`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-3"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expectScreenshot(page,[
      "desktop",
      "recent",
      "recent-archive-context-menu.png",
    ]);
  });

  test("should context menu for recent image", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/recent/filter?folder=28934`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-4"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expectScreenshot(page,[
      "desktop",
      "recent",
      "recent-image-context-menu.png",
    ]);
  });

  test("should context menu for recent file", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/recent/filter?folder=28934`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-5"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expectScreenshot(page,[
      "desktop",
      "recent",
      "recent-file-context-menu.png",
    ]);
  });

  test("should remove file from recent", async ({
    page,
    mockRequest,
    wsMock,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
    );
    await wsMock.setupWebSocketMock();
    await page.goto(`${baseUrl}/recent/filter?folder=28934`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-0"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    const removeFromRecent = page.getByTestId("remove-from-recent");
    await expect(removeFromRecent).toBeVisible();
    await removeFromRecent.click();

    wsMock.emitModifyFolder({
      cmd: "delete",
      id: 13,
      type: "file",
      data: "",
    });

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();

    wsMock.closeConnection();
  });
});
