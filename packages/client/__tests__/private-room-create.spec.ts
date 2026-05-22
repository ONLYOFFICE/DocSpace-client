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
