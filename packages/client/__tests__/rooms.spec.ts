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

test.describe("Rooms", () => {
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

  test("should handle empty rooms list", async ({ page, mockRequest }) => {
    await mockRequest.router([
      endpoints.emptyRoomList,
    ]);

    await page.goto("/rooms/shared/filter");

    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "rooms",
      "rooms-empty.png",
    ]);
  });

  test("should create custom room", async ({ page, mockRequest }) => {
    await mockRequest.router([
      endpoints.emptyRoomList,
      endpoints.emptyTags,
      endpoints.createRoom,
      endpoints.newRoom,
      endpoints.roomsLink,
      endpoints.roomShareFirst,
      endpoints.roomShareSecond,
    ]);

    await page.goto("/rooms/shared/filter");

    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();

    const createButton = page.getByTestId("create_new_room_button");
    await expect(createButton).toBeVisible();
    await createButton.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "rooms",
      "rooms-create-panel.png",
    ]);

    const customRoom = page.getByTestId("room-type-list-item").nth(4);
    await expect(customRoom).toBeVisible();
    await customRoom.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "rooms",
      "rooms-create-custom-room-panel.png",
    ]);

    const input = page.getByTestId("create_edit_room_input");
    await expect(input).toBeVisible();
    await input.fill("Custom room");

    const saveRoomButton = page.getByTestId("create_room_dialog_save");
    await expect(saveRoomButton).toBeVisible();
    await saveRoomButton.click();

    const emptyViewInRoom = page.getByTestId("empty-view");
    await expect(emptyViewInRoom).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "rooms",
      "rooms-new-custom-room.png",
    ]);
  });

  test("should create public room", async ({ page, mockRequest }) => {
    await mockRequest.router([
      endpoints.emptyRoomList,
      endpoints.emptyTags,
      endpoints.thirdPartyProviders,
      endpoints.createPublicRoom,
      endpoints.newPublicRoom,
      endpoints.publicRoomLink,
      endpoints.roomShareFirst,
      endpoints.publicRoomShareSecond,
      endpoints.publicRoomFolderInfo,
      endpoints.publicRoomFiles,
    ]);

    await page.goto("/rooms/shared/filter");

    const emptyView = page.getByTestId("empty-view");
    await expect(emptyView).toBeVisible();

    const createButton = page.getByTestId("create_new_room_button");
    await expect(createButton).toBeVisible();
    await createButton.click();

    const publicRoom = page.getByTestId("room-type-list-item").first();
    await expect(publicRoom).toBeVisible();
    await publicRoom.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "rooms",
      "rooms-create-public-room-panel.png",
    ]);

    const input = page.getByTestId("create_edit_room_input");
    await expect(input).toBeVisible();
    await input.fill("Public room");

    const saveRoomButton = page.getByTestId("create_room_dialog_save");
    await expect(saveRoomButton).toBeVisible();
    await saveRoomButton.click();

    const emptyViewInRoom = page.getByTestId("empty-view");
    await expect(emptyViewInRoom).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "rooms",
      "rooms-new-public-room.png",
    ]);
  });
});
