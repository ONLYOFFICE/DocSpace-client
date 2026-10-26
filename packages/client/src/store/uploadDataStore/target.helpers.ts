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

import { RoomsType } from "@docspace/shared/enums";

import type { ItemUploadContext } from "@docspace/shared/services/private-room/encrypted-upload";

import type { TUploadTarget } from "./helpers";
import type AiRoomStore from "../AiRoomStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import type TreeFoldersStore from "../TreeFoldersStore";

export type TOpenFolderTargetDeps = {
  selectedFolderStore: Pick<
    SelectedFolderStore,
    "id" | "isRoom" | "isAIRoom" | "navigationPath" | "roomType"
  >;
  treeFoldersStore: Pick<TreeFoldersStore, "isPrivacyFolder">;
  aiRoomStore: Pick<AiRoomStore, "knowledgeId">;
};

/**
 * Snapshot of the open folder as an upload target. An AI agent uploads into
 * its knowledge folder.
 */
export function resolveOpenFolderTarget({
  selectedFolderStore,
  treeFoldersStore,
  aiRoomStore,
}: TOpenFolderTargetDeps): TUploadTarget {
  const { id, isRoom, isAIRoom, navigationPath, roomType } =
    selectedFolderStore;
  const isPrivate = treeFoldersStore.isPrivacyFolder;

  let targetRoomType = roomType;
  if (isPrivate) targetRoomType = RoomsType.CustomRoom;
  else if (isAIRoom) targetRoomType = RoomsType.AIRoom;

  return {
    folderId: isAIRoom ? aiRoomStore.knowledgeId : id,
    isPrivate,
    roomType: targetRoomType,
    encryptionRoomId:
      navigationPath?.find((r) => r.isRoom)?.id ?? (isRoom ? id : null),
  };
}

/**
 * The batch's target with a file's own upload context applied over it.
 * Spec: private-rooms/file-operations, "Files leaving a private room are
 * decrypted", "Copy into another private room is re-encrypted".
 */
export function withItemUploadContext(
  target: TUploadTarget,
  uploadContext: ItemUploadContext | undefined,
): TUploadTarget {
  if (!uploadContext) return { ...target };
  return {
    ...target,
    roomType: uploadContext.roomType ?? target.roomType,
    isPrivate:
      "isPrivate" in uploadContext
        ? !!uploadContext.isPrivate
        : target.isPrivate,
  };
}
