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

import { getFileEncryptionAccess } from "../../api/files";
import { decryptFile, wipeDek } from "./fileKeys";
import {
  unwrapDekForCurrentUser,
  type RoomMemberPublicKey,
} from "./roomFileAccess";
import type { IdentityKeyPair } from "./types";

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

  const dek = await unwrapDekForCurrentUser({
    fileKeys: encryptionInfo.fileKeys,
    roomMemberKeys: (encryptionInfo.userKeys ?? []) as RoomMemberPublicKey[],
    currentUserId,
    currentIdentity: identity,
    fileId: item.id,
  });

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
