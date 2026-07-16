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

import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";
import FavoritesReactSvgUrl from "PUBLIC_DIR/images/favorite.react.svg?url";
import FavoritesFillReactSvgUrl from "PUBLIC_DIR/images/favorite.fill.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg?url";
import RemoveOutlineSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import CreateGroupReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import AddToGroupReactSvgUrl from "PUBLIC_DIR/images/folder.location.react.svg?url";
import copy from "copy-to-clipboard";
import { toastr } from "@docspace/ui-kit/components/toast";
import type {
  ContextMenuModel,
} from "@docspace/ui-kit/components/context-menu";
import type { TTranslation } from "@docspace/shared/types";
import { onShowEditingToast } from "./helpers";
import type { TContextOption } from "./helpers";
import type ContextOptionsStore from "../ContextOptionsStore";

export const getGroupContextOptionsImpl = (
self: ContextOptionsStore,t: TTranslation
): ContextMenuModel[]=> {
  const { selection, allFilesIsEditing, canConvertSelected } =
    self.filesStore;
  const { setDeleteDialogVisible } = self.dialogsStore;
  const {
    isRecycleBinFolder,
    isRoomsFolder,
    isArchiveFolder,
    isAIAgentsFolder,
    isFormsFolder,
  } = self.treeFoldersStore;

  const { pinRooms, unpinRooms, deleteRooms } = self.filesActionsStore;

  if (isRoomsFolder || isArchiveFolder || isAIAgentsFolder || isFormsFolder) {
    const isPinOption = selection.filter((item) => !item.pinned).length > 0;

    let canDelete: boolean | undefined;
    if (isRoomsFolder || isFormsFolder) {
      canDelete = selection.every((k) => k.contextOptions.includes("delete"));
    } else if (isArchiveFolder) {
      canDelete = selection.some((k) => k.contextOptions.includes("delete"));
    }

    const canArchiveRoom = selection.every((k) =>
      k.contextOptions.includes("archive-room"),
    );

    const canRestoreRoom = selection.some((k) =>
      k.contextOptions.includes("unarchive-room"),
    );

    let archiveOptions: TContextOption | undefined;

    const pinOption = isPinOption
      ? {
          key: "pin-room",
          label: t("Common:PinToTop"),
          icon: PinReactSvgUrl,
          onClick: () => pinRooms(t),
          disabled: false,
        }
      : {
          key: "unpin-room",
          label: t("Common:Unpin"),
          icon: UnpinReactSvgUrl,
          onClick: () => unpinRooms(t),
          disabled: false,
        };

    if (canArchiveRoom) {
      archiveOptions = {
        key: "archive-room",
        label: t("Common:MoveToArchive"),
        icon: RoomArchiveSvgUrl,
        onClick: (_e?: unknown) => self.onClickArchive("archive"),
        disabled: false,
      };
    }
    if (canRestoreRoom) {
      archiveOptions = {
        key: "unarchive-room",
        label: t("Common:Restore"),
        icon: MoveReactSvgUrl,
        onClick: () => self.onClickArchive("unarchive"),
        disabled: false,
      };
    }

    const options: TContextOption[] = [];

    if (!isArchiveFolder) {
      options.push(pinOption);
    }

    const { organizeRoomsGrouping } = self.filesSettingsStore;
    const { setEditRoomGroupsDialogVisible, roomGroups } = self.dialogsStore;

    if (organizeRoomsGrouping && !isArchiveFolder && !isAIAgentsFolder) {
      const roomIds = selection.map((room) => room.id);
      options.push({
        key: "create-group",
        label: t("GroupingRooms:CreateAGroup"),
        icon: CreateGroupReactSvgUrl,
        onClick: () => setEditRoomGroupsDialogVisible(true, roomIds),
        disabled: false,
      });

      if (roomGroups && roomGroups.length > 0) {
        options.push({
          key: "add-to-group",
          label: t("GroupingRooms:AddToGroup"),
          icon: AddToGroupReactSvgUrl,
          items: roomGroups.map((group) => {
            let groupIcon = CreateGroupReactSvgUrl;
            if (typeof group.icon === "string" && group.icon) {
              groupIcon = group.icon;
            } else if (
              typeof group.icon === "object" &&
              group.icon?.data?.small
            ) {
              groupIcon = `data:image/svg+xml;utf8,${encodeURIComponent(group.icon.data.small)}`;
            }
            return {
              id: `option_add-to-group-${group.id}`,
              key: `add-to-group-${group.id}`,
              label: group.name,
              icon: groupIcon,
              onClick: () =>
                self.onAddRoomsToGroup(roomIds, group.id, t, group.name),
            };
          }),
          disabled: false,
        });

        const currentGroupId = self.filesStore.roomsFilter?.groupId;
        if (currentGroupId) {
          options.push({
            key: "remove-from-group",
            label: t("GroupingRooms:RemoveFromGroup"),
            icon: RemoveOutlineSvgUrl,
            onClick: () => self.onRemoveRoomsFromGroup(roomIds, t),
            disabled: false,
          });
        }
      }
    }

    if ((canArchiveRoom || canDelete) && !isArchiveFolder) {
      options.push({
        key: "separator0",
        isSeparator: true,
      });
    }

    const pluginOptions = self.onMultiLoadPlugins(selection);

    if (archiveOptions) options.push(archiveOptions);
    options.push(...pluginOptions);

    canDelete &&
      options.push({
        key: "delete-rooms",
        label: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        onClick: () => deleteRooms(t),
      });

    return options as ContextMenuModel[];
  }

  const hasDownloadAccess =
    selection.findIndex((k) => k.security.Download) !== -1;

  /* const favoriteItems = selection.filter((k) =>
    k.contextOptions?.includes("mark-as-favorite"),
  ); */

  const canMove = selection.every((k) =>
    k.contextOptions.includes("move-to"),
  );

  const copyItems = selection.filter((k) =>
    k.contextOptions.includes("copy-to"),
  ).length;

  const restoreItems = selection.filter((k) =>
    k.contextOptions.includes("restore"),
  ).length;

  const canRetryVectorization = selection.some(
    (k) => k.security?.Vectorization,
  );

  /* const removeFromFavoriteItems = selection.filter((k) =>
    k.contextOptions.includes("remove-from-favorites"),
  ); */

  const deleteItems = selection.filter((k) =>
    k.contextOptions.includes("delete"),
  ).length;

  const isRootThirdPartyFolder = selection.some(
    (x) => x.providerKey && x.id === x.rootFolderId,
  );

  const canCreateRoom = selection.some((k) => k.security?.CreateRoomFrom);

  const options: TContextOption[] = [
    /* {
      key: "mark-as-favorite",
      label: t("Common:MarkAsFavorite"),
      icon: FavoritesReactSvgUrl,
      onClick: (e) => self.onClickFavorite("mark", favoriteItems, t),
      disabled: !favoriteItems.length,
    }, */
    {
      id: "create_room",
      key: "create-room",
      label: t("Common:CreateRoom"),
      icon: CatalogRoomsReactSvgUrl,
      onClick: () => self.onCreateRoom(null, true),
      disabled: !canCreateRoom,
    },
    {
      key: "vectorization",
      label: t("Common:Vectorization"),
      icon: RefreshReactSvgUrl,
      onClick: () => self.filesActionsStore.retryVectorization(selection),
      disabled: !canRetryVectorization,
    },
    {
      key: "download",
      label: t("Common:Download"),
      icon: DownloadReactSvgUrl,
      onClick: () =>
        self.filesActionsStore
          .downloadAction(t("Common:ArchivingData"))
          .catch((err: unknown) => toastr.error(err as string)),
      disabled: !hasDownloadAccess,
    },
    {
      key: "download-as",
      label: t("Common:DownloadAs"),
      icon: DownloadAsReactSvgUrl,
      onClick: self.onClickDownloadAs,
      disabled: !hasDownloadAccess || !canConvertSelected,
    },
    {
      key: "move-to",
      label: t("Common:MoveTo"),
      icon: MoveReactSvgUrl,
      onClick: allFilesIsEditing
        ? () => onShowEditingToast(t)
        : self.onMoveAction,
      disabled: isRecycleBinFolder || !canMove,
    },
    {
      key: "copy-to",
      label: t("Common:Copy"),
      icon: CopyReactSvgUrl,
      onClick: self.onCopyAction,
      disabled: isRecycleBinFolder || !copyItems,
    },
    {
      key: "restore",
      label: t("Common:Restore"),
      icon: MoveReactSvgUrl,
      onClick: self.onRestoreAction,
      disabled: !isRecycleBinFolder || !restoreItems,
    },
    {
      key: "separator1",
      isSeparator: true,
      disabled: !deleteItems || isRootThirdPartyFolder,
    },
    {
      key: "remove-from-recent",
      label: t("Common:RemoveFromList"),
      icon: RemoveOutlineSvgUrl,
      onClick: () =>
        self.filesActionsStore.onClickRemoveFromRecent(selection, t),
      disabled: !self.treeFoldersStore.isRecentFolder,
    },
    /* {
      key: "remove-from-favorites",
      label: t("Common:RemoveFromFavorites"),
      icon: FavoritesFillReactSvgUrl,
      onClick: (e) => self.onClickFavorite("remove", removeFromFavoriteItems, t),
      disabled: favoriteItems.length || !removeFromFavoriteItems.length,
    }, */
    {
      key: "delete",
      label: t("Common:Delete"),
      icon: TrashReactSvgUrl,
      onClick: allFilesIsEditing
        ? () => onShowEditingToast(t)
        : () => {
            if (self.filesSettingsStore.confirmDelete) {
              setDeleteDialogVisible(true);
            } else {
              const translations = {
                deleteFromTrash: t("Translations:TrashItemsDeleteSuccess", {
                  sectionName: t("Common:TrashSection"),
                }),
              };

              self.filesActionsStore
                .deleteAction(translations)
                .catch((err: unknown) => toastr.error(err as string));
            }
          },
      disabled: !deleteItems || isRootThirdPartyFolder,
    },
  ];

  const { isCollaborator } = self.userStore?.user || {
    isCollaborator: false,
  };

  const pluginOptions = self.onMultiLoadPlugins(selection);

  options.splice(1, 0, ...pluginOptions);

  const newOptions = options.filter(
    (option, index) =>
      !(index === 0 && option.key === "separator1") &&
      !(isCollaborator && option.key === "create-room"),
  );

  return newOptions as ContextMenuModel[];
};

