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
  privacyroomAccessHandlers,
  privateRoomListHandler,
  roomMembersHandlers,
  roomMembersSearchHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  type RoomMembersHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

const ROOM_ID = 9300;
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const INVITEE_ID = "11111111-2222-3333-4444-555555555555";
const INVITEE_EMAIL = "alice@example.com";
const INVITEE_NAME = "Alice Invitee";

test.describe("Private room — invite member", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("sends PUT /rooms/{id}/share when inviting a user from the room list", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    await bootstrapEncryption(page, mockRequest, baseUrl);

    const membersHandle: { current: RoomMembersHandlerHandle | null } = {
      current: null,
    };

    mockRequest.use(
      privateRoomListHandler(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        title: "Private Test Room",
      }),
      ...roomMembersHandlers(TEST_PORT, ROOM_ID, { handle: membersHandle }),
      ...privacyroomAccessHandlers(TEST_PORT, {
        roomKeys: { [String(ROOM_ID)]: [] },
      }),
      roomMembersSearchHandler(TEST_PORT, ROOM_ID, {
        members: [
          {
            id: INVITEE_ID,
            displayName: INVITEE_NAME,
            email: INVITEE_EMAIL,
          },
        ],
      }),
    );

    await page.goto(`${baseUrl}/rooms/shared/`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible({ timeout: 15000 });

    const folderItem = page.getByText("Private Test Room").first();
    await expect(folderItem).toBeVisible({ timeout: 10000 });

    const row = folderItem
      .locator("xpath=ancestor::*[@data-testid='table-row']")
      .first();
    const contextMenuButton = row.getByTestId("context-menu-button").first();
    await expect(contextMenuButton).toBeVisible({ timeout: 5000 });
    await contextMenuButton.click();

    const inviteOption = page.getByTestId("option_invite-users-to-room");
    await expect(inviteOption).toBeVisible({ timeout: 5000 });
    await inviteOption.click();

    const peopleSelector = page.getByTestId("invite_panel_people_selector");
    await expect(peopleSelector).toBeVisible({ timeout: 10000 });

    const searchInput = peopleSelector
      .locator('input[type="text"], input[type="search"]')
      .first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill(INVITEE_NAME);

    const inviteeRow = peopleSelector
      .getByText(INVITEE_NAME, { exact: false })
      .first();
    await expect(inviteeRow).toBeVisible({ timeout: 5000 });
    await inviteeRow.click();

    const acceptButton = peopleSelector
      .getByRole("button")
      .filter({ hasText: /Add|Invite|Accept|Save/i })
      .first();
    await expect(acceptButton).toBeEnabled({ timeout: 5000 });
    await acceptButton.click();

    const sendButton = page.getByTestId("invite_panel_send_button");
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    await expect(sendButton).toBeEnabled({ timeout: 5000 });

    const putRequest = page.waitForRequest(
      (req) =>
        req.method() === "PUT" &&
        new RegExp(`/files/rooms/${ROOM_ID}/share$`).test(req.url()),
      { timeout: 10000 },
    );

    await sendButton.click();

    const put = await putRequest;
    const body = put.postDataJSON() as {
      invitations: Array<{ id: string; access: number }>;
      notify: boolean;
    };

    expect(body.invitations).toHaveLength(1);
    expect(body.invitations[0].id).toBe(INVITEE_ID);
    expect(typeof body.invitations[0].access).toBe("number");
    expect(body.notify).toBe(true);

    await expect
      .poll(() => membersHandle.current?.getMembers().length ?? 0, {
        timeout: 5000,
      })
      .toBe(1);

    expect(membersHandle.current!.getMembers()[0].id).toBe(INVITEE_ID);
  });
});
