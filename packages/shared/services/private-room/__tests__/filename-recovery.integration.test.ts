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
  type EncryptedFilesHandlerHandle,
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

    await recoverEncryptedFilenames(
      [
        {
          id: fileId,
          viewUrl: `http://localhost:${PORT}/api/2.0/files/file/${fileId}/download`,
        },
      ],
      ALICE_ID,
      alice,
    );

    expect(getCachedEncryptedFilename(fileId)).toBe("from-cache.docx");

    const downloads = filesHandle.current!
      .getRequests()
      .filter((r) => r.url.endsWith(`/files/file/${fileId}/download`));
    expect(downloads).toHaveLength(0);
  });
});
