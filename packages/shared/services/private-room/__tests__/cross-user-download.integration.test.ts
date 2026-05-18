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

import { getRoomEncryptionKeys } from "../../../api/privacy";
import { generateIdentityKeyPair } from "../../encryption/identity";
import { encryptFile } from "../../encryption/file-keys";
import { wrapDekForRecipients } from "../../encryption/room-file-access";
import { resetTofuStores } from "../../encryption/tofu-store";
import { arrayBufferToBase64 } from "../../encryption/utils";
import type { IdentityKeyPair } from "../../encryption/types";

import { downloadAndDecryptFile } from "../encrypted-download";

const PORT = "3000";
const ROOM_ID = 6700;
const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";

function pubB64(kp: IdentityKeyPair): string {
  return arrayBufferToBase64(kp.publicKey.buffer as ArrayBuffer);
}

function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
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

describe("download of file uploaded by another room member", () => {
  it("Bob decrypts a file Alice uploaded when roomMemberKeys include Alice's publicKey", async () => {
    const alice = await generateIdentityKeyPair();
    const bob = await generateIdentityKeyPair();

    const originalText = "Alice's secret memo for the team.";
    const plainBytes = new TextEncoder().encode(originalText);
    const { encryptedBlob, dek } = await encryptFile(plainBytes, {
      fileName: "team-memo.txt",
    });
    const fileId = 8801;

    const wrapped = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [
        { userId: ALICE_ID, publicKey: pubB64(alice) },
        { userId: BOB_ID, publicKey: pubB64(bob) },
      ],
      fileId,
    });

    const encryptedBytes = await blobToUint8Array(encryptedBlob);
    filesHandle.current!.setFiles([
      {
        id: fileId,
        title: "team-memo.txt",
        serverTitle: "obfuscated.txt",
        size: plainBytes.byteLength,
        encrypted: true,
        fileKeys: wrapped,
        bytes: encryptedBytes,
      },
    ]);

    // Server-side: /privacyroom/{roomId}/access returns ALL room members'
    // identity public keys. This is the source of truth for roomMemberKeys
    // during unwrap, not the per-user `userKeys` field on /files/{id}/access.
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      {
        id: "alice-1",
        userId: ALICE_ID,
        publicKey: pubB64(alice),
        privateKeyEnc: "",
      },
      {
        id: "bob-1",
        userId: BOB_ID,
        publicKey: pubB64(bob),
        privateKeyEnc: "",
      },
    ]);

    // This is the call client code now does (mirrors what
    // FilesActionsStore.loadRoomMemberKeysFor / encrypted-filename-recovery.
    // loadRoomMemberKeys do): fetch full room roster, pass to unwrap.
    const roomKeys = await getRoomEncryptionKeys(ROOM_ID);
    const roomMemberKeys = roomKeys
      .filter((k) => k.userId && k.publicKey)
      .map((k) => ({ userId: String(k.userId), publicKey: k.publicKey }));

    const result = await downloadAndDecryptFile({
      downloadUrl: `http://localhost:${PORT}/api/2.0/files/file/${fileId}/download`,
      fileId,
      fileKeys: wrapped,
      roomMemberKeys,
      userId: BOB_ID,
      identity: bob,
      originalFileName: "obfuscated.txt",
      originalFileType: "text/plain",
    });

    expect(result.success).toBe(true);
    expect(result.file).toBeDefined();
    const decryptedBytes = await blobToUint8Array(result.file!);
    expect(new TextDecoder().decode(decryptedBytes)).toBe(originalText);
  });

  it("regression: unwrap fails when roomMemberKeys omit the sender (mirrors the pre-fix bug)", async () => {
    const alice = await generateIdentityKeyPair();
    const bob = await generateIdentityKeyPair();

    const plainBytes = new TextEncoder().encode("Anything.");
    const { encryptedBlob, dek } = await encryptFile(plainBytes, {
      fileName: "secret.txt",
    });
    const fileId = 8802;

    const wrapped = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [
        { userId: ALICE_ID, publicKey: pubB64(alice) },
        { userId: BOB_ID, publicKey: pubB64(bob) },
      ],
      fileId,
    });

    const encryptedBytes = await blobToUint8Array(encryptedBlob);
    filesHandle.current!.setFiles([
      {
        id: fileId,
        title: "secret.txt",
        serverTitle: "obfuscated2.txt",
        size: plainBytes.byteLength,
        encrypted: true,
        fileKeys: wrapped,
        bytes: encryptedBytes,
      },
    ]);

    // The OLD buggy path passed `encryptionInfo.userKeys` here — which is the
    // CURRENT user's identity keys only. For Bob downloading Alice's file
    // this contains Bob's own keys, not Alice's. Unwrap can't find the sender.
    const bobOnlyKeys = [{ userId: BOB_ID, publicKey: pubB64(bob) }];

    const result = await downloadAndDecryptFile({
      downloadUrl: `http://localhost:${PORT}/api/2.0/files/file/${fileId}/download`,
      fileId,
      fileKeys: wrapped,
      roomMemberKeys: bobOnlyKeys,
      userId: BOB_ID,
      identity: bob,
      originalFileName: "obfuscated2.txt",
      originalFileType: "text/plain",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/sender|public key|access/i);
  });
});
