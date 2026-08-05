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

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { clearTourCompleted, startTour, walkTour, welcomeDialog } from "./helpers/tour";

// packages/client/src/store/FilesTourStore.ts
const TOUR_KEY_PREFIX = "files_tour_completed";
// My documents, from packages/shared/__mocks__/handlers/files/root.ts
const MY_DOCUMENTS_URL = "/rooms/personal/filter?folder=12764";
// FilesTour/index.tsx: t("FilesTour:TourWelcomeTitle", { productName: ... })
const WELCOME_TITLE = "Welcome to DocSpace!";

test.describe("Files tour", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
    );
  });

  test("admin sees the full walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    // First visit sets an origin so localStorage is reachable; the reload
    // after clearing the flag is what actually lands with the tour unseen.
    await page.goto(`${baseUrl}${MY_DOCUMENTS_URL}`);
    await clearTourCompleted(page, TOUR_KEY_PREFIX, "admin-user-id");
    await page.goto(`${baseUrl}${MY_DOCUMENTS_URL}`);

    await expect(welcomeDialog(page, WELCOME_TITLE)).toBeVisible();
    await expectScreenshot(page, ["desktop", "files-tour", "admin-welcome.png"]);

    await startTour(page, WELCOME_TITLE);
    await walkTour(page, ["desktop", "files-tour", "admin"]);
  });

  // There is no guest variant to walk here: a visitor hitting the personal
  // section at all is blocked at the access-control layer (the page renders
  // "Sorry, the resource is not currently accessible" instead of Home), which
  // is consistent with FilesTour/tourSteps.ts's own comment that guests are
  // normally out of this section's reach entirely. Regression-test that gate
  // instead of a walkthrough that cannot exist.
  test("guest cannot reach the personal section at all", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "visitor"));

    await page.goto(`${baseUrl}${MY_DOCUMENTS_URL}`);

    await expect(
      page.getByRole("button", { name: "Take a tour" }),
    ).not.toBeVisible();
    await expect(
      page.getByText("Sorry, the resource is not currently accessible."),
    ).toBeVisible();
  });
});
