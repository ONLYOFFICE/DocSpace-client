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
