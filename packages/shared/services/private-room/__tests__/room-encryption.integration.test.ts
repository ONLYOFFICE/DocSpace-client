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

import { generateIdentityKeyPair } from "../../encryption/identity";
import { generateDEK } from "../../encryption/file-keys";
import { wrapDekForRecipients } from "../../encryption/room-file-access";
import { resetTofuStores } from "../../encryption/tofu-store";
import { arrayBufferToBase64 } from "../../encryption/utils";
import type {
  IdentityKeyPair,
  ServerAccessKeyDto,
} from "../../encryption/types";

import {
  addMembersToEncryptedRoom,
  revokeMemberFromEncryptedRoom,
} from "../room-encryption";

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
    handle: filesHandle,
  }),
  ...privacyroomAccessHandlers(PORT, {
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

describe("revokeMemberFromEncryptedRoom — integration via MSW", () => {
  it("removes the revoked member from every file's ACL", async () => {
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
    expect(stored.fileKeys).toHaveLength(1);
    expect(stored.fileKeys[0].userId).toBe(ALICE_ID);

    const puts = filesHandle.current!
      .getRequests()
      .filter((r) => r.method === "PUT");
    expect(puts).toHaveLength(1);
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
