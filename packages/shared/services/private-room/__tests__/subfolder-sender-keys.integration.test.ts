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
 * source code, which remains licensed under the GNU AGPL version 3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

import { setupServer } from "../../../__mocks__/e2e/msw-compat";
import {
  encryptedFilesHandlers,
  privacyroomAccessHandlers,
  type EncryptedFilesHandlerHandle,
  type PrivacyroomAccessHandlerHandle,
} from "../../../__mocks__/handlers";

import { generateIdentityKeyPair } from "../../encryption/identity";
import { encryptFile } from "../../encryption/file-keys";
import {
  unwrapDekForCurrentUser,
  wrapDekForRecipients,
} from "../../encryption/room-file-access";
import { resetTofuStores } from "../../encryption/tofu-store";
import { arrayBufferToBase64 } from "../../encryption/utils";
import type { IdentityKeyPair } from "../../encryption/types";

import {
  loadFileSenderKeysSafe,
  loadRoomMemberKeysSafe,
} from "../room-member-keys";

// Bug 82882: a file created in a FOLDER inside a private room did not open.
// The editor resolved the room id by falling back to the file's folderId, so
// for a subfolder it asked /privacyroom/{folderId}/access, got nothing back
// (400 on the real server, [] here) and unwrap had no sender public key to
// verify the wrap against: "wrap claims sender ... but no public key was
// provided". The file-scoped /files/file/{id}/publickeys needs no room id.

const PORT = "3000";
const ROOM_ID = 4909959;
const FOLDER_ID = 4909823; // a folder inside ROOM_ID, as sent in the bug report
const FILE_ID = 2624011;
const ALICE_ID = "b624a0ad-af90-4550-97f3-61cb50cf4dd1";
const BOB_ID = "22222222-2222-2222-2222-222222222222";

const pubB64 = (kp: IdentityKeyPair): string =>
  arrayBufferToBase64(kp.publicKey.buffer as ArrayBuffer);

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

class MockOpenRequest {
  // biome-ignore lint/suspicious/noExplicitAny: shim
  result: any = null;
  error: Error | null = null;
  onupgradeneeded: (() => void) | null = null;
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;
}
const mockIDB = {
  open: () => {
    const req = new MockOpenRequest();
    queueMicrotask(() => {
      req.error = new Error("test: IDB disabled");
      req.onerror?.();
    });
    return req;
  },
} as unknown as IDBFactory;

beforeAll(() => {
  (window as unknown as { ClientConfig: unknown }).ClientConfig = {
    api: { origin: "", prefix: "/api/2.0", timeout: 30000 },
    proxy: { url: "" },
  };
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => server.close());

beforeEach(() => {
  filesHandle.current?.reset();
  accessHandle.current?.reset();
  resetTofuStores();
  // biome-ignore lint/suspicious/noExplicitAny: jsdom missing indexedDB
  (globalThis as any).indexedDB = mockIDB;
});

/** Alice uploads a file into a subfolder and wraps its DEK for herself + Bob. */
const seedFileFromAlice = async () => {
  const alice = await generateIdentityKeyPair();
  const bob = await generateIdentityKeyPair();

  const plainBytes = new TextEncoder().encode("Created inside a subfolder.");
  const { dek } = await encryptFile(plainBytes, { fileName: "nested.docx" });

  const fileKeys = await wrapDekForRecipients({
    dek,
    senderIdentity: alice,
    senderUserId: ALICE_ID,
    recipients: [
      { userId: ALICE_ID, publicKey: pubB64(alice) },
      { userId: BOB_ID, publicKey: pubB64(bob) },
    ],
    fileId: FILE_ID,
  });

  filesHandle.current!.setFiles([
    {
      id: FILE_ID,
      title: "nested.docx",
      serverTitle: "obfuscated.docx",
      size: plainBytes.byteLength,
      encrypted: true,
      fileKeys,
    },
  ]);

  return { alice, bob, dek, fileKeys };
};

const memberKey = (id: string, userId: string, publicKey: string) => ({
  id,
  userId,
  publicKey,
  privateKeyEnc: "",
  date: "",
  cryptoEngineId: "",
});

describe("opening an encrypted file when only its folder id is known (bug 82882)", () => {
  it("cannot find the sender through the room roster of a folder id", async () => {
    const { bob, fileKeys } = await seedFileFromAlice();

    // the room roster does exist, but under the ROOM id
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      memberKey("alice-1", ALICE_ID, "unused-in-this-case"),
    ]);

    const roomMemberKeys = await loadRoomMemberKeysSafe(FOLDER_ID);
    expect(roomMemberKeys).toEqual([]);

    await expect(
      unwrapDekForCurrentUser({
        fileKeys,
        roomMemberKeys,
        currentUserId: BOB_ID,
        currentIdentity: bob,
        fileId: FILE_ID,
      }),
    ).rejects.toThrow(/no public key was provided/);
  });

  it("resolves the sender from the file itself, with no room id at all", async () => {
    const { alice, bob, dek, fileKeys } = await seedFileFromAlice();

    filesHandle.current!.setRoomUserKeys([
      memberKey("alice-1", ALICE_ID, pubB64(alice)),
      memberKey("bob-1", BOB_ID, pubB64(bob)),
    ]);

    const senderKeys = await loadFileSenderKeysSafe(FILE_ID, FOLDER_ID);

    const unwrapped = await unwrapDekForCurrentUser({
      fileKeys,
      roomMemberKeys: senderKeys,
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    expect(Array.from(unwrapped)).toEqual(Array.from(dek));
  });

  it("still honours the room roster when a real room id is known", async () => {
    const { alice, bob, dek, fileKeys } = await seedFileFromAlice();

    // the file-scoped source is empty here, so the room roster must carry it
    filesHandle.current!.setRoomUserKeys([]);
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      memberKey("alice-1", ALICE_ID, pubB64(alice)),
    ]);

    const senderKeys = await loadFileSenderKeysSafe(FILE_ID, ROOM_ID);

    const unwrapped = await unwrapDekForCurrentUser({
      fileKeys,
      roomMemberKeys: senderKeys,
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    expect(Array.from(unwrapped)).toEqual(Array.from(dek));
  });

  it("does not repeat a key that both sources report", async () => {
    const { alice, bob } = await seedFileFromAlice();

    filesHandle.current!.setRoomUserKeys([
      memberKey("alice-1", ALICE_ID, pubB64(alice)),
      memberKey("bob-1", BOB_ID, pubB64(bob)),
    ]);
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      memberKey("alice-1", ALICE_ID, pubB64(alice)),
    ]);

    const senderKeys = await loadFileSenderKeysSafe(FILE_ID, ROOM_ID);

    const alicesKeys = senderKeys.filter((k) => k.userId === ALICE_ID);
    expect(alicesKeys).toHaveLength(1);
  });
});
