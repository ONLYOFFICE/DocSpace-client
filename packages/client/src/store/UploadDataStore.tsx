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
import uniqueid from "lodash/uniqueId";
import sumBy from "lodash/sumBy";
import {
  AnalyticsEvents,
  ConflictResolveType,
  RoomsType,
} from "@docspace/shared/enums";
import SocketHelper, { SocketCommands } from "@docspace/ui-kit/utils/socket";
import {
  prepareEncryptedUpload,
  shouldEncryptUpload,
  resolveItemRoomContext,
  willEncryptUploadItem,
} from "@docspace/shared/services/private-room/encrypted-upload";
import {
  getFileInfo,
  getFolderInfo,
  uploadFile,
  convertFile,
  startUploadSession,
  uploadChunkSequential,
  uploadChunkParallel,
  finalizeUploadSession,
  copyToFolder,
  moveToFolder,
  fileCopyAs,
  checkIsFileExist,
  setFileEncryptionKeys,
  getFileEncryptionAccess,
} from "@docspace/shared/api/files";
import { getRoomEncryptionKeys } from "@docspace/shared/api/privacy";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { wipeDek } from "@docspace/shared/services/encryption/file-keys";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import {
  getActiveKeyId,
  selectActiveKey,
} from "@docspace/shared/services/encryption/active-key-preference";
import {
  rememberEncryptedFilename,
  resolveDisplayTitle,
} from "@docspace/shared/services/encryption/filename-cache";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";

import { getUnexpectedErrorText } from "SRC_DIR/helpers/filesUtils";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import { hasOwnProperty } from "@docspace/shared/utils/object";
import {
  countActiveUploadsForRoom,
  isQuotaError,
} from "@docspace/shared/utils/uploadErrors";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { FileOperationStatus } from "@docspace/shared/enums";
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
  getConversationProgress,
  hasFileDek,
  releaseUploadAutoLockSuspension,
  removeDuplicate,
  setFileDek,
  takeFileDek,
} from "./uploadDataStore/helpers";
import type {
  TConversionProgress,
  TUploadBrowserFile,
  TUploadFile,
} from "./uploadDataStore/helpers";

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

// FABLE5-REVIEW: conversion panel items are produced by still-.js callers
// (ConvertDialog, files view context options); minimal structural type of
// the members used in this store.
type TConversionFile = {
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

type TStartUploadData = TUploadData & {
  files: TUploadFile[];
  filesSize: number;
  uploadedFilesHistory: TUploadFile[];
  newFilesWithoutConversion: TUploadFile[];
  allNewFiles: TUploadFile[];
};

// FABLE5-REVIEW: the chunk upload endpoints (uploadChunkParallel,
// uploadChunkSequential, finalizeUploadSession) are untyped in shared/api
// (raw request); shape observed from the usage in this store.
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

type TPbData = {
  operation: TOperationName;
  operationId: string;
};

type TItemOperationData = {
  // FABLE5-REVIEW: the copy/move API declares destFolderId as number, but
  // still-.js/.tsx callers also pass string ids (third-party), null or
  // undefined.
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

type TAxiosLikeError = {
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

  wrapForSelfThenRoom = async (
    fileId: number,
    currentUserId: string,
    publicKeyBase64: string,
    publicKeyId: string,
    dek: Uint8Array,
    roomId: number | string | null,
  ) => {
    try {
      const identity = await requireUnlock(currentUserId);
      if (!identity) {
        throw new Error(
          "Encryption identity is locked — cannot wrap DEK for upload",
        );
      }
      const ownWraps = await wrapDekForRecipients({
        dek,
        senderIdentity: identity,
        senderUserId: currentUserId,
        recipients: [
          {
            userId: currentUserId,
            publicKey: publicKeyBase64,
            publicKeyId,
          },
        ],
        fileId,
      });
      await setFileEncryptionKeys(fileId, ownWraps);
      await this.encryptKeysForRoomMembers(
        fileId,
        currentUserId,
        roomId,
        dek,
        identity,
      );
    } finally {
      wipeDek(dek);
    }
  };

  encryptKeysForRoomMembers = async (
    fileId: number,
    currentUserId: string,
    roomId: number | string | null,
    dek: Uint8Array,
    identity: IdentityKeyPair,
  ) => {
    try {
      if (!roomId) {
        console.error(
          "[ENCRYPTION] encryptKeysForRoomMembers called without roomId",
        );
        return;
      }
      if (!dek || !identity) {
        console.error(
          "[ENCRYPTION] encryptKeysForRoomMembers called without dek/identity",
        );
        return;
      }
      const [publicKeys, encryptionInfo] = await Promise.all([
        getRoomEncryptionKeys(roomId),
        getFileEncryptionAccess(fileId),
      ]);

      const existingFileKeys = encryptionInfo.fileKeys ?? [];
      const existingKeyPairs = new Set(
        existingFileKeys.map(
          (k) => `${String(k.userId)}:${k.publicKeyId || ""}`,
        ),
      );

      const recipients: {
        userId: string;
        publicKey: string;
        publicKeyId: string;
      }[] = [];
      if (Array.isArray(publicKeys)) {
        for (const pk of publicKeys) {
          if (!pk.publicKey || !pk.userId) continue;
          const uid = String(pk.userId);
          if (uid === String(currentUserId)) continue;
          const pairKey = `${uid}:${pk.id || ""}`;
          if (existingKeyPairs.has(pairKey)) continue;

          recipients.push({
            userId: uid,
            publicKey: pk.publicKey,
            publicKeyId: pk.id || "",
          });
        }
      }
      if (recipients.length === 0) return;

      const newKeys = await wrapDekForRecipients({
        dek,
        senderIdentity: identity,
        senderUserId: String(currentUserId),
        recipients,
        fileId,
      });

      if (newKeys.length > 0) {
        const allKeys = [
          ...existingFileKeys.map((k) => ({
            userId: k.userId,
            publicKeyId: k.publicKeyId || "",
            privateKeyEnc: k.privateKeyEnc,
          })),
          ...newKeys,
        ];
        await setFileEncryptionKeys(fileId, allKeys);
      }
    } catch (error) {
      console.error(
        "[ENCRYPTION] Failed to encrypt keys for room members:",
        error,
      );
    }
  };

  getUserEncryptionKeys = (): {
    publicKey: string | null;
    userId: string | null;
    publicKeyId: string | null;
  } => {
    const keys = this.userStore?.encryptionKeys;
    const userId = this.userStore?.user?.id;

    if (!Array.isArray(keys) || keys.length === 0 || !userId) {
      return { publicKey: null, userId: null, publicKeyId: null };
    }

    const userIdStr = String(userId);
    const activeKey = selectActiveKey(keys, getActiveKeyId(userIdStr));
    if (!activeKey) {
      return { publicKey: null, userId: null, publicKeyId: null };
    }

    return {
      publicKey: activeKey.publicKey || null,
      userId: userIdStr,
      publicKeyId: activeKey.id || null,
    };
  };

  shouldEncryptCurrentUpload = () => {
    const isPrivate = this.treeFoldersStore.isPrivacyFolder;
    const roomType = isPrivate
      ? RoomsType.CustomRoom
      : this.selectedFolderStore.roomType;
    const { publicKey, userId } = this.getUserEncryptionKeys();
    // FABLE5-REVIEW: shouldEncryptUpload declares roomType: RoomsType, but the
    // original .js passed selectedFolderStore.roomType which can be null
    // (isEncryptableRoomType(null) is simply false at runtime).
    return (
      shouldEncryptUpload(roomType as RoomsType, isPrivate) &&
      !!publicKey &&
      !!userId
    );
  };

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

  willEncryptItem = (item: TUploadFile | null | undefined) => {
    if (!item) return false;
    const { publicKey, userId } = this.getUserEncryptionKeys();
    return willEncryptUploadItem(
      {
        uploadContext: item.file?.uploadContext,
        alreadyEncrypted: item.encrypted,
        publicKey,
        userId,
      },
      this.getUploadFolderContext(),
    );
  };

  ensureEncryptionUnlockedForBatch = async () => {
    const { userId } = this.getUserEncryptionKeys();
    if (!userId) return true;

    const needsUnlock = this.files.some(
      (item) =>
        !item.inAction &&
        !item.error &&
        !item.cancel &&
        item.action === "upload" &&
        this.willEncryptItem(item),
    );

    if (!needsUnlock) return true;

    const identity = await requireUnlock(String(userId));
    return !!identity;
  };

  cancelEncryptedBatchUpload = () => {
    runInAction(() => {
      this.files.forEach((item) => {
        if (
          item.inAction ||
          item.error ||
          item.cancel ||
          item.action !== "upload" ||
          !this.willEncryptItem(item)
        )
          return;

        item.cancel = true;
        item.action = "uploaded";
        item.percent = 100;
        this.uploadedFilesHistory = this.uploadedFilesHistory.filter(
          (f) => f.uniqueId !== item.uniqueId,
        );
      });

      this.percent = this.getFilesPercent();
    });

    try {
      toastr.info(getI18n().t("Common:EncryptionUploadCancelled"));
    } catch {
      //
    }
  };

  prepareFileForEncryptedUpload = async (
    file: TUploadBrowserFile,
    folderId: number | string | null | undefined,
    onProgress?: (progress: number) => void,
  ) => {
    const overrideCtx = file?.uploadContext;
    const ancestorIsPrivate = this.treeFoldersStore.isPrivacyFolder;
    const roomType =
      overrideCtx?.roomType ??
      (ancestorIsPrivate
        ? RoomsType.CustomRoom
        : this.selectedFolderStore.roomType);
    const isPrivate =
      overrideCtx && "isPrivate" in overrideCtx
        ? overrideCtx.isPrivate
        : ancestorIsPrivate;
    return prepareEncryptedUpload({
      file,
      // FABLE5-REVIEW: UploadConfig.folderId is declared as number, but the
      // original .js forwarded toFolderId which may be a string/null for
      // third-party folders.
      folderId: folderId as number,
      roomType: roomType || RoomsType.CustomRoom,
      isPrivate: isPrivate || false,
      onProgress,
    });
  };

  removeFiles = (fileIds: number[]) => {
    fileIds.forEach((id) => {
      this.files = this.files?.filter(
        (file) => !(file.action === "converted" && file.fileInfo?.id === id),
      );
    });
  };

  getActiveUploadCountForRoom = (
    roomId: string | number | null | undefined,
  ) => {
    return countActiveUploadsForRoom(this.files, roomId);
  };

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

  getUploadedFile = (id: string) => {
    return this.files.filter((f) => f.uniqueId === id);
  };

  cancelUpload = () => {
    this.finishUploadFilesCalled = false;

    const newUploadData = {
      filesSize: this.filesSize,
      uploadedFiles: this.uploadedFiles,
      percent: 100,
      uploaded: true,
      converted: true,
      currentUploadNumber: 0,
    };

    const newHistory = this.uploadedFilesHistory.filter(
      (el) =>
        el.action === "uploaded" ||
        el.action === "converted" ||
        (el.action === "upload" && el.error) ||
        (el.action === "convert" && el.error) ||
        (el.action === "convert" && el.inConversion),
    );
    this.filesToConversion = this.filesToConversion.filter(
      (el) => el.inConversion,
    );

    const shouldCancelFile = (file: TUploadFile) => {
      return (
        file.action === "upload" ||
        (file.action === "convert" && !file.inConversion)
      );
    };

    this.files = this.files.map((file) =>
      shouldCancelFile(file) ? { ...file, cancel: true } : file,
    );

    this.setUploadData(newUploadData);
    this.uploadedFilesHistory = newHistory;
    this.quotaErrorRaised = false;

    // FABLE5-REVIEW: the original .js referenced the bare global `i18n`
    // (window.i18n populated by SRC_DIR/i18n.js); `window.i18n!.t!` keeps the
    // exact runtime resolution.
    this.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: OPERATIONS_NAME.upload,
      completed: true,
      canceled: true,
      alert: true,
      label: window.i18n!.t!("Common:CanceledOperation", {
        operationName: window.i18n!.t!("Common:Uploading"),
      }),
    });

    toastr.info(window.i18n!.t!("Common:CancelUpload"));
  };

  cancelConversion = () => {
    const newFiles = [];

    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      if (file.action === "converted" || file.error || file.inConversion) {
        newFiles.push(this.files[i]);
      }
    }

    const newUploadData = {
      files: newFiles,
      filesToConversion: [],
      filesSize: this.filesSize,
      uploadedFiles: this.uploadedFiles,
      percent: 100,
      uploaded: true,
      converted: true,
    };

    if (newUploadData.files.length === 0) this.setUploadPanelVisible(false);
    this.setUploadData(newUploadData);
  };

  clearConversionData = () => {
    this.displayedConversionFiles = [];
    this.activeConversionQueue = [];
    this.convertedFromFiles = true;
  };

  cancelCurrentUpload = (id: string, t: TTranslation) => {
    runInAction(() => {
      const uploadedFilesHistory = this.uploadedFilesHistory.filter(
        (el) => el.uniqueId !== id,
      );

      // FABLE5-REVIEW: the original .js assumed the canceled file is always
      // found (would throw on undefined); the non-null assertion keeps that.
      const canceledFile = this.files.find((f) => f.uniqueId === id)!;
      const newPercent = this.getFilesPercent(); // canceledFile.file.size
      canceledFile.cancel = true;
      canceledFile.percent = 100;
      canceledFile.action = "uploaded";

      this.currentUploadNumber -= 1;
      this.uploadedFilesHistory = uploadedFilesHistory;
      this.percent = newPercent;
      const nextFileIndex = this.files.findIndex((f) => !f.inAction);

      if (nextFileIndex !== -1) {
        this.startSessionFunc(nextFileIndex, t);
      }
    });
  };

  cancelCurrentFileConversion = (fileId: string) => {
    const { convertItem, setConvertItem } = this.dialogsStore;
    convertItem && setConvertItem(null);

    const files = this.files.filter((el) => `${el.fileId}` !== fileId);
    const filesToConversion = this.filesToConversion.filter(
      (el) => `${el.fileId}` !== fileId,
    );

    const newUploadData = {
      files,
      filesToConversion,
      filesSize: this.filesSize,
      uploadedFiles: this.uploadedFiles,
      percent: this.percent,
    };

    this.setUploadData(newUploadData);
  };

  convertFileFromFiles = (
    file: TConversionFile,
    t: TTranslation,
    isOpen?: boolean,
  ) => {
    this.dialogsStore.setConvertItem(null);
    const fileIndex =
      file.index ??
      this.displayedConversionFiles.findIndex(
        (el) => el.fileId === file.fileId,
      );

    if (fileIndex > -1 && this.displayedConversionFiles[fileIndex].inConversion)
      return;

    const secondConvertingWithPassword =
      hasOwnProperty(file, "password") || fileIndex > -1;
    const conversionPositionIndex =
      hasOwnProperty(file, "index") || fileIndex > -1;

    this.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: OPERATIONS_NAME.convert,
      alert: false,
      // FABLE5-REVIEW: the original .js expression `!length === 0` compares a
      // boolean to a number and therefore always evaluates to false; the cast
      // keeps the expression (and its result) unchanged.
      completed: (!this.activeConversionQueue.length as unknown) === 0,
      showPanel: this.setConversionPanelVisible,
      withoutProgress: true,
    });

    const isFirstConversion = !this.activeConversionQueue.length;
    this.activeConversionQueue.push(file);

    const shouldUpdateExistingFile =
      secondConvertingWithPassword && conversionPositionIndex;

    if (shouldUpdateExistingFile) {
      const updatedFile = this.displayedConversionFiles[fileIndex];

      // FABLE5-REVIEW: the original .js assumed fileInfo is set on both items
      // in the "second conversion with password" flow (would throw otherwise).
      updatedFile.fileInfo!.fileExst = file.fileInfo!.fileExst;

      this.displayedConversionFiles[fileIndex].action = "convert";
      this.displayedConversionFiles[fileIndex].error = null;
      this.displayedConversionFiles[fileIndex].errorShown = false;
    } else {
      this.displayedConversionFiles.push(file);
    }

    if (isFirstConversion) {
      this.startConversionFromFiles(t, isOpen);
    }
  };

  convertFile = (file: TUploadFile, t: TTranslation, isOpen?: boolean) => {
    this.dialogsStore.setConvertItem(null);

    const fileHistoryIndex = this.uploadedFilesHistory.findIndex(
      (el) => el.fileId === file.fileId,
    );
    const secondConverting = fileHistoryIndex > -1;

    if (
      secondConverting &&
      this.uploadedFilesHistory[fileHistoryIndex].inConversion
    )
      return;

    if (this.converted) {
      this.filesToConversion = [];
      this.convertFilesSize = 0;
    }

    const operationName = OPERATIONS_NAME.upload;
    this.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: operationName,
      alert: false,
    });

    this.uploadedFilesHistory[fileHistoryIndex].action = "convert";
    this.uploadedFilesHistory[fileHistoryIndex].error = null;
    this.uploadedFilesHistory[fileHistoryIndex].errorShown = false;

    if (!this.filesToConversion.length) {
      this.filesToConversion.push(file);

      this.startConversion(t, isOpen);
    } else {
      this.filesToConversion.push(file);
    }
  };

  getNewPercent = (uploadedSize: number, indexOfFile: number) => {
    const newTotalSize = sumBy(this.files, (f) =>
      f.file && !this.uploaded ? f.file.size : 0,
    );
    const totalUploadedFiles = this.files.filter((_, i) => i < indexOfFile);
    const totalUploadedSize = sumBy(totalUploadedFiles, (f) =>
      f.file && !this.uploaded ? f.file.size : 0,
    );
    const newPercent =
      ((uploadedSize + totalUploadedSize) / newTotalSize) * 100;

    return newPercent;
  };

  getFilesPercent = () => {
    // const newTotalSize = sumBy(this.files, (f) =>
    //   !f.isCalculated && f.file && !this.uploaded ? f.file.size : 0,
    // );

    // const newPercent = (newSize / newTotalSize) * 100;

    const percentCurrentFileHistory = sumBy(
      this.uploadedFilesHistory,
      (f) => f.percent,
    );

    const commonPercent = this.uploadedFilesHistory.length * 100;
    const newPercent = (percentCurrentFileHistory / commonPercent) * 100;

    return newPercent;
  };

  setConversionPercent = (percent: number, alert?: boolean) => {
    const data = {
      operation: OPERATIONS_NAME.upload,
      percent,
      completed: false,
    };

    if (this.uploaded) {
      this.primaryProgressDataStore.setPrimaryProgressBarData(
        alert ? { ...data, ...{ alert } } : data,
      );
    }
  };

  getConversationPercent = (fileIndex: number) => {
    const length = this.files.filter((f) => f.needConvert).length;
    return (fileIndex / length) * 100;
  };

  startConversionFromFiles = async (t: TTranslation, isOpen = false) => {
    const operationName = OPERATIONS_NAME.convert;

    runInAction(() => (this.convertedFromFiles = false));

    let index = 0;
    this.activeConversionQueue = removeDuplicate(this.activeConversionQueue);
    const filesToConversion = this.activeConversionQueue;

    while (index < filesToConversion.length) {
      const conversionItem = filesToConversion[index];
      const { fileId, password, format } = conversionItem;
      const itemPassword = password || null;

      // FABLE5-REVIEW: `find` and `findIndex` use the same predicate on the
      // same array, so after the `fileIndex === -1` break the original .js
      // relied on historyFile being defined; the non-null assertions keep it.
      const historyFile = this.displayedConversionFiles.find(
        (f) => f.fileId === fileId,
      );
      const fileIndex = this.displayedConversionFiles.findIndex(
        (f) => f.fileId === fileId,
      );

      if (fileIndex === -1) break;

      runInAction(() => (historyFile!.inConversion = true));

      const res = convertFile(fileId, format, itemPassword).catch(() => {
        const error = t("Common:FailedToConvert");

        runInAction(() => {
          historyFile!.error = error;
        });

        if (this.convertedFromFiles) {
          this.primaryProgressDataStore.setPrimaryProgressBarData({
            operation: operationName,
            alert: true,
          });
        }

        return null;
      });

      const data = await res;
      if (!data || !data[0]) {
        index++;
        break;
      }

      let progress: number | undefined = data[0].progress;
      let fileInfo: TFile | "password" | null | undefined = null;
      let error: string | null | undefined = null;

      // FABLE5-REVIEW: `(progress ?? 100) < 100` is runtime-identical to the
      // original `progress < 100` (undefined < 100 is false, as is 100 < 100).
      while ((progress ?? 100) < 100) {
        const response = await getConversationProgress(fileId);
        progress = response?.[0]?.progress;
        fileInfo = response?.[0]?.result;

        historyFile!.convertProgress = progress;

        error = response && response[0] && response[0].error;

        if (error?.length) {
          this.primaryProgressDataStore.setPrimaryProgressBarData({
            operation: operationName,
            alert: true,
          });

          runInAction(() => {
            historyFile!.error = error;
            historyFile!.inConversion = false;
            historyFile!.needPassword = fileInfo === "password";
          });

          break;
        }
      }

      if (progress === 100) {
        if (!error) error = data[0].error;

        if (!error && isOpen && data && data[0]) {
          // FABLE5-REVIEW: the original .js read fileInfo.id without a guard
          // (fileInfo is the conversion result; would throw on null).
          this.filesStore.openDocEditor((fileInfo as TFile).id);
        }

        runInAction(() => {
          historyFile!.error = error;
          historyFile!.convertProgress = progress;
          historyFile!.inConversion = false;

          // FABLE5-REVIEW: the original .js called error.indexOf without a
          // guard (would throw when the conversion result has no error text).
          if (error!.indexOf("password") !== -1) {
            historyFile!.needPassword = true;
          } else historyFile!.action = "converted";

          if (fileInfo && fileInfo !== "password") {
            historyFile!.fileInfo = fileInfo;
          }
        });

        if (
          !historyFile?.error &&
          (historyFile?.fileInfo?.version ?? 0) > 2
        ) {
          this.filesStore.setHighlightFile({
            highlightFileId: historyFile!.fileInfo!.id,
            isFileHasExst: !historyFile!.fileInfo!.fileExst,
          });
        }
      }

      index++;
    }

    this.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: operationName,
      completed: true,
    });

    runInAction(() => {
      this.convertedFromFiles = true;

      if (this.convertedFromFiles) {
        this.activeConversionQueue = [];
      }
    });
  };

  startConversion = async (t: TTranslation, isOpen = false) => {
    const { isRecentFolder, isFavoritesFolder, isSharedWithMeFolder } =
      this.treeFoldersStore;

    if (!this.converted) return;

    const { storeOriginalFiles } = this.filesSettingsStore;

    const isSortedFolder =
      isRecentFolder || isFavoritesFolder || isSharedWithMeFolder;
    const needToRefreshFilesList = !isSortedFolder || !storeOriginalFiles;

    runInAction(() => (this.converted = false));

    this.setConversionPercent(0, false);

    let index = 0;
    let len = this.filesToConversion.length;
    this.filesToConversion = removeDuplicate(this.filesToConversion);
    let filesToConversion = this.filesToConversion;

    while (index < len) {
      const conversionItem = filesToConversion[index];
      const { fileId, password, format } = conversionItem;
      const itemPassword = password || null;
      const file = this.files.find((f) => f.fileId === fileId);
      if (file) runInAction(() => (file.inConversion = true));

      const historyFile = this.uploadedFilesHistory.find(
        (f) => f.fileId === fileId,
      );
      if (historyFile) runInAction(() => (historyFile.inConversion = true));

      const numberFiles = this.files.filter((f) => f.needConvert).length;

      const res = convertFile(fileId, format, itemPassword).catch(() => {
        const error = t("Common:FailedToConvert");

        runInAction(() => {
          if (file) {
            file.error = error;
            file.inConversion = false;
          }
          if (historyFile) {
            historyFile.error = error;
            historyFile.inConversion = false;
          }
        });

        if (this.uploaded) {
          const primaryProgressData = {
            operation: OPERATIONS_NAME.upload,
            alert: true,
          };

          this.primaryProgressDataStore.setPrimaryProgressBarData(
            numberFiles === 1
              ? { ...primaryProgressData, ...{ percent: 100, completed: true } }
              : primaryProgressData,
          );
        }

        return null;
      });

      const data = await res;

      if (data && data[0]) {
        let progress: number | undefined = data[0].progress;
        let fileInfo: TFile | "password" | null | undefined = null;
        let error: string | null | undefined = null;

        // FABLE5-REVIEW: `(progress ?? 100) < 100` is runtime-identical to
        // the original `progress < 100` (undefined < 100 is false).
        while ((progress ?? 100) < 100) {
          let response: TConversionProgress[] | null = null;
          try {
            response = await getConversationProgress(fileId);
            progress = response?.[0]?.progress;
            fileInfo = response?.[0]?.result;
          } catch (err) {
            // console.log("Error in startConversion while loop:", fileId, err);
            const conversionError =
              (err as Error).message || t("Common:FailedToConvert");

            runInAction(() => {
              if (file) {
                file.error = conversionError;
                file.inConversion = false;
              }
              if (historyFile) {
                historyFile.error = conversionError;
                historyFile.inConversion = false;
              }
            });

            break;
          }

          runInAction(() => {
            const currentFile = this.files.find((f) => f.fileId === fileId);
            if (currentFile) currentFile.convertProgress = progress;

            const hFile = this.uploadedFilesHistory.find(
              (f) => f.fileId === fileId,
            );
            if (hFile) hFile.convertProgress = progress;
          });

          error = response && response[0] && response[0].error;

          if (error?.length) {
            const percent = this.getConversationPercent(index + 1);
            this.setConversionPercent(percent, !!error);

            runInAction(() => {
              const newFile = this.files.find((f) => f.fileId === fileId);
              if (newFile) {
                newFile.error = error;
                newFile.inConversion = false;
                if (fileInfo === "password") {
                  newFile.needPassword = true;

                  this.primaryProgressDataStore.setPrimaryProgressBarData({
                    operation: OPERATIONS_NAME.upload,
                    alert: true,
                  });
                }
              }

              const hFile = this.uploadedFilesHistory.find(
                (f) => f.fileId === fileId,
              );
              const fileIndex = this.uploadedFilesHistory.findIndex(
                (f) => f.fileId === fileId,
              );

              if (hFile) {
                hFile.error = error;
                hFile.inConversion = false;
                if (fileInfo === "password") hFile.needPassword = true;

                const operationObject = this.uploadedFilesHistory[fileIndex];
                Object.assign(operationObject, hFile);
              }
            });

            // this.refreshFiles(toFolderId, false);
            break;
          }

          const percent = this.getConversationPercent(index + 1);

          this.setConversionPercent(percent, false);
        }

        if (progress === 100) {
          if (!error) error = data[0].error;

          if (!error && isOpen && data && data[0]) {
            // FABLE5-REVIEW: the original .js read fileInfo.id without a
            // guard (fileInfo is the conversion result; would throw on null).
            this.filesStore.openDocEditor((fileInfo as TFile).id);
          }

          runInAction(() => {
            const currentFile = this.files.find((f) => f.fileId === fileId);

            if (currentFile) {
              currentFile.error = error;
              currentFile.convertProgress = progress;
              currentFile.inConversion = false;
              // FABLE5-REVIEW: the original .js could transiently store the
              // "password" marker string here; the cast keeps that runtime.
              if (fileInfo) currentFile.fileInfo = fileInfo as TFile;

              // FABLE5-REVIEW: the original .js called error.indexOf without
              // a guard (would throw when there is no error text).
              if (error!.indexOf("password") !== -1) {
                currentFile.needPassword = true;
              } else currentFile.action = "converted";
            }

            const hFile = this.uploadedFilesHistory.find(
              (f) => f.fileId === fileId,
            );

            if (hFile) {
              hFile.error = error;
              hFile.convertProgress = progress;
              hFile.inConversion = false;

              if (error!.indexOf("password") !== -1) {
                hFile.needPassword = true;

                this.primaryProgressDataStore.setPrimaryProgressBarData({
                  operation: OPERATIONS_NAME.upload,
                  alert: true,
                });
              } else hFile.action = "converted";
            }
          });

          storeOriginalFiles &&
            fileInfo &&
            fileInfo !== "password" &&
            this.refreshFiles(file);

          if (file && fileInfo && fileInfo !== "password") {
            file.fileInfo = fileInfo;
            if (historyFile) historyFile.fileInfo = fileInfo;
            needToRefreshFilesList && this.refreshFiles(file);
          }

          if (file && isSortedFolder) {
            const folderId = file.fileInfo?.folderId;
            const fileTitle = resolveDisplayTitle({
              id: file.fileInfo?.id,
              title: file.fileInfo?.title,
              encrypted: file.encrypted ?? file.fileInfo?.encrypted,
            });

            folderId &&
              getFolderInfo(folderId)
                .then((folderInfo) =>
                  toastr.success(
                    t("InfoCreateFileIn", {
                      fileTitle,
                      folderTitle: folderInfo.title,
                    }),
                  ),
                )
                .catch((err) => toastr.error(err as string));
          }
          const percent = this.getConversationPercent(index + 1);
          this.setConversionPercent(percent, !!error);

          if (!file?.error && (file?.fileInfo?.version ?? 0) > 2) {
            this.filesStore.setHighlightFile({
              highlightFileId: file!.fileInfo!.id,
              isFileHasExst: !file!.fileInfo!.fileExst,
            });
          }
        }
      }

      index++;
      filesToConversion = this.filesToConversion;
      len = filesToConversion.length;
    }

    const allFilesIsUploaded =
      this.files.findIndex(
        (f) =>
          f.action !== "uploaded" &&
          f.action !== "convert" &&
          f.action !== "converted" &&
          !f.error,
      ) === -1;

    if (this.uploaded || allFilesIsUploaded) {
      this.setConversionPercent(100, false);
      this.finishUploadFiles(t, false);
    } else {
      runInAction(() => {
        this.converted = true;
        this.filesToConversion = [];
        this.conversionPercent = 0;
      });
    }
  };

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

  convertUploadedFiles = (t: TTranslation, createNewIfExist = true) => {
    this.files = [...this.files, ...this.tempConversionFiles];

    if (!this.uploaded) {
      const notUploadedFiles = this.tempConversionFiles.filter(
        (f) => !f.inAction,
      );
      this.parallelUploading(notUploadedFiles, t);
    }

    this.tempConversionFiles = [];

    if (this.uploaded) {
      const newUploadData = {
        filesSize: this.convertFilesSize,
        uploadedFiles: this.uploadedFiles,
        percent: this.percent,
        uploaded: false,
        // converted: false,
      };

      this.setUploadData(newUploadData);
      this.startUploadFiles(t, createNewIfExist);
    }
  };

  cancelUploadAction = (items?: { uniqueId: string }[]) => {
    // FABLE5-REVIEW: the original .js read conflictResolveDialogData (and its
    // allNewFiles) without a null guard — it is always set when the upload
    // conflict dialog invokes this action.
    const files =
      items ??
      this.dialogsStore.conflictResolveDialogData!.newUploadData.allNewFiles!;

    let i = files.length;

    while (i !== 0) {
      this.uploadedFilesHistory = this.uploadedFilesHistory.filter(
        (f) => f.uniqueId !== files[i - 1].uniqueId,
      );
      this.files = this.files.filter(
        (f) => f.uniqueId !== files[i - 1].uniqueId,
      );
      this.tempConversionFiles = this.tempConversionFiles.filter(
        (f) => f.uniqueId !== files[i - 1].uniqueId,
      );
      i--;
    }

    if (this.uploaded) {
      this.primaryProgressDataStore.setPrimaryProgressBarData({
        operation: OPERATIONS_NAME.upload,
        completed: true,
        withoutStatus: this.uploadedFilesHistory.length === 0,
        ...(this.uploadedFilesHistory.length === 0 && { showPanel: null }),
      });
    }
  };

  setConflictDialogData = (
    conflicts: unknown[],
    operationData: Partial<TConflictResolveDialogData>,
  ) => {
    this.dialogsStore.setConflictResolveDialogItems(conflicts);
    // FABLE5-REVIEW: upload conflicts fill only a subset of
    // TConflictResolveDialogData (no folderIds/fileIds/translations/…); the
    // cast keeps the original .js payload as-is.
    this.dialogsStore.setConflictResolveDialogData(
      operationData as TConflictResolveDialogData,
    );
    this.dialogsStore.setConflictResolveDialogVisible(true);
  };

  handleFilesUpload = (
    newUploadData: TStartUploadData,
    t: TTranslation,
    createNewIfExist = true,
  ) => {
    this.uploadedFilesHistory = newUploadData.uploadedFilesHistory;

    this.setUploadData(newUploadData);
    this.startUploadFiles(t, createNewIfExist);
  };

  handleUploadAndOptionalConversion = (
    uploadData: TStartUploadData,
    t: TTranslation,
    createNewIfExist?: boolean,
  ) => {
    const newUploadData = { ...uploadData };
    // newUploadData.files = newUploadData.filesWithoutConversion;

    const onlyConversion =
      !!this.tempConversionFiles.length &&
      newUploadData.newFilesWithoutConversion.length === 0;

    if (!onlyConversion) {
      this.handleFilesUpload(newUploadData, t, createNewIfExist);
    } else {
      if (this.uploaded) {
        newUploadData.uploaded = true;
        this.asyncUploadObj = {};
      }
      this.uploadedFilesHistory = newUploadData.uploadedFilesHistory;
      // this.setUploadData(newUploadData);
    }

    if (this.tempConversionFiles.length) {
      if (this.filesSettingsStore.hideConfirmConvertSave) {
        this.convertUploadedFiles(t, createNewIfExist);
      } else {
        this.dialogsStore.setConvertDialogVisible(true);
        this.dialogsStore.setConvertDialogData({
          createNewIfExist,
          isUploadAction: true,
          files: uploadData.conversionFiles,
        });
      }
    }
  };

  conflictDialogUploadHandler = (
    uploadData: TStartUploadData,
    t: TTranslation,
    createNewIfExist?: boolean,
  ) => {
    this.handleUploadAndOptionalConversion(uploadData, t, createNewIfExist);
  };

  handleUploadConflicts = async (
    t: TTranslation,
    toFolderId: number | string | null,
    uploadData: TStartUploadData,
  ) => {
    const { isAIRoom } = this.selectedFolderStore;
    const filesArray = uploadData.files.map((fileInfo) => fileInfo.file.name);

    const checkConflicts =
      uploadData.files.findIndex((f) => f.toFolderId === toFolderId) > -1;

    try {
      // FABLE5-REVIEW: checkIsFileExist is untyped in shared/api and declares
      // folderId: number, while the original .js also passes string ids for
      // third-party folders.
      let conflicts: (string | { title: string; isFile: boolean })[] =
        isAIRoom || !checkConflicts
          ? []
          : ((await checkIsFileExist(
              toFolderId as number,
              filesArray,
            )) as string[]);
      const folderInfo = await getFolderInfo(toFolderId!);

      conflicts = conflicts.map((fileTitle) => ({
        title: fileTitle as string,
        isFile: true,
      }));

      if (conflicts.length > 0) {
        this.setConflictDialogData(conflicts, {
          isUploadConflict: true,
          newUploadData: uploadData,
          folderTitle: folderInfo.title,
        });
      } else {
        this.handleUploadAndOptionalConversion(uploadData, t, true);
      }
    } catch (err) {
      let errorMessage = "";

      if (typeof err === "object") {
        const axiosErr = err as TAxiosLikeError;
        errorMessage =
          axiosErr?.response?.data?.error?.message ||
          axiosErr?.statusText ||
          axiosErr?.message ||
          "";
      } else {
        errorMessage = err as string;
      }

      toastr.error(errorMessage, null, 0, true);

      if (this.uploaded) {
        this.primaryProgressDataStore.setPrimaryProgressBarData({
          operation: OPERATIONS_NAME.upload,
          completed: this.uploaded,
          alert: this.uploadedFilesHistory.length === 0,
          ...(this.uploadedFilesHistory.length === 0 && { showPanel: null }),
        });
      }
    }
  };

  // FABLE5-REVIEW: startUpload is called from still-.js code
  // (FilesActionsStore, GlobalEvents) with a FileList-like collection of
  // browser files decorated with parentFolderId/encrypted.
  startUpload = (
    uploadFiles: Record<string, TUploadBrowserFile> | unknown[],
    folderId: number | string | null,
    t: TTranslation,
  ) => {
    const { canConvert } = this.filesSettingsStore;

    const { isAIRoom } = this.selectedFolderStore;

    const { knowledgeId } = this.aiRoomStore;

    const toFolderId = folderId || this.selectedFolderStore.id;

    const encryptionRoomId =
      this.selectedFolderStore.navigationPath?.find((r) => r.isRoom)?.id ??
      (this.selectedFolderStore.isRoom ? this.selectedFolderStore.id : null);

    const isPrivateUpload = this.treeFoldersStore.isPrivacyFolder;

    if (this.uploaded) {
      this.files = this.files.filter((f) => f.action !== "upload" || f.error);
      this.filesSize = 0;
      this.uploadToFolder = null;
      this.percent = 0;
    }
    if (this.uploaded && this.converted) {
      this.files = this.files.filter((f) => f.error);
      this.filesToConversion = [];
      this.uploadedFilesSize = 0;
      this.asyncUploadObj = {};
    }

    const newFiles: TUploadFile[] = []; // this.files;
    const allFiles: TUploadFile[] = [];
    let filesSize = 0;
    let convertSize = 0;

    const uploadFilesArray = Object.keys(uploadFiles);

    uploadFilesArray.forEach((index) => {
      const file = (uploadFiles as Record<string, TUploadBrowserFile>)[index];

      const parts = file.name.split(".");
      const ext = parts.length > 1 ? `.${parts.pop()}` : "";
      const needConvert = !isPrivateUpload && canConvert(ext);

      const newFile: TUploadFile = {
        file,
        uniqueId: uniqueid("download_row-key_"),
        fileId: null,
        // toFolderId,
        toFolderId: isAIRoom ? knowledgeId : file.parentFolderId,
        action: "upload",
        error: null,
        fileInfo: null,
        cancel: false,
        needConvert,
        encrypted: file.encrypted,
        encryptionRoomId,
        percent: 0,
      };

      if (needConvert) {
        this.tempConversionFiles.push(newFile);
      } else {
        newFiles.push(newFile);
      }

      allFiles.push(newFile);

      filesSize += file.size;
      convertSize += file.size;
    });

    const filesWithoutConversion = removeDuplicate([
      ...this.files,
      ...newFiles,
    ]);

    const countUploadingFiles = filesWithoutConversion.length;
    const countConversionFiles = this.tempConversionFiles.length;

    if (countUploadingFiles && !countConversionFiles) {
      this.isUploading = true;
    } else {
      this.isUploadingAndConversion = true;
    }
    this.convertFilesSize = convertSize;

    const clearArray = removeDuplicate([
      ...this.uploadedFilesHistory,
      ...allFiles,
    ]);

    // this.uploadedFilesHistory = clearArray;

    const newUploadData = {
      // filesWithoutConversion,
      newFilesWithoutConversion: newFiles,
      allNewFiles: allFiles,
      conversionFiles: removeDuplicate(this.tempConversionFiles),
      files: [...filesWithoutConversion],
      filesSize: filesSize + this.filesSize,
      uploadedFiles: this.uploadedFiles,
      percent: this.percent,
      uploaded: false,
      uploadedFilesHistory: clearArray,
      // converted: !!this.tempConversionFiles.length,
    };

    if (countUploadingFiles || countConversionFiles) {
      this.handleUploadConflicts(t, toFolderId, newUploadData);
    }
  };

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
          // FABLE5-REVIEW: chunk upload endpoints are untyped in shared/api.
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

  retryConvertFiles = (t: TTranslation, fileId: number) => {
    const fileIndex = this.files.findIndex((f) => f.fileId === fileId);
    const fileConversionInxex = this.displayedConversionFiles.findIndex(
      (f) => f.fileId === fileId,
    );

    if (fileIndex > -1) {
      const retryFile = this.files[fileIndex];
      retryFile.inConversion = false;
    }

    if (fileConversionInxex === -1) return;

    const retryFileConversion =
      this.displayedConversionFiles[fileConversionInxex];

    retryFileConversion.inConversion = false;

    this.convertFileFromFiles(retryFileConversion, t);
  };

  retryUploadFiles = (t: TTranslation, uniqueId: string) => {
    const fileIndex = this.files.findIndex((f) => f.uniqueId === uniqueId);
    const fileUploadedIndex = this.uploadedFilesHistory.findIndex(
      (f) => f.uniqueId === uniqueId,
    );
    const retryFile = this.files[fileIndex];
    const retryFileUploaded = this.uploadedFilesHistory[fileUploadedIndex];

    if (retryFileUploaded.action === "convert") {
      retryFileUploaded.inConversion = false;
      retryFile.inConversion = false;
      this.convertFile(retryFileUploaded, t);
      return;
    }

    retryFile.action = "upload";
    retryFile.error = "";
    retryFile.isQuotaError = false;
    retryFile.inAction = false;
    retryFile.percent = 0;

    retryFileUploaded.action = "upload";
    retryFileUploaded.error = "";
    retryFileUploaded.isQuotaError = false;
    retryFileUploaded.inAction = false;
    retryFileUploaded.errorShown = false;
    retryFileUploaded.percent = 0;

    this.quotaErrorRaised = false;

    if (this.uploaded) {
      const newUploadData = {
        filesSize: this.convertFilesSize,
        uploadedFiles: this.uploadedFiles,
        percent: this.percent,
        uploaded: false,
      };

      this.setUploadData(newUploadData);
      const progressData = {
        completed: false,
        percent: this.percent,
        operation: OPERATIONS_NAME.upload,
        alert: false,
        showPanel: this.setUploadPanelVisible,
      };

      this.primaryProgressDataStore.setPrimaryProgressBarData(progressData);
    }

    this.parallelUploading([retryFile], t);
  };

  retryQuotaFailedFiles = (t: TTranslation) => {
    const failed = this.files.filter((f) => f.isQuotaError);
    if (failed.length === 0) return;

    this.quotaErrorRaised = false;
    failed.forEach((retryFile) => {
      const fileIndex = this.files.findIndex(
        (f) => f.uniqueId === retryFile.uniqueId,
      );
      const historyIndex = this.uploadedFilesHistory.findIndex(
        (f) => f.uniqueId === retryFile.uniqueId,
      );
      if (fileIndex === -1) return;
      this.files[fileIndex].action = "upload";
      this.files[fileIndex].error = "";
      this.files[fileIndex].isQuotaError = false;
      this.files[fileIndex].inAction = false;
      this.files[fileIndex].percent = 0;
      if (historyIndex > -1) {
        this.uploadedFilesHistory[historyIndex].action = "upload";
        this.uploadedFilesHistory[historyIndex].error = "";
        this.uploadedFilesHistory[historyIndex].isQuotaError = false;
        this.uploadedFilesHistory[historyIndex].inAction = false;
        this.uploadedFilesHistory[historyIndex].errorShown = false;
        this.uploadedFilesHistory[historyIndex].percent = 0;
      }
    });

    if (this.uploaded) {
      const newUploadData = {
        filesSize: this.convertFilesSize,
        uploadedFiles: this.uploadedFiles,
        percent: this.percent,
        uploaded: false,
      };
      this.setUploadData(newUploadData);
      this.primaryProgressDataStore.setPrimaryProgressBarData({
        completed: false,
        percent: this.percent,
        operation: OPERATIONS_NAME.upload,
        alert: false,
        showPanel: this.setUploadPanelVisible,
      });
    }

    const retryFiles = this.files.filter((f) =>
      failed.some((rf) => rf.uniqueId === f.uniqueId),
    );
    this.parallelUploading(retryFiles, t);
  };

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
    // FABLE5-REVIEW: shouldEncryptUpload declares roomType: RoomsType, but
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
    // FABLE5-REVIEW: the original .js passed a (silently ignored) second
    // argument to Math.ceil; dropped because it has no runtime effect.
    const chunks = fileSize === 0 ? 1 : Math.ceil(fileSize / chunkUploadSize);

    return startUploadSession(
      // FABLE5-REVIEW: the original .js could pass null here when an AI room
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
    // FABLE5-REVIEW: the original .js called error.indexOf without a guard —
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
        // FABLE5-REVIEW: the socket typings declare the RefreshFolder payload
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
      // FABLE5-REVIEW: PrimaryProgressDataStore has no `alert` member (it has
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
  ) => {
    const { setSecondaryProgressBarData } = this.secondaryProgressDataStore;

    const pbData: TPbData = {
      operation: OPERATIONS_NAME.copy,
      operationId,
    };

    return copyToFolder(
      destFolderId as number,
      folderIds,
      fileIds,
      conflictResolveType,
      deleteAfter,
      content,
      toFillOut,
    )
      .then((res) => {
        let data: TOperation | null = null;
        const operation = res[0];

        if (operation) {
          if (operation?.error) {
            return Promise.reject(operation);
          }

          data = operation ?? null;
        }

        if (!data) {
          return Promise.reject();
        }
        return this.loopFilesOperations(data, pbData)
          .then((result) => {
            this.moveToCopyTo(destFolderId, pbData, true, fileIds, folderIds);
            return result;
          })
          .finally(async () => {
            // to update the status of trashIsEmpty filesStore
            if (this.treeFoldersStore.isRecycleBinFolder)
              await this.filesStore.getIsEmptyTrash();
          });
      })
      .catch((err: unknown) => {
        setSecondaryProgressBarData({
          completed: true,
          alert: true,
          operationId,
          operation: pbData.operation,
          error: err as string,
        });
        this.clearActiveOperations(fileIds, folderIds);

        return Promise.reject(err);
      });
  };

  moveToAction = (
    destFolderId: number | string | null | undefined,
    folderIds: number[],
    fileIds: number[],
    conflictResolveType: ConflictResolveType,
    deleteAfter: boolean,
    operationId: string,
    toFillOut?: boolean,
  ) => {
    const { setSecondaryProgressBarData } = this.secondaryProgressDataStore;
    const pbData: TPbData = { operation: OPERATIONS_NAME.move, operationId };
    return moveToFolder(
      destFolderId as number,
      folderIds,
      fileIds,
      conflictResolveType,
      deleteAfter,
      toFillOut,
    )
      .then((res) => {
        let data: TOperation | null = null;

        const operation = res[0];
        if (operation) {
          if (operation?.error) {
            return Promise.reject(operation);
          }

          data = operation ?? null;
        }

        if (!data) {
          return Promise.reject();
        }

        return this.loopFilesOperations(data, pbData)
          .then((result) => {
            this.moveToCopyTo(destFolderId, pbData, false, fileIds, folderIds);
            return result;
          })
          .finally(async () => {
            // to update the status of trashIsEmpty filesStore
            if (this.treeFoldersStore.isRecycleBinFolder)
              await this.filesStore.getIsEmptyTrash();
          });
      })
      .catch((err: unknown) => {
        setSecondaryProgressBarData({
          completed: true,
          alert: true,
          operationId,
          operation: pbData.operation,
          error: err as string,
        });
        this.clearActiveOperations(fileIds, folderIds);

        return Promise.reject(err);
      });
  };

  copyAsAction = (
    fileId: number,
    title: string,
    folderId: number,
    enableExternalExt?: boolean,
    password?: string,
  ) => {
    const { fetchFiles, filter } = this.filesStore;

    // FABLE5-REVIEW: fileCopyAs declares enableExternalExt/password as
    // required, but the original .js callers may omit them (undefined is
    // sent as-is at runtime).
    return fileCopyAs(
      fileId,
      title,
      folderId,
      enableExternalExt as boolean,
      password as string,
    )
      .then(() => fetchFiles(folderId, filter, true, true))
      .catch((err: unknown) => {
        return Promise.reject(err);
      });
  };

  itemOperationToFolder = (data: TItemOperationData) => {
    const {
      destFolderId,
      destFolderInfo,
      folderIds,
      fileIds,
      deleteAfter,
      isCopy,
      content,
      title,
      itemsCount,
      isFolder,
      toFillOut,
    } = data;
    const { setSecondaryProgressBarData } = this.secondaryProgressDataStore;

    const conflictResolveType = data.conflictResolveType
      ? data.conflictResolveType
      : ConflictResolveType.Duplicate;

    const operationId = uniqueid("operation_");

    const operation = isCopy ? OPERATIONS_NAME.copy : OPERATIONS_NAME.move;

    setSecondaryProgressBarData({
      operation,
      percent: 0,
      operationId,
      title,
      itemsCount,
      operationIds: [...folderIds],
      destFolderInfo,
      isFolder,
    });

    return isCopy
      ? this.copyToAction(
          destFolderId,
          folderIds,
          fileIds,
          conflictResolveType,
          deleteAfter,
          operationId,
          content,
          toFillOut,
        )
      : this.moveToAction(
          destFolderId,
          folderIds,
          fileIds,
          conflictResolveType,
          deleteAfter,
          operationId,
          toFillOut,
        );
  };

  loopFilesOperations = async (
    /** Callers (FilesActionsStore) pass `result ?? null`; the falsy case is
     * handled right below. */
    data: TOperation | null,
    pbData: TPbData,
  ): Promise<TOperation | undefined> => {
    const { setSecondaryProgressBarData } = this.secondaryProgressDataStore;

    if (!data) {
      setSecondaryProgressBarData({
        operation: pbData.operation,
        alert: false,
        completed: true,
        operationId: pbData.operationId,
      });

      return;
    }

    setSecondaryProgressBarData({
      operation: pbData.operation,
      alert: false,
      operationId: pbData.operationId,
      serverOperationId: data.id,
    });

    // let progress = data.progress;

    let operationItem: TOperation | undefined = data;
    let finished = data.finished;

    while (!finished) {
      const currentOperation =
        this.secondaryProgressDataStore.secondaryOperationsArray.find(
          (op) => op.operation === pbData.operation,
        );
      const currentItem = currentOperation?.items.find(
        (item) => item.operationId === pbData.operationId,
      );

      if (currentItem?.completed) {
        return operationItem;
      }

      try {
        const item = await getOperationProgress(
          data.id,
          getUnexpectedErrorText(),
          true,
        );

        if (item?.status === FileOperationStatus.Canceled) {
          setSecondaryProgressBarData({
            operation: pbData.operation,
            operationId: pbData.operationId,
            completed: true,
            alert: false,
          });
          return { ...item, finished: true, error: "" };
        }

        operationItem = item;

        // progress = item ? item.progress : 100;
        finished = item ? item.finished : true;

        setSecondaryProgressBarData({
          operation: pbData.operation,
          //  percent: progress,
          alert: false,
          currentFile: item,
          operationId: pbData.operationId,
          serverOperationId: data.id,
        });
      } catch (error) {
        const updatedOperation =
          this.secondaryProgressDataStore.secondaryOperationsArray.find(
            (op) => op.operation === pbData.operation,
          );
        const updatedItem = updatedOperation?.items.find(
          (item) => item.operationId === pbData.operationId,
        );

        const isOperationCancelled =
          updatedItem?.completed && updatedItem?.skipToast;

        if (isOperationCancelled) {
          return operationItem;
        }

        const hasStatusCanceled =
          operationItem?.status === FileOperationStatus.Canceled ||
          (error as { status?: FileOperationStatus })?.status ===
            FileOperationStatus.Canceled;

        if (hasStatusCanceled) {
          return operationItem;
        }

        const isOperationNotFound = !updatedOperation || !updatedItem;

        if (isOperationNotFound) {
          return operationItem;
        }

        throw error;
      }
    }

    return operationItem;
  };

  navigateToNewFolderLocation = async (folderId: number | string | null) => {
    const { filter } = this.filesStore;

    // FABLE5-REVIEW: FilesFilter.folder is declared as string, but the
    // original .js also assigns numeric folder ids here.
    filter.folder = folderId as string;

    try {
      const { rootFolderType, parentId } = await getFolderInfo(folderId!);
      const path = getCategoryUrl(
        getCategoryTypeByFolderType(rootFolderType, parentId),
        folderId,
      );

      window.DocSpace.navigate(`${path}?${filter.toUrlParams()}`, {
        replace: true,
      });
    } catch (e) {
      console.error("[UploadDataStore] navigate failed:", e);
    }
  };

  moveToCopyTo = (
    destFolderId: number | string | null | undefined,
    pbData: TPbData,
    isCopy: boolean,
    fileIds?: number[],
    folderIds?: number[],
  ) => {
    const { setSecondaryProgressBarData } = this.secondaryProgressDataStore;
    const isMovingSelectedFolder =
      !isCopy && folderIds && this.selectedFolderStore.id === folderIds[0];

    if (!isCopy || destFolderId === this.selectedFolderStore.id) {
      this.clearActiveOperations(fileIds, folderIds);

      if (!isCopy) {
        this.filesStore.removeFiles(fileIds, folderIds, null, destFolderId);
      }

      isMovingSelectedFolder &&
        this.navigateToNewFolderLocation(this.selectedFolderStore.id);
      this.dialogsStore.setIsFolderActions(false);
    } else {
      this.clearActiveOperations(fileIds, folderIds);
    }

    setSecondaryProgressBarData({
      operation: pbData.operation,
      percent: 100,
      completed: true,
      operationId: pbData.operationId,
    });
  };

  clearActiveOperations = (
    /** FilesActionsStore passes null for the unaffected side. */
    fileIds: Nullable<number[]> = [],
    folderIds: Nullable<number[]> = [],
  ) => {
    const { activeFiles, activeFolders, setActiveFiles, setActiveFolders } =
      this.filesStore;

    const newActiveFiles = activeFiles.filter(
      (el) => !fileIds?.includes(el.id as number),
    );
    const newActiveFolders = activeFolders.filter(
      (el) => !folderIds?.includes(el.id as number),
    );

    setActiveFiles(newActiveFiles);
    setActiveFolders(newActiveFolders);
  };
}

export default UploadDataStore;

