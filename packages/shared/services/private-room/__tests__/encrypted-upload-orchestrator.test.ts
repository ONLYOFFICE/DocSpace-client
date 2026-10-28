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
  EncryptedWrapError,
  getEncryptedUploadErrorMessage,
  getEncryptedUploadRefusalMessage,
  getEncryptedUploadRefusalNotice,
  orchestrateEncryptedUpload,
  retryEncryptedUploads,
  uploadEncryptedFile,
} from "../encrypted-upload-orchestrator";
import {
  EncryptedReimportError,
  recoverDekForReimport,
  sniffDse3Upload,
} from "../encrypted-upload";
import { listDecryptedFileNames } from "../encrypted-name-clash";
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
import { pendingAccessStore } from "../pending-access";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("../../../api/files", () => ({
  startUploadSession: vi.fn().mockResolvedValue({ id: "session-1" }),
  uploadChunkSequential: vi.fn().mockResolvedValue({ data: { id: 42 } }),
  uploadChunkParallel: vi.fn().mockResolvedValue({ id: 0 }),
  finalizeUploadSession: vi.fn().mockResolvedValue(undefined),
  abortUploadSession: vi.fn().mockResolvedValue(undefined),
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

vi.mock("../encrypted-upload", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  sniffDse3Upload: vi.fn(async () => null),
  recoverDekForReimport: vi.fn(),
}));

vi.mock("../encrypted-name-clash", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  listDecryptedFileNames: vi.fn(async () => []),
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

describe("orchestrateEncryptedUpload - batch rules", () => {
  const KEYS = { userId: "user-1", publicKey: "pk-own", publicKeyId: "key-1" };
  const t = ((key: string) => key) as never;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Quota exceeded mid-batch: the files not started fail as quota failures", async () => {
    const { startUploadSession } = await import("../../../api/files");
    const quota = Object.assign(new Error("Quota exceeded"), {
      response: { status: 507 },
    });
    vi.mocked(startUploadSession)
      .mockResolvedValueOnce({ id: "session-1" } as never)
      .mockRejectedValueOnce(quota);
    const markQuotaError = vi.fn();
    const onQuotaError = vi.fn();

    const { results, quotaErrorRaised } = await orchestrateEncryptedUpload({
      files: [
        makeFile("a.docx", 16),
        makeFile("b.docx", 16),
        makeFile("c.docx", 16),
      ],
      uploadIds: ["row-1", "row-2", "row-3"],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      ...KEYS,
      uploadStore: { files: [], markQuotaError },
      onQuotaError,
    });

    expect(startUploadSession).toHaveBeenCalledTimes(2);
    expect(results.map((r) => r.ok)).toEqual([true, false, false]);
    expect(markQuotaError.mock.calls).toEqual([
      ["row-2", quota],
      ["row-3", quota],
    ]);
    expect(onQuotaError).toHaveBeenCalledTimes(1);
    expect(quotaErrorRaised).toBe(true);
  });

  it("Retry after navigation: the file goes to the folder it was first queued for, after the unlock prompt", async () => {
    const { startUploadSession } = await import("../../../api/files");
    const requireIdentity = vi.fn(async () => makeIdentity() as never);

    const { results } = await retryEncryptedUploads({
      items: [
        { file: makeFile("b.docx", 16), uploadId: "row-2", folderId: 5, roomId: 10 },
      ],
      ...KEYS,
      requireIdentity,
    });

    expect(requireIdentity).toHaveBeenCalledTimes(1);
    expect(vi.mocked(startUploadSession).mock.calls[0][0]).toBe(5);
    expect(vi.mocked(startUploadSession).mock.calls[0][4]).toBe(true);
    expect(results).toMatchObject([{ ok: true, uploadId: "row-2" }]);
  });

  it("Ciphertext re-uploaded: the file goes as it is, under its recovered key and name", async () => {
    const { startUploadSession, uploadChunkSequential } = await import(
      "../../../api/files"
    );
    const { encryptFile } = await import("../../encryption/file-keys");
    const { wrapDekForRecipients } = await import(
      "../../encryption/room-file-access"
    );
    const dek = new Uint8Array(AES_KEY_SIZE_BYTES).fill(7);
    vi.mocked(sniffDse3Upload).mockResolvedValueOnce({} as never);
    vi.mocked(recoverDekForReimport).mockResolvedValueOnce({
      dek,
      realName: "Report.docx",
      sourceFileId: 77,
    });
    const downloaded = makeFile("5f0c9a52-2f7b-4f43-9a8e-0d1c2b3a4f51.docx", 48);

    const { results } = await orchestrateEncryptedUpload({
      files: [downloaded],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      ...KEYS,
    });

    expect(results).toMatchObject([{ ok: true, originalName: "Report.docx" }]);
    expect(encryptFile).not.toHaveBeenCalled();
    const [, uploadName, size, , encrypted] =
      vi.mocked(startUploadSession).mock.calls[0];
    expect(uploadName).not.toBe(downloaded.name);
    expect(uploadName).toMatch(/\.docx$/);
    expect([size, encrypted]).toEqual([48, true]);
    const form = vi.mocked(uploadChunkSequential).mock.calls[0][2] as FormData;
    expect((form.get("file") as Blob).size).toBe(48);
    expect(vi.mocked(wrapDekForRecipients).mock.calls[0][0]).toMatchObject({
      dek,
    });
  });

  it("Ciphertext re-uploaded without a recoverable key: nothing is sent and the row names the re-import failure", async () => {
    const { startUploadSession } = await import("../../../api/files");
    vi.mocked(sniffDse3Upload).mockResolvedValueOnce({} as never);
    vi.mocked(recoverDekForReimport).mockRejectedValueOnce(
      new EncryptedReimportError("no source file decrypts the blob"),
    );

    const { results } = await orchestrateEncryptedUpload({
      files: [makeFile("5f0c9a52-2f7b-4f43-9a8e-0d1c2b3a4f51.docx", 48)],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      ...KEYS,
    });

    expect(startUploadSession).not.toHaveBeenCalled();
    expect(results[0].ok).toBe(false);
    expect(getEncryptedUploadErrorMessage(t, results[0].error)).toBe(
      "Common:EncryptionReimportFailed",
    );
    expect(getEncryptedUploadErrorMessage(t, new Error("network"))).toBe(
      "Common:EncryptionPrepareFailed",
    );
  });

  it("Upload with a clashing name: asked before any byte is sent; the kept file takes the first free suffix", async () => {
    const { startUploadSession } = await import("../../../api/files");
    const { encryptFile } = await import("../../encryption/file-keys");
    vi.mocked(listDecryptedFileNames).mockResolvedValueOnce([
      "Report.docx",
      "Report (1).docx",
    ]);
    let sessionsAtPrompt = -1;
    const onNameClash = vi.fn(async () => {
      sessionsAtPrompt = vi.mocked(startUploadSession).mock.calls.length;
      return true;
    });

    const { results } = await orchestrateEncryptedUpload({
      files: [makeFile("Report.docx", 16), makeFile("notes.txt", 16)],
      uploadIds: ["row-1", "row-2"],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      ...KEYS,
      onNameClash,
    });

    expect(onNameClash).toHaveBeenCalledWith([
      { uploadId: "row-1", file: expect.any(File), renamed: "Report (2).docx" },
    ]);
    expect(sessionsAtPrompt).toBe(0);
    expect(
      vi.mocked(encryptFile).mock.calls.map(([, opts]) => opts?.fileName),
    ).toEqual(["Report (2).docx", "notes.txt"]);
    expect(results.map((r) => r.originalName)).toEqual([
      "Report (2).docx",
      "notes.txt",
    ]);
  });

  it("Upload with a clashing name, cancelled: nothing is sent", async () => {
    const { startUploadSession } = await import("../../../api/files");
    vi.mocked(listDecryptedFileNames).mockResolvedValueOnce(["Report.docx"]);

    const { results, aborted } = await orchestrateEncryptedUpload({
      files: [makeFile("Report.docx", 16), makeFile("notes.txt", 16)],
      folderId: 1,
      roomId: 10,
      identity: makeIdentity() as never,
      ...KEYS,
      onNameClash: async () => false,
    });

    expect(startUploadSession).not.toHaveBeenCalled();
    expect(aborted).toBe(true);
    expect(results.every((r) => r.aborted)).toBe(true);
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

describe("uploadEncryptedFile for a caller with its own queue", () => {
  const ARGS = {
    folderId: 1,
    roomId: 10,
    identity: makeIdentity() as never,
    userId: "user-1",
    publicKey: "pk-own",
    publicKeyId: "key-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the parts as numbered chunks in parallel and answers the stored file and its path", async () => {
    const api = await import("../../../api/files");
    const stored = { id: 42, title: "5f0c9a52.docx", folderId: 1 };
    vi.mocked(api.startUploadSession).mockResolvedValueOnce({
      id: "session-1",
      path: [2, 10, 1],
    } as never);
    vi.mocked(api.finalizeUploadSession).mockResolvedValueOnce({
      id: 42,
      uploaded: true,
      file: stored,
    } as never);
    const reportProgress = vi.fn();

    const result = await uploadEncryptedFile(
      makeFile("doc.docx", 16),
      {
        ...ARGS,
        chunkSize: 24,
        uploadThreads: 2,
        uploadStore: { files: [], reportProgress },
      },
      "row-1",
    );

    expect(result).toMatchObject({
      ok: true,
      fileId: 42,
      file: stored,
      path: [2, 10, 1],
    });
    const parts = vi.mocked(api.uploadChunkParallel).mock.calls;
    expect(parts.map((call) => call[2]).sort()).toEqual([1, 2, 3]);
    expect(api.uploadChunkSequential).not.toHaveBeenCalled();
    expect(api.finalizeUploadSession).toHaveBeenCalledTimes(1);
    expect(reportProgress).toHaveBeenLastCalledWith("row-1", 100);
  });

  it("reports the encryption progress and names the stage a failure stopped at", async () => {
    const api = await import("../../../api/files");
    const { wipeDek } = await import("../../encryption/file-keys");
    vi.mocked(api.startUploadSession).mockRejectedValueOnce(
      new Error("session down"),
    );
    const reportEncryptionProgress = vi.fn();

    const result = await uploadEncryptedFile(
      makeFile("doc.docx", 16),
      { ...ARGS, uploadStore: { files: [], reportEncryptionProgress } },
      "row-1",
    );

    expect(reportEncryptionProgress).toHaveBeenCalledWith("row-1", 1);
    expect(result).toMatchObject({ ok: false, failedAt: "upload" });
    expect(result.fileId).toBeUndefined();
    expect(wipeDek).toHaveBeenCalledTimes(1);
  });

  it("Cancelled encrypted upload", async () => {
    const api = await import("../../../api/files");
    const controller = new AbortController();
    vi.mocked(api.uploadChunkSequential).mockImplementationOnce(async () => {
      controller.abort();
      return {} as never;
    });

    const result = await uploadEncryptedFile(
      makeFile("doc.docx", 16),
      { ...ARGS, chunkSize: 24, signal: controller.signal },
      "row-1",
    );

    expect(result).toMatchObject({ ok: false, aborted: true });
    expect(api.uploadChunkSequential).toHaveBeenCalledTimes(1);
    expect(api.abortUploadSession).toHaveBeenCalledWith(1, "session-1");
  });

  it("cancelled before the session opened: there is nothing to abort", async () => {
    const api = await import("../../../api/files");
    const { encryptFile } = await import("../../encryption/file-keys");
    const controller = new AbortController();
    vi.mocked(encryptFile).mockImplementationOnce(async () => {
      controller.abort();
      return {
        encryptedBlob: new Blob([new Uint8Array(64)]),
        dek: new Uint8Array(AES_KEY_SIZE_BYTES),
      };
    });

    const result = await uploadEncryptedFile(
      makeFile("doc.docx", 16),
      { ...ARGS, signal: controller.signal },
      "row-1",
    );

    expect(result).toMatchObject({ ok: false, aborted: true });
    expect(api.startUploadSession).not.toHaveBeenCalled();
    expect(api.abortUploadSession).not.toHaveBeenCalled();
  });

  it("a chunk that fails without a cancel leaves the session to expire", async () => {
    const api = await import("../../../api/files");
    vi.mocked(api.uploadChunkSequential).mockRejectedValueOnce(
      new Error("network down"),
    );

    const result = await uploadEncryptedFile(
      makeFile("doc.docx", 16),
      ARGS,
      "row-1",
    );

    expect(result).toMatchObject({ ok: false, failedAt: "upload" });
    expect(api.abortUploadSession).not.toHaveBeenCalled();
  });

  it("runs the room fan-out through the caller's queue", async () => {
    let queued = 0;
    const serializeFanOut = <T>(fanOut: () => Promise<T>) => {
      queued += 1;
      return fanOut();
    };

    const result = await uploadEncryptedFile(
      makeFile("doc.docx", 16),
      { ...ARGS, serializeFanOut },
      "row-1",
    );

    expect(result.ok).toBe(true);
    expect(queued).toBe(1);
  });

  it("a file stored without its access list fails with the wrap failure and keeps its id", async () => {
    const api = await import("../../../api/files");
    vi.mocked(api.setFileEncryptionKeys).mockRejectedValueOnce(
      new Error("403"),
    );
    const t = ((key: string) => key) as never;

    const result = await uploadEncryptedFile(
      makeFile("doc.docx", 16),
      ARGS,
      "row-1",
    );

    expect(result).toMatchObject({ ok: false, fileId: 42, failedAt: "wrap" });
    expect(result.error).toBeInstanceOf(EncryptedWrapError);
    expect(getEncryptedUploadErrorMessage(t, result.error)).toBe(
      "Common:EncryptionUploadWrapFailed",
    );
  });
});

describe("orchestrateEncryptedUpload - room fan-out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTofuStores();
    unregisterKeyMismatchHandler();
    pendingAccessStore.clear(10, "bob");
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

  it("Key trusted after a refusal: the file a refused key was left out of is recorded for the member", async () => {
    const { getRoomEncryptionKeys } = await import("../../../api/privacy");
    await getTofuStore("user-1").checkKey("bob", "pk-b-pinned");
    registerKeyMismatchHandler(vi.fn(async () => "refuse" as const));
    vi.mocked(getRoomEncryptionKeys).mockResolvedValueOnce([
      { id: "b-2", userId: "bob", publicKey: "pk-b-swapped", privateKeyEnc: "", date: "2026-01-01T00:00:00" },
    ] as never);

    const { results } = await upload();

    expect(pendingAccessStore.get(10, "bob")?.missingFileIds).toEqual([
      Number(results[0].fileId),
    ]);
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
