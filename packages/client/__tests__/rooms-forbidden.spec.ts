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
  roomAdminUser,
  regularUser,
  adminOnlyUser,
  successSelf,
} from "@docspace/shared/__mocks__/handlers/people/self";
import {
  expectScreenshot,
  API_PREFIX,
  BASE_URL,
} from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

test.use({ locale: "en-US", timezoneId: "UTC" });

const ROOM_ID = 33;
const ROOM_FILE_ID = 200;
const ROOM_URL = `/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`;

// The client used to navigate away one second after a 403.
const FORMER_REDIRECT_DELAY = 1500;

const apiUrl = (path: string) =>
  `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/${path}`;

const selfAs = (user: Record<string, unknown>) =>
  http.get(apiUrl("people/@self"), () =>
    HttpResponse.json({
      response: { ...user, activationStatus: 1 },
      status: 0,
      statusCode: 200,
    }),
  );

// Opening a room reads the third-party storage list, which the server denies
// once the user no longer has the type that may connect storages.
const thirdPartyForbiddenHandler = () =>
  http.get(apiUrl("files/thirdparty"), () =>
    HttpResponse.json(
      { error: { message: "Access denied" }, status: 1, statusCode: 403 },
      { status: 403 },
    ),
  );

// The URL alone proves nothing: the rooms list used to be fetched into an
// open room without changing it, so the room's own file is what is checked.
// The user's type as the server knows it: the tab loads with the first one and
// finds the second only by asking again.
const selfLoweredLater = (lowered: () => boolean) =>
  http.get(apiUrl("people/@self"), () =>
    HttpResponse.json({
      response: {
        ...(lowered() ? regularUser : roomAdminUser),
        activationStatus: 1,
      },
      status: 0,
      statusCode: 200,
    }),
  );

// What a viewer gets: reading, nothing that changes the room.
const VIEWER_SECURITY = {
  Create: false,
  EditRoom: false,
  Rename: false,
  Delete: false,
  Move: false,
  MoveTo: false,
  CopyTo: false,
  EditAccess: false,
  Duplicate: false,
  Pin: false,
  ChangeOwner: false,
};

const expectStillInRoom = async (page: Page) => {
  await expect(page).toHaveURL(new RegExp(`/rooms/shared/${ROOM_ID}/`));
  await expect(
    page.getByTestId("table-body").getByText("Room Document", { exact: true }),
  ).toBeVisible();
};

test.describe("Rooms — access lost while a room is open", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      fileSharedUsersHandler(TEST_PORT),
    );
  });

  test("a denied request keeps the room open and shows one toast", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      roomContentHandler(TEST_PORT, ROOM_ID, ROOM_FILE_ID, {
        roomType: RoomsType.CustomRoom,
      }),
      thirdPartyForbiddenHandler(),
    );

    await page.goto(`${baseUrl}${ROOM_URL}`);

    const toast = page.getByTestId("toast-content");
    await expect(toast).toContainText("Access denied");
    await expectStillInRoom(page);

    // The toast closes when its progress bar animation ends, and the
    // screenshot fast-forwards animations, so the bar is stopped first.
    await page.addStyleTag({
      content:
        '#toast-container [role="progressbar"] { animation: none !important; }',
    });

    await expectScreenshot(page, [
      "desktop",
      "rooms-forbidden",
      "denied-request-toast.png",
    ]);

    await page.waitForTimeout(FORMER_REDIRECT_DELAY);

    await expectStillInRoom(page);
    await expect(toast).toHaveCount(1);
  });

  test.describe("user type changed over the socket", () => {
    test.beforeEach(async ({ mockRequest, wsMock }) => {
      mockRequest.use(
        settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
        selfAs(roomAdminUser),
        roomContentHandler(TEST_PORT, ROOM_ID, ROOM_FILE_ID, {
          roomType: RoomsType.CustomRoom,
        }),
      );
      await wsMock.setupWebSocketMock();
    });

    test.afterEach(({ wsMock }) => {
      wsMock.closeConnection();
    });

    const bar = (page: Page) => page.locator("#main-bar");
    const barHeader = (page: Page) =>
      bar(page).getByText("Your user type has been changed");

    test("a lowered type offers a reload and stays in the room", async ({
      page,
      baseUrl,
      mockRequest,
      wsMock,
    }) => {
      await page.goto(`${baseUrl}${ROOM_URL}`);
      await expectStillInRoom(page);
      await expect(barHeader(page)).toBeHidden();
      await expect(page.getByTestId("main-button")).toBeVisible();

      // The lower type comes with a lower role in the room.
      mockRequest.use(
        roomContentHandler(TEST_PORT, ROOM_ID, ROOM_FILE_ID, {
          roomType: RoomsType.CustomRoom,
          security: VIEWER_SECURITY,
        }),
      );

      wsMock.emitSocketEvent("s:change-my-type", {
        id: roomAdminUser.id,
        data: regularUser,
        admin: "Admin User",
        hasPersonalFolder: true,
      } as never);

      await expect(barHeader(page)).toBeVisible();
      await expect(
        bar(page).getByText(
          "Some actions on this page may no longer be available to you.",
        ),
      ).toBeVisible();

      // The open room is re-read at once, as for a lowered room role.
      await expect(page.getByTestId("main-button")).toBeHidden();
      await expectStillInRoom(page);

      await expectScreenshot(page, [
        "desktop",
        "rooms-forbidden",
        "user-type-lowered-bar.png",
      ]);

      const reload = page.waitForEvent("load");
      await bar(page).getByText("Reload page", { exact: true }).click();
      await reload;

      await expectStillInRoom(page);
      await expect(barHeader(page)).toBeHidden();
    });

    test("the bar can be dismissed", async ({ page, baseUrl, wsMock }) => {
      await page.goto(`${baseUrl}${ROOM_URL}`);
      await expectStillInRoom(page);

      wsMock.emitSocketEvent("s:change-my-type", {
        id: roomAdminUser.id,
        data: regularUser,
        admin: "Admin User",
        hasPersonalFolder: true,
      } as never);

      await expect(barHeader(page)).toBeVisible();

      // The close control carries no test id of its own.
      await bar(page).locator("button[type=\"submit\"]").click();

      await expect(barHeader(page)).toBeHidden();
    });

    test("a raised type shows no bar", async ({ page, baseUrl, wsMock }) => {
      await page.goto(`${baseUrl}${ROOM_URL}`);
      await expectStillInRoom(page);

      wsMock.emitSocketEvent("s:change-my-type", {
        id: roomAdminUser.id,
        data: adminOnlyUser,
        admin: "Admin User",
        hasPersonalFolder: true,
      } as never);

      await page.waitForTimeout(FORMER_REDIRECT_DELAY);

      await expect(barHeader(page)).toBeHidden();
      await expectStillInRoom(page);
    });
  });

  // s:change-my-type only reaches a tab that is connected when the type
  // changes; a tab left open over a weekend finds out later.
  test.describe("user type change missed by the tab", () => {
    const bar = (page: Page) => page.locator("#main-bar");
    const barHeader = (page: Page) =>
      bar(page).getByText("Your user type has been changed");

    test.beforeEach(async ({ mockRequest, wsMock }) => {
      mockRequest.use(
        settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
        roomContentHandler(TEST_PORT, ROOM_ID, ROOM_FILE_ID, {
          roomType: RoomsType.CustomRoom,
        }),
      );
      await wsMock.setupWebSocketMock();
    });

    test.afterEach(({ wsMock }) => {
      wsMock.closeConnection();
    });

    test("a denied request finds the lowered type and offers a reload", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      let lowered = false;

      mockRequest.use(
        selfLoweredLater(() => lowered),
        // The tab was loaded with the old type; by the time it asks for the
        // storage list the server has lowered it.
        http.get(apiUrl("files/thirdparty"), () => {
          lowered = true;

          return HttpResponse.json(
            { error: { message: "Access denied" }, status: 1, statusCode: 403 },
            { status: 403 },
          );
        }),
      );

      await page.goto(`${baseUrl}${ROOM_URL}`);

      await expect(page.getByTestId("toast-content")).toContainText(
        "Access denied",
      );
      await expect(barHeader(page)).toBeVisible();
      await expectStillInRoom(page);
    });

    test("a socket reconnect finds the lowered type and offers a reload", async ({
      page,
      baseUrl,
      mockRequest,
      wsMock,
    }) => {
      let lowered = false;

      mockRequest.use(selfLoweredLater(() => lowered));

      await page.goto(`${baseUrl}${ROOM_URL}`);
      await expectStillInRoom(page);
      await expect(barHeader(page)).toBeHidden();

      lowered = true;

      // The client reconnects on its own and the mock answers the new socket.
      wsMock.closeConnection();

      await expect(barHeader(page)).toBeVisible({ timeout: 10000 });
      await expectStillInRoom(page);
    });

    test("a socket reconnect with an unchanged type shows no bar", async ({
      page,
      baseUrl,
      mockRequest,
      wsMock,
    }) => {
      let selfReads = 0;

      mockRequest.use(
        http.get(apiUrl("people/@self"), () => {
          selfReads += 1;

          return HttpResponse.json({
            response: { ...roomAdminUser, activationStatus: 1 },
            status: 0,
            statusCode: 200,
          });
        }),
      );

      await page.goto(`${baseUrl}${ROOM_URL}`);
      await expectStillInRoom(page);

      const readsBeforeReconnect = selfReads;

      wsMock.closeConnection();

      // The re-read is what proves the reconnect was noticed at all.
      await expect.poll(() => selfReads, { timeout: 10000 }).toBeGreaterThan(
        readsBeforeReconnect,
      );

      await expect(barHeader(page)).toBeHidden();
      await expectStillInRoom(page);
    });
  });

  // A room role is not a user type: what changes is the room's security, so
  // the open folder's rights are re-read instead of offering a reload.
  test.describe("room role lowered", () => {
    const SUBFOLDER_ID = 3301;
    const SUBFOLDER_URL = `/rooms/shared/${SUBFOLDER_ID}/filter?folder=${SUBFOLDER_ID}`;


    const roomContent = (security?: Record<string, boolean>) =>
      roomContentHandler(TEST_PORT, ROOM_ID, ROOM_FILE_ID, {
        roomType: RoomsType.CustomRoom,
        ...(security ? { security } : {}),
      });

    const subfolderContent = (security?: Record<string, boolean>) =>
      roomContentHandler(TEST_PORT, SUBFOLDER_ID, ROOM_FILE_ID, {
        isRoom: false,
        roomType: null,
        parentId: ROOM_ID,
        title: "Subfolder",
        pathParts: [
          { id: 2002, title: "Rooms", folderType: 14 },
          { id: ROOM_ID, title: "Public Room", folderType: 14 },
          { id: SUBFOLDER_ID, title: "Subfolder", folderType: 0 },
        ],
        ...(security ? { security } : {}),
      });

    const mainButton = (page: Page) => page.getByTestId("main-button");

    test.beforeEach(async ({ mockRequest, wsMock }) => {
      mockRequest.use(
        settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
      );
      await wsMock.setupWebSocketMock();
    });

    test.afterEach(({ wsMock }) => {
      wsMock.closeConnection();
    });

    test("the socket event re-reads the rights inside a subfolder", async ({
      page,
      baseUrl,
      mockRequest,
      wsMock,
    }) => {
      mockRequest.use(roomContent(), subfolderContent());

      await page.goto(`${baseUrl}${SUBFOLDER_URL}`);
      await expect(
        page.getByTestId("table-body").getByText("Room Document", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(mainButton(page)).toBeVisible();

      mockRequest.use(subfolderContent(VIEWER_SECURITY));

      // The event names the room, not the folder the user is in.
      wsMock.emitSocketEvent("s:change-access-rights-folder", {
        id: ROOM_ID,
        data: JSON.stringify({ [successSelf.id]: 2 }),
      } as never);

      await expect(mainButton(page)).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`/rooms/shared/${SUBFOLDER_ID}/`));

      await expectScreenshot(page, [
        "desktop",
        "rooms-forbidden",
        "subfolder-room-role-lowered.png",
      ]);
    });

    test("a denied request inside a room re-reads its rights", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      let roomReads = 0;
      page.on("request", (request) => {
        if (new URL(request.url()).pathname.endsWith(`/files/${ROOM_ID}`))
          roomReads += 1;
      });

      mockRequest.use(roomContent());

      await page.goto(`${baseUrl}${ROOM_URL}`);
      await expectStillInRoom(page);
      await expect(mainButton(page)).toBeVisible();

      // The role is lowered while the tab is open and misses the event; the
      // next request the user makes is denied.
      const readsBeforeDenial = roomReads;
      mockRequest.use(
        roomContent(VIEWER_SECURITY),
        http.put(apiUrl("files/fileops/markasread"), () =>
          HttpResponse.json(
            { error: { message: "Access denied" }, status: 1, statusCode: 403 },
            { status: 403 },
          ),
        ),
      );

      // Selecting a new file marks it as read.
      await page
        .getByTestId("table-body")
        .getByText("Room Document", { exact: true })
        .click();

      // markAsRead reports the error itself, so the generic toast stands
      // down and the user sees one "Access denied", not two.
      const toast = page.getByTestId("toast-content");
      await expect(toast).toContainText("Access denied");
      await expect(mainButton(page)).toBeHidden();
      expect(roomReads).toBeGreaterThan(readsBeforeDenial);
      await expectStillInRoom(page);

      await page.waitForTimeout(FORMER_REDIRECT_DELAY);
      await expect(toast).toHaveCount(1);

      // The toast closes when its progress bar animation ends, and the
      // screenshot fast-forwards animations, so the bar is stopped first.
      await page.addStyleTag({
        content:
          '#toast-container [role="progressbar"] { animation: none !important; }',
      });

      await expectScreenshot(page, [
        "desktop",
        "rooms-forbidden",
        "room-role-lowered-denied-request.png",
      ]);
    });
  });
});
