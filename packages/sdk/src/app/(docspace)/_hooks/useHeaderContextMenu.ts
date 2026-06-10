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
import { useTranslation } from "react-i18next";

import ClearTrashReactSvgUrl from "PUBLIC_DIR/images/clear.trash.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";

import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import type { TLogo } from "@docspace/ui-kit/types";
import { FolderType } from "@docspace/shared/enums";
import { TFolder } from "@docspace/shared/api/files/types";
import { TRoom } from "@docspace/shared/api/rooms/types";

import { useFilesListStore } from "../_store/FilesListStore";
import { DeleteContext } from "../_contexts/DeleteContext";
import { FileOperationsContext } from "../_contexts/FileOperationsContext";
import { RenameContext } from "../_contexts/RenameContext";
import { InfoContext } from "../_contexts/InfoContext";
import { ShareContext } from "../_contexts/ShareContext";
import { normalizeRoomLogo } from "../_utils/getRoomIconLogo";
import useItemContextMenu from "./useItemContextMenu";
import useContextMenuModel from "./useContextMenuModel";
import useRoomContextMenuModel from "@/app/(rooms)/_hooks/useRoomContextMenuModel";
import useRoomActions from "@/app/(rooms)/_hooks/useRoomActions";
import { useDocsUserStore } from "@/app/(personal-files)/_store/DocsUserStore";
import type { TFolderItem } from "./useItemList";

/**
 * Encapsulates all context-menu logic for the navigation header.
 *
 * Separating this from the Header component keeps the component focused on
 * rendering while this hook owns the "which menu model to show" decision.
 */
export function useHeaderContextMenu(current: TFolder | TRoom | undefined) {
  const { t } = useTranslation(["Common"]);
  const filesListStore = useFilesListStore();
  const deleteCtx = React.useContext(DeleteContext);
  const fileOpsCtx = React.useContext(FileOperationsContext);
  const docsUserStore = useDocsUserStore();

  const isTrashSection = filesListStore.rootFolderType === FolderType.TRASH;
  const isDocsSection = filesListStore.rootFolderType === FolderType.USER;
  const isRoom = !!current?.roomType;
  const renameCtx = React.useContext(RenameContext);
  const infoCtx = React.useContext(InfoContext);
  const shareCtx = React.useContext(ShareContext);

  const {
    editRoom,
    inviteRoom,
    changeOwner,
    archiveRoom,
    deleteRoom,
    infoRoom,
    roomChanged,
  } = useRoomActions();

  const { getFoldersContextMenu } = useItemContextMenu({ isTrashSection, isDocsSection });
  const { getContextModel: getRoomContextModel } = useRoomContextMenuModel(
    editRoom,
    roomChanged,
    changeOwner,
    false,        // isArchive
    undefined,    // onRestoreRoom
    deleteRoom,
    undefined,    // onDeleteSelected
    undefined,    // onRestoreSelected
    archiveRoom,
    undefined,    // onArchiveSelected
    infoRoom,
    inviteRoom,
  );

  const currentFolderItem = useMemo((): TFolderItem | undefined => {
    if (!current) return undefined;

    // isHeader: true — "open" is excluded at the source (see useItemContextMenu)
    const contextOptions = getFoldersContextMenu(current, { isHeader: true });

    const rawLogo = (current as unknown as { logo?: TLogo }).logo;
    const { roomLogo, roomIconColor, hasRoomImage } = normalizeRoomLogo(rawLogo);

    return {
      ...current,
      isFolder: true as const,
      folderUrl: "" as string,
      icon: "" as string,
      contextOptions,
      isRoom,
      roomLogo,
      roomIconColor,
      hasRoomImage,
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
      onRenameClick: renameCtx?.renameItem,
      onInfoClick: infoCtx ?? undefined,
      onShareClick: shareCtx ?? undefined,
    });

  const getContextOptionsFolder = useCallback((): ContextMenuModel[] => {
    // Trash header menu: Empty all / Restore all over the whole trash listing.
    // Reuses the existing bulk delete (permanent in trash) and restore flows.
    if (isTrashSection && !isRoom) {
      const allItems = filesListStore.items;
      const isEmpty = allItems.length === 0;

      return [
        {
          id: "header_option_empty-trash",
          key: "empty-trash",
          label: t("Common:EmptySection", {
            sectionName: t("Common:TrashSection"),
          }),
          icon: ClearTrashReactSvgUrl,
          disabled: isEmpty || !deleteCtx?.emptyTrash,
          onClick: () => deleteCtx?.emptyTrash?.(),
        },
        {
          id: "header_option_restore-all",
          key: "restore-all",
          label: t("Common:RestoreAll"),
          icon: MoveReactSvgUrl,
          disabled: isEmpty || !fileOpsCtx?.restoreItems,
          onClick: () => fileOpsCtx?.restoreItems(allItems),
        },
      ];
    }

    if (isRoom && currentFolderItem) {
      // Use the room-specific context menu and remove items that make no sense
      // when the user is already inside the room.
      const ROOM_HEADER_EXCLUDED = new Set([
        "select",
        "open",
        "pin",
        "unpin",
        "mute-room",
        "unmute-room",
        "separator-mute",
      ]);
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
    t,
    isTrashSection,
    filesListStore.items,
    deleteCtx,
    fileOpsCtx,
    isRoom,
    currentFolderItem,
    getRoomContextModel,
    getFolderHeaderContextMenuModel,
  ]);

  return {
    currentFolderItem,
    getContextOptionsFolder,
    isRoom,
    changeOwner,
    user: docsUserStore.user,
  };
}
