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
  MEMBER_PLUGIN_ADMIN_ID,
  MEMBER_PLUGIN_OWNER_ID,
  MEMBER_PLUGIN_USER_ID,
  memberPluginDeleteHandler,
  memberPluginUpdateHandler,
  membersPluginsHandler,
  personalPluginsSettings,
  personalPluginsSwitchHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "../fixtures/base";

const ROWS =
  '[data-testid^="user_plugin_"]:not([data-testid$="_toggle_button"])';

const rowId = (userId: string, name: string) =>
  `user_plugin_${userId}_${name}`;

const rowOrder = (page: Page) =>
  page
    .locator(ROWS)
    .evaluateAll((rows) => rows.map((row) => row.getAttribute("data-testid")));

const openUsersPlugins = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/portal-settings/integration/plugins`);
  await page.getByTestId("users_tab").click();
};

test.describe("Users' plugins", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(
        TEST_PORT,
        TypeSettings.AuthenticatedWithPlugins,
        personalPluginsSettings(false),
      ),
      filesSettingsHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      webPluginsHandler(TEST_PORT),
      membersPluginsHandler(TEST_PORT),
    );
  });

  test("lists the plugins by user, marks the administrator's own and badges the admins", async ({
    page,
    baseUrl,
  }) => {
    await openUsersPlugins(page, baseUrl);

    await expect(page.locator(ROWS)).toHaveCount(4);
    expect(await rowOrder(page)).toEqual([
      rowId(MEMBER_PLUGIN_ADMIN_ID, "editor-link"),
      rowId(MEMBER_PLUGIN_OWNER_ID, "copy-item-id"),
      rowId(MEMBER_PLUGIN_USER_ID, "task-tracker-links"),
      rowId(MEMBER_PLUGIN_USER_ID, "weather-now"),
    ]);

    const own = page.getByTestId(rowId(MEMBER_PLUGIN_OWNER_ID, "copy-item-id"));
    const admins = page.getByTestId(rowId(MEMBER_PLUGIN_ADMIN_ID, "editor-link"));
    const user = page.getByTestId(rowId(MEMBER_PLUGIN_USER_ID, "weather-now"));

    await expect(own.getByText("(Me)")).toBeVisible();
    await expect(admins.getByText("(Me)")).toHaveCount(0);

    await expect(own.locator(".owner_icon")).toBeVisible();
    await expect(admins.locator(".admin_icon")).toBeVisible();
    await expect(user.locator(".owner_icon, .admin_icon")).toHaveCount(0);
  });

  test("sorts by the plugin name, and back on a second click", async ({
    page,
    baseUrl,
  }) => {
    await openUsersPlugins(page, baseUrl);
    await expect(page.locator(ROWS)).toHaveCount(4);

    const pluginHeader = page
      .locator(".table-container_header")
      .getByText("Plugin", { exact: true });

    await pluginHeader.click();

    await expect
      .poll(() => rowOrder(page))
      .toEqual([
        rowId(MEMBER_PLUGIN_OWNER_ID, "copy-item-id"),
        rowId(MEMBER_PLUGIN_ADMIN_ID, "editor-link"),
        rowId(MEMBER_PLUGIN_USER_ID, "task-tracker-links"),
        rowId(MEMBER_PLUGIN_USER_ID, "weather-now"),
      ]);

    await pluginHeader.click();

    await expect
      .poll(() => rowOrder(page))
      .toEqual([
        rowId(MEMBER_PLUGIN_USER_ID, "weather-now"),
        rowId(MEMBER_PLUGIN_USER_ID, "task-tracker-links"),
        rowId(MEMBER_PLUGIN_ADMIN_ID, "editor-link"),
        rowId(MEMBER_PLUGIN_OWNER_ID, "copy-item-id"),
      ]);
  });

  test("hides a column from the table settings and keeps it hidden after a reload", async ({
    page,
    baseUrl,
  }) => {
    await openUsersPlugins(page, baseUrl);

    const weather = page.getByTestId(
      rowId(MEMBER_PLUGIN_USER_ID, "weather-now"),
    );
    await expect(weather.getByText("2.1.0")).toBeVisible();

    await page.getByTestId("table-settings-button").click();
    await page.getByTestId("table_settings_Version").click();

    await expect(weather.getByText("2.1.0")).toHaveCount(0);
    await expect(weather.getByText("https://api.open-meteo.com")).toBeVisible();

    await page.reload();
    await page.getByTestId("users_tab").click();

    await expect(weather.getByText("https://api.open-meteo.com")).toBeVisible();
    await expect(weather.getByText("2.1.0")).toHaveCount(0);
  });

  test("shows the description of a plugin when its name is hovered", async ({
    page,
    baseUrl,
  }) => {
    await openUsersPlugins(page, baseUrl);

    const description = page.getByText(
      "Shows the current weather in Riga from the profile menu.",
    );
    await expect(description).toHaveCount(0);

    await page
      .getByTestId(rowId(MEMBER_PLUGIN_USER_ID, "weather-now"))
      .getByText("Weather now", { exact: true })
      .hover();

    await expect(description).toBeVisible();
  });

  test("switches a member's plugin off for that member", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(memberPluginUpdateHandler(TEST_PORT));

    await openUsersPlugins(page, baseUrl);

    const toggle = page
      .getByTestId(rowId(MEMBER_PLUGIN_USER_ID, "weather-now"))
      .getByTestId("user_plugin_weather-now_toggle_button");
    const input = toggle.getByTestId("toggle-button-input");
    await expect(input).toBeChecked();

    const request = page.waitForRequest(
      (r) =>
        r.method() === "PUT" &&
        r
          .url()
          .endsWith(
            `/settings/personalwebplugins/plugins/${MEMBER_PLUGIN_USER_ID}/weather-now`,
          ),
    );
    await toggle.click();

    expect((await request).postDataJSON()).toEqual({ enabled: false });
    await expect(input).not.toBeChecked();
  });

  test("deletes a member's plugin after a confirmation that names the plugin and the member", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(memberPluginDeleteHandler(TEST_PORT));

    await openUsersPlugins(page, baseUrl);

    const row = page.getByTestId(rowId(MEMBER_PLUGIN_USER_ID, "weather-now"));
    await row.locator(".expandButton").click();
    await page.getByTestId("user-plugin_delete").click();

    await expect(
      page.getByText(
        "The Weather now plugin will be deleted for Smirnova Anna together with its settings. It cannot be restored.",
      ),
    ).toBeVisible();

    const request = page.waitForRequest(
      (r) =>
        r.method() === "DELETE" &&
        r
          .url()
          .endsWith(
            `/settings/personalwebplugins/plugins/${MEMBER_PLUGIN_USER_ID}/weather-now`,
          ),
    );
    await page.getByTestId("confirm_delete_plugin_button").click();
    await request;

    await expect(row).toHaveCount(0);
    await expect(page.locator(ROWS)).toHaveCount(3);
    await expect(page.getByText("Plugin deleted successfully")).toBeVisible();
  });

  test("turns personal plugins on for the workspace", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(personalPluginsSwitchHandler(TEST_PORT));

    await openUsersPlugins(page, baseUrl);

    const toggle = page.getByTestId("personal_plugins_toggle_button");
    const input = toggle.getByTestId("toggle-button-input");
    await expect(input).not.toBeChecked();

    const request = page.waitForRequest(
      (r) =>
        r.method() === "POST" &&
        r.url().endsWith("/settings/personalwebplugins"),
    );
    await toggle.getByTestId("toggle-button-container").click();

    expect((await request).postDataJSON()).toEqual({ enabled: true });
    await expect(input).toBeChecked();
  });

  test("says so when no user has added a plugin", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(membersPluginsHandler(TEST_PORT, []));

    await openUsersPlugins(page, baseUrl);

    await expect(
      page.getByText("No one has added their own plugins yet"),
    ).toBeVisible();
    await expect(page.locator(ROWS)).toHaveCount(0);
  });

  test("has no Users' plugins tab when the installation turns personal plugins off", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins, {
        plugins: {
          ...personalPluginsSettings(false).plugins,
          personalAvailable: false,
        },
      }),
    );

    await page.goto(`${baseUrl}/portal-settings/integration/plugins`);

    await expect(page.getByTestId("empty-screen-container")).toBeVisible();
    await expect(page.getByTestId("users_tab")).toHaveCount(0);
  });
});
