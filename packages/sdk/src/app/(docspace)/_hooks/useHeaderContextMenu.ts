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

import React, { useCallback, useMemo } from "react";

import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import type { TLogo } from "@docspace/ui-kit/types";
import { FolderType } from "@docspace/shared/enums";
import { TFolder } from "@docspace/shared/api/files/types";
import { TRoom } from "@docspace/shared/api/rooms/types";

import { useFilesListStore } from "../_store/FilesListStore";
import { DeleteContext } from "../_contexts/DeleteContext";
import { FileOperationsContext } from "../_contexts/FileOperationsContext";
import { useDialogsStore } from "../_store/DialogsStore";
import useItemContextMenu from "./useItemContextMenu";
import useContextMenuModel from "./useContextMenuModel";
import useRoomContextMenuModel from "@/app/(rooms)/_hooks/useRoomContextMenuModel";
import type { TFolderItem, TFileItem } from "./useItemList";

/**
 * Encapsulates all context-menu logic for the navigation header.
 *
 * Separating this from the Header component keeps the component focused on
 * rendering while this hook owns the "which menu model to show" decision.
 */
export function useHeaderContextMenu(current: TFolder | TRoom | undefined) {
  const filesListStore = useFilesListStore();
  const deleteCtx = React.useContext(DeleteContext);
  const fileOpsCtx = React.useContext(FileOperationsContext);
  const dialogsStore = useDialogsStore();

  const isTrashSection = filesListStore.rootFolderType === FolderType.TRASH;
  const isRoom = !!current?.roomType;

  const onEditRoom = useCallback(
    (_item: TFolderItem | TFileItem) => {
      if (!current) return;
      const room = current as TRoom;
      const logo = room.logo as TLogo | undefined;
      dialogsStore.openEditRoomDialog({
        id: current.id,
        title: current.title,
        tags: room.tags ?? [],
        roomLogo: logo?.cover ? undefined : logo?.original,
        roomIconColor: logo?.color,
        roomCover: logo?.cover,
        createdBy: current.createdBy,
      });
    },
    [current, dialogsStore],
  );

  const onArchiveRoom = useCallback(
    (_item: TFolderItem | TFileItem) => {
      if (!current) return;
      dialogsStore.openArchiveRoomDialog({ id: current.id, title: current.title });
    },
    [current, dialogsStore],
  );

  const onDeleteRoom = useCallback(
    (_item: TFolderItem | TFileItem) => {
      if (!current) return;
      dialogsStore.openDeleteRoomDialog({ id: current.id, title: current.title });
    },
    [current, dialogsStore],
  );

  const { getFoldersContextMenu } = useItemContextMenu({ isTrashSection });
  const { getContextModel: getRoomContextModel } = useRoomContextMenuModel(
    onEditRoom,
    undefined, // onRoomChanged
    undefined, // onChangeOwner
    false,     // isArchive
    undefined, // onRestoreRoom
    onDeleteRoom,
    undefined, // onDeleteSelected
    undefined, // onRestoreSelected
    onArchiveRoom,
  );

  const currentFolderItem = useMemo((): TFolderItem | undefined => {
    if (!current) return undefined;

    // isHeader: true — "open" is excluded at the source (see useItemContextMenu)
    const contextOptions = getFoldersContextMenu(current, { isHeader: true });

    return {
      ...current,
      isFolder: true as const,
      folderUrl: "" as string,
      icon: "" as string,
      contextOptions,
      isRoom,
      roomLogo: undefined,
      roomIconColor: undefined as string | undefined,
      hasRoomImage: false as const,
    } as unknown as TFolderItem;
  }, [current, getFoldersContextMenu, isRoom]);

  const { getContextMenuModel: getFolderHeaderContextMenuModel } =
    useContextMenuModel({
      item: currentFolderItem,
      onDeleteClick: deleteCtx?.deleteItem,
      onCopyClick: !isTrashSection ? fileOpsCtx?.copyItem : undefined,
      onMoveClick: !isTrashSection ? fileOpsCtx?.moveItem : undefined,
      onDuplicateClick: !isTrashSection ? fileOpsCtx?.duplicateItem : undefined,
      onRestoreClick: isTrashSection ? fileOpsCtx?.restoreItem : undefined,
    });

  const getContextOptionsFolder = useCallback((): ContextMenuModel[] => {
    if (isRoom && currentFolderItem) {
      // Use the room-specific context menu and remove items that make no sense
      // when the user is already inside the room.
      const ROOM_HEADER_EXCLUDED = new Set(["select", "open", "pin", "unpin", "mute-room", "unmute-room"]);
      const model = getRoomContextModel(currentFolderItem, true);
      const filtered = model.filter(
        (item) => !(item.key && ROOM_HEADER_EXCLUDED.has(String(item.key))),
      );
      // Remove leading / trailing separators left after filtering.
      while (filtered.length > 0 && filtered[0].isSeparator) filtered.shift();
      while (filtered.length > 0 && filtered[filtered.length - 1].isSeparator)
        filtered.pop();
      return filtered;
    }
    return getFolderHeaderContextMenuModel(true) ?? [];
  }, [
    isRoom,
    currentFolderItem,
    getRoomContextModel,
    getFolderHeaderContextMenuModel,
  ]);

  return {
    currentFolderItem,
    getContextOptionsFolder,
    isRoom,
  };
}
