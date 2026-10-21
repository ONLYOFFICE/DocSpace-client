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
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { PRIVATE_ROOMS_FLAG_KEY } from "@docspace/shared/utils/privateRooms";
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
