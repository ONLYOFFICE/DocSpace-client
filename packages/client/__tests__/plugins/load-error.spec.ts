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

import type { Locator, Page } from "@playwright/test";

import {
  BROKEN_PLUGIN_MISSING_PACKAGE,
  filesSettingsHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  webPluginsBrokenBundleHandler,
  webPluginsDeleteHandler,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_NAME = "broken-sample";
const PLUGIN_VERSION = "1.0.0";

const PLUGIN_REQUEST_URL = `**/plugins/${PLUGIN_NAME}/plugin.js`;
const PLUGINS_PAGE_URL = "/portal-settings/integration/plugins";

const CARD_TEST_ID = `plugin_${PLUGIN_NAME}`;
const CARD_ICON_TEST_ID = `plugin_load_error_${PLUGIN_NAME}_icon`;
const VERSION_BADGE_TEST_ID = `plugin_version_${PLUGIN_NAME}_badge`;

/** Opens the plugins page and waits for the broken bundle to be fetched. */
const openPluginsPage = async (
  page: Page,
  baseUrl: string,
): Promise<Locator> => {
  const bundleFetched = page.waitForResponse(PLUGIN_REQUEST_URL);
  await page.goto(`${baseUrl}${PLUGINS_PAGE_URL}`);
  await bundleFetched;

  const card = page.getByTestId(CARD_TEST_ID);
  await expect(card).toBeVisible();

  return card;
};

test.describe("Plugin whose bundle fails to load", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      filesSettingsHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      webPluginsHandler(TEST_PORT, "withBrokenPlugin"),
      webPluginsBrokenBundleHandler(TEST_PORT),
    );
  });

  test("The plugin stays in the list, marked with a load-error icon", async ({
    page,
    baseUrl,
  }) => {
    const card = await openPluginsPage(page, baseUrl);

    await expect(
      card.getByRole("heading", { name: PLUGIN_NAME }),
    ).toBeVisible();
    await expect(card.getByTestId(VERSION_BADGE_TEST_ID)).toContainText(
      PLUGIN_VERSION,
    );
    await expect(card.getByTestId(CARD_ICON_TEST_ID)).toBeVisible();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-load-error",
      "load-error_card.png",
    ]);
  });

  test("The icon tooltip names the package the portal does not provide", async ({
    page,
    baseUrl,
  }) => {
    const card = await openPluginsPage(page, baseUrl);

    await card.getByTestId(CARD_ICON_TEST_ID).hover();

    const tooltip = page
      .getByRole("tooltip")
      .filter({ hasText: BROKEN_PLUGIN_MISSING_PACKAGE });
    await expect(tooltip).toBeVisible();
  });

  test("The enable toggle reads off and is locked", async ({
    page,
    baseUrl,
  }) => {
    const card = await openPluginsPage(page, baseUrl);

    const toggleInput = card
      .getByTestId("enable_plugin_toggle_button")
      .getByTestId("toggle-button-input");
    await expect(toggleInput).not.toBeChecked();
    await expect(toggleInput).toBeDisabled();
  });

  test("The settings dialog reports the failure and offers deletion", async ({
    page,
    baseUrl,
  }) => {
    const card = await openPluginsPage(page, baseUrl);

    await card.getByTestId("open_settings_icon_button").click();

    await expect(page.getByTestId("plugin_load_error_status")).toHaveText(
      "Failed to load",
    );
    await expect(page.getByTestId("plugin_load_error_icon")).toBeVisible();
    await expect(
      page.getByTestId("settings_delete_plugin_button"),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-load-error",
      "load-error_settings-dialog.png",
    ]);
  });

  test("The broken plugin can be deleted", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(webPluginsDeleteHandler(TEST_PORT));

    const card = await openPluginsPage(page, baseUrl);

    await card.getByTestId("open_settings_icon_button").click();
    await page.getByTestId("settings_delete_plugin_button").click();

    const confirmButton = page.getByTestId("confirm_delete_plugin_button");
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    await expect(page.getByTestId(CARD_TEST_ID)).toHaveCount(0);
    await expect(page.getByText("Plugin deleted successfully")).toBeVisible();
  });
});
