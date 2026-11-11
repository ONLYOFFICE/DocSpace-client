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


import type { Locator, Page } from "@playwright/test";

import {
  appsHandler,
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import {
  expectScreenshot,
  type WorkerFixture,
} from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The Rooms app switched off in Settings -> Apps (standalone only). The
 * server keeps granting `CreateRoomFrom` on files and folders, so nothing in
 * Files may lead into a room: one created there is hidden with its section,
 * and the file moved into it is lost to the user.
 *
 * - Bug 84823: "Create room" in the file, folder, selection and group menus.
 * - Bug 84825: Rooms, and its "New room", in the Move to / Copy selector.
 *
 * Every test also runs with the app on, so a missing entry is told apart
 * from a locator that matches nothing.
 */

const MY_DOCUMENTS_URL = "/rooms/personal/filter?folder=12764";

const FOLDER_ROW = "table-row-0";
const DOCX_ROW = "table-row-3";
const PPTX_ROW = "table-row-4";

type TRoomsApp = "on" | "off";

const ROOMS_APP: TRoomsApp[] = ["on", "off"];

const openMyDocuments = async (
  page: Page,
  baseUrl: string,
  mockRequest: WorkerFixture,
  disabled: string[] = [],
) => {
  mockRequest.use(appsHandler(TEST_PORT, { disabled }));

  // Until the list arrives the client takes every app for installed, so a
  // menu opened earlier would offer rooms whatever the switch says.
  const appsLoaded = page.waitForResponse(
    (res) => new URL(res.url()).pathname.endsWith("/api/2.0/apps"),
  );

  await page.goto(`${baseUrl}${MY_DOCUMENTS_URL}`);
  await appsLoaded;

  const table = page.getByTestId("table-body");
  await expect(table).toBeVisible();

  // The sidebar reads the same list, so it shows the list has been applied.
  const sidebar = page.locator("nav");
  await expect(sidebar.getByText("Rooms", { exact: true })).toHaveCount(
    disabled.includes("ai-rooms") ? 0 : 1,
  );
  await expect(sidebar.getByText("Forms", { exact: true })).toHaveCount(
    disabled.includes("ai-forms") ? 0 : 1,
  );

  return table;
};

const roomsApp = (app: TRoomsApp) => (app === "off" ? ["ai-rooms"] : []);

const openRowMenu = async (table: Locator, rowTestId: string) => {
  await table
    .getByTestId(rowTestId)
    .getByTestId("context-menu-button")
    .first()
    .click();
};

const openShareSubmenu = async (page: Page) => {
  const share = page.getByTestId("option_share");
  await share.hover();
  await expect(page.locator("#option_copy-shared-link")).toBeVisible();
};

// The checkbox shows in place of the item icon while its cell is hovered.
const selectRow = async (table: Locator, rowTestId: string) => {
  const row = table.getByTestId(rowTestId);
  await row.locator('[data-testid^="files-cell-checkbox-"]').hover();
  await row.getByTestId("checkbox").first().click();
};

const selector = (page: Page) => page.getByTestId("aside").first();

const selectorItem = (page: Page, title: string | RegExp) =>
  selector(page)
    .locator('[data-testid^="selector-item-"]')
    .filter({ hasText: title });

/** Opens Move to / Copy on a row and goes up to the selector's root. */
const openSelectorRoot = async (
  page: Page,
  table: Locator,
  action: "move" | "copy",
) => {
  await openRowMenu(table, DOCX_ROW);
  await page.getByTestId("option_move-or-copy").hover();
  await page.getByTestId(`option_${action}-to`).click();

  const picker = selector(page);
  await expect(picker).toBeVisible();
  await picker.getByText("Apps", { exact: true }).first().click();

  // My documents is always on offer: the root has loaded once it shows.
  await expect(selectorItem(page, /^Files$/)).toBeVisible();
};

test.describe("Rooms app off: Create room in Files (bug 84823)", () => {
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

  for (const app of ROOMS_APP) {
    const off = app === "off";

    test(`File menu with the Rooms app ${app}`, async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      const table = await openMyDocuments(
        page,
        baseUrl,
        mockRequest,
        roomsApp(app),
      );

      await openRowMenu(table, DOCX_ROW);
      await openShareSubmenu(page);

      await expect(page.locator("#option_create_room")).toHaveCount(
        off ? 0 : 1,
      );

      if (off) {
        await expectScreenshot(page, [
          "desktop",
          "rooms-app-off",
          "rooms-app-off_docx-share.png",
        ]);
      }
    });

    test(`Folder menu with the Rooms app ${app}`, async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      const table = await openMyDocuments(
        page,
        baseUrl,
        mockRequest,
        roomsApp(app),
      );

      await openRowMenu(table, FOLDER_ROW);
      await openShareSubmenu(page);

      await expect(page.locator("#option_create_room")).toHaveCount(
        off ? 0 : 1,
      );

      if (off) {
        await expectScreenshot(page, [
          "desktop",
          "rooms-app-off",
          "rooms-app-off_folder-share.png",
        ]);
      }
    });

    test(`Selection header with the Rooms app ${app}`, async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      const table = await openMyDocuments(
        page,
        baseUrl,
        mockRequest,
        roomsApp(app),
      );

      await selectRow(table, DOCX_ROW);
      await selectRow(table, PPTX_ROW);
      await expect(page.locator("#menu-download")).toBeVisible();

      await expect(page.locator("#menu-create-room")).toHaveCount(
        off ? 0 : 1,
      );

      if (off) {
        await expectScreenshot(page, [
          "desktop",
          "rooms-app-off",
          "rooms-app-off_selection-header.png",
        ]);
      }
    });

    test(`Group menu with the Rooms app ${app}`, async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      const table = await openMyDocuments(
        page,
        baseUrl,
        mockRequest,
        roomsApp(app),
      );

      await selectRow(table, DOCX_ROW);
      await selectRow(table, PPTX_ROW);
      await table.getByTestId(DOCX_ROW).click({ button: "right" });
      await expect(
        page.getByTestId("download").filter({ visible: true }),
      ).toBeVisible();

      await expect(page.locator("#create_room")).toHaveCount(off ? 0 : 1);

      if (off) {
        await expectScreenshot(page, [
          "desktop",
          "rooms-app-off",
          "rooms-app-off_group-menu.png",
        ]);
      }
    });
  }
});

test.describe("Rooms app off: Move to / Copy selector (bug 84825)", () => {
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

  for (const action of ["move", "copy"] as const) {
    for (const app of ROOMS_APP) {
      const off = app === "off";

      test(`${action} selector root with the Rooms app ${app}`, async ({
        page,
        mockRequest,
        baseUrl,
      }) => {
        const table = await openMyDocuments(
          page,
          baseUrl,
          mockRequest,
          roomsApp(app),
        );

        await openSelectorRoot(page, table, action);

        await expect(selectorItem(page, /^Rooms$/)).toHaveCount(off ? 0 : 1);
        // Forms is a section of its own and stays while its app is on.
        await expect(selectorItem(page, /^Forms$/)).toBeVisible();

        if (off) {
          await expectScreenshot(page, [
            "desktop",
            "rooms-app-off",
            `rooms-app-off_${action}-selector-root.png`,
          ]);
        }
      });
    }
  }

  test("move selector root with the Forms app off", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const table = await openMyDocuments(page, baseUrl, mockRequest, [
      "ai-forms",
    ]);

    await openSelectorRoot(page, table, "move");

    await expect(selectorItem(page, /^Rooms$/)).toBeVisible();
    await expect(selectorItem(page, /^Forms$/)).toHaveCount(0);
  });
});
