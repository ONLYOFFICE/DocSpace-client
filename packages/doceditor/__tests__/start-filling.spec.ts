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
  fileByIdHandler,
  filesSettingsHandler,
  fillingStatusHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test } from "./fixtures/base";

test.describe("Start filling", () => {
  test("Start filling render", async ({
    page,
    serverRequestInterceptor,
    port,
    baseUrl,
  }) => {
    serverRequestInterceptor.use(
      filesSettingsHandler(port),
      fileByIdHandler(port, true),
      fillingStatusHandler(port),
    );
    await page.goto(
      `${baseUrl}/doceditor/start-filling?formId=1&roomId=1&share=qwerty`,
    );

    const form = page.getByTestId("completed_form_vdr_container");
    await expect(form).toBeVisible();

    await expectScreenshot(page, [
      "start-filling",
      "start-filling-render.png",
    ]);
  });
});
