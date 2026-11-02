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

import {
  createFileBadGatewayHandler,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test } from "./fixtures/base";

const PARENT_ID = 4737363;
const CREATE_PATH = `/doceditor/create?parentId=${PARENT_ID}&fileTitle=New+spreadsheet.xlsx&open=true&id=-1`;

test.describe("Create file error", () => {
  // Production report (4.0.0): "Minified React error #441" on
  // /doceditor/create. When POST /files/:parentId/file answers without a
  // JSON body (a proxy 502, a timeout page), createFile returns nothing and
  // the page hands `new Error()` to a client component. React does not send
  // an Error's message to the client in production, so the browser gets
  // #441 instead of anything that says what failed.
  test("should not surface React error #441 when the create request fails", async ({
    page,
    serverRequestInterceptor,
    port,
    baseUrl,
  }) => {
    serverRequestInterceptor.use(
      filesSettingsHandler(port),
      createFileBadGatewayHandler(port, PARENT_ID),
    );

    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto(`${baseUrl}${CREATE_PATH}`);

    await expect(page.getByText("Something went wrong.")).toBeVisible({
      timeout: 15_000,
    });

    expect(errors.filter((m) => m.includes("#441"))).toEqual([]);
  });
});
