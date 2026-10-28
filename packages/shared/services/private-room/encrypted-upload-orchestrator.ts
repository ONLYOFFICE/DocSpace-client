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

import type { TFunction } from "i18next";

import { RoomsType } from "../../enums";
import {
  abortUploadSession,
  finalizeUploadSession,
  getFileEncryptionAccess,
  setFileEncryptionKeys,
  startUploadSession,
  uploadChunkParallel,
  uploadChunkSequential,
} from "../../api/files";
import type { TFile } from "../../api/files/types";
import { getUserById } from "../../api/people";
import { getRoomEncryptionKeys } from "../../api/privacy";
import { requestDeviceSetupHint } from "../encryption/device-setup-hint-notifier";
import { rememberEncryptedFilename } from "../encryption/filename-cache";
import { wipeDek } from "../encryption/file-keys";
import { wrapDekForRecipients } from "../encryption/room-file-access";
import { getEncryptionErrorMessage } from "../encryption/error-i18n";
import { CryptoError } from "../encryption/errors";
import type { DSE3Header, IdentityKeyPair } from "../encryption/types";
import { selectMemberKeys } from "./room-member-keys";
import { pendingAccessStore } from "./pending-access";
import {
  verifyMemberKeys,
  type SkippedMemberKey,
} from "./member-key-verification";
import {
  countActiveUploadsForRoom as countActiveUploadsForRoomBase,
  isQuotaError,
  type UploadQueueItem,
} from "../../utils/uploadErrors";
import {
  assertEncryptedUploadName,
  EncryptedReimportError,
  makeOpaqueUploadName,
  prepareEncryptedUpload,
  recoverDekForReimport,
  sniffDse3Upload,
  type PreparedUpload,
  type UploadRefusalReason,
} from "./encrypted-upload";
import {
  listDecryptedFileNames,
  resolveNameClashes,
  type TNameClash,
} from "./encrypted-name-clash";

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
  /**
   * Set (or clear) a transient phase label on the upload-panel row.
   * Pass `undefined` to clear. Example: "Encrypting".
   * Optional — callers that do not need labels may omit this.
   */
  setItemLabel?: (uploadId: string, label: string | undefined) => void;
  /** How far the encryption of a file has got, from 0 to 1. Optional. */
  reportEncryptionProgress?: (uploadId: string, fraction: number) => void;
  /** Fail a row the batch gate refused; nothing of it was sent. Optional. */
  markRefused?: (uploadId: string, refusal: EncryptedUploadRefusal) => void;
}

/**
 * Why the gate refuses a batch before any byte is sent: `no-key` when the
 * uploader has no key, `locked` when they decline to unlock.
 */
export type EncryptedUploadRefusal = Extract<
  UploadRefusalReason,
  "no-key" | "locked"
>;

/** One file of an encrypted upload, for callers that run their own queue. */
export interface EncryptedFileUploadArgs {
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
  /** Id of the current user's key (selectUserKey). */
  publicKeyId: string;
  /** Public key (base64) of the active envelope, used for self-wrap. */
  publicKey: string;
  /**
   * Upload-store-like surface for progress reporting + active-uploads counting.
   * Pass `undefined` to run headless (no progress emitted).
   */
  uploadStore?: OrchestratorUploadStore;
  signal?: AbortSignal;
  /**
   * Chunk size in bytes. Files smaller than this are uploaded in a single
   * request. Defaults to 5 MiB to mirror UploadDataStore's default.
   */
  chunkSize?: number;
  /**
   * Member key changes refused so far (`userId:publicKey`). Defaults to a set
   * kept for this call, so one batch asks once per changed key.
   */
  memberKeyRefusals?: Set<string>;
  /**
   * Parts sent at once. Above 1 the parts go as numbered chunks and the
   * session is finalised afterwards; 1, the default, sends them in order.
   */
  uploadThreads?: number;
  /**
   * Runs the room fan-out of a file. A caller uploading several files at once
   * queues the fan-outs, so a changed member key is asked about once.
   */
  serializeFanOut?: <T>(fanOut: () => Promise<T>) => Promise<T>;
}

export interface OrchestrateEncryptedUploadArgs
  extends Omit<
    EncryptedFileUploadArgs,
    "identity" | "userId" | "publicKeyId" | "publicKey"
  > {
  files: File[];
  /** The upload-panel ids of `files`, in order; generated when left out. */
  uploadIds?: string[];
  userId?: string | null;
  publicKeyId?: string | null;
  publicKey?: string | null;
  /**
   * The unlocked identity; when left out, the batch asks for it through
   * `requireIdentity` once the key check has passed.
   */
  identity?: IdentityKeyPair;
  requireIdentity?: () => Promise<IdentityKeyPair | null>;
  /** Cancels one file of the batch; the batch `signal` still cancels all. */
  fileSignal?: (uploadId: string) => AbortSignal | undefined;
  onQuotaError?: (error: unknown) => void;
  onFileError?: (file: File, error: unknown, uploadId: string) => void;
  onFileComplete?: (file: File, result: UploadFileResult) => void;
  /**
   * Asked once, before any byte is sent, when files of the batch clash with
   * decrypted names in their folder: true keeps both, the new file taking the
   * first free copy suffix; false cancels the batch. Without it no names are
   * compared.
   */
  onNameClash?: (clashes: EncryptedUploadNameClash[]) => Promise<boolean>;
}

export type EncryptedUploadBatchOptions = Omit<
  OrchestrateEncryptedUploadArgs,
  "files" | "uploadIds" | "folderId" | "roomId"
>;

/** A file of a batch and the folder it was queued for. */
export type EncryptedUploadRetryItem = {
  file: File;
  uploadId: string;
  folderId: number | string;
  roomId: number | string;
};

export type EncryptedUploadNameClash = {
  uploadId: string;
  file: File;
  renamed: string;
};

export interface UploadFileResult {
  ok: boolean;
  fileId?: number | string;
  uploadId: string;
  originalName: string;
  error?: unknown;
  aborted?: boolean;
  /** Room members whose key failed the pin check and got no wrap. */
  skippedMembers?: SkippedMemberKey[];
  /** Set when the batch gate refused the file before any byte was sent. */
  refused?: EncryptedUploadRefusal;
  /** The stored file as the server answered it, once the upload went through. */
  file?: TFile;
  /** The folder ids from the section root down to the target, as the session answered them. */
  path?: (number | string)[];
  /**
   * Where a failed upload stopped: preparing the ciphertext, sending it, or
   * writing the access list of the stored file.
   */
  failedAt?: "prepare" | "upload" | "wrap";
}

/** The file was stored but its access list could not be written. */
export class EncryptedWrapError extends Error {
  constructor(cause: unknown) {
    super("The uploaded file's access list could not be written");
    this.name = "EncryptedWrapError";
    this.cause = cause;
  }
}

export interface OrchestrateResult {
  results: UploadFileResult[];
  quotaErrorRaised: boolean;
  aborted: boolean;
  /** Set when the gate refused the batch; no file of it was sent. */
  refused?: EncryptedUploadRefusal;
  /** Members left out of the access list of any file of the batch, once each. */
  skippedMembers: SkippedMemberKey[];
}

export type EncryptedUploadGate =
  | {
      identity: IdentityKeyPair;
      userId: string;
      publicKeyId: string;
      publicKey: string;
    }
  | { refused: EncryptedUploadRefusal };

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

/**
 * The gate of a batch into a private room: an uploader without a key is
 * refused without an unlock prompt and the device-setup hint is requested;
 * one who declines to unlock is refused as locked.
 * Spec: private-rooms/file-operations, "Uploads into a private room are encrypted on the client".
 */
export async function openEncryptedUploadBatch(params: {
  userId?: string | null;
  publicKeyId?: string | null;
  publicKey?: string | null;
  requireIdentity: () => Promise<IdentityKeyPair | null>;
}): Promise<EncryptedUploadGate> {
  const { userId, publicKeyId, publicKey, requireIdentity } = params;
  if (!userId || !publicKeyId || !publicKey) {
    requestDeviceSetupHint();
    return { refused: "no-key" };
  }
  const identity = await requireIdentity();
  if (!identity) return { refused: "locked" };
  return { identity, userId, publicKeyId, publicKey };
}

/** The message a row refused by the batch gate fails with. */
export const getEncryptedUploadRefusalMessage = (
  t: TFunction,
  refusal: EncryptedUploadRefusal,
) =>
  refusal === "locked"
    ? t("Common:EncryptionLockedUpload")
    : t("Common:EncryptionKeysRequiredForUpload");

/** The members left out, each with a display name to show. */
export async function nameSkippedMembers(
  skipped: SkippedMemberKey[],
): Promise<SkippedMemberKey[]> {
  return Promise.all(
    skipped.map(async (member) => {
      if (member.displayName) return member;
      try {
        const user = await getUserById(member.userId);
        return { ...member, displayName: user?.displayName || member.userId };
      } catch {
        return { ...member, displayName: member.userId };
      }
    }),
  );
}

/** The message a row whose upload failed is marked with. */
export const getEncryptedUploadErrorMessage = (t: TFunction, error: unknown) => {
  if (error instanceof EncryptedReimportError) {
    return t("Common:EncryptionReimportFailed");
  }
  if (error instanceof EncryptedWrapError) {
    return t("Common:EncryptionUploadWrapFailed");
  }
  if (error instanceof CryptoError) return getEncryptionErrorMessage(t, error);
  return t("Common:EncryptionPrepareFailed");
};

/** The notice a refused batch shows besides its failed rows, if any. */
export const getEncryptedUploadRefusalNotice = (
  t: TFunction,
  refusal: EncryptedUploadRefusal,
) => (refusal === "locked" ? t("Common:EncryptionUploadCancelled") : null);

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

class AbortedError extends Error {
  constructor() {
    super("Aborted");
    this.name = "AbortError";
  }
}

/** A signal that aborts when either of the two does. */
function eitherSignal(
  a: AbortSignal | undefined,
  b: AbortSignal | undefined,
): AbortSignal | undefined {
  if (!a || !b) return a ?? b;
  if (a.aborted) return a;
  if (b.aborted) return b;
  const controller = new AbortController();
  const abort = () => controller.abort();
  a.addEventListener("abort", abort, { once: true });
  b.addEventListener("abort", abort, { once: true });
  return controller.signal;
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
  threads: number,
  signal: AbortSignal | undefined,
  onProgress: (percent: number) => void,
): Promise<{ fileId: number | string; file?: TFile }> {
  const total = encryptedBlob.size;
  const parts: Blob[] = [];
  for (let offset = 0; offset < total; offset += chunkSize) {
    parts.push(encryptedBlob.slice(offset, Math.min(offset + chunkSize, total)));
  }
  const formOf = (part: Blob) => {
    const formData = new FormData();
    formData.append("file", part, uploadFileName);
    formData.append("encrypted", "true");
    return formData;
  };
  let sent = 0;
  const reportSent = (part: Blob) => {
    sent += part.size;
    onProgress(Math.min(100, Math.floor((sent / total) * 100)));
  };

  let lastResponse: unknown = null;
  if (threads > 1) {
    let next = 0;
    await Promise.all(
      Array.from({ length: Math.min(threads, parts.length) }, async () => {
        while (next < parts.length) {
          const index = next++;
          throwIfAborted(signal);
          await uploadChunkParallel(
            folderId,
            sessionId,
            index + 1,
            formOf(parts[index]),
            signal,
          );
          reportSent(parts[index]);
        }
      }),
    );
    throwIfAborted(signal);
    lastResponse = await finalizeUploadSession(folderId, sessionId, signal);
  } else {
    for (const part of parts) {
      throwIfAborted(signal);
      lastResponse = await uploadChunkSequential(
        folderId,
        sessionId,
        formOf(part),
      );
      reportSent(part);
    }
    throwIfAborted(signal);
    try {
      await finalizeUploadSession(folderId, sessionId);
    } catch {
      // Finalize is idempotent on the server; some deployments auto-finalize
      // on the last chunk and return 404 here. Ignore — the file was written.
    }
  }

  // Server returns the created file descriptor in the final chunk's response.
  // Different deployments vary in shape — accept either {data:{id}} or {id}.
  const fileId = extractFileIdFromUploadResponse(lastResponse);
  if (fileId === null) {
    throw new Error(
      "Upload session completed but server response had no file id",
    );
  }
  return { fileId, file: extractFileFromUploadResponse(lastResponse) };
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

function extractFileFromUploadResponse(res: unknown): TFile | undefined {
  if (!res || typeof res !== "object") return undefined;
  const candidate = res as {
    data?: { file?: TFile };
    file?: TFile;
    response?: { file?: TFile };
  };
  return candidate.data?.file ?? candidate.file ?? candidate.response?.file;
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
  refusals: Set<string> | undefined;
  serializeFanOut: EncryptedFileUploadArgs["serializeFanOut"];
}): Promise<SkippedMemberKey[]> {
  const {
    fileId,
    dek,
    identity,
    userId,
    publicKey,
    publicKeyId,
    roomId,
    signal,
    refusals,
    serializeFanOut,
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

  const fanOutToRoom = async (): Promise<SkippedMemberKey[]> => {
    try {
      throwIfAborted(signal);

      const [publicKeys, encryptionInfo] = await Promise.all([
        getRoomEncryptionKeys(roomId),
        getFileEncryptionAccess(fileId),
      ]);

      const existingFileKeys = encryptionInfo?.fileKeys ?? [];

      // Spec: private-rooms/encryption-core, "One access-list entry per user".
      const recipients: Array<{
        userId: string;
        publicKey: string;
        publicKeyId: string;
      }> = [];
      for (const [uid, key] of selectMemberKeys(publicKeys)) {
        if (uid === userId) continue;
        recipients.push({
          userId: uid,
          publicKey: key.publicKey,
          publicKeyId: key.publicKeyId || "",
        });
      }

      if (recipients.length === 0) return [];

      const { verified, skipped } = await verifyMemberKeys(recipients, {
        scopeUserId: userId,
        refusals,
      });
      if (verified.length === 0) return skipped;

      throwIfAborted(signal);

      const newKeys = await wrapDekForRecipients({
        dek,
        senderIdentity: identity,
        senderUserId: userId,
        recipients: verified,
        fileId: fileIdNumeric,
      });

      if (newKeys.length === 0) return skipped;

      const allKeys = [
        ...existingFileKeys.map((k) => ({
          userId: k.userId,
          publicKeyId: k.publicKeyId || "",
          privateKeyEnc: k.privateKeyEnc,
        })),
        ...newKeys,
      ];
      await setFileEncryptionKeys(fileId, allKeys);
      return skipped;
    } catch (error) {
      if (error instanceof AbortedError) throw error;
      return [];
    }
  };

  return serializeFanOut ? serializeFanOut(fanOutToRoom) : fanOutToRoom();
}

/** A file downloaded without decryption goes back under its original key. */
async function prepareReimport(
  file: File,
  header: DSE3Header,
  { roomId, userId, identity }: EncryptedFileUploadArgs,
): Promise<PreparedUpload> {
  const { dek, realName } = await recoverDekForReimport({
    file,
    header,
    roomId,
    userId,
    identity,
  });
  return {
    data: file,
    encrypted: true,
    dek,
    uploadFileName: makeOpaqueUploadName(file.name),
    originalFileType: file.type || "application/octet-stream",
    originalFileSize: file.size,
    originalFileName: realName,
  };
}

/**
 * Encrypts and uploads one file into a private room: prepare, encrypted
 * session, chunks, then the self-then-room wrap. The batch gate is the
 * caller's (see openEncryptedUploadBatch).
 */
export async function uploadEncryptedFile(
  file: File,
  args: EncryptedFileUploadArgs,
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
    memberKeyRefusals,
    uploadThreads = 1,
    serializeFanOut,
  } = args;

  let prepared: PreparedUpload | null = null;
  let stored: Pick<UploadFileResult, "fileId" | "file" | "path"> = {};
  let stage: NonNullable<UploadFileResult["failedAt"]> = "prepare";

  try {
    throwIfAborted(signal);

    // Signal the encryption phase so the upload-panel row can show a label.
    uploadStore?.setItemLabel?.(uploadId, "encrypting");
    try {
      const reimportHeader = await sniffDse3Upload(file);
      prepared = reimportHeader
        ? await prepareReimport(file, reimportHeader, args)
        : await prepareEncryptedUpload({
            file,
            folderId:
              typeof folderId === "number" ? folderId : Number(folderId),
            roomType: RoomsType.CustomRoom,
            isPrivate: true,
            onProgress: (fraction) =>
              uploadStore?.reportEncryptionProgress?.(uploadId, fraction),
          });
    } finally {
      // Always clear the label whether encryption succeeded or failed.
      uploadStore?.setItemLabel?.(uploadId, undefined);
    }

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

    stage = "upload";
    const session = await startUploadSession(
      folderId,
      prepared.uploadFileName,
      prepared.data.size,
      "",
      true, // encrypted
      undefined,
      true, // CreateNewIfExist
    );

    const sessionId = session?.id;
    if (!sessionId) {
      throw new Error("startUploadSession did not return a session id");
    }

    let uploaded: Awaited<ReturnType<typeof uploadInChunks>>;
    try {
      uploaded = await uploadInChunks(
        folderId,
        sessionId,
        prepared.data as Blob,
        prepared.uploadFileName,
        chunkSize,
        uploadThreads,
        signal,
        (percent) => uploadStore?.reportProgress?.(uploadId, percent),
      );
    } catch (error) {
      if (signal?.aborted) {
        await abortUploadSession(folderId, sessionId).catch(() => {});
      }
      throw error;
    }
    const { fileId, file: storedFile } = uploaded;
    stored = { fileId, file: storedFile, path: session?.path };
    rememberEncryptedFilename(fileId, prepared.originalFileName);
    stage = "wrap";

    throwIfAborted(signal);

    let skippedMembers: SkippedMemberKey[];
    try {
      skippedMembers = await wrapDekForSelfAndRoom({
        fileId,
        dek: prepared.dek,
        identity,
        userId,
        publicKey,
        publicKeyId,
        roomId,
        signal,
        refusals: memberKeyRefusals,
        serializeFanOut,
      });
    } catch (error) {
      if (error instanceof AbortedError) throw error;
      throw new EncryptedWrapError(error);
    }
    // Spec: private-rooms/room-membership, "Trusting a changed key wraps what the member missed"
    for (const member of skippedMembers) {
      pendingAccessStore.addMissingFiles(Number(roomId), member.userId, [
        Number(fileId),
      ]);
    }

    return {
      ok: true,
      ...stored,
      uploadId,
      originalName: prepared.originalFileName,
      ...(skippedMembers.length > 0 ? { skippedMembers } : {}),
    };
  } catch (error) {
    if (error instanceof AbortedError) {
      return {
        ok: false,
        ...stored,
        uploadId,
        originalName: prepared?.originalFileName ?? file.name,
        aborted: true,
        error,
      };
    }
    return {
      ok: false,
      ...stored,
      uploadId,
      originalName: prepared?.originalFileName ?? file.name,
      error,
      failedAt: stage,
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
 * Before any byte is sent the batch passes the gate (see
 * openEncryptedUploadBatch) and, when the caller asks for it, the name-clash
 * check. A quota error stops the files that have not started.
 *
 * Caller is responsible for:
 *   - mounting an AbortController whose `abort()` fires on lock/logout/401
 *   - displaying progress via `uploadStore.reportProgress`
 *   - displaying quota errors via `onQuotaError` (per-file or batch-level)
 */
export async function orchestrateEncryptedUpload(
  callerArgs: OrchestrateEncryptedUploadArgs,
): Promise<OrchestrateResult> {
  const { files, uploadIds, folderId, roomId, ...options } = callerArgs;
  return runEncryptedUploadBatch(
    files.map((file, index) => ({
      file,
      uploadId: uploadIds?.[index] ?? generateUploadId(),
      folderId,
      roomId,
    })),
    options,
  );
}

/**
 * Sends failed uploads again, each to the folder it was first queued for,
 * through the batch gate again, the unlock prompt included.
 */
export async function retryEncryptedUploads(
  args: EncryptedUploadBatchOptions & { items: EncryptedUploadRetryItem[] },
): Promise<OrchestrateResult> {
  const { items, ...options } = args;
  return runEncryptedUploadBatch(items, options);
}

/**
 * The batch's files whose decrypted names clash with names in their folder,
 * each with the first free copy suffix; null when the caller cancels.
 */
async function checkUploadNameClashes(
  entries: EncryptedUploadRetryItem[],
  userId: string,
  identity: IdentityKeyPair,
  onNameClash: (clashes: EncryptedUploadNameClash[]) => Promise<boolean>,
): Promise<Map<string, string> | null> {
  const byFolder = new Map<string, EncryptedUploadRetryItem[]>();
  for (const entry of entries) {
    const key = String(entry.folderId);
    byFolder.set(key, [...(byFolder.get(key) ?? []), entry]);
  }

  const clashes: TNameClash<EncryptedUploadRetryItem>[] = [];
  for (const folderEntries of byFolder.values()) {
    const { folderId, roomId } = folderEntries[0];
    let existingNames: string[];
    try {
      existingNames = await listDecryptedFileNames(
        folderId,
        roomId,
        userId,
        identity,
      );
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: the upload goes on without the check; the failure is logged for triage.
      console.error("[ENCRYPTION] upload name clashes not checked:", error);
      continue;
    }
    clashes.push(
      ...resolveNameClashes(
        folderEntries.map((entry) => ({ item: entry, name: entry.file.name })),
        existingNames,
      ),
    );
  }

  if (clashes.length === 0) return new Map();
  const keepBoth = await onNameClash(
    clashes.map(({ item, renamed }) => ({
      uploadId: item.uploadId,
      file: item.file,
      renamed,
    })),
  );
  return keepBoth
    ? new Map(clashes.map(({ item, renamed }) => [item.uploadId, renamed]))
    : null;
}

async function runEncryptedUploadBatch(
  entries: EncryptedUploadRetryItem[],
  options: EncryptedUploadBatchOptions,
): Promise<OrchestrateResult> {
  const { uploadStore } = options;

  const gate = await openEncryptedUploadBatch({
    userId: options.userId,
    publicKeyId: options.publicKeyId,
    publicKey: options.publicKey,
    requireIdentity: options.identity
      ? async () => options.identity ?? null
      : (options.requireIdentity ?? (async () => null)),
  });
  if ("refused" in gate) {
    for (const { uploadId } of entries) {
      uploadStore?.markRefused?.(uploadId, gate.refused);
    }
    return {
      results: entries.map(({ file, uploadId }) => ({
        ok: false,
        uploadId,
        originalName: file.name,
        refused: gate.refused,
      })),
      quotaErrorRaised: false,
      aborted: false,
      refused: gate.refused,
      skippedMembers: [],
    };
  }

  const renames = options.onNameClash
    ? await checkUploadNameClashes(
        entries,
        gate.userId,
        gate.identity,
        options.onNameClash,
      )
    : new Map<string, string>();
  if (!renames) {
    return {
      results: entries.map(({ file, uploadId }) => ({
        ok: false,
        uploadId,
        originalName: file.name,
        aborted: true,
      })),
      quotaErrorRaised: false,
      aborted: true,
      skippedMembers: [],
    };
  }

  const fileArgs = {
    ...options,
    ...gate,
    memberKeyRefusals: options.memberKeyRefusals ?? new Set<string>(),
  };
  const results: UploadFileResult[] = [];
  const skippedMembers = new Map<string, SkippedMemberKey>();
  let quotaError: unknown = null;
  let aborted = false;

  for (const { file, uploadId, folderId, roomId } of entries) {
    const signal = eitherSignal(
      fileArgs.signal,
      options.fileSignal?.(uploadId),
    );
    if (signal?.aborted) {
      aborted = true;
      results.push({
        ok: false,
        uploadId,
        originalName: file.name,
        aborted: true,
        error: new AbortedError(),
      });
      continue;
    }

    // Spec: private-rooms/file-operations, "Quota errors stop the batch".
    if (quotaError) {
      uploadStore?.markQuotaError?.(uploadId, quotaError);
      results.push({
        ok: false,
        uploadId,
        originalName: file.name,
        error: quotaError,
      });
      continue;
    }

    const renamed = renames.get(uploadId);
    const result = await uploadEncryptedFile(
      renamed
        ? new File([file], renamed, {
            type: file.type,
            lastModified: file.lastModified,
          })
        : file,
      { ...fileArgs, folderId, roomId, signal },
      uploadId,
    );
    results.push(result);
    for (const member of result.skippedMembers ?? []) {
      if (!skippedMembers.has(member.userId)) {
        skippedMembers.set(member.userId, member);
      }
    }

    if (result.aborted) {
      aborted = true;
      continue;
    }

    if (!result.ok && result.error) {
      options.onFileError?.(file, result.error, uploadId);
      if (isQuotaError(result.error)) {
        if (!quotaError) {
          quotaError = result.error;
          options.onQuotaError?.(result.error);
        }
        uploadStore?.markQuotaError?.(uploadId, result.error);
      }
    }

    if (result.ok) {
      options.onFileComplete?.(file, result);
    }
  }

  return {
    results,
    quotaErrorRaised: !!quotaError,
    aborted,
    skippedMembers: Array.from(skippedMembers.values()),
  };
}
