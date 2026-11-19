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
import { expectElementScreenshot } from "@docspace/shared/__mocks__/e2e";
import { generateIdentityKeyPair } from "@docspace/shared/services/encryption/identity";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";
import type { Locator, Page } from "@playwright/test";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";
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
    await prompt.getByRole("button", { name: "Unlock", exact: true }).click();
  }
};

// Moves through an open role list with the arrow keys until the named option
// is the active one, then picks it with Enter.
const pickRoleWithKeyboard = async (page: Page, option: string) => {
  for (let step = 0; step < 12; step += 1) {
    const active = await page.evaluate(() => {
      const id = document.activeElement?.getAttribute("aria-activedescendant");
      return id ? (document.getElementById(id)?.textContent ?? "") : "";
    });
    if (active.trim().startsWith(option)) break;
    await page.keyboard.press("ArrowDown");
  }
  await page.keyboard.press("Enter");
};

const openInvitePanelWithInvitees = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/private/filter`);
  const row = page.getByTestId("table-row-0");
  await expect(row).toBeVisible({ timeout: 15000 });
  await row.getByTestId("context-menu-button").first().click();
  await page.getByTestId("option_invite-users-to-room").click();
  await page.getByTestId("invite_panel_choose_from_list_link").click();
  const people = page.getByTestId("invite_panel_people_selector");
  await people.getByTestId("selector-item-0").click();
  await people.getByTestId("selector-item-1").click();
  await people.getByTestId("selector_submit_button").click();
  return page.getByRole("dialog", { name: "Invite", exact: true });
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

  test("Invitee removed from the keyboard", async ({
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
      usersWithRoomSharedHandler(TEST_PORT, ROOM_ID, [CAROL, DAN]),
      ...roomMembersHandlers(TEST_PORT, ROOM_ID),
    );
    const panel = await openInvitePanelWithInvitees(page, baseUrl);

    const roleList = panel.getByRole("button", {
      name: `Role of ${CAROL.displayName}: Viewer`,
    });
    await roleList.focus();
    await page.keyboard.press("Enter");
    await pickRoleWithKeyboard(page, "Remove");

    await expect(panel.getByText(CAROL.displayName)).toHaveCount(0);
    await expect(panel.getByText(DAN.displayName)).toBeVisible();
    await expect(page.getByTestId("invite_panel_search_input")).toBeFocused();
  });

  test("Role chosen from the keyboard", async ({
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
      usersWithRoomSharedHandler(TEST_PORT, ROOM_ID, [CAROL, DAN]),
      ...roomMembersHandlers(TEST_PORT, ROOM_ID),
    );
    const panel = await openInvitePanelWithInvitees(page, baseUrl);

    await panel
      .getByRole("button", { name: `Role of ${DAN.displayName}: Viewer` })
      .focus();
    await page.keyboard.press("Enter");
    await pickRoleWithKeyboard(page, "Content creator");

    const picked = panel.getByRole("button", {
      name: `Role of ${DAN.displayName}: Content creator`,
    });
    await expect(picked).toBeFocused();
    await expect(
      panel.getByRole("button", {
        name: `Role of ${CAROL.displayName}: Viewer`,
      }),
    ).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Role: Viewer", exact: true }),
    ).toBeVisible();
  });

  // Sets up a private room with one encrypted file wrapped for the inviter,
  // invites Carol, who has a key, and holds the key writes of the
  // re-encryption until `release` is called.
  const startHeldInvitation = async (
    page: Page,
    mockRequest: WorkerFixture,
    baseUrl: string,
  ) => {
    const { keysHandle, passphrase } = await bootstrapEncryption(
      page,
      mockRequest,
      baseUrl,
    );
    const carol = await generateIdentityKeyPair();
    const carolKey = {
      id: "carol-1",
      userId: CAROL.id,
      publicKey: arrayBufferToBase64(carol.publicKey.buffer as ArrayBuffer),
      privateKeyEnc: "",
      date: "2026-01-01T00:00:00.000Z",
      cryptoEngineId: "",
    };
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      // Ahead of the room list, whose pattern also takes the members request.
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
    // The upload writes the uploader's key after the file. It has to land
    // before the key writes are held below, or it is held with them.
    await expect
      .poll(
        () =>
          filesHandle
            .current!.getFiles()[0]
            .fileKeys.map((k) => String(k.userId)),
        { timeout: 30000 },
      )
      .toEqual([TEST_USER_ID]);
    // Carol's key reaches the room only after the upload has settled, or the
    // client would wrap the new file for her on its own.
    await page.waitForLoadState("networkidle");
    accessHandle.current!.setRoomKeys(ROOM_ID, [ownKey, carolKey]);

    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    let keyWriteSeen = false;
    await page.route(/\/api\/2\.0\/files\/\d+\/access/, async (route) => {
      if (route.request().method() === "PUT") {
        keyWriteSeen = true;
        await held;
      }
      await route.fallback().catch(() => {});
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
    await expect.poll(() => keyWriteSeen, { timeout: 30000 }).toBe(true);

    const keyHolders = () =>
      filesHandle
        .current!.getFiles()[0]
        .fileKeys.map((k) => String(k.userId))
        .sort();
    // The mocked missing-keys route takes the room's members from its key
    // list. Carol joins it only now: earlier the upload would wrap for her.
    const countCarolAsMember = () =>
      filesHandle.current!.setRoomUserKeys([carolKey]);
    return { release, keyHolders, passphrase, countCarolAsMember };
  };

  test("Re-encryption aborted: the panel is closed", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    const { release, keyHolders } = await startHeldInvitation(
      page,
      mockRequest,
      baseUrl,
    );
    expect(keyHolders()).toEqual([TEST_USER_ID]);

    const panel = page.getByRole("dialog", { name: "Invite", exact: true });
    await panel.getByRole("button", { name: "Close" }).click();
    await expect(panel).toBeHidden();
    release();

    await expect
      .poll(keyHolders, { timeout: 30000 })
      .toEqual([CAROL.id, TEST_USER_ID].sort());
  });

  test("Re-encryption aborted: the page is reloaded", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    const { keyHolders, passphrase, countCarolAsMember } =
      await startHeldInvitation(page, mockRequest, baseUrl);
    expect(keyHolders()).toEqual([TEST_USER_ID]);
    countCarolAsMember();

    await page.reload();
    await unlockIfPrompted(page, passphrase);
    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 15000 });
    expect(keyHolders()).toEqual([TEST_USER_ID]);

    await page.locator(".info-panel-toggle").click();
    await row.click();
    await page.getByTestId("info_members_tab").click();

    await expect(
      page.getByTestId("info_panel_members_user_access_pending"),
    ).toContainText("Access pending", { timeout: 15000 });
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
    await expect(page.getByTestId("invite_panel_result_refused")).toContainText(
      DAN.displayName,
    );
    await test.step("Re-encryption completes", async () => {
      await expect(
        // The upload of the file is still listed, so the indicator counts both.
        page.getByRole("progressbar", { name: "Processes: 2" }),
      ).toBeVisible();
    });
    await test.step("Reason shown once", async () => {
      await expect(
        page.getByRole("alert").filter({ hasText: DAN.displayName }),
      ).toHaveCount(0);
    });
    await test.step("Result shown", async () => {
      const result = page.getByRole("region", { name: "Invitation results" });
      await expect(result).toBeFocused();
      await expect(
        result.getByRole("region", { name: "Invited", exact: true }),
      ).toContainText(CAROL.displayName);
    });
    await test.step("Result with a skipped invitee", async () => {
      await expect(
        page.getByRole("region", { name: "Not invited" }),
      ).toContainText(DAN.displayName);
    });
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
  test("Mixed invitation: the panel names the invitee left out before the grant and shares the files with the one it added", async ({
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
      ...roomMembersHandlers(TEST_PORT, ROOM_ID, { withoutKeys: [DAN.id] }),
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
    // The invitees are verified before the security update: Dan has no key,
    // so he is left out of it and named as not invited, with the sentence a
    // refusal of the server would get.
    await expect(page.getByTestId("invite_panel_result_refused")).toContainText(
      DAN.displayName,
    );
    await expect(page.getByTestId("invite_panel_result_skipped")).toHaveCount(0);
    const storedFile = filesHandle.current!.getFiles()[0];
    expect(storedFile.fileKeys.map((k) => String(k.userId)).sort()).toEqual(
      [CAROL.id, TEST_USER_ID].sort(),
    );
  });
});

// Spec: private-rooms/room-membership, "The invitation result is readable".
test.describe("Private room — invitation result is readable", () => {
  test.use({ locale: "en-US", timezoneId: "UTC" });

  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  // WCAG 2.x contrast of two computed CSS colours ("rgb(r, g, b)").
  const contrastOf = (a: string, b: string) => {
    const luminance = (css: string) => {
      const [r, g, bl] = (css.match(/[\d.]+/g) ?? [])
        .slice(0, 3)
        .map((c) => Number(c) / 255)
        .map((c) =>
          c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
        );
      return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    };
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
  };

  // The colour, the size and the colour behind one text of the panel.
  const textStyle = (locator: ReturnType<Page["locator"]>) =>
    locator.evaluate((element) => {
      let background = "rgb(255, 255, 255)";
      for (
        let node: Element | null = element;
        node;
        node = node.parentElement
      ) {
        const colour = getComputedStyle(node).backgroundColor;
        if (colour !== "rgba(0, 0, 0, 0)" && colour !== "transparent") {
          background = colour;
          break;
        }
      }
      const style = getComputedStyle(element);
      return {
        colour: style.color,
        size: parseFloat(style.fontSize),
        background,
      };
    });

  // Invites the listed people into a private room holding one encrypted
  // file, with the key writes of the invitation failing, so a member with a
  // key is left pending and one without a key is refused.
  const inviteWithFailingKeyWrites = async (
    page: Page,
    mockRequest: Parameters<typeof bootstrapEncryption>[1],
    baseUrl: string,
    selectorItems: number[],
  ) => {
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
    const ownKey = { ...keysHandle.getKeys()[0], userId: TEST_USER_ID };
    accessHandle.current!.setRoomKeys(ROOM_ID, [ownKey]);

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
    filesHandle.current!.setRoomUserKeys([carolKey]);

    await page.route(/\/api\/2\.0\/files\/\d+\/access/, async (route) => {
      if (route.request().method() === "PUT") {
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
    for (const item of selectorItems) {
      await people.getByTestId(`selector-item-${item}`).click();
    }
    await people.getByTestId("selector_submit_button").click();
    await page.getByTestId("invite_panel_send_button").click();
    await unlockIfPrompted(page, passphrase);
  };

  for (const colorScheme of ["light", "dark"] as const) {
    test(`Invitee left out and files not shared in the ${colorScheme} theme`, async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      test.slow();
      await page.emulateMedia({ colorScheme });
      await inviteWithFailingKeyWrites(page, mockRequest, baseUrl, [0, 1]);

      const pending = page.getByTestId("invite_panel_result_pending");
      const refused = page.getByTestId("invite_panel_result_refused");
      await expect(pending).toBeVisible({ timeout: 30000 });
      await expect(refused).toContainText(DAN.displayName);

      const names = await textStyle(pending.getByText(CAROL.displayName));
      for (const [label, text] of [
        [
          "files not shared",
          pending.getByText(/could not be made available|Failed to share/),
        ],
        ["invitee left out", refused.getByText(DAN.displayName)],
      ] as const) {
        const style = await textStyle(text);
        expect(
          contrastOf(style.colour, style.background),
          `${label}: ${style.colour} on ${style.background}`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(style.size, `${label} size`).toBeGreaterThanOrEqual(
          names.size,
        );
      }
      await expectElementScreenshot(
        page.locator("#invite_panel_modal").getByRole("dialog"),
        [
          "desktop",
          "private-room-invite",
          `invite-result-${colorScheme}.png`,
        ],
      );
    });

    test(`Reasons kept in the invite form in the ${colorScheme} theme`, async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      test.slow();
      await page.emulateMedia({ colorScheme });
      await inviteWithFailingKeyWrites(page, mockRequest, baseUrl, [1]);

      const reasons = page.getByTestId("invite_panel_not_invited");
      await expect(reasons).toContainText(DAN.displayName, { timeout: 30000 });
      const style = await textStyle(reasons.getByText(DAN.displayName));
      expect(
        contrastOf(style.colour, style.background),
        `${style.colour} on ${style.background}`,
      ).toBeGreaterThanOrEqual(4.5);
    });
  }
});

test.describe("Private room — people without a key are marked", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  /** Carol holds a key, Dan has none. Leaves the people list open. */
  const openPeopleList = async (
    page: Page,
    mockRequest: WorkerFixture,
    baseUrl: string,
    dan: typeof DAN = DAN,
  ) => {
    const { keysHandle, passphrase } = await bootstrapEncryption(
      page,
      mockRequest,
      baseUrl,
    );
    const carol = await generateIdentityKeyPair();
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
      }),
      ...privacyroomAccessHandlers(TEST_PORT, { handle: accessHandle }),
      usersWithRoomSharedHandler(TEST_PORT, ROOM_ID, [CAROL, dan]),
      ...roomMembersHandlers(TEST_PORT, ROOM_ID),
    );
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      { ...keysHandle.getKeys()[0], userId: TEST_USER_ID },
    ]);
    accessHandle.current!.setUserKeys(CAROL.id, [
      {
        id: "carol-1",
        userId: CAROL.id,
        publicKey: arrayBufferToBase64(carol.publicKey.buffer as ArrayBuffer),
        privateKeyEnc: "",
        date: "2026-01-01T00:00:00.000Z",
        cryptoEngineId: "",
      },
    ]);

    await navigateInApp(page, "/private/filter");
    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.getByTestId("context-menu-button").first().click();
    await page.getByTestId("option_invite-users-to-room").click();
    await page.getByTestId("invite_panel_choose_from_list_link").click();

    const people = page.getByTestId("invite_panel_people_selector");
    const personRow = (person: { displayName: string }) =>
      people
        .locator('[data-testid^="selector-item-"][style]')
        .filter({ hasText: person.displayName });
    await expect(personRow(dan)).toBeVisible({ timeout: 15000 });
    return { people, personRow, passphrase };
  };

  test("Person without a key is marked", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    const { personRow } = await openPeopleList(page, mockRequest, baseUrl);

    const mark = personRow(DAN).getByText("No key", { exact: true });
    await expect(mark).toBeVisible({ timeout: 15000 });
    await expect(personRow(CAROL).getByText("No key")).toHaveCount(0);
    await expect(personRow(DAN)).toHaveAccessibleDescription(
      /cannot be invited until they create one/,
    );

    await mark.hover();
    await expect(page.getByRole("tooltip")).toContainText(
      "has not set up an encryption key",
    );
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`People list with a marked person in the ${colorScheme} theme`, async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      test.slow();
      await page.emulateMedia({ colorScheme });
      const { people, personRow } = await openPeopleList(
        page,
        mockRequest,
        baseUrl,
      );
      await expect(personRow(DAN).getByText("No key")).toBeVisible({
        timeout: 15000,
      });
      await expect(personRow(CAROL)).toBeVisible();
      await page.mouse.move(0, 0);

      await expectElementScreenshot(people.getByRole("listbox"), [
        "desktop",
        "private-room-invite",
        `people-list-marked-${colorScheme}.png`,
      ]);
    });
  }

  const markOf = (row: Locator) => row.locator('[data-testid$="-mark"]');

  for (const colorScheme of ["light", "dark"] as const) {
    test(`Badge readable in the ${colorScheme} theme`, async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      test.slow();
      await page.emulateMedia({ colorScheme });
      const { personRow } = await openPeopleList(page, mockRequest, baseUrl);
      const mark = markOf(personRow(DAN));
      await expect(mark).toBeVisible({ timeout: 15000 });

      const ratio = await mark.evaluate((element) => {
        const luminance = (css: string) => {
          const [r, g, b] = (css.match(/[\d.]+/g) ?? [])
            .slice(0, 3)
            .map((c) => Number(c) / 255)
            .map((c) =>
              c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
            );
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const nodes = [element, ...element.querySelectorAll("*")];
        const text = nodes.find(
          (node) =>
            node.children.length === 0 && node.textContent?.trim() === "No key",
        ) as Element;
        let badge: Element | null = text;
        while (
          badge &&
          getComputedStyle(badge).backgroundColor === "rgba(0, 0, 0, 0)"
        )
          badge = badge.parentElement;
        const [light, dark] = [
          luminance(getComputedStyle(text).color),
          luminance(getComputedStyle(badge as Element).backgroundColor),
        ].sort((x, y) => y - x);
        return {
          inside: element.contains(badge),
          value: (light + 0.05) / (dark + 0.05),
        };
      });

      expect(ratio.inside, "the background is the badge's own").toBe(true);
      expect(ratio.value).toBeGreaterThanOrEqual(4.5);
    });
  }

  test("Badge next to the name", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    const { personRow } = await openPeopleList(page, mockRequest, baseUrl);
    const mark = markOf(personRow(DAN));
    await expect(mark).toBeVisible({ timeout: 15000 });

    const name = await personRow(DAN)
      .getByText(DAN.displayName, { exact: true })
      .first()
      .boundingBox();
    const badge = await mark.boundingBox();
    const checkbox = await personRow(DAN).getByRole("checkbox").boundingBox();
    expect(name && badge && checkbox).toBeTruthy();
    // On the line of the name, right after it, away from the checkbox where
    // the note of an invited person stands.
    expect(badge!.y + badge!.height / 2).toBeGreaterThan(name!.y);
    expect(badge!.y + badge!.height / 2).toBeLessThan(name!.y + name!.height);
    expect(badge!.x - (name!.x + name!.width)).toBeLessThan(16);
    expect(checkbox!.x - (badge!.x + badge!.width)).toBeGreaterThan(40);
  });

  test("Long name", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    const longDan = {
      ...DAN,
      displayName:
        "Dan Bartholomew Montgomery-Featherstonehaugh of the Remote Northern Office",
    };
    const { personRow } = await openPeopleList(
      page,
      mockRequest,
      baseUrl,
      longDan,
    );
    const row = personRow(longDan);
    const mark = markOf(row);
    await expect(mark).toBeVisible({ timeout: 15000 });

    const badge = await mark.boundingBox();
    const rowBox = await row.boundingBox();
    const checkbox = await row.getByRole("checkbox").boundingBox();
    expect(badge!.x + badge!.width).toBeLessThanOrEqual(checkbox!.x);
    expect(badge!.x).toBeGreaterThan(rowBox!.x);
    await expect(mark).toHaveText("No key");
    const cut = await mark.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    );
    expect(cut).toBe(false);
    const nameCut = await row
      .getByText(longDan.displayName, { exact: true })
      .first()
      .evaluate((element) => element.scrollWidth > element.clientWidth);
    expect(nameCut).toBe(true);
  });

  test("Marked person selected and sent", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    const { people, personRow, passphrase } = await openPeopleList(
      page,
      mockRequest,
      baseUrl,
    );
    await expect(personRow(DAN).getByText("No key")).toBeVisible({
      timeout: 15000,
    });

    await personRow(DAN).click();
    await people.getByTestId("selector_submit_button").click();
    await page.getByTestId("invite_panel_send_button").click();
    await unlockIfPrompted(page, passphrase);

    await expect(page.getByTestId("invite_panel_not_invited")).toContainText(
      DAN.displayName,
      { timeout: 30000 },
    );
    await expect(page.getByTestId("invite_panel_not_invited")).toContainText(
      "have not set up encryption keys",
    );
  });
});
