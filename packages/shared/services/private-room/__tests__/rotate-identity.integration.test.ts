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
import {
  unwrapDekForCurrentUser,
  wrapDekForRecipients,
} from "../../encryption/room-file-access";
import { resetTofuStores } from "../../encryption/tofu-store";
import { arrayBufferToBase64 } from "../../encryption/utils";
import type { IdentityKeyPair } from "../../encryption/types";

import { rotateOwnIdentityForRoom } from "../room-encryption";

const PORT = "3000";
const ROOM_ID = 7777;
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

describe("rotateOwnIdentityForRoom — integration via MSW", () => {
  it("re-wraps own entry under new identity and leaves other members untouched", async () => {
    const aliceOld = await generateIdentityKeyPair();
    const aliceNew = await generateIdentityKeyPair();
    const bob = await generateIdentityKeyPair();
    const dek = generateDEK();

    const fileId = 555;

    const initialWraps = await wrapDekForRecipients({
      dek,
      senderIdentity: aliceOld,
      senderUserId: ALICE_ID,
      recipients: [
        { userId: ALICE_ID, publicKey: pubB64(aliceOld) },
        { userId: BOB_ID, publicKey: pubB64(bob) },
      ],
      fileId,
    });
    const aliceOldWrap = initialWraps.find((w) => w.userId === ALICE_ID)!;
    const bobWrap = initialWraps.find((w) => w.userId === BOB_ID)!;

    filesHandle.current!.setFiles([
      {
        id: fileId,
        title: "rotation-target.docx",
        encrypted: true,
        fileKeys: initialWraps,
      },
    ]);
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      {
        id: "1",
        userId: ALICE_ID,
        publicKey: pubB64(aliceOld),
        privateKeyEnc: "",
      },
      {
        id: "2",
        userId: BOB_ID,
        publicKey: pubB64(bob),
        privateKeyEnc: "",
      },
    ]);

    const result = await rotateOwnIdentityForRoom(ROOM_ID, {
      currentUserId: ALICE_ID,
      oldIdentity: aliceOld,
      newIdentity: aliceNew,
    });

    expect(result).toEqual([{ fileId, success: true }]);

    const stored = filesHandle.current!.getFile(fileId);
    expect(stored.fileKeys).toHaveLength(2);

    const aliceEntry = stored.fileKeys.find((k) => k.userId === ALICE_ID)!;
    const bobEntry = stored.fileKeys.find((k) => k.userId === BOB_ID)!;

    expect(aliceEntry.privateKeyEnc).not.toBe(aliceOldWrap.privateKeyEnc);
    expect(bobEntry.privateKeyEnc).toBe(bobWrap.privateKeyEnc);

    const recoveredDek = await unwrapDekForCurrentUser({
      fileKeys: stored.fileKeys,
      roomMemberKeys: [
        { userId: ALICE_ID, publicKey: pubB64(aliceNew) },
      ],
      currentUserId: ALICE_ID,
      currentIdentity: aliceNew,
      fileId,
    });
    expect(recoveredDek).toEqual(dek);

    const puts = filesHandle.current!
      .getRequests()
      .filter((r) => r.method === "PUT");
    expect(puts).toHaveLength(1);
    expect(puts[0].url).toMatch(/\/files\/555\/access$/);
  });

  it("reports failure when old identity cannot unwrap, leaves ACL intact", async () => {
    const aliceOld = await generateIdentityKeyPair();
    const aliceNew = await generateIdentityKeyPair();
    const aliceWrongOld = await generateIdentityKeyPair();
    const dek = generateDEK();
    const fileId = 556;

    const wrap = await wrapDekForRecipients({
      dek,
      senderIdentity: aliceOld,
      senderUserId: ALICE_ID,
      recipients: [{ userId: ALICE_ID, publicKey: pubB64(aliceOld) }],
      fileId,
    });

    filesHandle.current!.setFiles([
      {
        id: fileId,
        title: "wrong-key.docx",
        encrypted: true,
        fileKeys: wrap,
      },
    ]);
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      {
        id: "1",
        userId: ALICE_ID,
        publicKey: pubB64(aliceOld),
        privateKeyEnc: "",
      },
    ]);

    const result = await rotateOwnIdentityForRoom(ROOM_ID, {
      currentUserId: ALICE_ID,
      oldIdentity: aliceWrongOld,
      newIdentity: aliceNew,
    });

    expect(result[0].success).toBe(false);
    expect(result[0].fileId).toBe(fileId);

    const stored = filesHandle.current!.getFile(fileId);
    expect(stored.fileKeys[0].privateKeyEnc).toBe(wrap[0].privateKeyEnc);

    const puts = filesHandle.current!
      .getRequests()
      .filter((r) => r.method === "PUT");
    expect(puts).toHaveLength(0);
  });
});
