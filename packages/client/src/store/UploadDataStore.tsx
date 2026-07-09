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
import { getI18n, Trans } from "react-i18next";
import type { TFunction } from "i18next";
import { TIMEOUT } from "SRC_DIR/helpers/filesConstants";
import {
  AnalyticsEvents,
  ConflictResolveType,
  RoomsType,
} from "@docspace/shared/enums";
import SocketHelper, { SocketCommands } from "@docspace/ui-kit/utils/socket";
import {
  shouldEncryptUpload,
  resolveItemRoomContext,
} from "@docspace/shared/services/private-room/encrypted-upload";
import {
  getFileInfo,
  uploadFile,
  startUploadSession,
  uploadChunkSequential,
  uploadChunkParallel,
  finalizeUploadSession,
} from "@docspace/shared/api/files";
import { wipeDek } from "@docspace/shared/services/encryption/file-keys";
import { rememberEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";
import { toastr } from "@docspace/ui-kit/components/toast";

import { isQuotaError } from "@docspace/shared/utils/uploadErrors";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { Link } from "@docspace/ui-kit/components/link";

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

import {
  acquireUploadAutoLockSuspension,
  hasFileDek,
  releaseUploadAutoLockSuspension,
  setFileDek,
  takeFileDek,
} from "./uploadDataStore/helpers";
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

type TUploadData = {
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

type TChunkUploadResponse = {
  uploaded: boolean;
  id: number;
  file: TFile;
};

type TUploadChunk = {
  isActive: boolean;
  isFinished: boolean;
  isFinalize: boolean;
  onUpload: () => Promise<unknown>;
};

type TChunkData = {
  operationId: string;
  file: TUploadBrowserFile;
  fileSize?: number;
  indexOfFile: number;
  path: number[];
  length: number;
};

type TResolve = (value?: unknown) => void;

type TCheckChunkUpload = {
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
  ) => {
    const { maxUploadFilesCount } = this.filesSettingsStore;

    const countFiles =
      notUploadedFiles.length >= maxUploadFilesCount
        ? maxUploadFilesCount
        : notUploadedFiles.length;

    for (let i = 0; i < countFiles; i++) {
      if (this.currentUploadNumber <= maxUploadFilesCount) {
        const fileIndex = this.files.findIndex(
          (f) => f.uniqueId === notUploadedFiles[i].uniqueId,
        );

        if (fileIndex !== -1) {
          this.currentUploadNumber += 1;
          this.startSessionFunc(fileIndex, t, createNewIfExist);
        }
      }
    }
  };

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

  refreshFiles = async (currentFile?: TUploadFile) => {
    const { files, setFiles, folders, setFolders, filter, setFilter } =
      this.filesStore;

    const { filesCount, setFilesCount } = this.selectedFolderStore;

    if (window.location.pathname.indexOf("/history") === -1) {
      const newFiles = files;
      const newFolders = folders;
      const path = currentFile?.path ? currentFile.path.slice() : [];
      const fileIndex = newFiles.findIndex(
        (x) => x.id === currentFile?.fileInfo?.id,
      );

      // The assertion (instead of a plain null literal) keeps the historical
      // TFolder|null typing: the assignment below is commented out.
      const folderInfo = null as TFolder | null;
      const index = path.findIndex((x) => x === this.selectedFolderStore.id);
      const folderId = index !== -1 ? path[index + 1] : null;
      // if (folderId && folderId !== this.aiRoomStore.knowledgeId)
      //   folderInfo = await getFolderInfo(folderId);

      const newPath: number[] = [];
      if (folderInfo || path[path.length - 1] === this.selectedFolderStore.id) {
        let i = 0;
        while (path[i] && path[i] !== folderId) {
          newPath.push(path[i]);
          i++;
        }
      }

      if (
        newPath[newPath.length - 1] !== this.selectedFolderStore.id &&
        path.length
      ) {
        return;
      }

      const addNewFile = () => {
        if (!this.filesStore.showNewFilesInList) {
          return;
        }

        if (folderInfo) {
          const isFolderExist = newFolders.find((x) => x.id === folderInfo.id);
          if (!isFolderExist && folderInfo) {
            console.error(this.selectedFolderStore.id);
            newFolders.unshift(folderInfo);
            setFolders(newFolders);
            const newFilter = filter;
            newFilter.total += 1;
            setFilter(newFilter);
          }
        } else if (currentFile && currentFile.fileInfo) {
          if (fileIndex === -1) {
            newFiles.unshift(currentFile.fileInfo);
            setFiles(newFiles);
            const newFilter = filter;
            newFilter.total += 1;
            setFilesCount(filesCount + 1);
            setFilter(newFilter);
          } else if (!this.filesSettingsStore.storeOriginalFiles) {
            newFiles[fileIndex] = currentFile.fileInfo;
            setFiles(newFiles);
          }
        }
      };

      const isFiltered =
        filter.filterType || filter.authorType || filter.search;

      if ((!currentFile && !folderInfo) || isFiltered) return;
      if (folderInfo && this.selectedFolderStore.id === folderInfo.id) return;

      if (folderInfo) {
        const folderIndex = folders.findIndex((f) => f.id === folderInfo.id);
        if (folderIndex !== -1) {
          folders[folderIndex] = folderInfo;
          return;
        }
      }

      addNewFile();
    }
  };

  checkChunkUpload = (chunkUploadObj: TCheckChunkUpload) => {
    const {
      t,
      res, // file response data
      index, // chunk index
      indexOfFile, // file index in the list
      path, // file path
      chunksLength, // length of file chunks
      resolve, // resolve cb
      //  allChunkUploaded, // needed for progress, files is uploaded, awaiting finalized chunk
      createNewIfExist,
    } = chunkUploadObj;

    const { uploaded, id: fileId, file: fileInfo } = res;

    // let uploadedSize;

    // if (!uploaded && !allChunkUploaded) {
    //   uploadedSize =
    //     fileSize <= this.filesSettingsStore.chunkUploadSize
    //       ? fileSize
    //       : this.filesSettingsStore.chunkUploadSize;
    // } else {
    //   uploadedSize = isFinalize
    //     ? 0
    //     : fileSize <= this.filesSettingsStore.chunkUploadSize
    //       ? fileSize
    //       : fileSize - index * this.filesSettingsStore.chunkUploadSize;
    // }

    const percentCurrentFile = (index / chunksLength) * 100;

    const fileIndex = this.uploadedFilesHistory.findIndex(
      (f) => f.uniqueId === this.files[indexOfFile].uniqueId,
    );

    if (fileIndex > -1) {
      if (this.uploadedFilesHistory[fileIndex].percent < percentCurrentFile)
        this.uploadedFilesHistory[fileIndex].percent = percentCurrentFile;
    }

    const newPercent = this.getFilesPercent();

    this.percent = newPercent;

    this.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: OPERATIONS_NAME.upload,
      percent: newPercent,
    });

    if (uploaded) {
      runInAction(() => {
        this.files[indexOfFile].action = "uploaded";
        this.files[indexOfFile].fileId = fileId;
        this.files[indexOfFile].fileInfo = fileInfo;

        this.uploadedFilesHistory[fileIndex].action = "uploaded";
        this.uploadedFilesHistory[fileIndex].fileId = fileId;
        this.uploadedFilesHistory[fileIndex].fileInfo = fileInfo;

        this.currentUploadNumber -= 1;

        const nextFileIndex = this.files.findIndex((f) => !f.inAction);

        if (nextFileIndex !== -1) {
          this.startSessionFunc(nextFileIndex, t, createNewIfExist);
        }
      });

      const currentFileData = this.files[indexOfFile];
      if (currentFileData?.encrypted && hasFileDek(currentFileData)) {
        if (currentFileData.file?.name) {
          rememberEncryptedFilename(fileId, currentFileData.file.name);
        }

        const { publicKey, userId, publicKeyId } = this.getUserEncryptionKeys();
        if (!userId || !publicKey) {
          console.error(
            "[ENCRYPTION] Cannot wrap DEK: encryption keys missing for current user",
          );
          const orphanDek = takeFileDek(currentFileData);
          if (orphanDek) wipeDek(orphanDek);
        } else {
          const dekForWrap = takeFileDek(currentFileData);
          const roomIdForWrap = currentFileData?.encryptionRoomId ?? null;
          this.wrapForSelfThenRoom(
            fileId,
            String(userId),
            publicKey,
            publicKeyId || "",
            // hasFileDek() above guarantees a DEK is stored for this entry.
            dekForWrap!,
            roomIdForWrap,
          ).catch((error: TAxiosLikeError) => {
            const wrapMessage = getI18n().t(
              "Common:EncryptionUploadWrapFailed",
            );
            console.error("[ENCRYPTION] Failed to set file encryption keys", {
              fileId,
              status: error?.response?.status,
              message: error?.message,
            });
            runInAction(() => {
              if (this.files[indexOfFile]) {
                this.files[indexOfFile].error = wrapMessage;
              }
              const historyIndex = this.uploadedFilesHistory.findIndex(
                (f) => f.uniqueId === this.files[indexOfFile]?.uniqueId,
              );
              if (historyIndex > -1) {
                this.uploadedFilesHistory[historyIndex].error = wrapMessage;
              }
            });
            try {
              toastr.error(wrapMessage);
            } catch {
              //
            }
          });
        }
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: AnalyticsEvents.FileUploaded,
        id: fileInfo.id,
        parentId: fileInfo.folderId,
      });

      if (fileInfo.version > 2) {
        this.filesStore.setHighlightFile({
          highlightFileId: fileInfo.id,
          isFileHasExst: !fileInfo.fileExst,
        });
      }
    }

    // All chuncks are uploaded

    const currentFile = this.files[indexOfFile];

    if (!currentFile) return resolve();

    if (!currentFile.fileId) return;

    currentFile.path = path;

    const { needConvert } = currentFile;

    const isXML = currentFile.fileInfo?.fileExst?.includes(".xml");

    if (isXML) return resolve();

    if (needConvert) {
      runInAction(() => {
        currentFile.action = "convert";

        if (fileIndex > -1) {
          this.uploadedFilesHistory[fileIndex].action = "convert";
        }
      });

      if (!this.filesToConversion.length || this.converted) {
        this.filesToConversion.push(currentFile);
        this.startConversion(t);
      } else {
        this.filesToConversion.push(currentFile);
      }
      return resolve();
    }

    if (currentFile.action === "uploaded") {
      this.refreshFiles(currentFile);
    }

    return resolve();
  };

  asyncUpload = async (
    t: TTranslation,
    chunkData: TChunkData,
    resolve: TResolve,
    reject: (reason?: unknown) => void,
    createNewIfExist?: boolean,
  ) => {
    const { operationId, file, indexOfFile, path, length } = chunkData;

    if (
      this.uploaded ||
      !this.files.some((f) => f.file === file) ||
      this.files[indexOfFile].cancel
    ) {
      return resolve();
    }

    if (!this.asyncUploadObj[operationId]) {
      return reject();
    }
    const chunkObjIndex = this.asyncUploadObj[
      operationId
    ].chunksArray.findIndex((x) => !x.isActive && !x.isFinalize);

    if (chunkObjIndex !== -1) {
      this.asyncUploadObj[operationId].chunksArray[chunkObjIndex].isActive =
        true;

      try {
        const res =
          await this.asyncUploadObj[operationId].chunksArray[
            chunkObjIndex
          ].onUpload();

        if (this.asyncUploadObj[operationId]) {
          this.asyncUploadObj[operationId].chunksArray[
            chunkObjIndex
          ].isFinished = true;
        }

        this.asyncUpload(t, chunkData, resolve, reject, createNewIfExist);

        const activeLength = this.asyncUploadObj[operationId]
          ? this.asyncUploadObj[operationId].chunksArray.filter(
              (x) => x.isActive,
            ).length - 1
          : 0;

        this.checkChunkUpload({
          t,
          res: res as TChunkUploadResponse,
          index: activeLength,
          indexOfFile,
          path,
          chunksLength: length,
          resolve,
          createNewIfExist,
        });

        let finalizeChunk = -1;
        if (this.asyncUploadObj[operationId]) {
          finalizeChunk = this.asyncUploadObj[
            operationId
          ].chunksArray.findIndex((x) => !x.isFinished && !x.isFinalize);
        }

        if (finalizeChunk === -1) {
          const finalizeChunkIndex = this.asyncUploadObj[
            operationId
          ].chunksArray.findIndex((x) => x.isFinalize);

          if (finalizeChunkIndex > -1) {
            const finalizeIndex =
              this.asyncUploadObj[operationId].chunksArray.length - 1;

            const finalizeRes =
              await this.asyncUploadObj[operationId].chunksArray[
                finalizeChunkIndex
              ].onUpload();

            this.checkChunkUpload({
              t,
              res: finalizeRes as TChunkUploadResponse,
              index: finalizeIndex,
              indexOfFile,
              path,
              chunksLength: length,
              resolve,
              createNewIfExist,
            });
          }
        }
      } catch (error) {
        return reject(error);
      }
    }
  };

  uploadFileChunks = async (
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
  ) => {
    const { uploadThreadCount } = this.filesSettingsStore;
    const length = requestsDataArray.length;

    const isThirdPartyFolder = typeof toFolderId === "string";
    if (!isThirdPartyFolder) {
      const chunksArray: TUploadChunk[] = [];
      for (let index = 0; index < length; index++) {
        chunksArray.push({
          isActive: false,
          isFinished: false,
          isFinalize: false,
          onUpload: () =>
            uploadChunkParallel(
              folderId,
              sessionId,
              index + 1,
              requestsDataArray[index],
            ),
        });
      }
      chunksArray.push({
        isActive: false,
        isFinished: false,
        isFinalize: true,
        onUpload: () => finalizeUploadSession(folderId, sessionId),
      });

      if (!this.asyncUploadObj[operationId]) {
        this.asyncUploadObj[operationId] = { chunksArray: [] };
        this.asyncUploadObj[operationId].chunksArray = chunksArray;
      }

      const promise = new Promise<unknown>((resolve, reject) => {
        let i = length <= uploadThreadCount ? length : uploadThreadCount;
        while (i !== 0) {
          this.asyncUpload(
            t,
            { operationId, file, fileSize, indexOfFile, path, length },
            resolve,
            reject,
            createNewIfExist,
          );
          i--;
        }
      });

      await promise;
    } else {
      for (let index = 0; index < length; index++) {
        if (
          this.uploaded ||
          !this.files.some((f) => f.file === file) ||
          this.files[indexOfFile].cancel
        ) {
          return Promise.resolve();
        }

        const res = await uploadChunkSequential(
          folderId,
          sessionId,
          requestsDataArray[index],
        );
        const resolve = (r?: unknown) => Promise.resolve(r);

        this.checkChunkUpload({
          t,
          res: res as TChunkUploadResponse,
          index,
          indexOfFile,
          path,
          chunksLength: length,
          resolve,
          createNewIfExist,
        });

        // console.log(`Uploaded chunk ${index}/${length}`, res);
      }
    }
  };

  retryConvertFiles = (t: TTranslation, fileId: number) =>
    retryConvertFilesImpl(this, t, fileId);

  retryUploadFiles = (t: TTranslation, uniqueId: string) =>
    retryUploadFilesImpl(this, t, uniqueId);

  retryQuotaFailedFiles = (t: TTranslation) =>
    retryQuotaFailedFilesImpl(this, t);

  startUploadFiles = async (t: TTranslation, createNewIfExist = true) => {
    this.finishUploadFilesCalled = false;

    const files = this.files;

    if (files.length === 0) {
      return this.finishUploadFiles(t);
    }

    const canProceed = await this.ensureEncryptionUnlockedForBatch();
    if (!canProceed) {
      this.cancelEncryptedBatchUpload();
    }

    const notUploadedFiles = this.files.filter(
      (f) => !f.inAction && !f.cancel && !f.error,
    );

    if (notUploadedFiles.length === 0) {
      runInAction(() => {
        this.uploaded = true;
        this.converted = true;
      });
      this.primaryProgressDataStore.setPrimaryProgressBarData({
        operation: OPERATIONS_NAME.upload,
        completed: true,
        withoutStatus: this.uploadedFilesHistory.length === 0,
        ...(this.uploadedFilesHistory.length === 0 && { showPanel: null }),
      });
      return;
    }

    const progressData = {
      completed: false,
      percent: this.percent,
      operation: OPERATIONS_NAME.upload,
      alert: false,
      canceled: false,
      showPanel: this.setUploadPanelVisible,
    };

    this.primaryProgressDataStore.setPrimaryProgressBarData(progressData);

    if (notUploadedFiles.some((f) => this.willEncryptItem(f))) {
      acquireUploadAutoLockSuspension();
    }

    this.parallelUploading(notUploadedFiles, t, createNewIfExist);
  };

  startSessionFunc = async (
    indexOfFile: number,
    t: TTranslation,
    createNewIfExist = true,
  ) => {
    const { isAIRoom } = this.selectedFolderStore;
    const { knowledgeId } = this.aiRoomStore;
    if (!this.uploaded && this.files.length === 0) {
      this.uploaded = true;
      this.asyncUploadObj = {};
      // setUploadData(uploadData);
      return;
    }

    const item = this.files[indexOfFile];

    this.files[indexOfFile].inAction = true;

    if (!item) {
      console.error("Empty files");
      return Promise.resolve();
    }

    if (
      item.action === "uploaded" ||
      item.action === "convert" ||
      item.action === "converted"
    ) {
      return Promise.resolve();
    }

    if (item.error) {
      return Promise.resolve();
    }

    const { chunkUploadSize } = this.filesSettingsStore;
    const { roomType, isPrivate } = this.getUploadEncryptionContext(item);

    const { file, toFolderId /* , action */ } = item;
    let fileToUpload = file;
    // Replaced with the obfuscated upload name for encrypted uploads.
    let fileName = file.name;

    const actualFolderId = isAIRoom ? knowledgeId : toFolderId;

    let uploadDEK: Uint8Array | null = null; // raw DEK for wrapping after upload
    let isEncrypted = file.encrypted || false;

    const { publicKey, userId } = this.getUserEncryptionKeys();
    // shouldEncryptUpload declares roomType: RoomsType, but
    // resolveItemRoomContext may return null/undefined (falsy at runtime).
    const shouldEncrypt =
      shouldEncryptUpload(roomType as RoomsType, isPrivate) &&
      !!publicKey &&
      !!userId;

    if (shouldEncrypt && !isEncrypted) {
      try {
        const prepared = await this.prepareFileForEncryptedUpload(
          file,
          toFolderId,
          (progress) => {
            const fileIndex = this.uploadedFilesHistory.findIndex(
              (f) => f.uniqueId === this.files[indexOfFile].uniqueId,
            );
            if (fileIndex > -1) {
              this.uploadedFilesHistory[fileIndex].percent = Math.floor(
                progress * 20,
              );
            }
            const newPercent = this.getFilesPercent();
            this.percent = newPercent;
            this.primaryProgressDataStore.setPrimaryProgressBarData({
              operation: OPERATIONS_NAME.upload,
              percent: newPercent,
              label: getI18n().t("Files:Encrypting"),
            });
          },
        );

        if (prepared.encrypted) {
          fileName = prepared.uploadFileName;
          fileToUpload = new File([prepared.data], prepared.uploadFileName, {
            type: "application/octet-stream",
            lastModified: file.lastModified,
          });
          uploadDEK = prepared.dek;
          isEncrypted = true;

          setFileDek(this.files[indexOfFile], uploadDEK);
          this.files[indexOfFile].encrypted = true;
        }
      } catch (error) {
        console.error("[ENCRYPTION] prepareFileForEncryptedUpload failed", {
          uniqueId: this.files[indexOfFile]?.uniqueId,
          message: (error as Error)?.message,
        });
        const orphanDek = takeFileDek(this.files[indexOfFile]);
        if (orphanDek) wipeDek(orphanDek);
        const errorMessage = getI18n().t("Common:EncryptionPrepareFailed");
        runInAction(() => {
          if (this.files[indexOfFile]) {
            this.files[indexOfFile].error = errorMessage;
            this.files[indexOfFile].percent = 0;
          }
          const historyIndex = this.uploadedFilesHistory.findIndex(
            (f) => f.uniqueId === this.files[indexOfFile]?.uniqueId,
          );
          if (historyIndex > -1) {
            this.uploadedFilesHistory[historyIndex].error = errorMessage;
            this.uploadedFilesHistory[historyIndex].percent = 0;
          }
        });
        try {
          toastr.error(errorMessage);
        } catch {
          //
        }
        const newPercent = this.getFilesPercent();
        this.percent = newPercent;
        this.primaryProgressDataStore.setPrimaryProgressBarData({
          operation: OPERATIONS_NAME.upload,
          percent: newPercent,
          alert: true,
        });
        this.currentUploadNumber -= 1;
        const nextFileIndex = this.files.findIndex((f) => !f.inAction);
        if (nextFileIndex !== -1) {
          this.startSessionFunc(nextFileIndex, t, createNewIfExist);
        } else {
          const allFilesIsUploaded =
            this.files.findIndex(
              (f) =>
                f.action !== "uploaded" &&
                f.action !== "convert" &&
                f.action !== "converted" &&
                !f.error &&
                !f.cancel,
            ) === -1;
          if (allFilesIsUploaded && !this.finishUploadFilesCalled) {
            this.finishUploadFilesCalled = true;
            if (!this.filesToConversion.length) {
              this.finishUploadFiles(t, !!this.tempConversionFiles?.length);
            }
          }
        }
        return;
      }
    }

    const fileSize = fileToUpload.size;
    // the original .js passed a (silently ignored) second
    // argument to Math.ceil; dropped because it has no runtime effect.
    const chunks = fileSize === 0 ? 1 : Math.ceil(fileSize / chunkUploadSize);

    return startUploadSession(
      // the original .js could pass null here when an AI room
      // has no knowledgeId yet; the assertion keeps that runtime unchanged.
      actualFolderId!,
      fileName,
      fileSize,
      "", // relativePath,
      isEncrypted,
      file.lastModifiedDate,
      createNewIfExist,
    )
      .then((res) => {
        const sessionId = res.id;
        const path = res.path;
        const operationId = res.id;
        const requestsDataArray = [];

        let chunk = 0;

        while (chunk < chunks) {
          const offset = chunk * chunkUploadSize;
          const formData = new FormData();
          formData.append(
            "file",
            fileToUpload.slice(offset, offset + chunkUploadSize),
          );
          requestsDataArray.push(formData);
          chunk++;
        }

        return {
          sessionId,
          folderId: actualFolderId,
          requestsDataArray,
          path,
          operationId,
        };
      })
      .then(({ sessionId, folderId, requestsDataArray, path, operationId }) => {
        const fileIndex = this.uploadedFilesHistory.findIndex(
          (f) => f.uniqueId === this.files[indexOfFile].uniqueId,
        );
        if (fileIndex > -1)
          this.uploadedFilesHistory[fileIndex].percent = chunks < 2 ? 50 : 0;

        return this.uploadFileChunks(
          sessionId,
          folderId!,
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
      })
      .catch((error: unknown) => {
        const orphanDek = takeFileDek(this.files[indexOfFile]);
        if (orphanDek) wipeDek(orphanDek);

        if (this.files[indexOfFile] === undefined) {
          this.primaryProgressDataStore.setPrimaryProgressBarData({
            operation: OPERATIONS_NAME.upload,
            completed: true,
            alert: true,
          });
          return Promise.resolve();
        }
        let errorMessage = "";
        if (typeof error === "object") {
          const axiosErr = error as TAxiosLikeError;
          errorMessage =
            axiosErr?.response?.data?.error?.message ||
            axiosErr?.statusText ||
            axiosErr?.message ||
            "";
        } else {
          errorMessage = error as string;
        }

        const isQuota = isQuotaError(error);

        runInAction(() => {
          this.files[indexOfFile].error = errorMessage;
          this.files[indexOfFile].isQuotaError = isQuota;
          const fileIndex = this.uploadedFilesHistory.findIndex(
            (f) => f.uniqueId === this.files[indexOfFile].uniqueId,
          );
          if (fileIndex > -1) {
            this.uploadedFilesHistory[fileIndex].error = errorMessage;
            this.uploadedFilesHistory[fileIndex].isQuotaError = isQuota;
          }

          if (isQuota && !this.quotaErrorRaised) {
            this.quotaErrorRaised = true;
            const currentUniqueId = this.files[indexOfFile].uniqueId;
            this.files.forEach((queued, idx) => {
              if (
                queued.uniqueId === currentUniqueId ||
                queued.inAction ||
                queued.error ||
                queued.cancel ||
                queued.action !== "upload"
              )
                return;

              this.files[idx].error = errorMessage;
              this.files[idx].isQuotaError = true;
              this.files[idx].inAction = true;
              const historyIndex = this.uploadedFilesHistory.findIndex(
                (h) => h.uniqueId === queued.uniqueId,
              );
              if (historyIndex > -1) {
                this.uploadedFilesHistory[historyIndex].error = errorMessage;
                this.uploadedFilesHistory[historyIndex].isQuotaError = true;
              }
            });
          }
        });

        const newPercent = this.getFilesPercent();
        this.percent = newPercent;

        const allFilesIsUploaded =
          this.files.findIndex(
            (f) =>
              f.action !== "uploaded" &&
              f.action !== "convert" &&
              f.action !== "converted" &&
              !f.error &&
              !f.cancel,
          ) === -1;

        this.primaryProgressDataStore.setPrimaryProgressBarData({
          operation: OPERATIONS_NAME.upload,
          percent: newPercent,
          completed: allFilesIsUploaded,
          alert: true,
        });

        this.currentUploadNumber -= 1;

        if (!this.quotaErrorRaised) {
          const nextFileIndex = this.files.findIndex((f) => !f.inAction);

          if (nextFileIndex !== -1) {
            this.startSessionFunc(nextFileIndex, t, createNewIfExist);
          }
        }

        return Promise.resolve();
      })
      .finally(() => {
        const allFilesIsUploaded =
          this.files.findIndex(
            (f) =>
              f.action !== "uploaded" &&
              f.action !== "convert" &&
              f.action !== "converted" &&
              !f.error &&
              !f.cancel,
          ) === -1;

        if (allFilesIsUploaded && !this.finishUploadFilesCalled) {
          this.finishUploadFilesCalled = true;

          if (!this.filesToConversion.length) {
            this.finishUploadFiles(t, !!this.tempConversionFiles.length);
          } else {
            runInAction(() => {
              this.uploaded = true;
              this.asyncUploadObj = {};
            });
          }
        }
      });
  };

  showFinishUploadToastr = (
    t: TTranslation,
    totalErrorsCount: number,
    filesWithoutErrors: TUploadFile[],
    filesWithErrors: TUploadFile[],
    filesWithAllErrors: number,
  ) => {
    if (totalErrorsCount === 0) {
      toastr.success(
        t("Common:ItemsSuccessfullyUploaded", {
          count: filesWithoutErrors.length,
        }),
      );
      return;
    }

    this.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: OPERATIONS_NAME.upload,
      alert: true,
      errorCount: filesWithAllErrors,
    });

    this.uploadedFilesHistory.forEach((f) => {
      f.errorShown = true;
    });

    const hasQuotaError = filesWithErrors.some((f) => f.isQuotaError);

    if (hasQuotaError) {
      toastr.error(
        <Trans
          i18nKey="UploadPanel:QuotaExceededDuringUpload"
          t={t as TTranslation & TFunction}
          values={{
            uploaded: filesWithoutErrors.length,
            total: filesWithoutErrors.length + filesWithAllErrors,
          }}
          components={[
            <Link
              key="a"
              tag="a"
              isHovered
              color="accent"
              onClick={() => {
                toastr.clear();
                this.setUploadPanelVisible(true);
              }}
            />,
          ]}
        />,
        null,
        60000,
        true,
      );
      return;
    }

    if (totalErrorsCount > 1) {
      toastr.error(t("UploadPanel:UploadingError"));
      return;
    }

    const errorItem = filesWithErrors[0];
    // the original .js called error.indexOf without a guard —
    // items in filesWithErrors always have a truthy error string.
    const passwordErrorIndex = errorItem.error!.indexOf("password");

    if (passwordErrorIndex === -1) {
      toastr.error(errorItem.error);
      return;
    }

    toastr.warning(
      <Trans
        i18nKey="Common:PasswordProtectedFiles"
        t={t as TTranslation & TFunction}
        components={[
          <Link
            key="a"
            tag="a"
            isHovered
            color="accent"
            onClick={() => {
              toastr.clear();
              this.setUploadPanelVisible(true);
            }}
          />,
        ]}
      />,
      null,
      60000,
      true,
    );
  };

  finishUploadFiles = (t: TTranslation, waitConversion?: boolean) => {
    releaseUploadAutoLockSuspension();

    const filesWithErrors = this.uploadedFilesHistory.filter(
      (f) => f.error && !f.errorShown,
    );
    const filesWithAllErrors = this.uploadedFilesHistory.filter((f) => f.error);
    const filesWithoutErrors = this.uploadedFilesHistory.filter(
      (f) => !f.error,
    );

    this.showFinishUploadToastr(
      t,
      filesWithAllErrors.length,
      filesWithoutErrors,
      filesWithErrors,
      filesWithAllErrors.length,
    );

    this.uploaded = true;
    this.converted = true;
    this.uploadedFilesSize = 0;
    this.asyncUploadObj = {};

    this.files = this.files.map((f) => {
      f.isCalculated = true;
      return f;
    });

    const uploadData: TUploadData = {
      filesSize: 0,
      uploadedFiles: 0,
      percent: 0,
      conversionPercent: 0,
      totalErrorsCount: 0,
    };

    if (this.files.length > 0) {
      const toFolderId = this.files[0]?.toFolderId;

      if (toFolderId) {
        // the socket typings declare the RefreshFolder payload
        // as a string, but the original .js has always sent this object.
        SocketHelper?.emit(SocketCommands.RefreshFolder, {
          toFolderId,
        } as unknown as string);
      }
    }

    if (!waitConversion)
      this.primaryProgressDataStore.setPrimaryProgressBarData({
        operation: OPERATIONS_NAME.upload,
        completed: true,
      });

    setTimeout(() => {
      // PrimaryProgressDataStore has no `alert` member (it has
      // primaryOperationsAlert); the original .js read an undefined property
      // here, which the cast preserves without changing the runtime.
      if (
        this.uploadPanelVisible ||
        (this.primaryProgressDataStore as { alert?: boolean }).alert
      ) {
        uploadData.files = this.files;
        uploadData.filesToConversion = this.filesToConversion;
      }

      this.setUploadData(uploadData);
    }, TIMEOUT);
  };

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

