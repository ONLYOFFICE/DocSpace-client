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

    const inviteDialog = page.getByTestId("modal-dialog").filter({ hasNotText: "Synchronization with database" });
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

    const inviteDialog = page.getByTestId("modal-dialog").filter({ hasNotText: "Synchronization with database" });
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

    const inviteDialog = page.getByTestId("modal-dialog").filter({ hasNotText: "Synchronization with database" });
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

    const inviteDialog = page.getByTestId("modal-dialog").filter({ hasNotText: "Synchronization with database" });
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

    const inviteDialog = page.getByTestId("modal-dialog").filter({ hasNotText: "Synchronization with database" });
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
