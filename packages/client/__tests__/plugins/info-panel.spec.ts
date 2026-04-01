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

const PLUGIN_REQUEST_URL = "**/plugins/info-panel/plugin.js";

// Personal folder used in all tests (same as context-menu spec).
const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// row-0 = folder, row-1 = .mp4 (video), row-2 = .jpg (image), row-3 = .docx (file)
const ROW_DOCX = 3;
const ROW_JPG = 2;
const ROW_FOLDER = 0;

async function selectRow(
  page: import("@playwright/test").Page,
  rowIndex: number,
) {
  const table = page.getByTestId("table-body");
  await expect(table).toBeVisible();
  const row = table.getByTestId(`table-row-${rowIndex}`);
  await expect(row).toBeVisible();
  // Click the row icon to select it (same approach as multi-select in context-menu spec).
  const icon = row.getByTestId("room-icon-image");
  await icon.click();
}

async function openInfoPanel(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("SHOW_INFO_PANEL_EVENT"));
  });
  await expect(page.getByTestId("info_panel_aside_header")).toBeVisible();
}

test.describe("Info Panel Sample Plugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withInfoPanelPlugin"),
    );
  });

  test("Sample tab is visible for a docx file", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await selectRow(page, ROW_DOCX);
    await openInfoPanel(page);

    const sampleTab = page.getByTestId(
      "info_plugin-info-panel-sample-general_tab",
    );
    await expect(sampleTab).toBeVisible();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-info-panel",
      "info-panel_sample-tab-docx.png",
    ]);
  });

  test("Sample tab is visible for a folder", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await selectRow(page, ROW_FOLDER);
    await openInfoPanel(page);

    const sampleTab = page.getByTestId(
      "info_plugin-info-panel-sample-general_tab",
    );
    await expect(sampleTab).toBeVisible();
  });

  test("clicking Sample tab shows plugin body and triggers onClick toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await selectRow(page, ROW_DOCX);
    await openInfoPanel(page);

    const sampleTab = page.getByTestId(
      "info_plugin-info-panel-sample-general_tab",
    );
    await expect(sampleTab).toBeVisible();
    await sampleTab.getByText("Sample").click();

    // Plugin body is rendered.
    const pluginBody = page.getByTestId("info_panel_plugin_info-panel");
    await expect(pluginBody).toBeVisible();
    await expect(pluginBody.getByText("Plugin info panel")).toBeVisible();
    await expect(
      pluginBody.getByText("Visible for any file or folder."),
    ).toBeVisible();

    // onClick fires a success toast.
    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-info-panel",
      "info-panel_sample-tab-body.png",
    ]);
  });

  test("Image info tab is visible only for image files", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    // Select a .docx file first — Image info tab must NOT appear.
    await selectRow(page, ROW_DOCX);
    await openInfoPanel(page);

    const imageTab = page.getByTestId(
      "info_plugin-info-panel-sample-image_tab",
    );
    await expect(imageTab).not.toBeVisible();

    // Deselect all (Escape clears multi-select), then single-select the jpg.
    await page.keyboard.press("Escape");
    await selectRow(page, ROW_JPG);

    await expect(imageTab).toBeVisible();
  });

  test("switching from Sample tab to Beta tab shows different body content", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await selectRow(page, ROW_DOCX);
    await openInfoPanel(page);

    // Open the Sample tab first.
    const sampleTab = page.getByTestId(
      "info_plugin-info-panel-sample-general_tab",
    );
    await expect(sampleTab).toBeVisible();
    await sampleTab.getByText("Sample").click();

    const pluginBody = page.getByTestId("info_panel_plugin_info-panel");
    await expect(pluginBody).toBeVisible();
    await expect(pluginBody.getByText("Plugin info panel")).toBeVisible();

    // Switch to the Beta tab.
    const betaTab = page.getByTestId(
      "info_plugin-info-panel-sample-beta_tab",
    );
    await expect(betaTab).toBeVisible();
    await betaTab.getByText("Beta").click();

    // Beta body must show its own unique content.
    await expect(pluginBody.getByText("Beta tab body")).toBeVisible();
    await expect(
      pluginBody.getByText("Content unique to the Beta tab."),
    ).toBeVisible();

    // Sample body text must no longer be visible.
    await expect(pluginBody.getByText("Plugin info panel")).not.toBeVisible();
  });

  test("File details tab is hidden for folder, visible for file", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    // Select a docx file — File details tab must be visible.
    await selectRow(page, ROW_DOCX);
    await openInfoPanel(page);

    const fileOnlyTab = page.getByTestId(
      "info_plugin-info-panel-sample-file-only_tab",
    );
    await expect(fileOnlyTab).toBeVisible();

    // Click it to open the body.
    await fileOnlyTab.getByText("File details").click();
    const pluginBody = page.getByTestId("info_panel_plugin_info-panel");
    await expect(pluginBody.getByText("Visible only for files, not folders.")).toBeVisible();

    // Deselect, then select a folder — tab must disappear and Details view shown.
    await page.keyboard.press("Escape");
    await selectRow(page, ROW_FOLDER);

    await expect(fileOnlyTab).not.toBeVisible();
    await expect(
      page.getByTestId("info_panel_files_view_details"),
    ).toBeVisible();
  });

  test("Image info tab: onLoad replaces placeholder with loaded content", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await selectRow(page, ROW_JPG);
    await openInfoPanel(page);

    const imageTab = page.getByTestId(
      "info_plugin-info-panel-sample-image_tab",
    );
    await expect(imageTab).toBeVisible();
    await imageTab.getByText("Image info").click();

    const pluginBody = page.getByTestId("info_panel_plugin_info-panel");
    await expect(pluginBody).toBeVisible();

    // onLoad runs: placeholder appears first, then body is replaced.
    // Wait for the loaded text (onLoad resolves after 600 ms).
    await expect(
      pluginBody.getByText("Loaded asynchronously via onLoad."),
    ).toBeVisible({ timeout: 3000 });

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-info-panel",
      "info-panel_image-tab-loaded.png",
    ]);
  });
});
