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

import type { Page } from "@playwright/test";
import {
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  oformsFormGallerySettings,
  oformsHandlers,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

const gallery = (page: Page) => page.locator("#scroll-template-gallery");
const panel = (page: Page) => page.getByTestId("template_gallery_filter_panel");
const chips = (page: Page) =>
  page.getByTestId("template_gallery_selected_filters");
const chip = (page: Page, testId: string) =>
  chips(page).getByTestId(`template_gallery_selected_${testId}`);
const chipLabels = (page: Page) =>
  chips(page).getByTestId(/^template_gallery_selected_/);

const expectTiles = (page: Page, names: string[]) =>
  expect(gallery(page).locator("[class*=nameText]")).toHaveText(names);

async function openGallery(page: Page, baseUrl: string) {
  await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);

  const mainButton = page.getByTestId("main-button");
  await expect(mainButton).toBeVisible();
  await mainButton.click();

  await page.getByRole("menuitem", { name: "Template gallery" }).click();

  await expectTiles(page, [
    "Invoice",
    "Job offer",
    "Lease agreement",
    "Grocery list",
  ]);
}

async function openPanel(page: Page) {
  await page.getByTestId("template_gallery_filter_button").click();
  await expect(panel(page)).toBeVisible();
}

test.describe("Template gallery filter", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(
        TEST_PORT,
        TypeSettings.Authenticated,
        oformsFormGallerySettings(TEST_PORT),
      ),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      ...oformsHandlers(TEST_PORT),
    );
  });

  test("filters by purpose and categories and lists them as chips", async ({
    page,
    baseUrl,
  }) => {
    await openGallery(page, baseUrl);
    await openPanel(page);

    await expect(panel(page).getByText("Everyday Life")).toBeVisible();

    await panel(page).getByText("Business", { exact: true }).click();

    await expect(panel(page).getByText("Everyday Life")).toBeHidden();
    await expect(chips(page)).toHaveText("Business");
    await expectTiles(page, ["Invoice", "Job offer", "Lease agreement"]);

    await panel(page).getByText("Finance", { exact: true }).click();
    await panel(page).getByText("Real Estate", { exact: true }).click();

    await expect(chipLabels(page)).toHaveText([
      "Business",
      "Finance",
      "Real Estate",
    ]);
    await expectTiles(page, ["Invoice", "Lease agreement"]);

    await chip(page, "category_pc-finance").click();

    await expect(chipLabels(page)).toHaveText(["Business", "Real Estate"]);
    await expectTiles(page, ["Lease agreement"]);
  });

  test("Clear all drops every condition but the search", async ({
    page,
    baseUrl,
  }) => {
    await openGallery(page, baseUrl);
    await openPanel(page);

    await panel(page).getByText("Business", { exact: true }).click();
    await panel(page).getByText("Finance", { exact: true }).click();
    await expectTiles(page, ["Invoice"]);

    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();

    const search = page.getByTestId("search-input").getByTestId("text-input");
    await search.fill("i");
    await expectTiles(page, ["Invoice"]);

    await page.getByTestId("template_gallery_clear_all").click();

    await expect(chips(page)).toBeHidden();
    await expect(search).toHaveValue("i");
    await expectTiles(page, ["Invoice", "Grocery list"]);
  });

  test("a language switch keeps only the categories the language has", async ({
    page,
    baseUrl,
  }) => {
    await openGallery(page, baseUrl);
    await openPanel(page);

    await panel(page).getByText("Finance", { exact: true }).click();
    await panel(page).getByText("Real Estate", { exact: true }).click();
    await expectTiles(page, ["Invoice", "Lease agreement"]);

    const localeRequest = page.waitForRequest(
      (request) =>
        request.url().includes("/oforms-cms/api/oforms?") &&
        new URL(request.url()).searchParams.get("locale") === "de",
    );

    await page.getByTestId("template_gallery_language_combobox").click();
    await page.getByText("Deutsch (Deutschland)", { exact: true }).click();

    const params = new URL((await localeRequest).url()).searchParams;
    expect(
      [...params.entries()]
        .filter(([key]) => key.includes("[documentId][$in]"))
        .map(([, value]) => value),
    ).toEqual(["pc-finance"]);

    await expect(panel(page)).toBeVisible();
    await expect(chipLabels(page)).toHaveText([
      "Deutsch (Deutschland)",
      "Finanzen",
    ]);
    await expectTiles(page, ["Rechnung"]);

    await page.keyboard.press("Escape");
    await chip(page, "language_de").click();

    await expect(chipLabels(page)).toHaveText(["Finance"]);
    await expectTiles(page, ["Invoice"]);
  });

  test("Escape closes the filter panel before the gallery", async ({
    page,
    baseUrl,
  }) => {
    await openGallery(page, baseUrl);
    await openPanel(page);

    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await expect(gallery(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(gallery(page)).toBeHidden();
  });

  test("a click outside closes the filter panel", async ({ page, baseUrl }) => {
    await openGallery(page, baseUrl);
    await openPanel(page);

    await page.getByText("Template gallery", { exact: true }).first().click();

    await expect(panel(page)).toBeHidden();
    await expect(gallery(page)).toBeVisible();
  });

  test("arrow keys leave the tiles alone while the panel is open", async ({
    page,
    baseUrl,
  }) => {
    await openGallery(page, baseUrl);
    await openPanel(page);

    const focusedTile = gallery(page).locator("[class*=focused]");

    await page.keyboard.press("ArrowRight");
    await expect(focusedTile).toHaveCount(0);

    await page.keyboard.press("Escape");
    await page.keyboard.press("ArrowRight");
    await expect(focusedTile).toHaveCount(1);
  });
});
