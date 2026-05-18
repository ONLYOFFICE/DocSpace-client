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
