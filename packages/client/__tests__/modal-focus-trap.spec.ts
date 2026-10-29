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

import { http } from "msw";
import type { Locator, Page } from "@playwright/test";
import { BASE_URL } from "@docspace/shared/__mocks__/e2e";
import { myDocumentsResolver } from "@docspace/shared/__mocks__/handlers/files/documents";
import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  roomListHandler,
  TypeRoomList,
  rootHandler,
  filesSettingsHandler,
  myHandler,
  roomGroupsHandler,
  roomGroupByIdHandler,
} from "@docspace/shared/__mocks__/handlers";

const FOLDER_ID = 12764;
const PERSONAL_FOLDER_URL = `/rooms/personal/filter?folder=${FOLDER_ID}`;
// Row of the JPG in the personal folder's list (0-based, the folder first).
const JPG_ROW = 2;
const FOLDER_ENDPOINT = `${BASE_URL}:${TEST_PORT}/api/2.0/files/:id`;

// What the focus is on, in words a failure message can show.
const describeFocus = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return "<body>";
    const label =
      el.getAttribute("aria-label") ||
      el.getAttribute("data-testid") ||
      (el instanceof HTMLElement ? el.innerText : "") ||
      "";
    return `${el.tagName.toLowerCase()} "${label.trim().slice(0, 30)}"`;
  });

const focusIsIn = (container: Locator) =>
  container.evaluate((el) => el.contains(document.activeElement));

// Presses Tab, then Shift+Tab, more times than the container has stops: after
// every press the focus must still be inside it, and each direction must come
// back round to a stop it already visited.
const expectFocusTrapped = async (
  page: Page,
  container: Locator,
  presses = 25,
) => {
  for (const key of ["Tab", "Shift+Tab"]) {
    const visited: string[] = [];
    for (let i = 0; i < presses; i += 1) {
      await page.keyboard.press(key);
      const where = await describeFocus(page);
      expect(
        await focusIsIn(container),
        `${key} #${i + 1} left the dialog for ${where}`,
      ).toBe(true);
      visited.push(where);
    }
    expect(
      new Set(visited).size,
      `${key} never wrapped: ${visited.join(" > ")}`,
    ).toBeLessThan(visited.length);
  }
};

// Tabs forward until the focused element has this test id.
const tabToTestId = async (page: Page, testId: string, limit = 80) => {
  for (let i = 0; i < limit; i += 1) {
    await page.keyboard.press("Tab");
    const id = await page.evaluate(() =>
      document.activeElement?.closest("[data-testid]")?.getAttribute("data-testid"),
    );
    if (id === testId) return;
  }
  throw new Error(`Tab never reached ${testId}`);
};

// Pins the focused element, the one a closing dialog must hand the focus back
// to: a ":focus" locator would follow the focus around.
const markOpener = async (page: Page) => {
  await page.evaluate(() =>
    document.activeElement?.setAttribute("data-focus-opener", ""),
  );
  return page.locator("[data-focus-opener]");
};

const openRooms = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/rooms/shared/`);
  await expect(page.getByTestId("table-body")).toBeVisible();
  await expect(page.locator(".section-body").first()).toBeFocused();
  await page.waitForLoadState("networkidle");
  // Start every walk at the top of the document.
  await page.mouse.click(1, 1);
};

const modal = (page: Page, has: Locator) =>
  page.locator('[role="dialog"][aria-modal="true"]').filter({ has });

test.describe("Focus trap in modal dialogs", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      filesSettingsHandler(TEST_PORT),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
    );
  });

  test("a dialog with many controls keeps the focus, and Escape hands it back to the opener", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    await tabToTestId(page, "main-button");
    const opener = await markOpener(page);
    await page.keyboard.press("Enter");

    const roomTypes = page.getByTestId("room-type-list-item");
    await expect(roomTypes.first()).toBeVisible();
    const dialog = modal(page, roomTypes.first());

    await expectFocusTrapped(page, dialog, 40);

    await page.keyboard.press("Escape");
    await expect(roomTypes).toHaveCount(0);
    await expect(opener).toBeFocused();

    // Opened again, it traps the focus again.
    await page.keyboard.press("Enter");
    await expect(roomTypes.first()).toBeVisible();
    await expectFocusTrapped(page, modal(page, roomTypes.first()), 40);
  });

  test("the filter panel keeps the focus while it is open", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    await tabToTestId(page, "filter_icon_button");
    const opener = await markOpener(page);
    await page.keyboard.press("Enter");

    const apply = page.getByTestId("filter_apply_button");
    await expect(apply).toBeVisible();
    const panel = page
      .locator('[role="dialog"][aria-modal="true"], aside')
      .filter({ has: apply })
      .last();

    await expectFocusTrapped(page, panel, 40);

    await page.keyboard.press("Escape");
    await expect(apply).toBeHidden();
    await expect(opener).toBeFocused();
  });
});

test.describe("Focus trap in a files dialog", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      http.get(FOLDER_ENDPOINT, () => myDocumentsResolver(true)),
    );
  });

  test("a short dialog keeps Tab and Shift+Tab inside: New folder", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    await page.getByTestId("main-button").click();
    await page.locator('[role="menuitem"]').filter({ hasText: "Folder" }).first().click();

    const input = page.getByTestId("new_folder_text_input");
    await expect(input).toBeFocused();
    const dialog = modal(page, input);

    await expectFocusTrapped(page, dialog);
  });
});

test.describe("Focus trap in the media viewer", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      http.get(FOLDER_ENDPOINT, () => myDocumentsResolver(true)),
    );
  });

  test("the viewer takes the first Tab from the page behind and keeps it", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    // An image: the viewer opens over the list without taking the focus.
    await table
      .getByTestId(`files-cell-name-${JPG_ROW}`)
      .locator(".item-file-name")
      .click();
    // Its root has no height of its own (the parts inside are fixed), so it
    // is waited for by its address and its presence, not its visibility.
    await expect(page).toHaveURL(/\/media\/view\//);
    const viewer = page.getByTestId("media-viewer");
    await expect(viewer).toHaveAttribute("data-visible", "true");

    await expectFocusTrapped(page, viewer);
  });
});

test.describe("Focus trap in nested dialogs", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
      roomGroupsHandler(TEST_PORT, true),
      roomGroupByIdHandler(TEST_PORT),
    );
  });

  test("a panel opened from a dialog holds the focus, then the dialog does again", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    await page.locator('[class*="groupManagementButton"]').click();
    const createGroup = page.getByTestId("create_new_group_button");
    await expect(createGroup).toBeVisible();
    const groupsDialog = modal(page, createGroup);

    await expectFocusTrapped(page, groupsDialog);

    await createGroup.click();
    const roomSelector = page.getByTestId("room_selector");
    await expect(roomSelector).toBeVisible();
    const selectorPanel = page
      .locator('[role="dialog"][aria-modal="true"], aside')
      .filter({ has: roomSelector })
      .last();

    await expectFocusTrapped(page, selectorPanel, 40);
  });
});
