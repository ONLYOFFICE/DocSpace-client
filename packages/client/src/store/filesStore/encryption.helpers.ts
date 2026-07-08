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

import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import {
  ensureDecryptedFilename,
  recoverEncryptedFilenames,
} from "@docspace/shared/services/private-room/encrypted-filename-recovery";
import { backfillEncryptedFilesForRoomMembers } from "@docspace/shared/services/private-room/room-encryption";

import type { Nullable } from "@docspace/shared/types";
import type { TFile } from "@docspace/shared/api/files/types";

import type { default as FilesStore } from "../FilesStore";

// Encryption / private-room filename-recovery actions extracted from
// FilesStore. Side-effectful; free functions over `self: FilesStore`.

export function recoverEncryptedFilenamesForCurrentViewImpl(self: FilesStore) {
  const userId = self.userStore?.user?.id;
  if (!userId) return;
  const identity = SecretStorage.getCached(String(userId));
  if (!identity) return;
  const candidates = (self.files ?? [])
    .filter((f) => f.encrypted && f.id && f.viewUrl)
    .map((f) => ({ id: f.id, viewUrl: f.viewUrl }));
  if (candidates.length === 0) return;
  const roomId =
    self.selectedFolderStore.navigationPath.find((r) => r.isRoom)?.id ??
    (self.selectedFolderStore.isRoom ? self.selectedFolderStore.id : null);
  if (!roomId) return;
  void recoverEncryptedFilenames(
    candidates,
    String(userId),
    identity,
    roomId,
  );
}

export function ensureEncryptedFilenameForFileImpl(self: FilesStore, file: TFile) {
  if (!file?.encrypted || !file.id || !file.viewUrl) return;
  const userId = self.userStore?.user?.id;
  if (!userId) return;
  const identity = SecretStorage.getCached(String(userId));
  if (!identity) return;
  const roomId =
    self.selectedFolderStore.navigationPath.find((r) => r.isRoom)?.id ??
    (self.selectedFolderStore.isRoom ? self.selectedFolderStore.id : null);
  if (!roomId) return;
  void ensureDecryptedFilename(
    { id: file.id, viewUrl: file.viewUrl, encrypted: file.encrypted },
    String(userId),
    identity,
    roomId,
  );
}

export function syncEncryptedRoomImpl(self: FilesStore) {
  self.recoverEncryptedFilenamesForCurrentView();

  const roomId =
    self.selectedFolderStore.navigationPath.find((r) => r.isRoom)?.id ??
    (self.selectedFolderStore.isRoom ? self.selectedFolderStore.id : null);
  if (roomId) {
    self.maybeBackfillEncryptedRoom(roomId, self.selectedFolderStore.security);
  }
}

export function maybeBackfillEncryptedRoomImpl(
  self: FilesStore,
  roomId: Nullable<number | string>,
  security?: Nullable<{ EditRoom?: boolean }>,
) {
  if (!roomId) return;
  // Only room managers/admins backfill — they're the likely "inviter" with
  // unwrap access. Regular members may not even have the DEK to re-share.
  if (!security?.EditRoom) {
    console.info(
      "[ENCRYPTION] Backfill skipped for room",
      roomId,
      "— no EditRoom permission",
    );
    return;
  }

  if (self._backfilledEncryptedRooms.has(roomId)) return;

  const userId = self.userStore?.user?.id;
  if (!userId) return;

  const identity = SecretStorage.getCached(String(userId));
  if (!identity) {
    console.info(
      "[ENCRYPTION] Backfill skipped for room",
      roomId,
      "— identity not unlocked yet (will retry on next entry)",
    );
    return;
  }

  self._backfilledEncryptedRooms.add(roomId);
  console.info("[ENCRYPTION] Starting backfill sweep for room", roomId);

  // backfillEncryptedFilesForRoomMembers is typed with a
  // numeric roomId; string ids pass through unchanged at runtime.
  void backfillEncryptedFilesForRoomMembers(roomId as number, {
    currentUserId: String(userId),
    identity,
    // Background sweep: don't surprise the user with a TOFU prompt.
    // Mismatches are skipped silently and re-considered next session.
    onKeyChange: async () => "refuse",
  })
    .then(({ fileResults, skippedMembers }) => {
      const wrappedFiles = fileResults.filter((r) => r.success).length;
      const failedFiles = fileResults.filter((r) => !r.success).length;
      console.info(
        "[ENCRYPTION] Backfill done for room",
        roomId,
        "— files processed:",
        wrappedFiles,
        "failed:",
        failedFiles,
        "skipped members:",
        skippedMembers.length,
      );
    })
    .catch((error) => {
      self._backfilledEncryptedRooms.delete(roomId);
      console.error("[ENCRYPTION] Backfill failed for room", roomId, error);
    });
}
