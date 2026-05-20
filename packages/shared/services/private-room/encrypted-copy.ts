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

import { getFileEncryptionAccess } from "../../api/files";
import { decryptFile, wipeDek } from "../encryption/file-keys";
import { unwrapDekForCurrentUser } from "../encryption/room-file-access";
import { reportPotentialGhostState } from "../encryption/ghost-state-notifier";
import type { IdentityKeyPair } from "../encryption/types";
import { loadRoomMemberKeysSafe } from "./room-member-keys";

type EncryptedItem = {
  id: number;
  title: string;
  viewUrl: string;
  contentType?: string;
  fileExst?: string;
};

export async function decryptEncryptedItemToFile(
  item: EncryptedItem,
  currentUserId: string,
  identity: IdentityKeyPair,
  roomId: number | string,
): Promise<File> {
  const encryptionInfo = await getFileEncryptionAccess(item.id);
  if (!encryptionInfo || !encryptionInfo.fileKeys) {
    throw new Error("Encryption access info missing");
  }

  const hasOwnEntry = encryptionInfo.fileKeys.some(
    (k) => String(k.userId) === String(currentUserId),
  );
  if (!hasOwnEntry) {
    throw new Error("Current user has no decrypt access to this file");
  }

  const response = await fetch(item.viewUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch encrypted blob: ${response.status}`);
  }
  const encryptedData = await response.arrayBuffer();

  const roomMemberKeys = await loadRoomMemberKeysSafe(roomId);

  let dek;
  try {
    dek = await unwrapDekForCurrentUser({
      fileKeys: encryptionInfo.fileKeys,
      roomMemberKeys,
      currentUserId,
      currentIdentity: identity,
      fileId: item.id,
    });
  } catch (error) {
    reportPotentialGhostState(error);
    throw error;
  }

  try {
    const { data: decryptedBlob, fileName: decryptedName } = await decryptFile(
      encryptedData,
      dek,
      {},
    );
    const realName = decryptedName || item.title;
    return new File([decryptedBlob], realName, {
      type: item.contentType || "application/octet-stream",
    });
  } finally {
    wipeDek(dek);
  }
}

export function addCopySuffix(name: string, n: number = 1): string {
  const dotIdx = name.lastIndexOf(".");
  if (dotIdx > 0) {
    const base = name.slice(0, dotIdx);
    const ext = name.slice(dotIdx);
    return `${base} (${n})${ext}`;
  }
  return `${name} (${n})`;
}

export type UploadDestContext = {
  roomType?: number;
  isPrivate: boolean;
};

export type TaggedUploadFile = File & {
  parentFolderId?: number | string;
  uploadContext?: UploadDestContext;
};

export function tagFileForCopy(
  file: File,
  destFolderId: number | string,
  destContext: UploadDestContext,
): TaggedUploadFile {
  const tagged = file as TaggedUploadFile;
  tagged.parentFolderId = destFolderId;
  tagged.uploadContext = destContext;
  return tagged;
}
