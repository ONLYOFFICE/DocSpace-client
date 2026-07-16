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

import sumBy from "lodash/sumBy";
import { RoomsType } from "@docspace/shared/enums";
import {
  shouldEncryptUpload,
  willEncryptUploadItem,
} from "@docspace/shared/services/private-room/encrypted-upload";
import {
  getActiveKeyId,
  selectActiveKey,
} from "@docspace/shared/services/encryption/active-key-preference";
import { countActiveUploadsForRoom } from "@docspace/shared/utils/uploadErrors";

import type { TUploadFile } from "./helpers";
import type { default as UploadDataStore } from "../UploadDataStore";

export type NewPercentDeps = {
  files: TUploadFile[];
  uploaded: boolean;
};

export function getNewPercentImpl(
  uploadedSize: number,
  indexOfFile: number,
  deps: NewPercentDeps,
) {
  const newTotalSize = sumBy(deps.files, (f) =>
    f.file && !deps.uploaded ? f.file.size : 0,
  );
  const totalUploadedFiles = deps.files.filter((_, i) => i < indexOfFile);
  const totalUploadedSize = sumBy(totalUploadedFiles, (f) =>
    f.file && !deps.uploaded ? f.file.size : 0,
  );
  const newPercent =
    ((uploadedSize + totalUploadedSize) / newTotalSize) * 100;

  return newPercent;
}

export function getFilesPercentImpl(deps: {
  uploadedFilesHistory: TUploadFile[];
}) {
  const percentCurrentFileHistory = sumBy(
    deps.uploadedFilesHistory,
    (f) => f.percent,
  );

  const commonPercent = deps.uploadedFilesHistory.length * 100;
  const newPercent = (percentCurrentFileHistory / commonPercent) * 100;

  return newPercent;
}

export function getConversationPercentImpl(
  fileIndex: number,
  deps: { files: TUploadFile[] },
) {
  const length = deps.files.filter((f) => f.needConvert).length;
  return (fileIndex / length) * 100;
}

export function getActiveUploadCountForRoomImpl(
  roomId: string | number | null | undefined,
  deps: { files: TUploadFile[] },
) {
  return countActiveUploadsForRoom(deps.files, roomId);
}

export function getUploadedFileImpl(
  id: string,
  deps: { files: TUploadFile[] },
) {
  return deps.files.filter((f) => f.uniqueId === id);
}

export function getUserEncryptionKeysImpl(self: UploadDataStore): {
  publicKey: string | null;
  userId: string | null;
  publicKeyId: string | null;
} {
  const keys = self.userStore?.encryptionKeys;
  const userId = self.userStore?.user?.id;

  if (!Array.isArray(keys) || keys.length === 0 || !userId) {
    return { publicKey: null, userId: null, publicKeyId: null };
  }

  const userIdStr = String(userId);
  const activeKey = selectActiveKey(keys, getActiveKeyId(userIdStr));
  if (!activeKey) {
    return { publicKey: null, userId: null, publicKeyId: null };
  }

  return {
    publicKey: activeKey.publicKey || null,
    userId: userIdStr,
    publicKeyId: activeKey.id || null,
  };
}

export function shouldEncryptCurrentUploadImpl(self: UploadDataStore) {
  const isPrivate = self.treeFoldersStore.isPrivacyFolder;
  const roomType = isPrivate
    ? RoomsType.CustomRoom
    : self.selectedFolderStore.roomType;
  const { publicKey, userId } = self.getUserEncryptionKeys();
  return (
    shouldEncryptUpload(roomType as RoomsType, isPrivate) &&
    !!publicKey &&
    !!userId
  );
}

export function willEncryptItemImpl(
  self: UploadDataStore,
  item: TUploadFile | null | undefined,
) {
  if (!item) return false;
  const { publicKey, userId } = self.getUserEncryptionKeys();
  return willEncryptUploadItem(
    {
      uploadContext: item.file?.uploadContext,
      alreadyEncrypted: item.encrypted,
      publicKey,
      userId,
    },
    self.getUploadFolderContext(),
  );
}
