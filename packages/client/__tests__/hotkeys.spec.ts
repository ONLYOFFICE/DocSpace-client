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
} from "@docspace/shared/__mocks__/handlers";
import { myDocumentsResolver } from "@docspace/shared/__mocks__/handlers/files/documents";
import { BASE_URL } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

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

const FOLDER_IDS = [2001, 2002];

const twoFoldersHandler = http.get(
  `${BASE_URL}:${TEST_PORT}/api/2.0/files/${FOLDER_ID}`,
  async () => {
    const body = await myDocumentsResolver(true).json();
    const [template] = body.response.folders;

    body.response.current.id = FOLDER_ID;
    body.response.files = [];
    body.response.folders = FOLDER_IDS.map((id, index) => ({
      ...template,
      id,
      parentId: FOLDER_ID,
      title: `Folder ${index + 1}`,
    }));
    body.response.count = FOLDER_IDS.length;
    body.response.total = FOLDER_IDS.length;

    return new Response(JSON.stringify(body));
  },
);

const finishedOperation = {
  id: "delete-operation",
  operation: 1,
  progress: 100,
  error: "",
  processed: "1",
  finished: true,
  files: [],
  folders: [],
};

const deleteOperationHandlers = [
  http.put(`${BASE_URL}:${TEST_PORT}/api/2.0/files/fileops/delete`, () =>
    Response.json({ response: [finishedOperation], status: 0 }),
  ),
  http.get(`${BASE_URL}:${TEST_PORT}/api/2.0/files/fileops`, () =>
    Response.json({ response: [finishedOperation], status: 0 }),
  ),
];

const selectedFolders = (page: Page) =>
  page.evaluate(
    (ids) =>
      ids.filter(
        (id) =>
          document.querySelector<HTMLInputElement>(
            `#folder_${id} input[type=checkbox]`,
          )?.checked,
      ),
    FOLDER_IDS,
  );

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

const caretFile = (page: Page) =>
  page.evaluate(
    ({ count, offset }) =>
      Array.from({ length: count }, (_, i) => i + 1).find((n) => {
        const row = document.querySelector(`#file_${offset + n}`);
        if (!row) return false;
        return [row, ...row.querySelectorAll("*")].some((el) =>
          /hotkey-?border/i.test(String(el.className)),
        );
      }) ?? null,
    { count: FILES_COUNT, offset: FILE_ID_OFFSET },
  );

const tilesInRow = (page: Page) =>
  page.evaluate(() => {
    const tops = Array.from(
      document.querySelectorAll('[data-testid^="tile_"]'),
    ).map((el) => Math.round(el.getBoundingClientRect().top));
    return tops.filter((top) => top === tops[0]).length;
  });

const gridColumns = (page: Page) =>
  page.evaluate(() => {
    const row = document.querySelector(".Item.isFile");
    return row
      ? window.getComputedStyle(row).gridTemplateColumns.split(" ").length
      : 0;
  });

const press = async (page: Page, keys: string[]) => {
  for (const key of keys) await page.keyboard.press(key);
};

const openMyDocuments = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/rooms/personal/filter?folder=${FOLDER_ID}`);
  await expect(page.getByTestId("table-body")).toBeVisible();
  await expect(page.locator(`#file_${fileId(FILES_COUNT)}`)).toBeAttached();
};

const switchToTiles = async (page: Page) => {
  await page.keyboard.press("KeyV");
  await expect(page.getByTestId("tile_0")).toBeVisible();
};

test.describe("Hotkeys in the files list", () => {
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

  test.describe("navigation and selection", () => {
    test("arrows and j/k move the selection", async ({ page }) => {
      await page.keyboard.press("ArrowDown");
      await expect.poll(() => selectedFiles(page)).toEqual([1]);

      await page.keyboard.press("ArrowDown");
      await expect.poll(() => selectedFiles(page)).toEqual([2]);

      await page.keyboard.press("ArrowUp");
      await expect.poll(() => selectedFiles(page)).toEqual([1]);

      await page.keyboard.press("KeyJ");
      await expect.poll(() => selectedFiles(page)).toEqual([2]);

      await page.keyboard.press("KeyK");
      await expect.poll(() => selectedFiles(page)).toEqual([1]);
    });

    test("Ctrl+A selects everything, Esc and Shift+N clear it", async ({
      page,
    }) => {
      const all = Array.from({ length: FILES_COUNT }, (_, i) => i + 1);

      await press(page, ["ArrowDown", "Control+KeyA"]);
      await expect.poll(() => selectedFiles(page)).toEqual(all);

      await page.keyboard.press("Escape");
      await expect.poll(() => selectedFiles(page)).toEqual([]);

      await page.keyboard.press("Control+KeyA");
      await expect.poll(() => selectedFiles(page)).toEqual(all);

      await page.keyboard.press("Shift+KeyN");
      await expect.poll(() => selectedFiles(page)).toEqual([]);
    });

    test("Esc after Ctrl+A keeps the caret in place", async ({ page }) => {
      await press(page, [
        "ArrowDown",
        "ArrowDown",
        "ArrowDown",
        "ArrowDown",
        "Control+KeyA",
        "Escape",
      ]);
      await expect.poll(() => selectedFiles(page)).toEqual([]);
      await expect.poll(() => caretFile(page)).toBe(4);

      await page.keyboard.press("ArrowDown");
      await expect.poll(() => selectedFiles(page)).toEqual([5]);
    });

    test("Esc after a mouse click puts the caret on the clicked row", async ({
      page,
    }) => {
      await page.locator(`#file_${fileId(4)}`).getByText("7.54 KB").click();
      await expect.poll(() => selectedFiles(page)).toEqual([4]);
      await expect.poll(() => caretFile(page)).toBeNull();

      await page.keyboard.press("Escape");
      await expect.poll(() => selectedFiles(page)).toEqual([]);
      await expect.poll(() => caretFile(page)).toBe(4);

      await page.keyboard.press("ArrowDown");
      await expect.poll(() => selectedFiles(page)).toEqual([5]);
    });

    test("Shift+Down after Esc starts the range at the caret", async ({
      page,
    }) => {
      await press(page, ["ArrowDown", "ArrowDown", "ArrowDown", "Escape"]);
      await expect.poll(() => caretFile(page)).toBe(3);

      await page.keyboard.press("Shift+ArrowDown");
      await expect.poll(() => selectedFiles(page)).toEqual([3, 4]);

      await page.keyboard.press("Shift+ArrowDown");
      await expect.poll(() => selectedFiles(page)).toEqual([3, 4, 5]);
    });

    test("Shift+Up after Esc starts the range at the caret", async ({
      page,
    }) => {
      await press(page, ["ArrowDown", "ArrowDown", "ArrowDown", "Escape"]);

      await page.keyboard.press("Shift+ArrowUp");
      await expect.poll(() => selectedFiles(page)).toEqual([2, 3]);

      await page.keyboard.press("Shift+ArrowUp");
      await expect.poll(() => selectedFiles(page)).toEqual([1, 2, 3]);
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

      await pressPhysical(cyrillicJ, "KeyJ", 74);
      await expect.poll(() => selectedFiles(page)).toEqual([1]);

      await pressPhysical(cyrillicJ, "KeyJ", 74);
      await expect.poll(() => selectedFiles(page)).toEqual([2]);

      await pressPhysical(cyrillicK, "KeyK", 75);
      await expect.poll(() => selectedFiles(page)).toEqual([1]);
    });
  });

  test.describe("open layers", () => {
    test("list hotkeys do nothing under the delete confirmation", async ({
      page,
    }) => {
      const submit = page.getByTestId("delete_dialog_modal_submit");

      await press(page, ["ArrowDown", "Delete"]);
      await expect(submit).toBeVisible();

      await press(page, ["Control+KeyA", "KeyV", "Shift+KeyD"]);
      await expect.poll(() => selectedFiles(page)).toEqual([1]);
      await expect(page.getByTestId("tile_0")).toBeHidden();
      await expect(page.getByTestId("new_document_text_input")).toBeHidden();
      await expect(submit).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(submit).toBeHidden();
      await expect.poll(() => selectedFiles(page)).toEqual([1]);
    });

    test("Esc closes the Shift+C context menu and keeps the selection", async ({
      page,
    }) => {
      const menu = page.locator(".p-contextmenu").filter({ visible: true });

      await press(page, ["ArrowDown", "Shift+KeyC"]);
      await expect(menu).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect.poll(() => selectedFiles(page)).toEqual([1]);
    });
  });

  test.describe("actions", () => {
    test("Delete asks for confirmation and Esc cancels it", async ({
      page,
    }) => {
      const deleteRequests: string[] = [];
      page.on("request", (request) => {
        if (/fileops\/delete/.test(request.url()))
          deleteRequests.push(request.url());
      });

      await press(page, ["ArrowDown", "Delete"]);
      await expect(page.getByTestId("delete_dialog_modal_submit")).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(page.getByTestId("delete_dialog_modal_submit")).toBeHidden();
      expect(deleteRequests).toEqual([]);
    });

    test("F2 opens rename for the selected file", async ({ page }) => {
      await press(page, ["ArrowDown", "F2"]);

      await expect(page.getByTestId("rename_text_input")).toBeVisible();
      await expect(page.getByTestId("rename_text_input")).toHaveValue(
        /File 01/,
      );
    });

    test("V switches between the table and tiles", async ({ page }) => {
      await switchToTiles(page);
      await expect(page.getByTestId("table-body")).toBeHidden();

      await page.keyboard.press("KeyV");
      await expect(page.getByTestId("table-body")).toBeVisible();
    });

    test("Ctrl+/ opens the hotkeys panel", async ({ page }) => {
      await page.keyboard.press("Control+Slash");

      await expect(
        page.getByRole("dialog").filter({ hasText: "Hotkeys" }),
      ).toBeVisible();
    });

    test("Shift+D opens New document when Shift is released first", async ({
      page,
    }) => {
      await page.keyboard.down("Shift");
      await page.keyboard.down("KeyD");
      await page.keyboard.up("Shift");
      await page.keyboard.up("KeyD");

      const input = page.getByTestId("new_document_text_input");
      await expect(input).toBeVisible();
      await expect(input).not.toHaveValue(/[dD]$/);
    });

    test("Shift+D opens New document when the letter is released first", async ({
      page,
    }) => {
      await page.keyboard.down("Shift");
      await page.keyboard.down("KeyD");
      await page.keyboard.up("KeyD");
      await page.keyboard.up("Shift");

      const input = page.getByTestId("new_document_text_input");
      await expect(input).toBeVisible();
      await expect(input).not.toHaveValue(/[dD]$/);
    });
  });

  test.describe("clipboard", () => {
    const conflictCheck = /files\/fileops\/move\?/;

    test("cut and paste into the same folder does nothing", async ({
      page,
    }) => {
      const checks: string[] = [];
      page.on("request", (request) => {
        if (conflictCheck.test(request.url())) checks.push(request.url());
      });

      await press(page, ["ArrowDown", "Control+KeyX", "Control+KeyV"]);
      await page.waitForTimeout(1000);

      expect(checks).toEqual([]);
    });

    test("copy and paste into the same folder checks for conflicts", async ({
      page,
    }) => {
      const check = page.waitForRequest((request) =>
        conflictCheck.test(request.url()),
      );

      await press(page, ["ArrowDown", "Control+KeyC", "Control+KeyV"]);

      expect((await check).url()).toContain(`fileIds=${fileId(1)}`);
    });
  });

  test.describe("tiles", () => {
    for (const width of [1280, 1600]) {
      test(`Down and Up step by a whole row at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 1024 });
        await switchToTiles(page);

        const columns = await tilesInRow(page);
        expect(columns).toBeGreaterThan(1);
        expect(columns).toBeLessThan(FILES_COUNT);
        await expect.poll(() => caretFile(page)).toBe(1);

        await page.keyboard.press("ArrowDown");
        await expect.poll(() => selectedFiles(page)).toEqual([columns + 1]);

        await page.keyboard.press("ArrowUp");
        await expect.poll(() => selectedFiles(page)).toEqual([1]);
      });
    }

    test("Down follows the grid when the info panel narrows it", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1600, height: 1024 });
      await switchToTiles(page);
      const columnsBefore = await tilesInRow(page);

      await page.locator("#info-panel-toggle--open").click();
      await expect.poll(() => tilesInRow(page)).toBeLessThan(columnsBefore);

      const columns = await tilesInRow(page);
      expect(await gridColumns(page)).toBe(columns);

      await page.keyboard.press("Shift");
      await expect.poll(() => caretFile(page)).toBe(1);

      await page.keyboard.press("ArrowDown");
      await expect.poll(() => selectedFiles(page)).toEqual([columns + 1]);
    });

    test("Down follows the grid after the window is resized", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1600, height: 1024 });
      await switchToTiles(page);
      const columnsBefore = await tilesInRow(page);

      await page.setViewportSize({ width: 1150, height: 1024 });
      await expect.poll(() => tilesInRow(page)).toBeLessThan(columnsBefore);

      const columns = await tilesInRow(page);
      expect(await gridColumns(page)).toBe(columns);
      await expect.poll(() => caretFile(page)).toBe(1);

      await page.keyboard.press("ArrowDown");
      await expect.poll(() => selectedFiles(page)).toEqual([columns + 1]);
    });

    test("Down after deleting the caret folder moves to the folder left", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      mockRequest.use(...deleteOperationHandlers, twoFoldersHandler);
      await page.goto(`${baseUrl}/rooms/personal/filter?folder=${FOLDER_ID}`);
      await expect(page.locator(`#folder_${FOLDER_IDS[1]}`)).toBeVisible();
      if (!(await page.getByTestId("tile_0").isVisible()))
        await switchToTiles(page);

      await press(page, ["ArrowRight", "ArrowRight"]);
      await expect.poll(() => selectedFolders(page)).toEqual([FOLDER_IDS[1]]);

      await page.keyboard.press("Delete");
      await page.getByTestId("delete_dialog_modal_submit").click();
      await expect(page.locator(`#folder_${FOLDER_IDS[1]}`)).toBeHidden();

      await page.keyboard.press("ArrowDown");
      await expect.poll(() => selectedFolders(page)).toEqual([FOLDER_IDS[0]]);
      expect(pageErrors).toEqual([]);
    });

    test("Shift+Down after Esc selects from the caret to the tile below", async ({
      page,
    }) => {
      await switchToTiles(page);
      const columns = await tilesInRow(page);

      await expect.poll(() => caretFile(page)).toBe(1);

      await press(page, ["ArrowRight", "Escape"]);
      await expect.poll(() => selectedFiles(page)).toEqual([]);
      await expect.poll(() => caretFile(page)).toBe(2);

      await page.keyboard.press("Shift+ArrowDown");
      await expect
        .poll(() => selectedFiles(page))
        .toEqual(Array.from({ length: columns + 1 }, (_, i) => i + 2));
    });
  });
});
