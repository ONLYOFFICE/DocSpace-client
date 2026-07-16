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

import { runInAction } from "mobx";
import uniqueid from "lodash/uniqueId";
import { checkIsFileExist, getFolderInfo } from "@docspace/shared/api/files";
import { toastr } from "@docspace/ui-kit/components/toast";
import { OPERATIONS_NAME } from "@docspace/shared/constants";

import type { TTranslation } from "@docspace/shared/types";
import type { TConflictResolveDialogData } from "SRC_DIR/components/dialogs/ConflictResolveDialog/ConflictResolveDialog.types";

import { removeDuplicate } from "./helpers";
import type { TUploadBrowserFile, TUploadFile } from "./helpers";
import type {
  default as UploadDataStore,
  TAxiosLikeError,
  TStartUploadData,
} from "../UploadDataStore";

export function cancelUploadImpl(self: UploadDataStore) {
  self.finishUploadFilesCalled = false;

  const newUploadData = {
    filesSize: self.filesSize,
    uploadedFiles: self.uploadedFiles,
    percent: 100,
    uploaded: true,
    converted: true,
    currentUploadNumber: 0,
  };

  const newHistory = self.uploadedFilesHistory.filter(
    (el) =>
      el.action === "uploaded" ||
      el.action === "converted" ||
      (el.action === "upload" && el.error) ||
      (el.action === "convert" && el.error) ||
      (el.action === "convert" && el.inConversion),
  );
  self.filesToConversion = self.filesToConversion.filter(
    (el) => el.inConversion,
  );

  const shouldCancelFile = (file: TUploadFile) => {
    return (
      file.action === "upload" ||
      (file.action === "convert" && !file.inConversion)
    );
  };

  self.files = self.files.map((file) =>
    shouldCancelFile(file) ? { ...file, cancel: true } : file,
  );

  self.setUploadData(newUploadData);
  self.uploadedFilesHistory = newHistory;
  self.quotaErrorRaised = false;

  self.primaryProgressDataStore.setPrimaryProgressBarData({
    operation: OPERATIONS_NAME.upload,
    completed: true,
    canceled: true,
    alert: true,
    label: window.i18n!.t!("Common:CanceledOperation", {
      operationName: window.i18n!.t!("Common:Uploading"),
    }),
  });

  toastr.info(window.i18n!.t!("Common:CancelUpload"));
}

export function cancelCurrentUploadImpl(
  self: UploadDataStore,
  id: string,
  t: TTranslation,
) {
  runInAction(() => {
    const uploadedFilesHistory = self.uploadedFilesHistory.filter(
      (el) => el.uniqueId !== id,
    );

    const canceledFile = self.files.find((f) => f.uniqueId === id)!;
    const newPercent = self.getFilesPercent();
    canceledFile.cancel = true;
    canceledFile.percent = 100;
    canceledFile.action = "uploaded";

    self.currentUploadNumber -= 1;
    self.uploadedFilesHistory = uploadedFilesHistory;
    self.percent = newPercent;
    const nextFileIndex = self.files.findIndex((f) => !f.inAction);

    if (nextFileIndex !== -1) {
      self.startSessionFunc(nextFileIndex, t);
    }
  });
}

export function cancelUploadActionImpl(
  self: UploadDataStore,
  items?: { uniqueId: string }[],
) {
  const files =
    items ??
    self.dialogsStore.conflictResolveDialogData!.newUploadData.allNewFiles!;

  let i = files.length;

  while (i !== 0) {
    self.uploadedFilesHistory = self.uploadedFilesHistory.filter(
      (f) => f.uniqueId !== files[i - 1].uniqueId,
    );
    self.files = self.files.filter(
      (f) => f.uniqueId !== files[i - 1].uniqueId,
    );
    self.tempConversionFiles = self.tempConversionFiles.filter(
      (f) => f.uniqueId !== files[i - 1].uniqueId,
    );
    i--;
  }

  if (self.uploaded) {
    self.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: OPERATIONS_NAME.upload,
      completed: true,
      withoutStatus: self.uploadedFilesHistory.length === 0,
      ...(self.uploadedFilesHistory.length === 0 && { showPanel: null }),
    });
  }
}

export function setConflictDialogDataImpl(
  self: UploadDataStore,
  conflicts: unknown[],
  operationData: Partial<TConflictResolveDialogData>,
) {
  self.dialogsStore.setConflictResolveDialogItems(conflicts);
  self.dialogsStore.setConflictResolveDialogData(
    operationData as TConflictResolveDialogData,
  );
  self.dialogsStore.setConflictResolveDialogVisible(true);
}

export function handleFilesUploadImpl(
  self: UploadDataStore,
  newUploadData: TStartUploadData,
  t: TTranslation,
  createNewIfExist = true,
) {
  self.uploadedFilesHistory = newUploadData.uploadedFilesHistory;

  self.setUploadData(newUploadData);
  self.startUploadFiles(t, createNewIfExist);
}

export function handleUploadAndOptionalConversionImpl(
  self: UploadDataStore,
  uploadData: TStartUploadData,
  t: TTranslation,
  createNewIfExist?: boolean,
) {
  const newUploadData = { ...uploadData };

  const onlyConversion =
    !!self.tempConversionFiles.length &&
    newUploadData.newFilesWithoutConversion.length === 0;

  if (!onlyConversion) {
    self.handleFilesUpload(newUploadData, t, createNewIfExist);
  } else {
    if (self.uploaded) {
      newUploadData.uploaded = true;
      self.asyncUploadObj = {};
    }
    self.uploadedFilesHistory = newUploadData.uploadedFilesHistory;
  }

  if (self.tempConversionFiles.length) {
    if (self.filesSettingsStore.hideConfirmConvertSave) {
      self.convertUploadedFiles(t, createNewIfExist);
    } else {
      self.dialogsStore.setConvertDialogVisible(true);
      self.dialogsStore.setConvertDialogData({
        createNewIfExist,
        isUploadAction: true,
        files: uploadData.conversionFiles,
      });
    }
  }
}

export async function handleUploadConflictsImpl(
  self: UploadDataStore,
  t: TTranslation,
  toFolderId: number | string | null,
  uploadData: TStartUploadData,
) {
  const { isAIRoom } = self.selectedFolderStore;
  const filesArray = uploadData.files.map((fileInfo) => fileInfo.file.name);

  const checkConflicts =
    uploadData.files.findIndex((f) => f.toFolderId === toFolderId) > -1;

  try {
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
      self.setConflictDialogData(conflicts, {
        isUploadConflict: true,
        newUploadData: uploadData,
        folderTitle: folderInfo.title,
      });
    } else {
      self.handleUploadAndOptionalConversion(uploadData, t, true);
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

    if (self.uploaded) {
      self.primaryProgressDataStore.setPrimaryProgressBarData({
        operation: OPERATIONS_NAME.upload,
        completed: self.uploaded,
        alert: self.uploadedFilesHistory.length === 0,
        ...(self.uploadedFilesHistory.length === 0 && { showPanel: null }),
      });
    }
  }
}

export function startUploadImpl(
  self: UploadDataStore,
  uploadFiles: Record<string, TUploadBrowserFile> | unknown[],
  folderId: number | string | null,
  t: TTranslation,
) {
  const { canConvert } = self.filesSettingsStore;

  const { isAIRoom } = self.selectedFolderStore;

  const { knowledgeId } = self.aiRoomStore;

  const toFolderId = folderId || self.selectedFolderStore.id;

  const encryptionRoomId =
    self.selectedFolderStore.navigationPath?.find((r) => r.isRoom)?.id ??
    (self.selectedFolderStore.isRoom ? self.selectedFolderStore.id : null);

  const isPrivateUpload = self.treeFoldersStore.isPrivacyFolder;

  if (self.uploaded) {
    self.files = self.files.filter((f) => f.action !== "upload" || f.error);
    self.filesSize = 0;
    self.percent = 0;
  }
  if (self.uploaded && self.converted) {
    self.files = self.files.filter((f) => f.error);
    self.filesToConversion = [];
    self.uploadedFilesSize = 0;
    self.asyncUploadObj = {};
  }

  const newFiles: TUploadFile[] = [];
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
      self.tempConversionFiles.push(newFile);
    } else {
      newFiles.push(newFile);
    }

    allFiles.push(newFile);

    filesSize += file.size;
    convertSize += file.size;
  });

  const filesWithoutConversion = removeDuplicate([
    ...self.files,
    ...newFiles,
  ]);

  const countUploadingFiles = filesWithoutConversion.length;
  const countConversionFiles = self.tempConversionFiles.length;

  if (countUploadingFiles && !countConversionFiles) {
    self.isUploading = true;
  } else {
    self.isUploadingAndConversion = true;
  }
  self.convertFilesSize = convertSize;

  const clearArray = removeDuplicate([
    ...self.uploadedFilesHistory,
    ...allFiles,
  ]);

  const newUploadData = {
    newFilesWithoutConversion: newFiles,
    allNewFiles: allFiles,
    conversionFiles: removeDuplicate(self.tempConversionFiles),
    files: [...filesWithoutConversion],
    filesSize: filesSize + self.filesSize,
    uploadedFiles: self.uploadedFiles,
    percent: self.percent,
    uploaded: false,
    uploadedFilesHistory: clearArray,
  };

  if (countUploadingFiles || countConversionFiles) {
    self.handleUploadConflicts(t, toFolderId, newUploadData);
  }
}

export function retryUploadFilesImpl(
  self: UploadDataStore,
  t: TTranslation,
  uniqueId: string,
) {
  const fileIndex = self.files.findIndex((f) => f.uniqueId === uniqueId);
  const fileUploadedIndex = self.uploadedFilesHistory.findIndex(
    (f) => f.uniqueId === uniqueId,
  );
  const retryFile = self.files[fileIndex];
  const retryFileUploaded = self.uploadedFilesHistory[fileUploadedIndex];

  if (retryFileUploaded.action === "convert") {
    retryFileUploaded.inConversion = false;
    retryFile.inConversion = false;
    self.convertFile(retryFileUploaded, t);
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

  self.quotaErrorRaised = false;

  if (self.uploaded) {
    const newUploadData = {
      filesSize: self.convertFilesSize,
      uploadedFiles: self.uploadedFiles,
      percent: self.percent,
      uploaded: false,
    };

    self.setUploadData(newUploadData);
    const progressData = {
      completed: false,
      percent: self.percent,
      operation: OPERATIONS_NAME.upload,
      alert: false,
      showPanel: self.setUploadPanelVisible,
    };

    self.primaryProgressDataStore.setPrimaryProgressBarData(progressData);
  }

  self.parallelUploading([retryFile], t);
}

export function retryQuotaFailedFilesImpl(
  self: UploadDataStore,
  t: TTranslation,
) {
  const failed = self.files.filter((f) => f.isQuotaError);
  if (failed.length === 0) return;

  self.quotaErrorRaised = false;
  failed.forEach((retryFile) => {
    const fileIndex = self.files.findIndex(
      (f) => f.uniqueId === retryFile.uniqueId,
    );
    const historyIndex = self.uploadedFilesHistory.findIndex(
      (f) => f.uniqueId === retryFile.uniqueId,
    );
    if (fileIndex === -1) return;
    self.files[fileIndex].action = "upload";
    self.files[fileIndex].error = "";
    self.files[fileIndex].isQuotaError = false;
    self.files[fileIndex].inAction = false;
    self.files[fileIndex].percent = 0;
    if (historyIndex > -1) {
      self.uploadedFilesHistory[historyIndex].action = "upload";
      self.uploadedFilesHistory[historyIndex].error = "";
      self.uploadedFilesHistory[historyIndex].isQuotaError = false;
      self.uploadedFilesHistory[historyIndex].inAction = false;
      self.uploadedFilesHistory[historyIndex].errorShown = false;
      self.uploadedFilesHistory[historyIndex].percent = 0;
    }
  });

  if (self.uploaded) {
    const newUploadData = {
      filesSize: self.convertFilesSize,
      uploadedFiles: self.uploadedFiles,
      percent: self.percent,
      uploaded: false,
    };
    self.setUploadData(newUploadData);
    self.primaryProgressDataStore.setPrimaryProgressBarData({
      completed: false,
      percent: self.percent,
      operation: OPERATIONS_NAME.upload,
      alert: false,
      showPanel: self.setUploadPanelVisible,
    });
  }

  const retryFiles = self.files.filter((f) =>
    failed.some((rf) => rf.uniqueId === f.uniqueId),
  );
  self.parallelUploading(retryFiles, t);
}
