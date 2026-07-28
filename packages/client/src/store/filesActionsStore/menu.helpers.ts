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
import RemoveOutlineSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { TTranslation } from "@docspace/shared/types";
import FilesHeaderOptionStore from "../FilesHeaderOptionStore";
import { convertToArray } from "./helpers";
import type FilesActionStore from "../FilesActionsStore";
import type { TItemsCollection } from "../FilesActionsStore";

export const isAvailableOptionImpl = (
self: FilesActionStore,option: string
)=> {
  const {
    canConvertSelected,
    hasSelection,
    allFilesIsEditing,
    selection,
    hasRoomsToResetQuota,
    hasRoomsToDisableQuota,
    hasRoomsToChangeQuota,
    hasAIAgentsToChangeQuota,
    hasAIAgentsToDisableQuota,
    hasAIAgentsToResetQuota,
  } = self.filesStore;

  const { rootFolderType } = self.selectedFolderStore;
  const canDownload = selection.every((s) => s.security?.Download);

  switch (option) {
    case "copy": {
      const canCopy = selection.every((s) => s.security?.Copy);

      return hasSelection && canCopy;
    }
    case "showInfo":
    case "download":
      return hasSelection && canDownload;
    case "downloadAs":
      return canDownload && canConvertSelected;
    case "moveTo": {
      const canMove = selection.every((s) => s.security?.Move);

      return (
        hasSelection &&
        !allFilesIsEditing &&
        canMove &&
        rootFolderType !== FolderType.TRASH
      );
    }
    case "archive": {
      const canArchive = selection.every((s) => s.security?.Move);

      return hasSelection && canArchive;
    }
    case "unarchive": {
      const canUnArchive = selection.some((s) => s.security?.Move);

      return canUnArchive;
    }
    case "delete-room": {
      const canDelete = selection.some((s) => s.security?.Delete);

      return canDelete;
    }
    case "delete-agent": {
      const canRemove =
        selection.length === 1 && selection[0]?.security?.Delete;

      return canRemove;
    }
    case "delete": {
      const canDelete = selection.some((s) => s.security?.Delete);

      return !allFilesIsEditing && canDelete && hasSelection;
    }
    case "create-room": {
      const canCreateRoom = selection.some((s) => s.security?.CreateRoomFrom);
      return canCreateRoom;
    }
    case "create-group": {
      const { organizeRoomsGrouping } = self.filesSettingsStore;
      const { isRoomsFolder } = self.treeFoldersStore;
      return organizeRoomsGrouping && isRoomsFolder && hasSelection;
    }
    case "add-to-group": {
      const { organizeRoomsGrouping } = self.filesSettingsStore;
      const { isRoomsFolder } = self.treeFoldersStore;
      const { roomGroups } = self.dialogsStore;
      return (
        organizeRoomsGrouping &&
        isRoomsFolder &&
        hasSelection &&
        roomGroups &&
        roomGroups.length > 0
      );
    }
    case "remove-from-group": {
      const { organizeRoomsGrouping } = self.filesSettingsStore;
      const { isRoomsFolder } = self.treeFoldersStore;
      const { roomGroups } = self.dialogsStore;
      const currentGroupId = self.filesStore.roomsFilter?.groupId;
      return (
        organizeRoomsGrouping &&
        isRoomsFolder &&
        hasSelection &&
        roomGroups &&
        roomGroups.length > 0 &&
        !!currentGroupId
      );
    }
    case "change-quota":
      return hasRoomsToChangeQuota;
    case "change-agent-quota":
      return hasAIAgentsToChangeQuota;
    case "disable-quota":
      return hasRoomsToDisableQuota;
    case "disable-agent-quota":
      return hasAIAgentsToDisableQuota;
    case "default-quota":
      return hasRoomsToResetQuota;
    case "default-agent-quota":
      return hasAIAgentsToResetQuota;
    case "vectorization":
      return selection.some((s) => s.security?.Vectorization);
    default:
      return false;
  }
};


export const getOptionImpl = (
self: FilesActionStore,option: string, t: TTranslation
)=> {
  // FilesHeaderOptionStore types `t` as the branded i18next
  // TFunction; this store receives plain translation callbacks from
  // still-.js callers, hence the erased cast.
  return self.filesHeaderOptionStore.getOption(
    option,
    t as unknown as Parameters<FilesHeaderOptionStore["getOption"]>[1],
  );
};


export const getRecycleBinFolderOptionsImpl = (
self: FilesActionStore,itemsCollection: TItemsCollection, t: TTranslation
)=> {
  const { setRestorePanelVisible } = self.dialogsStore;

  const download = self.getOption("download", t);
  const downloadAs = self.getOption("downloadAs", t);
  const deleteOption = self.getOption("delete", t);
  const showInfo = self.getOption("showInfo", t);

  itemsCollection
    .set("download", download)
    .set("downloadAs", downloadAs)
    .set("restore", {
      id: "menu-restore",
      label: t("Common:Restore"),
      onClick: () => setRestorePanelVisible(true),
      iconUrl: MoveReactSvgUrl,
    })
    .set("delete", deleteOption)
    .set("showInfo", showInfo);

  return convertToArray(itemsCollection);
};


export const getFavoritesFolderOptionsImpl = (
self: FilesActionStore,itemsCollection: TItemsCollection, t: TTranslation
)=> {
  // const { selection } = self.filesStore;
  const download = self.getOption("download", t);
  const downloadAs = self.getOption("downloadAs", t);
  const moveTo = self.getOption("moveTo", t);
  const copy = self.getOption("copy", t);

  itemsCollection
    .set("download", download)
    .set("downloadAs", downloadAs)
    .set("moveTo", moveTo)
    .set("copy", copy);
  /* .set("delete", {
    label: t("Common:RemoveFromFavorites"),
    alt: t("Common:RemoveFromFavorites"),
    iconUrl: FavoritesFillReactSvgUrl,
    onClick: () => {
      self.setFavoriteAction("remove", selection)
        .then(() => toastr.success(t("Common:RemovedFromFavorites")))
        .catch((err) => toastr.error(err));
    },
  }) */

  return convertToArray(itemsCollection);
};


export const getPrivacyFolderOptionImpl = (
self: FilesActionStore,itemsCollection: TItemsCollection, t: TTranslation
)=> {
  const moveTo = self.getOption("moveTo", t);
  const deleteOption = self.getOption("delete", t);
  const download = self.getOption("download", t);
  const showInfo = self.getOption("showInfo", t);

  itemsCollection
    .set("download", download)
    .set("moveTo", moveTo)
    .set("delete", deleteOption)
    .set("showInfo", showInfo);

  return convertToArray(itemsCollection);
};


export const getShareFolderOptionsImpl = (
self: FilesActionStore,itemsCollection: TItemsCollection, t: TTranslation
)=> {
  const { setDeleteDialogVisible, setUnsubscribe } = self.dialogsStore;

  const download = self.getOption("download", t);
  const downloadAs = self.getOption("downloadAs", t);
  const copy = self.getOption("copy", t);
  const showInfo = self.getOption("showInfo", t);

  itemsCollection

    .set("download", download)
    .set("downloadAs", downloadAs)
    .set("copy", copy)
    .set("delete", {
      id: "menu-remove-from-shared-with-me",
      key: "remove-from-shared-with-me",
      label: t("Common:RemoveFromList"),
      onClick: () => {
        setUnsubscribe(true);
        setDeleteDialogVisible(true);
      },
      iconUrl: RemoveOutlineSvgUrl,
    })
    .set("showInfo", showInfo);

  return convertToArray(itemsCollection);
};


export const getRecentFolderOptionsImpl = (
self: FilesActionStore,itemsCollection: TItemsCollection, t: TTranslation
)=> {
  const download = self.getOption("download", t);
  const downloadAs = self.getOption("downloadAs", t);
  const moveTo = self.getOption("moveTo", t);
  const copy = self.getOption("copy", t);
  const removeFromRecent = self.getOption("remove-from-recent", t);

  itemsCollection
    .set("download", download)
    .set("downloadAs", downloadAs)
    .set("moveTo", moveTo)
    .set("copy", copy)
    .set("removeFromRecent", removeFromRecent);

  return convertToArray(itemsCollection);
};


export const getArchiveRoomsFolderOptionsImpl = (
self: FilesActionStore,itemsCollection: TItemsCollection, t: TTranslation
)=> {
  const archive = self.getOption("unarchive", t);
  const deleteOption = self.getOption("delete-room", t);
  const showOption = self.getOption("show-info", t);

  itemsCollection
    .set("unarchive", archive)
    .set("show-info", showOption)
    .set("delete", deleteOption);

  return convertToArray(itemsCollection);
};


export const getRoomsFolderOptionsImpl = (
self: FilesActionStore,itemsCollection: TItemsCollection, t: TTranslation
)=> {
  let pinName = "unpin";
  const { selection } = self.filesStore;

  const hasFormRoom = selection.some(
    (item) => item.roomType === RoomsType.FormRoom,
  );

  selection.forEach((item) => {
    if (!item.pinned) pinName = "pin";
  });

  const pin = self.getOption(pinName, t);
  const createGroup = self.getOption("create-group", t);
  const addToGroup = self.getOption("add-to-group", t);
  const removeFromGroup = self.getOption("remove-from-group", t);
  const changeQuota = self.getOption("change-quota", t);
  const disableQuota = self.getOption("disable-quota", t);
  const defaultQuota = self.getOption("default-quota", t);
  const deleteOption = self.getOption("delete-room", t);

  itemsCollection
    .set(pinName, pin)
    .set("create-group", createGroup)
    .set("add-to-group", addToGroup)
    .set("remove-from-group", removeFromGroup);

  if (!hasFormRoom) itemsCollection.set("archive", self.getOption("archive", t));

  itemsCollection
    .set("change-quota", changeQuota)
    .set("default-quota", defaultQuota)
    .set("disable-quota", disableQuota)
    .set("delete", deleteOption);

  return convertToArray(itemsCollection);
};


export const getTemplatesFolderOptionsImpl = (
self: FilesActionStore,itemsCollection: TItemsCollection, t: TTranslation
)=> {
  const deleteOption = self.getOption("delete", t);

  itemsCollection.set("delete", deleteOption);

  return convertToArray(itemsCollection);
};


export const getAIAgentsFolderOptionsImpl = (
self: FilesActionStore,itemsCollection: TItemsCollection, t: TTranslation
)=> {
  let pinName = "unpin";
  const { selection } = self.filesStore;

  selection.forEach((item) => {
    if (!item.pinned) pinName = "pin";
  });

  const pin = self.getOption(pinName, t);
  const changeQuota = self.getOption("change-agent-quota", t);
  const disableQuota = self.getOption("disable-agent-quota", t);
  const defaultQuota = self.getOption("default-agent-quota", t);
  const deleteOption = self.getOption("delete-room", t);

  itemsCollection
    .set(pinName, pin)
    .set("change-agent-quota", changeQuota)
    .set("default-agent-quota", defaultQuota)
    .set("disable-agent-quota", disableQuota)
    .set("delete", deleteOption);

  return convertToArray(itemsCollection);
};


export const getAnotherFolderOptionsImpl = (
self: FilesActionStore,itemsCollection: TItemsCollection, t: TTranslation
)=> {
  const createRoom = self.getOption("create-room", t);
  const download = self.getOption("download", t);
  const downloadAs = self.getOption("downloadAs", t);
  const moveTo = self.getOption("moveTo", t);
  const copy = self.getOption("copy", t);
  const deleteOption = self.getOption("delete", t);
  const showInfo = self.getOption("showInfo", t);
  const vectorization = self.getOption("vectorization", t);

  itemsCollection
    .set("vectorization", vectorization)
    .set("createRoom", createRoom)
    .set("download", download)
    .set("downloadAs", downloadAs)
    .set("moveTo", moveTo)
    .set("copy", copy)
    .set("delete", deleteOption)
    .set("showInfo", showInfo);

  return convertToArray(itemsCollection);
};


export const getHeaderMenuImpl = (
self: FilesActionStore,t: TTranslation
)=> {
  const {
    isFavoritesFolder,
    isRecycleBinFolder,
    isPrivacyFolder,
    isSharedWithMeFolder,
    isRoomsFolder,
    isArchiveFolder,
    isRecentFolder,
    isTemplatesFolder,
    isAIAgentsFolder,
    isFormsFolder,
  } = self.treeFoldersStore;

  const itemsCollection = new Map();

  if (isRecycleBinFolder)
    return self.getRecycleBinFolderOptions(itemsCollection, t);

  if (isFavoritesFolder)
    return self.getFavoritesFolderOptions(itemsCollection, t);

  if (isPrivacyFolder) return self.getPrivacyFolderOption(itemsCollection, t);

  if (isSharedWithMeFolder)
    return self.getShareFolderOptions(itemsCollection, t);

  if (isRecentFolder) return self.getRecentFolderOptions(itemsCollection, t);

  if (isArchiveFolder)
    return self.getArchiveRoomsFolderOptions(itemsCollection, t);

  if (isRoomsFolder || isFormsFolder)
    return self.getRoomsFolderOptions(itemsCollection, t);

  if (isTemplatesFolder)
    return self.getTemplatesFolderOptions(itemsCollection, t);

  if (isAIAgentsFolder)
    return self.getAIAgentsFolderOptions(itemsCollection, t);

  return self.getAnotherFolderOptions(itemsCollection, t);
};

