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
  aiConfigHandler,
  capabilitiesHandler,
  encryptedFilesHandlers,
  filesSettingsHandler,
  privacyroomAccessHandlers,
  privateRoomListHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  type EncryptedFileSeed,
  type EncryptedFilesHandlerHandle,
  type PrivacyroomAccessHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";
import { generateIdentityKeyPair } from "@docspace/shared/services/encryption/identity";
import { encryptFile } from "@docspace/shared/services/encryption/file-keys";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { isDSE3Format } from "@docspace/shared/services/encryption/streaming-encryption";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";
import type { Page } from "@playwright/test";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

const SOURCE_ROOM_ID = 9520;
const SOURCE_ROOM_TITLE = "Source Private Room";
const DEST_ROOM_ID = 9530;
const DEST_ROOM_TITLE = "Destination Private Room";
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";

const PLAN = { id: 8951, name: "plan.txt", text: "Plan of record." };

const MOVE_REFUSAL =
  /can't be moved to another private room|CannotMoveToAnotherPrivateRoom/;

type TRooms = {
  sourceHandle: EncryptedFilesHandlerHandle;
  destHandle: EncryptedFilesHandlerHandle;
  passphrase: string;
};

/**
 * Generates the member's key, then serves two private rooms the member
 * belongs to: the source, where Alice encrypted the file for herself and the
 * member, and the destination, whose other member is Bob.
 */
const serveTwoPrivateRooms = async (
  page: Page,
  mockRequest: WorkerFixture,
  baseUrl: string,
  { sourceArchived = false } = {},
): Promise<TRooms> => {
  const { keysHandle, passphrase } = await bootstrapEncryption(
    page,
    mockRequest,
    baseUrl,
  );
  const memberKey = keysHandle.getKeys()[0];
  const publicKeyOf = async () => {
    const pair = await generateIdentityKeyPair();
    return {
      pair,
      publicKey: arrayBufferToBase64(pair.publicKey.buffer as ArrayBuffer),
    };
  };
  const alice = await publicKeyOf();
  const bob = await publicKeyOf();

  const plain = new TextEncoder().encode(PLAN.text);
  const { encryptedBlob, dek } = await encryptFile(plain, {
    fileName: PLAN.name,
  });
  const seed: EncryptedFileSeed = {
    id: PLAN.id,
    title: PLAN.name,
    serverTitle: `${crypto.randomUUID()}.txt`,
    size: plain.byteLength,
    encrypted: true,
    fileKeys: await wrapDekForRecipients({
      dek,
      senderIdentity: alice.pair,
      senderUserId: ALICE_ID,
      recipients: [
        { userId: ALICE_ID, publicKey: alice.publicKey },
        { userId: TEST_USER_ID, publicKey: memberKey.publicKey },
      ],
      fileId: PLAN.id,
    }),
    bytes: new Uint8Array(await encryptedBlob.arrayBuffer()),
  };

  const sourceHandle: { current: EncryptedFilesHandlerHandle | null } = {
    current: null,
  };
  const destHandle: { current: EncryptedFilesHandlerHandle | null } = {
    current: null,
  };
  const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
    current: null,
  };
  mockRequest.use(
    ...encryptedFilesHandlers(TEST_PORT, {
      roomId: SOURCE_ROOM_ID,
      title: SOURCE_ROOM_TITLE,
      ownerId: ALICE_ID,
      archived: sourceArchived,
      initialFiles: [seed],
      withOtherRooms: true,
      handle: sourceHandle,
    }),
    ...privacyroomAccessHandlers(TEST_PORT, { handle: accessHandle }),
    privateRoomListHandler(
      TEST_PORT,
      sourceArchived
        ? { roomId: DEST_ROOM_ID, title: DEST_ROOM_TITLE }
        : {
            roomId: SOURCE_ROOM_ID,
            title: SOURCE_ROOM_TITLE,
            otherPrivateRooms: [
              { roomId: DEST_ROOM_ID, title: DEST_ROOM_TITLE },
            ],
          },
    ),
  );
  mockRequest.use(
    ...encryptedFilesHandlers(TEST_PORT, {
      roomId: DEST_ROOM_ID,
      title: DEST_ROOM_TITLE,
      ownerId: TEST_USER_ID,
      // The member owns the destination room.
      roomSecurity: {
        Read: true,
        Create: true,
        CopyTo: true,
        MoveTo: true,
        EditRoom: true,
      },
      withOtherRooms: true,
      handle: destHandle,
    }),
  );
  const member = { ...memberKey, userId: TEST_USER_ID };
  accessHandle.current!.setRoomKeys(SOURCE_ROOM_ID, [
    { id: "alice-1", userId: ALICE_ID, publicKey: alice.publicKey, privateKeyEnc: "" },
    member,
  ]);
  accessHandle.current!.setRoomKeys(DEST_ROOM_ID, [
    member,
    { id: "bob-1", userId: BOB_ID, publicKey: bob.publicKey, privateKeyEnc: "" },
  ]);

  return {
    sourceHandle: sourceHandle.current!,
    destHandle: destHandle.current!,
    passphrase,
  };
};

const navigateInApp = (page: Page, url: string) =>
  page.evaluate(
    (u) =>
      (
        window as unknown as { DocSpace: { navigate: (to: string) => void } }
      ).DocSpace.navigate(u),
    url,
  );

/** Opens a room in-app, so the identity stays unlocked. */
const openRoomInApp = async (page: Page, roomId: number, url: string) => {
  const loaded = page.waitForResponse(
    (res) =>
      res.request().method() === "GET" &&
      new URL(res.url()).pathname.endsWith(`/files/${roomId}`) &&
      res.ok(),
    { timeout: 15000 },
  );
  await navigateInApp(page, url);
  await loaded;
};

const activeRoomUrl = (roomId: number) =>
  `/private/${roomId}/filter?folder=${roomId}`;

/** The list shows titles without their extension. */
const row = (page: Page, title: string) =>
  page
    .locator('[data-testid^="table-row-"]')
    .filter({ hasText: title.replace(/\.txt$/, "") });

/**
 * Opens Copy or Move from the file's menu. With both rights the two sit
 * under "Move or copy"; with one of them the entry stands on its own.
 */
const openTransferDialog = async (page: Page, action: "copy" | "move") => {
  await row(page, PLAN.name).getByTestId("context-menu-button").first().click();
  const submenu = page.getByTestId("option_move-or-copy");
  const entry = page.getByTestId(`option_${action}-to`);
  await expect(submenu.or(entry).first()).toBeVisible({ timeout: 10000 });
  if (await submenu.isVisible()) await submenu.hover();
  await entry.click();
};

const passphrasePrompt = (page: Page) =>
  page.getByRole("dialog").filter({ hasText: "Enter passphrase" });

const unlockIfPrompted = async (page: Page, passphrase: string) => {
  const prompt = passphrasePrompt(page);
  try {
    await prompt.waitFor({ state: "visible", timeout: 5000 });
  } catch {
    return;
  }
  await prompt
    .locator('input[name="passphrase"], #passphrase input')
    .first()
    .fill(passphrase);
  await prompt.getByRole("button", { name: "Confirm" }).click();
};

const selector = (page: Page) => page.getByTestId("aside").first();

const selectorItem = (page: Page, title: string | RegExp) =>
  selector(page)
    .locator('[data-testid^="selector-item-"]')
    .filter({ hasText: title });

/** Picks the destination room from Rooms at the picker's root and confirms. */
const copyToDestinationRoom = async (page: Page) => {
  const picker = selector(page);
  await picker.getByText("Apps", { exact: true }).first().click();
  await selectorItem(page, /^Rooms$/).click();
  await selectorItem(page, DEST_ROOM_TITLE).click();
  await picker.getByRole("button", { name: "Copy here" }).click();
};

/** Records every request the page sends, as "METHOD pathname". */
const recordRequests = (page: Page) => {
  const seen: string[] = [];
  page.on("request", (req) => {
    seen.push(`${req.method()} ${new URL(req.url()).pathname}`);
  });
  return seen;
};

/** Checks the copy stored in the destination room. */
const expectReencryptedCopy = async (rooms: TRooms) => {
  await expect
    .poll(() => rooms.destHandle.getFiles().length, { timeout: 30000 })
    .toBe(1);
  const [copy] = rooms.destHandle.getFiles();
  expect(copy.encrypted).toBe(true);
  expect(isDSE3Format(copy.bytes!)).toBe(true);
  expect(new TextDecoder().decode(copy.bytes)).not.toContain(PLAN.text);
  expect(rooms.destHandle.getSessions().map((s) => s.encrypted)).toEqual([
    true,
  ]);
  await expect
    .poll(() =>
      rooms.destHandle
        .getFile(copy.id)
        .fileKeys.map((k) => String(k.userId))
        .sort(),
    )
    .toEqual([BOB_ID, TEST_USER_ID].sort());
  expect(rooms.sourceHandle.getFile(PLAN.id).encrypted).toBe(true);
};

test.describe("Private room — copy into another private room", () => {
  test.beforeEach(async ({ page, mockRequest }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      aiConfigHandler(TEST_PORT),
    );
  });

  test("Copy to another private room", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    const rooms = await serveTwoPrivateRooms(page, mockRequest, baseUrl);
    await openRoomInApp(page, SOURCE_ROOM_ID, activeRoomUrl(SOURCE_ROOM_ID));
    await expect(row(page, PLAN.name)).toBeVisible({ timeout: 15000 });

    await openTransferDialog(page, "copy");
    await copyToDestinationRoom(page);
    await unlockIfPrompted(page, rooms.passphrase);

    await expectReencryptedCopy(rooms);
  });

  test("Copy from an archived private room", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    const rooms = await serveTwoPrivateRooms(page, mockRequest, baseUrl, {
      sourceArchived: true,
    });
    await openRoomInApp(
      page,
      SOURCE_ROOM_ID,
      `/private/archived/filter?folder=${SOURCE_ROOM_ID}`,
    );
    await expect(row(page, PLAN.name)).toBeVisible({ timeout: 15000 });

    await openTransferDialog(page, "copy");
    await copyToDestinationRoom(page);
    await unlockIfPrompted(page, rooms.passphrase);

    await expectReencryptedCopy(rooms);
  });

  test("Paste into another private room", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    const rooms = await serveTwoPrivateRooms(page, mockRequest, baseUrl);
    await openRoomInApp(page, SOURCE_ROOM_ID, activeRoomUrl(SOURCE_ROOM_ID));
    await expect(row(page, PLAN.name)).toBeVisible({ timeout: 15000 });

    await page.keyboard.press("Control+a");
    await page.keyboard.press("Control+x");
    await expect(
      page.getByTestId("toast-content").filter({ hasText: /: 1$/ }),
    ).toBeVisible({ timeout: 5000 });

    await openRoomInApp(page, DEST_ROOM_ID, activeRoomUrl(DEST_ROOM_ID));
    await expect(
      page.getByRole("heading", { name: DEST_ROOM_TITLE, level: 1 }),
    ).toBeVisible({ timeout: 15000 });
    const seen = recordRequests(page);
    await page.keyboard.press("Control+v");

    await expect(
      page.getByTestId("toast-content").filter({ hasText: MOVE_REFUSAL }),
    ).toBeVisible({ timeout: 10000 });
    expect(seen.filter((r) => r.includes("/fileops/"))).toEqual([]);
    expect(seen.filter((r) => /\/session(\/|$)/.test(r))).toEqual([]);
    expect(rooms.destHandle.getFiles()).toEqual([]);
    expect(rooms.sourceHandle.getFile(PLAN.id)).toBeTruthy();
  });

  test("Move dialog", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    await serveTwoPrivateRooms(page, mockRequest, baseUrl);
    await openRoomInApp(page, SOURCE_ROOM_ID, activeRoomUrl(SOURCE_ROOM_ID));
    await expect(row(page, PLAN.name)).toBeVisible({ timeout: 15000 });

    await openTransferDialog(page, "move");

    const picker = selector(page);
    await expect(picker.getByText(SOURCE_ROOM_TITLE).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(picker.getByText("Apps", { exact: true })).toHaveCount(0);
    await expect(picker.getByText(DEST_ROOM_TITLE)).toHaveCount(0);
  });
});
