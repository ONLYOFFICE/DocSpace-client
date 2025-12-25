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

test.describe("Context menu DocAdmin", () => {
  test.beforeEach(async ({ mockRequest }) => {
    await mockRequest.router([
      endpoints.aiConfig,
      endpoints.settingsWithQuery,
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

  test.describe("Room manager", () => {
    test("Custom without share", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListDocAdminManager]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-manager_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListDocAdminManager]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-manager_public-room.png",
      ]);

      // Form room

      await page.goto("/rooms/shared/");
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      const formContextMenuMoveOptions = page.getByTestId("more-options");
      await formContextMenuMoveOptions.hover();
      await expect(formContextMenuMoveOptions).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-manager_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto("/rooms/shared/");
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-manager_custom-shared-room.png",
      ]);
    });

    test("Public third-party", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListDocAdminManager]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-manager_third-party-room.png",
      ]);
    });

    test("Collaboration", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListDocAdminManager]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-manager_collaboration-room.png",
      ]);
    });

    test("VDR", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListDocAdminManager]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-manager_vdr-room.png",
      ]);
    });
  });

  test.describe("Content creator", () => {
    test("Custom without share", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListContentCreator]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-content-creator_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListContentCreator]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-content-creator_public-room.png",
      ]);

      // Form room

      await page.goto("/rooms/shared/");
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      const formContextMenuMoveOptions = page.getByTestId("more-options");
      await formContextMenuMoveOptions.hover();
      await expect(formContextMenuMoveOptions).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-content-creator_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto("/rooms/shared/");
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-content-creator_custom-room-shared.png",
      ]);
    });

    // TODO: bugs change room owner
    // test("Public third-party", async ({ page, mockRequest }) => {
    //   await mockRequest.router([endpoints.cmRoomListContentCreator]);

    //   await page.goto("/rooms/shared/");

    //   const table = page.getByTestId("table-body");
    //   await expect(table).toBeVisible();

    //   const customRoomWithoutLink = table.getByTestId("table-row-4");
    //   const contextMenuButton = customRoomWithoutLink
    //     .getByTestId("context-menu-button")
    //     .first();
    //   await expect(contextMenuButton).toBeVisible();

    //   await contextMenuButton.click();

    //   await expect(page).toHaveScreenshot([
    //     "desktop",
    //     "context-menu",
    //     "doc-admin-content-creator_public-third-party-room.png",
    //   ]);
    // });

    test("Collaboration", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListContentCreator]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
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

    //   await expect(page).toHaveScreenshot([
    //     "desktop",
    //     "context-menu",
    //     "doc-admin-content-creator_vdr-room.png",
    //   ]);
    // });
  });

  test.describe("Not in room", () => {
    test("Custom without share", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListNotInRoom]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListNotInRoom]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_public-room.png",
      ]);

      // Form room

      await page.goto("/rooms/shared/");
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      const formContextMenuMoveOptions = page.getByTestId("more-options");
      await formContextMenuMoveOptions.hover();
      await expect(formContextMenuMoveOptions).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto("/rooms/shared/");
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_custom-room-shared.png",
      ]);
    });

    // TODO: bug change room owner
    // test("Public third-party", async ({ page, mockRequest }) => {
    //   await mockRequest.router([endpoints.cmRoomListNotInRoom]);

    //   await page.goto("/rooms/shared/");

    //   const table = page.getByTestId("table-body");
    //   await expect(table).toBeVisible();

    //   const customRoomWithoutLink = table.getByTestId("table-row-4");
    //   const contextMenuButton = customRoomWithoutLink
    //     .getByTestId("context-menu-button")
    //     .first();
    //   await expect(contextMenuButton).toBeVisible();

    //   await contextMenuButton.click();

    //   await expect(page).toHaveScreenshot([
    //     "desktop",
    //     "context-menu",
    //     "doc-admin-not-in-room_public-third-party-room.png",
    //   ]);
    // });

    test("Collaboration", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListNotInRoom]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_collaboration-room.png",
      ]);
    });

    test("VDR", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListNotInRoom]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "doc-admin-not-in-room_vdr-room.png",
      ]);
    });
  });
});

test.describe("Context menu Room admin", () => {
  test.beforeEach(async ({ mockRequest }) => {
    await mockRequest.router([
      endpoints.aiConfig,
      endpoints.settingsWithQuery,
      endpoints.colorTheme,
      endpoints.build,
      endpoints.capabilities,
      endpoints.selfRoomAdminOnly,
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

  test.describe("Room owner", () => {
    test("Custom without share", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomOwner]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-owner_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomOwner]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-owner_public-room.png",
      ]);

      // Form room

      await page.goto("/rooms/shared/");
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      const formContextMenuMoveOptions = page.getByTestId("more-options");
      await formContextMenuMoveOptions.hover();
      await expect(formContextMenuMoveOptions).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-owner_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto("/rooms/shared/");
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-owner_custom-shared-room.png",
      ]);
    });

    test("Public third-party", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomOwner]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-owner_third-party-room.png",
      ]);
    });

    test("Collaboration", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomOwner]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-owner_collaboration-room.png",
      ]);
    });

    test("VDR", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomOwner]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-owner_vdr-room.png",
      ]);
    });
  });

  test.describe("Room manager", () => {
    test("Custom without share", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomAdminManager]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-manager_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomAdminManager]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-manager_public-room.png",
      ]);

      // Form room

      await page.goto("/rooms/shared/");
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      const formContextMenuMoveOptions = page.getByTestId("more-options");
      await formContextMenuMoveOptions.hover();
      await expect(formContextMenuMoveOptions).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-manager_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto("/rooms/shared/");
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      const contextMenuMoveOptions = page.getByTestId("more-options");
      await contextMenuMoveOptions.hover();
      await expect(contextMenuMoveOptions).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-manager_custom-shared-room.png",
      ]);
    });

    test("Public third-party", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomAdminManager]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-manager_third-party-room.png",
      ]);
    });

    test("Collaboration", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomAdminManager]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-manager_collaboration-room.png",
      ]);
    });

    test("VDR", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomAdminManager]);

      await page.goto("/rooms/shared/");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-room-manager_vdr-room.png",
      ]);
    });
  });

  test.describe("Content creator", () => {
    test("Custom without share", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomAdminCreator]);

      await page.goto("/rooms/shared/");

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-0");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-content-creator_custom-room.png",
      ]);
    });

    test("Public/Form/Custom(Public)", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomAdminCreator]);

      await page.goto("/rooms/shared/");

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Public
      const publicRoomWithoutLink = table.getByTestId("table-row-1");
      const publicContextMenuButton = publicRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(publicContextMenuButton).toBeVisible();

      await publicContextMenuButton.click();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-content-creator_public-room.png",
      ]);

      // Form room

      await page.goto("/rooms/shared/");
      const formRoomWithoutLink = table.getByTestId("table-row-2");
      const formContextMenuButton = formRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(formContextMenuButton).toBeVisible();

      await formContextMenuButton.click();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-content-creator_form-room.png",
      ]);

      // Custom room (shared)

      await page.goto("/rooms/shared/");
      const customRoomWithoutLink = table.getByTestId("table-row-3");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-content-creator_custom-shared-room.png",
      ]);
    });

    test("Public third-party", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomAdminCreator]);

      await page.goto("/rooms/shared/");

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-4");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-content-creator_third-party-room.png",
      ]);
    });

    test("Collaboration", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomAdminCreator]);

      await page.goto("/rooms/shared/");

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-5");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-content-creator_collaboration-room.png",
      ]);
    });

    test("VDR", async ({ page, mockRequest }) => {
      await mockRequest.router([endpoints.cmRoomListRoomAdminCreator]);

      await page.goto("/rooms/shared/");

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const customRoomWithoutLink = table.getByTestId("table-row-6");
      const contextMenuButton = customRoomWithoutLink
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();

      await contextMenuButton.click();

      await expect(page).toHaveScreenshot([
        "desktop",
        "context-menu",
        "room-admin-content-creator_vdr-room.png",
      ]);
    });
  });
});
