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
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";

import { setupServer } from "../../../__mocks__/e2e/msw-compat";
import {
  encryptedFilesHandlers,
  privacyroomAccessHandlers,
  type EncryptedFilesHandlerHandle,
  type PrivacyroomAccessHandlerHandle,
} from "../../../__mocks__/handlers";

import { generateIdentityKeyPair } from "../../encryption/identity";
import { generateDEK } from "../../encryption/file-keys";
import { wrapDekForRecipients } from "../../encryption/room-file-access";
import {
  getTofuStore,
  resetTofuStores,
} from "../../encryption/tofu-store";
import { arrayBufferToBase64 } from "../../encryption/utils";
import type { IdentityKeyPair } from "../../encryption/types";

import { addMembersToEncryptedRoom } from "../room-encryption";

import { mockIDB, resetMockIDB } from "./_helpers/mock-idb";

const PORT = "3000";
const ROOM_ID = 8888;
const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";

function pubB64(kp: IdentityKeyPair): string {
  return arrayBufferToBase64(kp.publicKey.buffer as ArrayBuffer);
}

const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
  current: null,
};
const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
  current: null,
};

const server = setupServer(
  ...encryptedFilesHandlers(PORT, {
    roomId: ROOM_ID,
    ownerId: ALICE_ID,
    handle: filesHandle,
  }),
  ...privacyroomAccessHandlers(PORT, { handle: accessHandle }),
);

beforeAll(() => {
  (window as unknown as { ClientConfig: unknown }).ClientConfig = {
    api: { origin: "", prefix: "/api/2.0", timeout: 30000 },
    proxy: { url: "" },
  };
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  filesHandle.current?.reset();
  accessHandle.current?.reset();
  resetTofuStores();
  resetMockIDB();
  vi.stubGlobal("indexedDB", mockIDB);
});

describe("TOFU key mismatch — integration via MSW + real IDB", () => {
  async function setupRoomWithBobOldKeyPinned(
    aliceIdentity: IdentityKeyPair,
    bobOld: IdentityKeyPair,
  ) {
    const dek = generateDEK();
    const fileId = 6000;
    const initialWrap = await wrapDekForRecipients({
      dek,
      senderIdentity: aliceIdentity,
      senderUserId: ALICE_ID,
      recipients: [{ userId: ALICE_ID, publicKey: pubB64(aliceIdentity) }],
      fileId,
    });

    filesHandle.current!.setFiles([
      {
        id: fileId,
        title: "shared.docx",
        encrypted: true,
        fileKeys: initialWrap,
      },
    ]);

    const tofu = getTofuStore(ALICE_ID);
    const firstSeen = await tofu.checkKey(BOB_ID, pubB64(bobOld));
    expect(firstSeen.kind).toBe("first-seen");

    return { fileId };
  }

  it("refuses Bob's new key when no resolver is registered", async () => {
    const alice = await generateIdentityKeyPair();
    const bobOld = await generateIdentityKeyPair();
    const bobNew = await generateIdentityKeyPair();

    const { fileId } = await setupRoomWithBobOldKeyPinned(alice, bobOld);

    accessHandle.current!.setRoomKeys(ROOM_ID, [
      {
        id: "1",
        userId: ALICE_ID,
        publicKey: pubB64(alice),
        privateKeyEnc: "",
      },
      {
        id: "2",
        userId: BOB_ID,
        publicKey: pubB64(bobNew),
        privateKeyEnc: "",
      },
    ]);

    const result = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: BOB_ID, displayName: "Bob" }],
      { currentUserId: ALICE_ID, identity: alice },
    );

    expect(result.skippedMembers).toEqual([
      { id: BOB_ID, displayName: "Bob", reason: "key-mismatch-refused" },
    ]);
    expect(result.fileResults).toEqual([{ fileId, success: true }]);

    const stored = filesHandle.current!.getFile(fileId);
    expect(stored.fileKeys).toHaveLength(1);
    expect(stored.fileKeys[0].userId).toBe(ALICE_ID);

    const puts = filesHandle.current!
      .getRequests()
      .filter((r) => r.method === "PUT");
    expect(puts).toHaveLength(0);
  });

  it("refuses Bob's new key when resolver returns 'refuse'", async () => {
    const alice = await generateIdentityKeyPair();
    const bobOld = await generateIdentityKeyPair();
    const bobNew = await generateIdentityKeyPair();
    const { fileId } = await setupRoomWithBobOldKeyPinned(alice, bobOld);

    accessHandle.current!.setRoomKeys(ROOM_ID, [
      {
        id: "1",
        userId: ALICE_ID,
        publicKey: pubB64(alice),
        privateKeyEnc: "",
      },
      {
        id: "2",
        userId: BOB_ID,
        publicKey: pubB64(bobNew),
        privateKeyEnc: "",
      },
    ]);

    const resolver = vi.fn().mockResolvedValue("refuse");

    const result = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: BOB_ID, displayName: "Bob" }],
      {
        currentUserId: ALICE_ID,
        identity: alice,
        onKeyChange: resolver,
      },
    );

    expect(resolver).toHaveBeenCalledTimes(1);
    const call = resolver.mock.calls[0][0];
    expect(call.userId).toBe(BOB_ID);
    expect(call.knownKey).toBe(pubB64(bobOld));
    expect(call.newKey).toBe(pubB64(bobNew));

    expect(result.skippedMembers).toEqual([
      { id: BOB_ID, displayName: "Bob", reason: "key-mismatch-refused" },
    ]);

    const stored = filesHandle.current!.getFile(fileId);
    expect(stored.fileKeys).toHaveLength(1);
  });

  it("accepts Bob's new key when resolver returns 'accept', re-wraps DEK and updates TOFU pin", async () => {
    const alice = await generateIdentityKeyPair();
    const bobOld = await generateIdentityKeyPair();
    const bobNew = await generateIdentityKeyPair();
    const { fileId } = await setupRoomWithBobOldKeyPinned(alice, bobOld);

    accessHandle.current!.setRoomKeys(ROOM_ID, [
      {
        id: "1",
        userId: ALICE_ID,
        publicKey: pubB64(alice),
        privateKeyEnc: "",
      },
      {
        id: "2",
        userId: BOB_ID,
        publicKey: pubB64(bobNew),
        privateKeyEnc: "",
      },
    ]);

    const resolver = vi.fn().mockResolvedValue("accept");

    const result = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: BOB_ID, displayName: "Bob" }],
      {
        currentUserId: ALICE_ID,
        identity: alice,
        onKeyChange: resolver,
      },
    );

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(result.skippedMembers).toEqual([]);
    expect(result.fileResults).toEqual([{ fileId, success: true }]);

    const stored = filesHandle.current!.getFile(fileId);
    expect(stored.fileKeys).toHaveLength(2);
    const bobEntry = stored.fileKeys.find((k) => k.userId === BOB_ID)!;
    expect(bobEntry.privateKeyEnc.length).toBeGreaterThan(20);

    const tofu = getTofuStore(ALICE_ID);
    const recheckNew = await tofu.checkKey(BOB_ID, pubB64(bobNew));
    expect(recheckNew.kind).toBe("match");
    const recheckOld = await tofu.checkKey(BOB_ID, pubB64(bobOld));
    expect(recheckOld.kind).toBe("mismatch");
  });
});
