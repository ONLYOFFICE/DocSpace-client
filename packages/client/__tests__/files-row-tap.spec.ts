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
import { devices, type Page } from "@playwright/test";
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

// On a touch device a tap anywhere on a row opens its item, while the
// row's own buttons keep to their action and do not open it too.

const FOLDER_ID = 12764;
const SUBFOLDER_ID = 35;

const filesListHandler = http.get(
  `${BASE_URL}:${TEST_PORT}/api/2.0/files/:id`,
  async ({ params }) => {
    const body = await myDocumentsResolver().json();
    const [folder] = (await myDocumentsResolver(true).json()).response.folders;

    if (params.id === String(SUBFOLDER_ID)) {
      body.response.current = {
        ...body.response.current,
        id: SUBFOLDER_ID,
        parentId: FOLDER_ID,
        title: folder.title,
      };
      body.response.files = [];
      body.response.folders = [];
      body.response.count = 0;
      body.response.total = 0;
      return new Response(JSON.stringify(body));
    }

    body.response.current.id = FOLDER_ID;
    body.response.files = [];
    body.response.folders = [
      {
        ...folder,
        id: SUBFOLDER_ID,
        parentId: FOLDER_ID,
        filesCount: 1,
        new: 0,
        isFavorite: true,
      },
    ];
    body.response.count = 1;
    body.response.total = 1;

    return new Response(JSON.stringify(body));
  },
);

const favoritesHandler = http.delete(
  `${BASE_URL}:${TEST_PORT}/api/2.0/files/favorites`,
  () => new Response(JSON.stringify({ response: true })),
);

const openFolder = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/rooms/personal/filter?folder=${FOLDER_ID}`);
  await expect(page.locator(`#folder_${SUBFOLDER_ID}`)).toBeVisible();
  await page.waitForLoadState("networkidle");
};

const subfolderRequests = (page: Page) => {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(`/api/2.0/files/${SUBFOLDER_ID}?`))
      urls.push(request.url());
  });
  return urls;
};

for (const [name, device] of [
  ["phone", devices["Pixel 5"]],
  ["tablet", devices["Galaxy Tab S4"]],
] as const) {
  test.describe(`Files row on a ${name}`, () => {
    const { defaultBrowserType: _browserType, ...touchDevice } = device;
    test.use(touchDevice);

    test.beforeEach(async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        rootHandler(TEST_PORT),
        filesSettingsHandler(TEST_PORT),
        settingsHandler(TEST_PORT, TypeSettings.Authenticated),
        selfActivationStatusHandler(TEST_PORT, null, false, true),
        filesListHandler,
        favoritesHandler,
      );
      await openFolder(page, baseUrl);
    });

    test("Bug 71558: a tap on the row beside the name opens the folder", async ({
      page,
    }) => {
      await page
        .locator(`#folder_${SUBFOLDER_ID}`)
        .getByText("25/12/2025 10:49")
        .filter({ visible: true })
        .tap({ position: { x: 4, y: 4 } });

      await expect(page).toHaveURL(new RegExp(`folder=${SUBFOLDER_ID}`));
    });

    test("Bug 71558: a tap on a quick button does its action and does not open the folder", async ({
      page,
    }) => {
      const opened = subfolderRequests(page);
      const unfavorite = page.waitForRequest(
        (request) =>
          request.method() === "DELETE" &&
          request.url().includes("/api/2.0/files/favorites"),
      );

      await page
        .locator(`#folder_${SUBFOLDER_ID}`)
        .getByRole("button", { name: "Favorite files" })
        .tap();

      await unfavorite;
      await page.waitForLoadState("networkidle");
      expect(opened).toEqual([]);
      await expect(page).toHaveURL(new RegExp(`folder=${FOLDER_ID}`));
    });
  });
}
