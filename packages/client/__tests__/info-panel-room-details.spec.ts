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

import { RoomsType } from "@onlyoffice/apps-ui-kit/enums";
import {
  settingsHandler,
  TypeSettings,
  filesSettingsHandler,
  roomListHandler,
  TypeRoomList,
  rootHandler,
  myDocumentsHandler,
  myHandler,
  selfActivationStatusHandler,
  fileSharedUsersHandler,
  roomContentHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

// Public Room id from the roomList mock (getRoomList index 0, roomType 6)
const ROOM_ID = 33;
const ROOM_FILE_ID = 200;
const ROOM_CONTENT_URL = `/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`;

test.describe("Rooms — info panel details", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      fileSharedUsersHandler(TEST_PORT),
    );
  });

  // Production report (4.0.0): "Cannot read properties of undefined
  // (reading 'EditRoom')" thrown by the Details view of an opened room,
  // which took the whole info panel down.
  test("should render details of a room that has no security", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // must be registered after myDocumentsHandler: its `files/:id` pattern
    // would otherwise resolve the room content request.
    mockRequest.use(
      roomContentHandler(TEST_PORT, ROOM_ID, ROOM_FILE_ID, {
        roomType: RoomsType.VirtualDataRoom,
        security: null,
      }),
    );

    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto(`${baseUrl}${ROOM_CONTENT_URL}`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    const detailsTab = page.getByTestId("info_details_tab");

    if (!(await detailsTab.isVisible().catch(() => false))) {
      await page.locator(".info-panel-toggle").click();
      await expect(detailsTab).toBeVisible({ timeout: 10000 });
    }

    await detailsTab.click();

    await expect(
      page.getByTestId("info_panel_details_room_icon"),
    ).toBeVisible();

    expect(pageErrors.filter((m) => m.includes("EditRoom"))).toEqual([]);
  });
});
