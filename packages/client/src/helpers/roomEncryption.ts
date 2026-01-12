// (c) Copyright Ascensio System SIA 2009-2025
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

import { getFolder } from "@docspace/shared/api/files";
import {
  getFileAccessKeys,
  setFileAccessKeys,
} from "@docspace/shared/api/privacy";
import { getUserById } from "@docspace/shared/api/people";
import { encryptionService } from "@docspace/shared/services/encryption";
import { requestUnlock } from "@docspace/shared/services/encryption/secretStorage";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile } from "@docspace/shared/api/files/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type {
  FileEncryptionMetadata,
  ServerAccessRequestKeyDto,
} from "@docspace/shared/services/encryption/types";

export interface NewRoomMember {
  id: string;
  publicKey?: string;
}

export interface FileKeyReEncryptionResult {
  fileId: number;
  success: boolean;
  error?: string;
}

export interface RoomEncryptionOptions {
  /** Current user's ID */
  currentUserId: string;
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
    return user.publicKey || null;
  } catch {
    console.error(`Failed to get public key for user ${userId}`);
    return null;
  }
}

function createMetadataFromKeys(
  fileKeys: Array<{
    userId: string;
    publicKeyId?: string;
    privateKeyEnc: string;
  }>,
): FileEncryptionMetadata {
  return {
    encrypted: true,
    version: 1,
    encryptionAlgorithm: "AES-256-GCM",
    keyEncryptionAlgorithm: "RSA-OAEP-SHA256",
    iv: "", // IV is embedded in the encrypted file content
    encryptedAt: new Date().toISOString(),
    encryptedKeys: fileKeys.map((key) => ({
      userId: key.userId,
      publicKeyId: key.publicKeyId || "",
      privateKeyEnc: key.privateKeyEnc,
    })),
  };
}

export async function reEncryptRoomKeysForNewMembers(
  roomId: number,
  newMembers: NewRoomMember[],
  options: RoomEncryptionOptions,
): Promise<FileKeyReEncryptionResult[]> {
  const results: FileKeyReEncryptionResult[] = [];
  const { currentUserId } = options;

  const usersNeedingKeys: NewRoomMember[] = [];

  for (const member of newMembers) {
    if (!member.id) continue;

    let publicKey: string | undefined = member.publicKey;
    if (!publicKey) {
      publicKey = (await getUserPublicKey(member.id)) ?? undefined;
    }

    if (publicKey) {
      usersNeedingKeys.push({ ...member, publicKey });
    } else {
      console.warn(
        `User ${member.id} does not have encryption keys set up - they will not be able to access encrypted files`,
      );
    }
  }

  if (usersNeedingKeys.length === 0) {
    return results;
  }

  const encryptedFiles = await getEncryptedFilesInRoom(roomId);

  if (encryptedFiles.length === 0) {
    return results;
  }

  const privateKey = await requestUnlock();

  if (!privateKey) {
    throw new Error("Failed to unlock private key - cannot re-encrypt files");
  }

  for (const file of encryptedFiles) {
    try {
      const existingKeys = await getFileAccessKeys(file.id);

      if (!existingKeys || existingKeys.length === 0) {
        results.push({
          fileId: file.id,
          success: false,
          error: "No encryption keys found for file",
        });
        continue;
      }

      const metadata = createMetadataFromKeys(existingKeys);

      const newKeys: ServerAccessRequestKeyDto[] = [];

      for (const member of usersNeedingKeys) {
        const alreadyHasAccess = existingKeys.some(
          (k) => k.userId === member.id,
        );
        if (alreadyHasAccess) {
          continue;
        }

        if (!member.publicKey) {
          continue;
        }

        try {
          const newKey = await encryptionService.createKeyForRecipient(
            metadata,
            privateKey,
            currentUserId,
            member.publicKey,
            member.id,
          );
          newKeys.push(newKey);
        } catch (error) {
          console.error(
            `Failed to create key for user ${member.id} for file ${file.id}:`,
            error,
          );
        }
      }

      if (newKeys.length > 0) {
        await setFileAccessKeys(file.id, newKeys);
      }

      results.push({
        fileId: file.id,
        success: true,
      });
    } catch (error) {
      results.push({
        fileId: file.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

export async function roomHasEncryptedFiles(roomId: number): Promise<boolean> {
  const filter = FilesFilter.getDefault();
  filter.page = 1;
  filter.pageCount = 1;

  try {
    const folderData = await getFolder(roomId, filter);

    const hasEncryptedFiles = folderData.files.some((file) => file.encrypted);
    if (hasEncryptedFiles) {
      return true;
    }

    for (const subfolder of folderData.folders) {
      if (await roomHasEncryptedFiles(subfolder.id)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export async function validateMembersForEncryption(
  memberIds: string[],
): Promise<NewRoomMember[]> {
  const validMembers: NewRoomMember[] = [];

  for (const memberId of memberIds) {
    const publicKey = await getUserPublicKey(memberId);
    if (publicKey) {
      validMembers.push({ id: memberId, publicKey });
    }
  }

  return validMembers;
}
