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
  appsHandler,
  capabilitiesHandler,
  encryptedFilesHandlers,
  filesSettingsHandler,
  privateRoomListHandler,
  roomListHandler,
  roomMembersHandlers,
  rootHandler,
  selfActivationStatusHandler,
  selfByTypeHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { rootResolve } from "@docspace/shared/__mocks__/handlers/files/root";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e";
import { PRIVATE_ROOMS_FLAG_KEY } from "@docspace/shared/utils/privateRooms";
import { http } from "msw";
import type { Page } from "@playwright/test";
import { expect, test, TEST_PORT } from "./fixtures/base";

const ROOM_ID = 9500;
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
    const apiUrl = (path: string) =>
      `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/${path}`;
    mockRequest.use(
      /**
       * Mirrors FoldersController.GetRootFolders (HttpGet "@root"): the
       * Rooms root reports one new item, so its sidebar item has a badge.
       */
      http.get(apiUrl("files/@root"), async () => {
        const body = await rootResolve().json();
        for (const root of body.response)
          if (root.current.rootFolderType === 14) root.new = 1;
        return Response.json(body);
      }),
      /**
       * Mirrors VirtualRoomsController.GetRoomsNewItems (HttpGet
       * "rooms/news"): the unseen files of the active rooms grouped by day
       * and by room, the room in its short form.
       */
      http.get(apiUrl("files/rooms/news"), () =>
        Response.json({
          response: [
            {
              date: "2026-01-01T12:00:00.0000000+00:00",
              items: [
                {
                  room: {
                    id: ORDINARY_ROOM_ID,
                    title: "Team Room",
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
                      id: 9601,
                      title: ORDINARY_FILE_TITLE,
                      fileExst: ".txt",
                      fileType: 5,
                      folderId: ORDINARY_ROOM_ID,
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
    );
    await page.goto(`${baseUrl}/private/filter`);
    await expect(roomLink(page)).toBeVisible({ timeout: 15000 });

    const addresses: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) addresses.push(frame.url());
    });

    await page
      .locator(`nav li:has([data-item-id="${ROOMS_ID}"])`)
      .getByTestId("badge")
      .first()
      .click();
    // The location button shows on hover, as in the panel itself.
    const newFile = page
      .locator('[class*="fileItem"]')
      .filter({ hasText: "agenda" });
    await newFile.hover();
    await newFile.locator(".open-location-button").click();

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
});

