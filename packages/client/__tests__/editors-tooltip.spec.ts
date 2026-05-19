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
  myHandler,
  rootHandler,
  filesSettingsHandler,
  filesWithEditorsHandler,
  filesWithManyEditorsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { userPhotoHandler } from "@docspace/shared/__mocks__/handlers/people";
import { expect, test, TEST_PORT } from "./fixtures/base";

test.describe("EditorsTooltip - Desktop", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      filesWithEditorsHandler(TEST_PORT),
      userPhotoHandler(TEST_PORT),
    );
  });

  test("should display edit icon when file has active editors", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/shared-with-me/filter?folder=4`);

    const editIcon = page.locator(".is-editing").first();
    await expect(editIcon).toBeVisible();
  });

  test("should show tooltip on hover with editors list", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/shared-with-me/filter?folder=4`);

    const editIcon = page.locator(".is-editing").first();
    await editIcon.hover();

    // Wait for tooltip to appear
    await page.waitForTimeout(500);

    const tooltip = page.locator('[id^="editors-tooltip-"]');
    await expect(tooltip).toBeVisible();

    // Check header text
    const header = tooltip.locator("text=File is currently edited by:");
    await expect(header).toBeVisible();

    // Check editors are displayed
    const editorsList = tooltip.locator("text=John Doe");
    await expect(editorsList).toBeVisible();

    const editor2 = tooltip.locator("text=Jane Smith");
    await expect(editor2).toBeVisible();

    const anonymousEditor = tooltip.locator("text=Anonymous");
    await expect(anonymousEditor).toBeVisible();
  });

  test("should show scrollbar when editors list exceeds max height", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // Use handler with many editors
    mockRequest.use(filesWithManyEditorsHandler(TEST_PORT, 15));

    await page.goto(`${baseUrl}/shared-with-me/filter?folder=4`);

    const editIcon = page.locator(".is-editing").first();
    await editIcon.hover();
    await page.waitForTimeout(500);

    const tooltip = page.locator('[id^="editors-tooltip-"]');
    const tooltipHeight = await tooltip.evaluate((el) => el.clientHeight);

    // Max height should be 176px
    expect(tooltipHeight).toBeLessThanOrEqual(176);
  });

  test("should not fetch photos for anonymous users", async ({
    page,
    baseUrl,
  }) => {
    let photoRequestsForAnonymous = 0;

    await page.route(
      "**/api/2.0/people/00000000-0000-0000-0000-000000000000/photo",
      (route) => {
        photoRequestsForAnonymous++;
        route.abort();
      },
    );

    await page.goto(`${baseUrl}/shared-with-me/filter?folder=4`);

    const editIcon = page.locator(".is-editing").first();
    await editIcon.hover();
    await page.waitForTimeout(1000);

    expect(photoRequestsForAnonymous).toBe(0);
  });
});

test.describe("EditorsTooltip - Mobile", () => {
  test.use({
    viewport: { width: 375, height: 667 },
    isMobile: true,
  });

  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      filesWithEditorsHandler(TEST_PORT),
      userPhotoHandler(TEST_PORT),
    );
  });

  test("should display edit icon on mobile", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/shared-with-me/filter?folder=4`);

    const editIcon = page.locator(".is-editing").first();
    await expect(editIcon).toBeVisible();
  });

  test("should show mobile modal on click", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/shared-with-me/filter?folder=4`);

    const editIcon = page.locator(".is-editing").first();
    await editIcon.click();

    // Check backdrop is visible
    const backdrop = page.getByTestId("backdrop");
    await expect(backdrop).toBeVisible();

    // Check mobile container
    const mobileContainer = page.getByTestId("editors-tooltip-mobile");
    await expect(mobileContainer).toBeVisible();

    // Check header
    const header = mobileContainer.locator("text=File is currently edited by:");
    await expect(header).toBeVisible();

    // Check editors list
    const editor1 = mobileContainer.locator("text=John Doe");
    await expect(editor1).toBeVisible();
  });

  test("should close mobile modal on backdrop click", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/shared-with-me/filter?folder=4`);

    const editIcon = page.locator(".is-editing").first();
    await editIcon.click();

    const backdrop = page.getByTestId("backdrop");
    await expect(backdrop).toBeVisible();

    await backdrop.click();

    // Modal should be closed
    await expect(backdrop).not.toBeVisible();
  });

  test("should show scrollbar on mobile when content exceeds max height", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // Use handler with many editors
    mockRequest.use(filesWithManyEditorsHandler(TEST_PORT, 20));

    await page.goto(`${baseUrl}/shared-with-me/filter?folder=4`);

    const editIcon = page.locator(".is-editing").first();
    await editIcon.click();

    const mobileContainer = page.getByTestId("editors-tooltip-mobile");
    await expect(mobileContainer).toBeVisible();

    const containerHeight = await mobileContainer.evaluate(
      (el) => el.clientHeight,
    );
    const viewportHeight = page.viewportSize()?.height || 667;

    // Container should not exceed viewport height - offset
    expect(containerHeight).toBeLessThanOrEqual(viewportHeight - 107);
  });
});
