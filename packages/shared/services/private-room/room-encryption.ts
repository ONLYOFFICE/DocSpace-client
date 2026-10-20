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
import { getFilePublicKeys } from "../../api/privacy";
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
}

export interface AddMembersResult {
  fileResults: FileEncryptionOpResult[];
  skippedMembers: SkippedRoomMember[];
}

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

    hasMore = folderData.files.length === pageSize;
    page++;
  }
  return allFiles;
}

export async function addMembersToEncryptedRoom(
  roomId: number,
  newMembers: NewRoomMember[],
  options: RoomEncryptionOptions,
): Promise<AddMembersResult> {
  const fileResults: FileEncryptionOpResult[] = [];
  const { currentUserId, identity, onProgress, onKeyChange } = options;

  const validMembers = newMembers.filter((m) => m.id);
  if (validMembers.length === 0) return { fileResults, skippedMembers: [] };

  const encryptedFiles = await getEncryptedFilesInRoom(roomId);
  if (encryptedFiles.length === 0) return { fileResults, skippedMembers: [] };

  const { keyByUserId, list: roomMemberKeys } =
    await loadRoomMemberKeys(roomId);

  onProgress?.(0, encryptedFiles.length);

  const memberKeyCache = new Map<string, RoomMemberPublicKey | null>();
  const skippedReasons = new Map<string, SkippedMemberReason>();
  const memberDisplayName = new Map<string, string | undefined>();
  for (const member of validMembers) {
    memberDisplayName.set(member.id, member.displayName);
  }

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

  for (let i = 0; i < encryptedFiles.length; i++) {
    const file = encryptedFiles[i];
    try {
      const info = await getFileEncryptionAccess(file.id);
      if (!info?.fileKeys || info.fileKeys.length === 0) {
        fileResults.push({
          fileId: file.id,
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
          fileId: file.id,
        });
      } catch (e) {
        fileResults.push({
          fileId: file.id,
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
        fileResults.push({ fileId: file.id, success: true });
        continue;
      }

      let newKeys: ServerAccessKeyDto[];
      try {
        newKeys = await wrapDekForRecipients({
          dek,
          senderIdentity: identity,
          senderUserId: currentUserId,
          recipients,
          fileId: file.id,
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
      await setFileEncryptionKeys(file.id, allKeys);

      fileResults.push({ fileId: file.id, success: true });
    } catch (error) {
      fileResults.push({
        fileId: file.id,
        success: false,
        error: error instanceof Error ? error.message : "unknown error",
      });
    }
    onProgress?.(i + 1, encryptedFiles.length);
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

  return { fileResults, skippedMembers };
}

/**
 * Re-wraps every encrypted file of the room for every member with a verified
 * key other than the caller. The caller cannot see other users' entries, so
 * the sweep is blind by design and its callers bound how often it runs.
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
): Promise<AddMembersResult> {
  const fileResults: FileEncryptionOpResult[] = [];
  const { currentUserId, identity, onProgress, onKeyChange } = options;

  const encryptedFiles = await getEncryptedFilesInRoom(roomId);
  if (encryptedFiles.length === 0) {
    return { fileResults, skippedMembers: [] };
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

  onProgress?.(0, encryptedFiles.length);

  for (let i = 0; i < encryptedFiles.length; i++) {
    const file = encryptedFiles[i];
    try {
      const [filePublicKeys, info] = await Promise.all([
        getFilePublicKeys(file.id),
        getFileEncryptionAccess(file.id),
      ]);

      if (!info?.fileKeys || info.fileKeys.length === 0) {
        fileResults.push({
          fileId: file.id,
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

      const candidates = Array.from(selectMemberKeys(filePublicKeys)).flatMap(
        ([userId, key]) => (userId === String(currentUserId) ? [] : [key]),
      );

      if (candidates.length === 0) {
        fileResults.push({ fileId: file.id, success: true });
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
        fileResults.push({ fileId: file.id, success: true });
        continue;
      }

      let dek: Uint8Array;
      try {
        dek = await unwrapDekForCurrentUser({
          fileKeys: info.fileKeys,
          roomMemberKeys: senderCandidates,
          currentUserId,
          currentIdentity: identity,
          fileId: file.id,
        });
      } catch (e) {
        fileResults.push({
          fileId: file.id,
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
          fileId: file.id,
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
        await setFileEncryptionKeys(file.id, allKeys);
        fileResults.push({ fileId: file.id, success: true });
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
            fileId: file.id,
            status,
            data: err?.response?.data,
            message: err?.message,
          },
        );
        fileResults.push({
          fileId: file.id,
          success: false,
          error:
            e instanceof Error
              ? `${e.message}${status ? ` (HTTP ${status})` : ""}`
              : "PUT /files/{id}/access failed",
        });
      }
    } catch (error) {
      fileResults.push({
        fileId: file.id,
        success: false,
        error: error instanceof Error ? error.message : "unknown error",
      });
    }
    onProgress?.(i + 1, encryptedFiles.length);
  }

  const skippedMembers: SkippedRoomMember[] = [];
  for (const [id, reason] of skippedReasons) {
    skippedMembers.push({ id, reason });
  }

  return { fileResults, skippedMembers };
}

export async function revokeMemberFromEncryptedRoom(
  roomId: number,
  revokedUserIds: string | string[],
  options: { onProgress?: (processed: number, total: number) => void },
): Promise<FileEncryptionOpResult[]> {
  const results: FileEncryptionOpResult[] = [];
  const { onProgress } = options;
  const revokedSet = new Set(
    (Array.isArray(revokedUserIds) ? revokedUserIds : [revokedUserIds]).map(
      String,
    ),
  );
  if (revokedSet.size === 0) return results;

  const encryptedFiles = await getEncryptedFilesInRoom(roomId);
  if (encryptedFiles.length === 0) return results;

  onProgress?.(0, encryptedFiles.length);

  for (let i = 0; i < encryptedFiles.length; i++) {
    const file = encryptedFiles[i];
    try {
      const info = await getFileEncryptionAccess(file.id);
      if (!info?.fileKeys) {
        results.push({
          fileId: file.id,
          success: false,
          error: "no encryption keys for file",
        });
        continue;
      }
      const remaining = info.fileKeys.filter(
        (k) => !revokedSet.has(String(k.userId)),
      );
      if (remaining.length === info.fileKeys.length) {
        results.push({ fileId: file.id, success: true });
        continue;
      }
      await setFileEncryptionKeys(
        file.id,
        remaining.map((k) => ({
          userId: k.userId,
          publicKeyId: k.publicKeyId || "",
          privateKeyEnc: k.privateKeyEnc,
        })),
      );
      results.push({ fileId: file.id, success: true });
    } catch (error) {
      results.push({
        fileId: file.id,
        success: false,
        error: error instanceof Error ? error.message : "unknown error",
      });
    }
    onProgress?.(i + 1, encryptedFiles.length);
  }
  return results;
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
): Promise<MemberValidationResult> {
  const valid: NewRoomMember[] = [];
  const skipped: SkippedRoomMember[] = [];
  if (memberIds.length === 0) return { valid, skipped };

  const { keyByUserId } = await loadRoomMemberKeys(roomId);

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
