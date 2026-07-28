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

import {
  settingsHandler,
  defaultTemplatesHandler,
  defaultTemplatesSetHandler,
  defaultTemplatesResetHandler,
  roomListHandler,
  TypeRoomList,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

test.describe("Default templates", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(settingsHandler(TEST_PORT, TypeSettings.Authenticated));
  });

  test("should navigate to default templates page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(defaultTemplatesHandler(TEST_PORT));
    await page.goto(
      `${baseUrl}/portal-settings/customization/default-templates`,
    );

    const container = page.getByTestId("default-templates");
    await expect(container).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "default-templates",
      "default-templates.png",
    ]);
  });

  test("should select default template", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      defaultTemplatesHandler(TEST_PORT),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      defaultTemplatesSetHandler(TEST_PORT, "customized"),
    );
    await page.goto(
      `${baseUrl}/portal-settings/customization/default-templates`,
    );

    const container = page.getByTestId("default-templates");
    await expect(container).toBeVisible();

    const row = page.getByTestId("default-template-row-0");
    await expect(row).toBeVisible();

    const contextMenuBtn = row.getByTestId("context-menu-button");
    await contextMenuBtn.click();

    const selectOption = page.getByTestId("upload-from-docspace_item");
    await expect(selectOption).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "default-templates",
      "default-templates-default-context-menu.png",
    ]);

    await selectOption.click();

    const selector = page.getByTestId("aside").first();
    await expect(selector).toBeVisible();

    const roomsRow = selector.getByText("Rooms").first();
    await expect(roomsRow).toBeVisible();
    await roomsRow.click();

    const roomRow = selector.getByText("New room").first();
    await expect(roomRow).toBeVisible();
    await roomRow.click();

    const documentRow = selector
      .getByText("ONLYOFFICE Sample Document")
      .first();
    await expect(documentRow).toBeVisible();
    await documentRow.click();

    const selectBtn = selector.getByTestId("selector_submit_button").first();
    await expect(selectBtn).toBeVisible();
    await selectBtn.click();

    const badge = row.getByTestId("badge-text");
    await expect(badge).toHaveText("Customized");

    await expectScreenshot(page, [
      "desktop",
      "default-templates",
      "default-templates-customized.png",
    ]);
  });

  test("should navigate to default templates page with customized template", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(defaultTemplatesHandler(TEST_PORT, "customized"));
    await page.goto(
      `${baseUrl}/portal-settings/customization/default-templates`,
    );

    const container = page.getByTestId("default-templates");
    await expect(container).toBeVisible();

    const row = page.getByTestId("default-template-row-0");
    await expect(row).toBeVisible();

    const contextMenuBtn = row.getByTestId("context-menu-button");
    await contextMenuBtn.click();

    const resetOption = page.getByTestId("reset_item");
    await expect(resetOption).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "default-templates",
      "default-templates-customized-context-menu.png",
    ]);

    await resetOption.click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "default-templates",
      "default-templates-reset-dialog.png",
    ]);

    const resetBtn = page.getByTestId("reset-button").first();
    await expect(resetBtn).toBeVisible();

    mockRequest.use(defaultTemplatesResetHandler(TEST_PORT, "default"));

    await resetBtn.click();

    const badge = row.getByTestId("badge-text");
    await expect(badge).toHaveText("Default");
  });

  test("should navigate to default templates page with template width long title", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(defaultTemplatesHandler(TEST_PORT, "long"));
    await page.goto(
      `${baseUrl}/portal-settings/customization/default-templates`,
    );

    const container = page.getByTestId("default-templates");
    await expect(container).toBeVisible();

    const row = page.getByTestId("default-template-row-0");
    await expect(row).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "default-templates",
      "default-templates-long-title.png",
    ]);
  });
});
