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
  type EncryptedFilesHandlerHandle,
} from "../../../__mocks__/handlers";

import { startUploadSession } from "../../../api/files";

import { generateIdentityKeyPair } from "../../encryption/identity";
import { encryptFile } from "../../encryption/file-keys";
import { wrapDekForRecipients } from "../../encryption/room-file-access";
import { isDSE3Format } from "../../encryption/streaming-encryption";
import { resetTofuStores } from "../../encryption/tofu-store";
import { arrayBufferToBase64 } from "../../encryption/utils";
import type { IdentityKeyPair } from "../../encryption/types";

import { downloadAndDecryptFile } from "../encrypted-download";

const PORT = "3000";
const ROOM_ID = 5500;
const ALICE_ID = "11111111-1111-1111-1111-111111111111";

function pubB64(kp: IdentityKeyPair): string {
  return arrayBufferToBase64(kp.publicKey.buffer as ArrayBuffer);
}

const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
  current: null,
};

const server = setupServer(
  ...encryptedFilesHandlers(PORT, {
    roomId: ROOM_ID,
    ownerId: ALICE_ID,
    handle: filesHandle,
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

function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

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
  resetTofuStores();
  // biome-ignore lint/suspicious/noExplicitAny: jsdom missing indexedDB
  (globalThis as any).indexedDB = mockIDB;
});

describe("encrypted upload — integration via MSW", () => {
  it("startUploadSession posts encrypted=true and returns a session id", async () => {
    const fileContent = new TextEncoder().encode(
      "Hello private room — this is secret content.",
    );

    const uploadFileName = "abc-uuid.txt";
    const { encryptedBlob } = await encryptFile(fileContent, {
      fileName: "report.txt",
    });

    const blobBytes = await blobToUint8Array(encryptedBlob);
    expect(isDSE3Format(blobBytes)).toBe(true);

    const session = await startUploadSession(
      ROOM_ID,
      uploadFileName,
      blobBytes.byteLength,
      "",
      true,
      new Date(),
      false,
    );

    const sessionRes = session as unknown as {
      id: string;
      bytes_total: number;
    };
    expect(sessionRes.id).toMatch(/^mock-session-/);
    expect(sessionRes.bytes_total).toBe(blobBytes.byteLength);

    const captured = filesHandle.current!
      .getRequests()
      .find((r) => r.method === "POST" && r.url.endsWith("/session"));
    expect(captured).toBeDefined();
    expect(
      (captured!.body as { encrypted: boolean; fileName: string }).encrypted,
    ).toBe(true);
    expect(
      (captured!.body as { encrypted: boolean; fileName: string }).fileName,
    ).toBe(uploadFileName);
  });
});

describe("encrypted download — integration via MSW", () => {
  it("downloads encrypted bytes and decrypts back to the original content", async () => {
    const alice = await generateIdentityKeyPair();
    const originalText = "Round-trip integration content.";
    const plainBytes = new TextEncoder().encode(originalText);

    const { encryptedBlob, dek } = await encryptFile(plainBytes, {
      fileName: "memo.txt",
    });
    const fileId = 7777;

    const wrapped = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      fileId,
    });

    const encryptedBytes = await blobToUint8Array(encryptedBlob);
    filesHandle.current!.setFiles([
      {
        id: fileId,
        title: "memo.txt",
        serverTitle: "abc-uuid.txt",
        size: plainBytes.byteLength,
        encrypted: true,
        fileKeys: wrapped,
        bytes: encryptedBytes,
      },
    ]);
    filesHandle.current!.setRoomUserKeys([
      {
        id: "1",
        userId: ALICE_ID,
        publicKey: pubB64(alice),
        privateKeyEnc: "",
        date: "2026-01-01T00:00:00.000Z",
        cryptoEngineId: "",
      },
    ]);

    const result = await downloadAndDecryptFile({
      downloadUrl: `http://localhost:${PORT}/api/2.0/files/file/${fileId}/download`,
      fileId,
      fileKeys: wrapped,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      userId: ALICE_ID,
      identity: alice,
      originalFileName: "abc-uuid.txt",
      originalFileType: "text/plain",
    });

    expect(result.success).toBe(true);
    expect(result.file).toBeDefined();
    expect(result.file!.name).toBe("memo.txt");

    const decryptedBytes = await blobToUint8Array(result.file!);
    const decryptedText = new TextDecoder().decode(decryptedBytes);
    expect(decryptedText).toBe(originalText);
  });

  it("returns success:false when the server rejects the download", async () => {
    const alice = await generateIdentityKeyPair();
    const dummyWrap = await wrapDekForRecipients({
      dek: new Uint8Array(32),
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      fileId: 9999,
    });

    const result = await downloadAndDecryptFile({
      downloadUrl: `http://localhost:${PORT}/api/2.0/files/file/9999/download`,
      fileId: 9999,
      fileKeys: dummyWrap,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      userId: ALICE_ID,
      identity: alice,
      originalFileName: "missing.txt",
      originalFileType: "text/plain",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/404|not found/i);
  });
});
