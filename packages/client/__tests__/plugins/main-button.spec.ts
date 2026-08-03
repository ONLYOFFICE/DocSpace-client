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

const PLUGIN_REQUEST_URL = "**/plugins/main-button/plugin.js";

// Personal folder — main button with plugin items is visible here.
const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Clicks the Actions main button to open the dropdown. */
async function openMainButton(page: import("@playwright/test").Page) {
  const btn = page.getByTestId("main-button");
  await expect(btn).toBeVisible();
  await btn.click();
}

/**
 * Opens the main button dropdown and hovers the "More" plugin submenu item
 * so that plugin items become visible.
 */
async function openMoreSubmenu(page: import("@playwright/test").Page) {
  await openMainButton(page);
  const more = page.getByTestId("more-plugins");
  await expect(more).toBeVisible();
  await more.hover();
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe("Main Button Sample Plugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withMainButtonPlugin"),
    );
  });

  // ── 1. "More" submenu ────────────────────────────────────────────────────────

  test('"More" plugin submenu is visible in the main button dropdown', async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openMainButton(page);

    const more = page.getByTestId("more-plugins");
    await expect(more).toBeVisible();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-main-button",
      "main-button_more-menu.png",
    ]);
  });

  test('"More" submenu contains Quick Action and Generate Report items', async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openMoreSubmenu(page);

    await expect(
      page.getByTestId("main-button-sample-quick"),
    ).toBeVisible();
    await expect(
      page.getByTestId("main-button-sample-report"),
    ).toBeVisible();
  });

  // ── 2. Quick Action ───────────────────────────────────────────────────────────

  test("Quick Action fires a success toast with the folder ID", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openMoreSubmenu(page);
    await page.getByTestId("main-button-sample-quick").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("Quick action triggered for folder:");
  });

  // ── 3. Generate Report submenu ────────────────────────────────────────────────

  test("Hovering Generate Report reveals PDF and CSV sub-items", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openMoreSubmenu(page);

    const report = page.getByTestId("main-button-sample-report");
    await expect(report).toBeVisible();
    await report.hover();

    await expect(
      page.getByTestId("main-button-sample-report-pdf"),
    ).toBeVisible();
    await expect(
      page.getByTestId("main-button-sample-report-csv"),
    ).toBeVisible();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-main-button",
      "main-button_report-submenu.png",
    ]);
  });

  test("Clicking PDF Report fires a success toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openMoreSubmenu(page);
    await page.getByTestId("main-button-sample-report").hover();
    await page.getByTestId("main-button-sample-report-pdf").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("PDF report generated for folder:");
  });

  test("Clicking CSV Report fires a success toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openMoreSubmenu(page);
    await page.getByTestId("main-button-sample-report").hover();
    await page.getByTestId("main-button-sample-report-csv").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("CSV report generated for folder:");
  });
});
