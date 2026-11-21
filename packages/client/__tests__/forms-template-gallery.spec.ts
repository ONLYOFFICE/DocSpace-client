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
  emptyFormsRootHandler,
  filesSettingsHandler,
  oformsFormGallerySettings,
  oformsHandlers,
  roomTagsHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

test.describe("Forms template gallery", () => {
  test("opens PDF templates from the header plus in empty Forms (bug 83750)", async ({
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
      emptyFormsRootHandler(TEST_PORT),
      roomTagsHandler(TEST_PORT),
      ...oformsHandlers(TEST_PORT),
    );

    await page.goto(`${baseUrl}/forms/filter`);
    await expect(page.getByTestId("empty-view")).toBeVisible();
    await page.locator("#header_add-button").click();

    const [request] = await Promise.all([
      page.waitForRequest((request) =>
        new URL(request.url()).pathname.endsWith("/oforms-cms/api/oforms"),
      ),
      page.getByRole("menuitem", { name: "Template gallery" }).click(),
    ]);

    const gallery = page.locator("#scroll-template-gallery");
    const invoice = gallery.getByText("Invoice", { exact: true });
    await expect(invoice).toBeVisible();
    expect(
      new URL(request.url()).searchParams.get("filters[form_exts][ext][$eq]"),
    ).toBe("pdf");
    await expect(
      page.getByTestId(/^(documents|spreadsheet|presentation|forms)_tab$/),
    ).toHaveCount(0);

    await invoice.click();
    await expect(page.getByTestId("create_room_dialog_save")).toBeVisible();
    await expect(page.locator("#shared_room-name")).toHaveValue("Invoice");
  });
});
