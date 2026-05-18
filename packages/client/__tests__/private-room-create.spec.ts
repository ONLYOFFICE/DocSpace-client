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
  createPrivateRoomHandler,
  filesSettingsHandler,
  privacyroomKeysHandlers,
  roomListHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
  type CreateRoomHandlerHandle,
  type PrivacyroomHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

const ROOMS_TYPE_CUSTOM_ROOM = 5;
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

const seedUserKey = {
  id: "1",
  userId: TEST_USER_ID,
  publicKey: "BASE64_PUBLIC_KEY_FIXTURE_FOR_TEST",
  privateKeyEnc: "BASE64_PRIVATE_KEY_ENC_FIXTURE_FOR_TEST",
  date: "2026-01-01T00:00:00.000Z",
};

test.describe("Private room — create", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("submits POST /files/rooms with private:true when user has a key", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const keysHandle: { current: PrivacyroomHandlerHandle | null } = {
      current: null,
    };
    const roomHandle: { current: CreateRoomHandlerHandle | null } = {
      current: null,
    };

    mockRequest.use(
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [seedUserKey],
        handle: keysHandle,
        userId: TEST_USER_ID,
      }),
      createPrivateRoomHandler(TEST_PORT, { handle: roomHandle }),
    );

    await page.goto(`${baseUrl}/rooms/shared/`);

    const newRoomButton = page.getByTestId("create_new_room_button");
    await expect(newRoomButton).toBeVisible({ timeout: 15000 });
    await newRoomButton.click();

    const privateTile = page
      .getByTestId("room-type-list-item")
      .filter({ hasText: "Private Room" });
    await expect(privateTile).toBeVisible({ timeout: 5000 });
    await privateTile.click();

    const titleInput = page.getByTestId("create_edit_room_input");
    await expect(titleInput).toBeVisible({ timeout: 5000 });
    await titleInput.fill("Test private room");

    const postPromise = page.waitForRequest(
      (req) =>
        req.method() === "POST" && req.url().endsWith("/files/rooms"),
    );
    await page.getByTestId("create_room_dialog_save").click();

    const post = await postPromise;
    const body = post.postDataJSON() as {
      private: boolean;
      roomType: number;
      title: string;
    };

    expect(body.private).toBe(true);
    expect(body.roomType).toBe(ROOMS_TYPE_CUSTOM_ROOM);
    expect(body.title).toBe("Test private room");

    await expect
      .poll(() => roomHandle.current?.getPrivateRooms().length ?? 0, {
        timeout: 5000,
      })
      .toBe(1);

    const stored = roomHandle.current!.getPrivateRooms()[0];
    expect(stored.private).toBe(true);
    expect(stored.roomType).toBe(ROOMS_TYPE_CUSTOM_ROOM);
    expect(stored.title).toBe("Test private room");
  });

  test("blocks creation without encryption keys and shows a toast", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const roomHandle: { current: CreateRoomHandlerHandle | null } = {
      current: null,
    };

    mockRequest.use(
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [],
        userId: TEST_USER_ID,
      }),
      createPrivateRoomHandler(TEST_PORT, { handle: roomHandle }),
    );

    await page.goto(`${baseUrl}/rooms/shared/`);

    await page.getByTestId("create_new_room_button").click();

    const privateTile = page
      .getByTestId("room-type-list-item")
      .filter({ hasText: "Private Room" });
    await expect(privateTile).toBeVisible({ timeout: 5000 });
    await privateTile.click();

    const titleInput = page.getByTestId("create_edit_room_input");
    await expect(titleInput).toBeVisible({ timeout: 5000 });
    await titleInput.fill("Keyless private room");

    let postSent = false;
    page.on("request", (req) => {
      if (req.method() === "POST" && req.url().endsWith("/files/rooms")) {
        postSent = true;
      }
    });

    await page.getByTestId("create_room_dialog_save").click();

    const toast = page
      .getByTestId("toast-content")
      .filter({ hasText: /encryption keys|Set up your encryption/i });
    await expect(toast).toBeVisible({ timeout: 10000 });

    expect(postSent).toBe(false);
    expect(roomHandle.current?.getPrivateRooms() ?? []).toHaveLength(0);
  });

  test("cancel button does NOT post to /files/rooms", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const roomHandle: { current: CreateRoomHandlerHandle | null } = {
      current: null,
    };

    mockRequest.use(
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [seedUserKey],
        userId: TEST_USER_ID,
      }),
      createPrivateRoomHandler(TEST_PORT, { handle: roomHandle }),
    );

    await page.goto(`${baseUrl}/rooms/shared/`);

    await page.getByTestId("create_new_room_button").click();

    const privateTile = page
      .getByTestId("room-type-list-item")
      .filter({ hasText: "Private Room" });
    await expect(privateTile).toBeVisible({ timeout: 5000 });
    await privateTile.click();

    const cancelButton = page.getByTestId("create_room_dialog_cancel");
    await expect(cancelButton).toBeVisible({ timeout: 5000 });
    await cancelButton.click();

    expect(roomHandle.current).not.toBeNull();
    expect(roomHandle.current!.getRequests()).toHaveLength(0);
    expect(roomHandle.current!.getRooms()).toHaveLength(0);
  });
});
