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

import { RoomsType } from "../../enums";
import {
  finalizeUploadSession,
  getFileEncryptionAccess,
  setFileEncryptionKeys,
  startUploadSession,
  uploadChunkSequential,
} from "../../api/files";
import { getRoomEncryptionKeys } from "../../api/privacy";
import { rememberEncryptedFilename } from "../encryption/filename-cache";
import { wipeDek } from "../encryption/file-keys";
import { wrapDekForRecipients } from "../encryption/room-file-access";
import type { IdentityKeyPair } from "../encryption/types";
import {
  countActiveUploadsForRoom as countActiveUploadsForRoomBase,
  isQuotaError,
  type UploadQueueItem,
} from "../../utils/uploadErrors";
import {
  assertEncryptedUploadName,
  prepareEncryptedUpload,
  type PreparedUpload,
} from "./encrypted-upload";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface OrchestratorUploadStore {
  /** Current in-flight queue, used for per-room active-uploads counting. */
  readonly files: ReadonlyArray<UploadQueueItem>;
  /** Mark a single file's progress for UI. Optional — orchestrator is UI-agnostic. */
  reportProgress?: (uploadId: string, percent: number) => void;
  /** Mark a single file's quota-error state for UI / retry. Optional. */
  markQuotaError?: (uploadId: string, error: unknown) => void;
}

export interface OrchestrateEncryptedUploadArgs {
  files: File[];
  /** Target folder id — for top-level uploads, equals the private room id. */
  folderId: number | string;
  /**
   * Encryption room id used for ACL fanout. For top-level files in a private
   * room this is the same as `folderId`. For nested folders the caller must
   * pass the enclosing room id so DEKs get wrapped for room members.
   */
  roomId: number | string;
  /** Unlocked identity of the current user (from EncryptionContext). */
  identity: IdentityKeyPair;
  /** Current user id — overlays `encryptionKeys[].userId` which can be blank. */
  userId: string;
  /** Active key id for the current user (from active-key-preference). */
  publicKeyId: string;
  /** Public key (base64) of the active envelope, used for self-wrap. */
  publicKey: string;
  /**
   * Upload-store-like surface for progress reporting + active-uploads counting.
   * Pass `undefined` to run headless (no progress emitted).
   */
  uploadStore?: OrchestratorUploadStore;
  signal?: AbortSignal;
  onQuotaError?: (error: unknown) => void;
  onFileError?: (file: File, error: unknown) => void;
  onFileComplete?: (file: File, result: UploadFileResult) => void;
  /**
   * Chunk size in bytes. Files smaller than this are uploaded in a single
   * request. Defaults to 5 MiB to mirror UploadDataStore's default.
   */
  chunkSize?: number;
}

export interface UploadFileResult {
  ok: boolean;
  fileId?: number | string;
  uploadId: string;
  originalName: string;
  error?: unknown;
  aborted?: boolean;
}

export interface OrchestrateResult {
  results: UploadFileResult[];
  quotaErrorRaised: boolean;
  aborted: boolean;
}

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export function countActiveEncryptedUploadsForRoom(
  uploadStore: OrchestratorUploadStore | null | undefined,
  roomId: string | number | null | undefined,
): number {
  if (!uploadStore) return 0;
  return countActiveUploadsForRoomBase(uploadStore.files, roomId);
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

class AbortedError extends Error {
  constructor() {
    super("Aborted");
    this.name = "AbortError";
  }
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) throw new AbortedError();
}

function generateUploadId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function uploadInChunks(
  folderId: number | string,
  sessionId: string,
  encryptedBlob: Blob,
  uploadFileName: string,
  chunkSize: number,
  signal: AbortSignal | undefined,
  onProgress: (percent: number) => void,
): Promise<{ fileId: number | string }> {
  const total = encryptedBlob.size;
  let uploaded = 0;
  let lastResponse: unknown = null;

  for (let offset = 0; offset < total; offset += chunkSize) {
    throwIfAborted(signal);
    const end = Math.min(offset + chunkSize, total);
    const chunkBlob = encryptedBlob.slice(offset, end);

    const formData = new FormData();
    formData.append("file", chunkBlob, uploadFileName);
    formData.append("encrypted", "true");

    lastResponse = await uploadChunkSequential(folderId, sessionId, formData);

    uploaded = end;
    onProgress(Math.min(100, Math.floor((uploaded / total) * 100)));
  }

  // Server returns the created file descriptor in the final chunk's response.
  // Different deployments vary in shape — accept either {data:{id}} or {id}.
  const fileId = extractFileIdFromUploadResponse(lastResponse);
  if (fileId === null) {
    throw new Error(
      "Upload session completed but server response had no file id",
    );
  }
  return { fileId };
}

function extractFileIdFromUploadResponse(res: unknown): number | string | null {
  if (!res || typeof res !== "object") return null;
  const candidate = res as {
    data?: { id?: unknown };
    id?: unknown;
    response?: { id?: unknown };
  };
  const id = candidate.data?.id ?? candidate.id ?? candidate.response?.id;
  if (typeof id === "number" || typeof id === "string") return id;
  return null;
}

async function wrapDekForSelfAndRoom(args: {
  fileId: number | string;
  dek: Uint8Array;
  identity: IdentityKeyPair;
  userId: string;
  publicKey: string;
  publicKeyId: string;
  roomId: number | string;
  signal: AbortSignal | undefined;
}): Promise<void> {
  const {
    fileId,
    dek,
    identity,
    userId,
    publicKey,
    publicKeyId,
    roomId,
    signal,
  } = args;

  throwIfAborted(signal);
  const fileIdNumeric = typeof fileId === "number" ? fileId : Number(fileId);

  // 1. Self-wrap first — guarantees the uploader can decrypt even if the room
  // member fanout fails mid-flight.
  const ownWraps = await wrapDekForRecipients({
    dek,
    senderIdentity: identity,
    senderUserId: userId,
    recipients: [{ userId, publicKey, publicKeyId }],
    fileId: fileIdNumeric,
  });
  await setFileEncryptionKeys(fileId, ownWraps);

  throwIfAborted(signal);

  // 2. Room-member fanout. We refetch ACL state to avoid clobbering wraps a
  // concurrent upload may have written; only append wraps for recipients we
  // don't yet cover.
  const [publicKeys, encryptionInfo] = await Promise.all([
    getRoomEncryptionKeys(roomId),
    getFileEncryptionAccess(fileId),
  ]);

  const existingFileKeys = encryptionInfo?.fileKeys ?? [];
  const existingKeyPairs = new Set(
    existingFileKeys.map((k) => `${String(k.userId)}:${k.publicKeyId || ""}`),
  );

  const recipients: Array<{
    userId: string;
    publicKey: string;
    publicKeyId: string;
  }> = [];

  if (Array.isArray(publicKeys)) {
    for (const pk of publicKeys) {
      if (!pk.publicKey || !pk.userId) continue;
      const uid = String(pk.userId);
      if (uid === userId) continue;
      const pairKey = `${uid}:${pk.id || ""}`;
      if (existingKeyPairs.has(pairKey)) continue;
      recipients.push({
        userId: uid,
        publicKey: pk.publicKey,
        publicKeyId: pk.id || "",
      });
    }
  }

  if (recipients.length === 0) return;

  throwIfAborted(signal);

  const newKeys = await wrapDekForRecipients({
    dek,
    senderIdentity: identity,
    senderUserId: userId,
    recipients,
    fileId: fileIdNumeric,
  });

  if (newKeys.length === 0) return;

  const allKeys = [
    ...existingFileKeys.map((k) => ({
      userId: k.userId,
      publicKeyId: k.publicKeyId || "",
      privateKeyEnc: k.privateKeyEnc,
    })),
    ...newKeys,
  ];
  await setFileEncryptionKeys(fileId, allKeys);
}

async function uploadOneFile(
  file: File,
  args: OrchestrateEncryptedUploadArgs,
  uploadId: string,
): Promise<UploadFileResult> {
  const {
    folderId,
    roomId,
    identity,
    userId,
    publicKey,
    publicKeyId,
    uploadStore,
    signal,
    chunkSize = DEFAULT_CHUNK_SIZE,
  } = args;

  let prepared: PreparedUpload | null = null;

  try {
    throwIfAborted(signal);

    prepared = await prepareEncryptedUpload({
      file,
      folderId: typeof folderId === "number" ? folderId : Number(folderId),
      roomType: RoomsType.CustomRoom,
      isPrivate: true,
    });

    if (!prepared.encrypted || !prepared.dek) {
      throw new Error(
        "prepareEncryptedUpload did not produce a DEK; refusing to upload in plaintext to a private room",
      );
    }

    // BL-5 — second-layer defense against pipeline regressions. prepareEncryptedUpload
    // already asserts the UUID rename happened; we re-check here in case a future
    // refactor bypasses it (e.g. caller passes a pre-encrypted blob with the
    // original name).
    assertEncryptedUploadName(prepared.uploadFileName);

    throwIfAborted(signal);

    const session = await startUploadSession(
      folderId,
      prepared.uploadFileName,
      prepared.data.size,
      "",
      true, // encrypted
      undefined,
      true, // CreateNewIfExist
      {
        originalFileName: prepared.originalFileName,
        originalFileSize: prepared.originalFileSize,
        originalFileType: prepared.originalFileType,
      },
    );

    const sessionId = session?.id;
    if (!sessionId) {
      throw new Error("startUploadSession did not return a session id");
    }

    const { fileId } = await uploadInChunks(
      folderId,
      sessionId,
      prepared.data as Blob,
      prepared.uploadFileName,
      chunkSize,
      signal,
      (percent) => uploadStore?.reportProgress?.(uploadId, percent),
    );

    throwIfAborted(signal);

    try {
      await finalizeUploadSession(folderId, sessionId);
    } catch {
      // Finalize is idempotent on the server; some deployments auto-finalize
      // on the last chunk and return 404 here. Ignore — the file was written.
    }

    await wrapDekForSelfAndRoom({
      fileId,
      dek: prepared.dek,
      identity,
      userId,
      publicKey,
      publicKeyId,
      roomId,
      signal,
    });

    rememberEncryptedFilename(fileId, prepared.originalFileName);

    return {
      ok: true,
      fileId,
      uploadId,
      originalName: prepared.originalFileName,
    };
  } catch (error) {
    if (error instanceof AbortedError) {
      return {
        ok: false,
        uploadId,
        originalName: prepared?.originalFileName ?? file.name,
        aborted: true,
        error,
      };
    }
    return {
      ok: false,
      uploadId,
      originalName: prepared?.originalFileName ?? file.name,
      error,
    };
  } finally {
    if (prepared?.dek) wipeDek(prepared.dek);
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Encrypts and uploads a batch of files into a private room. Sequential by
 * design — parallel uploads share the room ACL and we don't want concurrent
 * `setFileEncryptionKeys` writes racing against each other.
 *
 * Caller is responsible for:
 *   - calling `requireUnlock` before invoking this (identity argument)
 *   - mounting an AbortController whose `abort()` fires on lock/logout/401
 *   - displaying progress via `uploadStore.reportProgress`
 *   - displaying quota errors via `onQuotaError` (per-file or batch-level)
 */
export async function orchestrateEncryptedUpload(
  args: OrchestrateEncryptedUploadArgs,
): Promise<OrchestrateResult> {
  const results: UploadFileResult[] = [];
  let quotaErrorRaised = false;
  let aborted = false;

  for (const file of args.files) {
    if (args.signal?.aborted) {
      aborted = true;
      results.push({
        ok: false,
        uploadId: generateUploadId(),
        originalName: file.name,
        aborted: true,
        error: new AbortedError(),
      });
      continue;
    }

    const uploadId = generateUploadId();
    const result = await uploadOneFile(file, args, uploadId);
    results.push(result);

    if (result.aborted) {
      aborted = true;
      continue;
    }

    if (!result.ok && result.error) {
      args.onFileError?.(file, result.error);
      if (isQuotaError(result.error)) {
        if (!quotaErrorRaised) {
          quotaErrorRaised = true;
          args.onQuotaError?.(result.error);
        }
        args.uploadStore?.markQuotaError?.(uploadId, result.error);
      }
    }

    if (result.ok) {
      args.onFileComplete?.(file, result);
    }
  }

  return { results, quotaErrorRaised, aborted };
}
