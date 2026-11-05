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

import { test, expect } from "../private/fixtures";

const PERSONAL_FILES_URL = "/sdk/personal-files";

const rows = (page: Page) => page.getByTestId("table-row");

const selectedRows = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-testid=table-row]"))
      .map((row, index) =>
        row.querySelector("input[type=checkbox]:checked") ? index : -1,
      )
      .filter((index) => index >= 0),
  );

const nameInput = (page: Page) =>
  page.getByRole("dialog").getByTestId("text-input");

test.describe("Hotkeys in personal files", () => {
  test.beforeEach(async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${PERSONAL_FILES_URL}`);
    await expect(rows(page).nth(2)).toBeVisible();
  });

  test("j/k work on a non-Latin keyboard layout", async ({ page }) => {
    const cdp = await page.context().newCDPSession(page);
    const pressPhysical = async (key: string, code: string, vk: number) => {
      await cdp.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key,
        code,
        text: key,
        windowsVirtualKeyCode: vk,
      });
      await cdp.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key,
        code,
        windowsVirtualKeyCode: vk,
      });
    };

    const cyrillicJ = "о";
    const cyrillicK = "л";

    await page.keyboard.press("ArrowDown");
    await expect.poll(() => selectedRows(page)).toEqual([0]);

    await pressPhysical(cyrillicJ, "KeyJ", 74);
    await expect.poll(() => selectedRows(page)).toEqual([1]);

    await pressPhysical(cyrillicJ, "KeyJ", 74);
    await expect.poll(() => selectedRows(page)).toEqual([2]);

    await pressPhysical(cyrillicK, "KeyK", 75);
    await expect.poll(() => selectedRows(page)).toEqual([1]);

    await page.keyboard.press("KeyJ");
    await expect.poll(() => selectedRows(page)).toEqual([2]);
  });

  test("Shift+D opens New document when Shift is released first", async ({
    page,
  }) => {
    await page.keyboard.down("Shift");
    await page.keyboard.down("KeyD");
    await page.keyboard.up("Shift");
    await page.keyboard.up("KeyD");

    await expect(nameInput(page)).toHaveValue("New document");
  });

  test("Shift+D opens New document when the letter is released first", async ({
    page,
  }) => {
    await page.keyboard.down("Shift");
    await page.keyboard.down("KeyD");
    await page.keyboard.up("KeyD");
    await page.keyboard.up("Shift");

    await expect(nameInput(page)).toHaveValue("New document");
  });

  test("holding Shift+F opens one New folder dialog and types nothing", async ({
    page,
  }) => {
    await page.keyboard.down("Shift");
    await page.keyboard.down("KeyF");
    for (let i = 0; i < 3; i += 1)
      await page.keyboard.down("KeyF");
    await page.keyboard.up("KeyF");
    await page.keyboard.up("Shift");

    await expect(nameInput(page)).toHaveValue("New folder");
    await expect(page.getByRole("dialog")).toHaveCount(1);

    await page.keyboard.press("End");
    await page.keyboard.press("KeyX");
    await expect(nameInput(page)).toHaveValue("New folderx");
  });
});
