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
  downloadFiles,
  emptyTrash,
  markAsRead,
  removeFiles,
  changeIndex,
} from "@docspace/shared/api/files";
import {
  FileAction,
  FileStatus,
  FolderType,
  RoomsType,
  VDRIndexingAction,
  VectorizationStatus,
} from "@docspace/shared/enums";
import { makeAutoObservable } from "mobx";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import FilesFilter from "@docspace/shared/api/files/filter";
import { openingNewTab } from "@docspace/shared/utils/openingNewTab";
import { OPERATIONS_NAME, CategoryType } from "@docspace/shared/constants";
import type { Nullable, TTranslation } from "@docspace/shared/types";
import type {
  TFileConvertId,
} from "@docspace/shared/dialogs/download-dialog/DownloadDialog.types";
import type {
  TFile,
  TFileSecurity,
  TFileViewAccessibility,
  TFolder,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TExportRoomIndexTask } from "@docspace/shared/api/rooms/types";
import type { TRoom, TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type {
  CurrentTariffStatusStore,
} from "@docspace/shared/store/CurrentTariffStatusStore";
import type {
  CurrentQuotasStore,
} from "@docspace/shared/store/CurrentQuotaStore";
import FilesHeaderOptionStore from "./FilesHeaderOptionStore";
import {
  changeCustomFilter as changeCustomFilterHelper,
  nameWithoutExtension as nameWithoutExtensionHelper,
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
import {
  updateFilesAfterDeleteImpl,
  deleteActionImpl,
  emptyTrashImpl,
  emptyPersonalRoomImpl,
  emptyArchiveImpl,
  deleteItemActionImpl,
  deleteItemOperationImpl,
  deleteRoomsImpl,
  deleteRoomsActionImpl,
  onDeleteVersionFileImpl,
} from "./filesActionsStore/delete.helpers";
import {
  downloadFilesImpl,
  downloadActionImpl,
  resolveRoomIdForFileImpl,
  downloadEncryptedFileImpl,
  downloadEncryptedFilesAsZipImpl,
} from "./filesActionsStore/download.helpers";
import {
  duplicateActionImpl,
  duplicateEncryptedFileImpl,
  copyEncryptedFilesToFolderImpl,
  getItemsInfoImpl,
  checkFileConflictsImpl,
  setConflictDialogDataImpl,
  checkOperationConflictImpl,
  preparingDataForCopyingToRoomImpl,
  copyFromTemplateFormImpl,
  copyFileToAiKnowledgeImpl,
  moveDragItemsImpl,
  getPublicKeyImpl,
} from "./filesActionsStore/copyMove.helpers";
import {
  moveToRoomsPageImpl,
  moveToAIAgentsPageImpl,
  moveToPublicRoomImpl,
  openLocationActionImpl,
  checkAndOpenLocationActionImpl,
  closeMediaViewerAndRestoreUrlImpl,
  onClickBackImpl,
  backToParentFolderImpl,
  openFileActionImpl,
  openItemActionImpl,
} from "./filesActionsStore/navigation.helpers";
import {
  setThirdpartyInfoImpl,
  setFavoriteActionImpl,
  setPinActionImpl,
  setMuteActionImpl,
  setArchiveActionImpl,
  pinRoomsImpl,
  unpinRoomsImpl,
  archiveRoomsImpl,
  changeRoomQuotaImpl,
  disableRoomQuotaImpl,
  resetRoomQuotaImpl,
  changeAIAgentsQuotaImpl,
  disableAIAgentQuotaImpl,
  resetAIAgentQuotaImpl,
  onClickCreateRoomImpl,
  onCreateRoomFromTemplateImpl,
  onLeaveRoomImpl,
  changeRoomOwnerImpl,
} from "./filesActionsStore/rooms.helpers";
import {
  updateCurrentFolderImpl,
  createFolderTreeImpl,
  createFoldersTreeImpl,
  completeActionImpl,
  onSelectItemImpl,
  selectTagImpl,
  selectOptionImpl,
  selectRowActionImpl,
  markAsReadImpl,
  lockFileActionImpl,
  finalizeVersionActionImpl,
  setSelectedItemsImpl,
  isExpiredLinkAsyncImpl,
  retryVectorizationImpl,
  onClickRemoveFromRecentImpl,
  removeFilesFromRecentImpl,
  askAIActionImpl,
  runOperationsImpl,
} from "./filesActionsStore/selection.helpers";
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
  setPendingClientSearch: (
    pending: Nullable<{ folderId: number | string; query: string }>,
  ) => void;
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
    
    
    
    operation?: TOperationName,
    skipFetch = false,
  )=> updateCurrentFolderImpl(this, clearSelection, operationId, operation, skipFetch);

  createFolderTree = async (
    treeList: TTreeNode[],
    parentFolderId: number | string,
    filesList: TUploadTreeFile[],
  ): Promise<TTreeNode[] | undefined>=> createFolderTreeImpl(this, treeList, parentFolderId, filesList);

  createFoldersTree = async (
    t: TTranslation,
    files: TUploadTreeFile[] | Record<string, TUploadTreeFile>,
    folderId?: number | string | null,
    dragged?: boolean,
  )=> createFoldersTreeImpl(this, t, files, folderId, dragged);

  updateFilesAfterDelete = (operationId: string, operationName: TOperationName)=> updateFilesAfterDeleteImpl(this, operationId, operationName);

  deleteAction = async (
    translations: Nullable<TDeleteTranslations>,
    newSelection: Nullable<TActionItem[]> = null,
  )=> deleteActionImpl(this, translations, newSelection);

  askAIAction = (item: TActionItem)=> askAIActionImpl(this, item);

  emptyTrash = async (translations: TSuccessTranslations)=> emptyTrashImpl(this, translations);

  emptyPersonalRoom = async (translations: TSuccessTranslations)=> emptyPersonalRoomImpl(this, translations);

  emptyArchive = async (translations: TSuccessTranslations)=> emptyArchiveImpl(this, translations);

  downloadFiles = async (
    fileConvertIds: (number | TFileConvertId)[],
    folderIds: number[],
    
    
    
    translations: TDownloadTranslations | string,
  )=> downloadFilesImpl(this, fileConvertIds, folderIds, translations);

  downloadAction = async (label: string, item?: Nullable<TActionItem>)=> downloadActionImpl(this, label, item);

  resolveRoomIdForFile = (file?: Nullable<TActionItem>)=> resolveRoomIdForFileImpl(this, file);

  downloadEncryptedFile = async (file: TActionItem)=> downloadEncryptedFileImpl(this, file);

  downloadEncryptedFilesAsZip = async (encryptedFiles: TActionItem[])=> downloadEncryptedFilesAsZipImpl(this, encryptedFiles);

  completeAction = async (
    selectedItem: { id: number; isFolder?: boolean },
    type?: FileAction,
  )=> completeActionImpl(this, selectedItem, type);

  onSelectItem = (
    item: { id?: number; isFolder?: boolean },
    withSelect = true,
    isContextItem = true,
    isSingleMenu = false,
  ) => onSelectItemImpl(this, item, withSelect, isContextItem, isSingleMenu);

  deleteItemAction = async (
    itemId: number | number[],
    itemTitle: string,
    translations?: Nullable<TRemoveTranslations>,
    isFile?: boolean | null,
    isThirdParty?: boolean | string | null,
    isRoom?: boolean | null,
  )=> deleteItemActionImpl(this, itemId, itemTitle, translations, isFile, isThirdParty, isRoom);

  deleteItemOperation = (
    isFile: boolean | null | undefined,
    itemId: number | number[],
    translations: Nullable<TRemoveTranslations> | undefined,
    isRoom: boolean | null | undefined,
    operationId: string,
    operation: TOperationName,
  )=> deleteItemOperationImpl(this, isFile, itemId, translations, isRoom, operationId, operation);

  lockFileAction = async (id: number, locked: boolean)=> lockFileActionImpl(this, id, locked);

  finalizeVersionAction = async (id: number)=> finalizeVersionActionImpl(this, id);

  changeCustomFilter = async (item: TActionItem, t: TTranslation) => {
    return changeCustomFilterHelper(item, t);
  };

  duplicateAction = async (item: TActionItem)=> duplicateActionImpl(this, item);

  duplicateEncryptedFile = async (item: TActionItem)=> duplicateEncryptedFileImpl(this, item);

  copyEncryptedFilesToFolder = async (
    items: TActionItem[],
    destFolderId: number | string | undefined,
    destInfo?: {
      private?: boolean;
      rootFolderId?: number | string;
      roomType?: Nullable<RoomsType>;
    },
  )=> copyEncryptedFilesToFolderImpl(this, items, destFolderId, destInfo);

  getItemsInfo = (items: TActionItem[])=> getItemsInfoImpl(this, items);

  setFavoriteAction = (action: string, items: TActionItem[])=> setFavoriteActionImpl(this, action, items);

  setPinAction = async (
    action: string,
    id: number | number[],
    t: TTranslation,
    isAIAgent = false,
  )=> setPinActionImpl(this, action, id, t, isAIAgent);

  setMuteAction = (action: string, item: TActionItem, t: TTranslation)=> setMuteActionImpl(this, action, item, t);

  setArchiveAction = async (
    action: string,
    folders: TActionItem | TActionItem[],
    t: TTranslation,
  )=> setArchiveActionImpl(this, action, folders, t);

  selectTag = (tag: {
    label: string;
    roomType?: number;
    providerType?: number;
  })=> selectTagImpl(this, tag);

  selectOption = (params: { option: string; value: string }) =>
    selectOptionImpl(this, params);

  selectRowAction = (checked: boolean, file: TActionItem)=> selectRowActionImpl(this, checked, file);

  openLocationAction = async (item: {
    id: number | string;
    isRoom?: boolean;
    isTemplate?: boolean;
    isAIAgent?: boolean;
    title?: string;
    rootFolderType?: FolderType;
    roomType?: RoomsType;
  })=> openLocationActionImpl(this, item);

  nameWithoutExtension = (title?: string) => {
    return nameWithoutExtensionHelper(title);
  };

  // history feeds pass partial view-models here (old JS
  // duck typing).
  checkAndOpenLocationAction = async (
    item: Partial<Omit<TActionItem, "id">> & { id?: number | string },
  )=> checkAndOpenLocationActionImpl(this, item);

  setThirdpartyInfo = (providerKey?: string)=> setThirdpartyInfoImpl(this, providerKey);

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
    
    
    fileIds?: (number | string)[],
    item?: TActionItem,
  )=> markAsReadImpl(this, folderIds, fileIds, item);

  moveDragItems = (
    destFolderId: number | string,
    folderTitle: string,
    destFolderInfo: TFolder & {
      private?: boolean;
      rootFolderId?: number | string;
    },
  )=> moveDragItemsImpl(this, destFolderId, folderTitle, destFolderInfo);

  checkFileConflicts = (
    destFolderId: number | string | null | undefined,
    folderIds: number[],
    fileIds: number[],
  )=> checkFileConflictsImpl(this, destFolderId, folderIds, fileIds);

  setConflictDialogData = (
    conflicts: (TFile | TFolder)[],
    operationData: TOperationDataPayload,
  )=> setConflictDialogDataImpl(this, conflicts, operationData);

  setSelectedItems = (title?: string, length?: number)=> setSelectedItemsImpl(this, title, length);

  checkOperationConflict = async (operationData: TOperationDataPayload)=> checkOperationConflictImpl(this, operationData);

  isAvailableOption = (option: string)=> isAvailableOptionImpl(this, option);

  pinRooms = (t: TTranslation)=> pinRoomsImpl(this, t);

  unpinRooms = (t: TTranslation)=> unpinRoomsImpl(this, t);

  archiveRooms = (action: string)=> archiveRoomsImpl(this, action);

  deleteRooms = (t: TTranslation)=> deleteRoomsImpl(this, t);

  deleteRoomsAction = async (
    itemId: number | number[],
    translations?: Nullable<TRemoveTranslations>,
  )=> deleteRoomsActionImpl(this, itemId, translations);

  setProcessCreatingRoomFromData = (processCreatingRoomFromData: boolean) => {
    this.processCreatingRoomFromData = processCreatingRoomFromData;
  };

  onClickCreateRoom = (item?: TActionItem, context = "sidebar")=> onClickCreateRoomImpl(this, item, context);

  changeRoomQuota = (
    items: (TActionItem | number)[],
    successCallback?: (...args: unknown[]) => unknown,
    abortCallback?: (...args: unknown[]) => unknown,
  )=> changeRoomQuotaImpl(this, items, successCallback, abortCallback);

  changeAIAgentsQuota = (
    items: (TActionItem | number)[],
    successCallback?: (...args: unknown[]) => unknown,
    abortCallback?: (...args: unknown[]) => unknown,
  )=> changeAIAgentsQuotaImpl(this, items, successCallback, abortCallback);

  disableRoomQuota = async (items: (TActionItem | number)[], t: TTranslation)=> disableRoomQuotaImpl(this, items, t);

  disableAIAgentQuota = async (
    items: (TActionItem | number)[],
    t: TTranslation,
  )=> disableAIAgentQuotaImpl(this, items, t);

  resetRoomQuota = async (items: (TActionItem | number)[], t: TTranslation)=> resetRoomQuotaImpl(this, items, t);

  resetAIAgentQuota = async (
    items: (TActionItem | number)[],
    t: TTranslation,
  )=> resetAIAgentQuotaImpl(this, items, t);

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

  isExpiredLinkAsync = async (item: TActionItem, withLoader = false)=> isExpiredLinkAsyncImpl(this, item, withLoader);

  openFileAction = async (
    item: TActionItem,
    t: TTranslation,
    e?: Parameters<typeof openingNewTab>[1],
  )=> openFileActionImpl(this, item, t, e);

  openItemAction = async (
    item: TActionItem,
    
    
    t?: TTranslation,
    e?: Parameters<typeof openingNewTab>[1],
  )=> openItemActionImpl(this, item, t, e);

  closeMediaViewerAndRestoreUrl = async ()=> closeMediaViewerAndRestoreUrlImpl(this);

  onClickBack = (fromHotkeys = true)=> onClickBackImpl(this, fromHotkeys);

  moveToRoomsPage = ()=> moveToRoomsPageImpl(this);

  moveToAIAgentsPage = ()=> moveToAIAgentsPageImpl(this);

  moveToPublicRoom = (folderId?: number | string)=> moveToPublicRoomImpl(this, folderId);

  backToParentFolder = async ()=> backToParentFolderImpl(this);

  setGroupMenuBlocked = (blocked: boolean) => {
    this.isGroupMenuBlocked = blocked;
  };

  preparingDataForCopyingToRoom = async (
    destFolderId: number | string,
    selections: TActionItem[],
    destFolderInfo?: TFolder | TRoom,
  )=> preparingDataForCopyingToRoomImpl(this, destFolderId, selections, destFolderInfo);

  onLeaveRoom = (t: TTranslation, isOwner = false, force = false)=> onLeaveRoomImpl(this, t, isOwner, force);

  changeRoomOwner = (t: TTranslation, userId: string, isLeaveChecked = false)=> changeRoomOwnerImpl(this, t, userId, isLeaveChecked);

  onClickRemoveFromRecent = (selection: TActionItem[], t: TTranslation)=> onClickRemoveFromRecentImpl(this, selection, t);

  removeFilesFromRecent = async (fileIds: number[], t: TTranslation)=> removeFilesFromRecentImpl(this, fileIds, t);

  onCreateRoomFromTemplate = (item: TActionItem, addSelection?: boolean)=> onCreateRoomFromTemplateImpl(this, item, addSelection);

  copyFromTemplateForm = async (fileInfo: TFile)=> copyFromTemplateFormImpl(this, fileInfo);

  copyFileToAiKnowledge = async (filesInfo: TActionItem[])=> copyFileToAiKnowledgeImpl(this, filesInfo);

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

  getPublicKey = async (folder: TActionItem | TFolder)=> getPublicKeyImpl(this, folder);

  onDeleteVersionFile = async (fileId: number, versions: number[])=> onDeleteVersionFileImpl(this, fileId, versions);

  runOperations = (operations: string[] = [])=> runOperationsImpl(this, operations);

  retryVectorization = async (files: TActionItem[])=> retryVectorizationImpl(this, files);
}

export default FilesActionStore;

