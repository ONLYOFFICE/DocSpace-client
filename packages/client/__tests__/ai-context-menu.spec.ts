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
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  aiAgentsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
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

    await expectScreenshot(page,[
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

    await expectScreenshot(page,[
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

    await expectScreenshot(page,[
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

    await expectScreenshot(page,[
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

    await expectScreenshot(page,[
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

    await expectScreenshot(page,[
      "desktop",
      "context-menu",
      "ai-room_creator.png",
    ]);
  });
});
