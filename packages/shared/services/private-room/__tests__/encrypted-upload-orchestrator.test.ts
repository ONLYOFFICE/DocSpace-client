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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AES_KEY_SIZE_BYTES } from "../../encryption/types";
import { orchestrateEncryptedUpload } from "../encrypted-upload-orchestrator";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("../../../api/files", () => ({
  startUploadSession: vi.fn().mockResolvedValue({ id: "session-1" }),
  uploadChunkSequential: vi.fn().mockResolvedValue({ data: { id: 42 } }),
  finalizeUploadSession: vi.fn().mockResolvedValue(undefined),
  getFileEncryptionAccess: vi
    .fn()
    .mockResolvedValue({ fileKeys: [] }),
  setFileEncryptionKeys: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../api/privacy", () => ({
  getRoomEncryptionKeys: vi.fn().mockResolvedValue([]),
}));

vi.mock("../../encryption/file-keys", () => ({
  encryptFile: vi.fn(
    async (
      _data: File | Blob | Uint8Array,
      opts: { onProgress?: (p: number) => void } = {},
    ) => {
      opts.onProgress?.(0.5);
      opts.onProgress?.(1);
      return {
        encryptedBlob: new Blob([new Uint8Array(64)]),
        dek: new Uint8Array(AES_KEY_SIZE_BYTES),
      };
    },
  ),
  wipeDek: vi.fn(),
  generateDEK: vi.fn(async () => new Uint8Array(AES_KEY_SIZE_BYTES)),
}));

vi.mock("../../encryption/room-file-access", () => ({
  wrapDekForRecipients: vi.fn().mockResolvedValue([
    { userId: "user-1", publicKeyId: "key-1", privateKeyEnc: "enc-data" },
  ]),
}));

vi.mock("../encryption/filename-cache", () => ({
  rememberEncryptedFilename: vi.fn(),
}));

vi.mock("../encrypted-filename-recovery", () => ({
  rememberEncryptedFilename: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFile(
  name: string,
  bytes: number,
  type = "application/octet-stream",
): File {
  return new File([new Uint8Array(bytes).fill(0x42)], name, { type });
}

function makeIdentity() {
  // Minimal identity-like object — wrapDekForRecipients is mocked so the
  // actual key material does not matter.
  return {
    privateKey: {} as CryptoKey,
    publicKey: new Uint8Array(32),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("orchestrateEncryptedUpload — setItemLabel (encrypting phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls setItemLabel('encrypting') before encryption and clears it after", async () => {
    const labelCalls: Array<[string, string | undefined]> = [];
    const setItemLabel = vi.fn((uid: string, label: string | undefined) => {
      labelCalls.push([uid, label]);
    });

    const file = makeFile("document.docx", 128);

    await orchestrateEncryptedUpload({
      files: [file],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      userId: "user-1",
      publicKey: "base64pubkey==",
      publicKeyId: "key-1",
      uploadStore: {
        files: [],
        setItemLabel,
      },
    });

    // At least two calls must have been made for a single file:
    //   1. setItemLabel(id, "encrypting")   — before encrypt
    //   2. setItemLabel(id, undefined)      — after encrypt (finally block)
    expect(setItemLabel).toHaveBeenCalledTimes(2);

    const [firstCall, secondCall] = labelCalls;
    // Both calls must target the same upload id.
    expect(firstCall[0]).toBe(secondCall[0]);
    // First call sets the "encrypting" phase marker.
    expect(firstCall[1]).toBe("encrypting");
    // Second call clears the label.
    expect(secondCall[1]).toBeUndefined();
  });

  it("clears the label even when encryption throws", async () => {
    const { encryptFile } = await import("../../encryption/file-keys");
    vi.mocked(encryptFile).mockRejectedValueOnce(new Error("crypto failure"));

    const setItemLabel = vi.fn();

    const file = makeFile("fail.txt", 32);
    await orchestrateEncryptedUpload({
      files: [file],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      userId: "user-1",
      publicKey: "base64pubkey==",
      publicKeyId: "key-1",
      uploadStore: {
        files: [],
        setItemLabel,
      },
      onFileError: vi.fn(),
    });

    // Both set and clear must still have been called.
    const calls = vi.mocked(setItemLabel).mock.calls as Array<
      [string, string | undefined]
    >;
    const setCall = calls.find(([, label]) => label === "encrypting");
    const clearCall = calls.find(([, label]) => label === undefined);
    expect(setCall).toBeDefined();
    expect(clearCall).toBeDefined();
  });

  it("does not throw when uploadStore is undefined (headless mode)", async () => {
    const file = makeFile("headless.txt", 16);
    const result = await orchestrateEncryptedUpload({
      files: [file],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      userId: "user-1",
      publicKey: "base64pubkey==",
      publicKeyId: "key-1",
      // No uploadStore — orchestrator must be headless-safe.
    });

    expect(result.aborted).toBe(false);
  });

  it("does not throw when setItemLabel is omitted from uploadStore", async () => {
    const file = makeFile("nolabel.txt", 16);
    const result = await orchestrateEncryptedUpload({
      files: [file],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      userId: "user-1",
      publicKey: "base64pubkey==",
      publicKeyId: "key-1",
      uploadStore: {
        files: [],
        // setItemLabel deliberately omitted
        reportProgress: vi.fn(),
      },
    });

    expect(result.aborted).toBe(false);
  });
});
