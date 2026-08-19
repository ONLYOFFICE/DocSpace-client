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
  deleteFile,
  deleteFolder,
  emptyTrash,
  removeFiles,
  deleteVersionFile,
} from "@docspace/shared/api/files";
import { AnalyticsEvents, FileOperationStatus } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { TIMEOUT } from "SRC_DIR/helpers/filesConstants";
import {
  forgetEncryptedFilename,
} from "@docspace/shared/services/encryption/filename-cache";
import { getCategoryTypeByFolderType } from "SRC_DIR/helpers/utils";
import uniqueid from "lodash/uniqueId";
import SocketHelper, {SocketCommands} from "@docspace/ui-kit/utils/socket";
import {
  getEmptyPersonalProgress,
  startEmptyPersonal,
} from "@docspace/shared/api/people";
import { OPERATIONS_NAME, CategoryType } from "@docspace/shared/constants";
import type { Nullable, TTranslation } from "@docspace/shared/types";
import type { TOperation } from "@docspace/shared/api/files/types";
import type FilesActionStore from "../FilesActionsStore";
import type {
  TActionItem,
  TDeleteTranslations,
  TEmptyPersonalProgress,
  TOperationName,
  TRemoveTranslations,
  TSuccessTranslations,
} from "../FilesActionsStore";

export const updateFilesAfterDeleteImpl = (
self: FilesActionStore,operationId: string, operationName: TOperationName
)=> {
  const { setSelected } = self.filesStore;
  const { setSecondaryProgressBarData } =
    self.uploadDataStore.secondaryProgressDataStore;

  setSelected("close");

  self.dialogsStore.setIsFolderActions(false);

  setSecondaryProgressBarData({
    operation: operationName,
    completed: true,
    operationId,
  });
};


export const deleteActionImpl = async (
self: FilesActionStore,
  translations: Nullable<TDeleteTranslations>,
  newSelection: Nullable<TActionItem[]> = null,

)=> {
  const { isRecycleBinFolder, isPrivacyFolder, recycleBinFolderId } =
    self.treeFoldersStore;

  const {
    addActiveItems,
    getIsEmptyTrash,
    bufferSelection,
    activeFiles,
    activeFolders,
  } = self.filesStore;
  const { secondaryProgressDataStore, clearActiveOperations } =
    self.uploadDataStore;
  const { setSecondaryProgressBarData } = secondaryProgressDataStore;

  let selection =
    newSelection ||
    (self.filesStore.selection.length
      ? self.filesStore.selection
      : bufferSelection
        ? [bufferSelection]
        : []);

  selection = selection.filter((item) => item?.security?.Delete);

  //  const isThirdPartyFile = selection.some((f) => f.providerKey);

  const currentFolderId = self.selectedFolderStore.id;

  const operationId = uniqueid("operation_");

  const deleteAfter = false; // Delete after finished TODO: get from settings
  const immediately = !!(isRecycleBinFolder || isPrivacyFolder); // Don't move to the Recycle Bin

  const folderIds: number[] = [];
  const fileIds: number[] = [];

  let i = 0;
  while (selection.length !== i) {
    if (selection[i].fileExst || selection[i].contentLength) {
      // try to fix with one check later (see onDeleteMediaFile)
      const isActiveFile = activeFiles.find(
        (elem) => elem.id === selection[i].id,
      );
      !isActiveFile && fileIds.push(selection[i].id);
    } else {
      // try to fix with one check later (see onDeleteMediaFile)
      const isActiveFolder = activeFolders.find(
        (elem) => elem.id === selection[i].id,
      );
      !isActiveFolder && folderIds.push(selection[i].id);
    }
    i++;
  }

  if (!folderIds.length && !fileIds.length) return;

  const operationName = OPERATIONS_NAME.trash;
  const itemsLength = folderIds.length + fileIds.length;

  setSecondaryProgressBarData({
    operation: operationName,
    percent: 0,
    operationId,
    ...(!immediately && {
      destFolderInfo: self.treeFoldersStore.trashFolderInfo,
      itemsCount: itemsLength,
      ...(itemsLength === 1 && {
        title: selection[0].title,
        isFolder: selection[0].isFolder,
      }),
    }),
  });

  const destFolderId = immediately ? null : recycleBinFolderId;

  addActiveItems(fileIds, null, destFolderId);
  addActiveItems(null, folderIds, destFolderId);

  if (folderIds.length || fileIds.length) {
    try {
      self.setGroupMenuBlocked(true);
      await removeFiles(folderIds, fileIds, deleteAfter, immediately)
        .then(async (res) => {
          const result = res[0];

          if (result?.error) return Promise.reject(result.error);

          const data = result ?? null;

          if (!data) {
            return Promise.reject();
          }

          const pbData = {
            operation: operationName,
            operationId,
          };

          const operationResult =
            await self.uploadDataStore.loopFilesOperations(data, pbData);

          // The operation can stop before it processed the whole
          // request — the user hit cancel on the progress button, or the server
          // reported it canceled. Only a subset of `fileIds`/`folderIds` was
          // actually removed and we cannot tell which, so the optimistic
          // `removeFiles` below would drop the untouched items from the list too
          // (with a select-all delete that empties the page). Refetch instead
          // and let the server say what survived.
          const isCanceled =
            operationResult?.status === FileOperationStatus.Canceled ||
            secondaryProgressDataStore.isOperationStopped(
              operationName,
              operationId,
            );

          const showToast = () => {
            if (isRecycleBinFolder) {
              // `translations` may be null when called from
              // runOperations; the old JS would throw here in that case
              // (trash-only path), the `!` keeps that behavior.
              return toastr.success(translations!.deleteFromTrash);
            }
          };

          if (self.dialogsStore.isFolderActions) {
            self.updateCurrentFolder(false, operationId, operationName, true);
            showToast();
          } else if (isCanceled) {
            self.filesStore.setSelected("close");
            await self.updateCurrentFolder(false, operationId, operationName);
          } else {
            self.updateFilesAfterDelete(operationId, operationName);

            self.filesStore.removeFiles(
              fileIds,
              folderIds,
              showToast,
              destFolderId,
            );

            self.uploadDataStore.removeFiles(fileIds);
            fileIds.forEach((id) => forgetEncryptedFilename(id));
          }

          if (currentFolderId) {
            SocketHelper?.emit(
              SocketCommands.RefreshFolder,
              currentFolderId as string,
            );
          }

          if (fileIds.length && !isCanceled) {
            window.dataLayer = window.dataLayer || [];
            selection
              .filter((item) => fileIds.includes(item.id))
              .forEach((file) => {
                window.dataLayer!.push({
                  event: AnalyticsEvents.FileDeleted,
                  id: file.id,
                  parentId: file.folderId,
                });
              });
          }
        })
        .finally(() => {
          clearActiveOperations(fileIds, folderIds);
          getIsEmptyTrash();
        });
    } catch (err) {
      clearActiveOperations(fileIds, folderIds);
      setSecondaryProgressBarData({
        operation: operationName,
        completed: true,
        alert: true,
        operationId,
        error: err as string,
      });
    } finally {
      self.setGroupMenuBlocked(false);
    }
  }
};


export const emptyTrashImpl = async (
self: FilesActionStore,translations: TSuccessTranslations
)=> {
  const {
    secondaryProgressDataStore,
    loopFilesOperations,
    clearActiveOperations,
  } = self.uploadDataStore;
  const { setSecondaryProgressBarData } = secondaryProgressDataStore;
  const { isRecycleBinFolder } = self.treeFoldersStore;
  const { addActiveItems, files, folders, getIsEmptyTrash, filter } =
    self.filesStore;

  // The trash view is shared by the root sections and scoped by the
  // `folderType` filter, so the operation must carry the same scope to clear
  // only the section the user is looking at.
  const folderType = filter?.folderType ?? null;

  const fileIds = files.map((f) => f.id);
  const folderIds = folders.map((f) => f.id);

  if (isRecycleBinFolder) {
    addActiveItems(fileIds, folderIds);
  }

  const operationId = uniqueid("operation_");

  self.emptyTrashInProgress = true;

  const pbData = {
    operation: OPERATIONS_NAME.deletePermanently,
    operationId,
  };

  setSecondaryProgressBarData({
    percent: 0,
    ...pbData,
  });

  try {
    await emptyTrash(folderType).then(async (res) => {
      const result = res[0];

      if (result?.error) return Promise.reject(result.error);
      const data = result ?? null;

      await loopFilesOperations(data, pbData);
      toastr.success(translations.successOperation);
      self.updateCurrentFolder(null, pbData.operationId, pbData.operation);
      getIsEmptyTrash();
      clearActiveOperations(fileIds, folderIds);
    });
  } catch (err) {
    clearActiveOperations(fileIds, folderIds);
    setSecondaryProgressBarData({
      completed: true,
      alert: true,
      ...pbData,
    });

    return toastr.error((err as Error).message ? (err as Error).message : (err as string), null, 0, true);
  } finally {
    self.emptyTrashInProgress = false;
  }
};


export const emptyPersonalRoomImpl = async (
self: FilesActionStore,translations: TSuccessTranslations
)=> {
  const { secondaryProgressDataStore, clearActiveOperations } =
    self.uploadDataStore;
  const { setSecondaryProgressBarData } = secondaryProgressDataStore;

  const { addActiveItems, files, folders } = self.filesStore;
  const { fetchTreeFolders } = self.treeFoldersStore;

  const fileIds = files.map((f) => f.id);
  const folderIds = folders.map((f) => f.id);

  addActiveItems(fileIds, folderIds);

  const operationId = uniqueid("operation_");

  self.emptyPersonalRoomInProgress = true;

  const pbData = {
    operation: OPERATIONS_NAME.deletePermanently,
    operationId,
  };

  setSecondaryProgressBarData({
    percent: 0,
    ...pbData,
  });

  try {
    await (
      startEmptyPersonal() as unknown as Promise<
        TEmptyPersonalProgress | undefined
      >
    ).then(async (result) => {
      if (result?.error) return Promise.reject(result.error);
      const data = result ?? null;

      if (!data) {
        setSecondaryProgressBarData({
          operation: pbData.operation,
          alert: true,
          completed: true,
          operationId: pbData.operationId,
        });

        return;
      }

      let progress = data.percentage;
      let finished = data.isCompleted;

      while (!finished) {
        const item = (await getEmptyPersonalProgress()) as unknown as
          | TEmptyPersonalProgress
          | undefined;

        progress = item ? item.percentage : 100;
        finished = item ? item.isCompleted : true;

        setSecondaryProgressBarData({
          operation: pbData.operation,
          percent: progress,
          alert: false,
          currentFile: item as unknown as TOperation,
          operationId: pbData.operationId,
        });
      }

      toastr.success(translations.successOperation);

      setSecondaryProgressBarData({
        completed: true,
        alert: false,
        ...pbData,
      });

      fetchTreeFolders();

      clearActiveOperations(fileIds, folderIds);
    });
  } catch (err) {
    clearActiveOperations(fileIds, folderIds);
    setSecondaryProgressBarData({
      completed: true,
      alert: true,
      ...pbData,
    });

    return toastr.error((err as Error).message ? (err as Error).message : (err as string), null, 0, true);
  } finally {
    self.emptyPersonalRoomInProgress = false;
  }
};


export const emptyArchiveImpl = async (
self: FilesActionStore,translations: TSuccessTranslations
)=> {
  const {
    secondaryProgressDataStore,
    loopFilesOperations,
    clearActiveOperations,
  } = self.uploadDataStore;
  const { setSecondaryProgressBarData } = secondaryProgressDataStore;
  const { isArchiveFolder } = self.treeFoldersStore;
  const { addActiveItems, roomsForDelete } = self.filesStore;

  const folderIds = roomsForDelete.map((f) => f.id);
  if (isArchiveFolder) addActiveItems(null, folderIds);

  const operationId = uniqueid("operation_");

  const pbData = {
    operation: OPERATIONS_NAME.deletePermanently,
    operationId,
  };

  setSecondaryProgressBarData({
    percent: 0,
    ...pbData,
  });

  try {
    await removeFiles(folderIds, [], true, true).then(async (res) => {
      const result = res[0];

      if (result?.error) return Promise.reject(result.error);
      const data = result ?? null;

      await loopFilesOperations(data, pbData);
      toastr.success(translations.successOperation);
      self.updateCurrentFolder(null, pbData.operationId, pbData.operation);
      // getIsEmptyTrash();
      clearActiveOperations(null, folderIds);
    });
  } catch (err) {
    clearActiveOperations(null, folderIds);
    setSecondaryProgressBarData({
      completed: true,
      alert: true,
      ...pbData,
    });

    return toastr.error((err as Error).message ? (err as Error).message : (err as string));
  }
};


export const deleteItemActionImpl = async (
self: FilesActionStore,
  itemId: number | number[],
  itemTitle: string,
  translations?: Nullable<TRemoveTranslations>,
  isFile?: boolean | null,
  isThirdParty?: boolean | string | null,
  isRoom?: boolean | null,

)=> {
  const { secondaryProgressDataStore } = self.uploadDataStore;
  const { setSecondaryProgressBarData } = secondaryProgressDataStore;
  if (
    self.filesSettingsStore.confirmDelete ||
    self.treeFoldersStore.isPrivacyFolder ||
    isThirdParty ||
    isRoom
  ) {
    self.dialogsStore.setIsRoomDelete(isRoom as boolean);
    self.dialogsStore.setDeleteDialogVisible(true);
  } else {
    const operationId = uniqueid("operation_");
    const operationName = OPERATIONS_NAME.trash;

    setSecondaryProgressBarData({
      operation: operationName,
      percent: 0,
      operationId,
      title: itemTitle,
      destFolderInfo: self.treeFoldersStore.trashFolderInfo,
      itemsCount: 1,
      isFolder: !isFile,
    });

    // const id = Array.isArray(itemId) ? itemId : [itemId];

    try {
      await self.deleteItemOperation(
        isFile,
        itemId,
        translations,
        isRoom,
        operationId,
        operationName,
      );
    } catch (err) {
      setSecondaryProgressBarData({
        operation: operationName,
        completed: true,
        alert: true,
        operationId,
        error: err as string,
      });
    }
  }
};


export const deleteItemOperationImpl = (
self: FilesActionStore,
  isFile: boolean | null | undefined,
  itemId: number | number[],
  translations: Nullable<TRemoveTranslations> | undefined,
  isRoom: boolean | null | undefined,
  operationId: string,
  operation: TOperationName,

)=> {
  const { addActiveItems, getIsEmptyTrash } = self.filesStore;
  const { isRecycleBinFolder, recycleBinFolderId } = self.treeFoldersStore;
  const { setSecondaryProgressBarData } =
    self.uploadDataStore.secondaryProgressDataStore;

  const destFolderId = isRecycleBinFolder ? null : recycleBinFolderId;

  if (isFile) {
    const fileParentId = self.filesStore.files.find(
      (x) => x.id === itemId,
    )?.folderId;
    addActiveItems([itemId as number], null, destFolderId);
    // the shared deleteFile declares deleteAfter/immediately
    // as required, but the old JS always called it with the id only
    // (undefined is sent as-is at runtime); the erased cast keeps the call
    // arity unchanged.
    return (
      deleteFile as unknown as (fileId: number | number[]) => Promise<TOperation[]>
    )(itemId).then(async (res) => {
      const result = res[0];

      if (result?.error) return Promise.reject(result.error);
      const data = result ?? null;

      await self.uploadDataStore.loopFilesOperations(data, {
        operationId,
        operation,
      });

      self.updateFilesAfterDelete(operationId, operation);
      self.filesStore.removeFiles([itemId as number], null, null, destFolderId);
      forgetEncryptedFilename(itemId as number);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: AnalyticsEvents.FileDeleted,
        id: itemId,
        parentId: fileParentId,
      });
    });
  }
  if (isRoom) {
    const items = Array.isArray(itemId) ? itemId : [itemId];
    const roomParentId = self.filesStore.folders.find(
      (x) => x.id === items[0],
    )?.parentId;
    addActiveItems(null, items);

    self.setGroupMenuBlocked(true);
    return removeFiles(items, [], false, true)
      .then(async (res) => {
        const result = res[0];

        if (result?.error) return Promise.reject(result.error);
        const data = result ?? null;
        await self.uploadDataStore.loopFilesOperations(data, {
          operation,
          operationId,
        });
      })
      .then(() => {
        toastr.success(
          translations?.successRemoveTemplate
            ? translations.successRemoveTemplate
            : items.length > 1
              ? translations?.successRemoveRooms
              : translations?.successRemoveRoom,
        );

        const { rootFolderType } = self.selectedFolderStore;
        const categoryType = getCategoryTypeByFolderType(rootFolderType, 0);
        const isAgentDeletion = categoryType === CategoryType.AIAgents;

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: isAgentDeletion
            ? AnalyticsEvents.AgentDeleted
            : AnalyticsEvents.RoomDeleted,
          ids: items,
          parentId: roomParentId,
        });

        const currentFolderId = self.selectedFolderStore.id;
        if (items.includes(currentFolderId as number)) {
          if (isAgentDeletion) {
            self.moveToAIAgentsPage();
          } else {
            self.moveToRoomsPage();
          }
        }
      })
      .finally(() => {
        self.setGroupMenuBlocked(false);
        setSecondaryProgressBarData({
          operation,
          completed: true,
          operationId,
        });
      });
  }

  addActiveItems(null, [itemId as number], destFolderId);
  // same as deleteFile above — the old JS calls deleteFolder
  // with the id only; the erased cast keeps the call arity unchanged.
  return (
    deleteFolder as unknown as (folderId: number | number[]) => Promise<TOperation[]>
  )(itemId).then(async (res) => {
    const result = res[0];

    if (result?.error) return Promise.reject(result.error);
    const data = result ?? null;
    await self.uploadDataStore.loopFilesOperations(data, {
      operationId,
      operation,
    });

    self.updateFilesAfterDelete(operationId, operation);
    self.filesStore.removeFiles(null, [itemId as number], null, destFolderId);

    window.dispatchEvent(
      new CustomEvent("folder_deleted", {
        detail: { id: itemId },
      }),
    );

    getIsEmptyTrash();
  });
};


export const deleteRoomsImpl = (
self: FilesActionStore,t: TTranslation
)=> {
  const { selection } = self.filesStore;

  const items: number[] = [];

  selection.forEach((item) => {
    items.push(item.id);
  });

  const translations = {
    successRemoveRoom: t("Common:RoomRemoved"),
    successRemoveRooms: t("Common:RoomsRemoved"),
  };

  self.deleteItemAction(items, "", translations, null, null, true);
};


export const deleteRoomsActionImpl = async (
self: FilesActionStore,
  itemId: number | number[],
  translations?: Nullable<TRemoveTranslations>,

)=> {
  const { secondaryProgressDataStore, clearActiveOperations } =
    self.uploadDataStore;

  const { setSecondaryProgressBarData } = secondaryProgressDataStore;

  const operationId = uniqueid("operation_");

  const pbData = {
    operation: OPERATIONS_NAME.deletePermanently,
    operationId,
  };
  setSecondaryProgressBarData({
    percent: 0,
    ...pbData,
  });

  const id = Array.isArray(itemId) ? itemId : [itemId];

  try {
    self.setGroupMenuBlocked(true);
    await self.deleteItemOperation(
      false,
      itemId,
      translations,
      true,
      pbData.operationId,
      pbData.operation,
    );
  } catch (err) {
    setSecondaryProgressBarData({
      completed: true,
      alert: true,
      ...pbData,
    });

    return toastr.error((err as Error).message ? (err as Error).message : (err as string), null, 0, true);
  } finally {
    self.setGroupMenuBlocked(false);
    setTimeout(() => clearActiveOperations(null, id), TIMEOUT);
  }
};


export const onDeleteVersionFileImpl = async (
self: FilesActionStore,fileId: number, versions: number[]
)=> {
  const { secondaryProgressDataStore, clearActiveOperations } =
    self.uploadDataStore;

  const { setSecondaryProgressBarData } = secondaryProgressDataStore;

  const {
    setVersionDeletionProcess,
    setVersionSelectedForDeletion,
    fetchFileVersions,
    isVisible,
  } = self.versionHistoryStore;

  setVersionDeletionProcess(true);

  const operationId = uniqueid("operation_");

  setSecondaryProgressBarData({
    operation: OPERATIONS_NAME.deleteVersionFile,
    operationId,
  });

  self.filesStore.setActiveFiles([fileId]);

  try {
    await deleteVersionFile(fileId, versions)
      .then(async (res) => {
        const result = res[0];

        if (result?.error) return Promise.reject(result.error);
        const data = result ?? null;
        const pbData = {
          operation: OPERATIONS_NAME.deleteVersionFile,
          operationId,
        };

        await self.uploadDataStore.loopFilesOperations(data, pbData);
      })
      .finally(() => {
        setVersionSelectedForDeletion(null);
        setVersionDeletionProcess(false);

        // fetchFileVersions declares requestToken as an
        // optional string; the old JS passed null (only forwarded when
        // truthy downstream).
        if (isVisible)
          fetchFileVersions(fileId, null, null as unknown as string, true);

        clearActiveOperations([fileId]);

        setSecondaryProgressBarData({
          operation: OPERATIONS_NAME.deleteVersionFile,
          completed: true,
          operationId,
        });
      });
  } catch (err) {
    setSecondaryProgressBarData({
      operation: OPERATIONS_NAME.deleteVersionFile,
      completed: true,
      alert: true,
      operationId,
    });

    setVersionSelectedForDeletion(null);
    setVersionDeletionProcess(false);
    return toastr.error((err as Error).message ? (err as Error).message : (err as string));
  }
};

