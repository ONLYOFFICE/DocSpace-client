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
  recentHandler,
} from "@docspace/shared/__mocks__/handlers";
import { myDocumentsResolver } from "@docspace/shared/__mocks__/handlers/files/documents";
import { BASE_URL } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The documents list drawn on the ui-kit DataTable: the header and the rows
 * stay in line, the column widths are shares of the table kept per section
 * and never rewritten by a narrower window or the info panel, the list loads
 * its next page on scroll, and the Files row behaviour (hotkeys, drag and
 * drop, the selection rectangle) works on its rows.
 */

const FOLDER_ID = 12764;
const FOLDERS_COUNT = 2;
/** More than one page, whatever page size the list asks for. */
const TOTAL = 260;

const FILES_URL = `/rooms/personal/filter?folder=${FOLDER_ID}`;
const RECENT_URL = "/recent/filter?folder=28934";

const FILES_WIDTHS_KEY = "filesColumnsWidths_ver-1";
const RECENT_WIDTHS_KEY = "recentColumnsWidths_ver-1";
const INFO_PANEL_WIDTH_KEY = "infoPanelWidth";

const NAME_MIN_WIDTH = 210;
const DROP_OVER_BACKGROUND = "rgb(255, 239, 175)";

/**
 * My documents with two folders and `TOTAL - 2` files, served a page at a
 * time from `startIndex` and `count` as the API does. Other folders fall
 * through to the default handlers.
 */
const pagedListHandler = http.get(
  `${BASE_URL}:${TEST_PORT}/api/2.0/files/:id`,
  async ({ params, request }) => {
    if (params.id !== String(FOLDER_ID) && params.id !== "@my")
      return undefined;

    const url = new URL(request.url);
    const startIndex = Number(url.searchParams.get("startIndex") ?? 0);
    const count = Number(url.searchParams.get("count") ?? 25);

    const body = await myDocumentsResolver(true).json();
    const [folder] = body.response.folders;
    const [file] = body.response.files;

    const items = Array.from({ length: TOTAL }, (_, i) =>
      i < FOLDERS_COUNT
        ? {
            ...folder,
            id: 2000 + i,
            parentId: FOLDER_ID,
            title: `Folder ${i + 1}`,
          }
        : {
            ...file,
            id: 1000 + i,
            folderId: FOLDER_ID,
            title: `File ${String(i + 1).padStart(3, "0")}`,
          },
    );
    const page = items.slice(startIndex, startIndex + count);

    body.response.current.id = FOLDER_ID;
    body.response.folders = page.filter((item) => "parentId" in item);
    body.response.files = page.filter((item) => !("parentId" in item));
    body.response.startIndex = startIndex;
    body.response.count = page.length;
    body.response.total = TOTAL;
    body.response.current.filesCount = TOTAL - FOLDERS_COUNT;
    body.response.current.foldersCount = FOLDERS_COUNT;

    return new Response(JSON.stringify(body));
  },
);

const header = (page: Page) => page.getByTestId("table-header");
const body = (page: Page) => page.getByTestId("table-body");
const row = (page: Page, index: number) =>
  page.getByTestId(`table-row-${index}`);

const openMyDocuments = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${FILES_URL}`);
  await expect(row(page, 0)).toBeVisible();
};

/** Width of each rendered column, by column id. */
const columnWidths = (page: Page): Promise<Record<string, number>> =>
  header(page)
    .getByRole("columnheader")
    .evaluateAll((cells) =>
      Object.fromEntries(
        cells.map((cell) => [
          cell.getAttribute("data-column-id") ?? "",
          cell.getBoundingClientRect().width,
        ]),
      ),
    );

/** Each resizable column's share of the space they split between them. */
const shares = async (page: Page) => {
  const widths = await columnWidths(page);
  const flexible = Object.entries(widths).filter(
    ([id]) => id !== "Settings" && id !== "ContextMenu",
  );
  const total = flexible.reduce((sum, [, width]) => sum + width, 0);
  return Object.fromEntries(flexible.map(([id, width]) => [id, width / total]));
};

const expectSameShares = (
  actual: Record<string, number>,
  expected: Record<string, number>,
) => {
  expect(Object.keys(actual)).toEqual(Object.keys(expected));
  for (const id of Object.keys(expected))
    expect(actual[id], id).toBeCloseTo(expected[id], 2);
};

const storedRecord = (page: Page, prefix: string) =>
  page.evaluate(
    (keyPrefix) =>
      Object.entries(localStorage).find(([key]) =>
        key.startsWith(keyPrefix),
      )?.[1] ?? null,
    prefix,
  );

/**
 * The largest distance between a cell's edges and its column title's, over
 * every rendered row; Infinity when a row has a different number of cells.
 */
const misalignment = (page: Page) =>
  page.evaluate(() => {
    const titles = Array.from(
      document.querySelectorAll(
        '[data-testid="table-header"] [role="columnheader"]',
      ),
      (cell) => cell.getBoundingClientRect(),
    );
    let worst = 0;
    for (const rowElement of document.querySelectorAll(
      '[data-testid="table-body"] [data-testid^="table-row-"]',
    )) {
      const cells = Array.from(
        rowElement.querySelectorAll(':scope > [role="cell"]'),
        (cell) => cell.getBoundingClientRect(),
      );
      if (cells.length !== titles.length) return Infinity;
      cells.forEach((cell, i) => {
        worst = Math.max(
          worst,
          Math.abs(cell.left - titles[i].left),
          Math.abs(cell.right - titles[i].right),
        );
      });
    }
    return worst;
  });

/** Drags the edge after `columnId` by `dx` pixels with the mouse. */
const dragEdge = async (page: Page, columnId: string, dx: number) => {
  const box = await page
    .getByTestId(`data-table-resize-${columnId}`)
    .boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y, { steps: 8 });
  await page.mouse.up();
};

const setInfoPanelOpen = async (page: Page, open: boolean) => {
  const panel = page.locator("#InfoPanelWrapper");
  if ((await panel.isVisible()) !== open)
    await page.locator(".info-panel-toggle").first().click();
  if (open) await expect(panel).toBeVisible();
  else await expect(panel).toBeHidden();
};

const scrollList = (page: Page, dy: number) =>
  body(page)
    .hover({ position: { x: 600, y: 10 } })
    .then(() => page.mouse.wheel(0, dy));

/** Keeps what the page copies, which `copy-to-clipboard` selects first. */
const recordCopiedText = (page: Page) =>
  page.addInitScript(() => {
    const execCommand = document.execCommand.bind(document);
    document.execCommand = (command, ...args) => {
      if (command === "copy")
        Object.assign(window, {
          __copiedText: window.getSelection()?.toString() ?? "",
        });
      return execCommand(command, ...args);
    };
  });

const copiedText = (page: Page) =>
  page.evaluate(() => Reflect.get(window, "__copiedText") ?? null);

test.describe("Files list on the DataTable", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      // First: the Recent handler answers every numeric folder id.
      pagedListHandler,
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      recentHandler(TEST_PORT, false),
    );
  });

  test("keeps every row in line with the header, scrolled or resized", async ({
    page,
    baseUrl,
  }) => {
    await openMyDocuments(page, baseUrl);
    expect(await misalignment(page)).toBeLessThanOrEqual(0.5);

    await scrollList(page, 3000);
    await expect.poll(() => misalignment(page)).toBeLessThanOrEqual(0.5);

    await dragEdge(page, "Name", 120);
    expect(await misalignment(page)).toBeLessThanOrEqual(0.5);

    await page.setViewportSize({ width: 1100, height: 900 });
    await expect.poll(() => misalignment(page)).toBeLessThanOrEqual(0.5);
  });

  test("keeps a dragged edge across a reload, as shares in its own record", async ({
    page,
    baseUrl,
  }) => {
    await openMyDocuments(page, baseUrl);
    expect(await storedRecord(page, FILES_WIDTHS_KEY)).toBeNull();

    const before = await columnWidths(page);
    await dragEdge(page, "Name", 100);
    const after = await columnWidths(page);
    expect(after.Name).toBeCloseTo(before.Name + 100, 0);

    const record = JSON.parse((await storedRecord(page, FILES_WIDTHS_KEY))!);
    expect(record.v).toBe(2);
    expect(
      Object.values(record.widths as Record<string, number>).reduce(
        (sum, share) => sum + share,
        0,
      ),
    ).toBeCloseTo(1, 5);

    await page.reload();
    await expect(row(page, 0)).toBeVisible();
    const reloaded = await columnWidths(page);
    for (const id of Object.keys(after))
      expect(reloaded[id], id).toBeCloseTo(after[id], 0);
  });

  test("lays out a narrower window by the same shares without rewriting them", async ({
    page,
    baseUrl,
  }) => {
    await openMyDocuments(page, baseUrl);
    await dragEdge(page, "Name", 40);
    const wide = await shares(page);
    const record = await storedRecord(page, FILES_WIDTHS_KEY);

    // A second window on the same record: it reads it when it mounts.
    await page.setViewportSize({ width: 1180, height: 900 });
    await page.reload();
    await expect(row(page, 0)).toBeVisible();

    expectSameShares(await shares(page), wide);
    expect(await storedRecord(page, FILES_WIDTHS_KEY)).toBe(record);
  });

  test("narrows with the info panel and writes nothing", async ({
    page,
    baseUrl,
  }) => {
    await openMyDocuments(page, baseUrl);
    const closed = await shares(page);
    const closedName = (await columnWidths(page)).Name;

    await setInfoPanelOpen(page, true);
    await expect
      .poll(async () => (await columnWidths(page)).Name)
      .toBeLessThan(closedName);
    expectSameShares(await shares(page), closed);
    expect(await misalignment(page)).toBeLessThanOrEqual(0.5);

    await setInfoPanelOpen(page, false);
    expectSameShares(await shares(page), closed);
    expect(await storedRecord(page, FILES_WIDTHS_KEY)).toBeNull();
  });

  test("collapses to the name column when the list has little room, and comes back", async ({
    page,
    baseUrl,
  }) => {
    await page.addInitScript(
      (key) => localStorage.setItem(key, "800"),
      INFO_PANEL_WIDTH_KEY,
    );
    await page.setViewportSize({ width: 1280, height: 800 });
    await openMyDocuments(page, baseUrl);
    const full = await shares(page);

    await setInfoPanelOpen(page, true);
    await expect
      .poll(async () => Object.keys(await columnWidths(page)))
      .toEqual(["Name", "Settings"]);
    expect((await columnWidths(page)).Name).toBeGreaterThanOrEqual(
      NAME_MIN_WIDTH,
    );
    await expect(page.getByTestId("data-table-settings-button")).toBeDisabled();

    await setInfoPanelOpen(page, false);
    await expect
      .poll(async () => Object.keys(await shares(page)))
      .toEqual(Object.keys(full));
    expectSameShares(await shares(page), full);
    expect(await storedRecord(page, FILES_WIDTHS_KEY)).toBeNull();
  });

  test("remembers the widths of each section apart", async ({
    page,
    baseUrl,
  }) => {
    await openMyDocuments(page, baseUrl);
    const defaults = await shares(page);
    await dragEdge(page, "Name", 100);
    const dragged = await columnWidths(page);

    await page.goto(`${baseUrl}${RECENT_URL}`);
    await expect(row(page, 0)).toBeVisible();
    expect((await shares(page)).Name).toBeCloseTo(defaults.Name, 2);
    expect(await storedRecord(page, RECENT_WIDTHS_KEY)).toBeNull();

    await dragEdge(page, "Name", -60);
    expect(await storedRecord(page, RECENT_WIDTHS_KEY)).not.toBeNull();

    await openMyDocuments(page, baseUrl);
    const back = await columnWidths(page);
    for (const id of Object.keys(dragged))
      expect(back[id], id).toBeCloseTo(dragged[id], 0);
  });

  test("loads the next page when scrolled to the end", async ({
    page,
    baseUrl,
  }) => {
    const pages: number[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.endsWith(`/files/${FOLDER_ID}`))
        pages.push(Number(url.searchParams.get("startIndex") ?? 0));
    });

    await openMyDocuments(page, baseUrl);
    const table = page.getByTestId("files-data-table");
    const loaded = Number(await table.getAttribute("aria-rowcount")) - 1;
    expect(loaded).toBeLessThan(TOTAL);

    await expect
      .poll(
        async () => {
          await scrollList(page, 5000);
          return pages.filter((start) => start > 0).length;
        },
        { timeout: 15_000 },
      )
      .toBeGreaterThan(0);
    expect(pages).toContain(loaded);

    await expect
      .poll(async () => Number(await table.getAttribute("aria-rowcount")) - 1)
      .toBeGreaterThan(loaded);
    expect(await misalignment(page)).toBeLessThanOrEqual(0.5);
  });

  test("keeps the keyboard cursor in view below the header", async ({
    page,
    baseUrl,
  }) => {
    await openMyDocuments(page, baseUrl);

    for (let i = 0; i < 20; i += 1) await page.keyboard.press("ArrowDown");

    const caret = page.locator(".table-hotkey-border");
    await expect(caret.getByTestId("table-row-19")).toBeVisible();

    const [caretBox, headerBox] = await Promise.all([
      caret.getByTestId("table-row-19").boundingBox(),
      header(page).boundingBox(),
    ]);
    const viewport = page.viewportSize();
    expect(caretBox!.y).toBeGreaterThanOrEqual(
      headerBox!.y + headerBox!.height - 1,
    );
    expect(caretBox!.y + caretBox!.height).toBeLessThanOrEqual(
      viewport!.height,
    );
  });

  test("copies the selected rows with Ctrl+Shift+C", async ({
    page,
    baseUrl,
  }) => {
    await recordCopiedText(page);
    await openMyDocuments(page, baseUrl);

    await row(page, 2).locator('[role="cell"]').nth(1).click();
    await row(page, 4)
      .locator('[role="cell"]')
      .nth(1)
      .click({ modifiers: ["Control"] });
    await page.keyboard.press("Control+Shift+KeyC");

    await expect.poll(() => copiedText(page)).toContain("File 003");
    expect(await copiedText(page)).toContain("File 005");
    expect(await copiedText(page)).not.toContain("File 004");
  });

  test("tints the folder under a dragged file across its whole row", async ({
    page,
    baseUrl,
  }) => {
    await openMyDocuments(page, baseUrl);

    const file = row(page, 3);
    await file.locator('[role="cell"]').nth(1).click();
    const from = (await file.boundingBox())!;
    const to = (await row(page, 0).boundingBox())!;

    await page.mouse.move(from.x + 300, from.y + 24);
    await page.mouse.down();
    for (let i = 1; i <= 10; i += 1)
      await page.mouse.move(
        from.x + 300,
        from.y + 24 - ((from.y - to.y) * i) / 10,
      );

    const look = (index: number) =>
      row(page, index).evaluate((element) => {
        const strip = getComputedStyle(element, "::before");
        return {
          strip: strip.backgroundColor,
          stripWidth: parseFloat(strip.width),
          rowWidth: element.getBoundingClientRect().width,
          opacity: getComputedStyle(element.querySelector('[role="cell"]')!)
            .opacity,
        };
      });

    await expect
      .poll(async () => (await look(0)).strip)
      .toBe(DROP_OVER_BACKGROUND);
    const folder = await look(0);
    expect(folder.stripWidth).toBeGreaterThanOrEqual(folder.rowWidth);
    expect(folder.opacity).toBe("1");

    // The other folder can take the drop too; the files cannot, and fade.
    expect((await look(1)).strip).not.toBe("rgba(0, 0, 0, 0)");
    expect((await look(5)).opacity).toBe("0.4");

    await page.mouse.move(from.x + 300, 880);
    await page.keyboard.press("Escape");
    await page.mouse.up();
  });

  test("selects the rows a rectangle is drawn over after a scroll", async ({
    page,
    baseUrl,
  }) => {
    await openMyDocuments(page, baseUrl);
    await scrollList(page, 480);
    await expect.poll(() => misalignment(page)).toBeLessThanOrEqual(0.5);

    const first = (await row(page, 12).boundingBox())!;
    const last = (await row(page, 14).boundingBox())!;
    const table = (await page.getByTestId("files-data-table").boundingBox())!;

    // From the gutter beside the first row into the last one's name.
    const start = { x: table.x - 10, y: first.y + first.height / 2 };
    const end = { x: table.x + 200, y: last.y + last.height / 2 };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i += 1)
      await page.mouse.move(
        start.x + ((end.x - start.x) * i) / 10,
        start.y + ((end.y - start.y) * i) / 10,
      );
    await page.mouse.up();

    for (const index of [12, 13, 14])
      await expect(row(page, index)).toHaveAttribute("aria-selected", "true");
    for (const index of [11, 15])
      await expect(row(page, index)).not.toHaveAttribute(
        "aria-selected",
        "true",
      );
  });
});
