// (c) Copyright Ascensio System SIA 2009-2025
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

import { endpoints } from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";

test.describe("Plugins", () => {
  test.beforeEach(async ({ mockRequest }) => {
    await mockRequest.router([
      endpoints.aiConfig,
      endpoints.settingsWithQuery,
      endpoints.settingsWithPlugins,
      endpoints.colorTheme,
      endpoints.build,
      endpoints.capabilities,
      endpoints.selfEmailActivatedClient,
      endpoints.tariff,
      endpoints.quota,
      endpoints.additionalSettings,
      endpoints.getPortal,
      endpoints.companyInfo,
      endpoints.cultures,
      endpoints.root,
      endpoints.invitationSettings,
      endpoints.filesSettings,
      endpoints.webPlugins,

      endpoints.thirdPartyCapabilities,
      endpoints.thirdParty,
      endpoints.docService,
    ]);
  });

  test("should navigate to plugins page and display empty state", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.webPlugins]);

    await page.goto("/portal-settings/integration/plugins");

    const emptyView = page.getByTestId("empty-screen-container");
    await expect(emptyView).toBeVisible();

    await expect(emptyView).toHaveScreenshot([
      "desktop",
      "plugins",
      "plugins-empty.png",
    ]);

    const emptyTitle = page.getByText(/No plugins/i);
    await expect(emptyTitle).toBeVisible();
  });

  test("should display plugins list with data", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.webPluginsWithData]);

    await page.goto("/portal-settings/integration/plugins");

    const pluginsList = page.locator('[data-testid^="plugin_test-plugin"]');
    await expect(pluginsList).toHaveCount(2);

    const plugin1 = page.getByTestId("plugin_test-plugin-one");
    await expect(plugin1).toBeVisible();
    await expect(
      plugin1.getByText("Test Plugin One for e2e testing"),
    ).toBeVisible();
    await expect(plugin1.getByText("1.1.0")).toBeVisible();

    const plugin3 = page.getByTestId("plugin_test-plugin-three");
    await expect(plugin3).toBeVisible();
    await expect(
      plugin3.getByText("Test Plugin Three for e2e testing"),
    ).toBeVisible();
    await expect(plugin3.getByText("1.3.0")).toBeVisible();
  });

  test("should upload .zip plugin when upload is enabled", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.webPluginsWithData]);

    await page.goto("/portal-settings/integration/plugins");

    const pluginsListBefore = page.locator(
      '[data-testid^="plugin_test-plugin"]',
    );
    await expect(pluginsListBefore).toHaveCount(2);

    const dropzone = page.getByTestId("upload_plugin_dropzone");
    await expect(dropzone).toBeVisible();
    const dropzoneInput = dropzone.getByTestId("dropzone-input");

    await mockRequest.router([endpoints.webPluginsAdd]);

    await dropzoneInput.setInputFiles({
      name: "dummy.zip",
      mimeType: "application/zip",
      buffer: Buffer.from("dummy zip data"),
    });

    const pluginsListAfter = page.locator(
      '[data-testid^="plugin_test-plugin"]',
    );
    await expect(pluginsListAfter).toHaveCount(3);
  });

  test("should toggle plugin enabled state", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.webPluginsWithData]);

    await page.goto("/portal-settings/integration/plugins");

    const plugin1 = page.getByTestId("plugin_test-plugin-one");
    await expect(plugin1).toBeVisible();

    const toggleSwitch = plugin1.getByTestId("enable_plugin_toggle_button");
    await expect(toggleSwitch).toBeVisible();

    await mockRequest.router([endpoints.webPluginsUpdate]);

    await toggleSwitch.click();
  });

  test("should delete plugin successfully", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.webPluginsWithData]);

    await page.goto("/portal-settings/integration/plugins");

    const pluginsListBefore = page.locator(
      '[data-testid^="plugin_test-plugin"]',
    );
    await expect(pluginsListBefore).toHaveCount(2);

    const plugin3 = page.getByTestId("plugin_test-plugin-three");
    await expect(plugin3).toBeVisible();

    const settingsButton = plugin3.getByTestId("open_settings_icon_button");
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    const deleteButton = page.getByTestId("settings_delete_plugin_button");
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    const confirmDeleteButton = page.getByRole("button", {
      name: "OK",
      exact: true,
    });

    await expect(confirmDeleteButton).toBeVisible();
    await confirmDeleteButton.click();

    const pluginsListAfter = page.locator(
      '[data-testid^="plugin_test-plugin"]',
    );
    await expect(pluginsListAfter).toHaveCount(1);
  });

  test("should display plugin information correctly", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([endpoints.webPluginsWithData]);

    await page.goto("/portal-settings/integration/plugins");

    const plugin1 = page.getByTestId("plugin_test-plugin-one");
    await expect(plugin1).toBeVisible();

    await expect(
      plugin1.getByRole("heading", { name: "test-plugin-one" }),
    ).toBeVisible();

    const versionBadge = plugin1.getByTestId(
      "plugin_version_test-plugin-one_badge",
    );
    await expect(versionBadge).toBeVisible();
    await expect(versionBadge).toContainText("1.1.0");
  });
});
