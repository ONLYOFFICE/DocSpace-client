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
  selfHandlerWithCulture,
  settingsHandler,
  TypeSettings,
  updateUserCultureHandler,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_NAME = "locale-sample";
const PLUGIN_TESTID = `plugin_${PLUGIN_NAME}`;
const PLUGINS_URL = "/portal-settings/integration/plugins";
const PROFILE_URL = "/portal-settings/profile/login";

test.describe("Locale Sample Plugin — plugin metadata localization", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      filesSettingsHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      webPluginsHandler(TEST_PORT, "withLocaleSample"),
    );
  });

  // ── 1. Default locale (en-US) ──────────────────────────────────────────────

  test("should display plugin name and description in English by default", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PLUGINS_URL}`);
    await expect(page.locator(".settings-section_header")).toBeVisible();

    const plugin = page.getByTestId(PLUGIN_TESTID);
    await expect(plugin).toBeVisible();

    await expect(
      plugin.getByRole("heading", { name: PLUGIN_NAME }),
    ).toBeVisible();
    await expect(
      plugin.getByText(
        "Sample plugin demonstrating plugin localization for DocSpace",
      ),
    ).toBeVisible();
  });

  test("should display English text in settings dialog by default", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PLUGINS_URL}`);
    await expect(page.locator(".settings-section_header")).toBeVisible();

    const plugin = page.getByTestId(PLUGIN_TESTID);
    await expect(plugin).toBeVisible();

    const settingsButton = plugin.getByTestId("open_settings_icon_button");
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    const settingsDescription = page.getByTestId("settings_plugin_description");
    await expect(settingsDescription).toBeVisible();
    await expect(
      settingsDescription.getByText(
        "Sample plugin demonstrating plugin localization for DocSpace",
      ),
    ).toBeVisible();
  });

  // ── 2. Azerbaijani locale ──────────────────────────────────────────────────

  test("should display translated name and description for az locale", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // Switch portal language to az
    await page.goto(`${baseUrl}${PROFILE_URL}`);

    const languageSelector = page.getByTestId("language_combo_box").first();
    await expect(languageSelector).toBeVisible();
    await languageSelector.click();

    mockRequest.use(
      updateUserCultureHandler(TEST_PORT, "az"),
      selfHandlerWithCulture(TEST_PORT, "az"),
    );

    await page.getByTestId("drop_down_item_az").first().click();

    await page.context().addCookies([
      {
        name: "asc_language",
        value: "az",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto(`${baseUrl}${PLUGINS_URL}`);
    await expect(page.locator(".settings-section_header")).toBeVisible();

    const plugin = page.getByTestId(PLUGIN_TESTID);
    await expect(plugin).toBeVisible();

    // Verify az-locale name and description are shown
    await expect(
      plugin.getByRole("heading", { name: "Lokal nümunəsi" }),
    ).toBeVisible();
    await expect(
      plugin.getByText(
        "DocSpace üçün plagin lokalizasiyasını nümayiş etdirən nümunə plagin",
      ),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-locale",
      "plugins-locale-az.png",
    ]);
  });

  test("should display az locale text in settings dialog", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // Switch portal language to az
    await page.goto(`${baseUrl}${PROFILE_URL}`);

    const languageSelector = page.getByTestId("language_combo_box").first();
    await expect(languageSelector).toBeVisible();
    await languageSelector.click();

    mockRequest.use(
      updateUserCultureHandler(TEST_PORT, "az"),
      selfHandlerWithCulture(TEST_PORT, "az"),
    );

    await page.getByTestId("drop_down_item_az").first().click();

    await page.context().addCookies([
      {
        name: "asc_language",
        value: "az",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto(`${baseUrl}${PLUGINS_URL}`);
    await expect(page.locator(".settings-section_header")).toBeVisible();

    const plugin = page.getByTestId(PLUGIN_TESTID);
    await expect(plugin).toBeVisible();

    const settingsButton = plugin.getByTestId("open_settings_icon_button");
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    const settingsDescription = page.getByTestId("settings_plugin_description");
    await expect(settingsDescription).toBeVisible();
    await expect(
      settingsDescription.getByText(
        "DocSpace üçün plagin lokalizasiyasını nümayiş etdirən nümunə plagin",
      ),
    ).toBeVisible();

    await page.evaluate(() => {
      const dateText = document.querySelector(
        "[data-testid='plugin_upload_date_text']",
      ) as HTMLDivElement | null;

      if (dateText) dateText.style.display = "none";
    });

    await expectScreenshot(page, [
      "desktop",
      "plugins-locale",
      "plugins-locale-az-settings.png",
    ]);
  });

  // ── 3. Fallback locale ─────────────────────────────────────────────────────

  test("should fall back to English name and description for unsupported locale", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // Switch portal language to lv (Latvian — not supported by the plugin)
    await page.goto(`${baseUrl}${PROFILE_URL}`);

    const languageSelector = page.getByTestId("language_combo_box").first();
    await expect(languageSelector).toBeVisible();
    await languageSelector.click();

    mockRequest.use(
      updateUserCultureHandler(TEST_PORT, "lv"),
      selfHandlerWithCulture(TEST_PORT, "lv"),
    );

    await page.getByTestId("drop_down_item_lv").first().click();

    await page.context().addCookies([
      {
        name: "asc_language",
        value: "lv",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto(`${baseUrl}${PLUGINS_URL}`);
    await expect(page.locator(".settings-section_header")).toBeVisible();

    const plugin = page.getByTestId(PLUGIN_TESTID);
    await expect(plugin).toBeVisible();

    // Plugin has no lv translation — portal shows English name and description
    await expect(
      plugin.getByRole("heading", { name: PLUGIN_NAME }),
    ).toBeVisible();
    await expect(
      plugin.getByText(
        "Sample plugin demonstrating plugin localization for DocSpace",
      ),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-locale",
      "plugins-locale-fallback-en.png",
    ]);
  });

  test("should fall back to English text in settings dialog for unsupported locale", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PROFILE_URL}`);

    const languageSelector = page.getByTestId("language_combo_box").first();
    await expect(languageSelector).toBeVisible();
    await languageSelector.click();

    mockRequest.use(
      updateUserCultureHandler(TEST_PORT, "lv"),
      selfHandlerWithCulture(TEST_PORT, "lv"),
    );

    await page.getByTestId("drop_down_item_lv").first().click();

    await page.context().addCookies([
      {
        name: "asc_language",
        value: "lv",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto(`${baseUrl}${PLUGINS_URL}`);
    await expect(page.locator(".settings-section_header")).toBeVisible();

    const plugin = page.getByTestId(PLUGIN_TESTID);
    await expect(plugin).toBeVisible();

    const settingsButton = plugin.getByTestId("open_settings_icon_button");
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    const settingsDescription = page.getByTestId("settings_plugin_description");
    await expect(settingsDescription).toBeVisible();
    await expect(
      settingsDescription.getByText(
        "Sample plugin demonstrating plugin localization for DocSpace",
      ),
    ).toBeVisible();

    await page.evaluate(() => {
      const dateText = document.querySelector(
        "[data-testid='plugin_upload_date_text']",
      ) as HTMLDivElement | null;

      if (dateText) dateText.style.display = "none";
    });

    await expectScreenshot(page, [
      "desktop",
      "plugins-locale",
      "plugins-locale-fallback-en-settings.png",
    ]);
  });
});

