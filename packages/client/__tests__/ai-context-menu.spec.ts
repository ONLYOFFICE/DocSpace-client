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
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  aiAgentsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { ShareAccessRights } from "@docspace/shared/enums";

test.describe("DocAdmin context menu", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT),
    );
  });

  test("Doc admin agent manager", async ({ page, mockRequest }) => {
    mockRequest.use(
      aiAgentsHandler(TEST_PORT, {
        aiAccess: ShareAccessRights.RoomManager,
        isDocAdmin: true,
      }),
    );

    await page.goto("/ai-agents/filter?folder=224866");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const aiMenu = table.getByTestId("table-row-0");
    const contextMenuButton = aiMenu.getByTestId("context-menu-button").first();
    await expect(contextMenuButton).toBeVisible();
    await contextMenuButton.click();

    const contextMenuMoreOptions = page.getByTestId("more-options");
    await contextMenuMoreOptions.hover();
    await expect(contextMenuMoreOptions).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "ai-room_doc-admin-manager.png",
    ]);
  });

  test("Doc admin content creator", async ({ page, mockRequest }) => {
    mockRequest.use(
      aiAgentsHandler(TEST_PORT, {
        aiAccess: ShareAccessRights.Collaborator,
        isDocAdmin: true,
      }),
    );

    await page.goto("/ai-agents/filter?folder=224866");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const aiMenu = table.getByTestId("table-row-0");
    const contextMenuButton = aiMenu.getByTestId("context-menu-button").first();
    await expect(contextMenuButton).toBeVisible();
    await contextMenuButton.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "ai-room_doc-admin-creator.png",
    ]);
  });

  test("Doc admin out of room", async ({ page, mockRequest }) => {
    mockRequest.use(
      aiAgentsHandler(TEST_PORT, {
        aiAccess: ShareAccessRights.None,
        inRoom: false,
        isDocAdmin: true,
      }),
    );

    await page.goto("/ai-agents/filter?folder=224866");

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const aiMenu = table.getByTestId("table-row-0");
    const contextMenuButton = aiMenu.getByTestId("context-menu-button").first();
    await expect(contextMenuButton).toBeVisible();
    await contextMenuButton.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "ai-room_doc-admin-out-of-room.png",
    ]);
  });
});

test.describe("RoomAdmin context menu", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, "roomAdmin"),
    );
  });

  test("Agent owner", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      aiAgentsHandler(TEST_PORT, {
        aiAccess: ShareAccessRights.None,
      }),
    );

    await page.goto(`${baseUrl}/ai-agents/filter?folder=224866`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const aiMenu = table.getByTestId("table-row-0");
    const contextMenuButton = aiMenu.getByTestId("context-menu-button").first();
    await expect(contextMenuButton).toBeVisible();
    await contextMenuButton.click();

    const contextMenuMoreOptions = page.getByTestId("more-options");
    await contextMenuMoreOptions.hover();
    await expect(contextMenuMoreOptions).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "ai-room_agent-owner.png",
    ]);
  });

  test("Agent manager", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      aiAgentsHandler(TEST_PORT, {
        aiAccess: ShareAccessRights.RoomManager,
      }),
    );

    await page.goto(`${baseUrl}/ai-agents/filter?folder=224866`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const aiMenu = table.getByTestId("table-row-0");
    const contextMenuButton = aiMenu.getByTestId("context-menu-button").first();
    await expect(contextMenuButton).toBeVisible();
    await contextMenuButton.click();

    const contextMenuMoreOptions = page.getByTestId("more-options");
    await contextMenuMoreOptions.hover();
    await expect(contextMenuMoreOptions).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "ai-room_agent-manager.png",
    ]);
  });

  test("Content creator", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      aiAgentsHandler(TEST_PORT, {
        aiAccess: ShareAccessRights.Collaborator,
      }),
    );

    await page.goto(`${baseUrl}/ai-agents/filter?folder=224866`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const aiMenu = table.getByTestId("table-row-0");
    const contextMenuButton = aiMenu.getByTestId("context-menu-button").first();
    await expect(contextMenuButton).toBeVisible();
    await contextMenuButton.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "context-menu",
      "ai-room_creator.png",
    ]);
  });
});
