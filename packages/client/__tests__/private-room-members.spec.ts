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
  type RoomMembersHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import { ShareAccessRights } from "@docspace/shared/enums";
import { generateIdentityKeyPair } from "@docspace/shared/services/encryption/identity";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";
import type { Page } from "@playwright/test";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

const ROOM_ID = 9200;
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const TOAST_KEY_FRAGMENT = "Encryption keys are not configured";
const CAROL = {
  id: "33333333-3333-3333-3333-333333333333",
  displayName: "Carol Jones",
  email: "carol@example.com",
};
const SUBFOLDER_ID = 9201;

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

test.describe("Private room — members bootstrap", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("bootstrap leaves an unlocked identity that survives navigation", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const { keysHandle } = await bootstrapEncryption(
      page,
      mockRequest,
      baseUrl,
    );
    expect(keysHandle.getKeys()).toHaveLength(1);
    const stored = keysHandle.getKeys()[0];
    expect(stored.publicKey.length).toBeGreaterThan(20);
    expect(stored.privateKeyEnc.length).toBeGreaterThan(20);

    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        handle: filesHandle,
      }),
    );

    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);

    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        /\/files\/9200(\?|$)/.test(res.url()) &&
        res.ok(),
      { timeout: 15000 },
    );

    const warningToast = page
      .getByTestId("toast-content")
      .filter({ hasText: TOAST_KEY_FRAGMENT });
    await expect(warningToast).toBeHidden();
  });
});

test.describe("Private room — pending access", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Retry succeeds: a member left without a file key gets it from the Members panel", async ({
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
      // Ahead of the rooms list, whose files/rooms* pattern also matches
      // files/rooms/{id}/share.
      ...roomMembersHandlers(TEST_PORT, ROOM_ID),
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
      usersWithRoomSharedHandler(TEST_PORT, ROOM_ID, [CAROL]),
    );
    const ownKey = { ...keysHandle.getKeys()[0], userId: TEST_USER_ID };
    accessHandle.current!.setRoomKeys(ROOM_ID, [ownKey]);

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
    // The uploader's own key write follows the stored file; it must land
    // before the key writes below are made to fail.
    await expect
      .poll(
        () =>
          filesHandle.current!.getFiles()[0]?.fileKeys.map((k) =>
            String(k.userId),
          ) ?? [],
        { timeout: 30000 },
      )
      .toEqual([TEST_USER_ID]);
    const carolKey = {
      id: "carol-1",
      userId: CAROL.id,
      publicKey: arrayBufferToBase64(carol.publicKey.buffer as ArrayBuffer),
      privateKeyEnc: "",
      date: "2026-01-01T00:00:00.000Z",
      cryptoEngineId: "",
    };
    accessHandle.current!.setRoomKeys(ROOM_ID, [ownKey, carolKey]);
    // The members list reads the room's missing keys: the files mock answers
    // them for the members it knows by their keys.
    filesHandle.current!.setRoomUserKeys([carolKey]);

    // The key writes of the invitation fail.
    let failKeyWrites = true;
    await page.route(/\/api\/2\.0\/files\/\d+\/access/, async (route) => {
      if (route.request().method() === "PUT" && failKeyWrites) {
        await route.fulfill({ status: 500, body: "" });
        return;
      }
      await route.fallback();
    });

    await navigateInApp(page, "/private/filter");
    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.getByTestId("context-menu-button").first().click();
    await page.getByTestId("option_invite-users-to-room").click();
    await page.getByTestId("invite_panel_choose_from_list_link").click();
    const people = page.getByTestId("invite_panel_people_selector");
    await people.getByTestId("selector-item-0").click();
    await people.getByTestId("selector_submit_button").click();
    await page.getByTestId("invite_panel_send_button").click();
    await unlockIfPrompted(page, passphrase);
    await expect(page.getByTestId("invite_panel_result_pending")).toBeVisible({
      timeout: 30000,
    });
    await page.getByTestId("invite_panel_close_button").click();

    await page.locator(".info-panel-toggle").click();
    await row.click();
    await page.getByTestId("info_members_tab").click();
    const pending = page.getByTestId("info_panel_members_user_access_pending");
    await expect(pending).toContainText("Access pending", { timeout: 15000 });
    const storedFile = filesHandle.current!.getFiles()[0];
    expect(storedFile.fileKeys.map((k) => String(k.userId))).toEqual([
      TEST_USER_ID,
    ]);

    failKeyWrites = false;
    await page.getByTestId("info_panel_members_user_retry_access").click();
    await unlockIfPrompted(page, passphrase);

    await expect(
      page.getByText("now has access to every encrypted file in the room"),
    ).toBeVisible({ timeout: 30000 });
    await expect(pending).toBeHidden();
    await expect
      .poll(() =>
        filesHandle
          .current!.getFiles()[0]
          .fileKeys.map((k) => String(k.userId))
          .sort(),
      )
      .toEqual([CAROL.id, TEST_USER_ID].sort());
  });
});

test.describe("Private room — member removal during uploads", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Uploads into a subfolder: removing a member is refused while the upload runs", async ({
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
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      // Ahead of the rooms list, whose files/rooms* pattern also matches
      // files/rooms/{id}/share.
      ...roomMembersHandlers(TEST_PORT, ROOM_ID, {
        initial: [
          {
            id: CAROL.id,
            displayName: CAROL.displayName,
            email: CAROL.email,
            access: ShareAccessRights.Editing,
          },
        ],
      }),
      privateRoomListHandler(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        title: "Private Test Room",
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        handle: filesHandle,
        folders: [{ id: SUBFOLDER_ID, title: "Drafts" }],
      }),
      ...privacyroomAccessHandlers(TEST_PORT, { handle: accessHandle }),
    );
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      { ...keysHandle.getKeys()[0], userId: TEST_USER_ID },
    ]);

    // The parts of the upload wait until the removal was tried.
    let releaseParts = () => {};
    const partsHeld = new Promise<void>((resolve) => {
      releaseParts = resolve;
    });
    await page.route(/\/session\/[^/]+\/upload/, async (route) => {
      await partsHeld;
      await route.fallback();
    });

    await navigateInApp(
      page,
      `/private/${ROOM_ID}/filter?folder=${SUBFOLDER_ID}`,
    );
    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        new URL(res.url()).pathname.endsWith(`/files/${SUBFOLDER_ID}`) &&
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
      .poll(() => filesHandle.current!.getSessions().length, { timeout: 30000 })
      .toBe(1);

    await navigateInApp(page, "/private/filter");
    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 15000 });
    await page.locator(".info-panel-toggle").click();
    await row.click();
    await page.getByTestId("info_members_tab").click();
    await page
      .getByTestId("info_panel_members_user_role_combobox")
      .first()
      .click();
    await page.getByText("Remove", { exact: true }).last().click();

    await expect(
      page.getByText("Cannot remove member while uploads are in progress (1)"),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("dialog")).toHaveCount(0);

    releaseParts();
    await expect
      .poll(() => filesHandle.current!.getFiles().length, { timeout: 30000 })
      .toBe(1);
  });
});

test.describe("Private room — refused access change", () => {
  const REFUSED = "Access not changed: the member has no encryption keys.";
  const SERVER_SENTENCE = "The user does not have an encryption key";

  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Removal refused", async ({ page, mockRequest, baseUrl }) => {
    const membersHandle: { current: RoomMembersHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...roomMembersHandlers(TEST_PORT, ROOM_ID, {
        initial: [
          {
            id: CAROL.id,
            displayName: CAROL.displayName,
            email: CAROL.email,
            access: ShareAccessRights.Editing,
          },
        ],
        withoutKeys: [CAROL.id],
        handle: membersHandle,
      }),
      privateRoomListHandler(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        title: "Private Test Room",
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
      }),
    );

    await page.goto(`${baseUrl}/private/filter`);
    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 15000 });
    await page.locator(".info-panel-toggle").click();
    await row.click();
    await page.getByTestId("info_members_tab").click();
    await page
      .getByTestId("info_panel_members_user_role_combobox")
      .first()
      .click();
    await page.getByText("Remove", { exact: true }).last().click();
    await page.getByTestId("remove_user_confirmation_dialog_ok_button").click();

    await expect(page.getByText(REFUSED)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(SERVER_SENTENCE)).toHaveCount(0);
    await expect(page.getByText("Access denied")).toHaveCount(0);
    await expect(
      page.getByTestId("info_panel_members_user_role_combobox").first(),
    ).toBeVisible();
    expect(
      membersHandle.current!.getRequests().some(
        (r) =>
          r.method === "PUT" && JSON.stringify(r.body).includes(CAROL.id),
      ),
    ).toBe(true);
  });

  // The mocked user is a member of Carol's room and has no key.
  test("Leave refused", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      ...roomMembersHandlers(TEST_PORT, ROOM_ID, {
        initial: [
          { id: CAROL.id, displayName: CAROL.displayName, email: CAROL.email },
          { id: TEST_USER_ID, access: ShareAccessRights.Editing },
        ],
        withoutKeys: [TEST_USER_ID],
      }),
      privateRoomListHandler(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: CAROL.id,
        title: "Private Test Room",
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: CAROL.id,
      }),
    );

    await page.goto(`${baseUrl}/private/filter`);
    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 15000 });

    await row.click({ button: "right" });
    await page.getByText("Leave the room", { exact: true }).click();
    await page.getByRole("button", { name: "OK", exact: true }).click();

    await expect(page.getByText(REFUSED)).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("leave_room_modal_submit")).toHaveCount(0);
    await expect(page.getByText(SERVER_SENTENCE)).toHaveCount(0);
    await expect(page.getByTestId("table-row-0")).toContainText(
      "Private Test Room",
    );
    // The shell answers a 403 with its own toast after half a second unless
    // the caller reported the failure.
    await page.waitForTimeout(1000);
    await expect(page.getByText("Access denied")).toHaveCount(0);
  });
});

test.describe("Private room — leaving", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  // The mocked user is the portal owner; the room belongs to Carol.
  test("Administrator leaves", async ({ page, mockRequest, baseUrl }) => {
    const membersHandle: { current: RoomMembersHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...roomMembersHandlers(TEST_PORT, ROOM_ID, {
        initial: [
          { id: CAROL.id, displayName: CAROL.displayName, email: CAROL.email },
          { id: TEST_USER_ID, access: ShareAccessRights.Editing },
        ],
        handle: membersHandle,
      }),
      privateRoomListHandler(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: CAROL.id,
        title: "Private Test Room",
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: CAROL.id,
      }),
    );

    await page.goto(`${baseUrl}/private/filter`);
    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row).toContainText("Private Test Room");

    await row.click({ button: "right" });
    await page.getByText("Leave the room", { exact: true }).click();
    await page.getByRole("button", { name: "OK", exact: true }).click();

    await expect(page.getByText("You have left the room")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId("table-row-0")).toHaveCount(0);
    expect(
      membersHandle.current!.getRequests().some(
        (r) =>
          r.method === "PUT" &&
          JSON.stringify(r.body).includes(TEST_USER_ID) &&
          JSON.stringify(r.body).includes(`"access":${ShareAccessRights.None}`),
      ),
    ).toBe(true);
  });
});
