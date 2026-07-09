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
import {
  isFile as isFileCheck,
  isFolder as isFolderCheck,
} from "@docspace/shared/utils/typeGuards";
import {
  decryptEncryptedItemToFile,
  addCopySuffix,
  tagFileForCopy,
} from "@docspace/shared/services/private-room/encrypted-copy";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import uniqueid from "lodash/uniqueId";
import FilesFilter from "@docspace/shared/api/files/filter";
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
import type { TRoom, TRoomSecurity } from "@docspace/shared/api/rooms/types";
import i18n from "../../i18n";
import type FilesActionStore from "../FilesActionsStore";
import type DialogsStore from "../DialogsStore";
import type {
  TActionItem,
  TOperationDataPayload,
} from "../FilesActionsStore";

export const duplicateActionImpl = async (
self: FilesActionStore,item: TActionItem
)=> {
  if (item.fileExst && item.encrypted) {
    return self.duplicateEncryptedFile(item);
  }

  if (!item.fileExst && self.treeFoldersStore.isPrivacyFolder) {
    return;
  }

  const { setSecondaryProgressBarData } =
    self.uploadDataStore.secondaryProgressDataStore;
  const { clearActiveOperations } = self.uploadDataStore;
  const selectedFolder = self.selectedFolderStore.getSelectedFolder();

  self.setSelectedItems();

  const folderIds: number[] = [];
  const fileIds: number[] = [];
  item.fileExst ? fileIds.push(item.id) : folderIds.push(item.id);

  const operationId = uniqueid("operation_");

  const operationName = OPERATIONS_NAME.duplicate;

  setSecondaryProgressBarData({
    operation: operationName,
    percent: 0,
    operationId,
    itemsCount: 1,
    title: item.title,
    isFolder: item.isFolder,
    operationIds: [item.id],
    // destFolderInfo is typed as TFolder but the old JS
    // passes the selected-folder snapshot here; only navigation fields are
    // read downstream.
    destFolderInfo: selectedFolder as unknown as TFolder,
    alert: false,
  });

  self.filesStore.addActiveItems(fileIds, folderIds);

  return duplicate(folderIds, fileIds)
    .then(async (res) => {
      const result = res[0];

      if (result?.error) return Promise.reject(result.error);

      const pbData = { operation: operationName, operationId };
      const data = result ?? null;

      if (!data) {
        return Promise.reject();
      }

      const operationData = await self.uploadDataStore.loopFilesOperations(
        data,
        pbData,
      );

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

      setSecondaryProgressBarData({
        operation: operationName,
        operationId,
        completed: true,
      });
    })
    .catch((err) => {
      clearActiveOperations(fileIds, folderIds);

      setSecondaryProgressBarData({
        operation: operationName,
        operationId,
        alert: true,
        completed: true,
        error: err as string,
      });
    })
    .finally(() => {
      clearActiveOperations(fileIds, folderIds);
      self.setGroupMenuBlocked(false);
    });
};


export const duplicateEncryptedFileImpl = async (
self: FilesActionStore,item: TActionItem
)=> {
  return self.copyEncryptedFilesToFolder([item], item.folderId, {
    private: true,
    rootFolderId: self.selectedFolderStore.rootFolderId,
    roomType: self.selectedFolderStore.roomType ?? RoomsType.CustomRoom,
  });
};


export const copyEncryptedFilesToFolderImpl = async (
self: FilesActionStore,
  items: TActionItem[],
  destFolderId: number | string | undefined,
  destInfo?: {
    private?: boolean;
    rootFolderId?: number | string;
    roomType?: Nullable<RoomsType>;
  },

)=> {
  const { user, encryptionKeys } = self.userStore;

  if (!encryptionKeys || encryptionKeys.length === 0) {
    toastr.error(i18n.t("Common:EncryptionKeysNotConfigured"));
    return;
  }

  const userId = user?.id;
  if (!userId) return;

  const identity = await requireUnlock(String(userId));
  if (!identity) {
    toastr.error(i18n.t("Common:EncryptionLockedAddMembers"));
    return;
  }

  const sameRoomRoot =
    destInfo?.private === true &&
    destInfo?.rootFolderId === self.selectedFolderStore.rootFolderId;

  const destContext = {
    roomType: destInfo?.roomType ?? RoomsType.CustomRoom,
    isPrivate: !!sameRoomRoot,
  };

  const filesToUpload: ReturnType<typeof tagFileForCopy>[] = [];
  const failed: string[] = [];

  for (const item of items) {
    try {
      const sourceRoomId = self.resolveRoomIdForFile(item);
      // decryptEncryptedItemToFile declares viewUrl/roomId
      // as required, but the old JS passed the loose view-model and a
      // possibly-null room id through unchecked.
      const decryptedFile = await decryptEncryptedItemToFile(
        item as Parameters<typeof decryptEncryptedItemToFile>[0],
        String(userId),
        identity,
        sourceRoomId as number | string,
      );

      const newName = sameRoomRoot
        ? addCopySuffix(decryptedFile.name)
        : decryptedFile.name;
      const tagged = tagFileForCopy(
        new File([decryptedFile], newName, { type: decryptedFile.type }),
        destFolderId as number | string,
        destContext,
      );
      filesToUpload.push(tagged);
    } catch (error) {
      console.error(
        `[ENCRYPTION] client copy failed for file ${item.id}:`,
        error,
      );
      failed.push(item.title);
    }
  }

  if (filesToUpload.length > 0) {
    self.uploadDataStore.startUpload(
      filesToUpload,
      destFolderId as number | string,
      i18n.t,
    );
  }

  if (failed.length > 0) {
    toastr.error(
      i18n.t("Common:EncryptedCopyFailed", {
        defaultValue: "Failed to copy encrypted files: {{names}}",
        names: failed.join(", "),
      }),
    );
  }
};


export const getItemsInfoImpl = (
self: FilesActionStore,items: TActionItem[]
)=> {
  const requests = items
    .map((item) => {
      if (isFolderCheck(item)) {
        return self.filesStore.getFolderInfo(item.id);
      }
      if (isFileCheck(item)) {
        return self.filesStore.getFileInfo(item.id);
      }
      return null;
    })
    .filter(Boolean);

  return Promise.all(requests);
};


export const checkFileConflictsImpl = (
self: FilesActionStore,
  destFolderId: number | string | null | undefined,
  folderIds: number[],
  fileIds: number[],

)=> {
  self.filesStore.addActiveItems(fileIds, null, destFolderId);
  self.filesStore.addActiveItems(null, folderIds, destFolderId);
  return checkFileConflicts(destFolderId as number | string, folderIds, fileIds);
};


export const setConflictDialogDataImpl = (
self: FilesActionStore,
  conflicts: (TFile | TFolder)[],
  operationData: TOperationDataPayload,

)=> {
  self.dialogsStore.setConflictResolveDialogItems(conflicts);
  // TConflictResolveDialogData in DialogsStore is a
  // structural type of what the still-.js dialog reads; this payload is a
  // superset of it.
  self.dialogsStore.setConflictResolveDialogData(
    operationData as unknown as Parameters<
      DialogsStore["setConflictResolveDialogData"]
    >[0],
  );
  self.dialogsStore.setConflictResolveDialogVisible(true);
};


export const checkOperationConflictImpl = async (
self: FilesActionStore,operationData: TOperationDataPayload
)=> {
  const { destFolderId, folderIds, fileIds } = operationData;
  const { setBufferSelection } = self.filesStore;

  self.setSelectedItems();

  self.filesStore.setSelected("none");
  let conflicts: (TFile | TFolder)[];

  try {
    conflicts = await self.checkFileConflicts(
      destFolderId,
      folderIds,
      fileIds,
    );
  } catch (err) {
    setBufferSelection(null);
    return toastr.error((err as Error).message ? (err as Error).message : (err as string));
  }

  if (conflicts.length) {
    self.setConflictDialogData(conflicts, operationData);
  } else {
    try {
      await self.uploadDataStore.itemOperationToFolder(operationData);
    } catch (err) {
      console.error(err);
      setBufferSelection(null);
    }
  }
};


export const preparingDataForCopyingToRoomImpl = async (
self: FilesActionStore,
  destFolderId: number | string,
  selections: TActionItem[],
  destFolderInfo?: TFolder | TRoom,

)=> {
  const fileIds: number[] = [];
  let folderIds: number[] = [];

  if (!selections.length) return;
  const oneFolder = selections.length === 1 && selections[0].isFolder;

  if (oneFolder) {
    folderIds = [selections[0].id];

    try {
      // the shared getFolder declares `filter` as required,
      // but the old JS always called it with the id only; the erased cast
      // keeps the call arity unchanged.
      const selectedFolder = await (
        getFolder as unknown as (
          folderId: number | string,
        ) => Promise<TGetFolder>
      )(selections[0].id);
      const { folders, files, total } = selectedFolder;

      if (total === 0) {
        self.filesStore.setSelection([]);
        self.filesStore.setBufferSelection(null);
        return;
      }

      const title = folders.length ? folders[0].title : files[0].title;
      self.setSelectedItems(title, total);
    } catch (err) {
      toastr.error(err as string);
    }
  }

  !oneFolder &&
    selections.forEach((item) => {
      if (item.fileExst || item.contentLength) fileIds.push(item.id);
      else folderIds.push(item.id);
    });

  !oneFolder && self.setSelectedItems(selections[0].title, selections.length);
  self.filesStore.setSelection([]);
  self.filesStore.setBufferSelection(null);

  const operationData = {
    destFolderId,
    destFolderInfo: destFolderInfo as TFolder,
    folderIds,
    fileIds,
    deleteAfter: false,
    isCopy: true,
    content: oneFolder,
    itemsCount: selections.length,
    ...(selections.length === 1 && { title: selections[0].title }),
  };

  return self.uploadDataStore.itemOperationToFolder(operationData);
};


export const copyFromTemplateFormImpl = async (
self: FilesActionStore,fileInfo: TFile
)=> {
  const selectedItemId = self.selectedFolderStore.id;
  const fileIds = [fileInfo.id];

  const operationData = {
    destFolderId: selectedItemId,
    folderIds: [],
    fileIds,
    deleteAfter: false,
    isCopy: true,
    folderTitle: self.selectedFolderStore.title,
  };

  self.uploadDataStore.secondaryProgressDataStore.setItemsSelectionTitle(
    fileInfo.title,
  );

  const conflicts = await checkFileConflicts(
    selectedItemId as number | string,
    [],
    fileIds,
  );

  if (conflicts.length) {
    return self.setConflictDialogData(conflicts, operationData);
  }

  self.uploadDataStore
    .itemOperationToFolder(operationData)
    .catch((error) => toastr.error(error));
};


export const copyFileToAiKnowledgeImpl = async (
self: FilesActionStore,filesInfo: TActionItem[]
)=> {
  const selectedItemId = self.aiRoomStore.knowledgeId;
  const fileIds = filesInfo.map((f) => f.id);

  const operationData = {
    destFolderId: selectedItemId,
    folderIds: [],
    fileIds,
    deleteAfter: false,
    isCopy: true,
    isAI: true,
    folderTitle: self.selectedFolderStore.title,
  };

  self.uploadDataStore.secondaryProgressDataStore.setItemsSelectionTitle(
    filesInfo[0].title,
  );

  self.uploadDataStore
    .itemOperationToFolder(operationData)
    .catch((error) => toastr.error(error));
};


export const moveDragItemsImpl = (
self: FilesActionStore,
  destFolderId: number | string,
  folderTitle: string,
  destFolderInfo: TFolder & {
    private?: boolean;
    rootFolderId?: number | string;
  },

)=> {
  const sourceInPrivateRoom = self.treeFoldersStore.isPrivacyFolder;
  const isDestInsideSameRoom =
    sourceInPrivateRoom &&
    destFolderInfo?.rootFolderType === FolderType.Rooms;
  const isPrivateDestination =
    destFolderInfo?.private === true || isDestInsideSameRoom;

  if (isPrivateDestination && !sourceInPrivateRoom) {
    toastr.error(i18n.t("Common:CannotTransferToPrivateRoom"));
    return;
  }

  if (!isPrivateDestination && sourceInPrivateRoom) {
    const { bufferSelection: dragBufferSelection } = self.filesStore;
    const dragSelection = (
      dragBufferSelection ? [dragBufferSelection] : self.filesStore.selection
    ).filter((el) => !el.isFolder || el.id !== destFolderId);

    const files = dragSelection.filter((el) => !el.isFolder);
    const hasFolders = dragSelection.some((el) => el.isFolder);

    if (hasFolders) {
      toastr.error(i18n.t("Common:CannotTransferFolderFromPrivateRoom"));
    }

    if (files.length > 0) {
      self.copyEncryptedFilesToFolder(files, destFolderId, {
        private: false,
        rootFolderId: destFolderInfo?.rootFolderId,
        roomType: destFolderInfo?.roomType,
      });
    }

    return;
  }

  const folderIds: number[] = [];
  const fileIds: number[] = [];
  const deleteAfter = false;

  const { bufferSelection } = self.filesStore;
  const { isRootFolder } = self.selectedFolderStore;

  let selection = bufferSelection
    ? [bufferSelection]
    : self.filesStore.selection;

  selection = selection.filter(
    (el) => !el.isFolder || el.id !== destFolderId,
  );

  // security is optional on the .js view-model; the old JS
  // read it unchecked.
  const isCopy = selection.findIndex((f) => f.security!.Move) === -1;

  const operationData = {
    destFolderId,
    destFolderInfo,
    folderIds,
    fileIds,
    deleteAfter,
    folderTitle,
    isCopy,
    itemsCount: selection.length,
    ...(selection.length === 1 && {
      title: selection[0].title,
      isFolder: selection[0].isFolder,
    }),
  };

  selection.forEach((item) => {
    if (!item.isFolder) {
      fileIds.push(item.id);
    } else if (!item.providerKey || !isRootFolder) {
      folderIds.push(item.id);
    }
  });

  if (!folderIds.length && !fileIds.length) return;
  self.checkOperationConflict(operationData);
};


export const getPublicKeyImpl = async (
self: FilesActionStore,folder: TActionItem | TFolder
)=> {
  if (folder.shared) {
    const filterObj = FilesFilter.getFilter(window.location);

    if (filterObj?.key) {
      return filterObj.key;
    }

    try {
      const link = await self.filesStore.getPrimaryLink(folder.id);
      const key = link?.sharedTo?.requestToken;

      return key;
    } catch (error) {
      toastr.error(error as string);
    }
  }

  return null;
};

