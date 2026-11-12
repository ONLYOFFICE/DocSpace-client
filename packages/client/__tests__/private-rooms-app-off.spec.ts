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

import type { Page } from "@playwright/test";
import {
  appsHandler,
  capabilitiesHandler,
  encryptedFilesHandlers,
  filesSettingsHandler,
  privateRoomListHandler,
  privacyroomKeysHandlers,
  roomListHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

// A standalone portal (the default settings mock) whose administrator switched
// the E2E rooms app off.
const ROOMS_URL = "/rooms/shared/";

// RoomsTypePrivate: the client-only room type behind the Private room card.
const PRIVATE_ROOM_TYPE = "13";

const ROOM_ID = 9750;
const FILE_TITLE = "plan.txt";
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

const heldKey = {
  id: "1",
  userId: TEST_USER_ID,
  publicKey: "BASE64_PUBLIC_KEY_FIXTURE_FOR_TEST",
  privateKeyEnc: "BASE64_PRIVATE_KEY_ENC_FIXTURE_FOR_TEST",
  date: "2026-01-01T00:00:00.000Z",
};

const openCreateRoomDialog = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${ROOMS_URL}`);
  await expect(page.getByTestId("table-body")).toBeVisible({ timeout: 15000 });

  // The same ROOM_CREATE event the QuickActions tiles fire; without
  // startRoomType it opens on the room type chooser.
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("create_room", { detail: {} }));
  });

  await expect(page.getByTestId("room-type-list-item").first()).toBeVisible();
};

// RoomTypeList stamps the room type on every card as `data-selected-id`.
const privateRoomCard = (page: Page) =>
  page.locator(
    `[data-testid="room-type-list-item"][data-selected-id="${PRIVATE_ROOM_TYPE}"]`,
  );

const navItem = (page: Page, id: string) =>
  page.locator(`nav [data-item-id="${id}"]`);

const roomLink = (page: Page, title: string) =>
  page.locator(`[data-title="${title}"] [data-testid="link"]`).first();

/** The query of every rooms list request the page sends. */
const recordRoomsRequests = (page: Page) => {
  const requests: URLSearchParams[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname.endsWith("/files/rooms"))
      requests.push(url.searchParams);
  });
  return requests;
};

test.describe("Private rooms with the E2E rooms app off", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      appsHandler(TEST_PORT, { disabled: ["e2e-rooms"] }),
    );
  });

  test("App-off spec", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      privateRoomListHandler(TEST_PORT, {
        roomId: 9700,
        title: "Existing Private Room",
        ordinaryRooms: [{ roomId: 9701, title: "Ordinary Room" }],
      }),
    );
    const roomsRequests = recordRoomsRequests(page);

    await page.goto(`${baseUrl}${ROOMS_URL}filter`);

    await expect(roomLink(page, "Ordinary Room")).toBeVisible({
      timeout: 15000,
    });
    await expect(roomLink(page, "Existing Private Room")).toHaveCount(0);
    await expect(navItem(page, "forms")).toBeVisible();
    await expect(navItem(page, "private-rooms")).toHaveCount(0);
    for (const params of roomsRequests)
      expect(params.has("privacyFilter")).toBe(false);

    // The shared Archive holds private rooms too, so its request keeps the
    // non-private filter (RoomPrivacyFilter.NotPrivate).
    roomsRequests.length = 0;
    await page.goto(`${baseUrl}/rooms/archived/filter`);

    await expect(roomLink(page, "Ordinary Room")).toBeVisible({
      timeout: 15000,
    });
    await expect(roomLink(page, "Existing Private Room")).toHaveCount(0);
    const archiveRequests = roomsRequests.filter(
      (params) => params.get("searchArea") === "Archive",
    );
    expect(archiveRequests.length).toBeGreaterThan(0);
    for (const params of archiveRequests)
      expect(params.get("privacyFilter")).toBe("2");

    await page.goto(`${baseUrl}/e2e-rooms`);

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("Browser-local flag ignored", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    await page.goto(`${baseUrl}${ROOMS_URL}filter?privateRooms=true`);
    await expect(page.getByTestId("table-body")).toBeVisible({ timeout: 15000 });

    await expect(navItem(page, "private-rooms")).toHaveCount(0);
    expect(
      await page.evaluate(() => window.localStorage.getItem("privateRooms")),
    ).toBeNull();

    await page.evaluate(() =>
      window.localStorage.setItem("privateRooms", "true"),
    );
    await page.reload();
    await expect(page.getByTestId("table-body")).toBeVisible({ timeout: 15000 });

    await expect(navItem(page, "private-rooms")).toHaveCount(0);
  });

  test("Link opened while the section is not available", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        title: "Shared Private Room",
        initialFiles: [
          { id: 9751, title: FILE_TITLE, size: 4, encrypted: false },
        ],
      }),
    );

    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);

    await expect(page).toHaveURL(
      `${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`,
      { timeout: 15000 },
    );
    await expect(
      page
        .locator('[data-testid^="table-row-"]')
        .filter({ hasText: FILE_TITLE.replace(/\.txt$/, "") }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("Chooser with the app off", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    await openCreateRoomDialog(page, baseUrl);

    await expect(privateRoomCard(page)).toHaveCount(0);
    expect(
      await page.getByTestId("room-type-list-item").count(),
    ).toBeGreaterThan(0);
  });

  test("App off, no key", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(...privacyroomKeysHandlers(TEST_PORT, { initial: [] }));

    await page.goto(`${baseUrl}/profile/keys-management`);

    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 15000 })
      .toBe("/profile/login");
    await expect(page.getByTestId("main-profile")).toBeVisible();
    await expect(page.getByTestId("keys-management_tab")).toHaveCount(0);
  });

  test("App off, key held", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, { initial: [heldKey] }),
    );

    await page.goto(`${baseUrl}/profile/login`);
    await expect(page.getByTestId("main-profile")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId("keys-management_tab")).toBeVisible();

    await page.goto(`${baseUrl}/profile/keys-management`);

    await expect(page.getByTestId("keys-management_tab")).toBeVisible({
      timeout: 15000,
    });
    expect(new URL(page.url()).pathname).toBe("/profile/keys-management");
  });
});
