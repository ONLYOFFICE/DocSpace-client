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
  capabilitiesHandler,
  filesSettingsHandler,
  privateRoomListHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

const ROOM_ID = 9300;
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

test.describe("Private room — invite entry point", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("context menu exposes the Invite contacts entry for a private room", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    await bootstrapEncryption(page, mockRequest, baseUrl);

    mockRequest.use(
      privateRoomListHandler(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        title: "Private Test Room",
      }),
    );

    await page.goto(`${baseUrl}/rooms/shared/`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible({ timeout: 15000 });

    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 10000 });

    const contextMenuButton = row.getByTestId("context-menu-button").first();
    await expect(contextMenuButton).toBeVisible({ timeout: 5000 });
    await contextMenuButton.click();

    const inviteOption = page.getByTestId("option_invite-users-to-room");
    await expect(inviteOption).toBeVisible({ timeout: 5000 });
  });

  test("opens InvitePanel configured for private room (Choose-from-list shown, Send disabled)", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    await bootstrapEncryption(page, mockRequest, baseUrl);

    mockRequest.use(
      privateRoomListHandler(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        title: "Private Test Room",
      }),
    );

    await page.goto(`${baseUrl}/rooms/shared/`);

    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 15000 });

    const contextMenuButton = row.getByTestId("context-menu-button").first();
    await contextMenuButton.click();

    const inviteOption = page.getByTestId("option_invite-users-to-room");
    await expect(inviteOption).toBeVisible({ timeout: 5000 });
    await inviteOption.click();

    const chooseFromListLink = page.getByTestId(
      "invite_panel_choose_from_list_link",
    );
    await expect(chooseFromListLink).toBeVisible({ timeout: 10000 });

    const sendButton = page.getByTestId("invite_panel_send_button");
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    await expect(sendButton).toBeDisabled();
  });
});
