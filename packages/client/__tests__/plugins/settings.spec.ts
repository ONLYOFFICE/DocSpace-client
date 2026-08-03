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
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  webPluginsHandler,
  webPluginsUpdateHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_REQUEST_URL = "**/plugins/settings/plugin.js";
const PLUGINS_PAGE_URL = "/portal-settings/integration/plugins";

async function openSettingsDialog(
  page: import("@playwright/test").Page,
  baseUrl: string,
): Promise<void> {
  const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
  await page.goto(`${baseUrl}${PLUGINS_PAGE_URL}`);
  await pluginLoaded;

  const pluginItem = page.getByTestId("plugin_settings");
  await expect(pluginItem).toBeVisible();

  const gearButton = pluginItem.getByTestId("open_settings_icon_button");
  await expect(gearButton).toBeVisible();
  await gearButton.click();

  await expect(page.getByTestId("settings_plugin_save_button")).toBeVisible();
}

test.describe("Settings Plugin — ISettingsPlugin via portal-settings", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      filesSettingsHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      webPluginsHandler(TEST_PORT, "withSettingsPlugin"),
    );
  });

  // ── 1. Plugin appears on the plugins page ─────────────────────────────────

  test("Settings plugin appears on the plugins page", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PLUGINS_PAGE_URL}`);
    await pluginLoaded;

    await expect(page.locator(".settings-section_header")).toBeVisible();

    const pluginItem = page.getByTestId("plugin_settings");
    await expect(pluginItem).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-settings",
      "plugin-settings_page.png",
    ]);
  });

  // ── 2. Clicking the gear icon opens the settings dialog ───────────────────

  test("Clicking the gear icon opens the settings dialog", async ({
    page,
    baseUrl,
  }) => {
    await openSettingsDialog(page, baseUrl);

    const saveBtn = page.getByTestId("settings_plugin_save_button");
    await expect(saveBtn).toBeVisible();

    const cancelBtn = page.getByTestId("settings_plugin_cancel_button");
    await expect(cancelBtn).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-settings",
      "plugin-settings_dialog-default.png",
    ]);
  });

  // ── 3. Settings dialog contains the input and toggle controls ─────────────

  test("Settings dialog body renders the input and toggle components", async ({
    page,
    baseUrl,
  }) => {
    await openSettingsDialog(page, baseUrl);

    // Input pre-populated with the default endpoint value.
    const endpointInput = page.getByTestId("text-input");
    await expect(endpointInput).toBeVisible();
    await expect(endpointInput).toHaveValue("https://api.example.com");

    const toggle = page.getByTestId("toggle-button");
    await expect(toggle.getByTestId("toggle-button-icon")).toBeVisible();

    const toggleInput = toggle.getByTestId("toggle-button-input");
    await expect(toggleInput).toBeChecked();
  });

  // ── 4. Changing values and saving persists them in the plugin state ────────

  test("Changing settings values and saving persists them on re-open", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(webPluginsUpdateHandler(TEST_PORT));

    await openSettingsDialog(page, baseUrl);

    // Change the API endpoint.
    const endpointInput = page.getByTestId("text-input");
    await endpointInput.fill("https://new-endpoint.example.com");
    await expect(endpointInput).toHaveValue("https://new-endpoint.example.com");

    // Toggle notifications off (it starts as checked).
    // Click the visible label element inside the toggle-button container.
    const toggleInput = page
      .getByTestId("toggle-button")
      .getByTestId("toggle-button-input");
    await expect(toggleInput).toBeChecked();
    await page.getByTestId("toggle-button").locator("label").click();
    await expect(toggleInput).not.toBeChecked();

    await expectScreenshot(page, [
      "desktop",
      "plugins-settings",
      "plugin-settings_dialog-changed.png",
    ]);

    // Save — triggers Actions.saveSettings + Actions.showToast.
    await page.getByTestId("settings_plugin_save_button").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");

    // Re-open the dialog to verify the plugin's onLoad returns updated values.
    const pluginItem = page.getByTestId("plugin_settings");
    const gearButton = pluginItem.getByTestId("open_settings_icon_button");
    await gearButton.click();
    await expect(page.getByTestId("settings_plugin_save_button")).toBeVisible();

    // Updated endpoint should be reflected.
    await expect(page.getByTestId("text-input")).toHaveValue(
      "https://new-endpoint.example.com",
    );

    // Notifications toggle should remain unchecked.
    await expect(
      page.getByTestId("toggle-button").getByTestId("toggle-button-input"),
    ).not.toBeChecked();

    await expectScreenshot(page, [
      "desktop",
      "plugins-settings",
      "plugin-settings_dialog-after-save.png",
    ]);
  });

  // ── 5. Clicking Save shows a success toast ────────────────────────────────

  test("Clicking Save shows a success toast", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openSettingsDialog(page, baseUrl);

    mockRequest.use(webPluginsUpdateHandler(TEST_PORT));

    await page.getByTestId("settings_plugin_save_button").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
  });

  // ── 6. Clicking Cancel closes the dialog ──────────────────────────────────

  test("Clicking Cancel closes the settings dialog", async ({
    page,
    baseUrl,
  }) => {
    await openSettingsDialog(page, baseUrl);

    await page.getByTestId("settings_plugin_cancel_button").click();

    // After cancelling the footer buttons should no longer be visible.
    await expect(
      page.getByTestId("settings_plugin_save_button"),
    ).not.toBeVisible();
  });
});

