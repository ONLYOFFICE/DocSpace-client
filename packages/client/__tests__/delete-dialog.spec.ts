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
import type { Page, Request } from "@playwright/test";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  rootHandler,
  filesSettingsHandler,
  changeDeleteConfirmHandler,
} from "@docspace/shared/__mocks__/handlers";
import { myDocumentsResolver } from "@docspace/shared/__mocks__/handlers/files/documents";
import { BASE_URL, expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

// The move-to-Trash confirmation: its wording, and the "Don't ask again"
// checkbox that turns off the confirmDelete profile setting.

const FOLDER_ID = 12764;
const FILE_IDS = [1001, 1002, 1003];

const filesListHandler = http.get(
  `${BASE_URL}:${TEST_PORT}/api/2.0/files/${FOLDER_ID}`,
  async () => {
    const body = await myDocumentsResolver().json();
    const [template] = body.response.files;

    body.response.current.id = FOLDER_ID;
    body.response.folders = [];
    body.response.files = FILE_IDS.map((id, index) => ({
      ...template,
      id,
      folderId: FOLDER_ID,
      title: `Quarterly report ${index + 1}.docx`,
    }));
    body.response.count = FILE_IDS.length;
    body.response.total = FILE_IDS.length;
    body.response.current.filesCount = FILE_IDS.length;

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

const isDeleteConfirmWrite = (request: Request) =>
  request.method() === "PUT" &&
  /files\/changedeleteconfrim/.test(request.url());

const isDeleteOperation = (request: Request) =>
  request.method() === "PUT" && /fileops\/delete/.test(request.url());

const openFolder = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/rooms/personal/filter?folder=${FOLDER_ID}`);
  await expect(page.getByTestId("table-body")).toBeVisible();
  await expect(page.locator(`#file_${FILE_IDS[2]}`)).toBeAttached();
};

// The dialog's root element (data-testid="delete-dialog") is a zero-size
// wrapper Playwright reports as hidden; its submit button tells whether the
// dialog is open.
const dialogSubmit = (page: Page) =>
  page.getByTestId("delete_dialog_modal_submit");

// Arrow keys move the selection from the top of the list; Delete opens the
// same dialog the toolbar and the context menu do.
const deleteNthFile = async (page: Page, n: number) => {
  for (let i = 0; i < n; i++) await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Delete");
};

test.describe("Delete dialog: move to Trash", () => {
  test.beforeEach(async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      changeDeleteConfirmHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      filesListHandler,
      ...deleteOperationHandlers,
    );

    await openFolder(page, baseUrl);
  });

  test("says the file goes to Trash and can be restored for 30 days", async ({
    page,
  }) => {
    await deleteNthFile(page, 1);

    await expect(dialogSubmit(page)).toBeVisible();
    const dialog = page.getByTestId("delete-dialog");
    await expect(dialog).toContainText("Move to Trash?");
    await expect(dialog).toContainText(
      "Quarterly report 1.docx will be moved to Trash, where you can restore it for 30 days. After that, it's permanently deleted.",
    );
    await expect(dialog).not.toContainText("You are about to");

    const checkbox = page.getByTestId("delete_dialog_dont_ask_again_checkbox");
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toContainText("Don't ask again");

    await expectScreenshot(page, [
      "desktop",
      "delete-dialog",
      "delete-dialog-move-to-trash.png",
    ]);
  });

  test("the hint tells where to turn the confirmation back on", async ({
    page,
  }) => {
    await deleteNthFile(page, 1);
    await page.getByTestId("delete_dialog_dont_ask_again_help").click();

    const hint = page.getByText(
      "You can turn this confirmation back on in My profile → File management.",
    );
    await expect(hint).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "delete-dialog",
      "delete-dialog-dont-ask-again-hint.png",
    ]);
  });

  test("Move without the checkbox keeps asking next time", async ({ page }) => {
    const writes: Request[] = [];
    page.on("request", (request) => {
      if (isDeleteConfirmWrite(request)) writes.push(request);
    });

    await deleteNthFile(page, 1);
    await dialogSubmit(page).click();
    await expect(dialogSubmit(page)).toBeHidden();

    await deleteNthFile(page, 1);
    await expect(dialogSubmit(page)).toBeVisible();
    expect(writes).toEqual([]);
  });

  test("Cancel with the checkbox ticked changes nothing", async ({ page }) => {
    const writes: Request[] = [];
    page.on("request", (request) => {
      if (isDeleteConfirmWrite(request)) writes.push(request);
    });

    await deleteNthFile(page, 1);
    await page.getByTestId("delete_dialog_dont_ask_again_checkbox").click();
    await page.getByTestId("delete_dialog_modal_cancel").click();
    await expect(dialogSubmit(page)).toBeHidden();

    await page.keyboard.press("Delete");
    await expect(dialogSubmit(page)).toBeVisible();
    expect(writes).toEqual([]);
  });

  test("Move with the checkbox ticked turns the confirmation off", async ({
    page,
  }) => {
    const writeRequest = page.waitForRequest(isDeleteConfirmWrite);

    await deleteNthFile(page, 1);
    await page.getByTestId("delete_dialog_dont_ask_again_checkbox").click();
    await dialogSubmit(page).click();

    expect((await writeRequest).postDataJSON()).toEqual({ set: false });
    await expect(dialogSubmit(page)).toBeHidden();

    // The next Delete goes straight to the operation, without the dialog.
    const deleteRequest = page.waitForRequest(isDeleteOperation);
    await page.keyboard.press("Escape");
    await deleteNthFile(page, 2);
    await deleteRequest;
    await expect(dialogSubmit(page)).toBeHidden();
  });
});
