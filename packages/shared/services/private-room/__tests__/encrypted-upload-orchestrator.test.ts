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
import {
  getEncryptedUploadRefusalMessage,
  getEncryptedUploadRefusalNotice,
  orchestrateEncryptedUpload,
  uploadEncryptedFile,
} from "../encrypted-upload-orchestrator";
import {
  clearDeviceSetupHintHandler,
  registerDeviceSetupHintHandler,
} from "../../encryption/device-setup-hint-notifier";
import {
  getTofuStore,
  registerKeyMismatchHandler,
  resetTofuStores,
  unregisterKeyMismatchHandler,
} from "../../encryption/tofu-store";

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

  it("never sends the plaintext file name to the upload session", async () => {
    const { startUploadSession } = await import("../../../api/files");

    const file = makeFile("Secret quarterly report.docx", 128);
    await orchestrateEncryptedUpload({
      files: [file],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      userId: "user-1",
      publicKey: "base64pubkey==",
      publicKeyId: "key-1",
    });

    expect(startUploadSession).toHaveBeenCalledTimes(1);
    const args = vi.mocked(startUploadSession).mock.calls[0];

    expect(args[1]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.docx$/,
    );

    const serialized = JSON.stringify(args);
    expect(serialized).not.toContain("Secret quarterly report");
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

describe("orchestrateEncryptedUpload - batch gate", () => {
  const deviceSetupHint = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    registerDeviceSetupHintHandler(deviceSetupHint);
  });

  afterEach(() => {
    clearDeviceSetupHintHandler();
  });

  const gatedUpload = (keys: {
    publicKey: string | null;
    requireIdentity: () => Promise<unknown>;
  }) => {
    const markRefused = vi.fn();
    const result = orchestrateEncryptedUpload({
      files: [makeFile("one.docx", 16), makeFile("two.docx", 16)],
      uploadIds: ["row-1", "row-2"],
      folderId: 1,
      roomId: 10,
      userId: "user-1",
      publicKey: keys.publicKey,
      publicKeyId: keys.publicKey ? "key-1" : null,
      requireIdentity: keys.requireIdentity as never,
      uploadStore: { files: [], markRefused },
    });
    return { result, markRefused };
  };

  it("Uploader without a key: the rows fail before any byte is sent and the device-setup hint is requested", async () => {
    const { startUploadSession } = await import("../../../api/files");
    const requireIdentity = vi.fn();

    const { result, markRefused } = gatedUpload({
      publicKey: null,
      requireIdentity,
    });

    expect(await result).toMatchObject({
      refused: "no-key",
      results: [
        { ok: false, uploadId: "row-1", refused: "no-key" },
        { ok: false, uploadId: "row-2", refused: "no-key" },
      ],
    });
    expect(markRefused.mock.calls).toEqual([
      ["row-1", "no-key"],
      ["row-2", "no-key"],
    ]);
    expect(requireIdentity).not.toHaveBeenCalled();
    expect(deviceSetupHint).toHaveBeenCalledTimes(1);
    expect(startUploadSession).not.toHaveBeenCalled();
  });

  it("Uploader declines to unlock: the rows fail as locked and nothing is sent", async () => {
    const { startUploadSession } = await import("../../../api/files");

    const { result, markRefused } = gatedUpload({
      publicKey: "pk-own",
      requireIdentity: async () => null,
    });

    expect((await result).refused).toBe("locked");
    expect(markRefused.mock.calls).toEqual([
      ["row-1", "locked"],
      ["row-2", "locked"],
    ]);
    expect(deviceSetupHint).not.toHaveBeenCalled();
    expect(startUploadSession).not.toHaveBeenCalled();
  });

  it("an unlocked uploader's files go out under the panel's ids", async () => {
    const reportProgress = vi.fn();

    const { results, refused } = await orchestrateEncryptedUpload({
      files: [makeFile("one.docx", 16)],
      uploadIds: ["row-1"],
      folderId: 1,
      roomId: 10,
      userId: "user-1",
      publicKey: "pk-own",
      publicKeyId: "key-1",
      requireIdentity: async () => makeIdentity() as never,
      uploadStore: { files: [], reportProgress },
    });

    expect(refused).toBeUndefined();
    expect(results).toMatchObject([{ ok: true, uploadId: "row-1" }]);
    expect(reportProgress).toHaveBeenCalledWith("row-1", expect.any(Number));
  });

  it("names the refusals with the client's keys", () => {
    const t = ((key: string) => key) as never;

    expect(getEncryptedUploadRefusalMessage(t, "no-key")).toBe(
      "Common:EncryptionKeysRequiredForUpload",
    );
    expect(getEncryptedUploadRefusalMessage(t, "locked")).toBe(
      "Common:EncryptionLockedUpload",
    );
    expect(getEncryptedUploadRefusalNotice(t, "locked")).toBe(
      "Common:EncryptionUploadCancelled",
    );
    expect(getEncryptedUploadRefusalNotice(t, "no-key")).toBeNull();
  });
});

describe("uploadEncryptedFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads one file under the caller's id, with no gate of its own", async () => {
    const { startUploadSession } = await import("../../../api/files");
    const reportProgress = vi.fn();

    const result = await uploadEncryptedFile(
      makeFile("one.docx", 16),
      {
        folderId: 1,
        roomId: 10,
        identity: makeIdentity() as never,
        userId: "user-1",
        publicKey: "pk-own",
        publicKeyId: "key-1",
        uploadStore: { files: [], reportProgress },
      },
      "row-9",
    );

    expect(result).toMatchObject({ ok: true, uploadId: "row-9" });
    expect(vi.mocked(startUploadSession).mock.calls[0][4]).toBe(true);
    expect(reportProgress).toHaveBeenCalledWith("row-9", expect.any(Number));
  });
});

describe("orchestrateEncryptedUpload - room fan-out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTofuStores();
    unregisterKeyMismatchHandler();
  });

  afterEach(() => {
    unregisterKeyMismatchHandler();
  });

  const upload = () =>
    orchestrateEncryptedUpload({
      files: [makeFile("doc.docx", 16)],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      userId: "user-1",
      publicKey: "pk-own",
      publicKeyId: "key-1",
    });

  it("Member key mismatch on upload: no wrap is written for a refused key and the file is still uploaded", async () => {
    const { getRoomEncryptionKeys } = await import("../../../api/privacy");
    const { wrapDekForRecipients } = await import(
      "../../encryption/room-file-access"
    );
    await getTofuStore("user-1").checkKey("bob", "pk-b-pinned");
    const handler = vi.fn(async () => "refuse" as const);
    registerKeyMismatchHandler(handler);
    vi.mocked(getRoomEncryptionKeys).mockResolvedValueOnce([
      { id: "a-1", userId: "alice", publicKey: "pk-a", privateKeyEnc: "", date: "2026-01-01T00:00:00" },
      { id: "b-2", userId: "bob", publicKey: "pk-b-swapped", privateKeyEnc: "", date: "2026-01-01T00:00:00" },
    ] as never);

    const { results } = await upload();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(results[0].ok).toBe(true);
    expect(results[0].skippedMembers).toEqual([
      { userId: "bob", displayName: undefined, reason: "key-mismatch-refused" },
    ]);
    const fanOut = vi.mocked(wrapDekForRecipients).mock.calls[1][0];
    expect(fanOut.recipients.map((r) => r.userId)).toEqual(["alice"]);
  });

  it("asks once per refused key change across the files of one call", async () => {
    const { getRoomEncryptionKeys } = await import("../../../api/privacy");
    await getTofuStore("user-1").checkKey("bob", "pk-b-pinned");
    const handler = vi.fn(async () => "refuse" as const);
    registerKeyMismatchHandler(handler);
    const swapped = [
      { id: "b-2", userId: "bob", publicKey: "pk-b-swapped", privateKeyEnc: "", date: "2026-01-01T00:00:00" },
    ] as never;
    vi.mocked(getRoomEncryptionKeys)
      .mockResolvedValueOnce(swapped)
      .mockResolvedValueOnce(swapped);

    const { results } = await orchestrateEncryptedUpload({
      files: [makeFile("one.docx", 16), makeFile("two.docx", 16)],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      userId: "user-1",
      publicKey: "pk-own",
      publicKeyId: "key-1",
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(results.map((r) => r.skippedMembers?.map((m) => m.userId))).toEqual([
      ["bob"],
      ["bob"],
    ]);
  });

  it("Member left out: the batch names the member once", async () => {
    const { getRoomEncryptionKeys } = await import("../../../api/privacy");
    await getTofuStore("user-1").checkKey("bob", "pk-b-pinned");
    registerKeyMismatchHandler(vi.fn(async () => "refuse" as const));
    const swapped = [
      { id: "b-2", userId: "bob", publicKey: "pk-b-swapped", privateKeyEnc: "", date: "2026-01-01T00:00:00" },
    ] as never;
    vi.mocked(getRoomEncryptionKeys)
      .mockResolvedValueOnce(swapped)
      .mockResolvedValueOnce(swapped);

    const { results, skippedMembers } = await orchestrateEncryptedUpload({
      files: [makeFile("one.docx", 16), makeFile("two.docx", 16)],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      userId: "user-1",
      publicKey: "pk-own",
      publicKeyId: "key-1",
    });

    expect(results.every((r) => r.ok)).toBe(true);
    expect(skippedMembers).toEqual([
      { userId: "bob", displayName: undefined, reason: "key-mismatch-refused" },
    ]);
  });

  it("Unpinned member at upload: the key is pinned and the wrap is produced", async () => {
    const { getRoomEncryptionKeys } = await import("../../../api/privacy");
    const { wrapDekForRecipients } = await import(
      "../../encryption/room-file-access"
    );
    vi.mocked(getRoomEncryptionKeys).mockResolvedValueOnce([
      { id: "a-1", userId: "alice", publicKey: "pk-a", privateKeyEnc: "", date: "2026-01-01T00:00:00" },
    ] as never);

    const { results } = await upload();

    expect(results[0].skippedMembers).toBeUndefined();
    const fanOut = vi.mocked(wrapDekForRecipients).mock.calls[1][0];
    expect(fanOut.recipients.map((r) => r.userId)).toEqual(["alice"]);
    const pinned = await getTofuStore("user-1").getKeys("alice");
    expect(pinned.map((k) => k.publicKey)).toEqual(["pk-a"]);
  });

  it("Member with two keys on the server: one recipient per member, for the selected key", async () => {
    const { getRoomEncryptionKeys } = await import("../../../api/privacy");
    const { wrapDekForRecipients } = await import(
      "../../encryption/room-file-access"
    );
    vi.mocked(getRoomEncryptionKeys).mockResolvedValueOnce([
      { id: "key-1", userId: "user-1", publicKey: "pk-own", privateKeyEnc: "", date: "2026-01-01T00:00:00" },
      { id: "a-old", userId: "alice", publicKey: "pk-a-old", privateKeyEnc: "", date: "2026-01-01T00:00:00" },
      { id: "a-new", userId: "alice", publicKey: "pk-a-new", privateKeyEnc: "", date: "2026-10-01T00:00:00" },
      { id: "b-1", userId: "bob", publicKey: "pk-b", privateKeyEnc: "", date: "2026-03-01T00:00:00" },
    ] as never);

    await orchestrateEncryptedUpload({
      files: [makeFile("doc.docx", 16)],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      userId: "user-1",
      publicKey: "pk-own",
      publicKeyId: "key-1",
    });

    const fanOut = vi.mocked(wrapDekForRecipients).mock.calls[1][0];
    expect(fanOut.recipients).toEqual([
      { userId: "alice", publicKey: "pk-a-new", publicKeyId: "a-new" },
      { userId: "bob", publicKey: "pk-b", publicKeyId: "b-1" },
    ]);
  });
});
