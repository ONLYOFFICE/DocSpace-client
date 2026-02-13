// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
