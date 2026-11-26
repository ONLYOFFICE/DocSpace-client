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
  capabilitiesHandler,
  filesSettingsHandler,
  MEMBER_PLUGIN_ADMIN_ID,
  MEMBER_PLUGIN_OWNER_ID,
  MEMBER_PLUGIN_USER_ID,
  memberPluginDeleteHandler,
  memberPluginUpdateHandler,
  membersPluginsHandler,
  mockOwnPersonalPlugin,
  ownPersonalPluginsHandlers,
  personalPluginsSettings,
  personalPluginsSwitchHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
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

    await expect(own.getByTestId("member_avatar_owner")).toBeVisible();
    await expect(admins.getByTestId("member_avatar_admin")).toBeVisible();
    await expect(user.getByTestId("member_avatar_user")).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins",
      "personal-plugins-users.png",
    ]);
  });

  test("sorts by the plugin name, and back on a second click", async ({
    page,
    baseUrl,
  }) => {
    await openUsersPlugins(page, baseUrl);
    await expect(page.locator(ROWS)).toHaveCount(4);

    const pluginHeader = page
      .getByTestId("table-header")
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

    await expect(weather.getByText("https://api.open-meteo.com")).toBeVisible();
    await expect(weather.getByText("2.1.0")).toHaveCount(0);
  });

  test("shows the description of a plugin when its name is hovered", async ({
    page,
    baseUrl,
  }) => {
    await openUsersPlugins(page, baseUrl);

    const title = page
      .getByTestId(rowId(MEMBER_PLUGIN_USER_ID, "weather-now"))
      .getByText("Weather now", { exact: true });
    const description = page.getByText(
      "Shows the current weather in Riga from the profile menu.",
    );

    await expect(title).toBeVisible();
    await expect(description).toHaveCount(0);

    await title.hover();

    await expect(description).toBeVisible();
  });

  test("shows the description of a plugin when its name gets keyboard focus", async ({
    page,
    baseUrl,
  }) => {
    await openUsersPlugins(page, baseUrl);

    const title = page.getByTestId(
      `plugin_title_${MEMBER_PLUGIN_USER_ID}_weather-now`,
    );
    const description = page.getByText(
      "Shows the current weather in Riga from the profile menu.",
    );

    await expect(title).toBeVisible();
    await expect(description).toHaveCount(0);

    await title.focus();
    await expect(description).toBeVisible();

    await title.blur();
    await expect(description).toHaveCount(0);
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
      .getByTestId(
        `${rowId(MEMBER_PLUGIN_USER_ID, "weather-now")}_toggle_button`,
      );
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
    await row.click({ button: "right" });
    await page.getByTestId("user-plugin_delete").click();

    await expect(
      page.getByText(
        "The Weather now plugin will be deleted for Smirnova Anna together with its settings. It cannot be restored.",
      ),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins",
      "personal-plugins-users-delete-dialog.png",
    ]);

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

    await expectScreenshot(page, [
      "desktop",
      "plugins",
      "personal-plugins-users-empty.png",
    ]);
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

test.describe("Personal plugins in the profile", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(
        TEST_PORT,
        TypeSettings.AuthenticatedWithPlugins,
        personalPluginsSettings(true),
      ),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("uploads a plugin for oneself and lists it on the Plugins tab", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(...ownPersonalPluginsHandlers(TEST_PORT));

    await page.goto(`${baseUrl}/profile/plugins`);

    const dropzone = page.getByTestId("upload_personal_plugin_dropzone");
    await expect(dropzone).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins",
      "personal-plugins-profile-empty.png",
    ]);

    const upload = page.waitForRequest(
      (r) =>
        r.method() === "POST" &&
        r.url().endsWith("/settings/webplugins?personal=true"),
    );
    const bundle = page.waitForResponse(`**${mockOwnPersonalPlugin.url}`);

    await dropzone.getByTestId("dropzone-input").setInputFiles({
      name: "my-notes.zip",
      mimeType: "application/zip",
      buffer: Buffer.from("personal plugin archive"),
    });

    await upload;
    await bundle;

    const card = page.getByTestId(`personal_plugin_${mockOwnPersonalPlugin.name}`);
    await expect(card).toBeVisible();
    await expect(card.getByText(mockOwnPersonalPlugin.version)).toBeVisible();
    await expect(
      card.getByTestId("enable_plugin_toggle_button").getByTestId(
        "toggle-button-input",
      ),
    ).toBeChecked();

    await expectScreenshot(page, [
      "desktop",
      "plugins",
      "personal-plugins-profile.png",
    ]);
  });

  test("deletes one's own plugin that a workspace plugin shadows for oneself alone", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const { name } = mockOwnPersonalPlugin;
    const workspaceCopy = {
      ...mockOwnPersonalPlugin,
      version: "2.0.0",
      personal: false,
    };

    mockRequest.use(
      ...ownPersonalPluginsHandlers(
        TEST_PORT,
        [mockOwnPersonalPlugin],
        [workspaceCopy],
      ),
    );

    await page.goto(`${baseUrl}/profile/plugins`);

    const card = page.getByTestId(`personal_plugin_${name}`);
    await expect(card.getByTestId(`plugin_shadowed_${name}_text`)).toBeVisible();

    await card.getByTestId(`delete_plugin_${name}_link`).click();

    const deletion = page.waitForRequest(
      (r) =>
        r.method() === "DELETE" &&
        new URL(r.url()).pathname.endsWith(`/settings/webplugins/${name}`),
    );
    await page.getByTestId("confirm_delete_plugin_button").click();
    const request = await deletion;

    expect(new URL(request.url()).searchParams.get("personal")).toBe("true");
    await expect(card).toHaveCount(0);
  });
});
