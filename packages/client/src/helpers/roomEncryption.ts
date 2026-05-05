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

// Per-room orchestration: enumerate files, wrap/unwrap DEKs, post results.
// Caller must supply an unlocked identity — these helpers never prompt.

import {
  getFolder,
  getFileEncryptionAccess,
  setFileEncryptionKeys,
} from "@docspace/shared/api/files";
import { getUserById } from "@docspace/shared/api/people";
import {
  unwrapDekForCurrentUser,
  wrapDekForRecipients,
  type RoomMemberPublicKey,
} from "@docspace/shared/services/encryption/roomFileAccess";
import { wipeDek } from "@docspace/shared/services/encryption/fileKeys";
import {
  getTofuStore,
  getKeyMismatchHandler,
  type KeyMismatchResolver,
} from "@docspace/shared/services/encryption/tofuStore";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile } from "@docspace/shared/api/files/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type {
  IdentityKeyPair,
  ServerAccessKeyDto,
} from "@docspace/shared/services/encryption/types";

export interface NewRoomMember {
  id: string;
  /** Base64 raw X25519 public key. Server lookup if absent. */
  publicKey?: string;
  /** For TOFU mismatch dialogs. */
  displayName?: string;
}

export interface FileEncryptionOpResult {
  fileId: number;
  success: boolean;
  error?: string;
}

export interface RoomEncryptionOptions {
  currentUserId: string;
  identity: IdentityKeyPair;
  onProgress?: (processed: number, total: number) => void;
  /** Override for the globally-registered key-mismatch handler. */
  onKeyChange?: KeyMismatchResolver;
}

async function getEncryptedFilesInRoom(roomId: number): Promise<TFile[]> {
  const allFiles: TFile[] = [];
  let page = 1;
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

async function getUserPublicKey(userId: string): Promise<string | null> {
  try {
    const user = (await getUserById(userId)) as TUser;
    return (user as TUser & { publicKey?: string }).publicKey || null;
  } catch {
    return null;
  }
}

/** Returns null on lookup failure or refused TOFU mismatch. */
async function getVerifiedUserPublicKey(
  userId: string,
  scopeUserId: string,
  displayName: string | undefined,
  resolver: KeyMismatchResolver | undefined,
  preFetchedKey?: string,
): Promise<string | null> {
  let publicKey = preFetchedKey;
  if (!publicKey) {
    publicKey = (await getUserPublicKey(userId)) ?? undefined;
    if (!publicKey) return null;
  }

  const tofu = getTofuStore(scopeUserId);
  const result = await tofu.checkKey(userId, publicKey);
  if (result.kind === "first-seen" || result.kind === "match") {
    return publicKey;
  }

  // Mismatch: ask the resolver.
  const handler = resolver ?? getKeyMismatchHandler();
  if (!handler) return null;

  let decision: "accept" | "refuse";
  try {
    decision = await handler({
      userId,
      knownKey: result.known.publicKey,
      newKey: result.submitted,
      knownFirstSeenAt: result.known.firstSeenAt,
      knownLastSeenAt: result.known.lastSeenAt,
      displayName,
    });
  } catch (e) {
    if (typeof console !== "undefined") {
      console.error("Key mismatch resolver threw:", e);
    }
    return null;
  }
  if (decision !== "accept") return null;
  await tofu.acceptKey(userId, publicKey);
  return publicKey;
}

export async function addMembersToEncryptedRoom(
  roomId: number,
  newMembers: NewRoomMember[],
  options: RoomEncryptionOptions,
): Promise<FileEncryptionOpResult[]> {
  const results: FileEncryptionOpResult[] = [];
  const { currentUserId, identity, onProgress, onKeyChange } = options;

  const validMembers = newMembers.filter((m) => m.id);
  if (validMembers.length === 0) return results;

  const encryptedFiles = await getEncryptedFilesInRoom(roomId);
  if (encryptedFiles.length === 0) return results;

  onProgress?.(0, encryptedFiles.length);

  // Resolve each new member's public key once. Each lookup goes through
  // the TOFU store; if the resolver returns null we treat that member as
  // unavailable (no wraps will be made for them on this run).
  const publicKeyCache = new Map<string, string | null>();
  const memberDisplayName = new Map<string, string | undefined>();
  for (const member of validMembers) {
    memberDisplayName.set(member.id, member.displayName);
  }

  for (let i = 0; i < encryptedFiles.length; i++) {
    const file = encryptedFiles[i];
    try {
      const info = await getFileEncryptionAccess(file.id);
      if (!info?.fileKeys || info.fileKeys.length === 0) {
        results.push({
          fileId: file.id,
          success: false,
          error: "no encryption keys for file",
        });
        continue;
      }

      // Unwrap our copy.
      let dek: Uint8Array | null = null;
      try {
        dek = await unwrapDekForCurrentUser({
          fileKeys: info.fileKeys,
          roomMemberKeys: info.userKeys ?? [],
          currentUserId,
          currentIdentity: identity,
          fileId: file.id,
        });
      } catch (e) {
        results.push({
          fileId: file.id,
          success: false,
          error: e instanceof Error ? e.message : "unwrap failed",
        });
        continue;
      }

      // Build the recipient list: only members who don't already have access.
      const existingIds = new Set(info.fileKeys.map((k) => String(k.userId)));
      const recipients: RoomMemberPublicKey[] = [];
      for (const m of validMembers) {
        if (existingIds.has(String(m.id))) continue;

        let pk = publicKeyCache.get(m.id);
        if (pk === undefined) {
          const fromInfo = info.userKeys?.find(
            (uk) => String(uk.userId) === String(m.id),
          );
          const candidate = m.publicKey || fromInfo?.publicKey;
          pk = await getVerifiedUserPublicKey(
            m.id,
            currentUserId,
            memberDisplayName.get(m.id),
            onKeyChange,
            candidate,
          );
          publicKeyCache.set(m.id, pk);
        }
        if (!pk) continue;
        recipients.push({ userId: m.id, publicKey: pk });
      }

      if (recipients.length === 0) {
        wipeDek(dek);
        results.push({ fileId: file.id, success: true });
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

/**
 * Drops the revoked user wraps from every encrypted file. Future files
 * will not be wrapped for them; an already-cached DEK still works locally.
 * Pass a list to revoke a whole group in one pass.
 */
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

/**
 * Re-wraps the user's own slot under a new identity for every accessible
 * file. The server-side identity envelope swap is the caller's job.
 */
export async function rotateOwnIdentityForRoom(
  roomId: number,
  options: {
    currentUserId: string;
    oldIdentity: IdentityKeyPair;
    newIdentity: IdentityKeyPair;
    onProgress?: (processed: number, total: number) => void;
  },
): Promise<FileEncryptionOpResult[]> {
  const results: FileEncryptionOpResult[] = [];
  const { currentUserId, oldIdentity, newIdentity, onProgress } = options;

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

      // Unwrap with old identity.
      let dek: Uint8Array;
      try {
        dek = await unwrapDekForCurrentUser({
          fileKeys: info.fileKeys,
          roomMemberKeys: info.userKeys ?? [],
          currentUserId,
          currentIdentity: oldIdentity,
          fileId: file.id,
        });
      } catch (e) {
        results.push({
          fileId: file.id,
          success: false,
          error: e instanceof Error ? e.message : "unwrap failed",
        });
        continue;
      }

      // Re-wrap our slot with new identity. Sender = self.
      const myNewWraps = await wrapDekForRecipients({
        dek,
        senderIdentity: newIdentity,
        senderUserId: currentUserId,
        recipients: [
          {
            userId: currentUserId,
            publicKey: base64FromBytes(newIdentity.publicKey),
          },
        ],
        fileId: file.id,
      });
      wipeDek(dek);

      // Replace our entry; keep everyone else's wraps untouched.
      const updated = info.fileKeys.map((k) =>
        String(k.userId) === String(currentUserId)
          ? myNewWraps[0]
          : {
              userId: k.userId,
              publicKeyId: k.publicKeyId || "",
              privateKeyEnc: k.privateKeyEnc,
            },
      );
      await setFileEncryptionKeys(file.id, updated);
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
  filter.page = 1;
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

/** Drops users without keys or whose mismatched key was refused. */
export async function validateMembersForEncryption(
  memberIds: string[],
  scopeUserId: string,
  onKeyChange?: KeyMismatchResolver,
): Promise<NewRoomMember[]> {
  const validMembers: NewRoomMember[] = [];
  for (const memberId of memberIds) {
    const publicKey = await getVerifiedUserPublicKey(
      memberId,
      scopeUserId,
      undefined,
      onKeyChange,
    );
    if (publicKey) {
      validMembers.push({ id: memberId, publicKey });
    }
  }
  return validMembers;
}

function base64FromBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
