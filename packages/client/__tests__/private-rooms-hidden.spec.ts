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
  capabilitiesHandler,
  filesSettingsHandler,
  privateRoomListHandler,
  roomListHandler,
  rootHandler,
  selfActivationStatusHandler,
  selfByTypeHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { PRIVATE_ROOMS_FLAG_KEY } from "@docspace/shared/utils/privateRooms";
import { expect, test, TEST_PORT } from "./fixtures/base";

// Private rooms are unreleased and hidden unless the tester sets the
// `privateRooms` localStorage flag, which the base fixture does for the whole
// suite. These tests take the flag back off to check that every entry point
// really disappears — and that it comes back with the flag on.
const ROOMS_URL = "/rooms/shared/";

// RoomsTypePrivate: the client-only room type behind the Private room card.
const PRIVATE_ROOM_TYPE = "13";

const disablePrivateRooms = async (page: Page) => {
  await page.addInitScript((key: string) => {
    window.localStorage.removeItem(key);
  }, PRIVATE_ROOMS_FLAG_KEY);
};

const openCreateRoomDialog = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${ROOMS_URL}`);
  await expect(page.getByTestId("table-body")).toBeVisible();

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

test.describe("Private rooms behind the localStorage flag", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Chooser without the flag", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));
    await disablePrivateRooms(page);

    await openCreateRoomDialog(page, baseUrl);

    await expect(privateRoomCard(page)).toHaveCount(0);
  });

  test("Section not available without the flag", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));
    await disablePrivateRooms(page);
    const roomsRequests = recordRoomsRequests(page);

    await page.goto(`${baseUrl}${ROOMS_URL}`);
    await expect(page.getByTestId("table-body")).toBeVisible({ timeout: 15000 });

    await expect(navItem(page, "private-rooms")).toHaveCount(0);
    expect(roomsRequests.length).toBeGreaterThan(0);
    for (const params of roomsRequests)
      expect(params.has("privacyFilter")).toBe(false);
  });

  test("Sidebar with the flag", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    await page.goto(`${baseUrl}${ROOMS_URL}`);
    await expect(navItem(page, "private-rooms")).toHaveText("Private", {
      timeout: 15000,
    });

    await page.goto(`${baseUrl}/e2e-rooms`);

    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 15000 })
      .toBe("/private/filter");
    await expect(navItem(page, "private-rooms-archive")).toBeVisible();
  });

  test("Private room listed with the section", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      privateRoomListHandler(TEST_PORT, {
        roomId: 9700,
        title: "Gated Private Room",
        ordinaryRooms: [{ roomId: 9701, title: "Gated Ordinary Room" }],
      }),
    );

    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page, "Gated Private Room")).toBeVisible({
      timeout: 15000,
    });
    await expect(roomLink(page, "Gated Ordinary Room")).toHaveCount(0);

    await page.goto(`${baseUrl}${ROOMS_URL}filter`);
    await expect(roomLink(page, "Gated Ordinary Room")).toBeVisible({
      timeout: 15000,
    });
    await expect(roomLink(page, "Gated Private Room")).toHaveCount(0);
  });

  test("Direct navigation without the flag", async ({ page, baseUrl }) => {
    await disablePrivateRooms(page);

    await page.goto(`${baseUrl}/e2e-rooms`);

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("Catalog with the flag", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "owner"));

    await page.goto(`${baseUrl}/portal-settings/apps`);

    const app = page.getByTestId("settings-app-e2e-rooms");
    await expect(app).toBeVisible({ timeout: 15000 });
    await expect(app.getByText("Private", { exact: true })).toBeVisible();
    await expect(app).toContainText("End-to-end encrypted rooms.");
    await expect(page.getByText("Rooms E2E")).toHaveCount(0);
  });

  test("Chooser with the flag", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    await openCreateRoomDialog(page, baseUrl);

    await expect(privateRoomCard(page)).toHaveCount(0);
  });

  test("profile hides the Keys management tab without the flag", async ({
    page,
    baseUrl,
  }) => {
    await disablePrivateRooms(page);

    await page.goto(`${baseUrl}/profile/login`);
    await expect(page.getByTestId("main-profile")).toBeVisible();

    await expect(page.getByTestId("keys-management_tab")).toHaveCount(0);
  });

  test("profile shows the Keys management tab with the flag", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/profile/login`);
    await expect(page.getByTestId("main-profile")).toBeVisible();

    await expect(page.getByTestId("keys-management_tab")).toBeVisible();
  });
});
