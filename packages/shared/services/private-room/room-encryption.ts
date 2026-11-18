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
  getFolder,
  getFileEncryptionAccess,
  setFileEncryptionKeys,
} from "../../api/files";
import { getFilePublicKeys, getRoomMissingFileKeys } from "../../api/privacy";
import {
  unwrapDekForCurrentUser,
  wrapDekForRecipients,
  type RoomMemberPublicKey,
} from "../encryption/room-file-access";
import { wipeDek } from "../encryption/file-keys";
import {
  type KeyMismatchResolver,
} from "../encryption/tofu-store";
import { verifyMemberKey } from "./member-key-verification";
import { loadRoomMemberKeys, selectMemberKeys } from "./room-member-keys";
import FilesFilter from "../../api/files/filter";
import type { TFile } from "../../api/files/types";
import type { IdentityKeyPair, ServerAccessKeyDto } from "../encryption/types";

export interface NewRoomMember {
  id: string;
  publicKey?: string;
  displayName?: string;
}

export interface FileEncryptionOpResult {
  fileId: number;
  success: boolean;
  skipped?: boolean;
  unreadable?: boolean;
  error?: string;
}

export type SkippedMemberReason = "no-key" | "key-mismatch-refused";

export interface SkippedRoomMember {
  id: string;
  displayName?: string;
  reason: SkippedMemberReason;
  /** Left out before room access was granted: they never became a member. */
  notInvited?: true;
}

export interface RoomRewrapResult {
  fileResults: FileEncryptionOpResult[];
  skippedMembers: SkippedRoomMember[];
  /**
   * The files each member with a verified key got no entry for: the write
   * failed, or the server answered that the member cannot read the file.
   */
  missingFileIdsByMember: Record<string, number[]>;
}

export type AddMembersResult = RoomRewrapResult;

export interface RoomEncryptionOptions {
  currentUserId: string;
  identity: IdentityKeyPair;
  onProgress?: (processed: number, total: number) => void;
  onKeyChange?: KeyMismatchResolver;
}

async function getEncryptedFilesInRoom(roomId: number): Promise<TFile[]> {
  const allFiles: TFile[] = [];
  let page = 0;
  const pageSize = 100;
  let read = 0;
  let hasMore = true;

  while (hasMore) {
    const filter = FilesFilter.getDefault();
    filter.page = page;
    filter.pageCount = pageSize;

    const folderData = await getFolder(roomId, filter);
    const encryptedFiles = folderData.files.filter((file) => file.encrypted);
    allFiles.push(...encryptedFiles);

    for (const subfolder of folderData.folders) {
      const subfolderFiles = await getEncryptedFilesInRoom(subfolder.id);
      allFiles.push(...subfolderFiles);
    }

    // A page holds the folders first and files after them, so only the
    // folder's total tells whether files remain.
    const onPage = folderData.files.length + folderData.folders.length;
    read += onPage;
    hasMore =
      typeof folderData.total === "number"
        ? onPage > 0 && read < folderData.total
        : folderData.files.length === pageSize;
    page++;
  }
  return allFiles;
}

export async function addMembersToEncryptedRoom(
  roomId: number,
  newMembers: NewRoomMember[],
  options: RoomEncryptionOptions,
): Promise<AddMembersResult> {
  const validMembers = newMembers.filter((m) => m.id);
  if (validMembers.length === 0) return emptyAddMembersResult();

  const encryptedFiles = await getEncryptedFilesInRoom(roomId);
  if (encryptedFiles.length === 0) return emptyAddMembersResult();

  return wrapFilesForMembers(
    roomId,
    encryptedFiles.map((file) => file.id),
    validMembers,
    options,
  );
}

/**
 * Wraps the given files of the room for one member again, after an invite
 * or an earlier retry left the member without an entry for them.
 */
export async function rewrapMissingFilesForMember(
  roomId: number,
  userId: string,
  fileIds: number[],
  options: RoomEncryptionOptions,
): Promise<AddMembersResult> {
  if (!userId || fileIds.length === 0) return emptyAddMembersResult();
  return wrapFilesForMembers(roomId, fileIds, [{ id: userId }], options);
}

const emptyAddMembersResult = (): AddMembersResult => ({
  fileResults: [],
  skippedMembers: [],
  missingFileIdsByMember: {},
});

/**
 * Wraps the given files of the room for the members whose key passes
 * verification, the caller unwrapping each file with its own entry.
 */
async function wrapFilesForMembers(
  roomId: number,
  fileIds: number[],
  validMembers: NewRoomMember[],
  options: RoomEncryptionOptions,
): Promise<AddMembersResult> {
  const fileResults: FileEncryptionOpResult[] = [];
  const { currentUserId, identity, onProgress, onKeyChange } = options;

  const { keyByUserId, list: roomMemberKeys } =
    await loadRoomMemberKeys(roomId);

  onProgress?.(0, fileIds.length);

  const memberKeyCache = new Map<string, RoomMemberPublicKey | null>();
  const skippedReasons = new Map<string, SkippedMemberReason>();
  const memberDisplayName = new Map<string, string | undefined>();
  for (const member of validMembers) {
    memberDisplayName.set(member.id, member.displayName);
  }
  const notStoredFileIds = new Map<string, number[]>();

  const resolveMemberKey = async (
    m: NewRoomMember,
  ): Promise<RoomMemberPublicKey | null> => {
    const cached = memberKeyCache.get(m.id);
    if (cached !== undefined) return cached;

    const candidate: RoomMemberPublicKey | null =
      keyByUserId.get(String(m.id)) ??
      (m.publicKey ? { userId: String(m.id), publicKey: m.publicKey } : null);
    if (!candidate) {
      memberKeyCache.set(m.id, null);
      skippedReasons.set(m.id, "no-key");
      return null;
    }

    const verification = await verifyMemberKey({
      userId: m.id,
      scopeUserId: currentUserId,
      displayName: memberDisplayName.get(m.id),
      resolver: onKeyChange,
      publicKey: candidate.publicKey,
    });
    const resolved = verification.kind === "ok" ? candidate : null;
    memberKeyCache.set(m.id, resolved);
    if (verification.kind !== "ok") skippedReasons.set(m.id, verification.kind);
    return resolved;
  };

  for (let i = 0; i < fileIds.length; i++) {
    const fileId = fileIds[i];
    try {
      const info = await getFileEncryptionAccess(fileId);
      if (!info?.fileKeys || info.fileKeys.length === 0) {
        fileResults.push({
          fileId,
          success: false,
          error: "no encryption keys for file",
        });
        continue;
      }

      let dek: Uint8Array | null = null;
      try {
        dek = await unwrapDekForCurrentUser({
          fileKeys: info.fileKeys,
          roomMemberKeys,
          currentUserId,
          currentIdentity: identity,
          fileId,
        });
      } catch (e) {
        fileResults.push({
          fileId,
          success: false,
          error: e instanceof Error ? e.message : "unwrap failed",
        });
        continue;
      }

      // Spec: private-rooms/server-contract, "File access entries read".
      const recipients: RoomMemberPublicKey[] = [];
      for (const m of validMembers) {
        if (String(m.id) === String(currentUserId)) continue;
        const key = await resolveMemberKey(m);
        if (!key) continue;
        recipients.push({
          userId: m.id,
          publicKey: key.publicKey,
          publicKeyId: key.publicKeyId,
        });
      }

      if (recipients.length === 0) {
        wipeDek(dek);
        fileResults.push({ fileId, success: true });
        continue;
      }

      let newKeys: ServerAccessKeyDto[];
      try {
        newKeys = await wrapDekForRecipients({
          dek,
          senderIdentity: identity,
          senderUserId: currentUserId,
          recipients,
          fileId,
        });
      } finally {
        wipeDek(dek);
      }

      const allKeys: ServerAccessKeyDto[] = [
        ...info.fileKeys.map((k) => ({
          userId: k.userId,
          publicKeyId: k.publicKeyId || "",
          privateKeyEnc: k.privateKeyEnc,
        })),
        ...newKeys,
      ];
      const written = await setFileEncryptionKeys(fileId, allKeys);
      for (const userId of written?.skippedUserIds ?? []) {
        const id = String(userId);
        if (!recipients.some((r) => String(r.userId) === id)) continue;
        notStoredFileIds.set(id, [...(notStoredFileIds.get(id) ?? []), fileId]);
      }

      fileResults.push({ fileId, success: true });
    } catch (error) {
      fileResults.push({
        fileId,
        success: false,
        error: error instanceof Error ? error.message : "unknown error",
      });
    }
    onProgress?.(i + 1, fileIds.length);
  }

  for (const m of validMembers) {
    if (memberKeyCache.has(m.id)) continue;
    await resolveMemberKey(m);
  }

  const skippedMembers: SkippedRoomMember[] = [];
  for (const m of validMembers) {
    const reason = skippedReasons.get(m.id);
    if (reason) {
      skippedMembers.push({
        id: m.id,
        displayName: m.displayName,
        reason,
      });
    }
  }

  // A file's entries are written in one request, so a failed file left
  // every verified invitee without a wrap for it.
  const failedFileIds = fileResults
    .filter((result) => !result.success)
    .map((result) => result.fileId);
  const missingFileIdsByMember: Record<string, number[]> = {};
  for (const m of validMembers) {
    if (String(m.id) === String(currentUserId)) continue;
    if (skippedReasons.has(m.id)) continue;
    const missing = [
      ...failedFileIds,
      ...(notStoredFileIds.get(String(m.id)) ?? []),
    ];
    if (missing.length > 0) missingFileIdsByMember[m.id] = missing;
  }

  return { fileResults, skippedMembers, missingFileIdsByMember };
}

/**
 * The encrypted files each member lacks a key on, by file, as the server
 * reports them for the room; null when the request fails, so the sweep
 * covers every file for every member instead.
 */
async function readMissingFileKeys(
  roomId: number,
): Promise<Map<number, Set<string>> | null> {
  try {
    const entries = await getRoomMissingFileKeys(roomId);
    const byFile = new Map<number, Set<string>>();
    for (const { userId, fileIds } of entries) {
      for (const fileId of fileIds) {
        const users = byFile.get(fileId) ?? new Set<string>();
        users.add(String(userId));
        byFile.set(fileId, users);
      }
    }
    return byFile;
  } catch {
    return null;
  }
}

/**
 * Wraps, for every member with a verified key other than the caller, the
 * encrypted files of the room the server lists them as lacking a key on;
 * when that list cannot be read, every encrypted file for every member.
 * Its callers bound how often it runs.
 * Spec: private-rooms/room-membership, "Backfill re-wraps every member".
 *
 * Recipient discovery uses the file-level endpoint `getFilePublicKeys`;
 * room member keys are loaded once for HPKE-Auth sender verification.
 *
 * Pass an `onKeyChange` that auto-refuses if you want a fully silent run
 * (recommended for background invocations triggered by navigation).
 */
export async function backfillEncryptedFilesForRoomMembers(
  roomId: number,
  options: RoomEncryptionOptions,
): Promise<RoomRewrapResult> {
  const fileResults: FileEncryptionOpResult[] = [];
  const { currentUserId, identity, onProgress, onKeyChange } = options;

  const missingFileIdsByMember: Record<string, number[]> = {};
  // Spec: private-rooms/server-contract, "Missing file keys of a room"
  const missing = await readMissingFileKeys(roomId);
  const fileIds = missing
    ? [...missing.keys()]
    : (await getEncryptedFilesInRoom(roomId)).map((file) => file.id);
  if (fileIds.length === 0) {
    return { fileResults, skippedMembers: [], missingFileIdsByMember };
  }

  // For HPKE-Auth sender verification we need a pool of known room-member
  // public keys (the sender of each existing wrap must be in here). Union
  // the room-level and file-level endpoints to maximise coverage.
  const { list: roomMemberKeys } = await loadRoomMemberKeys(roomId);
  const senderCandidates: RoomMemberPublicKey[] = [...roomMemberKeys];
  const senderSeen = new Set(
    roomMemberKeys.map((k) => `${k.userId}:${k.publicKey}`),
  );

  const verifiedCache = new Map<string, string | null>();
  const skippedReasons = new Map<string, SkippedMemberReason>();

  const verifyAndCache = async (
    userId: string,
    candidate: string,
  ): Promise<string | null> => {
    const cacheKey = `${userId}:${candidate}`;
    const cached = verifiedCache.get(cacheKey);
    if (cached !== undefined) return cached;
    const result = await verifyMemberKey({
      userId,
      scopeUserId: currentUserId,
      resolver: onKeyChange,
      publicKey: candidate,
    });
    const pk = result.kind === "ok" ? result.publicKey : null;
    verifiedCache.set(cacheKey, pk);
    if (result.kind !== "ok") skippedReasons.set(userId, result.kind);
    else skippedReasons.delete(userId);
    return pk;
  };

  onProgress?.(0, fileIds.length);

  for (let i = 0; i < fileIds.length; i++) {
    const fileId = fileIds[i];
    try {
      const [filePublicKeys, info] = await Promise.all([
        getFilePublicKeys(fileId),
        getFileEncryptionAccess(fileId),
      ]);

      if (!info?.fileKeys || info.fileKeys.length === 0) {
        fileResults.push({
          fileId: fileId,
          success: false,
          error: "no encryption keys for file",
        });
        continue;
      }

      if (Array.isArray(filePublicKeys)) {
        for (const pk of filePublicKeys) {
          if (!pk?.userId || !pk?.publicKey) continue;
          const uid = String(pk.userId);
          const seenKey = `${uid}:${pk.publicKey}`;
          if (!senderSeen.has(seenKey)) {
            senderSeen.add(seenKey);
            senderCandidates.push({
              userId: uid,
              publicKey: pk.publicKey,
              publicKeyId: pk.id,
            });
          }
        }
      }

      const lacking = missing?.get(fileId);
      const candidates = Array.from(selectMemberKeys(filePublicKeys)).flatMap(
        ([userId, key]) =>
          userId === String(currentUserId) || (lacking && !lacking.has(userId))
            ? []
            : [key],
      );

      if (candidates.length === 0) {
        fileResults.push({ fileId: fileId, success: true });
        continue;
      }

      const recipients: RoomMemberPublicKey[] = [];
      for (const c of candidates) {
        const pk = await verifyAndCache(c.userId, c.publicKey);
        if (pk)
          recipients.push({
            userId: c.userId,
            publicKey: pk,
            publicKeyId: c.publicKeyId,
          });
      }

      if (recipients.length === 0) {
        fileResults.push({ fileId: fileId, success: true });
        continue;
      }

      let dek: Uint8Array;
      try {
        dek = await unwrapDekForCurrentUser({
          fileKeys: info.fileKeys,
          roomMemberKeys: senderCandidates,
          currentUserId,
          currentIdentity: identity,
          fileId: fileId,
        });
      } catch (e) {
        fileResults.push({
          fileId: fileId,
          success: false,
          error: e instanceof Error ? e.message : "unwrap failed",
        });
        continue;
      }

      let newKeys: ServerAccessKeyDto[];
      try {
        newKeys = await wrapDekForRecipients({
          dek,
          senderIdentity: identity,
          senderUserId: currentUserId,
          recipients,
          fileId: fileId,
        });
      } finally {
        wipeDek(dek);
      }

      const allKeys: ServerAccessKeyDto[] = [
        ...info.fileKeys.map((k) => ({
          userId: k.userId,
          publicKeyId: k.publicKeyId || "",
          privateKeyEnc: k.privateKeyEnc,
        })),
        ...newKeys,
      ];
      try {
        const written = await setFileEncryptionKeys(fileId, allKeys);
        for (const userId of written?.skippedUserIds ?? []) {
          const id = String(userId);
          if (!recipients.some((r) => String(r.userId) === id)) continue;
          missingFileIdsByMember[id] = [
            ...(missingFileIdsByMember[id] ?? []),
            fileId,
          ];
        }
        fileResults.push({ fileId: fileId, success: true });
      } catch (e) {
        const err = e as {
          response?: { status?: number; data?: unknown };
          message?: string;
        };
        const status = err?.response?.status;
        // biome-ignore lint/suspicious/noConsole: structured backfill failure log for incident triage.
        console.error(
          "[ENCRYPTION] setFileEncryptionKeys failed (backfill)",
          {
            fileId: fileId,
            status,
            data: err?.response?.data,
            message: err?.message,
          },
        );
        fileResults.push({
          fileId: fileId,
          success: false,
          error:
            e instanceof Error
              ? `${e.message}${status ? ` (HTTP ${status})` : ""}`
              : "PUT /files/{id}/access failed",
        });
      }
    } catch (error) {
      fileResults.push({
        fileId: fileId,
        success: false,
        error: error instanceof Error ? error.message : "unknown error",
      });
    }
    onProgress?.(i + 1, fileIds.length);
  }

  const skippedMembers: SkippedRoomMember[] = [];
  for (const [id, reason] of skippedReasons) {
    skippedMembers.push({ id, reason });
  }

  return { fileResults, skippedMembers, missingFileIdsByMember };
}

export async function roomHasEncryptedFiles(roomId: number): Promise<boolean> {
  const filter = FilesFilter.getDefault();
  filter.page = 0;
  filter.pageCount = 1;

  try {
    const folderData = await getFolder(roomId, filter);
    if (folderData.files.some((file) => file.encrypted)) return true;
    for (const subfolder of folderData.folders) {
      if (await roomHasEncryptedFiles(subfolder.id)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export interface MemberValidationResult {
  valid: NewRoomMember[];
  skipped: SkippedRoomMember[];
}

export async function validateMembersForEncryption(
  roomId: number,
  memberIds: string[],
  scopeUserId: string,
  onKeyChange?: KeyMismatchResolver,
  displayNames?: Record<string, string | undefined>,
  /** The keys to verify against; the room's member keys when left out. */
  keys?: Map<string, RoomMemberPublicKey>,
): Promise<MemberValidationResult> {
  const valid: NewRoomMember[] = [];
  const skipped: SkippedRoomMember[] = [];
  if (memberIds.length === 0) return { valid, skipped };

  const keyByUserId = keys ?? (await loadRoomMemberKeys(roomId)).keyByUserId;

  for (const memberId of memberIds) {
    const displayName = displayNames?.[memberId];
    const candidate = keyByUserId.get(String(memberId))?.publicKey;
    if (!candidate) {
      skipped.push({ id: memberId, displayName, reason: "no-key" });
      continue;
    }
    const verification = await verifyMemberKey({
      userId: memberId,
      scopeUserId,
      displayName,
      resolver: onKeyChange,
      publicKey: candidate,
    });
    if (verification.kind === "ok") {
      valid.push({ id: memberId, publicKey: verification.publicKey });
    } else {
      skipped.push({
        id: memberId,
        displayName,
        reason: verification.kind,
      });
    }
  }
  return { valid, skipped };
}
