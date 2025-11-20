// (c) Copyright Ascensio System SIA 2009-2025
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

import { test as base, Page } from "@playwright/test";
import { MockRequest } from "@docspace/shared/__mocks__/e2e";

export const test = base.extend<{
  page: Page;
  mockRequest: MockRequest;
}>({
  page: async ({ page }, use) => {
    // Route for logos
    await page.route("*/**/logo.ashx**", async (route) => {
      await route.fulfill({
        path: `../../public/images/logo/loginpage.svg`,
      });
    });

    // Route for client React static images (webpack bundled)
    await page.route("*/**/client/static/media/**", async (route, request) => {
      const imagePath = request
        .url()
        .split("/client/static/media/")
        .at(-1)!
        .split("?")[0];
      await route.fulfill({
        path: `../../public/images/${imagePath}`,
      });
    });

    // Route for public images (direct access)
    await page.route("*/**/client/images/**", async (route, request) => {
      const imagePath = request
        .url()
        .split("/client/images/")
        .at(-1)!
        .split("?")[0];
      await route.fulfill({
        path: `../../public/images/${imagePath}`,
      });
    });

    // Route for static assets
    // await page.route(
    //   "*/**/static/scripts/config.json",
    //   async (route, request) => {
    //     await route.fulfill({
    //       path: `../../public/scripts/config.json`,
    //     });
    //   },
    // );

    // // Route for React static files
    // await page.route("*/**/static/js/**", async (route, request) => {
    //   // For JS files, just continue with original request
    //   await route.continue();
    // });

    // // Route for CSS files
    // await page.route("*/**/static/css/**", async (route, request) => {
    //   // For CSS files, just continue with original request
    //   await route.continue();
    // });

    await use(page);
  },
  mockRequest: async ({ page }, use) => {
    const mockRequest = new MockRequest(page);
    await use(mockRequest);
  },
});

export { expect } from "@playwright/test";
