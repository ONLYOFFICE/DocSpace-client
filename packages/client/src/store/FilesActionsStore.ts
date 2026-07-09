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
import { loadRoomMemberKeysSafe } from "@docspace/shared/services/private-room/room-member-keys";
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
import { TIMEOUT } from "SRC_DIR/helpers/filesConstants";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { isDesktop, isLockedSharedRoom } from "@docspace/shared/utils";
import { getUserFilter } from "@docspace/shared/utils/userFilterUtils";
import {
  isFile as isFileCheck,
  isFolder as isFolderCheck,
} from "@docspace/shared/utils/typeGuards";

import {
  FILTER_ARCHIVE_DOCUMENTS,
  FILTER_ROOM_DOCUMENTS,
} from "@docspace/shared/utils/filterConstants";

import {
  downloadAndDecryptFile,
  downloadAndDecryptFileToBuffer,
  createZipFromBuffers,
  deduplicateFileNames,
  triggerFileDownload,
} from "@docspace/shared/services/private-room/encrypted-download";
import {
  decryptEncryptedItemToFile,
  addCopySuffix,
  tagFileForCopy,
} from "@docspace/shared/services/private-room/encrypted-copy";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import { forgetEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";

import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import { getSectionTrashTarget } from "SRC_DIR/helpers/articleNavigation";
import { muteRoomNotification } from "@docspace/shared/api/settings";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import UsersFilter from "@docspace/shared/api/people/filter";
import GroupsFilter from "@docspace/shared/api/groups/filter";
import {
  frameCallEvent,
  getConvertedSize,
  getObjectByLocation,
  getCategoryType,
  splitFileAndFolderIds,
} from "@docspace/shared/utils/common";
import uniqueid from "lodash/uniqueId";
import FilesFilter from "@docspace/shared/api/files/filter";
import { createLoader } from "@docspace/shared/utils/createLoader";

import { openingNewTab } from "@docspace/shared/utils/openingNewTab";
import SocketHelper, { SocketCommands } from "@docspace/ui-kit/utils/socket";
import {
  getEmptyPersonalProgress,
  startEmptyPersonal,
} from "@docspace/shared/api/people";
import api from "@docspace/shared/api";
import { showSuccessExportRoomIndexToast } from "SRC_DIR/helpers/toast-helpers";
import { getContactsView } from "SRC_DIR/helpers/contacts";
import { createFolderNavigation } from "SRC_DIR/helpers/createFolderNavigation";
import { hideInfoPanel } from "SRC_DIR/helpers/info-panel";

import { OPERATIONS_NAME, CategoryType } from "@docspace/shared/constants";
import { FileOperationStatus } from "@docspace/shared/enums";

import type { Nullable, TTranslation } from "@docspace/shared/types";
import type { TFileConvertId } from "@docspace/shared/dialogs/download-dialog/DownloadDialog.types";
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
import type { TExportRoomIndexTask } from "@docspace/shared/api/rooms/types";
import type { TRoom, TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import type { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";

import i18n from "../i18n";
import FilesHeaderOptionStore from "./FilesHeaderOptionStore";
import { isAIAgents } from "SRC_DIR/helpers/plugins/utils";
import {
  SECTION_ROOT_FOLDER_TYPES,
  changeCustomFilter as changeCustomFilterHelper,
  checkExportRoomIndexProgress,
  convertToArray,
  convertToTree,
  nameWithoutExtension as nameWithoutExtensionHelper,
  setPinAction as setPinActionHelper,
} from "./filesActionsStore/helpers";
import type { TTreeNode, TUploadTreeFile } from "./filesActionsStore/helpers";

import {
  isAvailableOptionImpl,
  getOptionImpl,
  getRecycleBinFolderOptionsImpl,
  getFavoritesFolderOptionsImpl,
  getPrivacyFolderOptionImpl,
  getShareFolderOptionsImpl,
  getRecentFolderOptionsImpl,
  getArchiveRoomsFolderOptionsImpl,
  getRoomsFolderOptionsImpl,
  getTemplatesFolderOptionsImpl,
  getAIAgentsFolderOptionsImpl,
  getAnotherFolderOptionsImpl,
  getHeaderMenuImpl,
} from "./filesActionsStore/menu.helpers";
import {
  setListOrderImpl,
  setFilesOrderImpl,
  revokeFilesOrderImpl,
  changeIndexImpl,
  saveIndexOfFilesImpl,
  reorderIndexOfFilesImpl,
  checkPreviousExportRoomIndexInProgressImpl,
  loopExportRoomIndexStatusCheckingImpl,
  onSuccessExportRoomIndexImpl,
  exportRoomIndexImpl,
} from "./filesActionsStore/indexing.helpers";
import type UploadDataStore from "./UploadDataStore";
import type TreeFoldersStore from "./TreeFoldersStore";
import type SelectedFolderStore from "./SelectedFolderStore";
import type FilesSettingsStore from "./FilesSettingsStore";
import type DialogsStore from "./DialogsStore";
import type MediaViewerDataStore from "./MediaViewerDataStore";
import type AccessRightsStore from "./AccessRightsStore";
import type ClientLoadingStore from "./ClientLoadingStore";
import type PublicRoomStore from "./PublicRoomStore";
import type PluginStore from "./PluginStore";
import type PeopleStore from "./contacts/PeopleStore";
import type IndexingStore from "./IndexingStore";
import type VersionHistoryStore from "./VersionHistoryStore";
import type AiRoomStore from "./AiRoomStore";

export type TOperationName = (typeof OPERATIONS_NAME)[keyof typeof OPERATIONS_NAME];

export type TItemSecurity = Partial<TFileSecurity & TFolderSecurity & TRoomSecurity>;

export type TActionItem = {
  id: number;
  title: string;
  security?: TItemSecurity;
  viewAccessibility?: TFileViewAccessibility;
  fileExst?: string;
  contentLength?: string | null;
  contentType?: string;
  folderId?: number;
  parentId?: number;
  toFolderId?: number;
  parentTitle?: string;
  toFolderTitle?: string;
  parentType?: FolderType;
  rootFolderId?: number;
  rootFolderType?: FolderType;
  originRoomId?: number | string;
  roomType?: RoomsType;
  providerKey?: string;
  isFolder?: boolean;
  isRoom?: boolean;
  isAIAgent?: boolean;
  isTemplate?: boolean;
  encrypted?: boolean;
  external?: boolean;
  isLinkExpired?: boolean;
  requestToken?: string;
  customFilterEnabled?: boolean;
  pinned?: boolean;
  new?: number;
  order?: string;
  fileStatus?: FileStatus;
  isPDFForm?: boolean;
  startFilling?: boolean;
  quotaLimit?: number;
  usedSpace?: number;
  shared?: boolean;
  viewUrl?: string;
  webUrl?: string;
};

export type TDeleteTranslations = { deleteFromTrash: string };
export type TSuccessTranslations = { successOperation: string };
export type TDownloadTranslations = {
  label?: string;
  error?: string;
  passwordError?: string;
};
export type TRemoveTranslations = {
  successRemoveTemplate?: string;
  successRemoveRoom?: string;
  successRemoveRooms?: string;
};

export type TEmptyPersonalProgress = {
  error?: unknown;
  percentage?: number;
  isCompleted?: boolean;
};

export type TCategoryType = (typeof CategoryType)[keyof typeof CategoryType];

export type TPluginFileItem = NonNullable<
  PluginStore["fileItemsList"]
>[number]["value"];

export type THeaderMenuOption = ReturnType<FilesHeaderOptionStore["getOption"]>;

export type TItemsCollection = Map<string, THeaderMenuOption | object>;

// the operation payload forwarded to
// UploadDataStore.itemOperationToFolder; folderTitle/isAI are extra fields
// carried along for still-.js consumers (ConflictResolveDialog reads them
// from dialogsStore).
export type TOperationDataPayload = {
  destFolderId: number | string | null | undefined;
  destFolderInfo?: TFolder;
  folderIds: number[];
  fileIds: number[];
  deleteAfter: boolean;
  isCopy?: boolean;
  content?: boolean;
  isAI?: boolean;
  title?: string;
  folderTitle?: string;
  itemsCount?: number;
  isFolder?: boolean;
};

type TFilesStore = {
  files: TActionItem[];
  folders: TActionItem[];
  filesList: TActionItem[];
  selection: TActionItem[];
  bufferSelection: Nullable<TActionItem>;
  selectionTitle: string | null;
  activeFiles: { id: number | string }[];
  activeFolders: { id: number | string }[];
  roomsForDelete: TActionItem[];
  filter: FilesFilter;
  roomsFilter: RoomsFilter;
  categoryType: number;
  hasSelection: boolean;
  allFilesIsEditing: boolean;
  canConvertSelected: boolean;
  hasRoomsToChangeQuota: boolean;
  hasRoomsToDisableQuota: boolean;
  hasRoomsToResetQuota: boolean;
  hasAIAgentsToChangeQuota: boolean;
  hasAIAgentsToDisableQuota: boolean;
  hasAIAgentsToResetQuota: boolean;
  fetchFiles: (
    folderId: number | string | null,
    filter: FilesFilter,
    clearFilter?: boolean,
    withSubfolders?: boolean,
    clearSelection?: boolean | null,
  ) => Promise<unknown>;
  fetchRooms: (
    folderId: number | string | null,
    filter: RoomsFilter,
    withSubfolders?: unknown,
    clearFilter?: unknown,
    withFilterLocalStorage?: unknown,
  ) => Promise<unknown>;
  fetchAgents: (
    folderId: number | string | null,
    filter: RoomsFilter,
    withSubfolders?: boolean,
    clearFilter?: boolean,
  ) => Promise<unknown>;
  fetchFavoritesFolder: (folderId: number | string) => Promise<unknown>;
  scrollToTop: () => void;
  setSelected: (selected: string, clearBuffer?: boolean) => void;
  setSelection: (selection: TActionItem[]) => void;
  setBufferSelection: (bufferSelection: Nullable<TActionItem>) => void;
  setHotkeyCaret: (caret: Nullable<TActionItem>) => void;
  setHotkeyCaretStart: (caretStart: Nullable<TActionItem>) => void;
  setEnabledHotkeys: (enabledHotkeys: boolean) => void;
  selectFile: (file: TActionItem) => void;
  deselectFile: (file: TActionItem) => void;
  addActiveItems: (
    files?: (number | string)[] | null,
    folders?: (number | string)[] | null,
    destFolderId?: number | string | null,
  ) => void;
  setActiveFiles: (
    activeFiles: (number | string)[],
    destFolderId?: number | string,
  ) => void;
  getIsEmptyTrash: () => Promise<unknown>;
  removeFiles: (
    fileIds?: (number | string)[] | null,
    folderIds?: (number | string)[] | null,
    showToast?: (() => void) | null,
    destFolderId?: number | string | null,
  ) => void;
  setFile: (file: TFile) => void;
  setFolder: (folder: TFolder) => void;
  setFiles: (files: TActionItem[]) => void;
  setFolders: (folders: TActionItem[]) => void;
  getFileIndex: (id: number | string) => number;
  updateFileStatus: (index: number, status: number) => void;
  updateRoomMute: (index: number, status: boolean) => void;
  updateFileVectorizationStatus: (
    fileId: number | string,
    status: VectorizationStatus,
  ) => void;
  getFolderInfo: (id: number | string) => Promise<unknown>;
  getFileInfo: (id: number | string) => Promise<unknown>;
  getPrimaryLink: (
    roomId: number | string,
  ) => Promise<{ sharedTo?: { requestToken?: string } } | undefined>;
  openDocEditor: (
    id: number | string,
    preview?: boolean,
    shareKey?: string | null,
    editForm?: boolean,
  ) => unknown;
  setCustomRoomQuota: (
    ids: (number | string)[],
    quota: number,
  ) => Promise<unknown>;
  setCustomAIAgentQuota: (
    ids: (number | string)[],
    quota: number,
  ) => Promise<unknown>;
  resetRoomQuota: (ids: (number | string)[]) => Promise<unknown>;
  resetAIAgentQuota: (ids: (number | string)[]) => Promise<unknown>;
  setInRoomFolder: (roomId: number | string, inRoom: boolean) => void;
  refreshFiles: () => Promise<unknown>;
  clearFiles: () => void;
};

class FilesActionStore {
  settingsStore: SettingsStore;

  uploadDataStore: UploadDataStore;

  treeFoldersStore: TreeFoldersStore;

  filesStore: TFilesStore;

  selectedFolderStore: SelectedFolderStore;

  filesSettingsStore: FilesSettingsStore;

  dialogsStore: DialogsStore;

  mediaViewerDataStore: MediaViewerDataStore;

  accessRightsStore: AccessRightsStore;

  clientLoadingStore: ClientLoadingStore;

  publicRoomStore: PublicRoomStore;

  peopleStore: PeopleStore;

  indexingStore: IndexingStore;

  versionHistoryStore: VersionHistoryStore;

  aiRoomStore: AiRoomStore;

  filesHeaderOptionStore: FilesHeaderOptionStore;

  // unlike the other stores, pluginStore had no class-field
  // declaration in the old JS (it was created by the constructor assignment
  // after makeAutoObservable, so it is not observable). `declare` keeps that
  // runtime shape.
  declare pluginStore: PluginStore;

  // the next three fields are initialized to null before the
  // constructor always assigns them; typed as the assigned store (with an
  // erased cast on the initializer) so the many unguarded accesses below
  // keep the exact old JS behavior.
  userStore: UserStore = null as unknown as UserStore;

  currentTariffStatusStore: CurrentTariffStatusStore =
    null as unknown as CurrentTariffStatusStore;

  currentQuotaStore: CurrentQuotasStore = null as unknown as CurrentQuotasStore;

  isLoadedSearchFiles = false;

  isGroupMenuBlocked = false;

  emptyTrashInProgress = false;

  emptyPersonalRoomInProgress = false;

  processCreatingRoomFromData = false;

  alreadyExportingRoomIndex = false;

  constructor(
    settingsStore: SettingsStore,
    uploadDataStore: UploadDataStore,
    treeFoldersStore: TreeFoldersStore,
    filesStore: TFilesStore,
    selectedFolderStore: SelectedFolderStore,
    filesSettingsStore: FilesSettingsStore,
    dialogsStore: DialogsStore,
    mediaViewerDataStore: MediaViewerDataStore,
    accessRightsStore: AccessRightsStore,
    clientLoadingStore: ClientLoadingStore,
    publicRoomStore: PublicRoomStore,
    pluginStore: PluginStore,
    userStore: UserStore,
    currentTariffStatusStore: CurrentTariffStatusStore,
    peopleStore: PeopleStore,
    currentQuotaStore: CurrentQuotasStore,
    indexingStore: IndexingStore,
    versionHistoryStore: VersionHistoryStore,
    aiRoomStore: AiRoomStore,
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
    this.userStore = userStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.peopleStore = peopleStore;
    this.currentQuotaStore = currentQuotaStore;
    this.indexingStore = indexingStore;
    this.versionHistoryStore = versionHistoryStore;
    this.aiRoomStore = aiRoomStore;

    this.filesHeaderOptionStore = new FilesHeaderOptionStore(
      this,
      this.filesStore as unknown as ConstructorParameters<
        typeof FilesHeaderOptionStore
      >[1],
      this.dialogsStore as ConstructorParameters<
        typeof FilesHeaderOptionStore
      >[2],
      this.currentQuotaStore,
    );
  }

  updateCurrentFolder = async (
    clearSelection?: boolean | null,
    operationId?: string,
    // some callers (onLeaveRoom, reorderIndexOfFiles) omit
    // `operation`; the old JS forwarded undefined into the progress-bar
    // payload, the cast below keeps that behavior.
    operation?: TOperationName,
    skipFetch = false,
  ) => {
    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;

    const {
      fetchFiles,
      fetchRooms,
      fetchAgents,
      filter,
      roomsFilter,
      scrollToTop,
    } = this.filesStore;

    const {
      isRoomsFolder,
      isArchiveFolder,
      isArchiveFolderRoot,
      isTemplatesFolder,
      isAIAgentsFolder,
      isFormsFolder,
    } = this.treeFoldersStore;

    let newFilter: undefined;

    let updatedFolder = this.selectedFolderStore.id;

    if (this.dialogsStore.isFolderActions) {
      updatedFolder = this.selectedFolderStore.parentId;
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
      this.dialogsStore.setIsFolderActions(false);

      setSecondaryProgressBarData({
        operation: operation as TOperationName,
        completed: true,
        operationId,
      });
    }
  };

  createFolderTree = async (
    treeList: TTreeNode[],
    parentFolderId: number | string,
    filesList: TUploadTreeFile[],
  ): Promise<TTreeNode[] | undefined> => {
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

      await this.createFolderTree(treeNode.children, parentId, filesList);
    }

    return treeList;
  };

  createFoldersTree = async (
    t: TTranslation,
    files: TUploadTreeFile[] | Record<string, TUploadTreeFile>,
    folderId?: number | string | null,
    dragged?: boolean,
  ) => {
    //  console.log("createFoldersTree", files, folderId);
    const { uploaded, percent } = this.uploadDataStore;

    const { isAIAgentsFolderRoot } = this.treeFoldersStore;
    const { setPrimaryProgressBarData } =
      this.uploadDataStore.primaryProgressDataStore;

    const roomFolder =
      this.selectedFolderStore.navigationPath.find((r) => r.isRoom) ??
      this.selectedFolderStore.getSelectedFolder();

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

    const toFolderId = folderId || this.selectedFolderStore.id;

    if (withoutHiddenFiles.length) {
      setPrimaryProgressBarData({ ...pbData, disableUploadPanelOpen: true });
    }

    const tree = convertToTree(withoutHiddenFiles);

    const filesList: TUploadTreeFile[] = [];
    await this.createFolderTree(tree, toFolderId as number | string, filesList);

    if (withoutHiddenFiles.length) {
      setPrimaryProgressBarData({ ...pbData, completed: uploaded });
    }

    if (filesList.length) {
      setPrimaryProgressBarData({ ...pbData });
    }

    return filesList;
  };

  updateFilesAfterDelete = (operationId: string, operationName: TOperationName) => {
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
  };

  deleteAction = async (
    translations: Nullable<TDeleteTranslations>,
    newSelection: Nullable<TActionItem[]> = null,
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
    const { setSecondaryProgressBarData } = secondaryProgressDataStore;

    let selection =
      newSelection ||
      (this.filesStore.selection.length
        ? this.filesStore.selection
        : bufferSelection
          ? [bufferSelection]
          : []);

    selection = selection.filter((item) => item?.security?.Delete);

    //  const isThirdPartyFile = selection.some((f) => f.providerKey);

    const currentFolderId = this.selectedFolderStore.id;

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
        destFolderInfo: this.treeFoldersStore.trashFolderInfo,
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
        this.setGroupMenuBlocked(true);
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

            await this.uploadDataStore.loopFilesOperations(data, pbData);

            const showToast = () => {
              if (isRecycleBinFolder) {
                // `translations` may be null when called from
                // runOperations; the old JS would throw here in that case
                // (trash-only path), the `!` keeps that behavior.
                return toastr.success(translations!.deleteFromTrash);
              }
            };

            if (this.dialogsStore.isFolderActions) {
              this.updateCurrentFolder(false, operationId, operationName, true);
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
              fileIds.forEach((id) => forgetEncryptedFilename(id));
            }

            if (currentFolderId) {
              SocketHelper?.emit(
                SocketCommands.RefreshFolder,
                currentFolderId as string,
              );
            }

            if (fileIds.length) {
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
        this.setGroupMenuBlocked(false);
      }
    }
  };

  askAIAction = (item: TActionItem) => {
    this.dialogsStore.setAiAgentSelectorDialogProps(
      true,
      item as unknown as TFile,
    );
  };

  emptyTrash = async (translations: TSuccessTranslations) => {
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
        const result = res[0];

        if (result?.error) return Promise.reject(result.error);
        const data = result ?? null;

        await loopFilesOperations(data, pbData);
        toastr.success(translations.successOperation);
        this.updateCurrentFolder(null, pbData.operationId, pbData.operation);
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
      this.emptyTrashInProgress = false;
    }
  };

  emptyPersonalRoom = async (translations: TSuccessTranslations) => {
    const { secondaryProgressDataStore, clearActiveOperations } =
      this.uploadDataStore;
    const { setSecondaryProgressBarData } = secondaryProgressDataStore;

    const { addActiveItems, files, folders } = this.filesStore;
    const { fetchTreeFolders } = this.treeFoldersStore;

    const fileIds = files.map((f) => f.id);
    const folderIds = folders.map((f) => f.id);

    addActiveItems(fileIds, folderIds);

    const operationId = uniqueid("operation_");

    this.emptyPersonalRoomInProgress = true;

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
      this.emptyPersonalRoomInProgress = false;
    }
  };

  emptyArchive = async (translations: TSuccessTranslations) => {
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
        const result = res[0];

        if (result?.error) return Promise.reject(result.error);
        const data = result ?? null;

        await loopFilesOperations(data, pbData);
        toastr.success(translations.successOperation);
        this.updateCurrentFolder(null, pbData.operationId, pbData.operation);
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

  downloadFiles = async (
    fileConvertIds: (number | TFileConvertId)[],
    folderIds: number[],
    // downloadAction forwards its `label` string here as
    // `translations`; destructuring a string yields undefined for both keys,
    // exactly as the old JS did.
    translations: TDownloadTranslations | string,
  ) => {
    const { clearActiveOperations, secondaryProgressDataStore } =
      this.uploadDataStore;

    const { setSecondaryProgressBarData } = secondaryProgressDataStore;
    const { openUrl } = this.settingsStore;

    const { addActiveItems } = this.filesStore;
    const { label, passwordError } = translations as TDownloadTranslations;
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
      operationIds: [...fileConvertIds, ...folderIds] as (string | number)[],
    });

    const fileIds = fileConvertIds.map(
      (f) => (f as TFileConvertId).key || (f as number),
    );
    addActiveItems(fileIds, folderIds);

    const shareKey = this.publicRoomStore.publicRoomKey;

    try {
      // the shared downloadFiles declares shareKey as a
      // required string, but it is null outside of public rooms (the old JS
      // passed null; the API helper only appends it when truthy).
      await downloadFiles(
        fileConvertIds as TFileConvertId[],
        folderIds,
        shareKey as string,
      ).then(
        async (res) => {
          const result = res[0];

          if (result?.error) return Promise.reject(result.error);
          const data = result ?? null;

          if (!data) {
            return Promise.reject();
          }
          const pbData = {
            operation: operationName,
            label,
            operationId,
          };

          const item =
            data?.finished && data?.url
              ? data
              : await this.uploadDataStore.loopFilesOperations(data, pbData);

          clearActiveOperations(fileIds, folderIds);
          setDownloadItems([]);

          const isCanceled = item?.status === FileOperationStatus.Canceled;

          // loopFilesOperations may resolve to undefined; the
          // old JS crashed here in that case, the `!` keeps that behavior.
          if (item!.url) {
            openUrl(item!.url, UrlActionType.Download, true);

            if (fileConvertIds.length) {
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                event: AnalyticsEvents.FileDownloaded,
                fileIds: fileConvertIds.map(
                  (f) => (f as TFileConvertId).key ?? (f as number),
                ),
              });
            }
          }

          if (!isCanceled) {
            setSecondaryProgressBarData({
              operation: operationName,
              alert: !item!.url,
              completed: true,
              operationId,
            });

            !item!.url &&
              toastr.error(
                (translations as TDownloadTranslations).error,
                null,
                0,
                true,
              );
          }
        },
      );
    } catch (err) {
      clearActiveOperations(fileIds, folderIds);

      const isCanceled =
        (err as TOperation)?.status === FileOperationStatus.Canceled;

      if (!isCanceled) {
        setSecondaryProgressBarData({
          operation: operationName,
          alert: true,
          completed: true,
          operationId,
        });
        const error =
          typeof err === "string" ? err : (err as { error?: string })?.error;

        if (error?.includes("password")) {
          const filesIds = error.match(/\d+/g)?.map(Number) ?? [
            (fileConvertIds[0] as TFileConvertId).key,
          ];

          const passwordArray: typeof downloadItems = [];

          downloadItems.forEach((item) => {
            filesIds.forEach((id) => {
              if (item.id === id) {
                passwordArray.push(item);
              }
            });
          });

          toastr.error(passwordError, null, 0, true);
          setSortedPasswordFiles({ other: [...passwordArray] });
          setDownloadDialogVisible(true);
          return;
        }
        setDownloadItems([]);

        return toastr.error(err as string, null, 0, true);
      }
    }
  };

  downloadAction = async (label: string, item?: Nullable<TActionItem>) => {
    const { bufferSelection } = this.filesStore;
    const { openUrl } = this.settingsStore;
    const { id, isFolder } = this.selectedFolderStore;

    const downloadAsArchive = id === item?.id && isFolder === item?.isFolder;

    // with no selection at all the old JS crashed on
    // `null.length` below; the erased cast keeps that behavior.
    const selection = (
      item
        ? [item]
        : this.filesStore.selection.length
          ? this.filesStore.selection
          : bufferSelection
            ? [bufferSelection]
            : null
    ) as TActionItem[];

    if (!selection.length) return;

    const fileIds: number[] = [];
    const folderIds: number[] = [];
    const items: { id: number; fileExst?: string }[] = [];

    if (selection.length === 1 && selection[0].fileExst && !downloadAsArchive) {
      const file = selection[0];

      if (file.encrypted) {
        return this.downloadEncryptedFile(file);
      }

      openUrl(file.viewUrl!, UrlActionType.Download);
      return Promise.resolve();
    }

    const encryptedFiles: TActionItem[] = [];

    selection.forEach((elem) => {
      if (!elem.fileExst && elem.isFolder) {
        folderIds.push(elem.id);
        items.push({ id: elem.id });
      } else if (elem.encrypted) {
        encryptedFiles.push(elem);
      } else {
        fileIds.push(elem.id);
        items.push({ id: elem.id, fileExst: elem.fileExst });
      }
    });

    this.setGroupMenuBlocked(true);

    const promises = [];

    if (encryptedFiles.length > 0) {
      promises.push(this.downloadEncryptedFilesAsZip(encryptedFiles));
    }

    if (fileIds.length > 0 || folderIds.length > 0) {
      promises.push(this.downloadFiles(fileIds, folderIds, label));
    }

    return Promise.all(promises).finally(() => this.setGroupMenuBlocked(false));
  };

  resolveRoomIdForFile = (file?: Nullable<TActionItem>) => {
    if (file?.originRoomId) return file.originRoomId;
    const navRoom = this.selectedFolderStore.navigationPath?.find(
      (r) => r.isRoom,
    );
    if (navRoom?.id) return navRoom.id;
    if (this.selectedFolderStore.isRoom) return this.selectedFolderStore.id;
    return null;
  };

  downloadEncryptedFile = async (file: TActionItem) => {
    const { encryptionKeys, user } = this.userStore;

    if (!encryptionKeys || encryptionKeys.length === 0) {
      toastr.error(i18n.t("Common:EncryptionKeysNotConfigured"));
      return Promise.resolve();
    }

    const userId = user?.id;
    if (!userId) {
      return Promise.resolve();
    }

    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;
    const operationId = uniqueid("operation_");

    try {
      const encryptionInfo = await getFileEncryptionAccess(file.id);

      if (!encryptionInfo || !encryptionInfo.fileKeys) {
        return Promise.resolve();
      }
      const hasOwnEntry = encryptionInfo.fileKeys.some(
        (k) => String(k.userId) === String(userId),
      );
      if (!hasOwnEntry) {
        return Promise.resolve();
      }

      const identity = await requireUnlock(String(userId));
      if (!identity) {
        return Promise.resolve();
      }

      const roomId = this.resolveRoomIdForFile(file);
      const roomMemberKeys = await loadRoomMemberKeysSafe(roomId);

      setSecondaryProgressBarData({
        operation: OPERATIONS_NAME.download,
        percent: 0,
        operationId,
      });

      // viewUrl is optional on the .js view-model; the old JS
      // passed it through unchecked (fetch would fail at runtime), the `!`
      // keeps that behavior.
      const result = await downloadAndDecryptFile({
        downloadUrl: file.viewUrl!,
        fileId: file.id,
        fileKeys: encryptionInfo.fileKeys,
        roomMemberKeys,
        userId: String(userId),
        identity,
        originalFileName: file.title,
        originalFileType: file.contentType || "application/octet-stream",
        onDownloadProgress: (progress) => {
          setSecondaryProgressBarData({
            operation: OPERATIONS_NAME.download,
            percent: Math.floor(progress * 70),
            label: i18n.t("Files:Downloading"),
            operationId,
          });
        },
        onProgress: (progress) => {
          setSecondaryProgressBarData({
            operation: OPERATIONS_NAME.download,
            percent: 70 + Math.floor(progress * 30),
            label: i18n.t("Files:Decrypting"),
            operationId,
          });
        },
      });

      setSecondaryProgressBarData({
        operation: OPERATIONS_NAME.download,
        percent: 100,
        completed: true,
        alert: !result.success,
        operationId,
      });

      if (result.success && result.file) {
        triggerFileDownload(result.file);
      } else {
        if (result.error) {
          console.error("[ENCRYPTION] downloadEncryptedFile:", result.error);
        }
        toastr.error(i18n.t("Common:EncryptionDownloadFailed"));
      }
    } catch (error) {
      setSecondaryProgressBarData({
        operation: OPERATIONS_NAME.download,
        percent: 100,
        completed: true,
        alert: true,
        operationId,
      });

      console.error("[ENCRYPTION] downloadEncryptedFile threw:", error);
      toastr.error(i18n.t("Common:EncryptionDownloadFailed"));
    }

    return Promise.resolve();
  };

  downloadEncryptedFilesAsZip = async (encryptedFiles: TActionItem[]) => {
    const { encryptionKeys, user } = this.userStore;

    if (!encryptionKeys || encryptionKeys.length === 0) {
      toastr.error(i18n.t("Common:EncryptionKeysNotConfigured"));
      return;
    }

    const userId = user?.id;
    if (!userId) return;

    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;
    const operationId = uniqueid("operation_");

    try {
      const identity = await requireUnlock(String(userId));
      if (!identity) {
        return;
      }

      const fileNames = deduplicateFileNames(
        encryptedFiles.map((f) => f.title),
      );
      const totalFiles = encryptedFiles.length;
      const results: { name: string; data: Uint8Array }[] = [];
      const failures: string[] = [];
      const roomMemberKeysCache = new Map<
        string,
        Awaited<ReturnType<typeof loadRoomMemberKeysSafe>>
      >();

      setSecondaryProgressBarData({
        operation: OPERATIONS_NAME.download,
        percent: 0,
        operationId,
      });

      for (let i = 0; i < totalFiles; i++) {
        const file = encryptedFiles[i];
        const fileName = fileNames[i];
        const fileShare = 100 / totalFiles;
        const fileBase = fileShare * i;

        try {
          setSecondaryProgressBarData({
            operation: OPERATIONS_NAME.download,
            percent: Math.floor(fileBase),
            label: `${i18n.t("Files:Downloading")} (${i + 1}/${totalFiles})`,
            operationId,
          });

          const encryptionInfo = await getFileEncryptionAccess(file.id);

          if (!encryptionInfo?.fileKeys) {
            failures.push(fileName);
            continue;
          }

          const hasOwnEntry = encryptionInfo.fileKeys.some(
            (k) => String(k.userId) === String(userId),
          );
          if (!hasOwnEntry) {
            failures.push(fileName);
            continue;
          }

          const roomId = this.resolveRoomIdForFile(file);
          let roomMemberKeys = roomMemberKeysCache.get(String(roomId));
          if (!roomMemberKeys) {
            roomMemberKeys = await loadRoomMemberKeysSafe(roomId);
            roomMemberKeysCache.set(String(roomId), roomMemberKeys);
          }

          // viewUrl is optional on the .js view-model; the
          // old JS passed it through unchecked, the `!` keeps that behavior.
          const result = await downloadAndDecryptFileToBuffer({
            downloadUrl: file.viewUrl!,
            fileId: file.id,
            fileKeys: encryptionInfo.fileKeys,
            roomMemberKeys,
            userId: String(userId),
            identity,
            originalFileName: fileName,
            originalFileType: file.contentType || "application/octet-stream",
            onDownloadProgress: (progress) => {
              setSecondaryProgressBarData({
                operation: OPERATIONS_NAME.download,
                percent: Math.floor(fileBase + progress * fileShare * 0.6),
                label: `${i18n.t("Files:Downloading")} (${i + 1}/${totalFiles})`,
                operationId,
              });
            },
            onProgress: (progress) => {
              setSecondaryProgressBarData({
                operation: OPERATIONS_NAME.download,
                percent: Math.floor(
                  fileBase + fileShare * 0.6 + progress * fileShare * 0.3,
                ),
                label: `${i18n.t("Files:Decrypting")} (${i + 1}/${totalFiles})`,
                operationId,
              });
            },
          });

          if (result.success && result.data) {
            results.push({ name: result.fileName, data: result.data });
          } else {
            failures.push(fileName);
          }
        } catch {
          failures.push(fileName);
        }
      }

      if (results.length === 0) {
        setSecondaryProgressBarData({
          operation: OPERATIONS_NAME.download,
          percent: 100,
          completed: true,
          alert: true,
          operationId,
        });
        toastr.error(i18n.t("Files:DecryptAllFailed"));
        return;
      }

      setSecondaryProgressBarData({
        operation: OPERATIONS_NAME.download,
        percent: 95,
        label: i18n.t("Files:CompressingFiles"),
        operationId,
      });

      const zipData = createZipFromBuffers(results);
      const zipBlob = new Blob([zipData as unknown as BlobPart], {
        type: "application/zip",
      });

      triggerFileDownload(zipBlob, "Files.zip");

      setSecondaryProgressBarData({
        operation: OPERATIONS_NAME.download,
        percent: 100,
        completed: true,
        alert: failures.length > 0,
        operationId,
      });

      if (failures.length > 0) {
        toastr.warning(
          i18n.t("Files:DecryptPartialFailed", {
            fileNames: failures.join(", "),
          }),
          null,
          0,
          true,
        );
      }
    } catch (error) {
      setSecondaryProgressBarData({
        operation: OPERATIONS_NAME.download,
        percent: 100,
        completed: true,
        alert: true,
        operationId,
      });

      console.error("[ENCRYPTION] downloadEncryptedFilesAsZip threw:", error);
      toastr.error(i18n.t("Common:EncryptionDownloadFailed"));
    }
  };

  completeAction = async (
    selectedItem: { id: number; isFolder?: boolean },
    type?: FileAction,
  ) => {
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
      case FileAction.RestoreVersion:
        this.onSelectItem(
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

  onSelectItem = (
    { id, isFolder }: { id?: number; isFolder?: boolean },
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
    } = this.filesStore;

    if (!id) return;

    const item = this.filesStore.filesList.find(
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
    itemId: number | number[],
    itemTitle: string,
    translations?: Nullable<TRemoveTranslations>,
    isFile?: boolean | null,
    isThirdParty?: boolean | string | null,
    isRoom?: boolean | null,
  ) => {
    const { secondaryProgressDataStore } = this.uploadDataStore;
    const { setSecondaryProgressBarData } = secondaryProgressDataStore;
    if (
      this.filesSettingsStore.confirmDelete ||
      this.treeFoldersStore.isPrivacyFolder ||
      isThirdParty ||
      isRoom
    ) {
      this.dialogsStore.setIsRoomDelete(isRoom as boolean);
      this.dialogsStore.setDeleteDialogVisible(true);
    } else {
      const operationId = uniqueid("operation_");
      const operationName = OPERATIONS_NAME.trash;

      setSecondaryProgressBarData({
        operation: operationName,
        percent: 0,
        operationId,
        title: itemTitle,
        destFolderInfo: this.treeFoldersStore.trashFolderInfo,
        itemsCount: 1,
        isFolder: !isFile,
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
          error: err as string,
        });
      }
    }
  };

  deleteItemOperation = (
    isFile: boolean | null | undefined,
    itemId: number | number[],
    translations: Nullable<TRemoveTranslations> | undefined,
    isRoom: boolean | null | undefined,
    operationId: string,
    operation: TOperationName,
  ) => {
    const { addActiveItems, getIsEmptyTrash } = this.filesStore;
    const { isRecycleBinFolder, recycleBinFolderId } = this.treeFoldersStore;
    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;

    const destFolderId = isRecycleBinFolder ? null : recycleBinFolderId;

    if (isFile) {
      const fileParentId = this.filesStore.files.find(
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

        await this.uploadDataStore.loopFilesOperations(data, {
          operationId,
          operation,
        });

        this.updateFilesAfterDelete(operationId, operation);
        this.filesStore.removeFiles([itemId as number], null, null, destFolderId);
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
      const roomParentId = this.filesStore.folders.find(
        (x) => x.id === items[0],
      )?.parentId;
      addActiveItems(null, items);

      this.setGroupMenuBlocked(true);
      return removeFiles(items, [], false, true)
        .then(async (res) => {
          const result = res[0];

          if (result?.error) return Promise.reject(result.error);
          const data = result ?? null;
          await this.uploadDataStore.loopFilesOperations(data, {
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

          const { rootFolderType } = this.selectedFolderStore;
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

          const currentFolderId = this.selectedFolderStore.id;
          if (items.includes(currentFolderId as number)) {
            if (isAgentDeletion) {
              this.moveToAIAgentsPage();
            } else {
              this.moveToRoomsPage();
            }
          }
        })
        .finally(() => {
          this.setGroupMenuBlocked(false);
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
      await this.uploadDataStore.loopFilesOperations(data, {
        operationId,
        operation,
      });

      this.updateFilesAfterDelete(operationId, operation);
      this.filesStore.removeFiles(null, [itemId as number], null, destFolderId);

      window.dispatchEvent(
        new CustomEvent("folder_deleted", {
          detail: { id: itemId },
        }),
      );

      getIsEmptyTrash();
    });
  };

  lockFileAction = async (id: number, locked: boolean) => {
    const { setFile } = this.filesStore;
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

  finalizeVersionAction = async (id: number) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const { setFile } = this.filesStore;
    try {
      timer = setTimeout(() => {
        this.filesStore.setActiveFiles([id]);
      }, 200);
      await (finalizeVersion(id, 0, false) as Promise<TFile[] | undefined>).then(
        (res) => {
          if (res && res[0]) {
            setFile(res[0]);
            this.filesStore.setActiveFiles([]);
          }
        },
      );
    } catch (err) {
      toastr.error(err as string);
    } finally {
      clearTimeout(timer!);
    }
  };

  changeCustomFilter = async (item: TActionItem, t: TTranslation) => {
    return changeCustomFilterHelper(item, t);
  };

  duplicateAction = async (item: TActionItem) => {
    if (item.fileExst && item.encrypted) {
      return this.duplicateEncryptedFile(item);
    }

    if (!item.fileExst && this.treeFoldersStore.isPrivacyFolder) {
      return;
    }

    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;
    const { clearActiveOperations } = this.uploadDataStore;
    const selectedFolder = this.selectedFolderStore.getSelectedFolder();

    this.setSelectedItems();

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

    this.filesStore.addActiveItems(fileIds, folderIds);

    return duplicate(folderIds, fileIds)
      .then(async (res) => {
        const result = res[0];

        if (result?.error) return Promise.reject(result.error);

        const pbData = { operation: operationName, operationId };
        const data = result ?? null;

        if (!data) {
          return Promise.reject();
        }

        const operationData = await this.uploadDataStore.loopFilesOperations(
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
        this.setGroupMenuBlocked(false);
      });
  };

  duplicateEncryptedFile = async (item: TActionItem) => {
    return this.copyEncryptedFilesToFolder([item], item.folderId, {
      private: true,
      rootFolderId: this.selectedFolderStore.rootFolderId,
      roomType: this.selectedFolderStore.roomType ?? RoomsType.CustomRoom,
    });
  };

  copyEncryptedFilesToFolder = async (
    items: TActionItem[],
    destFolderId: number | string | undefined,
    destInfo?: {
      private?: boolean;
      rootFolderId?: number | string;
      roomType?: Nullable<RoomsType>;
    },
  ) => {
    const { user, encryptionKeys } = this.userStore;

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
      destInfo?.rootFolderId === this.selectedFolderStore.rootFolderId;

    const destContext = {
      roomType: destInfo?.roomType ?? RoomsType.CustomRoom,
      isPrivate: !!sameRoomRoot,
    };

    const filesToUpload: ReturnType<typeof tagFileForCopy>[] = [];
    const failed: string[] = [];

    for (const item of items) {
      try {
        const sourceRoomId = this.resolveRoomIdForFile(item);
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
      this.uploadDataStore.startUpload(
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

  getItemsInfo = (items: TActionItem[]) => {
    const requests = items
      .map((item) => {
        if (isFolderCheck(item)) {
          return this.filesStore.getFolderInfo(item.id);
        }
        if (isFileCheck(item)) {
          return this.filesStore.getFileInfo(item.id);
        }
        return null;
      })
      .filter(Boolean);

    return Promise.all(requests);
  };

  setFavoriteAction = (action: string, items: TActionItem[]) => {
    const { fetchFavoritesFolder, setSelected } = this.filesStore;
    const { fileIds, folderIds } = splitFileAndFolderIds(
      items as unknown as TFile[],
    );

    switch (action) {
      case "mark":
        return api.files
          .markAsFavorite(fileIds as number[], folderIds as number[])
          .then(() => this.getItemsInfo(items))
          .then(() => setSelected("close"));

      case "remove":
        return api.files
          .removeFromFavorite(fileIds as number[], folderIds as number[])
          .then(() => {
            return this.treeFoldersStore.isFavoritesFolder
              ? fetchFavoritesFolder(this.selectedFolderStore.id as number)
              : this.getItemsInfo(items);
          })
          .then(() => setSelected("close"));
      default:
    }
  };

  setPinAction = async (
    action: string,
    id: number | number[],
    t: TTranslation,
    isAIAgent = false,
  ) => {
    return setPinActionHelper(action, id, t, isAIAgent);
  };

  setMuteAction = (action: string, item: TActionItem, t: TTranslation) => {
    const { id, new: newCount, rootFolderId, isAIAgent } = item;
    const { treeFolders } = this.treeFoldersStore;
    const { folders, updateRoomMute } = this.filesStore;

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

  setArchiveAction = async (
    action: string,
    folders: TActionItem | TActionItem[],
    t: TTranslation,
  ) => {
    const { addActiveItems, setSelected } = this.filesStore;

    const { archiveRoomsId, myRoomsId } = this.treeFoldersStore;

    const { secondaryProgressDataStore, clearActiveOperations } =
      this.uploadDataStore;

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
        this.setGroupMenuBlocked(true);
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
              await this.uploadDataStore.loopFilesOperations(data, pbData);

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

            this.dialogsStore.setIsFolderActions(false);

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
              !this.dialogsStore.archiveDialogVisible &&
              !this.dialogsStore.restoreRoomDialogVisible;
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
            this.setGroupMenuBlocked(false);
          });
      case "unarchive":
        this.setGroupMenuBlocked(true);
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

            await this.uploadDataStore.loopFilesOperations(data, pbData);

            this.dialogsStore.setIsFolderActions(false);

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
          .then(() => this.moveToRoomsPage())
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
            this.setGroupMenuBlocked(false);
          });
      default:
    }
  };

  selectTag = (tag: {
    label: string;
    roomType?: number;
    providerType?: number;
  }) => {
    const { roomsFilter } = this.filesStore;

    const { setIsSectionBodyLoading } = this.clientLoadingStore;

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
      `${pathName}?${newFilter.toUrlParams(this.userStore?.user?.id)}`,
    );
  };

  selectOption = ({ option, value }: { option: string; value: string }) => {
    const { roomsFilter } = this.filesStore;

    const { setIsSectionBodyLoading } = this.clientLoadingStore;

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

  selectRowAction = (checked: boolean, file: TActionItem) => {
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

  openLocationAction = async (item: {
    id: number | string;
    isRoom?: boolean;
    isTemplate?: boolean;
    isAIAgent?: boolean;
    title?: string;
    rootFolderType?: FolderType;
  }) => {
    if (this.publicRoomStore.isPublicRoom)
      return this.moveToPublicRoom(item.id);

    const { id, isRoom, isTemplate, isAIAgent, title, rootFolderType } = item;

    const categoryType = isAIAgent
      ? CategoryType.Chat
      : getCategoryTypeByFolderType(rootFolderType, id);

    const state = { title, rootFolderType, isRoot: false, isRoom };
    const filter = FilesFilter.getDefault();

    // FilesFilter.folder is declared as a string but the old
    // JS assigns raw numeric ids; toUrlParams only serializes it.
    filter.folder = id as string;

    if (!isAIAgent && (isRoom || isTemplate)) {
      if (this.userStore.user?.id) {
        const key =
          categoryType === CategoryType.Archive
            ? `${FILTER_ARCHIVE_DOCUMENTS}=${this.userStore.user?.id}`
            : `${FILTER_ROOM_DOCUMENTS}=${this.userStore.user?.id}`;

        const filterSharedRoomObj = getUserFilter(key);

        filter.sortBy = filterSharedRoomObj.sortBy;
        filter.sortOrder = filterSharedRoomObj.sortOrder;
      }
    }

    const url = getCategoryUrl(categoryType, id);

    window.DocSpace.navigate(`${url}?${filter.toUrlParams()}`, { state });
  };

  nameWithoutExtension = (title?: string) => {
    return nameWithoutExtensionHelper(title);
  };

  // history feeds pass partial view-models here (old JS
  // duck typing).
  checkAndOpenLocationAction = async (
    item: Partial<Omit<TActionItem, "id">> & { id?: number | string },
  ) => {
    const {
      myRoomsId,
      myFolderId,
      archiveRoomsId,
      recycleBinFolderId,
      sharedWithMeFolderId,
    } = this.treeFoldersStore;
    const { setIsSectionBodyLoading } = this.clientLoadingStore;
    const { rootFolderType } = this.selectedFolderStore;

    const setIsLoading = (param: boolean) => {
      setIsSectionBodyLoading(param);
    };

    const { title, fileExst, rootFolderType: rootFolderTypeItem } = item;
    const parentId =
      item.parentId || item.toFolderId || item.folderId || recycleBinFolderId;
    const parentTitle = item.parentTitle || item.toFolderTitle;

    const isTrashDestination =
      parentId === recycleBinFolderId || item.parentType === FolderType.TRASH;

    const isRoot = [
      myRoomsId,
      myFolderId,
      archiveRoomsId,
      recycleBinFolderId,
      sharedWithMeFolderId,
    ].includes(parentId);

    const state = {
      title: parentTitle,
      isRoot,
      fileExst,
      highlightFileId: item.id,
      isFileHasExst: !item.fileExst,
      rootFolderType,
    };

    const newFilter = FilesFilter.getDefault();

    // FilesFilter.folder is declared as a string but the old
    // JS assigns raw numeric ids; toUrlParams only serializes it.
    newFilter.search = title as string;
    newFilter.folder = parentId as unknown as string;

    let url;
    if (isTrashDestination) {
      const trashTarget = getSectionTrashTarget(
        window.DocSpace.location.pathname,
      );
      // FilesFilter.folderType is a narrower literal union
      // than the article-navigation targets; the value is only serialized.
      newFilter.folderType =
        trashTarget.folderType as unknown as typeof newFilter.folderType;
      url = trashTarget.path;
    } else {
      const destinationFolderType = SECTION_ROOT_FOLDER_TYPES.includes(
        item.parentType as FolderType,
      )
        ? item.parentType
        : (rootFolderTypeItem ?? rootFolderType);

      let categoryType: TCategoryType = getCategoryTypeByFolderType(
        destinationFolderType,
        parentId,
      );

      if (
        window.DocSpace.location.pathname.startsWith("/forms") &&
        categoryType === CategoryType.SharedRoom
      ) {
        categoryType = CategoryType.Form;
      }

      url = getCategoryUrl(categoryType, parentId);
    }

    setIsLoading(
      window.DocSpace.location.search !== `?${newFilter.toUrlParams()}` ||
        url !== window.DocSpace.location.pathname,
    );

    if (!isDesktop()) hideInfoPanel();

    window.DocSpace.navigate(`${url}?${newFilter.toUrlParams()}`, { state });
  };

  setThirdpartyInfo = (providerKey?: string) => {
    const { setConnectDialogVisible, setConnectItem } = this.dialogsStore;
    const { providers, capabilities } = this.filesSettingsStore.thirdPartyStore;
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

  markAsRead = (
    folderIds: (number | string)[],
    // NewFilesBadge calls this with folderIds only; the old
    // JS forwarded undefined to the API payload.
    fileIds?: (number | string)[],
    item?: TActionItem,
  ) => {
    const { setSecondaryProgressBarData } =
      this.uploadDataStore.secondaryProgressDataStore;

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

        await this.uploadDataStore.loopFilesOperations(data, pbData);
      })
      .then(() => {
        if (!item) return;

        // this.setNewBadgeCount(item);
        const { getFileIndex, updateFileStatus } = this.filesStore;

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

  moveDragItems = (
    destFolderId: number | string,
    folderTitle: string,
    destFolderInfo: TFolder & {
      private?: boolean;
      rootFolderId?: number | string;
    },
  ) => {
    const sourceInPrivateRoom = this.treeFoldersStore.isPrivacyFolder;
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
      const { bufferSelection: dragBufferSelection } = this.filesStore;
      const dragSelection = (
        dragBufferSelection ? [dragBufferSelection] : this.filesStore.selection
      ).filter((el) => !el.isFolder || el.id !== destFolderId);

      const files = dragSelection.filter((el) => !el.isFolder);
      const hasFolders = dragSelection.some((el) => el.isFolder);

      if (hasFolders) {
        toastr.error(i18n.t("Common:CannotTransferFolderFromPrivateRoom"));
      }

      if (files.length > 0) {
        this.copyEncryptedFilesToFolder(files, destFolderId, {
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

    const { bufferSelection } = this.filesStore;
    const { isRootFolder } = this.selectedFolderStore;

    let selection = bufferSelection
      ? [bufferSelection]
      : this.filesStore.selection;

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
    this.checkOperationConflict(operationData);
  };

  checkFileConflicts = (
    destFolderId: number | string | null | undefined,
    folderIds: number[],
    fileIds: number[],
  ) => {
    this.filesStore.addActiveItems(fileIds, null, destFolderId);
    this.filesStore.addActiveItems(null, folderIds, destFolderId);
    return checkFileConflicts(destFolderId as number | string, folderIds, fileIds);
  };

  setConflictDialogData = (
    conflicts: (TFile | TFolder)[],
    operationData: TOperationDataPayload,
  ) => {
    this.dialogsStore.setConflictResolveDialogItems(conflicts);
    // TConflictResolveDialogData in DialogsStore is a
    // structural type of what the still-.js dialog reads; this payload is a
    // superset of it.
    this.dialogsStore.setConflictResolveDialogData(
      operationData as unknown as Parameters<
        DialogsStore["setConflictResolveDialogData"]
      >[0],
    );
    this.dialogsStore.setConflictResolveDialogVisible(true);
  };

  setSelectedItems = (title?: string, length?: number) => {
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

  checkOperationConflict = async (operationData: TOperationDataPayload) => {
    const { destFolderId, folderIds, fileIds } = operationData;
    const { setBufferSelection } = this.filesStore;

    this.setSelectedItems();

    this.filesStore.setSelected("none");
    let conflicts: (TFile | TFolder)[];

    try {
      conflicts = await this.checkFileConflicts(
        destFolderId,
        folderIds,
        fileIds,
      );
    } catch (err) {
      setBufferSelection(null);
      return toastr.error((err as Error).message ? (err as Error).message : (err as string));
    }

    if (conflicts.length) {
      this.setConflictDialogData(conflicts, operationData);
    } else {
      try {
        await this.uploadDataStore.itemOperationToFolder(operationData);
      } catch (err) {
        console.error(err);
        setBufferSelection(null);
      }
    }
  };

  isAvailableOption = (option: string)=> isAvailableOptionImpl(this, option);

  pinRooms = (t: TTranslation) => {
    const { selection } = this.filesStore;

    const items: number[] = [];

    const isAIAgent = selection.some((s) => s.isAIAgent);

    selection.forEach((item) => {
      if (!item.pinned) items.push(item.id);
    });

    this.setPinAction("pin", items, t, isAIAgent);
  };

  unpinRooms = (t: TTranslation) => {
    const { selection } = this.filesStore;

    const items: number[] = [];

    const isAIAgent = selection.some((s) => s.isAIAgent);

    selection.forEach((item) => {
      if (item.pinned) items.push(item.id);
    });

    this.setPinAction("unpin", items, t, isAIAgent);
  };

  archiveRooms = (action: string) => {
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

  deleteRooms = (t: TTranslation) => {
    const { selection } = this.filesStore;

    const items: number[] = [];

    selection.forEach((item) => {
      items.push(item.id);
    });

    const translations = {
      successRemoveRoom: t("Common:RoomRemoved"),
      successRemoveRooms: t("Common:RoomsRemoved"),
    };

    this.deleteItemAction(items, "", translations, null, null, true);
  };

  deleteRoomsAction = async (
    itemId: number | number[],
    translations?: Nullable<TRemoveTranslations>,
  ) => {
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

      return toastr.error((err as Error).message ? (err as Error).message : (err as string), null, 0, true);
    } finally {
      this.setGroupMenuBlocked(false);
      setTimeout(() => clearActiveOperations(null, id), TIMEOUT);
    }
  };

  setProcessCreatingRoomFromData = (processCreatingRoomFromData: boolean) => {
    this.processCreatingRoomFromData = processCreatingRoomFromData;
  };

  onClickCreateRoom = (item?: TActionItem, context = "sidebar") => {
    this.setProcessCreatingRoomFromData(true);
    const event = new CustomEvent(Events.ROOM_CREATE, {
      detail: { parentId: this.selectedFolderStore.id, context },
    });
    if (item && item.isFolder) {
      // the still-.js GlobalEvents component reads this extra
      // field off the dispatched CustomEvent.
      (event as CustomEvent & { title?: string }).title = item.title;
    }
    window.dispatchEvent(event);
  };

  changeRoomQuota = (
    items: (TActionItem | number)[],
    successCallback?: (...args: unknown[]) => unknown,
    abortCallback?: (...args: unknown[]) => unknown,
  ) => {
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

  changeAIAgentsQuota = (
    items: (TActionItem | number)[],
    successCallback?: (...args: unknown[]) => unknown,
    abortCallback?: (...args: unknown[]) => unknown,
  ) => {
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

  disableRoomQuota = async (items: (TActionItem | number)[], t: TTranslation) => {
    const { setCustomRoomQuota } = this.filesStore;

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

  disableAIAgentQuota = async (
    items: (TActionItem | number)[],
    t: TTranslation,
  ) => {
    const { setCustomAIAgentQuota } = this.filesStore;

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

  resetRoomQuota = async (items: (TActionItem | number)[], t: TTranslation) => {
    const { resetRoomQuota } = this.filesStore;

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

  resetAIAgentQuota = async (
    items: (TActionItem | number)[],
    t: TTranslation,
  ) => {
    const { resetAIAgentQuota } = this.filesStore;

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

  getOption = (option: string, t: TTranslation)=> getOptionImpl(this, option, t);

  getRoomsFolderOptions = (itemsCollection: TItemsCollection, t: TTranslation)=> getRoomsFolderOptionsImpl(this, itemsCollection, t);

  getAIAgentsFolderOptions = (itemsCollection: TItemsCollection, t: TTranslation)=> getAIAgentsFolderOptionsImpl(this, itemsCollection, t);

  getArchiveRoomsFolderOptions = (itemsCollection: TItemsCollection, t: TTranslation)=> getArchiveRoomsFolderOptionsImpl(this, itemsCollection, t);

  getTemplatesFolderOptions = (itemsCollection: TItemsCollection, t: TTranslation)=> getTemplatesFolderOptionsImpl(this, itemsCollection, t);

  getAnotherFolderOptions = (itemsCollection: TItemsCollection, t: TTranslation)=> getAnotherFolderOptionsImpl(this, itemsCollection, t);

  getRecentFolderOptions = (itemsCollection: TItemsCollection, t: TTranslation)=> getRecentFolderOptionsImpl(this, itemsCollection, t);

  getShareFolderOptions = (itemsCollection: TItemsCollection, t: TTranslation)=> getShareFolderOptionsImpl(this, itemsCollection, t);

  getPrivacyFolderOption = (itemsCollection: TItemsCollection, t: TTranslation)=> getPrivacyFolderOptionImpl(this, itemsCollection, t);

  getFavoritesFolderOptions = (itemsCollection: TItemsCollection, t: TTranslation)=> getFavoritesFolderOptionsImpl(this, itemsCollection, t);

  getRecycleBinFolderOptions = (itemsCollection: TItemsCollection, t: TTranslation)=> getRecycleBinFolderOptionsImpl(this, itemsCollection, t);

  getHeaderMenu = (t: TTranslation)=> getHeaderMenuImpl(this, t);

  onMarkAsRead = (item: TActionItem) => this.markAsRead([], [`${item.id}`], item);

  isExpiredLinkAsync = async (item: TActionItem, withLoader = false) => {
    if (item.isLinkExpired) return true;
    if (!item.external || !item.requestToken) return false;

    const { clearActiveOperations } = this.uploadDataStore;
    const { addActiveItems } = this.filesStore;

    const { endLoader, startLoader } = createLoader();

    try {
      if (withLoader)
        startLoader(() =>
          runInAction(() => {
            this.setGroupMenuBlocked(true);
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
          ? this.filesStore.files
          : this.filesStore.folders;

        const foundItem = items.find((i) => i.id === item.id);

        if (foundItem && !foundItem.isLinkExpired) {
          foundItem.isLinkExpired = true;
        }

        const { selection, bufferSelection } = this.filesStore;

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
            this.setGroupMenuBlocked(false);
            clearActiveOperations([], [item.id]);
          }),
        );
    }
  };

  openFileAction = async (
    item: TActionItem,
    t: TTranslation,
    e?: Parameters<typeof openingNewTab>[1],
  ) => {
    if (
      item.external &&
      (item.isLinkExpired || (await this.isExpiredLinkAsync(item, true)))
    ) {
      const isFile = isFileCheck(item);
      const isFolder = isFolderCheck(item);

      const description = isFile
        ? t("Common:FileLinkExpired")
        : isFolder
          ? t("Common:FolderLinkExpired")
          : t("Common:RoomLinkExpired");

      const title = isFile
        ? t("Common:FileNotAvailable")
        : isFolder
          ? t("Common:FolderNotAvailable")
          : t("Common:RoomNotAvailable");

      return toastr.error(description, title);
    }

    if (isLockedSharedRoom(item as unknown as TRoom))
      return this.dialogsStore.setPasswordEntryDialog(
        true,
        item as unknown as TRoom,
      );

    this.openItemAction(item, t, e);
  };

  openItemAction = async (
    item: TActionItem,
    // NewFilesBadge/history callers invoke this with the item
    // only; the old JS crashed on t() in the restricted-download branch.
    t?: TTranslation,
    e?: Parameters<typeof openingNewTab>[1],
  ) => {
    const { openDocEditor, setSelection, categoryType } = this.filesStore;
    const { currentDeviceType, frameConfig, isFrame } = this.settingsStore;
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

    const setIsLoading = (param: boolean) => {
      setIsSectionBodyLoading(param);
    };

    const isMediaOrImage =
      item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;
    const canConvert =
      item.viewAccessibility?.MustConvert && item.security?.Convert;
    const canWebEdit = item.viewAccessibility?.WebEdit;
    const canViewedDocs = item.viewAccessibility?.WebView;

    const { id, viewUrl, fileStatus, isFolder, webUrl, isRoom } = item;
    if (isRecycleBinFolder || isLoading) return;

    if (isFolder || isRoom) {
      const { url, state } = await createFolderNavigation(
        item,
        categoryType,
        this.userStore.user?.id,
        roomType,
        currentTitle,
      );

      if (openingNewTab(url, e)) return;

      setIsLoading(true);
      setSelection([]);

      window.DocSpace.navigate(url, { state });
    } else {
      if (isFrame && frameConfig?.events?.onFileManagerClick) {
        frameCallEvent({ event: "onFileManagerClick", data: item });
        return;
      }

      if (!isAIAgents() && fileItemsList && enablePlugins) {
        // TS cannot track the assignment inside the forEach
        // callback; the erased casts keep the old unchecked reads.
        let currPluginItem: Nullable<TPluginFileItem> = null;

        fileItemsList.forEach((i) => {
          if (i.key === item.fileExst) currPluginItem = i.value;
        });

        if (currPluginItem) {
          const correctDevice = (currPluginItem as TPluginFileItem).devices
            ? (
                (currPluginItem as TPluginFileItem).devices as unknown as string[]
              ).includes(currentDeviceType)
            : true;
          if (correctDevice)
            return (currPluginItem as TPluginFileItem).onClick(
              item as unknown as TFile,
            );
        }
      }

      if (canConvert) {
        setConvertItem({ ...item, isOpen: true });
        setConvertDialogData({
          files: item,
        });
        setConvertDialogVisible(true);
        return;
      }

      if (((fileStatus as number) & FileStatus.IsNew) === FileStatus.IsNew)
        await this.onMarkAsRead(item);

      if (canWebEdit || canViewedDocs) {
        let shareKey = item.requestToken;

        if (webUrl) {
          const shareWebUrl = new URL(webUrl);
          // getObjectByLocation expects a router Location but
          // only reads `.search`, which URL also provides (old JS behavior).
          shareKey = getObjectByLocation(
            shareWebUrl as unknown as Parameters<typeof getObjectByLocation>[0],
          )?.share as string | undefined;
        }

        const isPDF = item.fileExst === ".pdf";

        const { isPersonalRoom } = this.treeFoldersStore;

        const canEditForm = isPersonalRoom
          ? item.isPDFForm
          : isPDF &&
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

      if (!item.security!.Download) {
        toastr.error(t!("Files:FileDownloadingIsRestricted"));
        return;
      }

      if (item.encrypted) {
        return this.downloadEncryptedFile(item).catch((err) =>
          toastr.error(err as string),
        );
      }

      return window.open(viewUrl, "_self");
    }
  };

  closeMediaViewerAndRestoreUrl = async () => {
    const { getFirstUrl, setMediaViewerData } = this.mediaViewerDataStore;

    setMediaViewerData({ visible: false, id: null });

    try {
      const url = await getFirstUrl();
      if (!url) return;
      window.history.pushState("", "", url);
    } catch (error) {
      console.error(error);
    }
  };

  onClickBack = (fromHotkeys = true) => {
    const { roomType } = this.selectedFolderStore;
    const { setSelectedNode } = this.treeFoldersStore;
    const { clearFiles, setBufferSelection, setSelection } = this.filesStore;
    // groupsStore is created in the PeopleStore constructor
    // but typed as nullable; the old JS destructured it unchecked.
    const { insideGroupBackUrl } = this.peopleStore.groupsStore!;
    const { isLoading, setIsSectionBodyLoading } = this.clientLoadingStore;
    if (isLoading) return;

    if (this.mediaViewerDataStore.visible) {
      return this.closeMediaViewerAndRestoreUrl();
    }

    setBufferSelection(null);
    setSelection([]);

    const categoryType = getCategoryType(window.DocSpace.location);

    const isRoom = !!roomType;

    const urlFilter = getObjectByLocation(
      window.DocSpace.location as unknown as Parameters<
        typeof getObjectByLocation
      >[0],
    );

    const isArchivedRoom = !!(
      CategoryType.Trash !== (categoryType as TCategoryType) && urlFilter?.folder
    );

    if (
      roomType === RoomsType.AIRoom ||
      categoryType === CategoryType.Chat ||
      categoryType === CategoryType.AIAgent ||
      categoryType === CategoryType.AIAgents
    ) {
      return this.moveToAIAgentsPage();
    }

    if (this.publicRoomStore.isPublicRoom) {
      return this.backToParentFolder();
    }

    if (
      categoryType === CategoryType.SharedRoom ||
      categoryType === CategoryType.Form ||
      isArchivedRoom
    ) {
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
        setIsSectionBodyLoading(true, false);

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

        return window.DocSpace.navigate(`accounts/groups/filter?${params}`, {
          replace: true,
        });
      }

      setSelectedNode(["accounts", "people", "filter"]);

      if (fromHotkeys) return;
      return window.DocSpace.navigate(`${path}?${params}`, { replace: true });
    }
  };

  moveToRoomsPage = () => {
    const categoryType = getCategoryType(
      window.DocSpace.location,
    ) as TCategoryType;

    const filter = RoomsFilter.getDefault();

    const correctCategoryType =
      categoryType === CategoryType.SharedRoom ||
      categoryType === CategoryType.Chat
        ? CategoryType.Shared
        : categoryType === CategoryType.Form
          ? CategoryType.Forms
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
      rootFolderType: this.selectedFolderStore.rootFolderType,
    };

    if ((categoryType as TCategoryType) == CategoryType.Archive) {
      filter.searchArea = RoomSearchArea.Archive;
    }

    if (correctCategoryType === CategoryType.Forms) {
      filter.searchArea = RoomSearchArea.Forms;
    }

    if (
      this.selectedFolderStore?.navigationPath &&
      this.selectedFolderStore?.navigationPath.length > 0 &&
      this.selectedFolderStore?.navigationPath[
        this.selectedFolderStore.navigationPath.length - 1
      ]?.isTemplatesFolder
    ) {
      filter.searchArea = RoomSearchArea.Templates;
    }

    if (categoryType === CategoryType.Chat) {
      this.clientLoadingStore.setIsSectionBodyLoading(true, false);
    }

    window.DocSpace.navigate(
      `${path}?${filter.toUrlParams(this.userStore?.user?.id, true)}`,
      {
        state,
        replace: true,
      },
    );
  };

  moveToAIAgentsPage = () => {
    const categoryType = getCategoryType(window.DocSpace.location);

    const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.AIAgents);

    const path = getCategoryUrl(CategoryType.AIAgents);

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

    if (categoryType === CategoryType.Chat) {
      this.clientLoadingStore.setIsSectionBodyLoading(true, false);
    }

    window.DocSpace.navigate(
      `${path}?${filter.toUrlParams(this.userStore?.user?.id, true)}`,
      {
        state,
        replace: true,
      },
    );
  };

  moveToPublicRoom = (folderId?: number | string) => {
    const { navigationPath, rootFolderType } = this.selectedFolderStore;
    const { publicRoomKey } = this.publicRoomStore;

    const id = folderId || this.selectedFolderStore.parentId;
    const path = getCategoryUrl(CategoryType.PublicRoom);
    const filter = FilesFilter.getDefault();
    filter.folder = id as string;

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

    filter.folder = id as unknown as string;

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

  setGroupMenuBlocked = (blocked: boolean) => {
    this.isGroupMenuBlocked = blocked;
  };

  preparingDataForCopyingToRoom = async (
    destFolderId: number | string,
    selections: TActionItem[],
    destFolderInfo?: TFolder | TRoom,
  ) => {
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
          this.filesStore.setSelection([]);
          this.filesStore.setBufferSelection(null);
          return;
        }

        const title = folders.length ? folders[0].title : files[0].title;
        this.setSelectedItems(title, total);
      } catch (err) {
        toastr.error(err as string);
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
      destFolderInfo: destFolderInfo as TFolder,
      folderIds,
      fileIds,
      deleteAfter: false,
      isCopy: true,
      content: oneFolder,
      itemsCount: selections.length,
      ...(selections.length === 1 && { title: selections[0].title }),
    };

    return this.uploadDataStore.itemOperationToFolder(operationData);
  };

  onLeaveRoom = (t: TTranslation, isOwner = false, force = false) => {
    const { selection, setSelected, bufferSelection } = this.filesStore;
    const { user } = this.userStore;

    // the fallback is the selected-folder store snapshot; only
    // id/isAIAgent are read from it, matching the old JS duck typing.
    const room = (
      selection.length
        ? selection[0]
        : bufferSelection
          ? bufferSelection
          : this.selectedFolderStore
    ) as TActionItem;

    const roomId = room.id;
    const isAIAgent = room.isAIAgent;

    // user is nullable on UserStore; the old JS read the
    // flags unchecked (crash when logged out), the `!` keeps that behavior.
    const isAdmin = user!.isOwner || user!.isAdmin;
    const isRoot = this.selectedFolderStore.isRootFolder;

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
            this.filesStore.removeFiles(null, [roomId]);
          }
        } else if (!isRoot) {
          this.selectedFolderStore.setInRoom(false);

          const operationId = uniqueid("operation_");
          this.updateCurrentFolder(null, operationId);
        } else {
          this.filesStore.setInRoomFolder(roomId, false);
        }

        toastr.success(successText);
      })
      .finally(() => {
        setSelected("none");
      });
  };

  changeRoomOwner = (t: TTranslation, userId: string, isLeaveChecked = false) => {
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
          const isMe = userId === this.userStore.user!.id;
          if (isMe) setInRoom(true);
        }

        if (isLeaveChecked) await this.onLeaveRoom(t);
        else toastr.success(t("Common:AppointNewOwner"));
      })
      .catch((e) => toastr.error(e as string))
      .finally(() => {
        setSelected("none");
      });
  };

  onClickRemoveFromRecent = (selection: TActionItem[], t: TTranslation) => {
    const { setSelected } = this.filesStore;
    const ids = selection.map((item) => item.id);
    this.removeFilesFromRecent(ids, t);
    setSelected("none");
  };

  removeFilesFromRecent = async (fileIds: number[], t: TTranslation) => {
    const { refreshFiles } = this.filesStore;

    await deleteFilesFromRecent(fileIds);
    await refreshFiles();
    toastr.success(t("Files:RemovedFromRecent"));
  };

  onCreateRoomFromTemplate = (item: TActionItem, addSelection?: boolean) => {
    const event = new CustomEvent(Events.ROOM_CREATE, {
      detail: { parentId: this.selectedFolderStore.id, context: "template" },
    });
    // the still-.js GlobalEvents component reads this extra
    // field off the dispatched CustomEvent.
    (event as CustomEvent & { item?: TActionItem }).item = item;
    window.dispatchEvent(event);

    if (addSelection) this.filesStore.setBufferSelection(item);
  };

  copyFromTemplateForm = async (fileInfo: TFile) => {
    const selectedItemId = this.selectedFolderStore.id;
    const fileIds = [fileInfo.id];

    const operationData = {
      destFolderId: selectedItemId,
      folderIds: [],
      fileIds,
      deleteAfter: false,
      isCopy: true,
      folderTitle: this.selectedFolderStore.title,
    };

    this.uploadDataStore.secondaryProgressDataStore.setItemsSelectionTitle(
      fileInfo.title,
    );

    const conflicts = await checkFileConflicts(
      selectedItemId as number | string,
      [],
      fileIds,
    );

    if (conflicts.length) {
      return this.setConflictDialogData(conflicts, operationData);
    }

    this.uploadDataStore
      .itemOperationToFolder(operationData)
      .catch((error) => toastr.error(error));
  };

  copyFileToAiKnowledge = async (filesInfo: TActionItem[]) => {
    const selectedItemId = this.aiRoomStore.knowledgeId;
    const fileIds = filesInfo.map((f) => f.id);

    const operationData = {
      destFolderId: selectedItemId,
      folderIds: [],
      fileIds,
      deleteAfter: false,
      isCopy: true,
      isAI: true,
      folderTitle: this.selectedFolderStore.title,
    };

    this.uploadDataStore.secondaryProgressDataStore.setItemsSelectionTitle(
      filesInfo[0].title,
    );

    this.uploadDataStore
      .itemOperationToFolder(operationData)
      .catch((error) => toastr.error(error));
  };

  setListOrder = (
    startIndex: number,
    finalIndex: number,
    indexMovedFromBottom = false,
  )=> setListOrderImpl(this, startIndex, finalIndex, indexMovedFromBottom);

  revokeFilesOrder = ()=> revokeFilesOrderImpl(this);

  setFilesOrder = (
    currentItem: TActionItem,
    replaceableItem: TActionItem,
    indexMovedFromBottom?: boolean,
  )=> setFilesOrderImpl(this, currentItem, replaceableItem, indexMovedFromBottom);

  changeIndex = async (
    action: VDRIndexingAction,
    item: TActionItem,
    t: TTranslation,
    isLastItem = true,
  )=> changeIndexImpl(this, action, item, t, isLastItem);

  saveIndexOfFiles = async (t: TTranslation)=> saveIndexOfFilesImpl(this, t);

  reorderIndexOfFiles = async (id: number, t: TTranslation)=> reorderIndexOfFilesImpl(this, id, t);

  loopExportRoomIndexStatusChecking = async (pbData: {
    operation: TOperationName;
    operationId: string;
  }): Promise<TExportRoomIndexTask>=> loopExportRoomIndexStatusCheckingImpl(this, pbData);

  checkPreviousExportRoomIndexInProgress = async ()=> checkPreviousExportRoomIndexInProgressImpl(this);

  onSuccessExportRoomIndex = (t: TTranslation, fileName: string, fileUrl: string)=> onSuccessExportRoomIndexImpl(this, t, fileName, fileUrl);

  exportRoomIndex = async (t: TTranslation, roomId: number)=> exportRoomIndexImpl(this, t, roomId);

  getPublicKey = async (folder: TActionItem | TFolder) => {
    if (folder.shared) {
      const filterObj = FilesFilter.getFilter(window.location);

      if (filterObj?.key) {
        return filterObj.key;
      }

      try {
        const link = await this.filesStore.getPrimaryLink(folder.id);
        const key = link?.sharedTo?.requestToken;

        return key;
      } catch (error) {
        toastr.error(error as string);
      }
    }

    return null;
  };

  onDeleteVersionFile = async (fileId: number, versions: number[]) => {
    const { secondaryProgressDataStore, clearActiveOperations } =
      this.uploadDataStore;

    const { setSecondaryProgressBarData } = secondaryProgressDataStore;

    const {
      setVersionDeletionProcess,
      setVersionSelectedForDeletion,
      fetchFileVersions,
      isVisible,
    } = this.versionHistoryStore;

    setVersionDeletionProcess(true);

    const operationId = uniqueid("operation_");

    setSecondaryProgressBarData({
      operation: OPERATIONS_NAME.deleteVersionFile,
      operationId,
    });

    this.filesStore.setActiveFiles([fileId]);

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

          await this.uploadDataStore.loopFilesOperations(data, pbData);
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

  runOperations = (operations: string[] = []) => {
    const { files, folders, activeFiles, activeFolders, addActiveItems } =
      this.filesStore;

    const { itemOperationToFolder, clearActiveOperations } =
      this.uploadDataStore;
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

          this.deleteAction(null, filesToProcess)
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

          this.downloadFiles(
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

          this.duplicateAction(fileToDuplicate)
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

          this.emptyTrash(translations)
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

  retryVectorization = async (files: TActionItem[]) => {
    const { updateFileVectorizationStatus } = this.filesStore;

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
}

export default FilesActionStore;

