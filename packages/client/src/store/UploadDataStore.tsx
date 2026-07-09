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

import { makeAutoObservable, runInAction } from "mobx";
import { ConflictResolveType } from "@docspace/shared/enums";
import { resolveItemRoomContext } from "@docspace/shared/services/private-room/encrypted-upload";
import { getFileInfo, uploadFile } from "@docspace/shared/api/files";

import { OPERATIONS_NAME } from "@docspace/shared/constants";

import type {
  TFile,
  TFolder,
  TOperation,
} from "@docspace/shared/api/files/types";
import type FilesFilter from "@docspace/shared/api/files/filter";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { Nullable, TTranslation } from "@docspace/shared/types";
import type { TConflictResolveDialogData } from "SRC_DIR/components/dialogs/ConflictResolveDialog/ConflictResolveDialog.types";

import type {
  TUploadBrowserFile,
  TUploadFile,
} from "./uploadDataStore/helpers";
import {
  getActiveUploadCountForRoomImpl,
  getConversationPercentImpl,
  getFilesPercentImpl,
  getNewPercentImpl,
  getUploadedFileImpl,
  getUserEncryptionKeysImpl,
  shouldEncryptCurrentUploadImpl,
  willEncryptItemImpl,
} from "./uploadDataStore/selectors.helpers";
import {
  clearActiveOperationsImpl,
  copyAsActionImpl,
  copyToActionImpl,
  itemOperationToFolderImpl,
  loopFilesOperationsImpl,
  moveToActionImpl,
  moveToCopyToImpl,
  navigateToNewFolderLocationImpl,
} from "./uploadDataStore/operations.helpers";
import {
  cancelConversionImpl,
  cancelCurrentFileConversionImpl,
  convertFileFromFilesImpl,
  convertFileImpl,
  convertUploadedFilesImpl,
  retryConvertFilesImpl,
  setConversionPercentImpl,
  startConversionFromFilesImpl,
  startConversionImpl,
} from "./uploadDataStore/conversion.helpers";
import {
  cancelEncryptedBatchUploadImpl,
  encryptKeysForRoomMembersImpl,
  ensureEncryptionUnlockedForBatchImpl,
  prepareFileForEncryptedUploadImpl,
  wrapForSelfThenRoomImpl,
} from "./uploadDataStore/encryption.helpers";
import {
  cancelUploadActionImpl,
  cancelUploadImpl,
  cancelCurrentUploadImpl,
  handleFilesUploadImpl,
  handleUploadAndOptionalConversionImpl,
  handleUploadConflictsImpl,
  retryQuotaFailedFilesImpl,
  retryUploadFilesImpl,
  setConflictDialogDataImpl,
  startUploadImpl,
} from "./uploadDataStore/start.helpers";
import {
  asyncUploadImpl,
  checkChunkUploadImpl,
  parallelUploadingImpl,
  startSessionFuncImpl,
  startUploadFilesImpl,
  uploadFileChunksImpl,
} from "./uploadDataStore/chunkUpload.helpers";
import {
  finishUploadFilesImpl,
  refreshFilesImpl,
  showFinishUploadToastrImpl,
} from "./uploadDataStore/finish.helpers";

import type AiRoomStore from "./AiRoomStore";
import type DialogsStore from "./DialogsStore";
import type FilesSettingsStore from "./FilesSettingsStore";
import type PrimaryProgressDataStore from "./PrimaryProgressDataStore";
import type SecondaryProgressDataStore from "./SecondaryProgressDataStore";
import type SelectedFolderStore from "./SelectedFolderStore";
import type TreeFoldersStore from "./TreeFoldersStore";
import type FilesStore from "./FilesStore";

export type { TUploadFile } from "./uploadDataStore/helpers";

type TOperationName = (typeof OPERATIONS_NAME)[keyof typeof OPERATIONS_NAME];

export type TConversionFile = {
  fileId: number | null;
  fileInfo: TFile | null;
  uniqueId?: string;
  action?: string;
  error?: string | null;
  errorShown?: boolean;
  inConversion?: boolean;
  needPassword?: boolean;
  convertProgress?: number;
  password?: string | null;
  format?: string | null;
  index?: number;
};

export type TUploadData = {
  files?: TUploadFile[];
  filesToConversion?: TUploadFile[];
  filesSize?: number;
  uploadedFiles?: number;
  percent?: number;
  uploaded?: boolean;
  converted?: boolean;
  currentUploadNumber?: number;
  conversionPercent?: number;
  totalErrorsCount?: number;
  uploadedFilesHistory?: TUploadFile[];
  newFilesWithoutConversion?: TUploadFile[];
  allNewFiles?: TUploadFile[];
  conversionFiles?: TUploadFile[];
};

export type TStartUploadData = TUploadData & {
  files: TUploadFile[];
  filesSize: number;
  uploadedFilesHistory: TUploadFile[];
  newFilesWithoutConversion: TUploadFile[];
  allNewFiles: TUploadFile[];
};

export type TChunkUploadResponse = {
  uploaded: boolean;
  id: number;
  file: TFile;
};

export type TUploadChunk = {
  isActive: boolean;
  isFinished: boolean;
  isFinalize: boolean;
  onUpload: () => Promise<unknown>;
};

export type TChunkData = {
  operationId: string;
  file: TUploadBrowserFile;
  fileSize?: number;
  indexOfFile: number;
  path: number[];
  length: number;
};

export type TResolve = (value?: unknown) => void;

export type TCheckChunkUpload = {
  t: TTranslation;
  res: TChunkUploadResponse;
  index: number;
  indexOfFile: number;
  path: number[];
  chunksLength: number;
  resolve: TResolve;
  createNewIfExist?: boolean;
};

export type TPbData = {
  operation: TOperationName;
  operationId: string;
};

export type TItemOperationData = {
  destFolderId: number | string | null | undefined;
  destFolderInfo?: TFolder;
  folderIds: number[];
  fileIds: number[];
  deleteAfter: boolean;
  isCopy?: boolean;
  content?: boolean;
  title?: string;
  itemsCount?: number;
  isFolder?: boolean;
  toFillOut?: boolean;
  conflictResolveType?: ConflictResolveType;
  translations?: { [key: string]: string };
};

export type TAxiosLikeError = {
  response?: { data?: { error?: { message?: string } }; status?: number };
  statusText?: string;
  message?: string;
};

type TFilesStore = FilesStore;

class UploadDataStore {
  settingsStore: SettingsStore;

  treeFoldersStore: TreeFoldersStore;

  selectedFolderStore: SelectedFolderStore;

  filesStore: TFilesStore;

  secondaryProgressDataStore: SecondaryProgressDataStore;

  primaryProgressDataStore: PrimaryProgressDataStore;

  dialogsStore: DialogsStore;

  filesSettingsStore: FilesSettingsStore;

  aiRoomStore: AiRoomStore;

  userStore: UserStore;

  encryptionEnabled = false;

  files: TUploadFile[] = [];

  uploadedFilesHistory: TUploadFile[] = [];

  displayedConversionFiles: TConversionFile[] = []; // Files shown in the conversion panel

  filesSize = 0;

  tempConversionFiles: TUploadFile[] = [];

  filesToConversion: TUploadFile[] = [];

  activeConversionQueue: TConversionFile[] = []; // Queue for files being converted from files view

  convertFilesSize = 0;

  uploadToFolder: number | string | null = null;

  uploadedFiles = 0;

  percent = 0;

  conversionPercent = 0;

  uploaded = true;

  converted = true;

  convertedFromFiles = true;

  uploadPanelVisible = false;

  selectedUploadFile: TUploadFile[] = [];

  errors = 0;

  isUploading = false;

  isUploadingAndConversion = false;

  isConvertSingleFile = false;

  currentUploadNumber = 0;

  uploadedFilesSize = 0;

  asyncUploadObj: Record<string, { chunksArray: TUploadChunk[] }> = {};

  conversionVisible = false;

  totalErrorsCount = 0;

  finishUploadFilesCalled = false;

  quotaErrorRaised = false;

  constructor(
    settingsStore: SettingsStore,
    treeFoldersStore: TreeFoldersStore,
    selectedFolderStore: SelectedFolderStore,
    filesStore: TFilesStore,
    secondaryProgressDataStore: SecondaryProgressDataStore,
    primaryProgressDataStore: PrimaryProgressDataStore,
    dialogsStore: DialogsStore,
    filesSettingsStore: FilesSettingsStore,
    aiRoomStore: AiRoomStore,
    userStore: UserStore,
  ) {
    makeAutoObservable(this);
    this.settingsStore = settingsStore;
    this.treeFoldersStore = treeFoldersStore;
    this.selectedFolderStore = selectedFolderStore;
    this.filesStore = filesStore;
    this.secondaryProgressDataStore = secondaryProgressDataStore;
    this.primaryProgressDataStore = primaryProgressDataStore;
    this.dialogsStore = dialogsStore;
    this.filesSettingsStore = filesSettingsStore;
    this.aiRoomStore = aiRoomStore;
    this.userStore = userStore;
  }

  setEncryptionEnabled = (enabled: boolean) => {
    this.encryptionEnabled = enabled;
  };

  wrapForSelfThenRoom = (
    fileId: number,
    currentUserId: string,
    publicKeyBase64: string,
    publicKeyId: string,
    dek: Uint8Array,
    roomId: number | string | null,
  ) =>
    wrapForSelfThenRoomImpl(
      this,
      fileId,
      currentUserId,
      publicKeyBase64,
      publicKeyId,
      dek,
      roomId,
    );

  encryptKeysForRoomMembers = (
    fileId: number,
    currentUserId: string,
    roomId: number | string | null,
    dek: Uint8Array,
    identity: IdentityKeyPair,
  ) =>
    encryptKeysForRoomMembersImpl(
      this,
      fileId,
      currentUserId,
      roomId,
      dek,
      identity,
    );

  getUserEncryptionKeys = () => getUserEncryptionKeysImpl(this);

  shouldEncryptCurrentUpload = () => shouldEncryptCurrentUploadImpl(this);

  getUploadFolderContext = () => ({
    isPrivacyFolder: this.treeFoldersStore.isPrivacyFolder,
    selectedRoomType: this.selectedFolderStore.roomType,
  });

  getUploadEncryptionContext = (item: TUploadFile | null | undefined) => {
    return resolveItemRoomContext(
      item?.file?.uploadContext,
      this.getUploadFolderContext(),
    );
  };

  willEncryptItem = (item: TUploadFile | null | undefined) =>
    willEncryptItemImpl(this, item);

  ensureEncryptionUnlockedForBatch = () =>
    ensureEncryptionUnlockedForBatchImpl(this);

  cancelEncryptedBatchUpload = () => cancelEncryptedBatchUploadImpl(this);

  prepareFileForEncryptedUpload = (
    file: TUploadBrowserFile,
    folderId: number | string | null | undefined,
    onProgress?: (progress: number) => void,
  ) => prepareFileForEncryptedUploadImpl(this, file, folderId, onProgress);

  removeFiles = (fileIds: number[]) => {
    fileIds.forEach((id) => {
      this.files = this.files?.filter(
        (file) => !(file.action === "converted" && file.fileInfo?.id === id),
      );
    });
  };

  getActiveUploadCountForRoom = (
    roomId: string | number | null | undefined,
  ) => getActiveUploadCountForRoomImpl(roomId, { files: this.files });

  selectUploadedFile = (file: TUploadFile[]) => {
    this.selectedUploadFile = file;
  };

  setUploadPanelVisible = (uploadPanelVisible: boolean) => {
    this.uploadPanelVisible = uploadPanelVisible;
  };

  setConversionPanelVisible = (conversionVisible: boolean) => {
    this.conversionVisible = conversionVisible;
  };

  setUploadData = (uploadData: TUploadData) => {
    const uploadDataItems = Object.keys(uploadData);
    uploadDataItems.forEach((key) => {
      if (key in this) {
        (this as unknown as Record<string, unknown>)[key] = (
          uploadData as Record<string, unknown>
        )[key];
      }
    });
  };

  updateUploadedFile = (id: number | string, info: TFile) => {
    const files = this.files.map((file) =>
      file.fileId === id ? { ...file, fileInfo: info } : file,
    );
    this.files = files;
  };

  updateUploadedItem = async (id: number | string) => {
    const uploadedFileData = await getFileInfo(id);
    this.updateUploadedFile(id, uploadedFileData);
  };

  clearUploadData = () => {
    this.files = [];
    this.filesToConversion = [];
    this.uploadedFilesHistory = [];
    this.filesSize = 0;
    this.uploadedFiles = 0;
    this.percent = 0;
    this.conversionPercent = 0;
    this.uploaded = true;
    this.converted = true;
    this.errors = 0;
    this.uploadedFilesSize = 0;

    this.isUploadingAndConversion = false;
    this.isUploading = false;
    this.asyncUploadObj = {};
    this.quotaErrorRaised = false;
  };

  clearUploadedFiles = () => {
    const uploadData = {
      filesSize: 0,
      uploadedFiles: 0,
      percent: 0,
      files: this.files.filter((x) => x.action !== "uploaded"),
    };

    this.isUploadingAndConversion = false;
    this.isUploading = false;

    this.setUploadData(uploadData);
  };

  getUploadedFile = (id: string) =>
    getUploadedFileImpl(id, { files: this.files });

  cancelUpload = () => cancelUploadImpl(this);

  cancelConversion = () => cancelConversionImpl(this);

  clearConversionData = () => {
    this.displayedConversionFiles = [];
    this.activeConversionQueue = [];
    this.convertedFromFiles = true;
  };

  cancelCurrentUpload = (id: string, t: TTranslation) =>
    cancelCurrentUploadImpl(this, id, t);

  cancelCurrentFileConversion = (fileId: string) =>
    cancelCurrentFileConversionImpl(this, fileId);

  convertFileFromFiles = (
    file: TConversionFile,
    t: TTranslation,
    isOpen?: boolean,
  ) => convertFileFromFilesImpl(this, file, t, isOpen);

  convertFile = (file: TUploadFile, t: TTranslation, isOpen?: boolean) =>
    convertFileImpl(this, file, t, isOpen);

  getNewPercent = (uploadedSize: number, indexOfFile: number) =>
    getNewPercentImpl(uploadedSize, indexOfFile, {
      files: this.files,
      uploaded: this.uploaded,
    });

  getFilesPercent = () =>
    getFilesPercentImpl({ uploadedFilesHistory: this.uploadedFilesHistory });

  setConversionPercent = (percent: number, alert?: boolean) =>
    setConversionPercentImpl(this, percent, alert);

  getConversationPercent = (fileIndex: number) =>
    getConversationPercentImpl(fileIndex, { files: this.files });

  startConversionFromFiles = (t: TTranslation, isOpen = false) =>
    startConversionFromFilesImpl(this, t, isOpen);

  startConversion = (t: TTranslation, isOpen = false) =>
    startConversionImpl(this, t, isOpen);

  parallelUploading = (
    notUploadedFiles: TUploadFile[],
    t: TTranslation,
    createNewIfExist?: boolean,
  ) => parallelUploadingImpl(this, notUploadedFiles, t, createNewIfExist);

  convertUploadedFiles = (t: TTranslation, createNewIfExist = true) =>
    convertUploadedFilesImpl(this, t, createNewIfExist);

  cancelUploadAction = (items?: { uniqueId: string }[]) =>
    cancelUploadActionImpl(this, items);

  setConflictDialogData = (
    conflicts: unknown[],
    operationData: Partial<TConflictResolveDialogData>,
  ) => setConflictDialogDataImpl(this, conflicts, operationData);

  handleFilesUpload = (
    newUploadData: TStartUploadData,
    t: TTranslation,
    createNewIfExist = true,
  ) => handleFilesUploadImpl(this, newUploadData, t, createNewIfExist);

  handleUploadAndOptionalConversion = (
    uploadData: TStartUploadData,
    t: TTranslation,
    createNewIfExist?: boolean,
  ) =>
    handleUploadAndOptionalConversionImpl(
      this,
      uploadData,
      t,
      createNewIfExist,
    );

  conflictDialogUploadHandler = (
    uploadData: TStartUploadData,
    t: TTranslation,
    createNewIfExist?: boolean,
  ) => {
    this.handleUploadAndOptionalConversion(uploadData, t, createNewIfExist);
  };

  handleUploadConflicts = (
    t: TTranslation,
    toFolderId: number | string | null,
    uploadData: TStartUploadData,
  ) => handleUploadConflictsImpl(this, t, toFolderId, uploadData);

  startUpload = (
    uploadFiles: Record<string, TUploadBrowserFile> | unknown[],
    folderId: number | string | null,
    t: TTranslation,
  ) => startUploadImpl(this, uploadFiles, folderId, t);

  refreshFiles = (currentFile?: TUploadFile) =>
    refreshFilesImpl(this, currentFile);

  checkChunkUpload = (chunkUploadObj: TCheckChunkUpload) =>
    checkChunkUploadImpl(this, chunkUploadObj);

  asyncUpload = (
    t: TTranslation,
    chunkData: TChunkData,
    resolve: TResolve,
    reject: (reason?: unknown) => void,
    createNewIfExist?: boolean,
  ) => asyncUploadImpl(this, t, chunkData, resolve, reject, createNewIfExist);

  uploadFileChunks = (
    sessionId: string,
    folderId: number | string,
    requestsDataArray: FormData[],
    fileSize: number,
    indexOfFile: number,
    file: TUploadBrowserFile,
    path: number[],
    t: TTranslation,
    operationId: string,
    toFolderId: number | string | null | undefined,
    createNewIfExist?: boolean,
  ) =>
    uploadFileChunksImpl(
      this,
      sessionId,
      folderId,
      requestsDataArray,
      fileSize,
      indexOfFile,
      file,
      path,
      t,
      operationId,
      toFolderId,
      createNewIfExist,
    );

  retryConvertFiles = (t: TTranslation, fileId: number) =>
    retryConvertFilesImpl(this, t, fileId);

  retryUploadFiles = (t: TTranslation, uniqueId: string) =>
    retryUploadFilesImpl(this, t, uniqueId);

  retryQuotaFailedFiles = (t: TTranslation) =>
    retryQuotaFailedFilesImpl(this, t);

  startUploadFiles = (t: TTranslation, createNewIfExist = true) =>
    startUploadFilesImpl(this, t, createNewIfExist);

  startSessionFunc = (
    indexOfFile: number,
    t: TTranslation,
    createNewIfExist = true,
  ) => startSessionFuncImpl(this, indexOfFile, t, createNewIfExist);

  showFinishUploadToastr = (
    t: TTranslation,
    totalErrorsCount: number,
    filesWithoutErrors: TUploadFile[],
    filesWithErrors: TUploadFile[],
    filesWithAllErrors: number,
  ) =>
    showFinishUploadToastrImpl(
      this,
      t,
      totalErrorsCount,
      filesWithoutErrors,
      filesWithErrors,
      filesWithAllErrors,
    );

  finishUploadFiles = (t: TTranslation, waitConversion?: boolean) =>
    finishUploadFilesImpl(this, t, waitConversion);

  copyToAction = (
    destFolderId: number | string | null | undefined,
    folderIds: number[],
    fileIds: number[],
    conflictResolveType: ConflictResolveType,
    deleteAfter: boolean,
    operationId: string,
    content?: boolean,
    toFillOut?: boolean,
  ) =>
    copyToActionImpl(
      this,
      destFolderId,
      folderIds,
      fileIds,
      conflictResolveType,
      deleteAfter,
      operationId,
      content,
      toFillOut,
    );

  moveToAction = (
    destFolderId: number | string | null | undefined,
    folderIds: number[],
    fileIds: number[],
    conflictResolveType: ConflictResolveType,
    deleteAfter: boolean,
    operationId: string,
    toFillOut?: boolean,
  ) =>
    moveToActionImpl(
      this,
      destFolderId,
      folderIds,
      fileIds,
      conflictResolveType,
      deleteAfter,
      operationId,
      toFillOut,
    );

  copyAsAction = (
    fileId: number,
    title: string,
    folderId: number,
    enableExternalExt?: boolean,
    password?: string,
  ) =>
    copyAsActionImpl(this, fileId, title, folderId, enableExternalExt, password);

  itemOperationToFolder = (data: TItemOperationData) =>
    itemOperationToFolderImpl(this, data);

  loopFilesOperations = (
    data: TOperation | null,
    pbData: TPbData,
  ): Promise<TOperation | undefined> =>
    loopFilesOperationsImpl(this, data, pbData);

  navigateToNewFolderLocation = (folderId: number | string | null) =>
    navigateToNewFolderLocationImpl(this, folderId);

  moveToCopyTo = (
    destFolderId: number | string | null | undefined,
    pbData: TPbData,
    isCopy: boolean,
    fileIds?: number[],
    folderIds?: number[],
  ) => moveToCopyToImpl(this, destFolderId, pbData, isCopy, fileIds, folderIds);

  clearActiveOperations = (
    fileIds: Nullable<number[]> = [],
    folderIds: Nullable<number[]> = [],
  ) => clearActiveOperationsImpl(this, fileIds, folderIds);
}

export default UploadDataStore;

