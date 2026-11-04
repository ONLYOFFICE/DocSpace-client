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

import { http, HttpResponse } from "msw";
import type { Page } from "@playwright/test";

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
import {
  expectScreenshot,
  API_PREFIX,
  BASE_URL,
} from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

test.use({ locale: "en-US", timezoneId: "UTC" });

const ROOM_ID = 33;
const ROOM_URL = `/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`;

const apiUrl = (path: string) =>
  `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/${path}`;

const roomDocument = (page: Page) =>
  page.getByTestId("table-body").getByText("Room Document", { exact: true });

// What a tab sent to the login page keeps in its sessionStorage. Seeded once:
// the init script runs again on every page the tab loads.
const seedTab = async (
  page: Page,
  storage: { referenceUrl: string; loggedOutUserId?: string },
) => {
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("__seeded")) return;
    sessionStorage.setItem("__seeded", "1");
    for (const [key, value] of Object.entries(items)) {
      if (value) sessionStorage.setItem(key, value);
    }
  }, storage);
};

test.describe("Returning to the page after logging in again", () => {
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
    // must be registered after myDocumentsHandler: its `files/:id` pattern
    // would otherwise answer the room content request.
    mockRequest.use(
      roomContentHandler(TEST_PORT, ROOM_ID, 200, {
        roomType: RoomsType.CustomRoom,
      }),
    );
  });

  test("a session that ran out remembers the room for the login form", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await page.goto(`${baseUrl}${ROOM_URL}`);
    await expect(roomDocument(page)).toBeVisible();

    // The session runs out while the room is open; the next request the
    // user makes answers 401.
    mockRequest.use(
      http.put(apiUrl("files/fileops/markasread"), () =>
        HttpResponse.json(
          { error: { message: "Unauthorized" }, statusCode: 401 },
          { status: 401 },
        ),
      ),
      http.post(apiUrl("authentication/logout"), () =>
        HttpResponse.json({ response: true, statusCode: 200 }),
      ),
    );

    await roomDocument(page).click();

    await expect(page).toHaveURL(/\/login\?authError=true$/);
    expect(
      await page.evaluate(() => sessionStorage.getItem("referenceUrl")),
    ).toBe(`${baseUrl}${ROOM_URL}`);
  });

  // Logging in in one tab leaves the others on the login page; reopened, the
  // login page finds the session alive and sends them to the portal root.
  test("a tab sent to the portal root after the login returns to its room", async ({
    page,
    baseUrl,
  }) => {
    await seedTab(page, { referenceUrl: `${baseUrl}${ROOM_URL}` });

    await page.goto(`${baseUrl}/`);

    await expect(page).toHaveURL(new RegExp(`/rooms/shared/${ROOM_ID}/`));
    await expect(roomDocument(page)).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "relogin-return",
      "tab-back-in-its-room.png",
    ]);
  });

  test("the page another user left is not opened", async ({
    page,
    baseUrl,
  }) => {
    await seedTab(page, {
      referenceUrl: `${baseUrl}${ROOM_URL}`,
      loggedOutUserId: "another-user-id",
    });

    await page.goto(`${baseUrl}/`);

    // The default page (the dashboard) loads instead, and the address is
    // dropped.
    await expect(page.getByText("Welcome to ONLYOFFICE")).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard/);
    expect(
      await page.evaluate(() => sessionStorage.getItem("referenceUrl")),
    ).toBeNull();

    await expectScreenshot(page, [
      "desktop",
      "relogin-return",
      "another-users-page-not-opened.png",
    ]);
  });
});
