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
  filesSettingsHandler,
  INIT_ERROR_PLUGIN_MESSAGE,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  webPluginsHandler,
  webPluginsInitErrorBundleHandler,
  webPluginsUpdateHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_NAME = "init-error-sample";

const PLUGIN_REQUEST_URL = `**/plugins/${PLUGIN_NAME}/plugin.js`;
const PLUGINS_PAGE_URL = "/portal-settings/integration/plugins";

const CARD_TEST_ID = `plugin_${PLUGIN_NAME}`;
const CARD_ICON_TEST_ID = `plugin_init_error_${PLUGIN_NAME}_icon`;

/** Opens the plugins page and waits for the bundle to be fetched. */
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

const toggleButton = (card: Locator) =>
  card.getByTestId("enable_plugin_toggle_button");

const toggleInput = (card: Locator) =>
  toggleButton(card).getByTestId("toggle-button-input");

test.describe("Plugin whose bundle loads but fails to initialize", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      filesSettingsHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      webPluginsHandler(TEST_PORT, "withInitErrorPlugin"),
      webPluginsInitErrorBundleHandler(TEST_PORT),
      webPluginsUpdateHandler(TEST_PORT),
    );
  });

  test("The plugin is marked but stays switchable", async ({
    page,
    baseUrl,
  }) => {
    const card = await openPluginsPage(page, baseUrl);

    await expect(card.getByTestId(CARD_ICON_TEST_ID)).toBeVisible();
    await expect(
      card.getByTestId(`plugin_load_error_${PLUGIN_NAME}_icon`),
    ).toHaveCount(0);

    const toggle = toggleInput(card);
    await expect(toggle).toBeChecked();
    await expect(toggle).toBeEnabled();
  });

  test("The icon tooltip names what threw", async ({ page, baseUrl }) => {
    const card = await openPluginsPage(page, baseUrl);

    await card.getByTestId(CARD_ICON_TEST_ID).hover();

    await expect(
      page.getByRole("tooltip").filter({ hasText: INIT_ERROR_PLUGIN_MESSAGE }),
    ).toBeVisible();
  });

  test("The settings dialog names the failure and marks it", async ({
    page,
    baseUrl,
  }) => {
    const card = await openPluginsPage(page, baseUrl);

    await card.getByTestId("open_settings_icon_button").click();

    const status = page.getByTestId("plugin_init_error_status");
    await expect(status).toHaveText("Failed to initialize");

    // The status names the kind of failure; only the mark carries the reason.
    await expect(status).not.toHaveAttribute("data-tooltip-content");

    await page.getByTestId("plugin_init_error_icon").hover();
    await expect(
      page.getByRole("tooltip").filter({ hasText: INIT_ERROR_PLUGIN_MESSAGE }),
    ).toBeVisible();
  });

  test("Switching the plugin off and on keeps the mark", async ({
    page,
    baseUrl,
  }) => {
    const card = await openPluginsPage(page, baseUrl);

    // The input is visually hidden under the toggle's icon, which intercepts
    // the pointer, so click the toggle itself and read the state off the input.
    const toggle = toggleButton(card);

    await toggle.click();
    await expect(page.getByText("Plugin disabled")).toBeVisible();

    await toggle.click();
    await expect(page.getByText("Plugin enabled")).toBeVisible();
    await expect(toggleInput(card)).toBeChecked();

    await expect(card.getByTestId(CARD_ICON_TEST_ID)).toBeVisible();

    await card.getByTestId(CARD_ICON_TEST_ID).hover();
    await expect(
      page.getByRole("tooltip").filter({ hasText: INIT_ERROR_PLUGIN_MESSAGE }),
    ).toBeVisible();
  });
});
