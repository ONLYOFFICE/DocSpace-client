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

import { getFolderPath } from "@docspace/shared/api/files";
import { FolderType, RoomsType } from "@docspace/shared/enums";

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

/** A copy or move knows its destination, so its per-file context wins. */
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

/** The part of a list row that decides where files dropped on it go. */
export type TDropRow = {
  id: number | string;
  parentId?: number | string;
  isFolder?: boolean;
  fileExst?: string;
  isRoom?: boolean;
  roomType?: RoomsType | null;
  isPrivateRoom?: boolean;
  rootFolderType?: FolderType;
};

/**
 * Where files dropped on a row go, given a snapshot of the open folder taken
 * before the drop is handled. Rejects when a folder's room cannot be loaded.
 */
export async function resolveDropTarget(
  open: TUploadTarget,
  row: TDropRow | null | undefined,
): Promise<TUploadTarget> {
  if (!row || row.fileExst || !row.isFolder) return { ...open };

  if (row.isRoom) {
    return {
      folderId: row.id,
      isPrivate: !!row.isPrivateRoom,
      roomType: row.roomType ?? null,
      encryptionRoomId: row.id,
    };
  }

  const inRoomsSections =
    row.rootFolderType === FolderType.Rooms ||
    row.rootFolderType === FolderType.Archive;

  // A row of a rooms section takes the snapshot's room only when it is
  // listed in the snapshot's folder; any other is looked up.
  if (
    open.encryptionRoomId !== null &&
    (!inRoomsSections || String(row.parentId) === String(open.folderId))
  ) {
    return { ...open, folderId: row.id };
  }

  if (inRoomsSections) {
    const target = await resolveFolderTarget(row);
    if (target.encryptionRoomId === null) {
      throw new Error(`The room of folder ${row.id} is not in its path`);
    }
    return target;
  }

  return plainFolderTarget(row.id);
}

const plainFolderTarget = (folderId: number | string): TUploadTarget => ({
  folderId,
  isPrivate: false,
  roomType: null,
  encryptionRoomId: null,
});

/**
 * Where uploads into a folder go, decided by the room on the folder's own
 * path. A folder outside the rooms sections is never looked up; one whose
 * section is unknown is. Rejects when the path cannot be loaded.
 */
export async function resolveFolderTarget(folder: {
  id: number | string;
  rootFolderType?: FolderType | null;
}): Promise<TUploadTarget> {
  const { id, rootFolderType } = folder;
  const outsideRooms =
    rootFolderType !== undefined &&
    rootFolderType !== null &&
    rootFolderType !== FolderType.Rooms &&
    rootFolderType !== FolderType.Archive;
  if (outsideRooms) return plainFolderTarget(id);

  const path = await getFolderPath(id as number);
  const room = path.find((entry) => !!entry.roomType);
  if (!room) return plainFolderTarget(id);

  return {
    folderId: id,
    isPrivate: !!room.private,
    roomType: room.roomType ?? null,
    encryptionRoomId: room.id,
  };
}

/**
 * `target` is `null` when it could not be resolved.
 * Spec: private-rooms/file-operations, "Drops onto a private room from outside it are refused".
 */
export function isDropRefused(
  open: TUploadTarget,
  target: TUploadTarget | null,
): boolean {
  if (!target) return true;
  if (!target.isPrivate) return false;
  return (
    target.encryptionRoomId === null ||
    open.encryptionRoomId === null ||
    String(target.encryptionRoomId) !== String(open.encryptionRoomId)
  );
}
