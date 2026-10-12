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

import { http, delay } from "msw";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  myHandler,
  rootHandler,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { myDocumentsResolver } from "@docspace/shared/__mocks__/handlers/files/documents";
import { BASE_URL } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

const FOLDER_ID = 12764;
const SEARCH_ENDPOINT = `${BASE_URL}:${TEST_PORT}/api/2.0/files/:id`;

const searchValueOf = (url: string) =>
  new URL(url).searchParams.get("filterValue");

test.describe("search input caret", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      http.get(SEARCH_ENDPOINT, async ({ request }) => {
        const search = searchValueOf(request.url);
        const body = await myDocumentsResolver(true).json();
        if (search) {
          // Delay so the search resolves mid/after typing — the caret window.
          await delay(400);
          body.response.files = [];
          body.response.folders = [];
          body.response.count = 0;
          body.response.total = 0;
        }
        return new Response(JSON.stringify(body));
      }),
    );
  });

  test("caret survives the debounced search resolving to the empty view and typing continues", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/rooms/personal/filter?folder=${FOLDER_ID}`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    const input = page.locator('[data-testid="filter_search_input"] input');

    // Only intentional focus. Typing then goes through page.keyboard, which
    // never re-focuses — pressSequentially() would and mask a lost caret.
    await input.click();

    await page.keyboard.type("hello");

    // Debounce fires the search request.
    await page.waitForRequest((req) => searchValueOf(req.url()) === "hello");

    // Empty view re-render is where the caret used to be cleared.
    await expect(page.getByTestId("empty-view")).toBeVisible();

    // Field still focused, caret at the end.
    await expect(input).toBeFocused();
    await expect(input).toHaveJSProperty("selectionStart", "hello".length);

    // Keep typing: if focus were lost these keys would go nowhere.
    await page.keyboard.type(" world");
    await expect(input).toHaveValue("hello world");
    await expect(input).toHaveJSProperty("selectionStart", "hello world".length);
  });
});
