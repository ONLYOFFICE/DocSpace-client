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

import { generateIdentityKeyPair } from "../../encryption/identity";
import { generateDEK } from "../../encryption/file-keys";
import {
  unwrapDekForCurrentUser,
  wrapDekForRecipients,
} from "../../encryption/room-file-access";
import { getTofuStore, resetTofuStores } from "../../encryption/tofu-store";
import { arrayBufferToBase64 } from "../../encryption/utils";
import type { IdentityKeyPair } from "../../encryption/types";

import { rotateOwnIdentityForRoom } from "../room-encryption";

const PORT = "3000";
const ROOM_ID = 7777;
const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";
const ALICE_NEW_KEY_ID = "aaaaaaaa-0000-0000-0000-00000000000a";

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
      newPublicKeyId: ALICE_NEW_KEY_ID,
    });

    expect(result).toEqual([{ fileId, success: true }]);

    const stored = filesHandle.current!.getFile(fileId);
    expect(stored.fileKeys).toHaveLength(2);

    const aliceEntries = stored.fileKeys.filter((k) => k.userId === ALICE_ID);
    expect(aliceEntries).toHaveLength(1);
    expect(aliceEntries[0].publicKeyId).toBe(ALICE_NEW_KEY_ID);
    expect(aliceEntries[0].privateKeyEnc).not.toBe(aliceOldWrap.privateKeyEnc);

    const bobEntry = stored.fileKeys.find((k) => k.userId === BOB_ID)!;
    expect(bobEntry.privateKeyEnc).toBe(bobWrap.privateKeyEnc);

    const recoveredDek = await unwrapDekForCurrentUser({
      fileKeys: stored.fileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(aliceNew) }],
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

  it("skips files already carrying the new key's wrap (idempotent resume)", async () => {
    const aliceOld = await generateIdentityKeyPair();
    const aliceNew = await generateIdentityKeyPair();
    const dek = generateDEK();
    const fileId = 557;

    const oldWrap = await wrapDekForRecipients({
      dek,
      senderIdentity: aliceOld,
      senderUserId: ALICE_ID,
      recipients: [{ userId: ALICE_ID, publicKey: pubB64(aliceOld) }],
      fileId,
    });
    const newWrap = await wrapDekForRecipients({
      dek,
      senderIdentity: aliceNew,
      senderUserId: ALICE_ID,
      recipients: [
        {
          userId: ALICE_ID,
          publicKey: pubB64(aliceNew),
          publicKeyId: ALICE_NEW_KEY_ID,
        },
      ],
      fileId,
    });

    filesHandle.current!.setFiles([
      {
        id: fileId,
        title: "already-rotated.docx",
        encrypted: true,
        fileKeys: [...oldWrap, ...newWrap],
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
      oldIdentity: aliceOld,
      newIdentity: aliceNew,
      newPublicKeyId: ALICE_NEW_KEY_ID,
    });

    expect(result).toEqual([{ fileId, success: true, skipped: true }]);

    const puts = filesHandle.current!
      .getRequests()
      .filter((r) => r.method === "PUT");
    expect(puts).toHaveLength(0);
  });

  it("pins new identity to TOFU up front (proof-of-possession)", async () => {
    const aliceOld = await generateIdentityKeyPair();
    const aliceNew = await generateIdentityKeyPair();
    const dek = generateDEK();

    const fileIds = [601, 602];

    const wraps = await Promise.all(
      fileIds.map((fileId) =>
        wrapDekForRecipients({
          dek,
          senderIdentity: aliceOld,
          senderUserId: ALICE_ID,
          recipients: [{ userId: ALICE_ID, publicKey: pubB64(aliceOld) }],
          fileId,
        }),
      ),
    );

    filesHandle.current!.setFiles(
      fileIds.map((id, idx) => ({
        id,
        title: `file-${id}.docx`,
        encrypted: true,
        fileKeys: wraps[idx],
      })),
    );
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
      oldIdentity: aliceOld,
      newIdentity: aliceNew,
      newPublicKeyId: ALICE_NEW_KEY_ID,
    });

    expect(result).toEqual([
      { fileId: 601, success: true },
      { fileId: 602, success: true },
    ]);

    const tofuResult = await getTofuStore(ALICE_ID).checkKey(
      ALICE_ID,
      pubB64(aliceNew),
    );
    expect(tofuResult.kind).toBe("match");
  });

  it("pins new identity to TOFU even when a file fails (additive wraps keep the old key usable)", async () => {
    const aliceOld = await generateIdentityKeyPair();
    const aliceNew = await generateIdentityKeyPair();
    const aliceOther = await generateIdentityKeyPair();
    const dek = generateDEK();

    const goodFileId = 701;
    const badFileId = 702;

    const goodWrap = await wrapDekForRecipients({
      dek,
      senderIdentity: aliceOld,
      senderUserId: ALICE_ID,
      recipients: [{ userId: ALICE_ID, publicKey: pubB64(aliceOld) }],
      fileId: goodFileId,
    });

    const badWrap = await wrapDekForRecipients({
      dek,
      senderIdentity: aliceOld,
      senderUserId: ALICE_ID,
      recipients: [{ userId: ALICE_ID, publicKey: pubB64(aliceOther) }],
      fileId: badFileId,
    });

    filesHandle.current!.setFiles([
      {
        id: goodFileId,
        title: "good.docx",
        encrypted: true,
        fileKeys: goodWrap,
      },
      {
        id: badFileId,
        title: "bad.docx",
        encrypted: true,
        fileKeys: badWrap,
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
      oldIdentity: aliceOld,
      newIdentity: aliceNew,
      newPublicKeyId: ALICE_NEW_KEY_ID,
    });

    expect(result.find((r) => r.fileId === goodFileId)!.success).toBe(true);
    expect(result.find((r) => r.fileId === badFileId)!.success).toBe(false);

    const tofuResult = await getTofuStore(ALICE_ID).checkKey(
      ALICE_ID,
      pubB64(aliceNew),
    );
    expect(tofuResult.kind).toBe("match");

    const puts = filesHandle.current!
      .getRequests()
      .filter((r) => r.method === "PUT");
    expect(puts).toHaveLength(1);
    expect(puts[0].url).toMatch(new RegExp(`/files/${goodFileId}/access$`));
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
      newPublicKeyId: ALICE_NEW_KEY_ID,
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
