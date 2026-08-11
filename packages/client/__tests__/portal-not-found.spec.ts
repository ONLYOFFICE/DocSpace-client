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
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

// A tab left open on the portal keeps its auth cookie after the portal is
// deleted, because logout answers 404 like everything else. Refreshing it used
// to start the wrong-portal-name redirect and then cancel it: every failing
// request made the route guards see an unauthenticated visitor, they redirected
// to /login, and /login sent the still-cookied visitor back to the portal root,
// where it all began.
const WRONG_PORTAL_NAME_URL = "https://www.onlyoffice.com/wrongportalname.aspx";

// One path per route guard: the settings page sits behind PrivateRoute, the
// root behind PublicRoute. More paths would re-exercise the same guards.
const OPEN_TABS = ["/portal-settings/delete-data/deletion", "/"];

test.describe("Portal not found", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    mockRequest.use(settingsHandler(TEST_PORT, TypeSettings.PortalNotFound));

    // The real site is a request to another host and takes a moment to answer,
    // and that moment is the whole bug: the navigation stays uncommitted while
    // the rest of the app reacts to the deletion and redirects over it. A mock
    // that answers instantly hides the race entirely.
    await page.route(`${WRONG_PORTAL_NAME_URL}*`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body><h1>Wrong portal name</h1></body></html>",
      });
    });

    await page.context().addCookies([
      {
        name: "asc_auth_key",
        value: "stale-session-of-a-deleted-portal",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  for (const pathname of OPEN_TABS) {
    test(`redirects ${pathname} to the wrong portal name site without a detour`, async ({
      page,
      baseUrl,
    }) => {
      const documentUrls: string[] = [];
      page.on("request", (request) => {
        if (request.resourceType() === "document")
          documentUrls.push(request.url());
      });

      await page.goto(`${baseUrl}${pathname}`);

      await page.waitForURL(`${WRONG_PORTAL_NAME_URL}*`);

      await expect(
        page.getByRole("heading", { name: "Wrong portal name" }),
      ).toBeVisible();

      // /login is the detour that closes the loop in production. Here it would
      // only serve the client app again through the SPA fallback, so the hop
      // itself is what has to be asserted.
      expect(
        documentUrls.filter((url) => url.includes("/login")),
      ).toStrictEqual([]);
    });
  }
});
