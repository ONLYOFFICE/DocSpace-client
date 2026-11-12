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

import { myDocumentsManyFilesHandler } from "@docspace/shared/__mocks__/handlers/files/documents";

import { test, expect } from "../private/fixtures";

const PERSONAL_FILES_URL = "/sdk/personal-files";
const FILES_COUNT = 30;

const manyFilesHandler = (port: string) =>
  myDocumentsManyFilesHandler(port, FILES_COUNT);

const tileRows = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll(".Item")).map((row) => ({
      columns: getComputedStyle(row).gridTemplateColumns.split(" ").length,
      cards: row.querySelectorAll(":scope > .Card").length,
    })),
  );

test.describe("Tiles in personal files", () => {
  test.beforeEach(
    async ({
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    }) => {
      serverRequestInterceptor.use(manyFilesHandler(port));
      clientRequestInterceptor.use(manyFilesHandler(port));

      await page.context().addCookies([
        { name: "viewAs", value: "tile", url: baseUrl },
      ]);
    },
  );

  for (const width of [1280, 1920, 2560]) {
    test(`a row holds as many tiles as the grid has columns at ${width}px`, async ({
      page,
      baseUrl,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${baseUrl}${PERSONAL_FILES_URL}`);
      await expect(page.locator(".Item").nth(1)).toBeVisible();

      await expect
        .poll(async () => {
          const rows = await tileRows(page);
          return rows
            .slice(0, -1)
            .every((row) => row.cards === row.columns && row.cards > 1);
        })
        .toBe(true);
    });
  }

  test("rows regroup after the window is resized", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto(`${baseUrl}${PERSONAL_FILES_URL}`);
    await expect(page.locator(".Item").nth(1)).toBeVisible();

    const before = (await tileRows(page))[0].cards;

    await page.setViewportSize({ width: 2560, height: 1000 });

    await expect
      .poll(async () => {
        const [first] = await tileRows(page);
        return first.cards === first.columns && first.cards > before;
      })
      .toBe(true);
  });
});
