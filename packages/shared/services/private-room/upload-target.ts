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

import { getFolderPath } from "../../api/files";
import type { TFolder } from "../../api/files/types";
import { FolderType, RoomsType } from "../../enums";

/**
 * Where an upload goes.
 * Spec: private-rooms/file-operations, "Upload target is fixed when the user
 * starts the upload".
 */
export type TUploadTarget = {
  folderId: number | string | null;
  isPrivate: boolean;
  roomType: RoomsType | null;
  /** The room whose members get key wraps. */
  encryptionRoomId: number | string | null;
  /** Set when the room on the path has been archived. */
  isArchived?: true;
};

/** An entry of a drop or a picked folder tree, as the uploader receives it. */
export type TDroppedEntry = { path?: string; isEmptyDirectory?: boolean };

/**
 * Whether a dropped entry is a folder or lies inside one.
 * Spec: private-rooms/file-operations, "Folder upload disabled in private rooms".
 */
export const isFolderEntry = (entry: TDroppedEntry) =>
  !!entry.isEmptyDirectory ||
  (entry.path ?? "").split("/").filter((name) => name !== "").length > 1;

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

  // Spec: private-rooms/file-operations, "Drops onto a private room from outside it are refused".
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
export async function resolveFolderTarget(
  folder: {
    id: number | string;
    rootFolderType?: FolderType | null;
  },
  loadPath: (folderId: number) => Promise<TFolder[]> = getFolderPath,
): Promise<TUploadTarget> {
  const { id, rootFolderType } = folder;
  const outsideRooms =
    rootFolderType !== undefined &&
    rootFolderType !== null &&
    rootFolderType !== FolderType.Rooms &&
    rootFolderType !== FolderType.Archive;
  if (outsideRooms) return plainFolderTarget(id);

  const path = await loadPath(id as number);
  const room = path.find((entry) => !!entry.roomType);
  if (!room) return plainFolderTarget(id);

  return {
    folderId: id,
    isPrivate: !!room.private,
    roomType: room.roomType ?? null,
    encryptionRoomId: room.id,
    ...(room.rootFolderType === FolderType.Archive && { isArchived: true }),
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
