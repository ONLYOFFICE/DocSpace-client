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

test.describe("Recent", () => {
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

  test("should handle empty recent files list", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.recentEmpty]);

    await page.goto("/recent/filter?folder=28934");

    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();
    await expect(page).toHaveScreenshot([
      "desktop",
      "recent",
      "recent-empty.png",
    ]);
  });

  test("should handle recent files list", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.recent]);

    await page.goto("/recent/filter?folder=28934");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const title = table.locator(".table-list-item a").first();

    await expect(title).toBeVisible();
    await expect(title).toHaveText("Spreadsheet via link");

    await expect(page).toHaveScreenshot(["desktop", "recent", "recent.png"]);
  });

  test("should context menu for recent file via link", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.recent]);

    await page.goto("/recent/filter?folder=28934");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-0"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expect(page).toHaveScreenshot([
      "desktop",
      "recent",
      "recent-file-via-link-context-menu.png",
    ]);
  });

  test("should context menu for recent file from room", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.recent]);

    await page.goto("/recent/filter?folder=28934");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-1"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expect(page).toHaveScreenshot([
      "desktop",
      "recent",
      "recent-file-from-room-context-menu.png",
    ]);
  });

  test("should context menu for recent file shared with me", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.recent]);

    await page.goto("/recent/filter?folder=28934");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-2"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expect(page).toHaveScreenshot([
      "desktop",
      "recent",
      "recent-file-shared-with-me-context-menu.png",
    ]);
  });

  test("should context menu for recent archive", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.recent]);

    await page.goto("/recent/filter?folder=28934");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-3"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expect(page).toHaveScreenshot([
      "desktop",
      "recent",
      "recent-archive-context-menu.png",
    ]);
  });

  test("should context menu for recent image", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.recent]);

    await page.goto("/recent/filter?folder=28934");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-4"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expect(page).toHaveScreenshot([
      "desktop",
      "recent",
      "recent-image-context-menu.png",
    ]);
  });

  test("should context menu for recent file", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.recent]);

    await page.goto("/recent/filter?folder=28934");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const cell = page.locator('[data-testid="recent-cell-name-5"]');
    await cell.locator('[data-testid="link"]').click({ button: "right" });
    await expect(page).toHaveScreenshot([
      "desktop",
      "recent",
      "recent-file-context-menu.png",
    ]);
  });

  test("should remove file from recent", async ({
    page,
    mockRequest,
    wsMock,
  }) => {
    await mockRequest.router([endpoints.recent, endpoints.settingsWithSocket]);
    await wsMock.setupWebSocketMock();
    await page.goto("/recent/filter?folder=28934");

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
