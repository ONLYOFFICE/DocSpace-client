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

import {
  checkFileConflicts,
  deleteFile,
  deleteFolder,
  downloadFiles,
  emptyTrash,
  finalizeVersion,
  lockFile,
  markAsRead,
  removeFiles,
  createFolder,
  moveToFolder,
  duplicate,
  getFolder,
  deleteFilesFromRecent,
  changeIndex,
  reorderIndex,
  deleteVersionFile,
  getFileEncryptionAccess,
} from "@docspace/shared/api/files";
import {
  AnalyticsEvents,
  Events,
  ExportRoomIndexTaskStatus,
  FileAction,
  FileStatus,
  FolderType,
  RoomsType,
  ShareAccessRights,
  ValidationStatus,
  VDRIndexingAction,
  RoomSearchArea,
  UrlActionType,
  VectorizationStatus,
} from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { muteRoomNotification } from "@docspace/shared/api/settings";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import {
  frameCallEvent,
  getConvertedSize,
  getObjectByLocation,
  getCategoryType,
  splitFileAndFolderIds,
} from "@docspace/shared/utils/common";
import uniqueid from "lodash/uniqueId";
import api from "@docspace/shared/api";
import { OPERATIONS_NAME, CategoryType } from "@docspace/shared/constants";
import { FileOperationStatus } from "@docspace/shared/enums";
import type { Nullable, TTranslation } from "@docspace/shared/types";
import type {
  TFile,
  TFileSecurity,
  TFileViewAccessibility,
  TFolder,
  TFolderSecurity,
  TGetFolder,
  TIndexItems,
  TOperation,
} from "@docspace/shared/api/files/types";
import type { UserStore } from "@docspace/shared/store/UserStore";
import {
  SECTION_ROOT_FOLDER_TYPES,
  changeCustomFilter as changeCustomFilterHelper,
  checkExportRoomIndexProgress,
  convertToArray,
  convertToTree,
  nameWithoutExtension as nameWithoutExtensionHelper,
  setPinAction as setPinActionHelper,
} from "./helpers";
import type FilesActionStore from "../FilesActionsStore";
import type {
  TActionItem,
} from "../FilesActionsStore";

export const setThirdpartyInfoImpl = (
self: FilesActionStore,providerKey?: string
)=> {
  const { setConnectDialogVisible, setConnectItem } = self.dialogsStore;
  const { providers, capabilities } = self.filesSettingsStore.thirdPartyStore;
  const provider = providers.find((x) => x.provider_key === providerKey);
  const capabilityItem = capabilities.find((x) => x[0] === providerKey);
  const capability = {
    // the old JS reads customer_title unchecked when no
    // capability entry matched (crash when the provider is missing too).
    title: capabilityItem ? capabilityItem[0] : provider!.customer_title,
    link: capabilityItem ? capabilityItem[1] : " ",
  };

  setConnectDialogVisible(true);
  setConnectItem({ ...provider, ...capability });
};


export const setFavoriteActionImpl = (
self: FilesActionStore,action: string, items: TActionItem[]
)=> {
  const { fetchFavoritesFolder, setSelected } = self.filesStore;
  const { fileIds, folderIds } = splitFileAndFolderIds(
    items as unknown as TFile[],
  );

  switch (action) {
    case "mark":
      return api.files
        .markAsFavorite(fileIds as number[], folderIds as number[])
        .then(() => self.getItemsInfo(items))
        .then(() => setSelected("close"));

    case "remove":
      return api.files
        .removeFromFavorite(fileIds as number[], folderIds as number[])
        .then(() => {
          return self.treeFoldersStore.isFavoritesFolder
            ? fetchFavoritesFolder(self.selectedFolderStore.id as number)
            : self.getItemsInfo(items);
        })
        .then(() => setSelected("close"));
    default:
  }
};


export const setPinActionImpl = async (
self: FilesActionStore,
  action: string,
  id: number | number[],
  t: TTranslation,
  isAIAgent = false,

)=> {
  return setPinActionHelper(action, id, t, isAIAgent);
};


export const setMuteActionImpl = (
self: FilesActionStore,action: string, item: TActionItem, t: TTranslation
)=> {
  const { id, new: newCount, rootFolderId, isAIAgent } = item;
  const { treeFolders } = self.treeFoldersStore;
  const { folders, updateRoomMute } = self.filesStore;

  const muteStatus = action === "mute";

  const folderIndex = id && folders.findIndex((x) => x.id == id);
  if (folderIndex > -1) updateRoomMute(folderIndex, muteStatus);

  const treeIndex = treeFolders.findIndex((x) => x.id == rootFolderId);
  const count = treeFolders[treeIndex].newItems;
  if (treeIndex) {
    // `new`/`newItems` are optional on the view-models; the
    // old JS did unchecked arithmetic (NaN when missing), the erased casts
    // keep that behavior.
    if (muteStatus) {
      treeFolders[treeIndex].newItems =
        (newCount as number) >= 0
          ? (count as number) - (newCount as number)
          : 0;
    } else
      treeFolders[treeIndex].newItems =
        (count as number) + (newCount as number);
  }

  let notificationsDisabled = t("Common:RoomNotificationsDisabled");
  let notificationsEnabled = t("Common:RoomNotificationsEnabled");

  if (isAIAgent) {
    notificationsDisabled = t("Common:AIAgentNotificationsDisabled", {
      aiAgent: t("Common:AIAgent"),
    });
    notificationsEnabled = t("Common:AIAgentNotificationsEnabled", {
      aiAgent: t("Common:AIAgent"),
    });
  }

  (muteRoomNotification(id, muteStatus) as Promise<unknown>)
    .then(() =>
      toastr.success(
        muteStatus ? notificationsDisabled : notificationsEnabled,
      ),
    )
    .catch((e) => toastr.error(e as string));
};


export const setArchiveActionImpl = async (
self: FilesActionStore,
  action: string,
  folders: TActionItem | TActionItem[],
  t: TTranslation,

)=> {
  const { addActiveItems, setSelected } = self.filesStore;

  const { archiveRoomsId, myRoomsId } = self.treeFoldersStore;

  const { secondaryProgressDataStore, clearActiveOperations } =
    self.uploadDataStore;

  const { setSecondaryProgressBarData } = secondaryProgressDataStore;

  if (!myRoomsId || !archiveRoomsId) {
    console.error("Default categories not found");
    return;
  }

  const operationId = uniqueid("operation_");

  // still-.js callers pass rooms or plain ids; the erased
  // cast mirrors the old JS.
  const items = (
    Array.isArray(folders)
      ? folders.map((x) => (x?.id ? x.id : x))
      : [folders.id]
  ) as number[];
  const archiveParentId = Array.isArray(folders)
    ? folders[0]?.parentId
    : folders?.parentId;

  const operation = OPERATIONS_NAME.move;

  setSecondaryProgressBarData({
    operation,
    percent: 0,
    operationId,
  });

  const destFolder = action === "archive" ? archiveRoomsId : myRoomsId;

  addActiveItems(null, items, destFolder);
  const pbData = {
    operation,
    operationId,
  };

  switch (action) {
    case "archive":
      self.setGroupMenuBlocked(true);
      // the shared moveToFolder declares
      // fileIds/conflictResolveType/deleteAfter as required, but the old JS
      // always called it with two args (undefined is sent as-is at
      // runtime); the erased cast keeps the call arity unchanged.
      return (
        moveToFolder as unknown as (
          destFolderId: number | string | undefined,
          folderIds: number[],
        ) => Promise<TOperation[]>
      )(archiveRoomsId, items)
        .then(async (res) => {
          const result = res[0];

          if (result?.error) return Promise.reject(result.error);

          const data = result ?? null;

          const operationData =
            await self.uploadDataStore.loopFilesOperations(data, pbData);

          const isCanceled =
            operationData?.status === FileOperationStatus.Canceled;

          if (
            !isCanceled &&
            (!operationData || operationData.error || !operationData.finished)
          ) {
            return Promise.reject(
              operationData?.error ? operationData.error : "",
            );
          }

          // Will be redirected via the socket
          // if (!isRoomsFolder) {
          //   // setSelectedFolder(roomsFolder);
          //   window.DocSpace.navigate("/");
          // }

          self.dialogsStore.setIsFolderActions(false);

          setSecondaryProgressBarData({
            completed: true,
            ...pbData,
          });
        })

        .then(() => {
          const successTranslation =
            (folders as TActionItem[]).length !== 1 && Array.isArray(folders)
              ? t("Common:ArchivedRoomsAction")
              : Array.isArray(folders)
                ? t("Common:ArchivedRoomAction", { name: folders[0].title })
                : t("Common:ArchivedRoomAction", { name: folders.title });

          toastr.success(successTranslation);

          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: AnalyticsEvents.RoomArchived,
            ids: items,
            parentId: archiveParentId,
          });
        })
        .then(() => {
          const clearBuffer =
            !self.dialogsStore.archiveDialogVisible &&
            !self.dialogsStore.restoreRoomDialogVisible;
          setSelected("close", clearBuffer);
        })
        .catch((err) => {
          clearActiveOperations(null, items);

          setSecondaryProgressBarData({
            completed: true,
            alert: true,
            ...pbData,
          });

          return toastr.error(
            (err as Error).message
              ? (err as Error).message
              : (err as { error?: string }).error
                ? (err as { error?: string }).error
                : (err as string),
            null,
            0,
            true,
          );
        })
        .finally(() => {
          clearActiveOperations(null, items);
          self.setGroupMenuBlocked(false);
        });
    case "unarchive":
      self.setGroupMenuBlocked(true);
      // same reduced call arity as the "archive" case above.
      return (
        moveToFolder as unknown as (
          destFolderId: number | string | undefined,
          folderIds: number[],
        ) => Promise<TOperation[]>
      )(myRoomsId, items)
        .then(async (res) => {
          const result = res[0];

          if (result?.error) return Promise.reject(result.error);

          const data = result ?? null;

          // pbData never had a label; the old JS logged
          // undefined here.
          console.log((pbData as { label?: string }).label, { data, res });

          await self.uploadDataStore.loopFilesOperations(data, pbData);

          self.dialogsStore.setIsFolderActions(false);

          setSecondaryProgressBarData({
            completed: true,
            ...pbData,
          });
        })

        .then(() => {
          const successTranslation =
            (folders as TActionItem[]).length !== 1 && Array.isArray(folders)
              ? t("Common:UnarchivedRoomsAction")
              : Array.isArray(folders)
                ? t("Common:UnarchivedRoomAction", { name: folders[0].title })
                : t("Common:UnarchivedRoomAction", { name: folders.title });

          toastr.success(successTranslation);
        })
        .then(() => setSelected("close"))
        .then(() => self.moveToRoomsPage())
        .catch((err) => {
          clearActiveOperations(null, items);
          setSecondaryProgressBarData({
            completed: true,
            alert: true,
            ...pbData,
          });

          return toastr.error(
            (err as Error).message
              ? (err as Error).message
              : (err as { error?: string }).error
                ? (err as { error?: string }).error
                : (err as string),
            null,
            0,
            true,
          );
        })
        .finally(() => {
          clearActiveOperations(null, items);
          self.setGroupMenuBlocked(false);
        });
    default:
  }
};


export const pinRoomsImpl = (
self: FilesActionStore,t: TTranslation
)=> {
  const { selection } = self.filesStore;

  const items: number[] = [];

  const isAIAgent = selection.some((s) => s.isAIAgent);

  selection.forEach((item) => {
    if (!item.pinned) items.push(item.id);
  });

  self.setPinAction("pin", items, t, isAIAgent);
};


export const unpinRoomsImpl = (
self: FilesActionStore,t: TTranslation
)=> {
  const { selection } = self.filesStore;

  const items: number[] = [];

  const isAIAgent = selection.some((s) => s.isAIAgent);

  selection.forEach((item) => {
    if (item.pinned) items.push(item.id);
  });

  self.setPinAction("unpin", items, t, isAIAgent);
};


export const archiveRoomsImpl = (
self: FilesActionStore,action: string
)=> {
  const {
    setArchiveDialogVisible,
    setQuotaWarningDialogVisible,
    setRestoreRoomDialogVisible,
  } = self.dialogsStore;

  const { isWarningRoomsDialog } = self.currentQuotaStore;

  if (action === "unarchive" && isWarningRoomsDialog) {
    setQuotaWarningDialogVisible(true);
    return;
  }

  if (action === "archive") {
    setArchiveDialogVisible(true);
  } else {
    setRestoreRoomDialogVisible(true);
  }
};


export const changeRoomQuotaImpl = (
self: FilesActionStore,
  items: (TActionItem | number)[],
  successCallback?: (...args: unknown[]) => unknown,
  abortCallback?: (...args: unknown[]) => unknown,

)=> {
  const event = new Event(Events.CHANGE_QUOTA);

  const itemsIDs = items.map((item) => {
    return (item as TActionItem)?.id ? (item as TActionItem).id : item;
  });

  const payload = {
    visible: true,
    type: "room",
    ids: itemsIDs,
    successCallback,
    abortCallback,
  };

  // the still-.js GlobalEvents component reads this extra
  // field off the dispatched Event.
  (event as Event & { payload?: typeof payload }).payload = payload;

  window.dispatchEvent(event);
};


export const disableRoomQuotaImpl = async (
self: FilesActionStore,items: (TActionItem | number)[], t: TTranslation
)=> {
  const { setCustomRoomQuota } = self.filesStore;

  const userIDs = items.map((item) => {
    return (item as TActionItem)?.id ? (item as TActionItem).id : item;
  }) as number[];

  try {
    await setCustomRoomQuota(userIDs, -1);
    toastr.success(t("Common:StorageQuotaDisabled"));
  } catch (e) {
    toastr.error(e as string);
  }
};


export const resetRoomQuotaImpl = async (
self: FilesActionStore,items: (TActionItem | number)[], t: TTranslation
)=> {
  const { resetRoomQuota } = self.filesStore;

  const userIDs = items.map((item) => {
    return (item as TActionItem)?.id ? (item as TActionItem).id : item;
  }) as number[];

  try {
    await resetRoomQuota(userIDs);
    toastr.success(t("Common:StorageQuotaReset"));
  } catch (e) {
    toastr.error(e as string);
  }
};


export const changeAIAgentsQuotaImpl = (
self: FilesActionStore,
  items: (TActionItem | number)[],
  successCallback?: (...args: unknown[]) => unknown,
  abortCallback?: (...args: unknown[]) => unknown,

)=> {
  const event = new Event(Events.CHANGE_QUOTA);

  const itemsIDs = items.map((item) => {
    return (item as TActionItem)?.id ? (item as TActionItem).id : item;
  });

  const payload = {
    visible: true,
    type: "agent",
    ids: itemsIDs,
    successCallback,
    abortCallback,
  };

  // the still-.js GlobalEvents component reads this extra
  // field off the dispatched Event.
  (event as Event & { payload?: typeof payload }).payload = payload;

  window.dispatchEvent(event);
};


export const disableAIAgentQuotaImpl = async (
self: FilesActionStore,
  items: (TActionItem | number)[],
  t: TTranslation,

)=> {
  const { setCustomAIAgentQuota } = self.filesStore;

  const agentIDs = items.map((item) => {
    return (item as TActionItem)?.id ? (item as TActionItem).id : item;
  }) as number[];

  try {
    await setCustomAIAgentQuota(agentIDs, -1);
    toastr.success(t("Common:StorageQuotaDisabled"));
  } catch (e) {
    toastr.error(e as string);
  }
};


export const resetAIAgentQuotaImpl = async (
self: FilesActionStore,
  items: (TActionItem | number)[],
  t: TTranslation,

)=> {
  const { resetAIAgentQuota } = self.filesStore;

  const userIDs = items.map((item) => {
    return (item as TActionItem)?.id ? (item as TActionItem).id : item;
  }) as number[];

  try {
    await resetAIAgentQuota(userIDs);
    toastr.success(t("Common:StorageQuotaReset"));
  } catch (e) {
    toastr.error(e as string);
  }
};


export const onClickCreateRoomImpl = (
self: FilesActionStore,item?: TActionItem, context = "sidebar"
)=> {
  self.setProcessCreatingRoomFromData(true);
  const event = new CustomEvent(Events.ROOM_CREATE, {
    detail: { parentId: self.selectedFolderStore.id, context },
  });
  if (item && item.isFolder) {
    // the still-.js GlobalEvents component reads this extra
    // field off the dispatched CustomEvent.
    (event as CustomEvent & { title?: string }).title = item.title;
  }
  window.dispatchEvent(event);
};


export const onCreateRoomFromTemplateImpl = (
self: FilesActionStore,item: TActionItem, addSelection?: boolean
)=> {
  const event = new CustomEvent(Events.ROOM_CREATE, {
    detail: { parentId: self.selectedFolderStore.id, context: "template" },
  });
  // the still-.js GlobalEvents component reads this extra
  // field off the dispatched CustomEvent.
  (event as CustomEvent & { item?: TActionItem }).item = item;
  window.dispatchEvent(event);

  if (addSelection) self.filesStore.setBufferSelection(item);
};


export const onLeaveRoomImpl = (
self: FilesActionStore,t: TTranslation, isOwner = false, force = false
)=> {
  const { selection, setSelected, bufferSelection } = self.filesStore;
  const { user } = self.userStore;

  // the fallback is the selected-folder store snapshot; only
  // id/isAIAgent are read from it, matching the old JS duck typing.
  const room = (
    selection.length
      ? selection[0]
      : bufferSelection
        ? bufferSelection
        : self.selectedFolderStore
  ) as TActionItem;

  const roomId = room.id;
  const isAIAgent = room.isAIAgent;

  // user is nullable on UserStore; the old JS read the
  // flags unchecked (crash when logged out), the `!` keeps that behavior.
  const isAdmin = user!.isOwner || user!.isAdmin;
  const isRoot = self.selectedFolderStore.isRootFolder;

  const roomSuccessText = isOwner
    ? t("Common:LeftAndAppointNewOwner")
    : t("Common:YouLeftTheRoom");
  const agentSuccessText = isOwner
    ? t("Common:LeftAgentAndAppointNewOwner")
    : t("Files:YouLeftTheAgent");
  const successText = isAIAgent ? agentSuccessText : roomSuccessText;

  return (
    api.rooms.updateRoomMemberRole(roomId, {
      invitations: [{ id: user?.id, access: ShareAccessRights.None }],
      force,
    }) as Promise<unknown>
  )
    .then(() => {
      if (!isAdmin) {
        if (!isRoot) {
          const filter = RoomsFilter.getDefault();
          window.DocSpace.navigate(
            `rooms/shared/filter?${filter.toUrlParams()}`,
          );
        } else {
          self.filesStore.removeFiles(null, [roomId]);
        }
      } else if (!isRoot) {
        self.selectedFolderStore.setInRoom(false);

        const operationId = uniqueid("operation_");
        self.updateCurrentFolder(null, operationId);
      } else {
        self.filesStore.setInRoomFolder(roomId, false);
      }

      toastr.success(successText);
    })
    .finally(() => {
      setSelected("none");
    });
};


export const changeRoomOwnerImpl = (
self: FilesActionStore,t: TTranslation, userId: string, isLeaveChecked = false
)=> {
  const { setFolder, setSelected, selection, bufferSelection } =
    self.filesStore;
  const {
    isRootFolder,
    setCreatedBy,
    id,
    setInRoom,
    setSecurity,
    setAccess,
  } = self.selectedFolderStore;

  const roomId = selection.length
    ? selection[0].id
    : bufferSelection
      ? bufferSelection.id
      : id;

  return api.files
    .setFileOwner(userId, [roomId] as number[])
    .then(async (res) => {
      if (isRootFolder) {
        setFolder(res[0]);
      } else {
        setCreatedBy(res[0].createdBy);
        setSecurity(res[0].security);
        setAccess(res[0].access);

        // user is nullable on UserStore; the old JS read
        // `.id` unchecked, the `!` keeps that behavior.
        const isMe = userId === self.userStore.user!.id;
        if (isMe) setInRoom(true);
      }

      if (isLeaveChecked) await self.onLeaveRoom(t);
      else toastr.success(t("Common:AppointNewOwner"));
    })
    .catch((e) => toastr.error(e as string))
    .finally(() => {
      setSelected("none");
    });
};

