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
import { getI18n } from "react-i18next";
import { AnalyticsEvents, RoomsType } from "@docspace/shared/enums";
import {
  startUploadSession,
  uploadChunkSequential,
  uploadChunkParallel,
  finalizeUploadSession,
} from "@docspace/shared/api/files";
import { shouldEncryptUpload } from "@docspace/shared/services/private-room/encrypted-upload";
import { wipeDek } from "@docspace/shared/services/encryption/file-keys";
import { rememberEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";
import { toastr } from "@docspace/ui-kit/components/toast";
import { isQuotaError } from "@docspace/shared/utils/uploadErrors";
import { OPERATIONS_NAME } from "@docspace/shared/constants";

import type { TTranslation } from "@docspace/shared/types";

import {
  acquireUploadAutoLockSuspension,
  hasFileDek,
  setFileDek,
  takeFileDek,
} from "./helpers";
import type { TUploadBrowserFile, TUploadFile } from "./helpers";
import type {
  default as UploadDataStore,
  TAxiosLikeError,
  TChunkData,
  TCheckChunkUpload,
  TChunkUploadResponse,
  TResolve,
  TUploadChunk,
} from "../UploadDataStore";

// The chunk-upload pipeline extracted from UploadDataStore (Phase 7 of
// uploadDataStore/REFACTORING_PLAN.md — the most delicate phase, see §0.2).
// Relocated as ONE unit with no reordering: the mutual recursion
// (asyncUpload re-invokes itself and checkChunkUpload; checkChunkUpload and
// startSessionFunc re-drive self.startSessionFunc), the manual
// currentUploadNumber semaphore, the single-resolve protocol threaded through
// TCheckChunkUpload, the in-place files[indexOfFile] mutations and the DEK
// lifecycle (setFileDek/takeFileDek/wipeDek) are all preserved verbatim; only
// this. -> self.. Sibling calls stay self.*() so the MobX action wrapping and
// the recursion/spy seams are unchanged.

export function parallelUploadingImpl(
  self: UploadDataStore,
  notUploadedFiles: TUploadFile[],
  t: TTranslation,
  createNewIfExist?: boolean,
) {
  const { maxUploadFilesCount } = self.filesSettingsStore;

  const countFiles =
    notUploadedFiles.length >= maxUploadFilesCount
      ? maxUploadFilesCount
      : notUploadedFiles.length;

  for (let i = 0; i < countFiles; i++) {
    if (self.currentUploadNumber <= maxUploadFilesCount) {
      const fileIndex = self.files.findIndex(
        (f) => f.uniqueId === notUploadedFiles[i].uniqueId,
      );

      if (fileIndex !== -1) {
        self.currentUploadNumber += 1;
        self.startSessionFunc(fileIndex, t, createNewIfExist);
      }
    }
  }
}

export function checkChunkUploadImpl(
  self: UploadDataStore,
  chunkUploadObj: TCheckChunkUpload,
) {
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
  //     fileSize <= self.filesSettingsStore.chunkUploadSize
  //       ? fileSize
  //       : self.filesSettingsStore.chunkUploadSize;
  // } else {
  //   uploadedSize = isFinalize
  //     ? 0
  //     : fileSize <= self.filesSettingsStore.chunkUploadSize
  //       ? fileSize
  //       : fileSize - index * self.filesSettingsStore.chunkUploadSize;
  // }

  const percentCurrentFile = (index / chunksLength) * 100;

  const fileIndex = self.uploadedFilesHistory.findIndex(
    (f) => f.uniqueId === self.files[indexOfFile].uniqueId,
  );

  if (fileIndex > -1) {
    if (self.uploadedFilesHistory[fileIndex].percent < percentCurrentFile)
      self.uploadedFilesHistory[fileIndex].percent = percentCurrentFile;
  }

  const newPercent = self.getFilesPercent();

  self.percent = newPercent;

  self.primaryProgressDataStore.setPrimaryProgressBarData({
    operation: OPERATIONS_NAME.upload,
    percent: newPercent,
  });

  if (uploaded) {
    runInAction(() => {
      self.files[indexOfFile].action = "uploaded";
      self.files[indexOfFile].fileId = fileId;
      self.files[indexOfFile].fileInfo = fileInfo;

      self.uploadedFilesHistory[fileIndex].action = "uploaded";
      self.uploadedFilesHistory[fileIndex].fileId = fileId;
      self.uploadedFilesHistory[fileIndex].fileInfo = fileInfo;

      self.currentUploadNumber -= 1;

      const nextFileIndex = self.files.findIndex((f) => !f.inAction);

      if (nextFileIndex !== -1) {
        self.startSessionFunc(nextFileIndex, t, createNewIfExist);
      }
    });

    const currentFileData = self.files[indexOfFile];
    if (currentFileData?.encrypted && hasFileDek(currentFileData)) {
      if (currentFileData.file?.name) {
        rememberEncryptedFilename(fileId, currentFileData.file.name);
      }

      const { publicKey, userId, publicKeyId } = self.getUserEncryptionKeys();
      if (!userId || !publicKey) {
        console.error(
          "[ENCRYPTION] Cannot wrap DEK: encryption keys missing for current user",
        );
        const orphanDek = takeFileDek(currentFileData);
        if (orphanDek) wipeDek(orphanDek);
      } else {
        const dekForWrap = takeFileDek(currentFileData);
        const roomIdForWrap = currentFileData?.encryptionRoomId ?? null;
        self.wrapForSelfThenRoom(
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
            if (self.files[indexOfFile]) {
              self.files[indexOfFile].error = wrapMessage;
            }
            const historyIndex = self.uploadedFilesHistory.findIndex(
              (f) => f.uniqueId === self.files[indexOfFile]?.uniqueId,
            );
            if (historyIndex > -1) {
              self.uploadedFilesHistory[historyIndex].error = wrapMessage;
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
      self.filesStore.setHighlightFile({
        highlightFileId: fileInfo.id,
        isFileHasExst: !fileInfo.fileExst,
      });
    }
  }

  // All chuncks are uploaded

  const currentFile = self.files[indexOfFile];

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
        self.uploadedFilesHistory[fileIndex].action = "convert";
      }
    });

    if (!self.filesToConversion.length || self.converted) {
      self.filesToConversion.push(currentFile);
      self.startConversion(t);
    } else {
      self.filesToConversion.push(currentFile);
    }
    return resolve();
  }

  if (currentFile.action === "uploaded") {
    self.refreshFiles(currentFile);
  }

  return resolve();
}

export async function asyncUploadImpl(
  self: UploadDataStore,
  t: TTranslation,
  chunkData: TChunkData,
  resolve: TResolve,
  reject: (reason?: unknown) => void,
  createNewIfExist?: boolean,
) {
  const { operationId, file, indexOfFile, path, length } = chunkData;

  if (
    self.uploaded ||
    !self.files.some((f) => f.file === file) ||
    self.files[indexOfFile].cancel
  ) {
    return resolve();
  }

  if (!self.asyncUploadObj[operationId]) {
    return reject();
  }
  const chunkObjIndex = self.asyncUploadObj[
    operationId
  ].chunksArray.findIndex((x) => !x.isActive && !x.isFinalize);

  if (chunkObjIndex !== -1) {
    self.asyncUploadObj[operationId].chunksArray[chunkObjIndex].isActive =
      true;

    try {
      const res =
        await self.asyncUploadObj[operationId].chunksArray[
          chunkObjIndex
        ].onUpload();

      if (self.asyncUploadObj[operationId]) {
        self.asyncUploadObj[operationId].chunksArray[
          chunkObjIndex
        ].isFinished = true;
      }

      self.asyncUpload(t, chunkData, resolve, reject, createNewIfExist);

      const activeLength = self.asyncUploadObj[operationId]
        ? self.asyncUploadObj[operationId].chunksArray.filter(
            (x) => x.isActive,
          ).length - 1
        : 0;

      self.checkChunkUpload({
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
      if (self.asyncUploadObj[operationId]) {
        finalizeChunk = self.asyncUploadObj[
          operationId
        ].chunksArray.findIndex((x) => !x.isFinished && !x.isFinalize);
      }

      if (finalizeChunk === -1) {
        const finalizeChunkIndex = self.asyncUploadObj[
          operationId
        ].chunksArray.findIndex((x) => x.isFinalize);

        if (finalizeChunkIndex > -1) {
          const finalizeIndex =
            self.asyncUploadObj[operationId].chunksArray.length - 1;

          const finalizeRes =
            await self.asyncUploadObj[operationId].chunksArray[
              finalizeChunkIndex
            ].onUpload();

          self.checkChunkUpload({
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
}

export async function uploadFileChunksImpl(
  self: UploadDataStore,
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
) {
  const { uploadThreadCount } = self.filesSettingsStore;
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

    if (!self.asyncUploadObj[operationId]) {
      self.asyncUploadObj[operationId] = { chunksArray: [] };
      self.asyncUploadObj[operationId].chunksArray = chunksArray;
    }

    const promise = new Promise<unknown>((resolve, reject) => {
      let i = length <= uploadThreadCount ? length : uploadThreadCount;
      while (i !== 0) {
        self.asyncUpload(
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
        self.uploaded ||
        !self.files.some((f) => f.file === file) ||
        self.files[indexOfFile].cancel
      ) {
        return Promise.resolve();
      }

      const res = await uploadChunkSequential(
        folderId,
        sessionId,
        requestsDataArray[index],
      );
      const resolve = (r?: unknown) => Promise.resolve(r);

      self.checkChunkUpload({
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
}

export async function startUploadFilesImpl(
  self: UploadDataStore,
  t: TTranslation,
  createNewIfExist = true,
) {
  self.finishUploadFilesCalled = false;

  const files = self.files;

  if (files.length === 0) {
    return self.finishUploadFiles(t);
  }

  const canProceed = await self.ensureEncryptionUnlockedForBatch();
  if (!canProceed) {
    self.cancelEncryptedBatchUpload();
  }

  const notUploadedFiles = self.files.filter(
    (f) => !f.inAction && !f.cancel && !f.error,
  );

  if (notUploadedFiles.length === 0) {
    runInAction(() => {
      self.uploaded = true;
      self.converted = true;
    });
    self.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: OPERATIONS_NAME.upload,
      completed: true,
      withoutStatus: self.uploadedFilesHistory.length === 0,
      ...(self.uploadedFilesHistory.length === 0 && { showPanel: null }),
    });
    return;
  }

  const progressData = {
    completed: false,
    percent: self.percent,
    operation: OPERATIONS_NAME.upload,
    alert: false,
    canceled: false,
    showPanel: self.setUploadPanelVisible,
  };

  self.primaryProgressDataStore.setPrimaryProgressBarData(progressData);

  if (notUploadedFiles.some((f) => self.willEncryptItem(f))) {
    acquireUploadAutoLockSuspension();
  }

  self.parallelUploading(notUploadedFiles, t, createNewIfExist);
}

export async function startSessionFuncImpl(
  self: UploadDataStore,
  indexOfFile: number,
  t: TTranslation,
  createNewIfExist = true,
) {
  const { isAIRoom } = self.selectedFolderStore;
  const { knowledgeId } = self.aiRoomStore;
  if (!self.uploaded && self.files.length === 0) {
    self.uploaded = true;
    self.asyncUploadObj = {};
    // setUploadData(uploadData);
    return;
  }

  const item = self.files[indexOfFile];

  self.files[indexOfFile].inAction = true;

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

  const { chunkUploadSize } = self.filesSettingsStore;
  const { roomType, isPrivate } = self.getUploadEncryptionContext(item);

  const { file, toFolderId /* , action */ } = item;
  let fileToUpload = file;
  // Replaced with the obfuscated upload name for encrypted uploads.
  let fileName = file.name;

  const actualFolderId = isAIRoom ? knowledgeId : toFolderId;

  let uploadDEK: Uint8Array | null = null; // raw DEK for wrapping after upload
  let isEncrypted = file.encrypted || false;

  const { publicKey, userId } = self.getUserEncryptionKeys();
  // shouldEncryptUpload declares roomType: RoomsType, but
  // resolveItemRoomContext may return null/undefined (falsy at runtime).
  const shouldEncrypt =
    shouldEncryptUpload(roomType as RoomsType, isPrivate) &&
    !!publicKey &&
    !!userId;

  if (shouldEncrypt && !isEncrypted) {
    try {
      const prepared = await self.prepareFileForEncryptedUpload(
        file,
        toFolderId,
        (progress) => {
          const fileIndex = self.uploadedFilesHistory.findIndex(
            (f) => f.uniqueId === self.files[indexOfFile].uniqueId,
          );
          if (fileIndex > -1) {
            self.uploadedFilesHistory[fileIndex].percent = Math.floor(
              progress * 20,
            );
          }
          const newPercent = self.getFilesPercent();
          self.percent = newPercent;
          self.primaryProgressDataStore.setPrimaryProgressBarData({
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

        setFileDek(self.files[indexOfFile], uploadDEK);
        self.files[indexOfFile].encrypted = true;
      }
    } catch (error) {
      console.error("[ENCRYPTION] prepareFileForEncryptedUpload failed", {
        uniqueId: self.files[indexOfFile]?.uniqueId,
        message: (error as Error)?.message,
      });
      const orphanDek = takeFileDek(self.files[indexOfFile]);
      if (orphanDek) wipeDek(orphanDek);
      const errorMessage = getI18n().t("Common:EncryptionPrepareFailed");
      runInAction(() => {
        if (self.files[indexOfFile]) {
          self.files[indexOfFile].error = errorMessage;
          self.files[indexOfFile].percent = 0;
        }
        const historyIndex = self.uploadedFilesHistory.findIndex(
          (f) => f.uniqueId === self.files[indexOfFile]?.uniqueId,
        );
        if (historyIndex > -1) {
          self.uploadedFilesHistory[historyIndex].error = errorMessage;
          self.uploadedFilesHistory[historyIndex].percent = 0;
        }
      });
      try {
        toastr.error(errorMessage);
      } catch {
        //
      }
      const newPercent = self.getFilesPercent();
      self.percent = newPercent;
      self.primaryProgressDataStore.setPrimaryProgressBarData({
        operation: OPERATIONS_NAME.upload,
        percent: newPercent,
        alert: true,
      });
      self.currentUploadNumber -= 1;
      const nextFileIndex = self.files.findIndex((f) => !f.inAction);
      if (nextFileIndex !== -1) {
        self.startSessionFunc(nextFileIndex, t, createNewIfExist);
      } else {
        const allFilesIsUploaded =
          self.files.findIndex(
            (f) =>
              f.action !== "uploaded" &&
              f.action !== "convert" &&
              f.action !== "converted" &&
              !f.error &&
              !f.cancel,
          ) === -1;
        if (allFilesIsUploaded && !self.finishUploadFilesCalled) {
          self.finishUploadFilesCalled = true;
          if (!self.filesToConversion.length) {
            self.finishUploadFiles(t, !!self.tempConversionFiles?.length);
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
      const fileIndex = self.uploadedFilesHistory.findIndex(
        (f) => f.uniqueId === self.files[indexOfFile].uniqueId,
      );
      if (fileIndex > -1)
        self.uploadedFilesHistory[fileIndex].percent = chunks < 2 ? 50 : 0;

      return self.uploadFileChunks(
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
      const orphanDek = takeFileDek(self.files[indexOfFile]);
      if (orphanDek) wipeDek(orphanDek);

      if (self.files[indexOfFile] === undefined) {
        self.primaryProgressDataStore.setPrimaryProgressBarData({
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
        self.files[indexOfFile].error = errorMessage;
        self.files[indexOfFile].isQuotaError = isQuota;
        const fileIndex = self.uploadedFilesHistory.findIndex(
          (f) => f.uniqueId === self.files[indexOfFile].uniqueId,
        );
        if (fileIndex > -1) {
          self.uploadedFilesHistory[fileIndex].error = errorMessage;
          self.uploadedFilesHistory[fileIndex].isQuotaError = isQuota;
        }

        if (isQuota && !self.quotaErrorRaised) {
          self.quotaErrorRaised = true;
          const currentUniqueId = self.files[indexOfFile].uniqueId;
          self.files.forEach((queued, idx) => {
            if (
              queued.uniqueId === currentUniqueId ||
              queued.inAction ||
              queued.error ||
              queued.cancel ||
              queued.action !== "upload"
            )
              return;

            self.files[idx].error = errorMessage;
            self.files[idx].isQuotaError = true;
            self.files[idx].inAction = true;
            const historyIndex = self.uploadedFilesHistory.findIndex(
              (h) => h.uniqueId === queued.uniqueId,
            );
            if (historyIndex > -1) {
              self.uploadedFilesHistory[historyIndex].error = errorMessage;
              self.uploadedFilesHistory[historyIndex].isQuotaError = true;
            }
          });
        }
      });

      const newPercent = self.getFilesPercent();
      self.percent = newPercent;

      const allFilesIsUploaded =
        self.files.findIndex(
          (f) =>
            f.action !== "uploaded" &&
            f.action !== "convert" &&
            f.action !== "converted" &&
            !f.error &&
            !f.cancel,
        ) === -1;

      self.primaryProgressDataStore.setPrimaryProgressBarData({
        operation: OPERATIONS_NAME.upload,
        percent: newPercent,
        completed: allFilesIsUploaded,
        alert: true,
      });

      self.currentUploadNumber -= 1;

      if (!self.quotaErrorRaised) {
        const nextFileIndex = self.files.findIndex((f) => !f.inAction);

        if (nextFileIndex !== -1) {
          self.startSessionFunc(nextFileIndex, t, createNewIfExist);
        }
      }

      return Promise.resolve();
    })
    .finally(() => {
      const allFilesIsUploaded =
        self.files.findIndex(
          (f) =>
            f.action !== "uploaded" &&
            f.action !== "convert" &&
            f.action !== "converted" &&
            !f.error &&
            !f.cancel,
        ) === -1;

      if (allFilesIsUploaded && !self.finishUploadFilesCalled) {
        self.finishUploadFilesCalled = true;

        if (!self.filesToConversion.length) {
          self.finishUploadFiles(t, !!self.tempConversionFiles.length);
        } else {
          runInAction(() => {
            self.uploaded = true;
            self.asyncUploadObj = {};
          });
        }
      }
    });
}
