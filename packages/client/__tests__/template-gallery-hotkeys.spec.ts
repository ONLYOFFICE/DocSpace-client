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
import { http } from "msw";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e";
import {
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  oformsFormGallerySettings,
  oformsHandlers,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";
const FORMS_URL = "/forms/filter";
const FORMS_ROOT_ID = 36;

const formsRootHandler = () =>
  http.get(`${BASE_URL}:${TEST_PORT}/${API_PREFIX}/files/rooms*`, () =>
    Response.json({
      response: {
        files: [],
        folders: [],
        current: {
          id: FORMS_ROOT_ID,
          parentId: 0,
          rootFolderId: FORMS_ROOT_ID,
          rootFolderType: FORMS_ROOT_ID,
          parentRoomType: FORMS_ROOT_ID,
          title: "Forms",
          filesCount: 0,
          foldersCount: 0,
          security: { Read: true, Create: true },
          access: 0,
          created: "2025-01-15T12:00:00.000Z",
          updated: "2025-01-15T12:00:00.000Z",
        },
        pathParts: [{ id: FORMS_ROOT_ID, title: "Forms" }],
        startIndex: 0,
        count: 0,
        total: 0,
        new: 0,
      },
    }),
  );

const gallery = (page: Page) => page.locator("#scroll-template-gallery");

const checkedFiles = (page: Page) =>
  page.locator(".files-item input[type=checkbox]:checked");

test.describe("Hotkeys with the template gallery open", () => {
  test.beforeEach(async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(
        TEST_PORT,
        TypeSettings.Authenticated,
        oformsFormGallerySettings(TEST_PORT),
      ),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      ...oformsHandlers(TEST_PORT),
    );

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    await page.getByTestId("main-button").click();
    await page.getByRole("menuitem", { name: "Template gallery" }).click();
    await expect(gallery(page).locator("[class*=nameText]").first()).toBeVisible();
  });

  test("files list hotkeys do not reach the list behind the gallery", async ({
    page,
  }) => {
    for (const key of ["Control+KeyA", "KeyV", "Shift+KeyD", "Control+Slash"])
      await page.keyboard.press(key);

    await expect(gallery(page)).toBeVisible();
    await expect(page.getByTestId("new_document_text_input")).toBeHidden();
    await expect(
      page.getByRole("dialog").filter({ hasText: "Hotkeys" }),
    ).toBeHidden();

    await page.keyboard.press("Escape");
    await expect(gallery(page)).toBeHidden();
    await expect(page.getByTestId("table-body")).toBeVisible();
    await expect(page.getByTestId("tile_0")).toBeHidden();
    await expect(checkedFiles(page)).toHaveCount(0);
  });

  test("Esc in Submit to Template Gallery closes only the dialog", async ({
    page,
  }) => {
    const cancel = page.getByTestId("submit_to_gallery_cancel_button");

    await page
      .getByRole("button", { name: "Submit to Template Gallery" })
      .click();
    await expect(cancel).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(cancel).toBeHidden();
    await expect(gallery(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(gallery(page)).toBeHidden();
  });
});

test.describe("Hotkeys in the Forms template gallery", () => {
  test("Enter on a template opens the space dialog without creating it", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(
        TEST_PORT,
        TypeSettings.Authenticated,
        oformsFormGallerySettings(TEST_PORT),
      ),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      formsRootHandler(),
      ...oformsHandlers(TEST_PORT),
    );

    const createRequests: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        /\/files\/rooms(\?|$)/.test(request.url())
      )
        createRequests.push(request.url());
    });

    await page.goto(`${baseUrl}${FORMS_URL}`);
    await page.getByText("From template gallery", { exact: true }).click();
    await expect(gallery(page).locator("[class*=nameText]").first()).toBeVisible();

    await expect(async () => {
      await page.keyboard.press("ArrowRight");
      await expect(gallery(page).locator("[class*=focused]")).toHaveCount(1, {
        timeout: 1000,
      });
    }).toPass();
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("create_room_dialog_save")).toBeVisible();
    await page.waitForTimeout(500);
    expect(createRequests).toEqual([]);
  });
});
