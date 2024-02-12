﻿import FavoritesReactSvgUrl from "PUBLIC_DIR/images/favorites.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/downloadAs.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/move.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/catalog.rooms.react.svg?url";
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
  removeShareFiles,
  createFolder,
  moveToFolder,
  getFolder,
  deleteFilesFromRecent,
} from "@docspace/shared/api/files";
import {
  ConflictResolveType,
  FileAction,
  FileStatus,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { makeAutoObservable } from "mobx";

import { toastr } from "@docspace/shared/components/toast";
import { TIMEOUT } from "@docspace/client/src/helpers/filesConstants";
import { checkProtocol } from "../helpers/files-helpers";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";
import { isDesktop } from "@docspace/shared/utils";
import { getCategoryType } from "SRC_DIR/helpers/utils";
import { muteRoomNotification } from "@docspace/shared/api/settings";
import { CategoryType } from "SRC_DIR/helpers/constants";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import AccountsFilter from "@docspace/shared/api/people/filter";
import { RoomSearchArea } from "@docspace/shared/enums";
import { getObjectByLocation } from "@docspace/shared/utils/common";
import { Events } from "@docspace/shared/enums";
import uniqueid from "lodash/uniqueId";
import FilesFilter from "@docspace/shared/api/files/filter";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import { MEDIA_VIEW_URL } from "@docspace/shared/constants";

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
  userStore = null;
  currentTariffStatusStore = null;

  isBulkDownload = false;
  isLoadedSearchFiles = false;
  isGroupMenuBlocked = false;
  emptyTrashInProgress = false;
  processCreatingRoomFromData = false;

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
  }

  setIsBulkDownload = (isBulkDownload) => {
    this.isBulkDownload = isBulkDownload;
  };

  isMediaOpen = () => {
    const { visible, setMediaViewerData, playlist } = this.mediaViewerDataStore;
    if (visible && playlist.length === 1) {
      setMediaViewerData({ visible: false, id: null });
    }
  };

  updateCurrentFolder = (fileIds, folderIds, clearSelection, operationId) => {
    const { clearSecondaryProgressData } =
      this.uploadDataStore.secondaryProgressDataStore;

    const {
      fetchFiles,
      fetchRooms,
      filter,
      roomsFilter,

      isEmptyLastPageAfterOperation,
      resetFilterPage,
    } = this.filesStore;

    const { isRoomsFolder, isArchiveFolder, isArchiveFolderRoot } =
      this.treeFoldersStore;

    let newFilter;

    const selectionFilesLength =
      fileIds && folderIds
        ? fileIds.length + folderIds.length
        : fileIds?.length || folderIds?.length;

    if (
      selectionFilesLength &&
      isEmptyLastPageAfterOperation(selectionFilesLength)
    ) {
      newFilter = resetFilterPage();
    }

    let updatedFolder = this.selectedFolderStore.id;

    if (this.dialogsStore.isFolderActions) {
      updatedFolder = this.selectedFolderStore.parentId;
    }

    if (isRoomsFolder || isArchiveFolder || isArchiveFolderRoot) {
      fetchRooms(
        updatedFolder,
        newFilter ? newFilter : roomsFilter.clone(),
        undefined,
        undefined,
        undefined,
        true,
      ).finally(() => {
        this.dialogsStore.setIsFolderActions(false);
        return setTimeout(
          () => clearSecondaryProgressData(operationId),
          TIMEOUT,
        );
      });
    } else {
      fetchFiles(
        updatedFolder,
        newFilter ? newFilter : filter,
        true,
        true,
        clearSelection,
      ).finally(() => {
        this.dialogsStore.setIsFolderActions(false);
        return setTimeout(
          () => clearSecondaryProgressData(operationId),
          TIMEOUT,
        );
      });
    }
  };

  convertToTree = (folders) => {
    let result = [];
    let level = { result };
    try {
      folders.forEach((folder) => {
        folder.path
          .split("/")
          .filter((name) => name !== "")
          .reduce((r, name, i, a) => {
            if (!r[name]) {
              r[name] = { result: [] };
              r.result.push({ name, children: r[name].result });
            }

            return r[name];
          }, level);
      });
    } catch (e) {
      console.error("convertToTree", e);
    }
    return result;
  };

  createFolderTree = async (treeList, parentFolderId) => {
    if (!treeList || !treeList.length) return;

    for (let i = 0; i < treeList.length; i++) {
      const treeNode = treeList[i];

      // console.log(
      //   `createFolderTree parent id = ${parentFolderId} name '${treeNode.name}': `,
      //   treeNode.children
      // );

      const folder = await createFolder(parentFolderId, treeNode.name);
      const parentId = folder.id;

      if (treeNode.children.length == 0) continue;

      await this.createFolderTree(treeNode.children, parentId);
    }
  };

  uploadEmptyFolders = async (emptyFolders, folderId) => {
    //console.log("uploadEmptyFolders", emptyFolders, folderId);

    const { secondaryProgressDataStore } = this.uploadDataStore;
    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      secondaryProgressDataStore;

    const operationId = uniqueid("operation_");

    const toFolderId = folderId ? folderId : this.selectedFolderStore.id;

    setSecondaryProgressBarData({
      icon: "file",
      visible: true,
      percent: 0,
      label: "",
      alert: false,
      operationId,
    });

    const tree = this.convertToTree(emptyFolders);
    await this.createFolderTree(tree, toFolderId);

    this.updateCurrentFolder(null, [folderId], null, operationId);

    setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
  };

  updateFilesAfterDelete = (operationId) => {
    const { setSelected } = this.filesStore;
    const { clearSecondaryProgressData } =
      this.uploadDataStore.secondaryProgressDataStore;

    setSelected("close");

    this.dialogsStore.setIsFolderActions(false);
    setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
  };

  deleteAction = async (
    translations,
    newSelection = null,
    withoutDialog = false,
  ) => {
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
    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      secondaryProgressDataStore;
    const { withPaging } = this.settingsStore;

    let selection = newSelection
      ? newSelection
      : this.filesStore.selection.length
        ? this.filesStore.selection
        : [bufferSelection];

    selection = selection.filter((item) => item.security.Delete);

    const isThirdPartyFile = selection.some((f) => f.providerKey);

    const currentFolderId = this.selectedFolderStore.id;

    const operationId = uniqueid("operation_");

    const deleteAfter = false; //Delete after finished TODO: get from settings
    const immediately = isRecycleBinFolder || isPrivacyFolder ? true : false; //Don't move to the Recycle Bin

    let folderIds = [];
    let fileIds = [];

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
    const filesCount = folderIds.length + fileIds.length;

    setSecondaryProgressBarData({
      icon: "trash",
      visible: true,
      percent: 0,
      label: translations.deleteOperation,
      alert: false,
      filesCount,
      operationId,
    });

    const destFolderId = immediately ? null : recycleBinFolderId;

    addActiveItems(fileIds, null, destFolderId);
    addActiveItems(null, folderIds, destFolderId);

    if (folderIds.length || fileIds.length) {
      this.isMediaOpen();

      try {
        this.filesStore.setOperationAction(true);
        this.setGroupMenuBlocked(true);
        await removeFiles(folderIds, fileIds, deleteAfter, immediately)
          .then(async (res) => {
            if (res[0]?.error) return Promise.reject(res[0].error);
            const data = res[0] ? res[0] : null;
            const pbData = {
              icon: "trash",
              label: translations.deleteOperation,
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

            if (withPaging || this.dialogsStore.isFolderActions) {
              this.updateCurrentFolder(fileIds, folderIds, false, operationId);
              showToast();
            } else {
              this.updateFilesAfterDelete(operationId);

              this.filesStore.removeFiles(
                fileIds,
                folderIds,
                showToast,
                destFolderId,
              );

              this.uploadDataStore.removeFiles(fileIds);
            }

            if (currentFolderId) {
              const { socketHelper } = this.settingsStore;

              socketHelper.emit({
                command: "refresh-folder",
                data: currentFolderId,
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
          visible: true,
          alert: true,
          operationId,
        });
        setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
        return toastr.error(err.message ? err.message : err);
      } finally {
        this.filesStore.setOperationAction(false);
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
    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      secondaryProgressDataStore;
    const { isRecycleBinFolder } = this.treeFoldersStore;
    const { addActiveItems, files, folders, getIsEmptyTrash } = this.filesStore;

    const fileIds = files.map((f) => f.id);
    const folderIds = folders.map((f) => f.id);

    if (isRecycleBinFolder) {
      addActiveItems(fileIds, folderIds);
    }

    const operationId = uniqueid("operation_");

    this.emptyTrashInProgress = true;

    setSecondaryProgressBarData({
      icon: "trash",
      visible: true,
      percent: 0,
      label: translations.deleteOperation,
      alert: false,
      operationId,
    });

    try {
      await emptyTrash().then(async (res) => {
        if (res[0]?.error) return Promise.reject(res[0].error);
        const data = res[0] ? res[0] : null;
        const pbData = {
          icon: "trash",
          label: translations.deleteOperation,
          operationId,
        };
        await loopFilesOperations(data, pbData);
        toastr.success(translations.successOperation);
        this.updateCurrentFolder(fileIds, folderIds, null, operationId);
        getIsEmptyTrash();
        clearActiveOperations(fileIds, folderIds);
      });
    } catch (err) {
      clearActiveOperations(fileIds, folderIds);
      setSecondaryProgressBarData({
        visible: true,
        alert: true,
        operationId,
      });
      setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
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
    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      secondaryProgressDataStore;
    const { isArchiveFolder } = this.treeFoldersStore;
    const { addActiveItems, roomsForDelete } = this.filesStore;

    const folderIds = roomsForDelete.map((f) => f.id);
    if (isArchiveFolder) addActiveItems(null, folderIds);

    const operationId = uniqueid("operation_");

    setSecondaryProgressBarData({
      icon: "trash",
      visible: true,
      percent: 0,
      label: translations.deleteOperation,
      alert: false,
      operationId,
    });

    try {
      await removeFiles(folderIds, [], true, true).then(async (res) => {
        if (res[0]?.error) return Promise.reject(res[0].error);
        const data = res[0] ? res[0] : null;
        const pbData = {
          icon: "trash",
          label: translations.deleteOperation,
          operationId,
        };
        await loopFilesOperations(data, pbData);
        toastr.success(translations.successOperation);
        this.updateCurrentFolder(null, folderIds, null, operationId);
        // getIsEmptyTrash();
        clearActiveOperations(null, folderIds);
      });
    } catch (err) {
      clearActiveOperations(null, folderIds);
      setSecondaryProgressBarData({
        visible: true,
        alert: true,
        operationId,
      });
      setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);

      return toastr.error(err.message ? err.message : err);
    }
  };

  downloadFiles = async (fileConvertIds, folderIds, translations) => {
    const { clearActiveOperations, secondaryProgressDataStore } =
      this.uploadDataStore;
    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      secondaryProgressDataStore;

    const { addActiveItems } = this.filesStore;
    const { label } = translations;

    if (this.isBulkDownload) {
      //toastr.error(); TODO: new add cancel download operation and new translation "ErrorMassage_SecondDownload"
      return;
    }

    this.setIsBulkDownload(true);

    const operationId = uniqueid("operation_");

    setSecondaryProgressBarData({
      icon: "file",
      visible: true,
      percent: 0,
      label,
      alert: false,
      operationId,
      isDownload: true,
    });

    const fileIds = fileConvertIds.map((f) => f.key || f);
    addActiveItems(fileIds, folderIds);

    const shareKey = this.publicRoomStore.publicRoomKey;

    try {
      await downloadFiles(fileConvertIds, folderIds, shareKey).then(
        async (res) => {
          const data = res[0] ? res[0] : null;
          const pbData = {
            icon: "file",
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
          this.setIsBulkDownload(false);

          if (item.url) {
            window.location.href = item.url;
          } else {
            setSecondaryProgressBarData({
              visible: true,
              alert: true,
              operationId,
            });
          }

          setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
          !item.url && toastr.error(translations.error, null, 0, true);
        },
      );
    } catch (err) {
      this.setIsBulkDownload(false);
      clearActiveOperations(fileIds, folderIds);
      setSecondaryProgressBarData({
        visible: true,
        alert: true,
        operationId,
      });
      setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
      return toastr.error(err.message ? err.message : err);
    }
  };

  downloadAction = (label, item, folderId) => {
    const { bufferSelection } = this.filesStore;

    const selection = item
      ? [item]
      : this.filesStore.selection.length
        ? this.filesStore.selection
        : bufferSelection
          ? [bufferSelection]
          : null;

    if (!selection.length) return;

    let fileIds = [];
    let folderIds = [];
    const items = [];

    if (selection.length === 1 && selection[0].fileExst && !folderId) {
      window.open(selection[0].viewUrl, "_self");
      return Promise.resolve();
    }

    for (let item of selection) {
      if (item.fileExst) {
        fileIds.push(item.id);
        items.push({ id: item.id, fileExst: item.fileExst });
      } else {
        folderIds.push(item.id);
        items.push({ id: item.id });
      }
    }

    this.setGroupMenuBlocked(true);
    return this.downloadFiles(fileIds, folderIds, label).finally(() =>
      this.setGroupMenuBlocked(false),
    );
  };

  completeAction = async (selectedItem, type, isFolder = false) => {
    switch (type) {
      case FileAction.Create:
        this.filesStore.addItem(selectedItem, isFolder);
        break;
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
        //TODO: fix double event on context-menu click
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
    const { secondaryProgressDataStore, clearActiveOperations } =
      this.uploadDataStore;
    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      secondaryProgressDataStore;
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

      setSecondaryProgressBarData({
        icon: "trash",
        visible: true,
        percent: 0,
        label: translations?.deleteOperation,
        alert: false,
        operationId,
      });

      const id = Array.isArray(itemId) ? itemId : [itemId];

      try {
        await this.deleteItemOperation(
          isFile,
          itemId,
          translations,
          isRoom,
          operationId,
        );
      } catch (err) {
        setSecondaryProgressBarData({
          visible: true,
          alert: true,
          operationId,
        });
        setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
        return toastr.error(err.message ? err.message : err);
      } finally {
        setTimeout(
          () => clearActiveOperations(isFile && id, !isFile && id),
          TIMEOUT,
        );
      }
    }
  };

  deleteItemOperation = (isFile, itemId, translations, isRoom, operationId) => {
    const { addActiveItems, getIsEmptyTrash } = this.filesStore;
    const { withPaging } = this.settingsStore;
    const { isRecycleBinFolder, recycleBinFolderId } = this.treeFoldersStore;

    const pbData = {
      icon: "trash",
      label: translations?.deleteOperation,
      operationId,
    };

    this.filesStore.setOperationAction(true);

    const destFolderId = isRecycleBinFolder ? null : recycleBinFolderId;

    if (isFile) {
      addActiveItems([itemId], null, destFolderId);
      this.isMediaOpen();
      return deleteFile(itemId)
        .then(async (res) => {
          if (res[0]?.error) return Promise.reject(res[0].error);
          const data = res[0] ? res[0] : null;
          await this.uploadDataStore.loopFilesOperations(data, pbData);

          if (withPaging) {
            this.updateCurrentFolder([itemId], null, null, operationId);
            toastr.success(translations.successRemoveFile);
          } else {
            this.updateFilesAfterDelete(operationId);
            this.filesStore.removeFiles(
              [itemId],
              null,
              () => toastr.success(translations.successRemoveFile),
              destFolderId,
            );
          }
        })
        .finally(() => this.filesStore.setOperationAction(false));
    } else if (isRoom) {
      const items = Array.isArray(itemId) ? itemId : [itemId];
      addActiveItems(null, items);

      this.setGroupMenuBlocked(true);
      return removeFiles(items, [], false, true)
        .then(async (res) => {
          if (res[0]?.error) return Promise.reject(res[0].error);
          const data = res[0] ? res[0] : null;
          await this.uploadDataStore.loopFilesOperations(data, pbData);
          this.updateCurrentFolder(null, [itemId], null, operationId);
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
    } else {
      addActiveItems(null, [itemId], destFolderId);
      return deleteFolder(itemId)
        .then(async (res) => {
          if (res[0]?.error) return Promise.reject(res[0].error);
          const data = res[0] ? res[0] : null;
          await this.uploadDataStore.loopFilesOperations(data, pbData);

          if (withPaging) {
            this.updateCurrentFolder(null, [itemId], null, operationId);
            toastr.success(translations.successRemoveFolder);
          } else {
            this.updateFilesAfterDelete(operationId);
            this.filesStore.removeFiles(
              null,
              [itemId],
              () => toastr.success(translations.successRemoveFolder),
              destFolderId,
            );
          }

          getIsEmptyTrash();
        })
        .finally(() => this.filesStore.setOperationAction(false));
    }
  };

  unsubscribeAction = async (fileIds, folderIds) => {
    const { setUnsubscribe } = this.dialogsStore;
    const { filter, fetchFiles } = this.filesStore;

    // return removeShareFiles(fileIds, folderIds)
    //   .then(() => setUnsubscribe(false))
    //   .then(() => fetchFiles(this.selectedFolderStore.id, filter, true, true));
  };

  lockFileAction = async (id, locked) => {
    let timer = null;
    const { setFile } = this.filesStore;
    try {
      timer = setTimeout(() => {
        this.filesStore.setActiveFiles([id]);
      }, 200);
      await lockFile(id, locked).then((res) => {
        setFile(res), this.filesStore.setActiveFiles([]);
      });
    } catch (err) {
      toastr.error(err);
    } finally {
      clearTimeout(timer);
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

  duplicateAction = (item, label) => {
    const { setSecondaryProgressBarData, filesCount } =
      this.uploadDataStore.secondaryProgressDataStore;

    this.setSelectedItems();

    //TODO: duplicate for folders?
    const folderIds = [];
    const fileIds = [];
    item.fileExst ? fileIds.push(item.id) : folderIds.push(item.id);
    const conflictResolveType = ConflictResolveType.Duplicate;
    const deleteAfter = false; //TODO: get from settings
    const operationId = uniqueid("operation_");

    setSecondaryProgressBarData({
      icon: "duplicate",
      visible: true,
      percent: 0,
      label,
      alert: false,
      filesCount: filesCount + fileIds.length,
      operationId,
    });

    this.filesStore.addActiveItems(fileIds, folderIds);

    return this.uploadDataStore.copyToAction(
      this.selectedFolderStore.id,
      folderIds,
      fileIds,
      conflictResolveType,
      deleteAfter,
      operationId,
    );
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
    const {
      markItemAsFavorite,
      removeItemFromFavorite,
      fetchFavoritesFolder,
      setSelected,
    } = this.filesStore;

    const items = Array.isArray(id) ? id : [id];

    switch (action) {
      case "mark":
        return markItemAsFavorite(items)
          .then(() => {
            return this.getFilesInfo(items);
          })
          .then(() => setSelected("close"));

      case "remove":
        return removeItemFromFavorite(items)
          .then(() => {
            return this.treeFoldersStore.isFavoritesFolder
              ? fetchFavoritesFolder(this.selectedFolderStore.id)
              : this.getFilesInfo(items);
          })
          .then(() => setSelected("close"));
      default:
        return;
    }
  };

  setPinAction = (action, id, t) => {
    const { pinRoom, unpinRoom, updateRoomPin, setSelected } = this.filesStore;

    const { infoPanelSelection, setInfoPanelSelection } = this.infoPanelStore;

    const items = Array.isArray(id) ? id : [id];

    const actions = [];
    const operationId = uniqueid("operation_");

    switch (action) {
      case "pin":
        items.forEach((item) => {
          updateRoomPin(item);
          actions.push(pinRoom(item));
        });

        return Promise.all(actions)
          .then(() => {
            this.updateCurrentFolder(null, items, null, operationId);
            if (infoPanelSelection) {
              setInfoPanelSelection({ ...infoPanelSelection, pinned: true });
            }
          })
          .then(() => setSelected("close"))
          .then(() =>
            toastr.success(
              items.length > 1
                ? t("RoomsPinned", { count: items.length })
                : t("RoomPinned"),
            ),
          )
          .catch((error) => console.log(error));
      case "unpin":
        items.forEach((item) => {
          updateRoomPin(item);
          actions.push(unpinRoom(item));
        });
        return Promise.all(actions)
          .then(() => {
            this.updateCurrentFolder(null, items, null, operationId);
            if (selection) {
              setInfoPanelSelection({ ...selection, pinned: false });
            }
          })
          .then(() => setSelected("close"))
          .then(() => {
            toastr.success(
              items.length > 1
                ? t("RoomsUnpinned", { count: items.length })
                : t("RoomUnpinned"),
            );
          })
          .catch((error) => console.log(error));
      default:
        return;
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

    const { setSelectedFolder } = this.selectedFolderStore;

    const { roomsFolder, isRoomsFolder, archiveRoomsId, myRoomsId } =
      this.treeFoldersStore;

    const { secondaryProgressDataStore, clearActiveOperations } =
      this.uploadDataStore;

    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      secondaryProgressDataStore;

    if (!myRoomsId || !archiveRoomsId) {
      console.error("Default categories not found");
      return;
    }

    const operationId = uniqueid("operation_");

    const items = Array.isArray(folders)
      ? folders.map((x) => (x?.id ? x.id : x))
      : [folders.id];

    setSecondaryProgressBarData({
      icon: "move",
      visible: true,
      percent: 0,
      label: "Archive room",
      alert: false,
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

            const pbData = {
              icon: "move",
              label: "Archive rooms operation",
              operationId,
            };
            const data = lastResult || null;

            console.log(pbData.label, { data, res });

            const operationData =
              await this.uploadDataStore.loopFilesOperations(data, pbData);

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
              setSelectedFolder(roomsFolder);
            }

            this.updateCurrentFolder(null, null, null, operationId);
          })

          .then(() => {
            const successTranslation =
              folders.length !== 1 && Array.isArray(folders)
                ? t("ArchivedRoomsAction")
                : Array.isArray(folders)
                  ? t("ArchivedRoomAction", { name: folders[0].title })
                  : t("ArchivedRoomAction", { name: folders.title });

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
              icon: "move",
              visible: true,
              alert: true,
              operationId,
            });
            setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
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

            this.updateCurrentFolder(null, [items], null, operationId);
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
          .catch((err) => {
            clearActiveOperations(null, items);
            setSecondaryProgressBarData({
              visible: true,
              alert: true,
              operationId,
            });
            setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
            return toastr.error(err.message ? err.message : err);
          })
          .finally(() => {
            clearActiveOperations(null, items);
            this.setGroupMenuBlocked(false);
          });
      default:
        return;
    }
  };

  selectTag = (tag) => {
    const { roomsFilter } = this.filesStore;

    const { setIsSectionBodyLoading } = this.clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionBodyLoading(param);
    };

    const newFilter = roomsFilter.clone();

    if (tag !== "no-tag") {
      const tags = newFilter.tags ? [...newFilter.tags] : [];

      if (tags.length > 0) {
        const idx = tags.findIndex((item) => item === tag);

        if (idx > -1) {
          //TODO: remove tag here if already selected
          return;
        }
      }
      tags.push(tag);

      newFilter.tags = [...tags];
      newFilter.withoutTags = false;
    } else {
      newFilter.withoutTags = true;
    }

    setIsLoading(true);
    window.DocSpace.navigate(
      `${window.DocSpace.location.pathname}?${newFilter.toUrlParams()}`,
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
    //selected === "close" && setSelected("none");
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

    const { setIsSectionFilterLoading } = this.clientLoadingStore;

    const { id, isRoom, title, rootFolderType } = item;
    const categoryType = getCategoryTypeByFolderType(rootFolderType, id);

    const state = { title, rootFolderType, isRoot: false, isRoom };
    const filter = FilesFilter.getDefault();

    filter.folder = id;

    const url = getCategoryUrl(categoryType, id);

    window.DocSpace.navigate(`${url}?${filter.toUrlParams()}`, { state });
  };

  checkAndOpenLocationAction = async (item) => {
    const { categoryType } = this.filesStore;
    const { myRoomsId, myFolderId, archiveRoomsId, recycleBinFolderId } =
      this.treeFoldersStore;
    const { rootFolderType } = this.selectedFolderStore;
    const { setIsSectionFilterLoading } = this.clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    const { ExtraLocationTitle, ExtraLocation, fileExst } = item;

    const isRoot =
      ExtraLocation === myRoomsId ||
      ExtraLocation === myFolderId ||
      ExtraLocation === archiveRoomsId ||
      ExtraLocation === recycleBinFolderId;

    const state = {
      title: ExtraLocationTitle,

      isRoot,
      fileExst,
      highlightFileId: item.id,
      isFileHasExst: !item.fileExst,
      rootFolderType,
    };

    const url = getCategoryUrl(categoryType, ExtraLocation);

    const newFilter = FilesFilter.getDefault();

    newFilter.search = item.title;
    newFilter.folder = ExtraLocation;

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
    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      this.uploadDataStore.secondaryProgressDataStore;

    const operationId = uniqueid("operation_");

    setSecondaryProgressBarData({
      icon: "file",
      label: "", //TODO: add translation if need "MarkAsRead": "Mark all as read",
      percent: 0,
      visible: true,
      operationId,
    });

    return markAsRead(folderIds, fileIds)
      .then(async (res) => {
        const data = res[0] ? res[0] : null;
        const pbData = { icon: "file", operationId };
        await this.uploadDataStore.loopFilesOperations(data, pbData);
      })
      .then(() => {
        if (!item) return;

        //this.setNewBadgeCount(item);

        const { getFileIndex, updateFileStatus } = this.filesStore;

        const index = getFileIndex(item.id);
        updateFileStatus(index, item.fileStatus & ~FileStatus.IsNew);
      })
      .catch((err) => toastr.error(err))
      .finally(() =>
        setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT),
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
    };

    for (let item of selection) {
      if (!item.isFolder) {
        fileIds.push(item.id);
      } else {
        if (item.providerKey && isRootFolder) continue;
        folderIds.push(item.id);
      }
    }

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
    const selectionLength = length ? length : this.filesStore.selection.length;
    const selectionTitle = title ? title : this.filesStore.selectionTitle;

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
    const { canConvertSelected, hasSelection, allFilesIsEditing, selection } =
      this.filesStore;

    const { rootFolderType } = this.selectedFolderStore;
    const canDownload = selection.every((s) => s.security?.Download);

    switch (option) {
      case "copy":
        const canCopy = selection.every((s) => s.security?.Copy);

        return hasSelection && canCopy;
      case "showInfo":
      case "download":
        return hasSelection && canDownload;
      case "downloadAs":
        return canDownload && canConvertSelected;
      case "moveTo":
        const canMove = selection.every((s) => s.security?.Move);

        return (
          hasSelection &&
          !allFilesIsEditing &&
          canMove &&
          rootFolderType !== FolderType.TRASH
        );

      case "archive":
        const canArchive = selection.every((s) => s.security?.Move);

        return canArchive;
      case "unarchive":
        const canUnArchive = selection.some((s) => s.security?.Move);

        return canUnArchive;
      case "delete-room":
        const canRemove = selection.some((s) => s.security?.Delete);

        return canRemove;
      case "delete":
        const canDelete = selection.every((s) => s.security?.Delete);

        return !allFilesIsEditing && canDelete && hasSelection;
      case "create-room":
        const { isCollaborator } = this.userStore?.user || {
          isCollaborator: false,
        };

        const canCreateRoom =
          !isCollaborator && rootFolderType === FolderType.USER;

        return canCreateRoom;
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
      setInviteUsersWarningDialogVisible,
      setRestoreRoomDialogVisible,
    } = this.dialogsStore;
    const { isGracePeriod } = this.currentTariffStatusStore;

    if (action === "unarchive" && isGracePeriod) {
      setInviteUsersWarningDialogVisible(true);
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

    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      secondaryProgressDataStore;

    const operationId = uniqueid("operation_");

    setSecondaryProgressBarData({
      icon: "trash",
      visible: true,
      percent: 0,
      label: translations?.deleteOperation,
      alert: false,
      operationId,
    });

    const id = Array.isArray(itemId) ? itemId : [itemId];

    try {
      this.setGroupMenuBlocked(true);
      await this.deleteItemOperation(
        false,
        itemId,
        translations,
        true,
        operationId,
      );
    } catch (err) {
      console.log(err);

      setSecondaryProgressBarData({
        visible: true,
        alert: true,
        operationId,
      });
      setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
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

  getOption = (option, t) => {
    const {
      setSharingPanelVisible,
      setDownloadDialogVisible,
      setMoveToPanelVisible,
      setCopyPanelVisible,
      setDeleteDialogVisible,
    } = this.dialogsStore;

    switch (option) {
      case "show-info":
        if (isDesktop()) return null;
        else
          return {
            id: "menu-show-info",
            key: "show-info",
            label: t("Common:Info"),
            iconUrl: InfoOutlineReactSvgUrl,
            onClick: this.onShowInfoPanel,
          };
      case "copy":
        if (!this.isAvailableOption("copy")) return null;
        else
          return {
            id: "menu-copy",
            label: t("Common:Copy"),
            onClick: () => setCopyPanelVisible(true),
            iconUrl: CopyToReactSvgUrl,
          };

      case "create-room":
        if (!this.isAvailableOption("create-room")) return null;
        else
          return {
            id: "menu-create-room",
            label: t("Files:CreateRoom"),
            onClick: this.onClickCreateRoom,
            iconUrl: CatalogRoomsReactSvgUrl,
          };

      case "download":
        if (!this.isAvailableOption("download")) return null;
        else
          return {
            id: "menu-download",
            label: t("Common:Download"),
            onClick: () =>
              this.downloadAction(t("Translations:ArchivingData")).catch(
                (err) => toastr.error(err),
              ),
            iconUrl: DownloadReactSvgUrl,
          };

      case "downloadAs":
        if (!this.isAvailableOption("downloadAs")) return null;
        else
          return {
            id: "menu-download-as",
            label: t("Translations:DownloadAs"),
            onClick: () => setDownloadDialogVisible(true),
            iconUrl: DownloadAsReactSvgUrl,
          };

      case "moveTo":
        if (!this.isAvailableOption("moveTo")) return null;
        else
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
        else
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
        else
          return {
            id: "menu-unarchive",
            key: "unarchive",
            label: t("Common:Restore"),
            iconUrl: MoveReactSvgUrl,
            onClick: () => this.archiveRooms("unarchive"),
            disabled: false,
          };
      case "delete-room":
        if (!this.isAvailableOption("delete-room")) return null;
        else
          return {
            id: "menu-delete-room",
            label: t("Common:Delete"),
            onClick: () => this.deleteRooms(t),
            iconUrl: DeleteReactSvgUrl,
          };

      case "delete":
        if (!this.isAvailableOption("delete")) return null;
        else
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

                this.deleteAction(translations).catch((err) =>
                  toastr.error(err),
                );
              }
            },
            iconUrl: DeleteReactSvgUrl,
          };
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

    itemsCollection.set(pinName, pin).set("archive", archive);
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

    itemsCollection

      .set("download", download)
      .set("downloadAs", downloadAs)
      .set("copy", copy)
      .set("showInfo", showInfo);

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
      isRecentFolder,
      isRecycleBinFolder,
      isPrivacyFolder,
      isShareFolder,
      isRoomsFolder,
      isArchiveFolder,
    } = this.treeFoldersStore;

    let itemsCollection = new Map();

    if (isRecycleBinFolder)
      return this.getRecycleBinFolderOptions(itemsCollection, t);

    if (isFavoritesFolder)
      return this.getFavoritesFolderOptions(itemsCollection, t);

    if (isPrivacyFolder) return this.getPrivacyFolderOption(itemsCollection, t);

    if (isShareFolder) return this.getShareFolderOptions(itemsCollection, t);

    if (isRecentFolder) return this.getRecentFolderOptions(itemsCollection, t);

    if (isArchiveFolder)
      return this.getArchiveRoomsFolderOptions(itemsCollection, t);

    if (isRoomsFolder) return this.getRoomsFolderOptions(itemsCollection, t);

    return this.getAnotherFolderOptions(itemsCollection, t);
  };

  onMarkAsRead = (item) => this.markAsRead([], [`${item.id}`], item);

  openFileAction = (item, t) => {
    const { openDocEditor, isPrivacyFolder, setSelection } = this.filesStore;
    const { currentDeviceType } = this.settingsStore;
    const { fileItemsList } = this.pluginStore;
    const { enablePlugins } = this.settingsStore;

    const { isLoading, setIsSectionFilterLoading } = this.clientLoadingStore;
    const { isRecycleBinFolder, isRecentTab } = this.treeFoldersStore;
    const { setMediaViewerData } = this.mediaViewerDataStore;
    const { setConvertDialogVisible, setConvertItem } = this.dialogsStore;

    const { roomType, title: currentTitle } = this.selectedFolderStore;

    if (this.publicRoomStore.isPublicRoom && item.isFolder) {
      setSelection([]);
      return this.moveToPublicRoom(item.id);
    }

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    const isMediaOrImage =
      item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;
    const canConvert =
      item.viewAccessibility?.MustConvert && item.security?.Convert;
    const canWebEdit = item.viewAccessibility?.WebEdit;
    const canViewedDocs = item.viewAccessibility?.WebView;

    const {
      id,
      viewUrl,
      providerKey,
      fileStatus,
      encrypted,
      isFolder,
      webUrl,
    } = item;
    if (encrypted && isPrivacyFolder) return checkProtocol(item.id, true);

    if (isRecycleBinFolder || isLoading) return;

    if (isFolder) {
      const { isRoom, rootFolderType, title, roomType: itemRoomType } = item;

      setIsLoading(true);

      const path = getCategoryUrl(
        getCategoryTypeByFolderType(rootFolderType, id),
        id,
      );

      const filter = FilesFilter.getDefault();
      filter.folder = id;

      const state = {
        title,
        isRoot: false,
        rootFolderType,
        isRoom,
        rootRoomTitle: !!roomType ? currentTitle : "",
        isPublicRoomType: itemRoomType === RoomsType.PublicRoom || false,
      };

      setSelection([]);

      window.DocSpace.navigate(`${path}?${filter.toUrlParams()}`, { state });
    } else {
      if (canConvert) {
        setConvertItem({ ...item, isOpen: true });
        setConvertDialogVisible(true);
        return;
      }

      if ((fileStatus & FileStatus.IsNew) === FileStatus.IsNew)
        this.onMarkAsRead(item);

      if (canWebEdit || canViewedDocs) {
        let tab =
          !this.settingsStore.isDesktopClient &&
          window.DocSpaceConfig?.editor?.openOnNewPage &&
          !isFolder
            ? window.open(
                combineUrl(
                  window.DocSpaceConfig?.proxy?.url,
                  config.homepage,
                  `/doceditor?fileId=${id}`,
                ),
                "_blank",
              )
            : null;

        const isPreview = item.isForm
          ? !item.security.FillForms
          : !item.security.Edit;

        const shareWebUrl = new URL(webUrl);
        const shareKey = isRecentTab
          ? getObjectByLocation(shareWebUrl)?.share
          : "";

        return openDocEditor(id, providerKey, tab, null, isPreview, shareKey);
      }

      if (isMediaOrImage) {
        setMediaViewerData({ visible: true, id });

        const url = combineUrl(MEDIA_VIEW_URL, id);

        if (this.publicRoomStore.isPublicRoom) return;

        window.DocSpace.navigate(url);
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

  onClickBack = () => {
    const { roomType, ...rest } = this.selectedFolderStore;
    const { setSelectedNode } = this.treeFoldersStore;
    const { clearFiles, setBufferSelection } = this.filesStore;
    const { clearInsideGroup, insideGroupBackUrl } =
      this.peopleStore.groupsStore;

    setBufferSelection(null);

    const categoryType = getCategoryType(window.DocSpace.location);

    const isRoom = !!roomType;

    const urlFilter = getObjectByLocation(window.DocSpace.location);

    const isArchivedRoom = !!(CategoryType.Archive && urlFilter?.folder);

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

    if (
      categoryType === CategoryType.Personal ||
      categoryType === CategoryType.Trash
    ) {
      return this.backToParentFolder();
    }

    if (categoryType === CategoryType.Settings) {
      clearFiles();

      const path = getCategoryUrl(CategoryType.Settings);

      setSelectedNode(["common"]);

      return window.DocSpace.navigate(path, { replace: true });
    }

    if (categoryType === CategoryType.Accounts) {
      if (insideGroupBackUrl) {
        window.DocSpace.navigate(insideGroupBackUrl);
        clearInsideGroup();
        return;
      }
      const accountsFilter = AccountsFilter.getDefault();
      const params = accountsFilter.toUrlParams();
      const path = getCategoryUrl(CategoryType.Accounts);

      clearFiles();

      setSelectedNode(["accounts", "people", "filter"]);

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
          this.selectedFolderStore?.navigationPath[
            this.selectedFolderStore?.navigationPath?.length - 1
          ]?.title) ||
        "",
      isRoot: true,
      isPublicRoomType: false,
      rootFolderType: this.selectedFolderStore.rootFolderType,
    };

    if (categoryType == CategoryType.Archive) {
      filter.searchArea = RoomSearchArea.Archive;
    }

    window.DocSpace.navigate(`${path}?${filter.toUrlParams()}`, {
      state,
      replace: true,
    });
  };

  moveToPublicRoom = (folderId) => {
    const { navigationPath, rootFolderType } = this.selectedFolderStore;
    const { publicRoomKey } = this.publicRoomStore;
    const { setIsSectionFilterLoading } = this.clientLoadingStore;

    const id = folderId ? folderId : this.selectedFolderStore.parentId;
    const path = getCategoryUrl(CategoryType.PublicRoom);
    const filter = FilesFilter.getDefault();
    filter.folder = id;

    const state = {
      title: navigationPath[0]?.title || "",
      isRoot: navigationPath.length === 1,
      rootFolderType: rootFolderType,
    };

    setIsSectionFilterLoading(true);
    window.DocSpace.navigate(
      `${path}?key=${publicRoomKey}&${filter.toUrlParams()}`,
      { state },
    );
  };

  backToParentFolder = () => {
    if (this.publicRoomStore.isPublicRoom) return this.moveToPublicRoom();

    const id = this.selectedFolderStore.parentId;

    const { navigationPath, rootFolderType } = this.selectedFolderStore;

    const filter = FilesFilter.getDefault();

    filter.folder = id;

    const categoryType = getCategoryType(window.DocSpace.location);
    const path = getCategoryUrl(categoryType, id);

    const isRoot = navigationPath.length === 1;

    const state = {
      title: (navigationPath && navigationPath[0]?.title) || "",
      isRoom: navigationPath[0]?.isRoom,
      isRoot,
      rootFolderType: rootFolderType,
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
    let fileIds = [];
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

        const title = !!folders.length ? folders[0].title : files[0].title;
        this.setSelectedItems(title, total);
      } catch (err) {
        toastr.error(err);
      }
    }

    !oneFolder &&
      selections.map((item) => {
        if (item.fileExst || item.contentLength) fileIds.push(item.id);
        else folderIds.push(item.id);
      });

    !oneFolder && this.setSelectedItems(selections[0].title, selections.length);
    this.filesStore.setSelection([]);
    this.filesStore.setBufferSelection(null);

    const operationData = {
      destFolderId,
      folderIds: folderIds,
      fileIds,
      deleteAfter: false,
      isCopy: true,
      translations: {
        copy: t("Common:CopyOperation"),
      },
      content: oneFolder,
    };

    this.uploadDataStore.itemOperationToFolder(operationData);
  };

  onLeaveRoom = (t, isOwner = false) => {
    const {
      updateRoomMemberRole,
      removeFiles,
      folders,
      setFolders,
      selection,
      bufferSelection,
    } = this.filesStore;
    const { user } = this.userStore;

    const roomId = selection.length
      ? selection[0].id
      : bufferSelection
        ? bufferSelection.id
        : this.selectedFolderStore.id;

    const isAdmin = user.isOwner || user.isAdmin;
    const isRoot = this.selectedFolderStore.isRootFolder;

    return updateRoomMemberRole(roomId, {
      invitations: [{ id: user?.id, access: ShareAccessRights.None }],
    }).then(() => {
      if (!isAdmin) {
        if (!isRoot) {
          const filter = RoomsFilter.getDefault();
          window.DocSpace.navigate(
            `rooms/shared/filter?${filter.toUrlParams()}`,
          );
        } else {
          removeFiles(null, [roomId]);
        }
      } else {
        if (!isRoot) {
          this.selectedFolderStore.setInRoom(false);
        } else {
          const newFolders = folders;
          const folderIndex = newFolders.findIndex((r) => r.id === roomId);
          if (folderIndex > -1) {
            newFolders[folderIndex].inRoom = false;
            setFolders(newFolders);
          }
        }
      }

      isOwner
        ? toastr.success(t("Files:LeftAndAppointNewOwner"))
        : toastr.success(t("Files:YouLeftTheRoom"));
    });
  };

  changeRoomOwner = (t, userId, isLeaveChecked = false) => {
    const { setRoomOwner, setFolder, setSelected, selection, bufferSelection } =
      this.filesStore;
    const { isRootFolder, setCreatedBy, id, setInRoom } =
      this.selectedFolderStore;

    const roomId = selection.length
      ? selection[0].id
      : bufferSelection
        ? bufferSelection.id
        : id;

    return setRoomOwner(userId, [roomId])
      .then(async (res) => {
        if (isRootFolder) {
          setFolder(res[0]);
        } else {
          setCreatedBy(res[0].createdBy);

          const isMe = userId === this.userStore.user.id;
          if (isMe) setInRoom(true);
        }

        if (isLeaveChecked) await this.onLeaveRoom(t);
        else toastr.success(t("Files:AppointNewOwner"));
      })
      .finally(() => {
        setSelected("none");
      });
  };

  removeFilesFromRecent = async (fileIds) => {
    const { refreshFiles } = this.filesStore;

    await deleteFilesFromRecent(fileIds);
    await refreshFiles();
  };
}

export default FilesActionStore;
