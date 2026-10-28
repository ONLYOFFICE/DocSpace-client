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
  encryptedFilesHandlers,
  filesSettingsHandler,
  privacyroomAccessHandlers,
  privateRoomListHandler,
  rootHandler,
  roomMembersHandlers,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  usersWithRoomSharedHandler,
  type EncryptedFilesHandlerHandle,
  type PrivacyroomAccessHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import { generateIdentityKeyPair } from "@docspace/shared/services/encryption/identity";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";
import type { Page } from "@playwright/test";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

const ROOM_ID = 9300;
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const CAROL = {
  id: "33333333-3333-3333-3333-333333333333",
  displayName: "Carol Jones",
  email: "carol@example.com",
};
const DAN = {
  id: "44444444-4444-4444-4444-444444444444",
  displayName: "Dan Brown",
  email: "dan@example.com",
};

// In-app navigation keeps the identity unlocked after the key setup.
const navigateInApp = (page: Page, url: string) =>
  page.evaluate(
    (address) =>
      (
        window as unknown as { DocSpace: { navigate: (u: string) => void } }
      ).DocSpace.navigate(address),
    url,
  );

const unlockIfPrompted = async (page: Page, passphrase: string) => {
  const prompt = page
    .getByRole("dialog")
    .filter({ hasText: "Enter passphrase" });
  if (await prompt.isVisible().catch(() => false)) {
    await prompt
      .locator('input[name="passphrase"], #passphrase input')
      .first()
      .fill(passphrase);
    await prompt.getByRole("button", { name: "Confirm" }).click();
  }
};

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

    await page.goto(`${baseUrl}/private/filter`);

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

    await page.goto(`${baseUrl}/private/filter`);

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

  test("Mixed invitation: the panel lists the invited member and the one without keys, and invites the latter again", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    const { keysHandle, passphrase } = await bootstrapEncryption(
      page,
      mockRequest,
      baseUrl,
    );
    const carol = await generateIdentityKeyPair();
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      privateRoomListHandler(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        title: "Private Test Room",
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        handle: filesHandle,
      }),
      ...privacyroomAccessHandlers(TEST_PORT, { handle: accessHandle }),
      usersWithRoomSharedHandler(TEST_PORT, ROOM_ID, [CAROL, DAN]),
      ...roomMembersHandlers(TEST_PORT, ROOM_ID),
    );
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      { ...keysHandle.getKeys()[0], userId: TEST_USER_ID },
      {
        id: "carol-1",
        userId: CAROL.id,
        publicKey: arrayBufferToBase64(carol.publicKey.buffer as ArrayBuffer),
        privateKeyEnc: "",
        date: "2026-01-01T00:00:00.000Z",
        cryptoEngineId: "",
      },
    ]);

    // An encrypted file in the room, wrapped for the inviter only.
    await navigateInApp(page, `/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);
    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        new URL(res.url()).pathname.endsWith(`/files/${ROOM_ID}`) &&
        res.ok(),
      { timeout: 15000 },
    );
    await page.locator("#customFileInput").first().setInputFiles({
      name: "memo.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("memo"),
    });
    await unlockIfPrompted(page, passphrase);
    await expect
      .poll(() => filesHandle.current!.getFiles().length, { timeout: 30000 })
      .toBe(1);

    await navigateInApp(page, "/private/filter");
    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.getByTestId("context-menu-button").first().click();
    await page.getByTestId("option_invite-users-to-room").click();
    await page.getByTestId("invite_panel_choose_from_list_link").click();
    const people = page.getByTestId("invite_panel_people_selector");
    await people.getByTestId("selector-item-0").click();
    await people.getByTestId("selector-item-1").click();
    await people.getByTestId("selector_submit_button").click();
    await page.getByTestId("invite_panel_send_button").click();
    await unlockIfPrompted(page, passphrase);

    await expect(page.getByTestId("invite_panel_result")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId("invite_panel_result_granted")).toContainText(
      CAROL.displayName,
    );
    await expect(page.getByTestId("invite_panel_result_skipped")).toContainText(
      DAN.displayName,
    );
    const storedFile = filesHandle.current!.getFiles()[0];
    expect(storedFile.fileKeys.map((k) => String(k.userId)).sort()).toEqual(
      [CAROL.id, TEST_USER_ID].sort(),
    );

    await page.getByTestId("invite_panel_invite_again_button").click();

    await expect(page.getByTestId("invite_panel_result")).toBeHidden();
    await expect(page.getByTestId("invite_panel_send_button")).toBeVisible();
    const panel = page.locator("#invite_panel_modal");
    await expect(panel.getByText(DAN.displayName)).toBeVisible();
    await expect(panel.getByText(CAROL.displayName)).toHaveCount(0);
  });
});
