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

import { runInAction } from "mobx";
import { getI18n } from "react-i18next";
import { RoomsType } from "@docspace/shared/enums";
import {
  setFileEncryptionKeys,
  getFileEncryptionAccess,
} from "@docspace/shared/api/files";
import { getRoomEncryptionKeys } from "@docspace/shared/api/privacy";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { wipeDek } from "@docspace/shared/services/encryption/file-keys";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import { prepareEncryptedUpload } from "@docspace/shared/services/private-room/encrypted-upload";
import { toastr } from "@docspace/ui-kit/components/toast";

import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";

import type { TUploadBrowserFile } from "./helpers";
import type { default as UploadDataStore } from "../UploadDataStore";

// Per-upload DEK/room-key wrapping and the encrypted-batch gates extracted
// from UploadDataStore (Phase 5 of uploadDataStore/REFACTORING_PLAN.md). These
// are side-effect heavy (HTTP key exchange, secret-storage unlock, MobX
// mutations, toastr) and carry the DEK-hygiene invariant (§3.4.1): the plaintext
// DEK is wiped in wrapForSelfThenRoom's finally on every path. Transferred
// verbatim via the self-technique; the encryption selectors they call
// (getUserEncryptionKeys/willEncryptItem/getFilesPercent) live on the store and
// are invoked as self.*().

export async function wrapForSelfThenRoomImpl(
  self: UploadDataStore,
  fileId: number,
  currentUserId: string,
  publicKeyBase64: string,
  publicKeyId: string,
  dek: Uint8Array,
  roomId: number | string | null,
) {
  try {
    const identity = await requireUnlock(currentUserId);
    if (!identity) {
      throw new Error(
        "Encryption identity is locked — cannot wrap DEK for upload",
      );
    }
    const ownWraps = await wrapDekForRecipients({
      dek,
      senderIdentity: identity,
      senderUserId: currentUserId,
      recipients: [
        {
          userId: currentUserId,
          publicKey: publicKeyBase64,
          publicKeyId,
        },
      ],
      fileId,
    });
    await setFileEncryptionKeys(fileId, ownWraps);
    await self.encryptKeysForRoomMembers(
      fileId,
      currentUserId,
      roomId,
      dek,
      identity,
    );
  } finally {
    wipeDek(dek);
  }
}

export async function encryptKeysForRoomMembersImpl(
  self: UploadDataStore,
  fileId: number,
  currentUserId: string,
  roomId: number | string | null,
  dek: Uint8Array,
  identity: IdentityKeyPair,
) {
  try {
    if (!roomId) {
      console.error(
        "[ENCRYPTION] encryptKeysForRoomMembers called without roomId",
      );
      return;
    }
    if (!dek || !identity) {
      console.error(
        "[ENCRYPTION] encryptKeysForRoomMembers called without dek/identity",
      );
      return;
    }
    const [publicKeys, encryptionInfo] = await Promise.all([
      getRoomEncryptionKeys(roomId),
      getFileEncryptionAccess(fileId),
    ]);

    const existingFileKeys = encryptionInfo.fileKeys ?? [];
    const existingKeyPairs = new Set(
      existingFileKeys.map((k) => `${String(k.userId)}:${k.publicKeyId || ""}`),
    );

    const recipients: {
      userId: string;
      publicKey: string;
      publicKeyId: string;
    }[] = [];
    if (Array.isArray(publicKeys)) {
      for (const pk of publicKeys) {
        if (!pk.publicKey || !pk.userId) continue;
        const uid = String(pk.userId);
        if (uid === String(currentUserId)) continue;
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

    const newKeys = await wrapDekForRecipients({
      dek,
      senderIdentity: identity,
      senderUserId: String(currentUserId),
      recipients,
      fileId,
    });

    if (newKeys.length > 0) {
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
  } catch (error) {
    console.error(
      "[ENCRYPTION] Failed to encrypt keys for room members:",
      error,
    );
  }
}

export async function ensureEncryptionUnlockedForBatchImpl(
  self: UploadDataStore,
) {
  const { userId } = self.getUserEncryptionKeys();
  if (!userId) return true;

  const needsUnlock = self.files.some(
    (item) =>
      !item.inAction &&
      !item.error &&
      !item.cancel &&
      item.action === "upload" &&
      self.willEncryptItem(item),
  );

  if (!needsUnlock) return true;

  const identity = await requireUnlock(String(userId));
  return !!identity;
}

export function cancelEncryptedBatchUploadImpl(self: UploadDataStore) {
  runInAction(() => {
    self.files.forEach((item) => {
      if (
        item.inAction ||
        item.error ||
        item.cancel ||
        item.action !== "upload" ||
        !self.willEncryptItem(item)
      )
        return;

      item.cancel = true;
      item.action = "uploaded";
      item.percent = 100;
      self.uploadedFilesHistory = self.uploadedFilesHistory.filter(
        (f) => f.uniqueId !== item.uniqueId,
      );
    });

    self.percent = self.getFilesPercent();
  });

  try {
    toastr.info(getI18n().t("Common:EncryptionUploadCancelled"));
  } catch {
    //
  }
}

export async function prepareFileForEncryptedUploadImpl(
  self: UploadDataStore,
  file: TUploadBrowserFile,
  folderId: number | string | null | undefined,
  onProgress?: (progress: number) => void,
) {
  const overrideCtx = file?.uploadContext;
  const ancestorIsPrivate = self.treeFoldersStore.isPrivacyFolder;
  const roomType =
    overrideCtx?.roomType ??
    (ancestorIsPrivate
      ? RoomsType.CustomRoom
      : self.selectedFolderStore.roomType);
  const isPrivate =
    overrideCtx && "isPrivate" in overrideCtx
      ? overrideCtx.isPrivate
      : ancestorIsPrivate;
  return prepareEncryptedUpload({
    file,
    // UploadConfig.folderId is declared as number, but the
    // original .js forwarded toFolderId which may be a string/null for
    // third-party folders.
    folderId: folderId as number,
    roomType: roomType || RoomsType.CustomRoom,
    isPrivate: isPrivate || false,
    onProgress,
  });
}
