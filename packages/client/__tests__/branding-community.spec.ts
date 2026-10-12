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
  tariffHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { PAID_NOW } from "./helpers/billing";

// Branding is a paid feature: the Community (opensource) edition has no
// license at all, so it must not show the Branding tab, and a direct link to
// any of the Branding pages answers 404 (see Route.private.tsx).
const BRANDING_PATHS = [
  "branding",
  "branding/brand-name",
  "branding/white-label",
  "branding/company-info",
  "branding/additional-resources",
];

test.describe("Branding in the Community edition", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      tariffHandler(TEST_PORT, true),
    );
  });

  test("should hide the Branding tab", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/portal-settings/customization/general`);

    await expect(page.getByTestId("general_tab")).toBeVisible();
    await expect(page.getByTestId("appearance_tab")).toBeVisible();
    await expect(page.getByTestId("branding_tab")).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "branding-community",
      "branding-community-tabs.png",
    ]);
  });

  for (const path of BRANDING_PATHS) {
    test(`should answer 404 for ${path}`, async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/portal-settings/customization/${path}`);

      await expect(page).toHaveURL(/\/error\/404$/);
      await expect(
        page.getByRole("heading", {
          name: "Sorry, the resource cannot be found.",
        }),
      ).toBeVisible();
    });
  }
});

test.describe("Branding outside the Community edition", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      tariffHandler(TEST_PORT, false),
    );
  });

  test("should show the Branding tab", async ({ page, baseUrl }) => {
    // The mock tariff is due in mid-2026: freeze the clock before that, or
    // the header shows "Subscription expired" once the real date passes it.
    await page.clock.setSystemTime(PAID_NOW);
    await page.goto(`${baseUrl}/portal-settings/customization/general`);

    await expect(page.getByTestId("general_tab")).toBeVisible();
    await expect(page.getByTestId("branding_tab")).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "branding-community",
      "branding-paid-tabs.png",
    ]);
  });

  test("should open Branding by a direct link", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/portal-settings/customization/branding`);

    await expect(page).toHaveURL(/\/portal-settings\/customization\/branding$/);
    await expect(page.getByTestId("branding_tab")).toBeVisible();
  });
});
