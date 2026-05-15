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

import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  rootHandler,
  settingsHandler,
  TypeSettings,
  filesSettingsHandler,
  peopleListHandler,
  selfActivationStatusHandler,
  selfByTypeHandler,
  peopleListAccessDeniedHandler,
} from "@docspace/shared/__mocks__/handlers";

test.describe("Accounts Access Control", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT),
      peopleListHandler(TEST_PORT),
    );
  });

  test("should allow owner to access accounts page and see content", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfActivationStatusHandler(TEST_PORT, null, false, true));

    await page.goto(`${baseUrl}/accounts/people/filter`);

    // Should see table container
    const tableContainer = page.getByTestId("table-container");
    await expect(tableContainer).toBeVisible();
  });

  test("should allow admin to access accounts page and see content", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));
    //await mockRequest.router([endpoints.selfAdminOnly, endpoints.peopleList]);

    await page.goto(`${baseUrl}/accounts/people/filter`);

    // Should see table container
    const tableContainer = page.getByTestId("table-container");
    await expect(tableContainer).toBeVisible();
  });

  test("should allow room admin to access accounts page and see content", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "roomAdmin"));

    await page.goto(`${baseUrl}/accounts/people/filter`);

    // Should see table container
    const tableContainer = page.getByTestId("table-container");
    await expect(tableContainer).toBeVisible();
  });

  test("should show NoAccessContainer for visitor", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      peopleListAccessDeniedHandler(TEST_PORT), // Return 403 for people list
      selfByTypeHandler(TEST_PORT, "visitor"),
    );

    await page.goto(`${baseUrl}/accounts/people/filter`);

    // Should see empty view
    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();
  });

  test("should show NoAccessContainer for regular user", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      peopleListAccessDeniedHandler(TEST_PORT), // Return 403 for people list
    );

    await page.goto(`${baseUrl}/accounts/people/filter`);

    // Should see empty view
    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();
  });
});
