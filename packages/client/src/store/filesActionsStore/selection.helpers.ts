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
import { makeAutoObservable, runInAction } from "mobx";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  isFile as isFileCheck,
  isFolder as isFolderCheck,
} from "@docspace/shared/utils/typeGuards";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import {
  frameCallEvent,
  getConvertedSize,
  getObjectByLocation,
  getCategoryType,
  splitFileAndFolderIds,
} from "@docspace/shared/utils/common";
import uniqueid from "lodash/uniqueId";
import { createLoader } from "@docspace/shared/utils/createLoader";
import api from "@docspace/shared/api";
import { OPERATIONS_NAME, CategoryType } from "@docspace/shared/constants";
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
import {
  SECTION_ROOT_FOLDER_TYPES,
  changeCustomFilter as changeCustomFilterHelper,
  checkExportRoomIndexProgress,
  convertToArray,
  convertToTree,
  nameWithoutExtension as nameWithoutExtensionHelper,
  setPinAction as setPinActionHelper,
} from "./helpers";
import type { TTreeNode, TUploadTreeFile } from "./helpers";
import type FilesActionStore from "../FilesActionsStore";
import type {
  TActionItem,
  TOperationName,
} from "../FilesActionsStore";

export const updateCurrentFolderImpl = async (
self: FilesActionStore,
  clearSelection?: boolean | null,
  operationId?: string,
  // some callers (onLeaveRoom, reorderIndexOfFiles) omit
  // `operation`; the old JS forwarded undefined into the progress-bar
  // payload, the cast below keeps that behavior.
  operation?: TOperationName,
  skipFetch = false,

)=> {
  const { setSecondaryProgressBarData } =
    self.uploadDataStore.secondaryProgressDataStore;

  const {
    fetchFiles,
    fetchRooms,
    fetchAgents,
    filter,
    roomsFilter,
    scrollToTop,
  } = self.filesStore;

  const {
    isRoomsFolder,
    isArchiveFolder,
    isArchiveFolderRoot,
    isTemplatesFolder,
    isAIAgentsFolder,
    isFormsFolder,
  } = self.treeFoldersStore;

  let newFilter: undefined;

  let updatedFolder = self.selectedFolderStore.id;

  if (self.dialogsStore.isFolderActions) {
    updatedFolder = self.selectedFolderStore.parentId;
  }

  try {
    if (skipFetch) return;

    if (isAIAgentsFolder) {
      fetchAgents(
        updatedFolder,
        newFilter || roomsFilter.clone(),
        false,
        false,
      );
    } else if (
      isRoomsFolder ||
      isArchiveFolder ||
      isArchiveFolderRoot ||
      isTemplatesFolder ||
      isFormsFolder
    ) {
      await fetchRooms(
        updatedFolder,
        newFilter || roomsFilter.clone(),
        undefined,
        undefined,
        undefined,
      );
    } else {
      await fetchFiles(
        updatedFolder,
        newFilter || filter,
        true,
        true,
        clearSelection,
      );
    }
  } finally {
    scrollToTop();
    self.dialogsStore.setIsFolderActions(false);

    setSecondaryProgressBarData({
      operation: operation as TOperationName,
      completed: true,
      operationId,
    });
  }
};


export const createFolderTreeImpl = async (
self: FilesActionStore,
  treeList: TTreeNode[],
  parentFolderId: number | string,
  filesList: TUploadTreeFile[],

): Promise<TTreeNode[] | undefined>=> {
  if (!treeList || !treeList.length) return;

  for (let i = 0; i < treeList.length; i++) {
    const treeNode = treeList[i];
    const isFile = treeList[i].isFile;

    // console.log(
    //   `createFolderTree parent id = ${parentFolderId} name '${treeNode.name}': `,
    //   treeNode.children
    // );

    if (isFile) {
      treeList[i].file.parentFolderId = parentFolderId;
      filesList.push(treeList[i].file);
      continue;
    }

    const folder = await createFolder(
      parentFolderId,
      treeNode.name.trimEnd(),
    );
    const parentId = folder.id;

    if (treeNode.children.length == 0) continue;

    await self.createFolderTree(treeNode.children, parentId, filesList);
  }

  return treeList;
};


export const createFoldersTreeImpl = async (
self: FilesActionStore,
  t: TTranslation,
  files: TUploadTreeFile[] | Record<string, TUploadTreeFile>,
  folderId?: number | string | null,
  dragged?: boolean,

)=> {
  //  console.log("createFoldersTree", files, folderId);
  const { uploaded, percent } = self.uploadDataStore;

  const { isAIAgentsFolderRoot } = self.treeFoldersStore;
  const { setPrimaryProgressBarData } =
    self.uploadDataStore.primaryProgressDataStore;

  const roomFolder =
    self.selectedFolderStore.navigationPath.find((r) => r.isRoom) ??
    self.selectedFolderStore.getSelectedFolder();

  const withoutHiddenFiles = Object.values(files).filter((f) => {
    const isHidden = /(^|\/)\.[^\/\.]/g.test(f.name);

    return !isHidden;
  });

  const operationId = uniqueid("operation_");

  const pbData = {
    operation: OPERATIONS_NAME.upload,
    completed: false,
    percent,
    dragged: dragged ? operationId : null,
  };

  if (roomFolder && roomFolder.quotaLimit && roomFolder.quotaLimit !== -1) {
    // usedSpace is optional on the folder snapshot; the old
    // JS did unchecked arithmetic here.
    const freeSpace = roomFolder.quotaLimit - roomFolder.usedSpace!;

    const filesSize = withoutHiddenFiles.reduce((acc, file) => {
      return acc + file.size;
    }, 0);

    if (filesSize > freeSpace) {
      setPrimaryProgressBarData({
        ...pbData,
        completed: uploaded,
        alert: true,
      });

      const size = getConvertedSize(t, roomFolder.quotaLimit);

      const error = isAIAgentsFolderRoot
        ? t("Common:AIAgentSpaceQuotaExceeded", {
            aiAgent: t("Common:AIAgent"),
            size,
          })
        : t("Common:RoomSpaceQuotaExceeded", {
            size,
          });
      throw new Error(error);
    }
  }

  const toFolderId = folderId || self.selectedFolderStore.id;

  if (withoutHiddenFiles.length) {
    setPrimaryProgressBarData({ ...pbData, disableUploadPanelOpen: true });
  }

  const tree = convertToTree(withoutHiddenFiles);

  const filesList: TUploadTreeFile[] = [];
  await self.createFolderTree(tree, toFolderId as number | string, filesList);

  if (withoutHiddenFiles.length) {
    setPrimaryProgressBarData({ ...pbData, completed: uploaded });
  }

  if (filesList.length) {
    setPrimaryProgressBarData({ ...pbData });
  }

  return filesList;
};


export const completeActionImpl = async (
self: FilesActionStore,
  selectedItem: { id: number; isFolder?: boolean },
  type?: FileAction,

)=> {
  switch (type) {
    case FileAction.Rename:
      self.onSelectItem(
        {
          id: selectedItem.id,
          isFolder: selectedItem.isFolder,
        },
        false,
        false,
      );
      break;
    case FileAction.RestoreVersion:
      self.onSelectItem(
        {
          id: selectedItem.id,
          isFolder: false,
        },
        false,
        false,
      );
      break;
    default:
      break;
  }
};


export const onSelectItemImpl = (
self: FilesActionStore,
  { id, isFolder }: { id?: number; isFolder?: boolean },
  withSelect = true,
  isContextItem = true,
  isSingleMenu = false,

)=> {
  const {
    setBufferSelection,
    setSelected,
    selection,
    setSelection,
    setHotkeyCaretStart,
    setHotkeyCaret,
    setEnabledHotkeys,
  } = self.filesStore;

  if (!id) return;

  const item = self.filesStore.filesList.find(
    (elm) => elm.id === id && elm.isFolder === isFolder,
  );

  if (item) {
    const isSelected =
      selection.findIndex((f) => f.id === id && f.isFolder === isFolder) !==
      -1;

    if (withSelect) {
      // TODO: fix double event on context-menu click
      if (isSelected && selection.length === 1 && !isContextItem) {
        setSelected("none");
      } else {
        setSelection([item]);
        setHotkeyCaret(null);
        setHotkeyCaretStart(item);
      }
    } else if (
      isSelected &&
      selection.length > 1 &&
      !isContextItem &&
      !isSingleMenu
    ) {
      setHotkeyCaret(null);
      setHotkeyCaretStart(item);
    } else {
      setSelected("none");
      setBufferSelection(item);
    }

    isContextItem && setEnabledHotkeys(false);
  }
};


export const selectTagImpl = (
self: FilesActionStore,tag: {
  label: string;
  roomType?: number;
  providerType?: number;
}
)=> {
  const { roomsFilter } = self.filesStore;

  const { setIsSectionBodyLoading } = self.clientLoadingStore;

  const categoryType = getCategoryType(window.DocSpace.location);

  const setIsLoading = (param: boolean) => {
    setIsSectionBodyLoading(param);
  };

  const newFilter = roomsFilter.clone();

  if (tag.label !== "no-tag") {
    const tags = newFilter.tags ? [...(newFilter.tags as string[])] : [];

    if (tags.length > 0) {
      const idx = tags.findIndex((item) => item === tag.label);

      if (idx > -1) {
        // TODO: remove tag here if already selected
        return;
      }
    }

    // RoomsFilter declares type/provider as strings but the
    // old JS assigns the numeric tag ids directly; the erased casts keep
    // that behavior.
    if (tag.roomType) {
      if (newFilter.type && +newFilter.type === tag.roomType) return;
      newFilter.type = tag.roomType as unknown as string;
    } else if (tag.providerType) {
      if (newFilter.provider && +newFilter.provider === tag.providerType)
        return;
      newFilter.provider = tag.providerType as unknown as string;
    } else {
      tags.push(tag.label);
      newFilter.tags = [...tags];
    }

    newFilter.withoutTags = false;
  } else {
    newFilter.withoutTags = true;
  }

  let pathName = window.DocSpace.location.pathname;

  if (
    categoryType === CategoryType.Chat ||
    categoryType === CategoryType.AIAgent
  ) {
    pathName = getCategoryUrl(CategoryType.AIAgents);
  }

  setIsLoading(true);
  window.DocSpace.navigate(
    `${pathName}?${newFilter.toUrlParams(self.userStore?.user?.id)}`,
  );
};


export const selectOptionImpl = (
self: FilesActionStore,{ option, value }: { option: string; value: string }
)=> {
  const { roomsFilter } = self.filesStore;

  const { setIsSectionBodyLoading } = self.clientLoadingStore;

  const setIsLoading = (param: boolean) => {
    setIsSectionBodyLoading(param);
  };

  const newFilter = roomsFilter.clone();
  const tags = newFilter.tags ? [...(newFilter.tags as string[])] : [];
  newFilter.tags = [...tags];

  if (option === "defaultTypeRoom") {
    newFilter.type = value;
  }

  if (option === "typeProvider") {
    newFilter.provider = value;
  }

  setIsLoading(true);
  window.DocSpace.navigate(
    `${window.DocSpace.location.pathname}?${newFilter.toUrlParams()}`,
  );
};


export const selectRowActionImpl = (
self: FilesActionStore,checked: boolean, file: TActionItem
)=> {
  const {
    // selected,
    // setSelected,
    selectFile,
    deselectFile,
    setBufferSelection,
    setHotkeyCaret,
    setHotkeyCaretStart,
  } = self.filesStore;
  // selected === "close" && setSelected("none");
  setBufferSelection(null);
  setHotkeyCaret(null);
  setHotkeyCaretStart(file);

  if (checked) {
    selectFile(file);
  } else {
    deselectFile(file);
  }
};


export const markAsReadImpl = (
self: FilesActionStore,
  folderIds: (number | string)[],
  // NewFilesBadge calls this with folderIds only; the old
  // JS forwarded undefined to the API payload.
  fileIds?: (number | string)[],
  item?: TActionItem,

)=> {
  const { setSecondaryProgressBarData } =
    self.uploadDataStore.secondaryProgressDataStore;

  const operationId = uniqueid("operation_");
  const pbData = { operation: OPERATIONS_NAME.markAsRead, operationId };

  setSecondaryProgressBarData({
    percent: 0,
    ...pbData,
  });

  // onMarkAsRead passes stringified file ids; the shared
  // markAsRead declares number[] but only serializes them.
  return markAsRead(folderIds as number[], fileIds as number[])
    .then(async (res) => {
      const data = res[0] ?? null;

      await self.uploadDataStore.loopFilesOperations(data, pbData);
    })
    .then(() => {
      if (!item) return;

      // self.setNewBadgeCount(item);
      const { getFileIndex, updateFileStatus } = self.filesStore;

      const index = getFileIndex(item.id);
      updateFileStatus(index, (item.fileStatus as number) & ~FileStatus.IsNew);
    })
    .catch((err) => toastr.error(err as string, null, 0, true))
    .finally(() =>
      setSecondaryProgressBarData({
        operation: OPERATIONS_NAME.markAsRead,
        completed: true,
        operationId,
      }),
    );
};


export const lockFileActionImpl = async (
self: FilesActionStore,id: number, locked: boolean
)=> {
  const { setFile } = self.filesStore;
  try {
    const res = await lockFile(id, locked);
    setFile(res);
  } catch (err) {
    throw new Error(
      ((err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? err) as string,
    );
  }
};


export const finalizeVersionActionImpl = async (
self: FilesActionStore,id: number
)=> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const { setFile } = self.filesStore;
  try {
    timer = setTimeout(() => {
      self.filesStore.setActiveFiles([id]);
    }, 200);
    await (finalizeVersion(id, 0, false) as Promise<TFile[] | undefined>).then(
      (res) => {
        if (res && res[0]) {
          setFile(res[0]);
          self.filesStore.setActiveFiles([]);
        }
      },
    );
  } catch (err) {
    toastr.error(err as string);
  } finally {
    clearTimeout(timer!);
  }
};


export const setSelectedItemsImpl = (
self: FilesActionStore,title?: string, length?: number
)=> {
  const selectionLength = length || self.filesStore.selection.length;
  const selectionTitle = title || self.filesStore.selectionTitle;

  if (selectionLength !== undefined && selectionTitle) {
    self.uploadDataStore.secondaryProgressDataStore.setItemsSelectionLength(
      selectionLength,
    );
    self.uploadDataStore.secondaryProgressDataStore.setItemsSelectionTitle(
      selectionTitle,
    );
  }
};


export const isExpiredLinkAsyncImpl = async (
self: FilesActionStore,item: TActionItem, withLoader = false
)=> {
  if (item.isLinkExpired) return true;
  if (!item.external || !item.requestToken) return false;

  const { clearActiveOperations } = self.uploadDataStore;
  const { addActiveItems } = self.filesStore;

  const { endLoader, startLoader } = createLoader();

  try {
    if (withLoader)
      startLoader(() =>
        runInAction(() => {
          self.setGroupMenuBlocked(true);
          addActiveItems(null, [item.id]);
        }),
      );

    // request() is typed as Promise<T> | undefined; the old
    // JS read `.status` unchecked.
    const response = (await api.rooms.validatePublicRoomKey(
      item.requestToken,
    ))!;

    const isExpired = response.status === ValidationStatus.Expired;

    if (isExpired) {
      const items = isFileCheck(item)
        ? self.filesStore.files
        : self.filesStore.folders;

      const foundItem = items.find((i) => i.id === item.id);

      if (foundItem && !foundItem.isLinkExpired) {
        foundItem.isLinkExpired = true;
      }

      const { selection, bufferSelection } = self.filesStore;

      const selectedItem =
        selection && selection.length === 1
          ? selection[0]
          : bufferSelection
            ? bufferSelection
            : null;

      if (
        selectedItem &&
        selectedItem.id === item.id &&
        !selectedItem.isLinkExpired
      ) {
        selectedItem.isLinkExpired = isExpired;
      }
    }

    return isExpired;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    if (withLoader)
      endLoader(() =>
        runInAction(() => {
          self.setGroupMenuBlocked(false);
          clearActiveOperations([], [item.id]);
        }),
      );
  }
};


export const retryVectorizationImpl = async (
self: FilesActionStore,files: TActionItem[]
)=> {
  const { updateFileVectorizationStatus } = self.filesStore;

  const filteredFiles = files.filter((file) => file.security?.Vectorization);

  if (!filteredFiles.length) return;

  const fileIds = filteredFiles.map((file) => file.id);

  try {
    fileIds.forEach((fileId) =>
      updateFileVectorizationStatus(fileId, VectorizationStatus.InProgress),
    );

    await api.ai.retryVectorization(fileIds);
  } catch (e) {
    fileIds.forEach((fileId) =>
      updateFileVectorizationStatus(fileId, VectorizationStatus.Failed),
    );

    toastr.error(e as string);
    console.error(e);
  }
};


export const onClickRemoveFromRecentImpl = (
self: FilesActionStore,selection: TActionItem[], t: TTranslation
)=> {
  const { setSelected } = self.filesStore;
  const ids = selection.map((item) => item.id);
  self.removeFilesFromRecent(ids, t);
  setSelected("none");
};


export const removeFilesFromRecentImpl = async (
self: FilesActionStore,fileIds: number[], t: TTranslation
)=> {
  const { refreshFiles } = self.filesStore;

  await deleteFilesFromRecent(fileIds);
  await refreshFiles();
  toastr.success(t("Files:RemovedFromRecent"));
};


export const askAIActionImpl = (
self: FilesActionStore,item: TActionItem
)=> {
  self.dialogsStore.setAiAgentSelectorDialogProps(
    true,
    item as unknown as TFile,
  );
};


export const runOperationsImpl = (
self: FilesActionStore,operations: string[] = []
)=> {
  const { files, folders, activeFiles, activeFolders, addActiveItems } =
    self.filesStore;

  const { itemOperationToFolder, clearActiveOperations } =
    self.uploadDataStore;
  if (!operations || operations.length === 0) {
    return "No operations specified";
  }

  // Count operations that need files (all except emptyTrash)
  const fileOperations = ["delete", "duplicate", "copy", "move"];

  const totalFilesNeeded =
    operations.filter((op) => fileOperations.includes(op)).length +
    (operations.includes("download") ? 2 : 0);

  const needsFolder =
    operations.includes("copy") || operations.includes("move");

  if (totalFilesNeeded > 0 && (!files || files.length < totalFilesNeeded)) {
    return `Need at least ${totalFilesNeeded} files`;
  }

  if (needsFolder && (!folders || folders.length < 1)) {
    return "Need at least 1 folder for copy and move operations";
  }

  const availableFiles = files
    ? files.filter(
        (file) => !activeFiles.some((active) => active.id === file.id),
      )
    : [];

  const availableFolders = folders
    ? folders.filter(
        (folder) => !activeFolders.some((active) => active.id === folder.id),
      )
    : [];

  if (totalFilesNeeded > 0 && availableFiles.length < totalFilesNeeded) {
    return `Need ${totalFilesNeeded} available files. Found only ${availableFiles.length} files that are not in active operations`;
  }

  if (needsFolder && availableFolders.length < 1) {
    return "Need at least 1 available folder. Found no folders that are not in active operations";
  }

  let currentFileIndex = 0;
  const operationResults: string[] = [];
  let errorMessage: string | null = null;

  operations.forEach((op) => {
    if (errorMessage) return;

    const filesToProcess =
      op === "download"
        ? availableFiles.slice(currentFileIndex, currentFileIndex + 2)
        : availableFiles.slice(currentFileIndex, currentFileIndex + 1);

    switch (op) {
      case "delete": {
        const hasDeletePermissions = filesToProcess.every(
          (file) => file.security?.Delete,
        );

        if (!hasDeletePermissions) {
          errorMessage = "No delete permission for one or more files";
          return;
        }

        self.deleteAction(null, filesToProcess)
          .then(() => {
            console.log(
              `Delete operation started for file: ${filesToProcess[0].title}`,
            );
          })
          .catch((err) => {
            console.log(
              `Error deleting file ${filesToProcess[0].title}: ${err}`,
            );
          });

        currentFileIndex += 1;
        operationResults.push(`deleting file: ${filesToProcess[0].title}`);
        break;
      }
      case "download": {
        const translations = {
          error: "Downloading error",
        };

        self.downloadFiles(
          filesToProcess.map((file) => file.id),
          [],
          translations,
        )
          .then(() => {
            console.log(
              `Download started for files: ${filesToProcess
                .map((file) => file.title)
                .join(", ")}`,
            );
          })
          .catch((err) => {
            console.log(
              `Error downloading files ${filesToProcess
                .map((file) => file.title)
                .join(", ")}: ${err}`,
            );
          });

        currentFileIndex += 2;
        operationResults.push(
          `downloading files: ${filesToProcess
            .map((file) => file.title)
            .join(", ")}`,
        );
        break;
      }
      case "duplicate": {
        const fileToDuplicate = filesToProcess[0];

        self.duplicateAction(fileToDuplicate)
          .then(() => {
            console.log(
              `Duplication started for file: ${fileToDuplicate.title}`,
            );
          })
          .catch((err) => {
            console.log(
              `Error duplicating file ${fileToDuplicate.title}: ${err}`,
            );
          });

        currentFileIndex += 1;
        operationResults.push(`duplicating file: ${fileToDuplicate.title}`);
        break;
      }
      case "copy":
      case "move": {
        const fileToProcess = filesToProcess[0];
        const targetFolder = availableFolders[0];

        const operationData = {
          destFolderId: targetFolder.id,
          // same TFolder-vs-view-model mismatch as above.
          destFolderInfo: targetFolder as unknown as TFolder,
          fileIds: [fileToProcess.id],
          folderIds: [],
          deleteAfter: false,
          isCopy: op === "copy",
          content: false,
          itemsCount: 1,
          title: fileToProcess.title,
        };

        addActiveItems(
          operationData.fileIds,
          operationData.folderIds,
          operationData.destFolderId,
        );

        itemOperationToFolder(operationData)
          .then(() => {
            console.log(
              `${op === "copy" ? "Copy" : "Move"} operation initiated for file: ${fileToProcess.title} to folder: ${targetFolder.title}`,
            );
          })
          .catch((err) => {
            clearActiveOperations(
              operationData.fileIds,
              operationData.folderIds,
            );
            console.log(
              `Error ${op === "copy" ? "copying" : "moving"} file ${fileToProcess.title}: ${err}`,
            );
          });

        currentFileIndex += 1;
        operationResults.push(
          `${op === "copy" ? "copying" : "moving"} file: ${fileToProcess.title} to folder: ${targetFolder.title}`,
        );
        break;
      }
      case "emptyTrash": {
        const translations = {
          successOperation: "Trash emptied",
        };

        self.emptyTrash(translations)
          .then(() => {
            console.log("Empty trash operation started");
          })
          .catch((err) => {
            console.log(`Error in empty trash operation: ${err}`);
          });

        operationResults.push("emptying trash");
        break;
      }
      default:
        errorMessage = `Unknown operation: ${op}`;
    }
  });

  return errorMessage || `Started ${operationResults.join(" and ")}`;
};

