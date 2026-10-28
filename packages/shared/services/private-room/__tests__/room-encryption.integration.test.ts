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
} from "vitest";

import { setupServer } from "../../../__mocks__/e2e/msw-compat";
import {
  encryptedFilesHandlers,
  privacyroomAccessHandlers,
  type EncryptedFilesHandlerHandle,
  type PrivacyroomAccessHandlerHandle,
} from "../../../__mocks__/handlers";

import { getFileEncryptionAccess } from "../../../api/files";
import { generateIdentityKeyPair } from "../../encryption/identity";
import { generateDEK } from "../../encryption/file-keys";
import { inspectWrap } from "../../encryption/hpke";
import {
  unwrapDekForCurrentUser,
  wrapDekForRecipients,
} from "../../encryption/room-file-access";
import { getTofuStore, resetTofuStores } from "../../encryption/tofu-store";
import { arrayBufferToBase64 } from "../../encryption/utils";
import type {
  IdentityKeyPair,
  ServerAccessKeyDto,
} from "../../encryption/types";

import {
  addMembersToEncryptedRoom,
  backfillEncryptedFilesForRoomMembers,
  revokeMemberFromEncryptedRoom,
  rewrapMissingFilesForMember,
} from "../room-encryption";
import { loadFileSenderKeysSafe } from "../room-member-keys";
import {
  onMemberKeyTrusted,
  verifyMemberKey,
} from "../member-key-verification";
import { pendingAccessStore } from "../pending-access";
import { rewrapPendingAccessOfMember } from "../room-member-flows";

const PORT = "3000";
const ROOM_ID = 4242;
const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";
const CAROL_ID = "33333333-3333-3333-3333-333333333333";

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
    currentUserId: ALICE_ID,
    handle: filesHandle,
  }),
  ...privacyroomAccessHandlers(PORT, {
    userId: ALICE_ID,
    handle: accessHandle,
  }),
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

describe("addMembersToEncryptedRoom — integration via MSW", () => {
  let alice: IdentityKeyPair;
  let bob: IdentityKeyPair;

  beforeEach(async () => {
    alice = await generateIdentityKeyPair();
    bob = await generateIdentityKeyPair();
  });

  it("re-wraps DEK and PUTs ACL for each encrypted file in the room", async () => {
    const dek1 = generateDEK();
    const dek2 = generateDEK();
    const aliceWrap1 = await wrapDekForRecipients({
      dek: dek1,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      fileId: 101,
    });
    const aliceWrap2 = await wrapDekForRecipients({
      dek: dek2,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      fileId: 102,
    });

    filesHandle.current!.setFiles([
      {
        id: 101,
        title: "doc1.docx",
        serverTitle: "uuid-101.docx",
        encrypted: true,
        fileKeys: aliceWrap1,
      },
      {
        id: 102,
        title: "doc2.docx",
        serverTitle: "uuid-102.docx",
        encrypted: true,
        fileKeys: aliceWrap2,
      },
    ]);
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
        publicKey: pubB64(bob),
        privateKeyEnc: "",
      },
    ]);

    const result = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: BOB_ID, displayName: "Bob" }],
      { currentUserId: ALICE_ID, identity: alice },
    );

    expect(result.skippedMembers).toEqual([]);
    expect(result.fileResults).toEqual([
      { fileId: 101, success: true },
      { fileId: 102, success: true },
    ]);

    for (const fileId of [101, 102]) {
      const stored = filesHandle.current!.getFile(fileId);
      expect(stored.fileKeys).toHaveLength(2);
      const userIds = stored.fileKeys.map((k) => k.userId).sort();
      expect(userIds).toEqual([ALICE_ID, BOB_ID].sort());

      const bobEntry = stored.fileKeys.find((k) => k.userId === BOB_ID);
      expect(bobEntry?.privateKeyEnc).toBeTruthy();
      expect(bobEntry?.privateKeyEnc.length).toBeGreaterThan(20);
    }

    const puts = filesHandle.current!
      .getRequests()
      .filter((r) => r.method === "PUT");
    expect(puts).toHaveLength(2);
    expect(puts[0].url).toMatch(/\/files\/101\/access$/);
    expect(puts[1].url).toMatch(/\/files\/102\/access$/);
  });

  it("skips a member without a public key (no-key) and does not touch ACLs", async () => {
    const dek = generateDEK();
    const aliceWrap = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      fileId: 200,
    });

    filesHandle.current!.setFiles([
      {
        id: 200,
        title: "secret.docx",
        encrypted: true,
        fileKeys: aliceWrap,
      },
    ]);
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      {
        id: "1",
        userId: ALICE_ID,
        publicKey: pubB64(alice),
        privateKeyEnc: "",
      },
    ]);

    const result = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: CAROL_ID, displayName: "Carol" }],
      { currentUserId: ALICE_ID, identity: alice },
    );

    expect(result.skippedMembers).toEqual([
      { id: CAROL_ID, displayName: "Carol", reason: "no-key" },
    ]);
    const stored = filesHandle.current!.getFile(200);
    expect(stored.fileKeys).toHaveLength(1);
    expect(stored.fileKeys[0].userId).toBe(ALICE_ID);
    const puts = filesHandle.current!
      .getRequests()
      .filter((r) => r.method === "PUT");
    expect(puts).toHaveLength(0);
  });
});

describe("rewrapMissingFilesForMember — integration via MSW", () => {
  it("Retry succeeds: the member gets an entry for the named file only, and unwraps it", async () => {
    const alice = await generateIdentityKeyPair();
    const bob = await generateIdentityKeyPair();
    const dek1 = generateDEK();
    const dek2 = generateDEK();
    const aliceWrap = (dek: Uint8Array, fileId: number) =>
      wrapDekForRecipients({
        dek,
        senderIdentity: alice,
        senderUserId: ALICE_ID,
        recipients: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
        fileId,
      });

    filesHandle.current!.setFiles([
      {
        id: 101,
        title: "doc1.docx",
        serverTitle: "uuid-101.docx",
        encrypted: true,
        fileKeys: await aliceWrap(dek1, 101),
      },
      {
        id: 102,
        title: "doc2.docx",
        serverTitle: "uuid-102.docx",
        encrypted: true,
        fileKeys: await aliceWrap(dek2, 102),
      },
    ]);
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
        publicKey: pubB64(bob),
        privateKeyEnc: "",
      },
    ]);

    const result = await rewrapMissingFilesForMember(ROOM_ID, BOB_ID, [102], {
      currentUserId: ALICE_ID,
      identity: alice,
    });

    expect(result.fileResults).toEqual([{ fileId: 102, success: true }]);
    expect(result.missingFileIdsByMember).toEqual({});
    expect(
      filesHandle.current!.getFile(101).fileKeys.map((k) => k.userId),
    ).toEqual([ALICE_ID]);
    const stored = filesHandle.current!.getFile(102);
    expect(stored.fileKeys.map((k) => k.userId).sort()).toEqual(
      [ALICE_ID, BOB_ID].sort(),
    );

    const unwrapped = await unwrapDekForCurrentUser({
      fileKeys: stored.fileKeys,
      roomMemberKeys: [
        { userId: ALICE_ID, publicKey: pubB64(alice) },
        { userId: BOB_ID, publicKey: pubB64(bob) },
      ],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: 102,
    });
    expect(Array.from(unwrapped)).toEqual(Array.from(dek2));

    const puts = filesHandle.current!
      .getRequests()
      .filter((r) => r.method === "PUT");
    expect(puts).toHaveLength(1);
    expect(puts[0].url).toMatch(/\/files\/102\/access$/);
  });
});

describe("Trusting a changed key — integration via MSW", () => {
  it("Key trusted after a refusal: the member gets entries for the files they missed, and unwraps them", async () => {
    const alice = await generateIdentityKeyPair();
    const bobOld = await generateIdentityKeyPair();
    const bobNew = await generateIdentityKeyPair();
    const dek = generateDEK();
    await getTofuStore(ALICE_ID).checkKey(BOB_ID, pubB64(bobOld));

    // Uploaded while the changed key was refused: wrapped for the uploader only.
    filesHandle.current!.setFiles([
      {
        id: 101,
        title: "doc1.docx",
        serverTitle: "uuid-101.docx",
        encrypted: true,
        fileKeys: await wrapDekForRecipients({
          dek,
          senderIdentity: alice,
          senderUserId: ALICE_ID,
          recipients: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
          fileId: 101,
        }),
      },
    ]);
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      { id: "1", userId: ALICE_ID, publicKey: pubB64(alice), privateKeyEnc: "" },
      { id: "3", userId: BOB_ID, publicKey: pubB64(bobNew), privateKeyEnc: "" },
    ]);
    pendingAccessStore.addMissingFiles(ROOM_ID, BOB_ID, [101]);

    let rewrapped: Promise<unknown> = Promise.resolve();
    const unsubscribe = onMemberKeyTrusted((memberId, scopeUserId) => {
      rewrapped = rewrapPendingAccessOfMember({
        t: ((key: string) => key) as never,
        member: { id: memberId },
        currentUserId: scopeUserId,
        identity: alice,
      });
    });
    try {
      const verification = await verifyMemberKey({
        userId: BOB_ID,
        scopeUserId: ALICE_ID,
        publicKey: pubB64(bobNew),
        resolver: async () => "accept",
      });
      expect(verification.kind).toBe("ok");
      await rewrapped;
    } finally {
      unsubscribe();
    }

    const stored = filesHandle.current!.getFile(101);
    expect(stored.fileKeys.map((k) => k.userId).sort()).toEqual(
      [ALICE_ID, BOB_ID].sort(),
    );
    const unwrapped = await unwrapDekForCurrentUser({
      fileKeys: stored.fileKeys,
      roomMemberKeys: [
        { userId: ALICE_ID, publicKey: pubB64(alice) },
        { userId: BOB_ID, publicKey: pubB64(bobNew) },
      ],
      currentUserId: BOB_ID,
      currentIdentity: bobNew,
      fileId: 101,
    });
    expect(Array.from(unwrapped)).toEqual(Array.from(dek));
    expect(pendingAccessStore.get(ROOM_ID, BOB_ID)).toBeUndefined();
  });
});

describe("backfillEncryptedFilesForRoomMembers — integration via MSW", () => {
  it("Existing wraps are replaced: a second manager's sweep re-wraps a member, who still unwraps through the file's public keys", async () => {
    const alice = await generateIdentityKeyPair();
    const bob = await generateIdentityKeyPair();
    const carol = await generateIdentityKeyPair();
    const dek = generateDEK();
    const wrapsFromAlice = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [
        { userId: ALICE_ID, publicKey: pubB64(alice) },
        { userId: BOB_ID, publicKey: pubB64(bob) },
        { userId: CAROL_ID, publicKey: pubB64(carol) },
      ],
      fileId: 300,
    });
    filesHandle.current!.setFiles([
      { id: 300, title: "doc.docx", encrypted: true, fileKeys: wrapsFromAlice },
    ]);
    const memberKeys = [
      { id: "1", userId: ALICE_ID, publicKey: pubB64(alice) },
      { id: "2", userId: BOB_ID, publicKey: pubB64(bob) },
      { id: "3", userId: CAROL_ID, publicKey: pubB64(carol) },
    ].map((k) => ({
      ...k,
      privateKeyEnc: "",
      date: "2026-01-01T00:00:00",
      cryptoEngineId: "",
    }));
    filesHandle.current!.setRoomUserKeys(memberKeys);
    accessHandle.current!.setRoomKeys(ROOM_ID, memberKeys);

    filesHandle.current!.setCurrentUserId(CAROL_ID);
    accessHandle.current!.setCurrentUserId(CAROL_ID);
    const result = await backfillEncryptedFilesForRoomMembers(ROOM_ID, {
      currentUserId: CAROL_ID,
      identity: carol,
      onKeyChange: async () => "refuse",
    });

    expect(result.fileResults).toEqual([{ fileId: 300, success: true }]);
    expect(result.skippedMembers).toEqual([]);
    const stored = filesHandle.current!.getFile(300);
    expect(stored.fileKeys.map((k) => k.userId).sort()).toEqual(
      [ALICE_ID, BOB_ID, CAROL_ID].sort(),
    );
    const bobEntry = stored.fileKeys.find((k) => k.userId === BOB_ID)!;
    const bobEntryFromAlice = wrapsFromAlice.find((k) => k.userId === BOB_ID)!;
    expect(bobEntry.privateKeyEnc).not.toBe(bobEntryFromAlice.privateKeyEnc);
    expect(inspectWrap(bobEntry.privateKeyEnc).senderUserId).toBe(CAROL_ID);

    filesHandle.current!.setCurrentUserId(BOB_ID);
    accessHandle.current!.setCurrentUserId(BOB_ID);
    const bobInfo = await getFileEncryptionAccess(300);
    const senderKeys = await loadFileSenderKeysSafe(300, ROOM_ID);
    const unwrapped = await unwrapDekForCurrentUser({
      fileKeys: bobInfo.fileKeys,
      roomMemberKeys: senderKeys,
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: 300,
    });
    expect(Array.from(unwrapped)).toEqual(Array.from(dek));
  });
});

describe("revokeMemberFromEncryptedRoom — integration via MSW", () => {
  it("Revocation succeeds: the member's access entries remain stored on the server", async () => {
    const alice = await generateIdentityKeyPair();
    const bob = await generateIdentityKeyPair();
    const dek = generateDEK();
    const sharedWrap: ServerAccessKeyDto[] = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [
        { userId: ALICE_ID, publicKey: pubB64(alice) },
        { userId: BOB_ID, publicKey: pubB64(bob) },
      ],
      fileId: 300,
    });

    filesHandle.current!.setFiles([
      {
        id: 300,
        title: "shared.docx",
        encrypted: true,
        fileKeys: sharedWrap,
      },
    ]);

    const result = await revokeMemberFromEncryptedRoom(
      ROOM_ID,
      [BOB_ID],
      {},
    );

    expect(result).toEqual([{ fileId: 300, success: true }]);

    const stored = filesHandle.current!.getFile(300);
    expect(stored.fileKeys.map((k) => k.userId)).toEqual([ALICE_ID, BOB_ID]);

    const puts = filesHandle.current!
      .getRequests()
      .filter((r) => r.method === "PUT");
    expect(puts).toHaveLength(0);
  });

  it("is a no-op when the revoked user is not in the ACL", async () => {
    const alice = await generateIdentityKeyPair();
    const dek = generateDEK();
    const aliceWrap = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      fileId: 301,
    });

    filesHandle.current!.setFiles([
      { id: 301, title: "only-alice.docx", encrypted: true, fileKeys: aliceWrap },
    ]);

    const result = await revokeMemberFromEncryptedRoom(
      ROOM_ID,
      [BOB_ID],
      {},
    );

    expect(result).toEqual([{ fileId: 301, success: true }]);
    expect(filesHandle.current!.getFile(301).fileKeys).toHaveLength(1);

    const puts = filesHandle.current!
      .getRequests()
      .filter((r) => r.method === "PUT");
    expect(puts).toHaveLength(0);
  });
});
