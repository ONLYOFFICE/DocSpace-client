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
  aiConfigHandler,
  appsHandler,
  capabilitiesHandler,
  encryptedFilesHandlers,
  privacyroomKeysHandlers,
  type PrivacyroomHandlerHandle,
  filesSettingsHandler,
  privateRoomListHandler,
  roomGroupsHandler,
  roomListHandler,
  roomMembersHandlers,
  roomTagsHandler,
  rootHandler,
  selfActivationStatusHandler,
  selfByTypeHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { rootResolve } from "@docspace/shared/__mocks__/handlers/files/root";
import {
  roomListResolver,
  withRoomPrivacyFilter,
} from "@docspace/shared/__mocks__/handlers/files/roomList";
import { RoomPrivacyFilter, ShareAccessRights } from "@docspace/shared/enums";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e";
import { PRIVATE_ROOMS_FLAG_KEY } from "@docspace/shared/utils/privateRooms";
import { http } from "msw";
import type { Page } from "@playwright/test";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { armTour, tourTooltip } from "./helpers/tour";

const ROOM_ID = 9500;
/** The pending flag of the Rooms tour, packages/client/src/store/RoomsTourStore.ts */
const ROOMS_TOUR_KEY = "rooms_tour_pending";
/** The AI agents folder of the root mock, the sidebar item that follows Private. */
const AI_AGENTS_ID = "224866";
const ROOM_TITLE = "Private Section Room";
const FILE_TITLE = "plan.txt";

const roomRow = (page: Page) =>
  page
    .locator('[data-testid^="table-row-"]')
    .filter({ hasText: FILE_TITLE.replace(/\.txt$/, "") });

const withoutOptIn = (page: Page) =>
  page.addInitScript((key: string) => {
    window.localStorage.removeItem(key);
  }, PRIVATE_ROOMS_FLAG_KEY);

test.describe("Private section — addresses", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        title: ROOM_TITLE,
        initialFiles: [
          { id: 9501, title: FILE_TITLE, size: 4, encrypted: false },
        ],
      }),
    );
  });

  test("Link opened without the opt-in", async ({ page, baseUrl }) => {
    await withoutOptIn(page);

    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);

    await expect(page).toHaveURL(
      `${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`,
      { timeout: 15000 },
    );
    await expect(roomRow(page)).toBeVisible({ timeout: 15000 });
  });

  test("Rooms app switched off", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      appsHandler(TEST_PORT, { disabled: ["ai-rooms", "ai-forms"] }),
    );

    await page.goto(
      `${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`,
    );

    await expect(page).toHaveURL(
      `${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`,
      { timeout: 15000 },
    );
    await expect(roomRow(page)).toBeVisible({ timeout: 15000 });
  });

  test("Rooms app switched off without the section", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      appsHandler(TEST_PORT, {
        disabled: ["ai-rooms", "ai-forms", "e2e-rooms"],
      }),
    );

    await page.goto(
      `${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`,
    );

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });
});

const navItem = (page: Page, id: string) =>
  page.locator(`nav [data-item-id="${id}"]`);

/** The ids of the sidebar entries in the order they are shown. */
const navItemIds = (page: Page) =>
  page
    .locator("nav [data-item-id]")
    .evaluateAll((items) => items.map((item) => item.getAttribute("data-item-id")));

/** The ids of the sub-items listed under a sidebar item. */
const subItemIds = (page: Page, id: string) =>
  navItem(page, id).evaluate((item) =>
    Array.from(
      item.closest("li")?.querySelectorAll(":scope ul [data-item-id]") ?? [],
      (subItem) => subItem.getAttribute("data-item-id"),
    ),
  );

const isActive = /NavMenu-module__active--/;

test.describe("Private section — sidebar", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
    );
  });

  test("Section available", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/shared/filter`);

    await expect(navItem(page, "private-rooms")).toHaveText("Private");

    const ids = await navItemIds(page);
    const topLevel = ids.filter(
      (id) => id === "forms" || id === "private-rooms" || id === AI_AGENTS_ID,
    );
    expect(topLevel).toEqual(["forms", "private-rooms", AI_AGENTS_ID]);
  });

  test("Section not available", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(appsHandler(TEST_PORT, { disabled: ["e2e-rooms"] }));

    await page.goto(`${baseUrl}/rooms/shared/filter`);

    await expect(navItem(page, "forms")).toBeVisible();
    await expect(navItem(page, "private-rooms")).toHaveCount(0);
  });

  test("Item clicked", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/shared/filter`);

    await navItem(page, "private-rooms").click();

    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe("/private/filter");
    await expect(navItem(page, "private-rooms")).toHaveClass(isActive);
  });

  test("Archive address", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/archived/filter`);

    await expect(navItem(page, "private-rooms-archive")).toHaveClass(isActive);
    await expect(navItem(page, "private-rooms-archive")).toBeVisible();
  });

  test("Section expanded", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/archived/filter`);
    await expect(navItem(page, "private-rooms-archive")).toBeVisible();

    expect(await subItemIds(page, "private-rooms")).toEqual([
      "private-rooms-archive",
    ]);
  });

  test("Default page setting", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/shared/filter`);
    await expect(navItem(page, "private-rooms")).toBeVisible({
      timeout: 15000,
    });

    await page.goto(`${baseUrl}/profile/file-management`);
    await page.getByTestId("default_homepage_combobox").click();

    const options = page.getByTestId("default_homepage_combobox_dropdown");
    await expect(options.getByText("Rooms", { exact: true })).toBeVisible();
    await expect(options.getByText("Private", { exact: true })).toHaveCount(0);
  });
});

const SUBFOLDER_ID = 9502;
const SUBFOLDER_FILE = { id: 9503, title: "q3.txt" };
const ARCHIVED_ROOM_ID = 9510;
const ARCHIVED_FILE_TITLE = "minutes.txt";
const ORDINARY_ROOM_ID = 9600;
const ORDINARY_FILE_TITLE = "agenda.txt";
/** The Rooms folder of the root mock, the sidebar item of the Rooms section. */
const ROOMS_ID = "2002";

const fileRow = (page: Page, title: string) =>
  page
    .locator('[data-testid^="table-row-"]')
    .filter({ hasText: title.replace(/\.txt$/, "") });

const roomLink = (page: Page) =>
  page.locator(`[data-title="${ROOM_TITLE}"] [data-testid="link"]`).first();

const navigateInApp = (page: Page, url: string, state?: unknown) =>
  page.evaluate(
    ([to, routeState]) =>
      (
        window as unknown as {
          DocSpace: { navigate: (to: string, opts?: unknown) => void };
        }
      ).DocSpace.navigate(to, { state: routeState }),
    [url, state] as const,
  );

const keysMissing = (page: Page) =>
  page
    .getByTestId("toast-content")
    .filter({ hasText: /Encryption keys are not configured/ });

/** The new-items counter of a sidebar item or of one of its sub-items. */
const navBadge = (page: Page, id: string) =>
  page.locator(`nav li:has([data-item-id="${id}"]) .new-items`).first();

/**
 * One new file of a room, counted under the Rooms root.
 *
 * - FoldersController.GetRootFolders (HttpGet "@root"): the Rooms root
 *   reports one new item, so its sidebar item has a badge.
 * - VirtualRoomsController.GetRoomsNewItems (HttpGet "rooms/news"): the
 *   unseen files of the active rooms grouped by day and by room, the room in
 *   its short form.
 */
const roomsNewFileHandlers = (
  room: { id: number; title: string },
  file: { id: number; title: string },
) => [
  http.get(apiAddress("files/@root"), async () => {
    const body = await rootResolve().json();
    for (const root of body.response)
      if (root.current.rootFolderType === 14) root.new = 1;
    return Response.json(body);
  }),
  http.get(apiAddress("files/rooms/news"), () =>
    Response.json({
      response: [
        {
          date: "2026-01-01T12:00:00.0000000+00:00",
          items: [
            {
              room: {
                id: room.id,
                title: room.title,
                roomType: 5,
                logo: {
                  original: "",
                  large: "",
                  medium: "",
                  small: "",
                  color: "8048B0",
                },
              },
              items: [
                {
                  id: file.id,
                  title: file.title,
                  fileExst: ".txt",
                  fileType: 5,
                  folderId: room.id,
                  rootFolderId: 2002,
                  rootFolderType: 14,
                  fileEntryType: 2,
                  version: 1,
                  viewAccessibility: {},
                  security: { Read: true },
                  created: "2026-01-01T12:00:00.0000000+00:00",
                  updated: "2026-01-01T12:00:00.0000000+00:00",
                },
              ],
            },
          ],
        },
      ],
      status: 0,
      statusCode: 200,
    }),
  ),
];

/** Opens the Rooms new-items panel and a new file's location from it. */
const openNewFileLocation = async (page: Page, fileName: string) => {
  await navBadge(page, ROOMS_ID).click();
  // The location button shows on hover, as in the panel itself.
  const newFile = page
    .locator('[class*="fileItem"]')
    .filter({ hasText: fileName });
  await newFile.hover();
  await newFile.locator(".open-location-button").click();
};

test.describe("Private section — rooms open inside it", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      privateRoomListHandler(TEST_PORT, { roomId: ROOM_ID, title: ROOM_TITLE }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        title: ROOM_TITLE,
        folders: [{ id: SUBFOLDER_ID, title: "Reports" }],
        initialFiles: [
          { id: 9501, title: FILE_TITLE, size: 4, encrypted: false },
          {
            ...SUBFOLDER_FILE,
            size: 4,
            encrypted: false,
            folderId: SUBFOLDER_ID,
          },
        ],
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ARCHIVED_ROOM_ID,
        title: "Archived Private Room",
        archived: true,
        initialFiles: [
          { id: 9511, title: ARCHIVED_FILE_TITLE, size: 4, encrypted: false },
        ],
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ORDINARY_ROOM_ID,
        title: "Team Room",
        isPrivate: false,
        initialFiles: [
          { id: 9601, title: ORDINARY_FILE_TITLE, size: 4, encrypted: false },
        ],
      }),
    );
  });

  test("Room clicked in the section", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);

    await roomLink(page).click();

    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe(`/private/${ROOM_ID}/filter`);
    await expect(fileRow(page, FILE_TITLE)).toBeVisible({ timeout: 15000 });
  });

  test("Row link opened in a new tab", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);
    const href = await roomLink(page).getAttribute("href");
    expect(href).toMatch(
      new RegExp(`/private/${ROOM_ID}/filter\\?folder=${ROOM_ID}$`),
    );

    await page.goto(href!);

    await expect(fileRow(page, FILE_TITLE)).toBeVisible({ timeout: 15000 });
    expect(page.url()).toBe(href);
  });

  test("Rooms address of a private room", async ({ page, baseUrl }) => {
    await page.goto(
      `${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`,
    );

    await expect(page).toHaveURL(
      `${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`,
      { timeout: 15000 },
    );
    await expect(fileRow(page, FILE_TITLE)).toBeVisible({ timeout: 15000 });
    await expect(navItem(page, "private-rooms")).toHaveClass(isActive);
  });

  test("Row link of the Rooms list", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/shared/filter?folder=${ROOM_ID}`);

    await expect(page).toHaveURL(
      `${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`,
      { timeout: 15000 },
    );
    await expect(fileRow(page, FILE_TITLE)).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: ROOM_TITLE, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Private", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByTestId("quick-private-room")).toHaveCount(0);
  });

  test("Archived room link", async ({ page, baseUrl }) => {
    await page.goto(
      `${baseUrl}/rooms/archived/filter?folder=${ARCHIVED_ROOM_ID}`,
    );

    await expect(page).toHaveURL(
      `${baseUrl}/private/archived/filter?folder=${ARCHIVED_ROOM_ID}`,
      { timeout: 15000 },
    );
    await expect(fileRow(page, ARCHIVED_FILE_TITLE)).toBeVisible({
      timeout: 15000,
    });
  });

  test("Archived room address", async ({ page, baseUrl }) => {
    const address = `${baseUrl}/private/archived/filter?folder=${ARCHIVED_ROOM_ID}`;

    await page.goto(address);

    await expect(fileRow(page, ARCHIVED_FILE_TITLE)).toBeVisible({
      timeout: 15000,
    });
    expect(page.url()).toBe(address);
    await expect(navItem(page, "private-rooms-archive")).toHaveClass(isActive);
  });

  test("Open location from a feed", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    await navigateInApp(
      page,
      `/rooms/shared/${SUBFOLDER_ID}/filter?folder=${SUBFOLDER_ID}`,
      { highlightFileId: SUBFOLDER_FILE.id, isFileHasExst: false },
    );

    await expect(page).toHaveURL(
      `${baseUrl}/private/${SUBFOLDER_ID}/filter?folder=${SUBFOLDER_ID}`,
      { timeout: 15000 },
    );
    await expect(navItem(page, "private-rooms")).toHaveClass(isActive);
    await expect(fileRow(page, SUBFOLDER_FILE.title)).toHaveClass(
      /__isHighlight--/,
    );
  });

  test("Back from the editor", async ({ page, baseUrl }) => {
    await page.goto(
      `${baseUrl}/rooms/shared/${SUBFOLDER_ID}/filter?folder=${SUBFOLDER_ID}`,
    );

    await expect(page).toHaveURL(
      `${baseUrl}/private/${SUBFOLDER_ID}/filter?folder=${SUBFOLDER_ID}`,
      { timeout: 15000 },
    );
    await expect(fileRow(page, SUBFOLDER_FILE.title)).toBeVisible({
      timeout: 15000,
    });
  });

  test("Section list header", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByRole("heading", { name: "Private", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Rooms", exact: true }),
    ).toHaveCount(0);
  });

  test("Folder inside a private room", async ({ page, baseUrl }) => {
    await page.goto(
      `${baseUrl}/private/${SUBFOLDER_ID}/filter?folder=${SUBFOLDER_ID}`,
    );
    await expect(fileRow(page, SUBFOLDER_FILE.title)).toBeVisible({
      timeout: 15000,
    });

    // The room's title row above the folder's own title.
    await expect(
      page.locator(`text="${ROOM_TITLE}" >> visible=true`).first(),
    ).toBeVisible();
  });

  test("Breadcrumb root in a private room", async ({ page, baseUrl }) => {
    await page.goto(
      `${baseUrl}/private/${SUBFOLDER_ID}/filter?folder=${SUBFOLDER_ID}`,
    );
    await expect(fileRow(page, SUBFOLDER_FILE.title)).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("heading", { name: "Reports", exact: true }).click();

    const crumbs = page.locator('[class*="Navigation-module__box"]');
    await expect(crumbs.getByText("Private", { exact: true })).toBeVisible();
    await expect(crumbs.getByText("Rooms", { exact: true })).toHaveCount(0);
  });

  test("Cold link to a private room", async ({ page, baseUrl }) => {
    await page.goto(
      `${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`,
    );

    await expect(fileRow(page, FILE_TITLE)).toBeVisible({ timeout: 15000 });
    expect(new URL(page.url()).pathname).toBe(`/private/${ROOM_ID}/filter`);
    await expect(keysMissing(page)).toHaveCount(1);
    await page.waitForTimeout(1000);
    await expect(keysMissing(page)).toHaveCount(1);
  });

  test("New file of an ordinary room opened from the section", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      ...roomsNewFileHandlers(
        { id: ORDINARY_ROOM_ID, title: "Team Room" },
        { id: 9601, title: ORDINARY_FILE_TITLE },
      ),
    );
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    const addresses: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) addresses.push(frame.url());
    });

    await openNewFileLocation(page, "agenda");

    await expect(fileRow(page, ORDINARY_FILE_TITLE)).toBeVisible({
      timeout: 15000,
    });
    expect(new URL(page.url()).pathname).toBe(
      `/rooms/shared/${ORDINARY_ROOM_ID}/filter`,
    );
    expect(addresses.filter((address) => address.includes("/private/"))).toEqual(
      [],
    );
  });

  test("New file in a private room: no counter on the section item", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      ...roomsNewFileHandlers(
        { id: ROOM_ID, title: ROOM_TITLE },
        { id: 9501, title: FILE_TITLE },
      ),
      privateRoomListHandler(TEST_PORT, {
        roomId: ROOM_ID,
        title: ROOM_TITLE,
        newItems: 1,
      }),
    );

    await page.goto(`${baseUrl}/private/filter`);
    const privateRoomRow = fileRow(page, ROOM_TITLE);
    await expect(privateRoomRow.getByTestId("badge")).toBeVisible({
      timeout: 15000,
    });

    await expect(navBadge(page, ROOMS_ID)).toBeVisible();
    await expect(navBadge(page, "private-rooms")).toHaveCount(0);
    await expect(navBadge(page, "private-rooms-archive")).toHaveCount(0);
  });

  test("New file in a private room: opened from the Rooms new-items panel", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      ...roomsNewFileHandlers(
        { id: ROOM_ID, title: ROOM_TITLE },
        { id: 9501, title: FILE_TITLE },
      ),
    );
    await page.goto(`${baseUrl}/rooms/shared/filter`);
    await expect(navBadge(page, ROOMS_ID)).toHaveText("1", {
      timeout: 15000,
    });

    await openNewFileLocation(page, "plan");

    await expect(fileRow(page, FILE_TITLE)).toBeVisible({ timeout: 15000 });
    expect(pathOf(page)).toBe(`/private/${ROOM_ID}/filter`);
  });

  test("Hand-edited address", async ({ page, baseUrl }) => {
    await page.goto(
      `${baseUrl}/private/${ORDINARY_ROOM_ID}/filter?folder=${ORDINARY_ROOM_ID}`,
    );

    await expect(page).toHaveURL(
      `${baseUrl}/rooms/shared/${ORDINARY_ROOM_ID}/filter?folder=${ORDINARY_ROOM_ID}`,
      { timeout: 15000 },
    );
    await expect(fileRow(page, ORDINARY_FILE_TITLE)).toBeVisible({
      timeout: 15000,
    });
    await expect(navItem(page, ROOMS_ID)).toHaveClass(isActive);
  });
});

const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const GONE_ROOM_ID = 9700;

const pathOf = (page: Page) => new URL(page.url()).pathname;

const apiAddress = (path: string) =>
  `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/${path}`;

/**
 * Mirrors FoldersController.GetFolderByFolderId (HttpGet "{folderId}") for a
 * room that cannot be opened: FileStorageService throws ItemNotFoundException
 * for a missing folder and InvalidOperationException without the read right,
 * which ResponseWrapper answers with 404 and 403.
 */
const roomCannotBeOpened = (statusCode: 403 | 404) =>
  http.get(apiAddress(`files/${GONE_ROOM_ID}`), () =>
    Response.json(
      { error: { message: "The room cannot be opened" }, status: 1, statusCode },
      { status: statusCode },
    ),
  );

test.describe("Private section — ways out stay in it", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      privateRoomListHandler(TEST_PORT, { roomId: ROOM_ID, title: ROOM_TITLE }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        title: ROOM_TITLE,
        ownerId: ALICE_ID,
        initialFiles: [
          { id: 9501, title: FILE_TITLE, size: 4, encrypted: false },
        ],
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ARCHIVED_ROOM_ID,
        title: "Archived Private Room",
        archived: true,
        initialFiles: [
          { id: 9511, title: ARCHIVED_FILE_TITLE, size: 4, encrypted: false },
        ],
      }),
    );
  });

  const openRoom = async (page: Page, baseUrl: string) => {
    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);
    await expect(fileRow(page, FILE_TITLE)).toBeVisible({ timeout: 15000 });
  };

  test("Back from a private room", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await roomLink(page).click();
    await expect(fileRow(page, FILE_TITLE)).toBeVisible({ timeout: 15000 });

    await page.keyboard.press("Backspace");

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/filter");
  });

  test("Leave a private room", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "roomAdmin"),
      ...roomMembersHandlers(TEST_PORT, ROOM_ID),
    );
    await openRoom(page, baseUrl);

    await page.locator("#header_optional-button").click();
    await page.locator("#option_leave-room").click();
    await page.getByTestId("leave_room_modal_submit").click();

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/filter");
  });

  test("Access to the open private room lost: removed from the room", async ({
    page,
    wsMock,
    baseUrl,
  }) => {
    await wsMock.setupWebSocketMock();
    await openRoom(page, baseUrl);

    wsMock.emitModifyFolder({
      cmd: "delete",
      id: ROOM_ID,
      type: "folder",
      data: "",
    });

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/filter");
    wsMock.closeConnection();
  });

  test("Access to the open private room lost: the server answers 403", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(roomCannotBeOpened(403));

    await page.goto(
      `${baseUrl}/private/${GONE_ROOM_ID}/filter?folder=${GONE_ROOM_ID}`,
    );

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/filter");
  });

  test("Removed from an archived private room", async ({
    page,
    wsMock,
    baseUrl,
  }) => {
    await wsMock.setupWebSocketMock();
    await page.goto(
      `${baseUrl}/private/archived/filter?folder=${ARCHIVED_ROOM_ID}`,
    );
    await expect(fileRow(page, ARCHIVED_FILE_TITLE)).toBeVisible({
      timeout: 15000,
    });

    wsMock.emitModifyFolder({
      cmd: "delete",
      id: ARCHIVED_ROOM_ID,
      type: "folder",
      data: "",
    });

    // The archived room and the archive share a path; the room adds its folder.
    await expect
      .poll(
        () => {
          const url = new URL(page.url());
          return [url.pathname, url.searchParams.get("folder")];
        },
        { timeout: 15000 },
      )
      .toEqual(["/private/archived/filter", null]);
    wsMock.closeConnection();
  });

  test("No-access view", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(roomCannotBeOpened(404));

    await page.goto(
      `${baseUrl}/private/${GONE_ROOM_ID}/filter?folder=${GONE_ROOM_ID}`,
    );

    const view = page.getByTestId("empty-view");
    await expect(view).toContainText("redirected to the Private", {
      timeout: 15000,
    });
    await view.getByText("Go to Private").click();

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/filter");
  });

  test("No-access view: the automatic redirect", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(roomCannotBeOpened(404));

    await page.goto(
      `${baseUrl}/private/${GONE_ROOM_ID}/filter?folder=${GONE_ROOM_ID}`,
    );
    await expect(page.getByTestId("empty-view")).toBeVisible({
      timeout: 15000,
    });

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/filter");
  });
});

test.describe("Private section — info panel", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      // Ahead of the rooms list, whose files/rooms* pattern also matches
      // files/rooms/{id}/share.
      ...roomMembersHandlers(TEST_PORT, ROOM_ID, {
        initial: [{ id: ALICE_ID, displayName: "Alice Private", access: 0 }],
      }),
      privateRoomListHandler(TEST_PORT, { roomId: ROOM_ID, title: ROOM_TITLE }),
    );
  });

  const openInfoPanel = async (page: Page) => {
    const detailsTab = page.getByTestId("info_details_tab");
    if (!(await detailsTab.isVisible().catch(() => false)))
      await page.locator(".info-panel-toggle").click();
  };

  test("Nothing selected on the list", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    await page.locator(".info-panel-toggle").click();

    await expect(page.getByText("See rooms details here")).toBeVisible();
  });

  test("Private room selected", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    await page.getByTestId("table-row-0").click();
    await openInfoPanel(page);

    await expect(page.getByTestId("info_details_tab")).toBeVisible();
    await page.getByTestId("info_members_tab").click();
    await expect(page.getByText("Alice Private")).toBeVisible({
      timeout: 15000,
    });
  });

  test("Members view of a room selected in a list", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    await page.locator(".info-panel-toggle").click();
    await page.getByTestId("table-row-0").click();
    await page.getByTestId("info_members_tab").click();
    await expect(page.getByText("Alice Private")).toBeVisible({
      timeout: 15000,
    });

    await expect(
      page.getByTestId("info_panel_members_links_block"),
    ).toHaveCount(0);
    await expect(
      page.getByTestId("info_panel_members_create_additional_link"),
    ).toHaveCount(0);
    await expect(page.getByTestId("info_share_tab")).toHaveCount(0);
  });
});

test.describe("Private section — filter", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
      roomGroupsHandler(TEST_PORT),
      /**
       * Mirrors VirtualRoomsCommonController.GetRoomTagsInfo (HttpGet
       * "tags"): the tag names of the rooms the caller can see.
       */
      http.get(apiAddress("files/tags"), () =>
        Response.json({ response: ["Finance"] }),
      ),
      /**
       * Mirrors ThirdpartyController.GetThirdPartyAccounts (HttpGet
       * "thirdparty"): one Box account connected as room storage.
       */
      http.get(apiAddress("files/thirdparty"), () =>
        Response.json({
          response: [
            {
              corporate: false,
              roomsStorage: true,
              customer_title: "Box",
              provider_id: 1,
              provider_key: "Box",
            },
          ],
        }),
      ),
      privateRoomListHandler(TEST_PORT, { roomId: ROOM_ID, title: ROOM_TITLE }),
    );
  });

  const filterGroup = (page: Page, name: string) =>
    page.getByTestId(`filter_block_item_${name}`);

  const applyTagFilter = async (page: Page) => {
    await filterGroup(page, "filter-tags")
      .getByTestId("filter_tag_Finance")
      .click();
    await page.locator("#filter_apply-button").click();
  };

  test("Filter opened in the section", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    await page.getByTestId("filter_icon_button").click();

    await expect(filterGroup(page, "filter-owner")).toBeVisible();
    await expect(filterGroup(page, "filter-tags")).toBeVisible();
    await expect(filterGroup(page, "filter-type")).toHaveCount(0);
    await expect(filterGroup(page, "filter-provider-type")).toHaveCount(0);
    await expect(page.locator('[class*="rowGroupingRooms"]')).toHaveCount(0);

    await applyTagFilter(page);

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/filter");
    expect(new URL(page.url()).searchParams.get("tags")).toContain("Finance");
  });

  test("Filter opened in the section: Private archive", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/private/archived/filter?searchArea=Active`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    await page.getByTestId("filter_icon_button").click();
    await applyTagFilter(page);

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/archived/filter");
  });
});

test.describe("Private section — room groups", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
      roomGroupsHandler(TEST_PORT),
      privateRoomListHandler(TEST_PORT, { roomId: ROOM_ID, title: ROOM_TITLE }),
    );
  });

  test("Context menu of a private room in the section", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    await page
      .getByTestId("table-row-0")
      .getByTestId("context-menu-button")
      .first()
      .click();

    await expect(page.getByTestId("pin-room")).toBeVisible();
    await expect(page.getByTestId("create-group")).toHaveCount(0);
    await expect(page.getByTestId("add-to-group")).toHaveCount(0);
  });

  test("Room group editor in Rooms", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      privateRoomListHandler(TEST_PORT, {
        roomId: ROOM_ID,
        title: ROOM_TITLE,
        ordinaryRooms: [{ roomId: ORDINARY_ROOM_ID, title: "Team Room" }],
      }),
    );

    await page.goto(`${baseUrl}/rooms/shared/filter`);
    await expect(page.getByTestId("table-body")).toBeVisible({
      timeout: 15000,
    });

    await page.locator('[class*="groupManagementButton"]').click();
    await page.getByTestId("create_new_group_button").click();

    const roomSelector = page.getByTestId("room_selector");
    await expect(roomSelector.getByText("Team Room")).toBeVisible({
      timeout: 15000,
    });
    await expect(roomSelector.getByText(ROOM_TITLE)).toHaveCount(0);
  });
});

test.describe("Private section — AI chat and tour", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT),
      aiConfigHandler(TEST_PORT),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      privateRoomListHandler(TEST_PORT, {
        roomId: ROOM_ID,
        title: ROOM_TITLE,
        ordinaryRooms: [{ roomId: ORDINARY_ROOM_ID, title: "Team Room" }],
      }),
    );
  });

  const aiChatButton = (page: Page) => page.getByTestId("ai-chat-button");

  test("Private list", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/rooms/shared/filter`);
    await expect(aiChatButton(page)).toBeVisible({ timeout: 15000 });

    for (const list of ["/private/filter", "/private/archived/filter"]) {
      await page.goto(`${baseUrl}${list}`);
      await expect(roomLink(page)).toBeVisible({ timeout: 15000 });
      await expect(aiChatButton(page)).toHaveCount(0);
    }
  });

  test("Pending Rooms tour", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await armTour(page, ROOMS_TOUR_KEY);
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    await page.waitForTimeout(5000);
    await expect(tourTooltip(page)).toHaveCount(0);
    await expect(roomLink(page)).toBeVisible();
  });
});

/** The Archive section folder of the root mock (see root.ts). */
const ARCHIVE_SECTION_ID = 11244;

/**
 * Mirrors VirtualRoomsCommonController.GetRoomsFolder for searchArea=Archive:
 * GetRoomsSectionIdAsync answers the Archive root (FolderType.Archive = 20) as
 * `current`, with the Access a DocSpace admin keeps on it (FileShare.None,
 * FileSecurity returns before it sets one). No archived room here.
 */
const emptyArchiveHandler = () =>
  http.get(apiAddress("files/rooms*"), async ({ request }) => {
    const { response } = await roomListResolver(
      TypeRoomList.IsDefault,
      undefined,
      request,
    ).json();
    if (new URL(request.url).searchParams.get("searchArea") !== "Archive")
      return Response.json({ response });

    return Response.json({
      response: {
        ...response,
        folders: [],
        count: 0,
        total: 0,
        current: {
          ...response.current,
          id: ARCHIVE_SECTION_ID,
          rootFolderId: ARCHIVE_SECTION_ID,
          title: "Archive",
          rootFolderType: 20,
          folderType: 20,
        },
      },
    });
  });

test.describe("Private section — empty states", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      // The default list holds no private room, so privacyFilter=Private
      // answers an empty Private list.
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
    );
  });

  const emptyView = (page: Page) => page.getByTestId("empty-view");

  test("Room admin without private rooms", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);

    await expect(emptyView(page)).toBeVisible({ timeout: 15000 });
    await expect(emptyView(page)).toContainText("No private rooms here yet");
    await expect(emptyView(page)).toContainText(
      "Please create the first private room.",
    );
    await expect(emptyView(page).locator("#create-room")).toBeVisible();
    await expect(emptyView(page).locator("#invite-root-room")).toHaveCount(0);
    await expect(emptyView(page).locator("#migration-data")).toHaveCount(0);
    await expect(emptyView(page).locator("#open-ai-chat")).toHaveCount(0);
  });

  test("User without private rooms", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault, {
        canCreate: false,
        rootAccess: ShareAccessRights.DenyAccess,
      }),
    );

    await page.goto(`${baseUrl}/private/filter`);

    await expect(emptyView(page)).toBeVisible({ timeout: 15000 });
    await expect(emptyView(page)).toContainText("No private rooms here yet");
    await expect(emptyView(page)).toContainText(
      "Private rooms you are invited to will appear here.",
    );
    await expect(emptyView(page).locator("#create-room")).toHaveCount(0);
  });

  test("Empty Private archive", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(emptyArchiveHandler());

    await page.goto(`${baseUrl}/private/archived/filter`);

    await expect(emptyView(page)).toBeVisible({ timeout: 15000 });
    await expect(emptyView(page).locator('a[href*="/rooms/"]')).toHaveCount(0);
    const goBack = emptyView(page).locator("#empty-view-goto-shared");
    await expect(goBack).toContainText("Go to Private");
    await expect(goBack).not.toContainText("Go to rooms");

    await goBack.click();

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/filter");
  });
});

const ARCHIVABLE_ROOM_TITLE = "Archivable Private Room";

/**
 * One private room that moves between the Private list and Private → Archive.
 *
 * - The lists mirror VirtualRoomsCommonController.GetRoomsFolder:
 *   GetRoomsSectionIdAsync answers the Archive root (FolderType.Archive = 20)
 *   as `current` for searchArea=Archive, and the Rooms root otherwise. The room
 *   lies under the root of its area, beside the rooms of the default list in
 *   the active one. withRoomPrivacyFilter applies the privacyFilter of the
 *   request.
 * - Archive and restore mirror OperationController.MoveBatchItems (HttpPut
 *   "fileops/move"), which the client calls with the Archive or the Rooms root
 *   as `destFolderId`: it answers with the caller's move operation
 *   (FileOperationType.Move = 0), already finished, so the client does not
 *   poll `fileops`, and the room lands in that area.
 */
const privateRoomArchive = (initiallyArchived: boolean) => {
  let archived = initiallyArchived;
  let moved = false;
  const archiveRequests: URLSearchParams[] = [];

  const list = http.get(apiAddress("files/rooms*"), async ({ request }) => {
    const params = new URL(request.url).searchParams;
    const inArchive = params.get("searchArea") === "Archive";
    if (inArchive && moved) archiveRequests.push(params);

    const { response } = await roomListResolver(TypeRoomList.IsDefault).json();
    const [template] = response.folders;
    const sectionId = inArchive ? ARCHIVE_SECTION_ID : response.current.id;
    const room = {
      ...template,
      id: ARCHIVED_ROOM_ID,
      title: ARCHIVABLE_ROOM_TITLE,
      roomType: 5,
      private: true,
      parentId: sectionId,
      rootFolderId: sectionId,
      rootFolderType: inArchive ? 20 : 14,
      security: { ...template.security, Read: true, Move: true },
    };
    const folders = [
      ...(archived === inArchive ? [room] : []),
      ...(inArchive ? [] : response.folders),
    ];

    return Response.json({
      response: withRoomPrivacyFilter(
        {
          ...response,
          folders,
          count: folders.length,
          total: folders.length,
          current: inArchive
            ? {
                ...response.current,
                id: ARCHIVE_SECTION_ID,
                rootFolderId: ARCHIVE_SECTION_ID,
                title: "Archive",
                rootFolderType: 20,
                folderType: 20,
              }
            : response.current,
        },
        request,
      ),
    });
  });

  const move = http.put(
    apiAddress("files/fileops/move"),
    async ({ request }) => {
      const { destFolderId } = (await request.json()) as {
        destFolderId: number | string;
      };
      archived = Number(destFolderId) === ARCHIVE_SECTION_ID;
      moved = true;
      return Response.json({
        response: [
          {
            id: "mock-move",
            Operation: 0,
            progress: 100,
            error: "",
            processed: "1",
            finished: true,
            status: 2,
          },
        ],
      });
    },
  );

  return { handlers: [list, move], archiveRequests };
};

test.describe("Private section — archive and restore", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  const roomContextMenu = async (page: Page) => {
    const row = fileRow(page, ARCHIVABLE_ROOM_TITLE);
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.getByTestId("context-menu-button").first().click();
    return row;
  };

  test("Restore from the archive", async ({ page, mockRequest, baseUrl }) => {
    const archive = privateRoomArchive(true);
    mockRequest.use(...archive.handlers);

    await page.goto(`${baseUrl}/private/archived/filter`);
    const archivedRow = await roomContextMenu(page);
    await page.getByTestId("option_unarchive-room").click();
    await page.getByTestId("restore_room_dialog_submit").click();

    await expect(archivedRow).toHaveCount(0, { timeout: 15000 });
    expect(pathOf(page)).toBe("/private/archived/filter");
    expect(archive.archiveRequests.length).toBeGreaterThan(0);
    for (const params of archive.archiveRequests) {
      expect(params.get("searchArea")).toBe("Archive");
      expect(params.get("privacyFilter")).toBe(
        String(RoomPrivacyFilter.Private),
      );
    }
  });

  test("Archive a private room", async ({
    page,
    mockRequest,
    wsMock,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
      ...privateRoomArchive(false).handlers,
    );
    await wsMock.setupWebSocketMock();

    await page.goto(`${baseUrl}/private/filter`);
    await expect
      .poll(() => wsMock.isWebSocketConnected(), { timeout: 15000 })
      .toBe(true);
    const activeRow = await roomContextMenu(page);
    await page.getByTestId("option_archive-room").click();
    const moved = page.waitForResponse(/\/files\/fileops\/move/);
    await page.getByTestId("move_to_archived_modal_submit").click();
    await moved;
    // Spec: server-contract, "Room socket events carry no private flag"
    wsMock.emitModifyFolder({
      cmd: "delete",
      id: ARCHIVED_ROOM_ID,
      type: "folder",
      data: "",
    });

    await expect(activeRow).toHaveCount(0, { timeout: 15000 });

    await navItem(page, "private-rooms-archive").click();
    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/archived/filter");
    await expect(fileRow(page, ARCHIVABLE_ROOM_TITLE)).toBeVisible({
      timeout: 15000,
    });

    await page.goto(`${baseUrl}/rooms/archived/filter`);
    await expect(page.getByTestId("empty-view")).toBeVisible({
      timeout: 15000,
    });
    await expect(fileRow(page, ARCHIVABLE_ROOM_TITLE)).toHaveCount(0);
    wsMock.closeConnection();
  });

  test("Restore a private room", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(...privateRoomArchive(true).handlers);

    await page.goto(`${baseUrl}/private/archived/filter`);
    const archivedRow = await roomContextMenu(page);
    await page.getByTestId("option_unarchive-room").click();
    await page.getByTestId("restore_room_dialog_submit").click();
    await expect(archivedRow).toHaveCount(0, { timeout: 15000 });

    await navItem(page, "private-rooms").click();
    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/filter");
    await expect(fileRow(page, ARCHIVABLE_ROOM_TITLE)).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe("Private section — creation", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [
          {
            id: "1",
            userId: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
            publicKey: "BASE64_PUBLIC_KEY_FIXTURE_FOR_TEST",
            privateKeyEnc: "BASE64_PRIVATE_KEY_ENC_FIXTURE_FOR_TEST",
            date: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
      roomTagsHandler(TEST_PORT),
      privateRoomListHandler(TEST_PORT, { roomId: ROOM_ID, title: ROOM_TITLE }),
    );
  });

  const createRoomDialog = (page: Page) =>
    page
      .getByTestId("modal-dialog")
      .filter({ has: page.getByTestId("create_room_dialog_save") });

  const expectPrivateTypeLocked = async (page: Page) => {
    const dialog = createRoomDialog(page);
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await expect(dialog.getByText("Private Room", { exact: true })).toBeVisible();
    await expect(dialog.getByTestId("room-type-list-item")).toHaveCount(0);
    await expect(dialog.getByTestId("room-type-dropdown-button")).toHaveCount(
      0,
    );
  };

  test("Room admin creates from the section", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    await page.getByTestId("main-button").first().click();

    await expectPrivateTypeLocked(page);
  });

  test("Hotkey in the section", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    await page.keyboard.press("Shift+R");

    await expectPrivateTypeLocked(page);
  });

  test("Banner on a non-empty Private list", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    const tile = page.getByTestId("quick-private-room");
    await expect(tile).toBeVisible();
    for (const other of [
      "quick-vdr-room",
      "quick-custom-room",
      "quick-use-template",
      "quick-ai-chat",
    ])
      await expect(page.getByTestId(other)).toHaveCount(0);

    await tile.click();

    await expectPrivateTypeLocked(page);
  });

  test("Room admin without private rooms: the create button", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    await page.goto(`${baseUrl}/private/filter`);
    await page.getByTestId("empty-view").locator("#create-room").click();

    await expectPrivateTypeLocked(page);
  });

  test("Creation succeeds", async ({ page, mockRequest, baseUrl }) => {
    const NEW_ROOM_ID = 9800;
    mockRequest.use(
      /**
       * Mirrors VirtualRoomsController.CreateRoom (HttpPost ""): the created
       * room as FolderDtoHelper maps it, `private` from SettingsPrivate.
       */
      http.post(apiAddress("files/rooms"), () =>
        Response.json({
          response: {
            id: NEW_ROOM_ID,
            title: "New Private Room",
            roomType: 5,
            private: true,
            parentId: 2002,
            rootFolderId: 2002,
            rootFolderType: 14,
            tags: [],
            security: { Read: true, Create: true, EditRoom: true },
          },
          status: 0,
          statusCode: 200,
        }),
      ),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: NEW_ROOM_ID,
        title: "New Private Room",
        initialFiles: [],
      }),
    );

    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });
    await page.getByTestId("main-button").first().click();
    await expectPrivateTypeLocked(page);

    await createRoomDialog(page)
      .locator(
        'input[data-testid="create_edit_room_input"], [data-testid="create_edit_room_input"] input',
      )
      .first()
      .fill("New Private Room");

    await page.evaluate(() => {
      const w = window as unknown as { visitedPaths: string[] };
      w.visitedPaths = [];
      for (const method of ["pushState", "replaceState"] as const) {
        const original = window.history[method].bind(window.history);
        window.history[method] = (...args) => {
          original(...args);
          w.visitedPaths.push(window.location.pathname);
        };
      }
    });
    await page.getByTestId("create_room_dialog_save").click();

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe(`/private/${NEW_ROOM_ID}/filter`);
    await expect(navItem(page, "private-rooms")).toHaveClass(isActive);
    const visitedPaths = await page.evaluate(
      () => (window as unknown as { visitedPaths: string[] }).visitedPaths,
    );
    expect(visitedPaths).not.toContain(`/rooms/shared/${NEW_ROOM_ID}/filter`);
  });

  test("User without the room-creation right", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault, {
        canCreate: false,
        rootAccess: ShareAccessRights.DenyAccess,
      }),
    );

    await page.goto(`${baseUrl}/private/filter`);
    await expect(page.getByTestId("empty-view")).toBeVisible({
      timeout: 15000,
    });

    await expect(page.getByTestId("main-button")).toHaveCount(0);
    await expect(page.locator("#create-room")).toHaveCount(0);

    await page.keyboard.press("Shift+R");
    await page.waitForTimeout(1000);
    await expect(createRoomDialog(page)).toHaveCount(0);
  });
});

test.describe("Private section — key prompt", () => {
  const keys: { current: PrivacyroomHandlerHandle | null } = { current: null };

  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      ...privacyroomKeysHandlers(TEST_PORT, { initial: [], handle: keys }),
      roomTagsHandler(TEST_PORT),
      privateRoomListHandler(TEST_PORT, { roomId: ROOM_ID, title: ROOM_TITLE }),
    );
  });

  const keyPrompt = (page: Page) =>
    page
      .getByRole("dialog")
      .filter({ hasText: "Encryption key required" });

  const openCreateFromSection = async (page: Page, baseUrl: string) => {
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });
    await page.getByTestId("main-button").first().click();
    await expect(keyPrompt(page)).toBeVisible({ timeout: 15000 });
  };

  test("User accepts key generation", async ({ page, baseUrl }) => {
    await openCreateFromSection(page, baseUrl);

    await keyPrompt(page).getByRole("button", { name: "Continue" }).click();

    const passphrase = "Test-Horse-Battery-Staple-99!";
    await page
      .locator('input[name="passphrase"], #passphrase input')
      .first()
      .fill(passphrase);
    await page
      .locator('input[name="confirmPassphrase"], #confirmPassphrase input')
      .first()
      .fill(passphrase);
    await page
      .getByRole("dialog")
      .filter({ has: page.locator('input[name="confirmPassphrase"]') })
      .getByRole("button", { name: "Continue" })
      .click();

    const acknowledge = page.locator("#recoveryPhraseAcknowledged");
    await expect(acknowledge).toBeVisible({ timeout: 15000 });
    const recovery = page
      .getByRole("dialog")
      .filter({ has: page.locator("#recoveryPhraseAcknowledged") });
    const download = page.waitForEvent("download");
    await recovery.getByRole("button", { name: "Download", exact: true }).click();
    await download;
    await acknowledge.check();
    await recovery.getByRole("button", { name: "Continue" }).click();

    await expect
      .poll(() => keys.current?.getKeys().length ?? 0, { timeout: 15000 })
      .toBe(1);
    await expect(keyPrompt(page)).toHaveCount(0);
    const dialog = page
      .getByTestId("modal-dialog")
      .filter({ has: page.getByTestId("create_room_dialog_save") });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Private Room", { exact: true })).toBeVisible();
  });

  test("User cancels key generation", async ({ page, baseUrl }) => {
    const createRequests: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST" && /\/files\/rooms$/.test(request.url()))
        createRequests.push(request.url());
    });

    await openCreateFromSection(page, baseUrl);

    await keyPrompt(page).getByRole("button", { name: "Cancel" }).click();

    await expect(keyPrompt(page)).toHaveCount(0);
    await expect(page.getByTestId("create_room_dialog_save")).toHaveCount(0);
    expect(createRequests).toEqual([]);
  });
});

test.describe("Private section — E2E rooms bookmarks", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      privateRoomListHandler(TEST_PORT, { roomId: ROOM_ID, title: ROOM_TITLE }),
    );
  });

  test("Old bookmark", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/e2e-rooms`);

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/filter");
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });
    await expect(page.locator("iframe")).toHaveCount(0);
  });

  test("Archive bookmark", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/e2e-rooms?section=archive`);

    await expect
      .poll(() => pathOf(page), { timeout: 15000 })
      .toBe("/private/archived/filter");
    await expect(navItem(page, "private-rooms-archive")).toHaveClass(isActive);
  });
});

