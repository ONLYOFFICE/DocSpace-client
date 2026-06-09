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
 * This license applies only to their non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FolderType } from "@docspace/shared/enums";

// ---------------------------------------------------------------------------
// Drag-and-drop boundary checks — moveDragItems parity (SDK).
//
// These rules mirror packages/client/src/store/FilesActionsStore.js:2423-2458
// (moveDragItems). They are extracted as a pure function so they can be unit-
// tested without React or MobX store imports, and consumed by any drag-drop
// handler that is wired in the future.
//
// NOTE (2026-06-05): The SDK currently has NO between-folder drag-drop UI.
// All three Row/Tile/TableViewRow components wrap items in <DragAndDrop> for
// SelectionArea integration, but no onDrop/onDragOver handlers are connected
// that would move items between folders. The DropZone component only accepts
// OS-filesystem files (it calls getFilesFromEvent which reads the native File
// list). Therefore this function cannot yet be called at drag-drop time;
// it is ready to be wired once that UI layer exists.
//
// The FilesSelector path (context menu → copy/move → selector dialog) already
// enforces the private-room destination guard via the `isRoomDisabled` prop:
//   !isPrivate ? (room) => room?.private === true : undefined
// That covers case 1 (non-private source dragged into private destination) for
// the selector-based move flow.
// ---------------------------------------------------------------------------

export type DragSelectionItem = {
  /** True when the item is a folder. */
  isFolder: boolean;
  /** Server-side item id (folders only used to skip self-drop). */
  id: number | string;
};

export type DestFolderInfo = {
  /** True when the destination folder/room is E2EE private. */
  private?: boolean;
  /** Root folder type of the destination (from the server response). */
  rootFolderType?: FolderType;
};

// ---------------------------------------------------------------------------
// Decision type returned by checkDragDropBoundaries.
// ---------------------------------------------------------------------------

export type DragDropDecision =
  /** Case 1: non-private source → private destination → hard block. */
  | {
      kind: "block-private-dest";
      toastKey: "Common:CannotTransferToPrivateRoom";
    }
  /** Case 2: private source → non-private destination → folder error + files may proceed. */
  | {
      kind: "partial-private-source";
      toastKey: "Common:CannotTransferFolderFromPrivateRoom";
      /** Files from the selection that should proceed via copyEncryptedFiles. */
      filesToCopy: DragSelectionItem[];
    }
  /**
   * Normal move/copy — no private-room boundary is crossed. The caller
   * should proceed with the standard moveToFolder / copyToFolder API.
   */
  | { kind: "allow" };

// ---------------------------------------------------------------------------
// checkDragDropBoundaries
// ---------------------------------------------------------------------------

/**
 * Pure decision function mirroring the three boundary rules in moveDragItems
 * (FilesActionsStore.js:2423-2458 in the reference client).
 *
 * @param sourceInPrivateRoom  True when the currently open folder is an E2EE
 *   private room (equivalent to treeFoldersStore.isPrivacyFolder in the
 *   reference client).
 * @param destFolderInfo       Metadata about the drop target folder/room.
 * @param selection            Items currently selected / being dragged.
 * @param destFolderId         Id of the destination folder (used to filter out
 *   self-drops where a folder is dragged onto itself).
 */
export function checkDragDropBoundaries(
  sourceInPrivateRoom: boolean,
  destFolderInfo: DestFolderInfo | null | undefined,
  selection: DragSelectionItem[],
  destFolderId: number | string,
): DragDropDecision {
  // Destination privacy mirrors the reference:
  //   destFolderInfo?.private === true
  //     OR (sourceInPrivateRoom && rootFolderType === Rooms)
  // The second branch covers subfolder-to-subfolder moves within the same
  // rooms container (which is still a private destination).
  const isDestInsideSameRoom =
    sourceInPrivateRoom &&
    destFolderInfo?.rootFolderType === FolderType.Rooms;
  const isPrivateDestination =
    destFolderInfo?.private === true || isDestInsideSameRoom;

  // Case 1: non-private source → private destination.
  if (isPrivateDestination && !sourceInPrivateRoom) {
    return {
      kind: "block-private-dest",
      toastKey: "Common:CannotTransferToPrivateRoom",
    };
  }

  // Case 2: private source → non-private destination.
  // Folders in the selection trigger an error toast; files still proceed via
  // the encrypted copy path (mixed-selection nuance from the reference).
  if (!isPrivateDestination && sourceInPrivateRoom) {
    // Filter out the destination folder from the selection (self-drop guard).
    const dragSelection = selection.filter(
      (el) => !el.isFolder || el.id !== destFolderId,
    );

    const files = dragSelection.filter((el) => !el.isFolder);
    const hasFolders = dragSelection.some((el) => el.isFolder);

    if (hasFolders) {
      return {
        kind: "partial-private-source",
        toastKey: "Common:CannotTransferFolderFromPrivateRoom",
        // Even with the folder error, files in the same selection continue.
        filesToCopy: files,
      };
    }

    // Files only — allow them through the encrypted copy path.
    return { kind: "allow" };
  }

  // Normal case: no private-room boundary crossed.
  return { kind: "allow" };
}
