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
import { encryptFile } from "../../encryption/file-keys";
import { wrapDekForRecipients } from "../../encryption/room-file-access";
import { resetTofuStores } from "../../encryption/tofu-store";
import { arrayBufferToBase64 } from "../../encryption/utils";
import {
  getCachedEncryptedFilename,
  clearEncryptedFilenameCache,
} from "../../encryption/filename-cache";
import type { IdentityKeyPair } from "../../encryption/types";

import { recoverEncryptedFilenames } from "../encrypted-filename-recovery";

const PORT = "3000";
const ROOM_ID = 6600;
const ALICE_ID = "11111111-1111-1111-1111-111111111111";

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
  clearEncryptedFilenameCache();
  resetTofuStores();
  // biome-ignore lint/suspicious/noExplicitAny: jsdom missing indexedDB
  (globalThis as any).indexedDB = mockIDB;
});

describe("recoverEncryptedFilenames — integration via MSW", () => {
  it("decrypts and caches the original filename via Range fetch + access lookup", async () => {
    const alice = await generateIdentityKeyPair();

    const plain = new TextEncoder().encode("Body content for filename recovery.");
    const { encryptedBlob, dek } = await encryptFile(plain, {
      fileName: "quarterly-report.pdf",
    });

    const fileId = 8888;
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
        title: "quarterly-report.pdf",
        serverTitle: "obfuscated-uuid.pdf",
        size: plain.byteLength,
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
    accessHandle.current!.setRoomKeys(ROOM_ID, [
      {
        id: "1",
        userId: ALICE_ID,
        publicKey: pubB64(alice),
        privateKeyEnc: "",
      },
    ]);

    expect(getCachedEncryptedFilename(fileId)).toBeNull();

    await recoverEncryptedFilenames(
      [
        {
          id: fileId,
          viewUrl: `http://localhost:${PORT}/api/2.0/files/file/${fileId}/download`,
        },
      ],
      ALICE_ID,
      alice,
      ROOM_ID,
    );

    expect(getCachedEncryptedFilename(fileId)).toBe("quarterly-report.pdf");
  });

  it("skips files already in the filename cache", async () => {
    const alice = await generateIdentityKeyPair();

    const plain = new TextEncoder().encode("Anything");
    const { encryptedBlob, dek } = await encryptFile(plain, {
      fileName: "should-not-be-fetched.docx",
    });
    const fileId = 8889;
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
        title: "cached.docx",
        serverTitle: "obfuscated-uuid.docx",
        encrypted: true,
        fileKeys: wrapped,
        bytes: encryptedBytes,
      },
    ]);

    const { rememberEncryptedFilename } = await import(
      "../../encryption/filename-cache"
    );
    rememberEncryptedFilename(fileId, "from-cache.docx");

    accessHandle.current!.setRoomKeys(ROOM_ID, [
      {
        id: "1",
        userId: ALICE_ID,
        publicKey: pubB64(alice),
        privateKeyEnc: "",
      },
    ]);

    await recoverEncryptedFilenames(
      [
        {
          id: fileId,
          viewUrl: `http://localhost:${PORT}/api/2.0/files/file/${fileId}/download`,
        },
      ],
      ALICE_ID,
      alice,
      ROOM_ID,
    );

    expect(getCachedEncryptedFilename(fileId)).toBe("from-cache.docx");

    const downloads = filesHandle.current!
      .getRequests()
      .filter((r) => r.url.endsWith(`/files/file/${fileId}/download`));
    expect(downloads).toHaveLength(0);
  });
});
