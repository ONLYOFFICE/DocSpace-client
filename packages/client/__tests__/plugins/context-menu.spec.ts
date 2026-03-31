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

import { readFileSync } from "fs";
import { join } from "path";

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

const PLUGIN_REQUEST_URL = "**/plugins/context-menu/plugin.js";

const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

async function openContextMenu(
  page: import("@playwright/test").Page,
  rowIndex: number,
) {
  const table = page.getByTestId("table-body");
  await expect(table).toBeVisible();

  const row = table.getByTestId(`table-row-${rowIndex}`);
  const menuButton = row.getByTestId("context-menu-button").first();
  await expect(menuButton).toBeVisible();
  await menuButton.click();
}

test.describe("Context Menu Sample Plugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withContextMenuPlugin"),
    );
  });

  // test.beforeEach(async ({ page }) => {
  //   await page.route(/\/plugins\/context-menu-sample\/assets\//, (route) => {
  //     route.fulfill({
  //       contentType: "image/svg+xml",
  //       body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="2" fill="#657077"/></svg>',
  //     });
  //   });

  //   await page.route(PLUGIN_REQUEST_URL, (route) => {
  //     route.fulfill({ contentType: "text/javascript", body: PLUGIN_JS });
  //   });
  // });

  test("visible in DOCX document context menu", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openContextMenu(page, 3); // row-3 is a .docx file

    const basicItem = page.getByTestId("context-menu-sample-basic").first();
    await expect(basicItem).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-context-menu",
      "plugin-context-menu_basic-docx.png",
    ]);
  });

  test("visible in image context menu", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openContextMenu(page, 2); // row-2 is a .jpg image

    const basicItem = page.getByTestId("context-menu-sample-basic").first();
    await expect(basicItem).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-context-menu",
      "plugin-context-menu_basic-image.png",
    ]);
  });

  test("visible for .docx file in more options", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openContextMenu(page, 3); // row-3 is a .docx

    // Expand "More options" — filtered item has no placement so it lives here.
    const moreOptions = page.getByTestId("option_info");
    await expect(moreOptions).toBeVisible();
    await moreOptions.hover();

    const filteredItem = page
      .getByTestId("context-menu-sample-filtered")
      .first();
    await expect(filteredItem).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-context-menu",
      "plugin-context-menu_filtered-docx.png",
    ]);

    await filteredItem.click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "info");
  });

  test("parent item is visible inside More options", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openContextMenu(page, 3); // any file works

    const submenuParent = page
      .getByTestId("context-menu-sample-submenu")
      .first();

    await expect(submenuParent).not.toBeVisible();

    // Expand "More options" first.
    const moreOptions = page.getByTestId("option_info");
    await expect(moreOptions).toBeVisible();
    await moreOptions.hover();

    await expect(submenuParent).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-context-menu",
      "plugin-context-menu_submenu-parent.png",
    ]);
  });

  test("hovering parent in more options, reveals children", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openContextMenu(page, 3);

    // Expand "More options" first.
    const moreOptions = page.getByTestId("option_info");
    await expect(moreOptions).toBeVisible();
    await moreOptions.hover();

    const pdfChild = page
      .getByTestId("context-menu-sample-submenu-pdf")
      .first();

    await expect(pdfChild).not.toBeVisible();

    // Then hover the submenu parent to open its children.
    const submenuParent = page
      .getByTestId("context-menu-sample-submenu")
      .first();
    await expect(submenuParent).toBeVisible();
    await submenuParent.hover();

    await expect(pdfChild).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-context-menu",
      "plugin-context-menu_submenu-expanded.png",
    ]);
  });

  test("Group action NOT visible in single-item context menu", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openContextMenu(page, 3);

    const groupItem = page.getByTestId("context-menu-sample-group").first();
    await expect(groupItem).not.toBeVisible();
  });

  test("Group action appears in context menu after selecting multiple items", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    for (const rowIndex of [0, 3]) {
      const row = table.getByTestId(`table-row-${rowIndex}`);
      const icon = row.getByTestId("room-icon-image");
      await icon.click();
    }

    const row = table.getByTestId(`table-row-3`);
    await row.click({ button: "right" });

    const groupItem = page.getByTestId("context-menu-sample-group").first();
    await expect(groupItem).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "plugins-context-menu",
      "plugin-context-menu_group-action.png",
    ]);

    await groupItem.click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
  });
});

