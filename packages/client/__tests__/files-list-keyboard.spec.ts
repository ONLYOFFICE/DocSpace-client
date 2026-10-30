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
import type { Page } from "@playwright/test";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  rootHandler,
  filesSettingsHandler,
  roomListHandler,
  TypeRoomList,
} from "@docspace/shared/__mocks__/handlers";
import { myDocumentsResolver } from "@docspace/shared/__mocks__/handlers/files/documents";
import { BASE_URL } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

// The files list moves the real focus with its keyboard caret: the arrows put
// it on the caret row's name, Tab goes through that row's controls, and past
// the row's edges Tab leaves the list instead of walking every other row.

const FOLDER_ID = 12764;
const FILES_COUNT = 12;
const FILE_ID_OFFSET = 1000;

const fileId = (n: number) => FILE_ID_OFFSET + n;

const filesListHandler = http.get(
  `${BASE_URL}:${TEST_PORT}/api/2.0/files/:id`,
  async () => {
    const body = await myDocumentsResolver().json();
    const [template] = body.response.files;

    body.response.current.id = FOLDER_ID;
    body.response.files = Array.from({ length: FILES_COUNT }, (_, i) => ({
      ...template,
      id: fileId(i + 1),
      folderId: FOLDER_ID,
      title: `File ${String(i + 1).padStart(2, "0")}`,
    }));
    body.response.count = FILES_COUNT;
    body.response.total = FILES_COUNT;
    body.response.current.filesCount = FILES_COUNT;

    return new Response(JSON.stringify(body));
  },
);

// Where the focus is: the list row it is in (its element id), and what it is.
const focus = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    // The row's outer element carries the item's id; an inner element
    // of a table row shares its files-item class but not the id.
    const row = el?.closest('[id^="file_"], [id^="folder_"]');
    return {
      row: row?.id ?? null,
      // The row as a whole (not one of its controls) holds the focus.
      isRow: !!el?.hasAttribute("data-row-focus"),
      tag: el?.tagName.toLowerCase() ?? "",
      name: (
        el?.getAttribute("aria-label") ||
        (el instanceof HTMLElement ? el.innerText : "") ||
        ""
      )
        .trim()
        .slice(0, 30),
    };
  });

const fileRow = (n: number) => `file_${fileId(n)}`;

// The row's own Tab stops, named as focus() names them, on either side of
// the focused one.
const rowStopsAroundFocus = (page: Page) =>
  page.evaluate(() => {
    const active = document.activeElement;
    const row = active?.closest('[id^="file_"], [id^="folder_"]');
    if (!row || !(active instanceof HTMLElement))
      return { before: [], after: [] };
    const stops = [
      ...row.querySelectorAll<HTMLElement>(
        "a[href], button, input:not([type='hidden']), select, textarea, [tabindex]",
      ),
    ].filter(
      (el) =>
        el.tabIndex >= 0 &&
        !("disabled" in el && el.disabled === true) &&
        !el.closest("[inert]") &&
        el.getClientRects().length > 0 &&
        getComputedStyle(el).visibility !== "hidden",
    );
    const name = (el: HTMLElement) =>
      (el.getAttribute("aria-label") || el.innerText || "").trim().slice(0, 30);
    const index = stops.indexOf(active);
    return {
      before: stops.slice(0, index).map(name),
      after: stops.slice(index + 1).map(name),
    };
  });

const selectedFiles = (page: Page) =>
  page.evaluate(
    ({ count, offset }) =>
      Array.from({ length: count }, (_, i) => i + 1).filter(
        (n) =>
          document.querySelector<HTMLInputElement>(
            `#file_${offset + n} input[type=checkbox]`,
          )?.checked,
      ),
    { count: FILES_COUNT, offset: FILE_ID_OFFSET },
  );

const openMyDocuments = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/rooms/personal/filter?folder=${FOLDER_ID}`);
  await expect(page.getByTestId("table-body")).toBeVisible();
  await expect(page.locator(`#file_${fileId(FILES_COUNT)}`)).toBeAttached();
  await page.waitForLoadState("networkidle");
};

test.describe("Files list: the focus follows the keyboard", () => {
  test.beforeEach(async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      filesListHandler,
    );
    await openMyDocuments(page, baseUrl);
  });

  test("the arrows move the focus to the caret row, and still select", async ({
    page,
  }) => {
    await page.keyboard.press("ArrowDown");
    await expect.poll(async () => (await focus(page)).row).toBe(fileRow(1));
    expect((await focus(page)).isRow).toBe(true);
    await expect.poll(() => selectedFiles(page)).toEqual([1]);

    await page.keyboard.press("ArrowDown");
    await expect.poll(async () => (await focus(page)).row).toBe(fileRow(2));
    await expect.poll(() => selectedFiles(page)).toEqual([2]);

    await page.keyboard.press("ArrowUp");
    await expect.poll(async () => (await focus(page)).row).toBe(fileRow(1));
    await expect.poll(() => selectedFiles(page)).toEqual([1]);
  });

  test("Tab goes through the rest of the row's controls, then out of the list", async ({
    page,
  }) => {
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect.poll(async () => (await focus(page)).row).toBe(fileRow(2));

    const { after } = await rowStopsAroundFocus(page);
    for (const name of after) {
      await page.keyboard.press("Tab");
      const where = await focus(page);
      expect(where.row, `Tab left the row before ${name}`).toBe(fileRow(2));
      expect(where.name).toBe(name);
    }

    // Past the row's last control: out of the list, into no other row.
    await page.keyboard.press("Tab");
    const out = await focus(page);
    expect(out.row, `Tab went on into ${out.row}`).toBeNull();
  });

  test("Shift+Tab goes back through the row's controls to the row, then out of the list, and Tab comes back to the caret row", async ({
    page,
  }) => {
    for (const key of ["ArrowDown", "ArrowDown", "ArrowDown"])
      await page.keyboard.press(key);
    await expect.poll(async () => (await focus(page)).row).toBe(fileRow(3));

    // Into the row's controls, to its last one.
    const { after } = await rowStopsAroundFocus(page);
    for (const _ of after) await page.keyboard.press("Tab");
    expect((await focus(page)).row).toBe(fileRow(3));

    // Back through them, and from the first one to the row itself.
    for (let i = 0; i < after.length; i += 1)
      await page.keyboard.press("Shift+Tab");
    const onRow = await focus(page);
    expect(onRow.row).toBe(fileRow(3));
    expect(onRow.isRow).toBe(true);

    // From the row, out of the list.
    await page.keyboard.press("Shift+Tab");
    const out = await focus(page);
    expect(out.row, `Shift+Tab went into ${out.row}`).toBeNull();
    expect(out.tag).not.toBe("body");

    // Back in: to the caret's row as a whole, not the first row.
    await page.keyboard.press("Tab");
    await expect.poll(async () => (await focus(page)).row).toBe(fileRow(3));
    expect((await focus(page)).isRow).toBe(true);
  });

  test("coming back from outside the page lands on the caret row, not the last row", async ({
    page,
  }) => {
    for (const key of ["ArrowDown", "ArrowDown", "ArrowDown"])
      await page.keyboard.press(key);
    await expect.poll(async () => (await focus(page)).row).toBe(fileRow(3));
    await page.keyboard.press("Escape");
    await expect.poll(() => selectedFiles(page)).toEqual([]);

    // What Shift+Tab back from the browser's toolbar does: the page loses
    // the focus, then the last row's last control gets it, with no key
    // press the page sees.
    await page.keyboard.press("Shift");
    await page.evaluate((id) => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      const row = document.getElementById(id);
      const controls = row?.querySelectorAll<HTMLElement>(
        "a[href], [tabindex='0'], button",
      );
      controls?.[controls.length - 1]?.focus();
    }, fileRow(FILES_COUNT));

    await expect.poll(async () => (await focus(page)).row).toBe(fileRow(3));
    expect((await focus(page)).isRow).toBe(true);
    await expect.poll(() => selectedFiles(page)).toEqual([3]);
  });

  test("Tab into the list focuses a row and selects it", async ({ page }) => {
    // From the search box, through the controls above the list, into it.
    await page
      .locator("#filter_search-input input, input#filter_search-input")
      .first()
      .focus();
    let where = await focus(page);
    for (let i = 0; i < 20 && !where.row; i += 1) {
      await page.keyboard.press("Tab");
      where = await focus(page);
    }

    expect(where.row).toBe(fileRow(1));
    expect(where.isRow).toBe(true);
    await expect.poll(() => selectedFiles(page)).toEqual([1]);

    // The arrows go on from there, the selection with them.
    await page.keyboard.press("ArrowDown");
    await expect.poll(async () => (await focus(page)).row).toBe(fileRow(2));
    await expect.poll(() => selectedFiles(page)).toEqual([2]);
  });

  test("the list's hotkeys still work with the focus on a row's name", async ({
    page,
  }) => {
    await page.keyboard.press("ArrowDown");
    await expect.poll(async () => (await focus(page)).row).toBe(fileRow(1));
    expect((await focus(page)).isRow).toBe(true);

    // Shift+Down extends the selection and takes the focus along.
    await page.keyboard.press("Shift+ArrowDown");
    await expect.poll(() => selectedFiles(page)).toEqual([1, 2]);
    await expect.poll(async () => (await focus(page)).row).toBe(fileRow(2));

    // x toggles the caret row.
    await page.keyboard.press("x");
    await expect.poll(() => selectedFiles(page)).toEqual([1]);
  });

  test("in tiles too, the arrows move the focus and Tab leaves the list", async ({
    page,
  }) => {
    await page.keyboard.press("KeyV");
    await expect(page.getByTestId("tile_0")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect.poll(async () => (await focus(page)).row).not.toBeNull();
    const first = await focus(page);
    await page.keyboard.press("ArrowRight");
    // Not the list itself, which holds the focus for a moment in between.
    await expect
      .poll(async () => {
        const { row } = await focus(page);
        return row !== null && row !== first.row;
      })
      .toBe(true);
    const second = await focus(page);
    expect(second.row).not.toBeNull();

    let where = second;
    for (let i = 0; i < 10 && where.row === second.row; i += 1) {
      await page.keyboard.press("Tab");
      where = await focus(page);
    }
    expect(where.row, `Tab went on into ${where.row}`).toBeNull();
  });

  test("a click selects as before and does not pull the focus to the row", async ({
    page,
  }) => {
    const row = page.locator(`#${fileRow(4)}`);
    await row.locator(".table-container_cell").nth(2).click();

    await expect.poll(() => selectedFiles(page)).toEqual([4]);
    expect((await focus(page)).isRow).toBe(false);
  });
});

test.describe("Rooms list: the focus follows the keyboard", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
    );
  });

  test("arrows move the focus between rooms, and Tab leaves the list", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/rooms/shared/`);
    await expect(page.getByTestId("table-body")).toBeVisible();
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("ArrowDown");
    const first = await expect
      .poll(async () => (await focus(page)).row)
      .not.toBeNull()
      .then(() => focus(page));
    await page.keyboard.press("ArrowDown");
    // Not the list itself, which holds the focus for a moment in between.
    await expect
      .poll(async () => {
        const { row } = await focus(page);
        return row !== null && row !== first.row;
      })
      .toBe(true);
    const second = await focus(page);
    expect(second.row).not.toBeNull();

    let where = second;
    for (let i = 0; i < 15 && where.row === second.row; i += 1) {
      await page.keyboard.press("Tab");
      where = await focus(page);
    }
    expect(where.row, `Tab went on into ${where.row}`).toBeNull();
  });
});
