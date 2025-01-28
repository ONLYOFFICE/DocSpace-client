// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import FavoritesReactSvgUrl from "PUBLIC_DIR/images/favorites.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/downloadAs.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/move.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg?url";
import ChangQuotaReactSvgUrl from "PUBLIC_DIR/images/change.quota.react.svg?url";
import DisableQuotaReactSvgUrl from "PUBLIC_DIR/images/disable.quota.react.svg?url";
import DefaultQuotaReactSvgUrl from "PUBLIC_DIR/images/default.quota.react.svg?url";
import RemoveOutlineSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
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
} from "@docspace/shared/api/files";
import {
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
} from "@docspace/shared/enums";
import { makeAutoObservable, runInAction } from "mobx";

import { toastr } from "@docspace/shared/components/toast";
import { TIMEOUT } from "@docspace/client/src/helpers/filesConstants";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { isDesktop, isLockedSharedRoom } from "@docspace/shared/utils";
import {
  getCategoryType,
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import { muteRoomNotification } from "@docspace/shared/api/settings";
import { CategoryType } from "SRC_DIR/helpers/constants";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import UsersFilter from "@docspace/shared/api/people/filter";
import GroupsFilter from "@docspace/shared/api/groups/filter";
import {
  getConvertedSize,
  getObjectByLocation,
} from "@docspace/shared/utils/common";
import uniqueid from "lodash/uniqueId";
import FilesFilter from "@docspace/shared/api/files/filter";
import { createLoader } from "@docspace/shared/utils/createLoader";

import { openingNewTab } from "@docspace/shared/utils/openingNewTab";
import SocketHelper, { SocketCommands } from "@docspace/shared/utils/socket";

import api from "@docspace/shared/api";
import { showSuccessExportRoomIndexToast } from "SRC_DIR/helpers/toast-helpers";
import { getContactsView } from "SRC_DIR/helpers/contacts";

import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { checkProtocol } from "../helpers/files-helpers";

class FilesActionStore {
  settingsStore;

  uploadDataStore;

  treeFoldersStore;

  filesStore;

  selectedFolderStore;

  filesSettingsStore;

  dialogsStore;

  mediaViewerDataStore;

  accessRightsStore;

  clientLoadingStore;

  publicRoomStore;

  infoPanelStore;

  peopleStore;

  indexingStore;

  userStore = null;

  currentTariffStatusStore = null;

  currentQuotaStore = null;

  isLoadedSearchFiles = false;

  isGroupMenuBlocked = false;

  emptyTrashInProgress = false;

  processCreatingRoomFromData = false;

  alreadyExportingRoomIndex = false;

  constructor(
    settingsStore,
    uploadDataStore,
    treeFoldersStore,
    filesStore,
    selectedFolderStore,
    filesSettingsStore,
    dialogsStore,
    mediaViewerDataStore,
    accessRightsStore,
    clientLoadingStore,
    publicRoomStore,
    pluginStore,
    infoPanelStore,
    userStore,
    currentTariffStatusStore,
    peopleStore,
    currentQuotaStore,
    indexingStore,
  ) {
    makeAutoObservable(this);
    this.settingsStore = settingsStore;
    this.uploadDataStore = uploadDataStore;
    this.treeFoldersStore = treeFoldersStore;
    this.filesStore = filesStore;
    this.selectedFolderStore = selectedFolderStore;
    this.filesSettingsStore = filesSettingsStore;
    this.dialogsStore = dialogsStore;
    this.mediaViewerDataStore = mediaViewerDataStore;
    this.accessRightsStore = accessRightsStore;
    this.clientLoadingStore = clientLoadingStore;
    this.publicRoomStore = publicRoomStore;
    this.pluginStore = pluginStore;
    this.infoPanelStore = infoPanelStore;
    this.userStore = userStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.peopleStore = peopleStore;
    this.currentQuotaStore = currentQuotaStore;
    this.indexingStore = indexingStore;
  }

  updateCurrentFolder = async (
    fileIds,
    folderIds,
    clearSelection,
    operationId,
    operation,
  ) => {
    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;

    const { fetchFiles, fetchRooms, filter, roomsFilter, scrollToTop } =
      this.filesStore;

    const { isRoomsFolder, isArchiveFolder, isArchiveFolderRoot } =
      this.treeFoldersStore;

    let newFilter;

    let updatedFolder = this.selectedFolderStore.id;

    if (this.dialogsStore.isFolderActions) {
      updatedFolder = this.selectedFolderStore.parentId;
    }

    try {
      if (isRoomsFolder || isArchiveFolder || isArchiveFolderRoot) {
        await fetchRooms(
          updatedFolder,
          newFilter || roomsFilter.clone(),
          undefined,
          undefined,
          undefined,
          true,
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
      this.dialogsStore.setIsFolderActions(false);
      // setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);

      setSecondaryProgressBarData({
        operation,
        completed: true,
        operationId,
      });
    }
  };

  convertToTree = (folders) => {
    const result = [];
    const level = { result };
    try {
      folders.forEach((folder) => {
        const folderPath = folder.path.split("/").filter((name) => name !== "");

        folderPath.reduce((r, name, i) => {
          if (!r[name]) {
            r[name] = { result: [] };
            r.result.push({
              name,
              children: r[name].result,
              isFile: folderPath.length - 1 === i && !folder.isEmptyDirectory,
              file: folder,
            });
          }

          return r[name];
        }, level);
      });
    } catch (e) {
      console.error("convertToTree", e);
    }
    return result;
  };

  createFolderTree = async (treeList, parentFolderId, filesList) => {
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

      const folder = await createFolder(parentFolderId, treeNode.name);
      const parentId = folder.id;

      if (treeNode.children.length == 0) continue;

      await this.createFolderTree(treeNode.children, parentId, filesList);
    }

    return treeList;
  };

  createFoldersTree = async (t, files, folderId) => {
    console.log("createFoldersTree", files, folderId);

    const { setPrimaryProgressBarData, clearPrimaryProgressData } =
      this.uploadDataStore.primaryProgressDataStore;

    const roomFolder =
      this.selectedFolderStore.navigationPath.find((r) => r.isRoom) ??
      this.selectedFolderStore.getSelectedFolder();

    const withoutHiddenFiles = Object.values(files).filter((f) => {
      const isHidden = /(^|\/)\.[^\/\.]/g.test(f.name);

      return !isHidden;
    });

    if (roomFolder && roomFolder.quotaLimit && roomFolder.quotaLimit !== -1) {
      const freeSpace = roomFolder.quotaLimit - roomFolder.usedSpace;

      const filesSize = withoutHiddenFiles.reduce((acc, file) => {
        return acc + file.size;
      }, 0);

      if (filesSize > freeSpace) {
        clearPrimaryProgressData();

        const size = getConvertedSize(t, roomFolder.quotaLimit);

        throw new Error(
          t("Common:RoomSpaceQuotaExceeded", {
            size,
          }),
        );
      }
    }

    const toFolderId = folderId || this.selectedFolderStore.id;

    const pbData = {
      operation: "upload",
      percent: 0,
      completed: false,
    };

    setPrimaryProgressBarData({ ...pbData, disableUploadPanelOpen: true });

    const tree = this.convertToTree(withoutHiddenFiles);

    const filesList = [];
    await this.createFolderTree(tree, toFolderId, filesList);

    if (!filesList.length) {
      setTimeout(() => clearPrimaryProgressData(), TIMEOUT);
    } else {
      setPrimaryProgressBarData({ ...pbData, disableUploadPanelOpen: false });
    }

    return filesList;
  };

  updateFilesAfterDelete = (operationId, operationName) => {
    const { setSelected } = this.filesStore;
    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;

    setSelected("close");

    this.dialogsStore.setIsFolderActions(false);

    setSecondaryProgressBarData({
      operation: operationName,
      completed: true,
      operationId,
    });
    // setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
  };

  deleteAction = async (translations, newSelection = null) => {
    const { isRecycleBinFolder, isPrivacyFolder, recycleBinFolderId } =
      this.treeFoldersStore;

    const {
      addActiveItems,
      getIsEmptyTrash,
      bufferSelection,
      activeFiles,
      activeFolders,
    } = this.filesStore;
    const { secondaryProgressDataStore, clearActiveOperations } =
      this.uploadDataStore;
    const { setSecondaryProgressBarData } = secondaryProgressDataStore;

    let selection =
      newSelection ||
      (this.filesStore.selection.length
        ? this.filesStore.selection
        : [bufferSelection]);

    selection = selection.filter((item) => item.security.Delete);

    const isThirdPartyFile = selection.some((f) => f.providerKey);

    const currentFolderId = this.selectedFolderStore.id;

    const operationId = uniqueid("operation_");

    const deleteAfter = false; // Delete after finished TODO: get from settings
    const immediately = !!(isRecycleBinFolder || isPrivacyFolder); // Don't move to the Recycle Bin

    const folderIds = [];
    const fileIds = [];

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

    setSecondaryProgressBarData({
      operation: operationName,
      percent: 0,
      operationId,
    });

    const destFolderId = immediately ? null : recycleBinFolderId;

    addActiveItems(fileIds, null, destFolderId);
    addActiveItems(null, folderIds, destFolderId);

    if (folderIds.length || fileIds.length) {
      try {
        this.setGroupMenuBlocked(true);
        await removeFiles(folderIds, fileIds, deleteAfter, immediately)
          .then(async (res) => {
            if (res[0]?.error) return Promise.reject(res[0].error);
            const data = res[0] ? res[0] : null;
            const pbData = {
              operation: operationName,
              operationId,
            };
            await this.uploadDataStore.loopFilesOperations(data, pbData);

            const showToast = () => {
              if (isRecycleBinFolder) {
                return toastr.success(translations.deleteFromTrash);
              }

              if (selection.length > 1 || isThirdPartyFile) {
                return toastr.success(translations.deleteSelectedElem);
              }
              if (selection[0].fileExst) {
                return toastr.success(translations.FileRemoved);
              }
              return toastr.success(translations.FolderRemoved);
            };

            if (this.dialogsStore.isFolderActions) {
              this.updateCurrentFolder(
                fileIds,
                folderIds,
                false,
                operationId,
                operationName,
              );
              showToast();
            } else {
              this.updateFilesAfterDelete(operationId, operationName);

              this.filesStore.removeFiles(
                fileIds,
                folderIds,
                showToast,
                destFolderId,
              );

              this.uploadDataStore.removeFiles(fileIds);
            }

            if (currentFolderId) {
              SocketHelper.emit(SocketCommands.RefreshFolder, currentFolderId);
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
        });
        // setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
        return toastr.error(err.message ? err.message : err);
      } finally {
        this.setGroupMenuBlocked(false);
      }
    }
  };

  emptyTrash = async (translations) => {
    const {
      secondaryProgressDataStore,
      loopFilesOperations,
      clearActiveOperations,
    } = this.uploadDataStore;
    const { setSecondaryProgressBarData } = secondaryProgressDataStore;
    const { isRecycleBinFolder } = this.treeFoldersStore;
    const { addActiveItems, files, folders, getIsEmptyTrash } = this.filesStore;

    const fileIds = files.map((f) => f.id);
    const folderIds = folders.map((f) => f.id);

    if (isRecycleBinFolder) {
      addActiveItems(fileIds, folderIds);
    }

    const operationId = uniqueid("operation_");

    this.emptyTrashInProgress = true;

    const pbData = {
      operation: OPERATIONS_NAME.deletePermanently,
      operationId,
    };

    setSecondaryProgressBarData({
      percent: 0,
      ...pbData,
    });

    try {
      await emptyTrash().then(async (res) => {
        if (res[0]?.error) return Promise.reject(res[0].error);
        const data = res[0] ? res[0] : null;

        await loopFilesOperations(data, pbData);
        toastr.success(translations.successOperation);
        this.updateCurrentFolder(
          fileIds,
          folderIds,
          null,
          pbData.operationId,
          pbData.operation,
        );
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
      // setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
      return toastr.error(err.message ? err.message : err);
    } finally {
      this.emptyTrashInProgress = false;
    }
  };

  emptyArchive = async (translations) => {
    const {
      secondaryProgressDataStore,
      loopFilesOperations,
      clearActiveOperations,
    } = this.uploadDataStore;
    const { setSecondaryProgressBarData } = secondaryProgressDataStore;
    const { isArchiveFolder } = this.treeFoldersStore;
    const { addActiveItems, roomsForDelete } = this.filesStore;

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
        if (res[0]?.error) return Promise.reject(res[0].error);
        const data = res[0] ? res[0] : null;

        await loopFilesOperations(data, pbData);
        toastr.success(translations.successOperation);
        this.updateCurrentFolder(
          null,
          folderIds,
          null,
          pbData.operationId,
          pbData.operation,
        );
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
      // setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);

      return toastr.error(err.message ? err.message : err);
    }
  };

  downloadFiles = async (fileConvertIds, folderIds, translations) => {
    const { clearActiveOperations, secondaryProgressDataStore } =
      this.uploadDataStore;

    const { setSecondaryProgressBarData } = secondaryProgressDataStore;
    const { openUrl } = this.settingsStore;

    const { addActiveItems } = this.filesStore;
    const { label, passwordError } = translations;
    const {
      setDownloadItems,
      setDownloadDialogVisible,
      downloadItems,
      setSortedPasswordFiles,
    } = this.dialogsStore;

    const operationId = uniqueid("operation_");

    const operationName = OPERATIONS_NAME.download;

    setSecondaryProgressBarData({
      operation: operationName,
      percent: 0,
      operationId,
    });

    const fileIds = fileConvertIds.map((f) => f.key || f);
    addActiveItems(fileIds, folderIds);

    const shareKey = this.publicRoomStore.publicRoomKey;

    try {
      await downloadFiles(fileConvertIds, folderIds, shareKey).then(
        async (res) => {
          const data = res[0] ? res[0] : null;
          const pbData = {
            operation: operationName,
            label,
            operationId,
          };

          const item =
            data?.finished && data?.url
              ? data
              : await this.uploadDataStore.loopFilesOperations(
                  data,
                  pbData,
                  true,
                );

          clearActiveOperations(fileIds, folderIds);
          setDownloadItems([]);

          if (item.url) {
            openUrl(item.url, UrlActionType.Download, true);
          }

          setSecondaryProgressBarData({
            operation: operationName,
            alert: !item.url,
            completed: true,
            operationId,
          });

          // setTimeout(
          //   () => clearSecondaryProgressData(operationId, "download"),
          //   TIMEOUT,
          // );
          !item.url && toastr.error(translations.error, null, 0, true);
        },
      );
    } catch (err) {
      clearActiveOperations(fileIds, folderIds);

      setSecondaryProgressBarData({
        operation: operationName,
        alert: true,
        completed: true,
        operationId,
      });
      const error = err.error;

      // setTimeout(
      //   () => clearSecondaryProgressData(operationId, "download"),
      //   TIMEOUT,
      // );

      if (error?.includes("password")) {
        const filesIds = error.match(/\d+/g)?.map(Number) ?? [
          fileConvertIds[0].key,
        ];

        const passwordArray = [];

        downloadItems.forEach((item) => {
          filesIds.forEach((id) => {
            if (item.id === id) {
              passwordArray.push(item);
            }
          });
        });

        toastr.error(passwordError);
        setSortedPasswordFiles({ other: [...passwordArray] });
        setDownloadDialogVisible(true);
        return;
      }

      return toastr.error(err);
    }
  };

  downloadAction = (label, item) => {
    const { bufferSelection } = this.filesStore;
    const { openUrl } = this.settingsStore;
    const { id, isFolder } = this.selectedFolderStore;

    const downloadAsArchive = id === item?.id && isFolder === item?.isFolder;

    const selection = item
      ? [item]
      : this.filesStore.selection.length
        ? this.filesStore.selection
        : bufferSelection
          ? [bufferSelection]
          : null;

    if (!selection.length) return;

    const fileIds = [];
    const folderIds = [];
    const items = [];

    if (selection.length === 1 && selection[0].fileExst && !downloadAsArchive) {
      openUrl(selection[0].viewUrl, UrlActionType.Download);
      return Promise.resolve();
    }

    selection.forEach((elem) => {
      if (!elem.fileExst && elem.isFolder) {
        folderIds.push(elem.id);
        items.push({ id: elem.id });
      } else {
        fileIds.push(elem.id);
        items.push({ id: elem.id, fileExst: elem.fileExst });
      }
    });

    this.setGroupMenuBlocked(true);
    return this.downloadFiles(fileIds, folderIds, label).finally(() =>
      this.setGroupMenuBlocked(false),
    );
  };

  completeAction = async (selectedItem, type) => {
    switch (type) {
      case FileAction.Rename:
        this.onSelectItem(
          {
            id: selectedItem.id,
            isFolder: selectedItem.isFolder,
          },
          false,
          false,
        );
        break;
      default:
        break;
    }
  };

  onSelectItem = (
    { id, isFolder },
    withSelect = true,
    isContextItem = true,
    isSingleMenu = false,
  ) => {
    const {
      setBufferSelection,
      setSelected,
      selection,
      setSelection,
      setHotkeyCaretStart,
      setHotkeyCaret,
      setEnabledHotkeys,
      filesList,
    } = this.filesStore;

    if (!id) return;

    const item = filesList.find(
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

  deleteItemAction = async (
    itemId,
    translations,
    isFile,
    isThirdParty,
    isRoom,
  ) => {
    const { secondaryProgressDataStore } = this.uploadDataStore;
    const { setSecondaryProgressBarData } = secondaryProgressDataStore;
    if (
      this.filesSettingsStore.confirmDelete ||
      this.treeFoldersStore.isPrivacyFolder ||
      isThirdParty ||
      isRoom
    ) {
      this.dialogsStore.setIsRoomDelete(isRoom);
      this.dialogsStore.setDeleteDialogVisible(true);
    } else {
      const operationId = uniqueid("operation_");
      const operationName = OPERATIONS_NAME.trash;

      setSecondaryProgressBarData({
        operation: operationName,
        percent: 0,
        operationId,
      });

      // const id = Array.isArray(itemId) ? itemId : [itemId];

      try {
        await this.deleteItemOperation(
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
        });
        // setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
        return toastr.error(err.message ? err.message : err);
      } finally {
        setSecondaryProgressBarData({
          operation: operationName,
          completed: true,
          alert: false,
          operationId,
        });

        // setTimeout(
        //   () => clearActiveOperations(isFile && id, !isFile && id),
        //   TIMEOUT,
        // );
      }
    }
  };

  deleteItemOperation = (
    isFile,
    itemId,
    translations,
    isRoom,
    operationId,
    operation,
  ) => {
    const { addActiveItems, getIsEmptyTrash } = this.filesStore;
    const { isRecycleBinFolder, recycleBinFolderId } = this.treeFoldersStore;

    const destFolderId = isRecycleBinFolder ? null : recycleBinFolderId;

    if (isFile) {
      addActiveItems([itemId], null, destFolderId);
      return deleteFile(itemId).then(async (res) => {
        if (res[0]?.error) return Promise.reject(res[0].error);
        const data = res[0] ? res[0] : null;

        await this.uploadDataStore.loopFilesOperations(data, operation);

        this.updateFilesAfterDelete(operationId, operation);
        this.filesStore.removeFiles(
          [itemId],
          null,
          () => toastr.success(translations.successRemoveFile),
          destFolderId,
        );
      });
    }
    if (isRoom) {
      const items = Array.isArray(itemId) ? itemId : [itemId];
      addActiveItems(null, items);

      this.setGroupMenuBlocked(true);
      return removeFiles(items, [], false, true)
        .then(async (res) => {
          if (res[0]?.error) return Promise.reject(res[0].error);
          const data = res[0] ? res[0] : null;
          await this.uploadDataStore.loopFilesOperations(data, {
            operation,
            operationId,
          });
          this.updateCurrentFolder(
            null,
            [itemId],
            null,
            operationId,
            operation,
          );
        })
        .then(() =>
          toastr.success(
            items.length > 1
              ? translations?.successRemoveRooms
              : translations?.successRemoveRoom,
          ),
        )
        .finally(() => {
          this.setGroupMenuBlocked(false);
        });
    }

    addActiveItems(null, [itemId], destFolderId);
    return deleteFolder(itemId).then(async (res) => {
      if (res[0]?.error) return Promise.reject(res[0].error);
      const data = res[0] ? res[0] : null;
      await this.uploadDataStore.loopFilesOperations(data, operation);

      this.updateFilesAfterDelete(operationId, operation);
      this.filesStore.removeFiles(
        null,
        [itemId],
        () => toastr.success(translations.successRemoveFolder),
        destFolderId,
      );

      getIsEmptyTrash();
    });
  };

  lockFileAction = async (id, locked) => {
    const { setFile } = this.filesStore;
    try {
      const res = await lockFile(id, locked);
      setFile(res);
    } catch (err) {
      toastr.error(err);
    }
  };

  finalizeVersionAction = async (id) => {
    let timer = null;
    const { setFile } = this.filesStore;
    try {
      timer = setTimeout(() => {
        this.filesStore.setActiveFiles([id]);
      }, 200);
      await finalizeVersion(id, 0, false).then((res) => {
        if (res && res[0]) {
          setFile(res[0]);
          this.filesStore.setActiveFiles([]);
        }
      });
    } catch (err) {
      toastr.error(err);
    } finally {
      clearTimeout(timer);
    }
  };

  duplicateAction = async (item) => {
    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;
    const { clearActiveOperations } = this.uploadDataStore;

    this.setSelectedItems();

    const folderIds = [];
    const fileIds = [];
    item.fileExst ? fileIds.push(item.id) : folderIds.push(item.id);

    const operationId = uniqueid("operation_");

    const operationName = OPERATIONS_NAME.duplicate;

    setSecondaryProgressBarData({
      operation: operationName,
      percent: 0,
      operationId,
      itemsCount: 1,
      title: item.title,
    });

    this.filesStore.addActiveItems(fileIds, folderIds);

    return duplicate(folderIds, fileIds)
      .then(async (res) => {
        const lastResult = res && res[res.length - 1];

        if (lastResult?.error) return Promise.reject(lastResult.error);

        const pbData = { operation: operationName, operationId };
        const data = lastResult || null;

        const operationData = await this.uploadDataStore.loopFilesOperations(
          data,
          pbData,
        );

        if (!operationData || operationData.error || !operationData.finished) {
          return Promise.reject(
            operationData?.error ? operationData.error : "",
          );
        }

        setSecondaryProgressBarData({
          operation: operationName,
          operationId,
          completed: true,
        });

        // Wait for animation to complete before clearing
        //  return setTimeout(() => clearSecondaryProgressData(operationId, operationName), 5000); // Match ANIMATION_DELAY from FloatingButton
      })
      .catch((err) => {
        clearActiveOperations(fileIds, folderIds);

        setSecondaryProgressBarData({
          operation: operationName,
          operationId,
          alert: true,
          completed: true,
        });

        // setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
        return toastr.error(
          err.error ? err.error : err.message ? err.message : err,
        );
      })
      .finally(() => {
        clearActiveOperations(fileIds, folderIds);
        this.setGroupMenuBlocked(false);
      });
  };

  getFilesInfo = (items) => {
    const requests = [];
    let i = items.length;
    while (i !== 0) {
      requests.push(this.filesStore.getFileInfo(items[i - 1]));
      i--;
    }
    return Promise.all(requests);
  };

  setFavoriteAction = (action, id) => {
    const { fetchFavoritesFolder, setSelected } = this.filesStore;

    const items = Array.isArray(id) ? id : [id];

    switch (action) {
      case "mark":
        return api.files
          .markAsFavorite(items)
          .then(() => {
            return this.getFilesInfo(items);
          })
          .then(() => setSelected("close"));

      case "remove":
        return api.files
          .removeFromFavorite(items)
          .then(() => {
            return this.treeFoldersStore.isFavoritesFolder
              ? fetchFavoritesFolder(this.selectedFolderStore.id)
              : this.getFilesInfo(items);
          })
          .then(() => setSelected("close"));
      default:
    }
  };

  setPinAction = async (action, id, t) => {
    const items = Array.isArray(id) ? id : [id];

    const actions = [];
    const operationId = uniqueid("operation_");
    const withFinishedOperation = [];
    let isError = false;

    const updatingFolderList = (elems, isPin = false) => {
      if (elems.length === 0) return;

      this.updateCurrentFolder(null, elems, true, operationId);

      const itemCount = { count: elems.length };

      const translationForOneItem = isPin ? t("RoomPinned") : t("RoomUnpinned");
      const translationForSeverals = isPin
        ? t("RoomsPinned", { ...itemCount })
        : t("RoomsUnpinned", { ...itemCount });

      toastr.success(
        elems.length > 1 ? translationForSeverals : translationForOneItem,
      );
    };

    const isPin = action === "pin";

    items.forEach((item) => {
      actions.push(isPin ? api.rooms.pinRoom(item) : api.rooms.unpinRoom(item));
    });

    if (isPin) {
      const result = await Promise.allSettled(actions);

      if (!result) return;

      result.forEach((res) => {
        if (res.value) {
          withFinishedOperation.push(res.value);
        }
        if (!res.value) isError = true;
      });

      updatingFolderList(withFinishedOperation, isPin);

      isError && toastr.error(t("RoomsPinLimitMessage"));

      return;
    }

    if (action === "unpin") {
      const result = await Promise.allSettled(actions);
      if (!result) return;

      result.forEach((r) => {
        if (r.value) {
          withFinishedOperation.push(r.value);
        }
        if (!r.value) toastr.error(r.reason.response?.data?.error);
      });

      updatingFolderList(withFinishedOperation, isPin);
    }
  };

  setMuteAction = (action, item, t) => {
    const { id, new: newCount, rootFolderId } = item;
    const { treeFolders } = this.treeFoldersStore;
    const { folders, updateRoomMute } = this.filesStore;

    const muteStatus = action === "mute";

    const folderIndex = id && folders.findIndex((x) => x.id == id);
    if (folderIndex) updateRoomMute(folderIndex, muteStatus);

    const treeIndex = treeFolders.findIndex((x) => x.id == rootFolderId);
    const count = treeFolders[treeIndex].newItems;
    if (treeIndex) {
      if (muteStatus) {
        treeFolders[treeIndex].newItems = newCount >= 0 ? count - newCount : 0;
      } else treeFolders[treeIndex].newItems = count + newCount;
    }

    const operationId = uniqueid("operation_");

    muteRoomNotification(id, muteStatus)
      .then(() =>
        toastr.success(
          muteStatus
            ? t("RoomNotificationsDisabled")
            : t("RoomNotificationsEnabled"),
        ),
      )
      .catch((e) => toastr.error(e))
      .finally(() => {
        Promise.all([
          this.updateCurrentFolder(null, [id], null, operationId),
          this.treeFoldersStore.fetchTreeFolders(),
        ]);
      });
  };

  setArchiveAction = async (action, folders, t) => {
    const { addActiveItems, setSelected } = this.filesStore;

    const { isRoomsFolder, archiveRoomsId, myRoomsId } = this.treeFoldersStore;

    const { secondaryProgressDataStore, clearActiveOperations } =
      this.uploadDataStore;

    const { setSecondaryProgressBarData } = secondaryProgressDataStore;

    if (!myRoomsId || !archiveRoomsId) {
      console.error("Default categories not found");
      return;
    }

    const operationId = uniqueid("operation_");

    const items = Array.isArray(folders)
      ? folders.map((x) => (x?.id ? x.id : x))
      : [folders.id];

    const operation = OPERATIONS_NAME.move;

    setSecondaryProgressBarData({
      operation,
      percent: 0,
      operationId,
    });

    const destFolder = action === "archive" ? archiveRoomsId : myRoomsId;

    addActiveItems(null, items, destFolder);

    switch (action) {
      case "archive":
        this.setGroupMenuBlocked(true);
        return moveToFolder(archiveRoomsId, items)
          .then(async (res) => {
            const lastResult = res && res[res.length - 1];

            if (lastResult?.error) return Promise.reject(lastResult.error);

            const data = lastResult || null;

            const operationData =
              await this.uploadDataStore.loopFilesOperations(
                data,
                operationId,
                operation,
              );

            if (
              !operationData ||
              operationData.error ||
              !operationData.finished
            ) {
              return Promise.reject(
                operationData?.error ? operationData.error : "",
              );
            }

            if (!isRoomsFolder) {
              // setSelectedFolder(roomsFolder);
              window.DocSpace.navigate("/");
            }

            this.dialogsStore.setIsFolderActions(false);

            setSecondaryProgressBarData({
              completed: true,
              operation,
              operationId,
            });

            // return setTimeout(
            //   () => clearSecondaryProgressData(operationId),
            //   TIMEOUT,
            // );
          })

          .then(() => {
            const successTranslation =
              folders.length !== 1 && Array.isArray(folders)
                ? t("ArchivedRoomsAction")
                : Array.isArray(folders)
                  ? t("Common:ArchivedRoomAction", { name: folders[0].title })
                  : t("Common:ArchivedRoomAction", { name: folders.title });

            toastr.success(successTranslation);
          })
          .then(() => {
            const clearBuffer =
              !this.dialogsStore.archiveDialogVisible &&
              !this.dialogsStore.restoreRoomDialogVisible;
            setSelected("close", clearBuffer);
          })
          .catch((err) => {
            clearActiveOperations(null, items);

            setSecondaryProgressBarData({
              completed: true,
              alert: true,
              operation,
              operationId,
            });
            // setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
            return toastr.error(err.message ? err.message : err);
          })
          .finally(() => {
            clearActiveOperations(null, items);
            this.setGroupMenuBlocked(false);
          });
      case "unarchive":
        this.setGroupMenuBlocked(true);
        return moveToFolder(myRoomsId, items)
          .then(async (res) => {
            const lastResult = res && res[res.length - 1];

            if (lastResult?.error) return Promise.reject(lastResult.error);

            const pbData = {
              icon: "move",
              label: "Restore rooms from archive operation",
              operationId,
            };
            const data = lastResult || null;

            console.log(pbData.label, { data, res });

            await this.uploadDataStore.loopFilesOperations(data, pbData);

            this.dialogsStore.setIsFolderActions(false);

            setSecondaryProgressBarData({
              completed: true,
              operation,
              operationId,
            });

            // return setTimeout(
            //   () => clearSecondaryProgressData(operationId),
            //   TIMEOUT,
            // );
          })

          .then(() => {
            const successTranslation =
              folders.length !== 1 && Array.isArray(folders)
                ? t("UnarchivedRoomsAction")
                : Array.isArray(folders)
                  ? t("UnarchivedRoomAction", { name: folders[0].title })
                  : t("UnarchivedRoomAction", { name: folders.title });

            toastr.success(successTranslation);
          })
          .then(() => setSelected("close"))
          .then(() => this.moveToRoomsPage())
          .catch((err) => {
            clearActiveOperations(null, items);
            setSecondaryProgressBarData({
              completed: true,
              alert: true,
              operation,
              operationId,
            });
            // setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
            return toastr.error(err.message ? err.message : err);
          })
          .finally(() => {
            clearActiveOperations(null, items);
            this.setGroupMenuBlocked(false);
          });
      default:
    }
  };

  selectTag = (tag) => {
    const { roomsFilter } = this.filesStore;

    const { setIsSectionBodyLoading } = this.clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionBodyLoading(param);
    };

    const newFilter = roomsFilter.clone();

    if (tag.label !== "no-tag") {
      const tags = newFilter.tags ? [...newFilter.tags] : [];

      if (tags.length > 0) {
        const idx = tags.findIndex((item) => item === tag.label);

        if (idx > -1) {
          // TODO: remove tag here if already selected
          return;
        }
      }

      if (tag.roomType) {
        if (!!newFilter.type && +newFilter.type === tag.roomType) return;
        newFilter.type = tag.roomType;
      } else if (tag.providerType) {
        if (!!newFilter.provider && +newFilter.provider === tag.providerType)
          return;
        newFilter.provider = tag.providerType;
      } else {
        tags.push(tag.label);
        newFilter.tags = [...tags];
      }

      newFilter.withoutTags = false;
    } else {
      newFilter.withoutTags = true;
    }
    setIsLoading(true);
    window.DocSpace.navigate(
      `${window.DocSpace.location.pathname}?${newFilter.toUrlParams(this.userStore?.user?.id)}`,
    );
  };

  selectOption = ({ option, value }) => {
    const { roomsFilter } = this.filesStore;

    const { setIsSectionBodyLoading } = this.clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionBodyLoading(param);
    };

    const newFilter = roomsFilter.clone();
    const tags = newFilter.tags ? [...newFilter.tags] : [];
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

  selectRowAction = (checked, file) => {
    const {
      // selected,
      // setSelected,
      selectFile,
      deselectFile,
      setBufferSelection,
      setHotkeyCaret,
      setHotkeyCaretStart,
    } = this.filesStore;
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

  openLocationAction = async (item) => {
    if (this.publicRoomStore.isPublicRoom)
      return this.moveToPublicRoom(item.id);

    const { id, isRoom, title, rootFolderType } = item;
    const categoryType = getCategoryTypeByFolderType(rootFolderType, id);

    const state = { title, rootFolderType, isRoot: false, isRoom };
    const filter = FilesFilter.getDefault();

    filter.folder = id;
    const shareKey = await this.getPublicKey(item);
    if (shareKey) filter.key = shareKey;

    if (isRoom) {
      const key =
        categoryType === CategoryType.Archive
          ? `UserFilterArchiveRoom=${this.userStore.user?.id}`
          : `UserFilterSharedRoom=${this.userStore.user?.id}`;

      const filterStorageSharedRoom =
        this.userStore.user?.id && localStorage.getItem(key);

      if (filterStorageSharedRoom) {
        const splitFilter = filterStorageSharedRoom.split(",");

        filter.sortBy = splitFilter[0];
        filter.sortOrder = splitFilter[1];
      }
    }

    const url = getCategoryUrl(categoryType, id);

    window.DocSpace.navigate(`${url}?${filter.toUrlParams()}`, { state });
  };

  nameWithoutExtension = (title) => {
    const indexPoint = title.lastIndexOf(".");
    const splitTitle = title.split(".");
    const splitTitleLength = splitTitle.length;

    const titleWithoutExtension =
      splitTitleLength <= 2 ? splitTitle[0] : title.slice(0, indexPoint);

    return titleWithoutExtension;
  };

  checkAndOpenLocationAction = async (item) => {
    const { myRoomsId, myFolderId, archiveRoomsId, recycleBinFolderId } =
      this.treeFoldersStore;
    const { setIsSectionBodyLoading } = this.clientLoadingStore;
    const { rootFolderType } = this.selectedFolderStore;

    const setIsLoading = (param) => {
      setIsSectionBodyLoading(param);
    };

    const { title, fileExst, id, rootFolderType: rootFolderTypeItem } = item;
    const parentId =
      item.parentId || item.toFolderId || item.folderId || recycleBinFolderId;
    const parentTitle = item.parentTitle || item.toFolderTitle;

    const isRoot = [
      myRoomsId,
      myFolderId,
      archiveRoomsId,
      recycleBinFolderId,
    ].includes(parentId);

    const state = {
      title: parentTitle,
      isRoot,
      fileExst,
      highlightFileId: item.id,
      isFileHasExst: !item.fileExst,
      rootFolderType,
    };

    const url = getCategoryUrl(
      getCategoryTypeByFolderType(rootFolderTypeItem ?? rootFolderType, id),
      id,
    );

    const newFilter = FilesFilter.getDefault();

    newFilter.search = title;
    newFilter.folder = parentId;

    setIsLoading(
      window.DocSpace.location.search !== `?${newFilter.toUrlParams()}` ||
        url !== window.DocSpace.location.pathname,
    );

    if (!isDesktop()) this.infoPanelStore.setIsVisible(false);

    window.DocSpace.navigate(`${url}?${newFilter.toUrlParams()}`, { state });
  };

  setThirdpartyInfo = (providerKey) => {
    const { setConnectDialogVisible, setConnectItem } = this.dialogsStore;
    const { providers, capabilities } = this.filesSettingsStore.thirdPartyStore;
    const provider = providers.find((x) => x.provider_key === providerKey);
    const capabilityItem = capabilities.find((x) => x[0] === providerKey);
    const capability = {
      title: capabilityItem ? capabilityItem[0] : provider.customer_title,
      link: capabilityItem ? capabilityItem[1] : " ",
    };

    setConnectDialogVisible(true);
    setConnectItem({ ...provider, ...capability });
  };

  // setNewBadgeCount = (item) => {
  //   const { getRootFolder, updateRootBadge } = this.treeFoldersStore;
  //   const { updateFileBadge, updateFolderBadge } = this.filesStore;
  //   const { rootFolderType, fileExst, id } = item;

  //   const count = item.new ? item.new : 1;
  //   const rootFolder = getRootFolder(rootFolderType);
  //   updateRootBadge(rootFolder.id, count);

  //   if (fileExst) updateFileBadge(id);
  //   else updateFolderBadge(id, item.new);
  // };

  markAsRead = (folderIds, fileIds, item) => {
    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;

    const operationId = uniqueid("operation_");
    const pbData = { operation: OPERATIONS_NAME.markAsRead, operationId };

    setSecondaryProgressBarData({
      percent: 0,
      ...pbData,
    });

    return markAsRead(folderIds, fileIds)
      .then(async (res) => {
        const data = res[0] ? res[0] : null;

        await this.uploadDataStore.loopFilesOperations(data, pbData);
      })
      .then(() => {
        if (!item) return;

        // this.setNewBadgeCount(item);

        const { getFileIndex, updateFileStatus } = this.filesStore;

        const index = getFileIndex(item.id);
        updateFileStatus(index, item.fileStatus & ~FileStatus.IsNew);
      })
      .catch((err) => toastr.error(err))
      .finally(
        () =>
          setSecondaryProgressBarData({
            operation: OPERATIONS_NAME.markAsRead,
            completed: true,
            operationId,
          }),
        // setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT),
      );
  };

  moveDragItems = (destFolderId, folderTitle, translations) => {
    const folderIds = [];
    const fileIds = [];
    const deleteAfter = false;

    const { bufferSelection } = this.filesStore;
    const { isRootFolder } = this.selectedFolderStore;

    let selection = bufferSelection
      ? [bufferSelection]
      : this.filesStore.selection;

    selection = selection.filter(
      (el) => !el.isFolder || el.id !== destFolderId,
    );

    const isCopy = selection.findIndex((f) => f.security.Move) === -1;

    const operationData = {
      destFolderId,
      folderIds,
      fileIds,
      deleteAfter,
      translations,
      folderTitle,
      isCopy,
      itemsCount: selection.length,
      ...(selection.length === 1 && { title: selection[0].title }),
    };

    selection.forEach((item) => {
      if (!item.isFolder) {
        fileIds.push(item.id);
      } else if (!item.providerKey || !isRootFolder) {
        folderIds.push(item.id);
      }
    });

    if (!folderIds.length && !fileIds.length) return;
    this.checkOperationConflict(operationData);
  };

  checkFileConflicts = (destFolderId, folderIds, fileIds) => {
    this.filesStore.addActiveItems(fileIds, null, destFolderId);
    this.filesStore.addActiveItems(null, folderIds, destFolderId);
    return checkFileConflicts(destFolderId, folderIds, fileIds);
  };

  setConflictDialogData = (conflicts, operationData) => {
    this.dialogsStore.setConflictResolveDialogItems(conflicts);
    this.dialogsStore.setConflictResolveDialogData(operationData);
    this.dialogsStore.setConflictResolveDialogVisible(true);
  };

  setSelectedItems = (title, length) => {
    const selectionLength = length || this.filesStore.selection.length;
    const selectionTitle = title || this.filesStore.selectionTitle;

    if (selectionLength !== undefined && selectionTitle) {
      this.uploadDataStore.secondaryProgressDataStore.setItemsSelectionLength(
        selectionLength,
      );
      this.uploadDataStore.secondaryProgressDataStore.setItemsSelectionTitle(
        selectionTitle,
      );
    }
  };

  checkOperationConflict = async (operationData) => {
    const { destFolderId, folderIds, fileIds } = operationData;
    const { setBufferSelection } = this.filesStore;

    this.setSelectedItems();

    this.filesStore.setSelected("none");
    let conflicts;

    try {
      conflicts = await this.checkFileConflicts(
        destFolderId,
        folderIds,
        fileIds,
      );
    } catch (err) {
      setBufferSelection(null);
      return toastr.error(err.message ? err.message : err);
    }

    if (conflicts.length) {
      this.setConflictDialogData(conflicts, operationData);
    } else {
      try {
        await this.uploadDataStore.itemOperationToFolder(operationData);
      } catch (err) {
        setBufferSelection(null);
        return toastr.error(err.message ? err.message : err);
      }
    }
  };

  isAvailableOption = (option) => {
    const {
      canConvertSelected,
      hasSelection,
      allFilesIsEditing,
      selection,
      hasRoomsToResetQuota,
      hasRoomsToDisableQuota,
      hasRoomsToChangeQuota,
    } = this.filesStore;

    const { rootFolderType } = this.selectedFolderStore;
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

        return canArchive;
      }
      case "unarchive": {
        const canUnArchive = selection.some((s) => s.security?.Move);

        return canUnArchive;
      }
      case "delete-room": {
        const canRemove = selection.some((s) => s.security?.Delete);

        return canRemove;
      }
      case "delete": {
        const canDelete = selection.every((s) => s.security?.Delete);

        return !allFilesIsEditing && canDelete && hasSelection;
      }
      case "create-room": {
        const canCreateRoom = selection.some((s) => s.security?.CreateRoomFrom);
        return canCreateRoom;
      }
      case "change-quota":
        return hasRoomsToChangeQuota;
      case "disable-quota":
        return hasRoomsToDisableQuota;
      case "default-quota":
        return hasRoomsToResetQuota;
      default:
        return false;
    }
  };

  convertToArray = (itemsCollection) => {
    const result = Array.from(itemsCollection.values()).filter((item) => {
      return item != null;
    });

    itemsCollection.clear();

    return result;
  };

  pinRooms = (t) => {
    const { selection } = this.filesStore;

    const items = [];

    selection.forEach((item) => {
      if (!item.pinned) items.push(item.id);
    });

    this.setPinAction("pin", items, t);
  };

  unpinRooms = (t) => {
    const { selection } = this.filesStore;

    const items = [];

    selection.forEach((item) => {
      if (item.pinned) items.push(item.id);
    });

    this.setPinAction("unpin", items, t);
  };

  archiveRooms = (action) => {
    const {
      setArchiveDialogVisible,
      setQuotaWarningDialogVisible,
      setRestoreRoomDialogVisible,
    } = this.dialogsStore;

    const { isWarningRoomsDialog } = this.currentQuotaStore;

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

  deleteRooms = (t) => {
    const { selection } = this.filesStore;

    const items = [];

    selection.forEach((item) => {
      items.push(item.id);
    });

    const translations = {
      deleteOperation: t("Translations:DeleteOperation"),
      successRemoveFile: t("Files:FileRemoved"),
      successRemoveFolder: t("Files:FolderRemoved"),
      successRemoveRoom: t("Files:RoomRemoved"),
      successRemoveRooms: t("Files:RoomsRemoved"),
    };

    this.deleteItemAction(items, translations, null, null, true);
  };

  deleteRoomsAction = async (itemId, translations) => {
    const { secondaryProgressDataStore, clearActiveOperations } =
      this.uploadDataStore;

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
      this.setGroupMenuBlocked(true);
      await this.deleteItemOperation(
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
      //  setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
      return toastr.error(err.message ? err.message : err);
    } finally {
      this.setGroupMenuBlocked(false);
      setTimeout(() => clearActiveOperations(null, id), TIMEOUT);
    }
  };

  onShowInfoPanel = () => {
    const { selection } = this.filesStore;
    const { setInfoPanelSelection, setIsVisible } = this.infoPanelStore;

    setInfoPanelSelection([selection]);
    setIsVisible(true);
  };

  setProcessCreatingRoomFromData = (processCreatingRoomFromData) => {
    this.processCreatingRoomFromData = processCreatingRoomFromData;
  };

  onClickCreateRoom = (item) => {
    this.setProcessCreatingRoomFromData(true);
    const event = new Event(Events.ROOM_CREATE);
    if (item && item.isFolder) {
      event.title = item.title;
    }
    window.dispatchEvent(event);
  };

  changeRoomQuota = (items, successCallback, abortCallback) => {
    const event = new Event(Events.CHANGE_QUOTA);

    const itemsIDs = items.map((item) => {
      return item?.id ? item.id : item;
    });

    const payload = {
      visible: true,
      type: "room",
      ids: itemsIDs,
      successCallback,
      abortCallback,
    };

    event.payload = payload;

    window.dispatchEvent(event);
  };

  disableRoomQuota = async (items, t) => {
    const { setCustomRoomQuota } = this.filesStore;

    const userIDs = items.map((item) => {
      return item?.id ? item.id : item;
    });

    try {
      await setCustomRoomQuota(-1, userIDs);
      toastr.success(t("Common:StorageQuotaDisabled"));
    } catch (e) {
      toastr.error(e);
    }
  };

  resetRoomQuota = async (items, t) => {
    const { resetRoomQuota } = this.filesStore;

    const userIDs = items.map((item) => {
      return item?.id ? item.id : item;
    });

    try {
      await resetRoomQuota(userIDs);
      toastr.success(t("Common:StorageQuotaReset"));
    } catch (e) {
      toastr.error(e);
    }
  };

  getOption = (option, t) => {
    const {
      // setSharingPanelVisible,
      setDownloadDialogVisible,
      setMoveToPanelVisible,
      setCopyPanelVisible,
      setDeleteDialogVisible,
    } = this.dialogsStore;
    const { selection } = this.filesStore;
    const { showStorageInfo } = this.currentQuotaStore;

    switch (option) {
      case "show-info":
        if (isDesktop()) return null;
        return {
          id: "menu-show-info",
          key: "show-info",
          label: t("Common:Info"),
          iconUrl: InfoOutlineReactSvgUrl,
          onClick: this.onShowInfoPanel,
        };
      case "copy":
        if (!this.isAvailableOption("copy")) return null;
        return {
          id: "menu-copy",
          label: t("Common:Copy"),
          onClick: () => setCopyPanelVisible(true),
          iconUrl: CopyToReactSvgUrl,
        };

      case "create-room":
        if (!this.isAvailableOption("create-room")) return null;
        return {
          id: "menu-create-room",
          label: t("Files:CreateRoom"),
          onClick: this.onClickCreateRoom,
          iconUrl: CatalogRoomsReactSvgUrl,
        };

      case "download":
        if (!this.isAvailableOption("download")) return null;
        return {
          id: "menu-download",
          label: t("Common:Download"),
          onClick: () =>
            this.downloadAction(t("Translations:ArchivingData")).catch((err) =>
              toastr.error(err),
            ),
          iconUrl: DownloadReactSvgUrl,
        };

      case "downloadAs":
        if (!this.isAvailableOption("downloadAs")) return null;
        return {
          id: "menu-download-as",
          label: t("Translations:DownloadAs"),
          onClick: () => setDownloadDialogVisible(true),
          iconUrl: DownloadAsReactSvgUrl,
        };

      case "moveTo":
        if (!this.isAvailableOption("moveTo")) return null;
        return {
          id: "menu-move-to",
          label: t("Common:MoveTo"),
          onClick: () => setMoveToPanelVisible(true),
          iconUrl: MoveReactSvgUrl,
        };
      case "pin":
        return {
          id: "menu-pin",
          key: "pin",
          label: t("Pin"),
          iconUrl: PinReactSvgUrl,
          onClick: () => this.pinRooms(t),
          disabled: false,
        };
      case "unpin":
        return {
          id: "menu-unpin",
          key: "unpin",
          label: t("Unpin"),
          iconUrl: UnpinReactSvgUrl,
          onClick: () => this.unpinRooms(t),
          disabled: false,
        };
      case "archive":
        if (!this.isAvailableOption("archive")) return null;
        return {
          id: "menu-archive",
          key: "archive",
          label: t("MoveToArchive"),
          iconUrl: RoomArchiveSvgUrl,
          onClick: () => this.archiveRooms("archive"),
          disabled: false,
        };
      case "unarchive":
        if (!this.isAvailableOption("unarchive")) return null;
        return {
          id: "menu-unarchive",
          key: "unarchive",
          label: t("Common:Restore"),
          iconUrl: MoveReactSvgUrl,
          onClick: () => this.archiveRooms("unarchive"),
          disabled: false,
        };
      case "change-quota":
        if (!this.isAvailableOption("change-quota")) return null;
        return {
          id: "menu-change-quota",
          key: "change-quota",
          label: t("Common:ChangeQuota"),
          iconUrl: ChangQuotaReactSvgUrl,
          onClick: () => this.changeRoomQuota(selection),
          disabled: !showStorageInfo,
        };
      case "default-quota":
        if (!this.isAvailableOption("default-quota")) return null;
        return {
          id: "menu-default-quota",
          key: "default-quota",
          label: t("Common:SetToDefault"),
          iconUrl: DefaultQuotaReactSvgUrl,
          onClick: () => this.resetRoomQuota(selection, t),
          disabled: !showStorageInfo,
        };
      case "disable-quota":
        if (!this.isAvailableOption("disable-quota")) return null;
        return {
          id: "menu-disable-quota",
          key: "disable-quota",
          label: t("Common:DisableQuota"),
          iconUrl: DisableQuotaReactSvgUrl,
          onClick: () => this.disableRoomQuota(selection, t),
          disabled: !showStorageInfo,
        };

      case "delete-room":
        if (!this.isAvailableOption("delete-room")) return null;
        return {
          id: "menu-delete-room",
          label: t("Common:Delete"),
          onClick: () => this.deleteRooms(t),
          iconUrl: DeleteReactSvgUrl,
        };

      case "delete":
        if (!this.isAvailableOption("delete")) return null;
        return {
          id: "menu-delete",
          label: t("Common:Delete"),
          onClick: () => {
            if (this.filesSettingsStore.confirmDelete) {
              setDeleteDialogVisible(true);
            } else {
              const translations = {
                deleteOperation: t("Translations:DeleteOperation"),
                deleteFromTrash: t("Translations:DeleteFromTrash"),
                deleteSelectedElem: t("Translations:DeleteSelectedElem"),
                FileRemoved: t("Files:FileRemoved"),
                FolderRemoved: t("Files:FolderRemoved"),
              };

              this.deleteAction(translations).catch((err) => toastr.error(err));
            }
          },
          iconUrl: DeleteReactSvgUrl,
        };
      case "remove-from-recent":
        return {
          id: "menu-remove-from-recent",
          label: t("RemoveFromList"),
          onClick: () => this.onClickRemoveFromRecent(selection),
          iconUrl: RemoveOutlineSvgUrl,
        };
      default:
        break;
    }
  };

  getRoomsFolderOptions = (itemsCollection, t) => {
    let pinName = "unpin";
    const { selection } = this.filesStore;

    selection.forEach((item) => {
      if (!item.pinned) pinName = "pin";
    });

    const pin = this.getOption(pinName, t);
    const archive = this.getOption("archive", t);
    const changeQuota = this.getOption("change-quota", t);
    const disableQuota = this.getOption("disable-quota", t);
    const defaultQuota = this.getOption("default-quota", t);

    itemsCollection
      .set(pinName, pin)
      .set("archive", archive)
      .set("change-quota", changeQuota)
      .set("default-quota", defaultQuota)
      .set("disable-quota", disableQuota);
    return this.convertToArray(itemsCollection);
  };

  getArchiveRoomsFolderOptions = (itemsCollection, t) => {
    const archive = this.getOption("unarchive", t);
    const deleteOption = this.getOption("delete-room", t);
    const showOption = this.getOption("show-info", t);

    itemsCollection
      .set("unarchive", archive)
      .set("show-info", showOption)
      .set("delete", deleteOption);

    return this.convertToArray(itemsCollection);
  };

  getAnotherFolderOptions = (itemsCollection, t) => {
    const createRoom = this.getOption("create-room", t);
    const download = this.getOption("download", t);
    const downloadAs = this.getOption("downloadAs", t);
    const moveTo = this.getOption("moveTo", t);
    const copy = this.getOption("copy", t);
    const deleteOption = this.getOption("delete", t);
    const showInfo = this.getOption("showInfo", t);

    itemsCollection
      .set("createRoom", createRoom)
      .set("download", download)
      .set("downloadAs", downloadAs)
      .set("moveTo", moveTo)
      .set("copy", copy)
      .set("delete", deleteOption)
      .set("showInfo", showInfo);

    return this.convertToArray(itemsCollection);
  };

  getRecentFolderOptions = (itemsCollection, t) => {
    const download = this.getOption("download", t);
    const downloadAs = this.getOption("downloadAs", t);
    const copy = this.getOption("copy", t);
    const showInfo = this.getOption("showInfo", t);
    const removeFromRecent = this.getOption("remove-from-recent", t);

    itemsCollection
      .set("download", download)
      .set("downloadAs", downloadAs)
      .set("copy", copy)
      .set("showInfo", showInfo)
      .set("removeFromRecent", removeFromRecent);

    return this.convertToArray(itemsCollection);
  };

  getShareFolderOptions = (itemsCollection, t) => {
    const { setDeleteDialogVisible, setUnsubscribe } = this.dialogsStore;

    const download = this.getOption("download", t);
    const downloadAs = this.getOption("downloadAs", t);
    const copy = this.getOption("copy", t);
    const showInfo = this.getOption("showInfo", t);

    itemsCollection

      .set("download", download)
      .set("downloadAs", downloadAs)
      .set("copy", copy)
      .set("delete", {
        label: t("RemoveFromList"),
        onClick: () => {
          setUnsubscribe(true);
          setDeleteDialogVisible(true);
        },
      })
      .set("showInfo", showInfo);

    return this.convertToArray(itemsCollection);
  };

  getPrivacyFolderOption = (itemsCollection, t) => {
    const moveTo = this.getOption("moveTo", t);
    const deleteOption = this.getOption("delete", t);
    const download = this.getOption("download", t);
    const showInfo = this.getOption("showInfo", t);

    itemsCollection
      .set("download", download)
      .set("moveTo", moveTo)

      .set("delete", deleteOption)
      .set("showInfo", showInfo);

    return this.convertToArray(itemsCollection);
  };

  getFavoritesFolderOptions = (itemsCollection, t) => {
    const { selection } = this.filesStore;
    const download = this.getOption("download", t);
    const downloadAs = this.getOption("downloadAs", t);
    const copy = this.getOption("copy", t);
    const showInfo = this.getOption("showInfo", t);

    itemsCollection
      .set("download", download)
      .set("downloadAs", downloadAs)
      .set("copy", copy)
      .set("delete", {
        label: t("RemoveFromFavorites"),
        alt: t("RemoveFromFavorites"),
        iconUrl: FavoritesReactSvgUrl,
        onClick: () => {
          const items = selection.map((item) => item.id);
          this.setFavoriteAction("remove", items)
            .then(() => toastr.success(t("RemovedFromFavorites")))
            .catch((err) => toastr.error(err));
        },
      })
      .set("showInfo", showInfo);

    return this.convertToArray(itemsCollection);
  };

  getRecycleBinFolderOptions = (itemsCollection, t) => {
    const { setRestorePanelVisible } = this.dialogsStore;

    const download = this.getOption("download", t);
    const downloadAs = this.getOption("downloadAs", t);
    const deleteOption = this.getOption("delete", t);
    const showInfo = this.getOption("showInfo", t);

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

    return this.convertToArray(itemsCollection);
  };

  getHeaderMenu = (t) => {
    const {
      isFavoritesFolder,
      isRecycleBinFolder,
      isPrivacyFolder,
      isShareFolder,
      isRoomsFolder,
      isArchiveFolder,
      isRecentTab,
    } = this.treeFoldersStore;

    const itemsCollection = new Map();

    if (isRecycleBinFolder)
      return this.getRecycleBinFolderOptions(itemsCollection, t);

    if (isFavoritesFolder)
      return this.getFavoritesFolderOptions(itemsCollection, t);

    if (isPrivacyFolder) return this.getPrivacyFolderOption(itemsCollection, t);

    if (isShareFolder) return this.getShareFolderOptions(itemsCollection, t);

    if (isRecentTab) return this.getRecentFolderOptions(itemsCollection, t);

    if (isArchiveFolder)
      return this.getArchiveRoomsFolderOptions(itemsCollection, t);

    if (isRoomsFolder) return this.getRoomsFolderOptions(itemsCollection, t);

    return this.getAnotherFolderOptions(itemsCollection, t);
  };

  onMarkAsRead = (item) => this.markAsRead([], [`${item.id}`], item);

  isExpiredLinkAsync = async (item) => {
    const { clearActiveOperations } = this.uploadDataStore;
    const { addActiveItems } = this.filesStore;

    const { endLoader, startLoader } = createLoader();

    try {
      startLoader(() =>
        runInAction(() => {
          this.setGroupMenuBlocked(true);
          addActiveItems(null, [item.id]);
        }),
      );

      const response = await api.rooms.validatePublicRoomKey(item.requestToken);

      const isExpired = response.status === ValidationStatus.Expired;
      if (isExpired) {
        const foundFolder = this.filesStore.folders.find(
          (folder) => folder.id === item.id,
        );

        if (foundFolder && !foundFolder.expired) {
          foundFolder.expired = true;
        }
      }

      return isExpired;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      endLoader(() =>
        runInAction(() => {
          this.setGroupMenuBlocked(false);
          clearActiveOperations([], [item.id]);
        }),
      );
    }
  };

  openFileAction = async (item, t, e) => {
    if (
      item.external &&
      (item.expired || (await this.isExpiredLinkAsync(item)))
    )
      return toastr.error(
        t("Common:RoomLinkExpired"),
        t("Common:RoomNotAvailable"),
      );

    if (isLockedSharedRoom(item))
      return this.dialogsStore.setPasswordEntryDialog(true, item);

    this.openItemAction(item, t, e);
  };

  openItemAction = async (item, t, e) => {
    const { openDocEditor, isPrivacyFolder, setSelection, categoryType } =
      this.filesStore;
    const { currentDeviceType } = this.settingsStore;
    const { fileItemsList } = this.pluginStore;
    const { enablePlugins } = this.settingsStore;

    const { isLoading, setIsSectionBodyLoading } = this.clientLoadingStore;
    const { isRecycleBinFolder } = this.treeFoldersStore;
    const { setMediaViewerData, getUrl } = this.mediaViewerDataStore;
    const { setConvertDialogVisible, setConvertItem, setConvertDialogData } =
      this.dialogsStore;

    const { roomType, title: currentTitle } = this.selectedFolderStore;

    if (this.publicRoomStore.isPublicRoom && item.isFolder) {
      setSelection([]);
      return this.moveToPublicRoom(item.id);
    }

    const setIsLoading = (param) => {
      setIsSectionBodyLoading(param);
    };

    const isMediaOrImage =
      item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;
    const canConvert =
      item.viewAccessibility?.MustConvert && item.security?.Convert;
    const canWebEdit = item.viewAccessibility?.WebEdit;
    const canViewedDocs = item.viewAccessibility?.WebView;

    const { id, viewUrl, fileStatus, encrypted, isFolder, webUrl } = item;
    if (encrypted && isPrivacyFolder) return checkProtocol(item.id, true);

    if (isRecycleBinFolder || isLoading) return;

    if (isFolder) {
      const { isRoom, rootFolderType, title, roomType: itemRoomType } = item;

      const path = getCategoryUrl(
        getCategoryTypeByFolderType(rootFolderType, id),
        id,
      );

      const filter = FilesFilter.getDefault();

      const filterObj = FilesFilter.getFilter(window.location);

      if (isRoom) {
        const key =
          categoryType === CategoryType.Archive
            ? `UserFilterArchiveRoom=${this.userStore.user?.id}`
            : `UserFilterSharedRoom=${this.userStore.user?.id}`;

        const filterStorageSharedRoom =
          this.userStore.user?.id && localStorage.getItem(key);

        if (filterStorageSharedRoom) {
          const splitFilter = filterStorageSharedRoom.split(",");

          filter.sortBy = splitFilter[0];
          filter.sortOrder = splitFilter[1];
        }
      } else {
        // For the document section at all levels there is one sorting
        filter.sortBy = filterObj.sortBy;
        filter.sortOrder = filterObj.sortOrder;
      }

      filter.folder = id;

      const shareKey = await this.getPublicKey(item);
      if (shareKey) filter.key = shareKey;

      const url = `${path}?${filter.toUrlParams()}`;

      if (openingNewTab(url, e)) return;

      setIsLoading(true);

      const isShared =
        item.shared || item.navigationPath?.findIndex((r) => r.shared) > -1;

      const isExternal =
        item.external || item.navigationPath?.findIndex((r) => r.external) > -1;

      const state = {
        title,
        isRoot: false,
        rootFolderType,
        isRoom,
        rootRoomTitle: roomType ? currentTitle : "",
        isPublicRoomType: itemRoomType === RoomsType.PublicRoom || false,
        isShared,
        isExternal,
        canCreate: item.security?.canCreate,
        isLifetimeEnabled:
          itemRoomType === RoomsType.VirtualDataRoom && !!item?.lifetime,
      };

      setSelection([]);

      window.DocSpace.navigate(url, { state });
    } else {
      if (canConvert) {
        setConvertItem({ ...item, isOpen: true });
        setConvertDialogData({
          files: item,
        });
        setConvertDialogVisible(true);
        return;
      }

      if ((fileStatus & FileStatus.IsNew) === FileStatus.IsNew)
        this.onMarkAsRead(item);

      if (canWebEdit || canViewedDocs) {
        const shareWebUrl = new URL(webUrl);

        const shareKey = getObjectByLocation(shareWebUrl)?.share;

        const isPDF = item.fileExst === ".pdf";

        const canEditForm =
          isPDF &&
          item.isPDFForm &&
          item.security?.EditForm &&
          !item.startFilling;

        return openDocEditor(id, false, shareKey, canEditForm);
      }

      if (isMediaOrImage) {
        setMediaViewerData({ visible: true, id });

        const url = getUrl(id);

        window.history.pushState("", "", url);

        return;
      }

      if (fileItemsList && enablePlugins) {
        let currPluginItem = null;

        fileItemsList.forEach((i) => {
          if (i.key === item.fileExst) currPluginItem = i.value;
        });

        if (currPluginItem) {
          const correctDevice = currPluginItem.devices
            ? currPluginItem.devices.includes(currentDeviceType)
            : true;
          if (correctDevice) return currPluginItem.onClick(item);
        }
      }

      if (!item.security.Download) {
        toastr.error(t("Files:FileDownloadingIsRestricted"));
        return;
      }

      return window.open(viewUrl, "_self");
    }
  };

  onClickBack = (fromHotkeys = true) => {
    const { roomType } = this.selectedFolderStore;
    const { setSelectedNode } = this.treeFoldersStore;
    const { clearFiles, setBufferSelection } = this.filesStore;
    const { insideGroupBackUrl } = this.peopleStore.groupsStore;
    const { setContactsTab } = this.peopleStore.usersStore;
    const { isLoading, setIsSectionBodyLoading } = this.clientLoadingStore;
    if (isLoading) return;

    setBufferSelection(null);

    const categoryType = getCategoryType(window.DocSpace.location);

    const isRoom = !!roomType;

    const urlFilter = getObjectByLocation(window.DocSpace.location);

    const isArchivedRoom = !!(
      CategoryType.Trash !== categoryType && urlFilter?.folder
    );

    if (this.publicRoomStore.isPublicRoom) {
      return this.backToParentFolder();
    }

    if (categoryType === CategoryType.SharedRoom || isArchivedRoom) {
      if (isRoom) {
        return this.moveToRoomsPage();
      }

      return this.backToParentFolder();
    }

    if (
      categoryType === CategoryType.Shared ||
      categoryType === CategoryType.Archive
    ) {
      return this.moveToRoomsPage();
    }

    if (categoryType === CategoryType.Trash) {
      return;
    }

    if (categoryType === CategoryType.Personal) {
      return this.backToParentFolder();
    }

    if (categoryType === CategoryType.Settings) {
      clearFiles();

      const path = getCategoryUrl(CategoryType.Settings);

      setSelectedNode(["common"]);

      return window.DocSpace.navigate(path, { replace: true });
    }

    if (categoryType === CategoryType.Accounts) {
      const contactsTab = getContactsView();

      if (insideGroupBackUrl) {
        console.log("set");
        setIsSectionBodyLoading(true, false);

        setContactsTab("groups");
        window.DocSpace.navigate(insideGroupBackUrl);

        return;
      }

      const filter =
        contactsTab === "groups"
          ? GroupsFilter.getDefault()
          : UsersFilter.getDefault();
      const params = filter.toUrlParams();
      const path = getCategoryUrl(CategoryType.Accounts);

      clearFiles();

      if (window.location.search.includes("group")) {
        setIsSectionBodyLoading(true, false);

        setSelectedNode(["accounts", "groups", "filter"]);
        setContactsTab("groups");

        return window.DocSpace.navigate(`accounts/groups/filter?${params}`, {
          replace: true,
        });
      }
      setContactsTab("people");

      setSelectedNode(["accounts", "people", "filter"]);

      if (fromHotkeys) return;
      return window.DocSpace.navigate(`${path}?${params}`, { replace: true });
    }
  };

  moveToRoomsPage = () => {
    const categoryType = getCategoryType(window.DocSpace.location);

    const filter = RoomsFilter.getDefault();

    const correctCategoryType =
      categoryType === CategoryType.SharedRoom
        ? CategoryType.Shared
        : CategoryType.ArchivedRoom === categoryType
          ? CategoryType.Archive
          : categoryType;

    const path = getCategoryUrl(correctCategoryType);

    const state = {
      title:
        (this.selectedFolderStore?.navigationPath &&
          this.selectedFolderStore?.navigationPath.length > 0 &&
          this.selectedFolderStore?.navigationPath[
            this.selectedFolderStore.navigationPath.length - 1
          ]?.title) ||
        "",
      isRoot: true,
      isPublicRoomType: false,
      rootFolderType: this.selectedFolderStore.rootFolderType,
    };

    if (categoryType == CategoryType.Archive) {
      filter.searchArea = RoomSearchArea.Archive;
    }

    window.DocSpace.navigate(
      `${path}?${filter.toUrlParams(this.userStore?.user?.id, true)}`,
      {
        state,
        replace: true,
      },
    );
  };

  moveToPublicRoom = (folderId) => {
    const { navigationPath, rootFolderType } = this.selectedFolderStore;
    const { publicRoomKey } = this.publicRoomStore;

    const id = folderId || this.selectedFolderStore.parentId;
    const path = getCategoryUrl(CategoryType.PublicRoom);
    const filter = FilesFilter.getDefault();
    filter.folder = id;

    const state = {
      title: navigationPath[0]?.title || "",
      isRoot: navigationPath.length === 1,
      rootFolderType,
    };

    window.DocSpace.navigate(
      `${path}?key=${publicRoomKey}&${filter.toUrlParams()}`,
      { state },
    );
  };

  backToParentFolder = async () => {
    if (this.publicRoomStore.isPublicRoom) return this.moveToPublicRoom();

    const id = this.selectedFolderStore.parentId;

    const { navigationPath, rootFolderType } = this.selectedFolderStore;

    const filter = FilesFilter.getDefault();

    const filterObj = FilesFilter.getFilter(window.location);

    filter.sortBy = filterObj.sortBy;
    filter.sortOrder = filterObj.sortOrder;

    filter.folder = id;

    const selectedFolder = this.selectedFolderStore.getSelectedFolder();
    const shareKey = await this.getPublicKey(selectedFolder);
    if (shareKey) filter.key = shareKey;

    const categoryType = getCategoryType(window.DocSpace.location);
    const path = getCategoryUrl(categoryType, id);

    const isRoot = navigationPath.length === 1;

    const state = {
      title: (navigationPath && navigationPath[0]?.title) || "",
      isRoom: navigationPath[0]?.isRoom,
      isRoot,
      rootFolderType,
      isPublicRoomType: navigationPath[0]?.isRoom
        ? navigationPath[0]?.roomType === RoomsType.PublicRoom
        : false,
      rootRoomTitle: "",
    };

    window.DocSpace.navigate(`${path}?${filter.toUrlParams()}`, {
      state,
      replace: true,
    });
  };

  setGroupMenuBlocked = (blocked) => {
    this.isGroupMenuBlocked = blocked;
  };

  preparingDataForCopyingToRoom = async (destFolderId, selections, t) => {
    const fileIds = [];
    let folderIds = [];

    if (!selections.length) return;
    const oneFolder = selections.length === 1 && selections[0].isFolder;

    if (oneFolder) {
      folderIds = [selections[0].id];

      try {
        const selectedFolder = await getFolder(selections[0].id);
        const { folders, files, total } = selectedFolder;

        if (total === 0) {
          this.filesStore.setSelection([]);
          this.filesStore.setBufferSelection(null);
          return;
        }

        const title = folders.length ? folders[0].title : files[0].title;
        this.setSelectedItems(title, total);
      } catch (err) {
        toastr.error(err);
      }
    }

    !oneFolder &&
      selections.forEach((item) => {
        if (item.fileExst || item.contentLength) fileIds.push(item.id);
        else folderIds.push(item.id);
      });

    !oneFolder && this.setSelectedItems(selections[0].title, selections.length);
    this.filesStore.setSelection([]);
    this.filesStore.setBufferSelection(null);

    const operationData = {
      destFolderId,
      folderIds,
      fileIds,
      deleteAfter: false,
      isCopy: true,
      translations: {
        copy: t("Common:CopyOperation"),
      },
      content: oneFolder,
      itemsCount: selections.length,
      ...(selections.length === 1 && { title: selections[0].title }),
    };

    return this.uploadDataStore.itemOperationToFolder(operationData);
  };

  onLeaveRoom = (t, isOwner = false) => {
    const { selection, bufferSelection } = this.filesStore;
    const { user } = this.userStore;

    const roomId = selection.length
      ? selection[0].id
      : bufferSelection
        ? bufferSelection.id
        : this.selectedFolderStore.id;

    const isAdmin = user.isOwner || user.isAdmin;
    const isRoot = this.selectedFolderStore.isRootFolder;

    return api.rooms
      .updateRoomMemberRole(roomId, {
        invitations: [{ id: user?.id, access: ShareAccessRights.None }],
      })
      .then(() => {
        if (!isAdmin) {
          if (!isRoot) {
            const filter = RoomsFilter.getDefault();
            window.DocSpace.navigate(
              `rooms/shared/filter?${filter.toUrlParams()}`,
            );
          } else {
            this.filesStore.removeFiles(null, [roomId]);
          }
        } else if (!isRoot) {
          this.selectedFolderStore.setInRoom(false);

          const operationId = uniqueid("operation_");
          this.updateCurrentFolder(null, [roomId], null, operationId);
        } else {
          this.filesStore.setInRoomFolder(roomId, false);
        }

        isOwner
          ? toastr.success(t("Files:LeftAndAppointNewOwner"))
          : toastr.success(t("Files:YouLeftTheRoom"));
      });
  };

  changeRoomOwner = (t, userId, isLeaveChecked = false) => {
    const { setFolder, setSelected, selection, bufferSelection } =
      this.filesStore;
    const {
      isRootFolder,
      setCreatedBy,
      id,
      setInRoom,
      setSecurity,
      setAccess,
    } = this.selectedFolderStore;

    const roomId = selection.length
      ? selection[0].id
      : bufferSelection
        ? bufferSelection.id
        : id;

    return api.files
      .setFileOwner(userId, [roomId])
      .then(async (res) => {
        if (isRootFolder) {
          setFolder(res[0]);
        } else {
          setCreatedBy(res[0].createdBy);
          setSecurity(res[0].security);
          setAccess(res[0].access);

          const isMe = userId === this.userStore.user.id;
          if (isMe) setInRoom(true);
        }

        if (isLeaveChecked) await this.onLeaveRoom(t);
        else toastr.success(t("Files:AppointNewOwner"));
      })
      .catch((e) => toastr.error(e))
      .finally(() => {
        setSelected("none");
      });
  };

  onClickRemoveFromRecent = (selection) => {
    const { setSelected } = this.filesStore;
    const ids = selection.map((item) => item.id);
    this.removeFilesFromRecent(ids);
    setSelected("none");
  };

  removeFilesFromRecent = async (fileIds) => {
    const { refreshFiles } = this.filesStore;

    await deleteFilesFromRecent(fileIds);
    await refreshFiles();
  };

  copyFromTemplateForm = async (fileInfo, t) => {
    const selectedItemId = this.selectedFolderStore.id;
    const fileIds = [fileInfo.id];

    const operationData = {
      destFolderId: selectedItemId,
      folderIds: [],
      fileIds,
      deleteAfter: false,
      isCopy: true,
      folderTitle: this.selectedFolderStore.title,
      translations: {
        copy: t("Common:CopyOperation"),
      },
    };

    this.uploadDataStore.secondaryProgressDataStore.setItemsSelectionTitle(
      fileInfo.title,
    );

    const conflicts = await checkFileConflicts(selectedItemId, [], fileIds);

    if (conflicts.length) {
      return this.setConflictDialogData(conflicts, operationData);
    }

    this.uploadDataStore
      .itemOperationToFolder(operationData)
      .catch((error) => toastr.error(error));
  };

  setListOrder = (startIndex, finalIndex, indexMovedFromBottom = false) => {
    const { setUpdateSelection } = this.indexingStore;
    const newFilesList = JSON.parse(JSON.stringify(this.filesStore.filesList));

    let i = startIndex;
    while (i !== finalIndex) {
      if (newFilesList[i].order.includes(".")) {
        const splitItem = newFilesList[i].order.split(".");

        if (indexMovedFromBottom) {
          splitItem[splitItem.length - 1] = +splitItem.at(-1) + 1;
        } else {
          splitItem[splitItem.length - 1] = +splitItem.at(-1) - 1;
        }

        newFilesList[i].order = splitItem.join(".");
      } else if (indexMovedFromBottom) {
        newFilesList[i].order = `${+newFilesList[i].order + 1}`;
      } else {
        newFilesList[i].order = `${+newFilesList[i].order - 1}`;
      }
      setUpdateSelection([newFilesList[i]]);
      i++;
    }

    return newFilesList;
  };

  revokeFilesOrder = () => {
    const { setFiles, setFolders } = this.filesStore;
    const { previousFilesList } = this.indexingStore;

    if (!previousFilesList.length) return;

    const newFolders = previousFilesList.filter((f) => f.isFolder);
    const newFiles = previousFilesList.filter((f) => !f.isFolder);

    setFiles(newFiles);
    setFolders(newFolders);
  };

  setFilesOrder = (currentItem, replaceableItem, indexMovedFromBottom) => {
    const { filesList, setFiles, setFolders } = this.filesStore;
    const { setPreviousFilesList, updateSelection, setUpdateSelection } =
      this.indexingStore;

    if (updateSelection.length === 0) {
      setPreviousFilesList(filesList);
    }

    const currentIndex = filesList.findIndex(
      (f) => f.order === currentItem.order,
    );
    const replaceableIndex = filesList.findIndex(
      (f) => f.order === replaceableItem.order,
    );

    let newFilesList;
    if (indexMovedFromBottom) {
      newFilesList = this.setListOrder(
        replaceableIndex,
        currentIndex,
        indexMovedFromBottom,
      );
      newFilesList[currentIndex].order = replaceableItem.order;
    } else {
      newFilesList = this.setListOrder(currentIndex, replaceableIndex + 1);
      newFilesList[currentIndex].order = filesList[replaceableIndex].order;
    }
    setUpdateSelection([newFilesList[currentIndex]]);

    const newFolders = newFilesList.filter((f) => f.isFolder);
    const newFiles = newFilesList.filter((f) => !f.isFolder);

    setFiles(newFiles);
    setFolders(newFolders);
  };

  changeIndex = async (action, item, t, isLastItem = true) => {
    const { filesList, bufferSelection } = this.filesStore;

    const index = filesList.findIndex(
      (elem) => elem.id === item?.id && elem.fileExst === item?.fileExst,
    );

    if (
      (action === VDRIndexingAction.HigherIndex && index === 0) ||
      (action === VDRIndexingAction.LowerIndex &&
        index === filesList.length - 1)
    )
      return;

    const selection = this.filesStore.selection.length
      ? this.filesStore.selection
      : [bufferSelection];

    let replaceable;
    let current = item;

    switch (action) {
      case VDRIndexingAction.HigherIndex:
        replaceable = filesList[index - 1];
        break;

      case VDRIndexingAction.LowerIndex:
        replaceable = filesList[index + 1];
        break;

      default:
        current = selection[0];
        replaceable = item;
        break;
    }

    if (!replaceable || current.order === replaceable.order) return;

    try {
      let indexMovedFromBottom = +current.order > +replaceable.order;
      if (current.order.includes(".")) {
        indexMovedFromBottom =
          +current.order.split(".").at(-1) >
          +replaceable.order.split(".").at(-1);
      }

      const newRepIndex = filesList.findIndex(
        (f) => f.id === replaceable.id && f.isFolder === replaceable.isFolder,
      );

      const newReplaceable =
        indexMovedFromBottom || isLastItem
          ? replaceable
          : filesList[newRepIndex - 1];

      this.setFilesOrder(current, newReplaceable, indexMovedFromBottom);
      this.filesStore.setSelected("none");
    } catch (e) {
      toastr.error(t("Files:ErrorChangeIndex"));
    }
  };

  saveIndexOfFiles = async (t) => {
    const { getIndexingArray } = this.indexingStore;

    try {
      const items = getIndexingArray();

      if (items.length > 0) {
        await changeIndex(items);
      }
    } catch (e) {
      toastr.error(t("Files:ErrorChangeIndex"));
    }
  };

  reorderIndexOfFiles = async (id, t) => {
    const { setIsIndexEditingMode } = this.indexingStore;

    try {
      const operationId = uniqueid("operation_");
      await reorderIndex(id);
      toastr.success(t("Common:SuccessfullyCompletedOperation"));
      setIsIndexEditingMode(false);
      this.updateCurrentFolder(null, [id], true, operationId);
    } catch (e) {
      toastr.error(t("Files:ErrorChangeIndex"));
    }
  };

  checkExportRoomIndexProgress = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const res = await api.rooms.getExportRoomIndexProgress();

          resolve(res);
        } catch (e) {
          reject(e);
        }
      }, 1000);
    });
  };

  loopExportRoomIndexStatusChecking = async (pbData) => {
    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;

    let isCompleted = false;
    let res;

    while (!isCompleted) {
      res = await this.checkExportRoomIndexProgress();

      if (res?.isCompleted) {
        isCompleted = true;
      }

      if (res?.percentage) {
        setSecondaryProgressBarData({
          operation: pbData.operation,
          percent: res.percentage,
          alert: false,
          operationId: pbData.operationId,
        });
      }
    }

    return res;
  };

  checkPreviousExportRoomIndexInProgress = async () => {
    try {
      if (this.alreadyExportingRoomIndex) {
        return true;
      }

      const previousExport = await api.rooms.getExportRoomIndexProgress();

      return previousExport && !previousExport.isCompleted;
    } catch (e) {
      toastr.error(e);
    }
  };

  onSuccessExportRoomIndex = (t, fileName, fileUrl) => {
    const { openOnNewPage } = this.filesSettingsStore;
    const urlWithProxy = combineUrl(window.ClientConfig?.proxy?.url, fileUrl);

    showSuccessExportRoomIndexToast(t, fileName, urlWithProxy, openOnNewPage);
  };

  exportRoomIndex = async (t, roomId) => {
    const previousExportInProgress =
      await this.checkPreviousExportRoomIndexInProgress();

    if (previousExportInProgress) {
      return toastr.error(t("Files:ExportRoomIndexAlreadyInProgressError"));
    }

    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;

    const operationName = OPERATIONS_NAME.exportIndex;

    const pbData = {
      operation: operationName,
      operationId: uniqueid("operation_"),
    };

    setSecondaryProgressBarData({
      operation: pbData.operation,
      operationId: pbData.operationId,
    });

    this.alreadyExportingRoomIndex = true;

    try {
      let res = await api.rooms.exportRoomIndex(roomId);

      if (!res.isCompleted) {
        res = await this.loopExportRoomIndexStatusChecking(pbData);
      }

      if (res.status === ExportRoomIndexTaskStatus.Failed) {
        toastr.error(res.error);

        setSecondaryProgressBarData({
          operation: pbData.operation,
          completed: true,
          alert: true,
          operationId: pbData.operationId,
        });

        return;
      }

      if (res.status === ExportRoomIndexTaskStatus.Completed) {
        this.onSuccessExportRoomIndex(t, res.resultFileName, res.resultFileUrl);
      }

      setSecondaryProgressBarData({
        operation: pbData.operation,
        completed: true,
        operationId: pbData.operationId,
      });
    } catch (e) {
      toastr.error(e);
    } finally {
      this.alreadyExportingRoomIndex = false;

      // setTimeout(() => clearSecondaryProgressData(pbData.operationId), TIMEOUT);
    }
  };

  getPublicKey = async (folder) => {
    const { isOwner, isAdmin } = this.userStore.user;

    if (
      folder?.shared &&
      folder?.rootFolderType === FolderType.Rooms &&
      (isOwner || isAdmin)
    ) {
      const filterObj = FilesFilter.getFilter(window.location);

      if (filterObj.key) {
        return filterObj.key;
      }

      try {
        const link = await this.filesStore.getPrimaryLink(folder.id);
        const key = link?.sharedTo?.requestToken;

        return key;
      } catch (error) {
        toastr.error(error);
      }
    }

    return null;
  };
}

export default FilesActionStore;
