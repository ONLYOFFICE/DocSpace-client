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
  rootHandler,
  settingsHandler,
  TypeSettings,
  filesSettingsHandler,
  peopleHandler,
  selfActivationStatusHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

const CONTACTS_URL = "/accounts/people/filter";
const USERS = ["user-1", "user-2", "user-3", "user-4", "user-5"];

const selectedUsers = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll(".user-item.table-row-selected")).map(
      (el) => el.id,
    ),
  );

const copiedText = (page: Page) =>
  page.evaluate(() => Reflect.get(window, "__copiedText") ?? null);

const press = async (page: Page, keys: string[]) => {
  for (const key of keys) await page.keyboard.press(key);
};

test.describe("Hotkeys in Contacts", () => {
  test.beforeEach(async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT),
      peopleHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
    );

    await page.addInitScript(() => {
      const execCommand = document.execCommand.bind(document);
      document.execCommand = (command, ...args) => {
        if (command === "copy") {
          Object.assign(window, {
            __copiedText: window.getSelection()?.toString() ?? "",
          });
        }
        return execCommand(command, ...args);
      };
    });

    await page.goto(`${baseUrl}${CONTACTS_URL}`);
    await expect(page.getByTestId("contacts_users_row_4")).toBeVisible();
  });

  test("arrows and j/k move the selection", async ({ page }) => {
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => selectedUsers(page)).toEqual(["user-1"]);

    await page.keyboard.press("ArrowDown");
    await expect.poll(() => selectedUsers(page)).toEqual(["user-2"]);

    await page.keyboard.press("ArrowUp");
    await expect.poll(() => selectedUsers(page)).toEqual(["user-1"]);

    await page.keyboard.press("KeyJ");
    await expect.poll(() => selectedUsers(page)).toEqual(["user-2"]);

    await page.keyboard.press("KeyK");
    await expect.poll(() => selectedUsers(page)).toEqual(["user-1"]);
  });

  test("Ctrl+A selects everyone, Esc and Shift+N clear it", async ({
    page,
  }) => {
    await press(page, ["ArrowDown", "Control+KeyA"]);
    await expect.poll(() => selectedUsers(page)).toEqual(USERS);

    await page.keyboard.press("Escape");
    await expect.poll(() => selectedUsers(page)).toEqual([]);

    await page.keyboard.press("Control+KeyA");
    await expect.poll(() => selectedUsers(page)).toEqual(USERS);

    await page.keyboard.press("Shift+KeyN");
    await expect.poll(() => selectedUsers(page)).toEqual([]);
  });

  test("Shift+Down and Shift+Up extend and shrink the range", async ({
    page,
  }) => {
    await press(page, ["ArrowDown", "Shift+ArrowDown", "Shift+ArrowDown"]);
    await expect
      .poll(() => selectedUsers(page))
      .toEqual(["user-1", "user-2", "user-3"]);

    await page.keyboard.press("Shift+ArrowUp");
    await expect.poll(() => selectedUsers(page)).toEqual(["user-1", "user-2"]);
  });

  test("Shift+Down after Esc starts the range at the caret", async ({
    page,
  }) => {
    await press(page, ["ArrowDown", "ArrowDown", "ArrowDown", "Escape"]);
    await expect.poll(() => selectedUsers(page)).toEqual([]);

    await page.keyboard.press("Shift+ArrowDown");
    await expect.poll(() => selectedUsers(page)).toEqual(["user-3", "user-4"]);
  });

  test("Ctrl+A does nothing under the Shift+C context menu", async ({
    page,
  }) => {
    const menu = page.locator(".p-contextmenu").filter({ visible: true });

    await press(page, ["ArrowDown", "Shift+KeyC"]);
    await expect(menu).toBeVisible();

    await page.keyboard.press("Control+KeyA");
    await expect.poll(() => selectedUsers(page)).toEqual(["user-1"]);

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect.poll(() => selectedUsers(page)).toEqual(["user-1"]);
  });

  test("Ctrl+Shift+C copies the selected rows", async ({ page }) => {
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => selectedUsers(page)).toEqual(["user-1"]);

    await page.keyboard.press("Control+Shift+KeyC");
    await expect.poll(() => copiedText(page)).toContain("John Smith");
  });

  test("Ctrl+Shift+C copies nothing without a selection", async ({ page }) => {
    await press(page, ["ArrowDown", "Escape"]);
    await expect.poll(() => selectedUsers(page)).toEqual([]);

    await page.keyboard.press("Control+Shift+KeyC");
    await page.waitForTimeout(500);
    expect(await copiedText(page)).toBeNull();
  });
});
