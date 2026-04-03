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

import { Page } from "@playwright/test";
import {
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_REQUEST_URL = "**/plugins/media-viewer/plugin.js";

const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// Row indices in the file list (0-based, folder at 0)
const MP4_ROW = 1;
const JPG_ROW = 2;

test.describe("Media Viewer Sample Plugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withMediaViewerPlugin"),
    );
  });

  test("Clicking an MP4 file opens the media viewer", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const nameCell = table.getByTestId(`files-cell-name-${MP4_ROW}`);
    await nameCell.locator(".item-file-name").click();

    const mediaViewer = page.locator("#media-viewer-sample-content");
    await expect(mediaViewer).toBeVisible();
  });

  test("MP4 onLoad callback fires an info toast", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const nameCell = table.getByTestId(`files-cell-name-${MP4_ROW}`);
    await nameCell.locator(".item-file-name").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "info");
    await expect(toast).toContainText("Media viewer loaded");
  });

  test("Clicking a JPG file opens the media viewer", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const nameCell = table.getByTestId(`files-cell-name-${JPG_ROW}`);
    await nameCell.locator(".item-file-name").click();

    const mediaViewer = page.locator("#media-viewer-sample-content");
    await expect(mediaViewer).toBeVisible();
  });

  test("JPG onLoad callback fires a success toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const nameCell = table.getByTestId(`files-cell-name-${JPG_ROW}`);
    await nameCell.locator(".item-file-name").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("Image viewer loaded");
  });

  // Navigation: playlistFilter includes both .mp4 and .jpg so the playlist has
  // 2 items. At position 0 (mp4) only the Next button renders; at position 1
  // (jpg) only the Prev button renders.

  test("Next button triggers onNext and onFileChange toasts", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    // Open mp4 (playlist position 0) — Next button visible, Prev button hidden
    const nameCell = table.getByTestId(`files-cell-name-${MP4_ROW}`);
    await nameCell.locator(".item-file-name").click();

    const mediaViewer = page.locator("#media-viewer-sample-content");
    await expect(mediaViewer).toBeVisible();

    await page.getByTestId("next-button").click();

    // onNext fires first, then onFileChange for the new file (jpg, id 24)
    const nextToast = page
      .getByTestId("toast-content")
      .filter({ hasText: "Navigation: next" });
    await expect(nextToast).toBeVisible();

    const changeToast = page
      .getByTestId("toast-content")
      .filter({ hasText: "File changed: 24" });
    await expect(changeToast).toBeVisible();
  });

  test("Prev button triggers onPrevious and onFileChange toasts", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    // Open jpg (playlist position 1) — Prev button visible, Next button hidden
    const nameCell = table.getByTestId(`files-cell-name-${JPG_ROW}`);
    await nameCell.locator(".item-file-name").click();

    const mediaViewer = page.locator("#media-viewer-sample-content");
    await expect(mediaViewer).toBeVisible();

    await page.getByTestId("prev-button").click();

    // onPrevious fires first, then onFileChange for the new file (mp4, id 23)
    const prevToast = page
      .getByTestId("toast-content")
      .filter({ hasText: "Navigation: previous" });
    await expect(prevToast).toBeVisible();

    const changeToast = page
      .getByTestId("toast-content")
      .filter({ hasText: "File changed: 23" });
    await expect(changeToast).toBeVisible();
  });

  test("Media viewer renders with plugin content", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const nameCell = table.getByTestId(`files-cell-name-${MP4_ROW}`);
    await nameCell.locator(".item-file-name").click();

    const mediaViewer = page.locator("#media-viewer-sample-content");
    await expect(mediaViewer).toBeVisible();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-media-viewer",
      "media-viewer_open.png",
    ]);
  });
});

