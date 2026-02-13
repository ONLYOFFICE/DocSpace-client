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
  settingsHandler,
  defaultTemplatesHandler,
  defaultTemplatesSetHandler,
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

    await expectScreenshot(page,[
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

    await expectScreenshot(page,[
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

    await expectScreenshot(page,[
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

    await expectScreenshot(page,[
      "desktop",
      "default-templates",
      "default-templates-customized-context-menu.png",
    ]);

    await resetOption.click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "default-templates",
      "default-templates-reset-dialog.png",
    ]);

    const resetBtn = page.getByTestId("reset-button").first();
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    mockRequest.use(defaultTemplatesSetHandler(TEST_PORT));

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

    await expectScreenshot(page,[
      "desktop",
      "default-templates",
      "default-templates-long-title.png",
    ]);
  });
});
