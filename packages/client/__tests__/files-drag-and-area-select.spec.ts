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
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  rootHandler,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { myDocumentsResolver } from "@docspace/shared/__mocks__/handlers/files/documents";
import { BASE_URL, type WorkerFixture } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

// Dropping files onto a folder and rubber-band selection both find the item
// under the pointer by the `value` attribute that the item's DragAndDrop puts
// on its `.files-item` element (`file_<id>_draggable_index_<n>`). The table
// view passes it through its own row; the row and tile views pass it to
// DragAndDrop, and when they stopped doing so both gestures did nothing there.

const MY_DOCUMENTS_ID = 12764;
const FOLDER_ID = 35;
// Three files of the My documents listing, after its one folder.
const FILE_IDS = [10, 11, 12];

const API = `${BASE_URL}:${TEST_PORT}/api/2.0`;

const listingHandler = http.get(`${API}/files/:id`, async ({ params }) => {
  if (params.id === "@root" || params.id === "fileops") return undefined;

  const body = await myDocumentsResolver(true).json();
  const files = FILE_IDS.map((id) =>
    body.response.files.find((file: { id: number }) => file.id === id),
  );
  body.response.folders = body.response.folders.filter(
    (folder: { id: number }) => folder.id === FOLDER_ID,
  );
  body.response.files = files;
  body.response.count = files.length + body.response.folders.length;
  body.response.total = body.response.count;

  return new Response(JSON.stringify(body));
});

type MoveBody = {
  destFolderId?: number | string;
  fileIds?: (number | string)[];
  folderIds?: (number | string)[];
};

const finishedMove = {
  id: "mock-move",
  Operation: 0,
  progress: 100,
  error: "",
  processed: "1",
  finished: true,
  status: 2,
  files: [],
  folders: [],
};

const ok = (response: unknown) =>
  new Response(JSON.stringify({ response, status: 0, statusCode: 200 }));

// The move a drop starts: a conflict check, then the move itself. The PUT
// bodies are collected so a test can tell which items went where.
const moveHandlers = (moves: MoveBody[]) => [
  http.get(`${API}/files/fileops/move`, () => ok([])),
  http.put(`${API}/files/fileops/move`, async ({ request }) => {
    moves.push((await request.clone().json()) as MoveBody);
    return ok([finishedMove]);
  }),
  http.get(`${API}/files/fileops`, () => ok([finishedMove])),
];

const fileSelector = (id: number) => `#file_${id}`;
const folderSelector = `#folder_${FOLDER_ID}`;

// The item's own `.files-item` element - the one the attribute is on.
const filesItem = (page: Page, selector: string) =>
  page.locator(`${selector} .files-item, ${selector}.files-item`).first();

// Whether the list shows the item as selected, in whichever view it is in.
const isSelected = (page: Page, selector: string) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const selected = ".row-selected, .tile-selected, .table-row-selected";
    return (
      el.matches(selected) ||
      !!el.querySelector(`${selected}, input[type=checkbox]:checked`)
    );
  }, selector);

const selectedFiles = async (page: Page) => {
  const selected: number[] = [];
  for (const id of FILE_IDS)
    if (await isSelected(page, fileSelector(id))) selected.push(id);
  return selected;
};

const center = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error("the element has no box");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

// The client's drag is its own, on mouse events, not HTML5 drag and drop: the
// item's mousedown starts it, and Section/Body listens for mousemove and
// mouseup only once that has rendered. It ignores moves of under 5px.
const dragOnto = async (page: Page, source: Locator, target: Locator) => {
  const from = await center(source);
  const to = await center(target);

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 10, from.y + 10, { steps: 5 });
  await page.mouse.move(to.x, to.y, { steps: 20 });
  await page.mouse.move(to.x + 2, to.y + 2, { steps: 2 });
  await page.mouse.up();
};

// A rubber band from a point of the section with no item under it to the
// centre of `to`.
const selectArea = async (
  page: Page,
  from: { x: number; y: number },
  to: Locator,
) => {
  // The band has to start on the section itself, not on an item.
  const startsOn = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return {
      inSection: !!el?.closest("#sectionScroll"),
      onItem: !!el?.closest(".files-item"),
    };
  }, from);
  expect(startsOn).toEqual({ inSection: true, onItem: false });

  const end = await center(to);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 20 });
  await page.mouse.up();
};

const openMyDocuments = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/rooms/personal/filter?folder=${MY_DOCUMENTS_ID}`);
  await expect(page.locator(fileSelector(FILE_IDS[2]))).toBeAttached();
  await page.waitForLoadState("networkidle");
};

const setUp = (mockRequest: WorkerFixture) => {
  const moves: MoveBody[] = [];
  mockRequest.use(
    ...moveHandlers(moves),
    rootHandler(TEST_PORT),
    filesSettingsHandler(TEST_PORT),
    settingsHandler(TEST_PORT, TypeSettings.Authenticated),
    selfActivationStatusHandler(TEST_PORT, null, false, true),
    listingHandler,
  );
  return moves;
};

const expectMoveOfFirstFile = async (moves: MoveBody[]) => {
  await expect.poll(() => moves.length).toBeGreaterThan(0);
  expect(Number(moves[0].destFolderId)).toBe(FOLDER_ID);
  expect((moves[0].fileIds ?? []).map(Number)).toEqual([FILE_IDS[0]]);
  expect(moves[0].folderIds ?? []).toEqual([]);
};

const expectValueAttributes = async (page: Page) => {
  await expect(filesItem(page, fileSelector(FILE_IDS[0]))).toHaveAttribute(
    "value",
    new RegExp(`^file_${FILE_IDS[0]}_`),
  );
  await expect(filesItem(page, folderSelector)).toHaveAttribute(
    "value",
    new RegExp(`^folder_${FOLDER_ID}_`),
  );
};

test.describe("Files tiles: drag onto a folder and area selection", () => {
  let moves: MoveBody[];

  test.beforeEach(async ({ page, mockRequest, baseUrl }) => {
    moves = setUp(mockRequest);
    await openMyDocuments(page, baseUrl);
    await expect(page.getByTestId("table-body")).toBeVisible();
    await page.keyboard.press("KeyV");
    await expect(page.getByTestId("tile_0")).toBeVisible();
    await expect(
      page.locator(`${fileSelector(FILE_IDS[0])} .tile-selected`),
    ).toHaveCount(0);
  });

  test("a tile's item carries the value that names it", async ({ page }) => {
    await expectValueAttributes(page);
  });

  test("dropping a file tile on a folder tile moves the file there", async ({
    page,
  }) => {
    await dragOnto(
      page,
      page.locator(`${fileSelector(FILE_IDS[0])} .item-file-name`).first(),
      filesItem(page, folderSelector),
    );

    await expectMoveOfFirstFile(moves);
  });

  test("a rubber band over two file tiles selects them", async ({ page }) => {
    const first = filesItem(page, fileSelector(FILE_IDS[0]));
    const second = filesItem(page, fileSelector(FILE_IDS[1]));
    const box = await first.boundingBox();
    if (!box) throw new Error("the first tile has no box");

    // Below the first tile, under the files' only row.
    await selectArea(
      page,
      { x: box.x + 10, y: box.y + box.height + 30 },
      second,
    );

    await expect.poll(() => selectedFiles(page)).toEqual(FILE_IDS.slice(0, 2));
    expect(await isSelected(page, folderSelector)).toBe(false);
  });
});

// Rows are what the list shows at a tablet's width; a desktop browser, so the
// pointer gestures stay on (react-device-detect turns them off on a phone).
test.describe("Files rows: drag onto a folder and area selection", () => {
  test.use({ viewport: { width: 900, height: 1000 } });

  let moves: MoveBody[];

  test.beforeEach(async ({ page, mockRequest, baseUrl }) => {
    moves = setUp(mockRequest);
    await openMyDocuments(page, baseUrl);
    await expect(
      page.locator(`${fileSelector(FILE_IDS[0])}.row-wrapper`),
    ).toBeVisible();
  });

  test("a row's item carries the value that names it", async ({ page }) => {
    await expectValueAttributes(page);
  });

  test("dropping a file row on a folder row moves the file there", async ({
    page,
  }) => {
    await dragOnto(
      page,
      page.locator(`${fileSelector(FILE_IDS[0])} .row-content-link`).first(),
      filesItem(page, folderSelector),
    );

    await expectMoveOfFirstFile(moves);
  });

  test("a rubber band over two file rows selects them", async ({ page }) => {
    const last = page.locator(fileSelector(FILE_IDS[2]));
    const box = await last.boundingBox();
    if (!box) throw new Error("the last row has no box");

    // Below the last row, up to the middle one.
    await selectArea(
      page,
      { x: box.x + box.width / 2, y: box.y + box.height + 30 },
      page.locator(fileSelector(FILE_IDS[1])),
    );

    await expect.poll(() => selectedFiles(page)).toEqual(FILE_IDS.slice(1));
    expect(await isSelected(page, folderSelector)).toBe(false);
  });
});

// The table view passes the value through its own row, and kept working: a
// control for the two views above.
test.describe("Files table: drag onto a folder and area selection", () => {
  let moves: MoveBody[];

  test.beforeEach(async ({ page, mockRequest, baseUrl }) => {
    moves = setUp(mockRequest);
    await openMyDocuments(page, baseUrl);
    await expect(page.getByTestId("table-body")).toBeVisible();
  });

  test("dropping a file row on a folder row moves the file there", async ({
    page,
  }) => {
    await dragOnto(
      page,
      page.locator(`${fileSelector(FILE_IDS[0])} .item-file-name`).first(),
      page.locator(`${folderSelector} .item-file-name`).first(),
    );

    await expectMoveOfFirstFile(moves);
  });

  test("a rubber band over two file rows selects them", async ({ page }) => {
    // The row's element with the id lays out no box of its own here: its
    // name cell does.
    const name = (id: number) =>
      page.locator(`${fileSelector(id)} .item-file-name`).first();
    const box = await name(FILE_IDS[2]).boundingBox();
    if (!box) throw new Error("the last row has no box");

    await selectArea(
      page,
      { x: box.x + box.width / 2, y: box.y + box.height + 30 },
      name(FILE_IDS[1]),
    );

    await expect.poll(() => selectedFiles(page)).toEqual(FILE_IDS.slice(1));
    expect(await isSelected(page, folderSelector)).toBe(false);
  });
});
