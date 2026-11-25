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
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  rootHandler,
  filesSettingsHandler,
  myHandler,
  myDocumentsHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * Bug 67530 - on a phone the profile menu's "Settings" opened straight on
 * Customization, which hid that there are other sections. It now opens on the
 * settings section list; picking a section closes it.
 */

const FILES_URL = "/rooms/personal/filter?folder=12764";
const MOBILE = { width: 428, height: 830 };
const CREATE_BUTTON = "main-button-mobile";
const MOBILE_AVATAR = "avatar";
const SETTINGS_ROW = "user-menu-settings";

test.describe("Settings on a phone", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfByTypeHandler(TEST_PORT, "owner"),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
    );
  });

  test("the profile menu opens settings on the section list", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`${baseUrl}${FILES_URL}`);
    await expect(page.getByTestId(CREATE_BUTTON)).toBeVisible();

    await page.getByTestId(MOBILE_AVATAR).first().click();
    await page.getByTestId(SETTINGS_ROW).click();

    await expect(page).toHaveURL(/\/portal-settings\/customization\/general/);

    const article = page.locator("#article-container");
    await expect(article).toHaveAttribute("data-open", "true");
    await expect(article.getByText("Security", { exact: true })).toBeVisible();

    // Picking a section closes the list and opens that section.
    await article.getByText("Security", { exact: true }).click();
    await expect(page).toHaveURL(/\/portal-settings\/security/);
    await expect(article).toHaveAttribute("data-open", "false");
  });
});
