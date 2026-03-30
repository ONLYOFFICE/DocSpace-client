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

import {
  filesSettingsHandler,
  roomListHandler,
  rootHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

import {
  createInvitationLink,
  getEmptyInvitationLink,
  getInvitationLink,
  deleteInvitationLink,
  updateInvitationLink,
} from "@docspace/shared/__mocks__/handlers/files/roomInvite";

test.describe("Room invite", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Create invitation link", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    await page.goto(`${baseUrl}/rooms/shared/`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-4");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const inviteOption = page.getByTestId("option_invite-users-to-room");
    await expect(inviteOption).toBeVisible();

    mockRequest.use(getEmptyInvitationLink(TEST_PORT));
    await inviteOption.click();

    const inviteDialog = page.getByTestId("modal-dialog");
    await expect(inviteDialog).toBeVisible();

    await page.waitForTimeout(300); // invite panel min loader timeout
    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite_empty-link.png",
    ]);

    const toggle = page.getByTestId("toggle-button-container");
    await expect(toggle).toBeVisible();

    mockRequest.use(createInvitationLink(TEST_PORT));
    await toggle.click();

    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite_created-link.png",
    ]);
  });

  test("Delete invitation link", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    await page.goto(`${baseUrl}/rooms/shared/`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-4");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const inviteOption = page.getByTestId("option_invite-users-to-room");
    await expect(inviteOption).toBeVisible();

    mockRequest.use(getInvitationLink(TEST_PORT));
    await inviteOption.click();

    const inviteDialog = page.getByTestId("modal-dialog");
    await expect(inviteDialog).toBeVisible();

    await page.waitForTimeout(300); // invite panel min loader timeout
    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite_created-link.png",
    ]);

    const toggle = page.getByTestId("toggle-button-container");
    await expect(toggle).toBeVisible();

    mockRequest.use(deleteInvitationLink(TEST_PORT));
    await toggle.click();
    await page.mouse.move(0, 0);

    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite_empty-link.png",
    ]);
  });

  test("Update invitation link", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    await page.goto(`${baseUrl}/rooms/shared/`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-4");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const inviteOption = page.getByTestId("option_invite-users-to-room");
    await expect(inviteOption).toBeVisible();

    mockRequest.use(getInvitationLink(TEST_PORT));
    await inviteOption.click();

    const inviteDialog = page.getByTestId("modal-dialog");
    await expect(inviteDialog).toBeVisible();

    await page.waitForTimeout(300); // invite panel min loader timeout

    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite_created-link.png",
    ]);

    const settingsIcon = page.getByTestId("link-settings_icon");
    await expect(settingsIcon).toBeVisible();
    await settingsIcon.click();

    const settingsDialog = page.getByTestId("modal-dialog").last();
    await expect(settingsDialog).toBeVisible();
    await expect(settingsDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite-settings-base.png",
    ]);

    const limitToggle = page.getByTestId("toggle-button-container");
    await expect(limitToggle).toBeVisible();
    await limitToggle.click();

    const maxNumberInput = page.getByTestId("link-settings_users-limit");
    await expect(maxNumberInput).toBeVisible();
    await maxNumberInput.fill("30");

    const linkRolesDropdown = page.getByTestId("link-roles-dropdown");
    await expect(linkRolesDropdown).toBeVisible();
    await linkRolesDropdown.click();

    const linkRolesDropdownItem = page.getByTestId("drop-down-item").nth(6);
    await expect(linkRolesDropdownItem).toBeVisible();
    await linkRolesDropdownItem.click();

    await expect(settingsDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite-settings-update.png",
    ]);

    const saveButton = page.getByTestId("link-settings_modal_save_button");
    await expect(maxNumberInput).toBeVisible();

    mockRequest.use(updateInvitationLink(TEST_PORT));
    saveButton.click();

    await expect(settingsDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite-settings-apply.png",
    ]);
  });

  test("Invitation link expired", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    await page.goto(`${baseUrl}/rooms/shared/`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-4");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const inviteOption = page.getByTestId("option_invite-users-to-room");
    await expect(inviteOption).toBeVisible();

    mockRequest.use(getInvitationLink(TEST_PORT, true));
    await inviteOption.click();

    const inviteDialog = page.getByTestId("modal-dialog");
    await expect(inviteDialog).toBeVisible();

    await page.waitForTimeout(300); // invite panel min loader timeout
    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite_expired.png",
    ]);

    const settingsIcon = page.getByTestId("link-settings_icon");
    await expect(settingsIcon).toBeVisible();
    await settingsIcon.click();

    const settingsDialog = page.getByTestId("modal-dialog").last();
    await expect(settingsDialog).toBeVisible();
    await expect(settingsDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite-settings_expired.png",
    ]);
  });

  test("Invitation link users limit", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    await page.goto(`${baseUrl}/rooms/shared/`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    const folderItem = table.getByTestId("table-row-4");
    const contextMenuButton = folderItem
      .getByTestId("context-menu-button")
      .first();
    await expect(contextMenuButton).toBeVisible();

    await contextMenuButton.click();

    const inviteOption = page.getByTestId("option_invite-users-to-room");
    await expect(inviteOption).toBeVisible();

    mockRequest.use(getInvitationLink(TEST_PORT, false, true));
    await inviteOption.click();

    const inviteDialog = page.getByTestId("modal-dialog");
    await expect(inviteDialog).toBeVisible();

    await page.waitForTimeout(300); // invite panel min loader timeout
    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite_limit.png",
    ]);

    const settingsDialog = page.getByTestId("modal-dialog").last();
    await expect(settingsDialog).toBeVisible();

    const settingsIcon = page.getByTestId("link-settings_icon");
    await expect(settingsIcon).toBeVisible();
    await settingsIcon.click();

    await expect(settingsDialog).toHaveScreenshot([
      "desktop",
      "room-invite",
      "invite-settings_limit.png",
    ]);
  });
});
