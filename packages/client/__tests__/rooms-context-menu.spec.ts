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

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  roomListHandler,
  TypeRoomList,
} from "@docspace/shared/__mocks__/handlers";
import { ShareAccessRights } from "@docspace/shared/enums";

test.describe("Context menu DocAdmin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
    );
  });

  test.describe("Room manager", () => {
    test("Custom without share", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.RoomManager,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-0");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-manager_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.RoomManager,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Public
      const publicRoomWithoutLink = table.getByTestId("table-row-1");
      const publicContextMenuButton = publicRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(publicContextMenuButton).toBeVisible();

      await publicContextMenuButton.click();

      const publicContextMenuMoveOptions = page.getByTestId("more-options");
      await publicContextMenuMoveOptions.hover();
      await expect(publicContextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-manager_public-room.png",
      ]);

      // Form room

      await page.goto(`${baseUrl}/rooms/shared/`);
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      const formContextMenuMoveOptions = page.getByTestId("more-options");
      await formContextMenuMoveOptions.hover();
      await expect(formContextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-manager_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto(`${baseUrl}/rooms/shared/`);
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-manager_custom-shared-room.png",
      ]);
    });

    test("Public third-party", async ({ page, mockRequest, baseUrl }) => {
      //await mockRequest.router([endpoints.cmRoomListDocAdminManager]);
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.RoomManager,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-4");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-manager_third-party-room.png",
      ]);
    });

    test("Collaboration", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.RoomManager,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-5");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-manager_collaboration-room.png",
      ]);
    });

    test("VDR", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.RoomManager,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-6");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-manager_vdr-room.png",
      ]);
    });
  });

  test.describe("Content creator", () => {
    test("Custom without share", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.Collaborator,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-0");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-content-creator_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.Collaborator,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Public
      const publicRoomWithoutLink = table.getByTestId("table-row-1");
      const publicContextMenuButton = publicRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(publicContextMenuButton).toBeVisible();

      await publicContextMenuButton.click();

      const publicContextMenuMoveOptions = page.getByTestId("more-options");
      await publicContextMenuMoveOptions.hover();
      await expect(publicContextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-content-creator_public-room.png",
      ]);

      // Form room

      await page.goto(`${baseUrl}/rooms/shared/`);
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      const formContextMenuMoveOptions = page.getByTestId("more-options");
      await formContextMenuMoveOptions.hover();
      await expect(formContextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-content-creator_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto(`${baseUrl}/rooms/shared/`);
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-content-creator_custom-room-shared.png",
      ]);
    });

    test("Public third-party", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.Collaborator,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-4");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-content-creator_public-third-party-room.png",
      ]);
    });

    test("Collaboration", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.Collaborator,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-5");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-content-creator_collaboration-room.png",
      ]);
    });

    // TODO: bugs
    // test("VDR", async ({ page, mockRequest }) => {
    //   await mockRequest.router([endpoints.cmRoomListContentCreator]);

    //   await page.goto("/rooms/shared/");

    //   const table = page.getByTestId("table-body");
    //   await expect(table).toBeVisible();

    //   const customRoomWithoutLink = table.getByTestId("table-row-6");
    //   const contextMenuButton = customRoomWithoutLink
    //     .getByTestId("context-menu-button")
    //     .first();
    //   await expect(contextMenuButton).toBeVisible();

    //   await contextMenuButton.click();

    //   const contextMenuMoveOptions = page.getByTestId("more-options");
    //   await contextMenuMoveOptions.hover();
    //   await expect(contextMenuMoveOptions).toBeVisible();

    //   await expectScreenshot(page,[
    //     "desktop",
    //     "context-menu",
    //     "doc-admin-content-creator_vdr-room.png",
    //   ]);
    // });
  });

  test.describe("Not in room", () => {
    test("Custom without share", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.None,
          inRoom: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-0");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.None,
          inRoom: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Public
      const publicRoomWithoutLink = table.getByTestId("table-row-1");
      const publicContextMenuButton = publicRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(publicContextMenuButton).toBeVisible();

      await publicContextMenuButton.click();

      const publicContextMenuMoveOptions = page.getByTestId("more-options");
      await publicContextMenuMoveOptions.hover();
      await expect(publicContextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_public-room.png",
      ]);

      // Form room

      await page.goto(`${baseUrl}/rooms/shared/`);
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      const formContextMenuMoveOptions = page.getByTestId("more-options");
      await formContextMenuMoveOptions.hover();
      await expect(formContextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto(`${baseUrl}/rooms/shared/`);
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_custom-room-shared.png",
      ]);
    });

    test("Public third-party", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.None,
          inRoom: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-4");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_public-third-party-room.png",
      ]);
    });

    test("Collaboration", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.None,
          inRoom: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-5");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_collaboration-room.png",
      ]);
    });

    test("VDR", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.None,
          inRoom: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-6");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_vdr-room.png",
      ]);
    });
  });
});

test.describe("Context menu Room admin", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, "roomAdmin"),
    );
  });

  test.describe("Room owner", () => {
    test("Custom without share", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.None,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-0");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-owner_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.None,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Public
      const publicRoomWithoutLink = table.getByTestId("table-row-1");
      const publicContextMenuButton = publicRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(publicContextMenuButton).toBeVisible();

      await publicContextMenuButton.click();

      const publicContextMenuMoveOptions = page.getByTestId("more-options");
      await publicContextMenuMoveOptions.hover();
      await expect(publicContextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-owner_public-room.png",
      ]);

      // Form room

      await page.goto(`${baseUrl}/rooms/shared/`);
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      const formContextMenuMoveOptions = page.getByTestId("more-options");
      await formContextMenuMoveOptions.hover();
      await expect(formContextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-owner_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto(`${baseUrl}/rooms/shared/`);
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-owner_custom-shared-room.png",
      ]);
    });

    test("Public third-party", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.None,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-4");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-owner_third-party-room.png",
      ]);
    });

    test("Collaboration", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.None,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-5");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-owner_collaboration-room.png",
      ]);
    });

    test("VDR", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.None,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-6");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-owner_vdr-room.png",
      ]);
    });
  });

  test.describe("Room manager", () => {
    test("Custom without share", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.RoomManager,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-0");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-manager_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.RoomManager,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Public
      const publicRoomWithoutLink = table.getByTestId("table-row-1");
      const publicContextMenuButton = publicRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(publicContextMenuButton).toBeVisible();

      await publicContextMenuButton.click();

      const publicContextMenuMoveOptions = page.getByTestId("more-options");
      await publicContextMenuMoveOptions.hover();
      await expect(publicContextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-manager_public-room.png",
      ]);

      // Form room

      await page.goto(`${baseUrl}/rooms/shared/`);
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      const formContextMenuMoveOptions = page.getByTestId("more-options");
      await formContextMenuMoveOptions.hover();
      await expect(formContextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-manager_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto(`${baseUrl}/rooms/shared/`);
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-manager_custom-shared-room.png",
      ]);
    });

    test("Public third-party", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.RoomManager,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-4");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-manager_third-party-room.png",
      ]);
    });

    test("Collaboration", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.RoomManager,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-5");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-manager_collaboration-room.png",
      ]);
    });

    test("VDR", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.RoomManager,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-6");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-room-manager_vdr-room.png",
      ]);
    });
  });

  test.describe("Content creator", () => {
    test("Custom without share", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.Collaborator,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-0");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-content-creator_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.Collaborator,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Public
      const publicRoomWithoutLink = table.getByTestId("table-row-1");
      const publicContextMenuButton = publicRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(publicContextMenuButton).toBeVisible();

      await publicContextMenuButton.click();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-content-creator_public-room.png",
      ]);

      // Form room

      await page.goto(`${baseUrl}/rooms/shared/`);
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-content-creator_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto(`${baseUrl}/rooms/shared/`);
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-content-creator_custom-shared-room.png",
      ]);
    });

    test("Public third-party", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.Collaborator,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-4");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-content-creator_third-party-room.png",
      ]);
    });

    test("Collaboration", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.Collaborator,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-5");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-content-creator_collaboration-room.png",
      ]);
    });

    test("VDR", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
          access: ShareAccessRights.Collaborator,
          isDocAdmin: false,
        }),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-6");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expectScreenshot(page,[
        "desktop",
        "context-menu",
        "room-admin-content-creator_vdr-room.png",
      ]);
    });
  });
});
