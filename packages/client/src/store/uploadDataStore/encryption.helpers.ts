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
import { RoomsType } from "@docspace/shared/enums";
import {
  setFileEncryptionKeys,
  getFileEncryptionAccess,
  removeFiles,
} from "@docspace/shared/api/files";
import { getRoomEncryptionKeys } from "@docspace/shared/api/privacy";
import { getUserById } from "@docspace/shared/api/people";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { selectMemberKeys } from "@docspace/shared/services/private-room/room-member-keys";
import {
  verifyMemberKeys,
  type SkippedMemberKey,
} from "@docspace/shared/services/private-room/member-key-verification";
import { wipeDek } from "@docspace/shared/services/encryption/file-keys";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import {
  prepareEncryptedUpload,
  resolveItemRoomContext,
} from "@docspace/shared/services/private-room/encrypted-upload";
import type { MoveSourceRef } from "@docspace/shared/services/private-room/encrypted-upload";
import { forgetEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import uniqueid from "lodash/uniqueId";

import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";

import i18n from "../../i18n";

import type {
  TUploadBrowserFile,
  TUploadFile,
  TUploadTarget,
} from "./helpers";
import type { default as UploadDataStore } from "../UploadDataStore";

// Spec: private-rooms/file-operations, "Files leaving a private room are decrypted".
export async function deleteMovedEncryptedSourceImpl(
  self: UploadDataStore,
  moveSource: MoveSourceRef,
) {
  const pbData = {
    operation: OPERATIONS_NAME.trash,
    operationId: uniqueid("operation_"),
  };
  const fileId = Number(moveSource.fileId);

  try {
    const [operation] = await removeFiles([], [fileId], false, true);
    if (!operation || operation.error) {
      throw new Error(operation?.error || "Delete operation was not started");
    }

    const result = await self.loopFilesOperations(operation, pbData);
    if (result?.error) throw new Error(result.error);

    self.secondaryProgressDataStore.setSecondaryProgressBarData({
      ...pbData,
      completed: true,
    });
    self.filesStore.removeFiles([fileId]);
    forgetEncryptedFilename(fileId);
  } catch (error) {
    console.error("[ENCRYPTION] Failed to delete the source of a moved file", {
      fileId,
      error,
    });
    self.secondaryProgressDataStore.setSecondaryProgressBarData({
      ...pbData,
      completed: true,
      alert: true,
    });
    toastr.error(
      i18n.t("Common:EncryptedMovePartialFailure", {
        names: moveSource.title,
      }),
    );
  }
}

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
    // Spec: private-rooms/encryption-core, "File access list holds one wrap per member".
    const fanOut = () =>
      self.encryptKeysForRoomMembers(
        fileId,
        currentUserId,
        roomId,
        dek,
        identity,
      );
    const result = self.memberFanOutChain.then(fanOut, fanOut);
    self.memberFanOutChain = result.then(
      () => undefined,
      () => undefined,
    );
    return await result;
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
): Promise<SkippedMemberKey[]> {
  try {
    if (!roomId) {
      console.error(
        "[ENCRYPTION] encryptKeysForRoomMembers called without roomId",
      );
      return [];
    }
    if (!dek || !identity) {
      console.error(
        "[ENCRYPTION] encryptKeysForRoomMembers called without dek/identity",
      );
      return [];
    }
    const [publicKeys, encryptionInfo] = await Promise.all([
      getRoomEncryptionKeys(roomId),
      getFileEncryptionAccess(fileId),
    ]);

    const existingFileKeys = encryptionInfo.fileKeys ?? [];

    // Spec: private-rooms/encryption-core, "One access-list entry per user".
    const recipients: {
      userId: string;
      publicKey: string;
      publicKeyId: string;
    }[] = [];
    for (const [uid, key] of selectMemberKeys(publicKeys)) {
      if (uid === String(currentUserId)) continue;
      recipients.push({
        userId: uid,
        publicKey: key.publicKey,
        publicKeyId: key.publicKeyId || "",
      });
    }
    if (recipients.length === 0) return [];

    const { verified, skipped } = await verifyMemberKeys(recipients, {
      scopeUserId: String(currentUserId),
      refusals: self.memberKeyRefusals,
    });
    if (verified.length === 0) return skipped;

    const newKeys = await wrapDekForRecipients({
      dek,
      senderIdentity: identity,
      senderUserId: String(currentUserId),
      recipients: verified,
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
    return skipped;
  } catch (error) {
    console.error(
      "[ENCRYPTION] Failed to encrypt keys for room members:",
      error,
    );
    return [];
  }
}

/**
 * Names the members a file's fan-out left out and warns once per member and
 * session; returns the members with their display names for the panel row.
 * Spec: private-rooms/encryption-core, "File access list holds one wrap per member".
 */
export async function reportSkippedMembersImpl(
  self: UploadDataStore,
  skipped: SkippedMemberKey[],
): Promise<SkippedMemberKey[]> {
  const named = await Promise.all(
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

  const fresh = named.filter(
    (m) => !self.reportedSkippedMemberIds.has(m.userId),
  );
  if (fresh.length > 0) {
    for (const m of fresh) self.reportedSkippedMemberIds.add(m.userId);
    toastr.warning(
      i18n.t("Common:EncryptedUploadNotSharedWith", {
        names: fresh.map((m) => m.displayName).join(", "),
      }),
    );
  }
  return named;
}

/** The given items, or the uploads of the queue that have not started yet. */
const batchItems = (self: UploadDataStore, items?: TUploadFile[]) =>
  items ??
  self.files.filter(
    (item) =>
      !item.inAction &&
      !item.error &&
      !item.cancel &&
      item.action === "upload",
  );

export async function ensureEncryptionUnlockedForBatchImpl(
  self: UploadDataStore,
  items?: TUploadFile[],
) {
  const { userId } = self.getUserEncryptionKeys();
  if (!userId) return true;

  const needsUnlock = batchItems(self, items).some((item) =>
    self.willEncryptItem(item),
  );

  if (!needsUnlock) return true;

  const identity = await requireUnlock(String(userId));
  return !!identity;
}

// Spec: private-rooms/file-operations, "Uploads into a private room are encrypted on the client".
export function cancelEncryptedBatchUploadImpl(
  self: UploadDataStore,
  items?: TUploadFile[],
) {
  const errorMessage = i18n.t("Common:EncryptionLockedUpload");

  runInAction(() => {
    batchItems(self, items).forEach((item) => {
      if (!self.willEncryptItem(item)) return;

      item.inAction = true;
      item.error = errorMessage;
      item.isQuotaError = false;
      item.percent = 0;
      const historyItem = self.uploadedFilesHistory.find(
        (f) => f.uniqueId === item.uniqueId,
      );
      if (historyItem) {
        historyItem.error = errorMessage;
        historyItem.isQuotaError = false;
        historyItem.percent = 0;
      }
    });

    self.percent = self.getFilesPercent();
  });

  try {
    toastr.info(i18n.t("Common:EncryptionUploadCancelled"));
  } catch {
  }
}

export async function prepareFileForEncryptedUploadImpl(
  file: TUploadBrowserFile,
  target: TUploadTarget,
  onProgress?: (progress: number) => void,
) {
  const { roomType, isPrivate } = resolveItemRoomContext(
    file?.uploadContext,
    target,
  );
  return prepareEncryptedUpload({
    file,
    folderId: target.folderId as number,
    roomType: roomType || RoomsType.CustomRoom,
    isPrivate,
    onProgress,
  });
}
