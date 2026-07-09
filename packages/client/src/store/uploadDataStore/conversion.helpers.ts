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
import { convertFile } from "@docspace/shared/api/files";
import { hasOwnProperty } from "@docspace/shared/utils/object";
import { OPERATIONS_NAME } from "@docspace/shared/constants";

import type { TFile } from "@docspace/shared/api/files/types";
import type { TTranslation } from "@docspace/shared/types";

import { getConversationProgress, removeDuplicate } from "./helpers";
import type {
  default as UploadDataStore,
  TConversionFile,
} from "../UploadDataStore";

// Conversion-from-files pipeline extracted from UploadDataStore (Phase 3 of
// uploadDataStore/REFACTORING_PLAN.md) — the conversion path driven by the
// conversion panel / displayedConversionFiles queue. All methods are
// side-effect heavy (primaryProgressDataStore, runInAction over observable
// rows, the real FilesStore), so they follow the `self`-technique: bodies
// transferred verbatim with this. → self., sibling calls kept as self.*().
// Phase 4 (convertFile/startConversion/... — the upload-time conversion path)
// will extend this same module.

export function convertFileFromFilesImpl(
  self: UploadDataStore,
  file: TConversionFile,
  t: TTranslation,
  isOpen?: boolean,
) {
  self.dialogsStore.setConvertItem(null);
  const fileIndex =
    file.index ??
    self.displayedConversionFiles.findIndex((el) => el.fileId === file.fileId);

  if (fileIndex > -1 && self.displayedConversionFiles[fileIndex].inConversion)
    return;

  const secondConvertingWithPassword =
    hasOwnProperty(file, "password") || fileIndex > -1;
  const conversionPositionIndex =
    hasOwnProperty(file, "index") || fileIndex > -1;

  self.primaryProgressDataStore.setPrimaryProgressBarData({
    operation: OPERATIONS_NAME.convert,
    alert: false,
    // the original .js expression `!length === 0` compares a
    // boolean to a number and therefore always evaluates to false; the cast
    // keeps the expression (and its result) unchanged.
    completed: (!self.activeConversionQueue.length as unknown) === 0,
    showPanel: self.setConversionPanelVisible,
    withoutProgress: true,
  });

  const isFirstConversion = !self.activeConversionQueue.length;
  self.activeConversionQueue.push(file);

  const shouldUpdateExistingFile =
    secondConvertingWithPassword && conversionPositionIndex;

  if (shouldUpdateExistingFile) {
    const updatedFile = self.displayedConversionFiles[fileIndex];

    // the original .js assumed fileInfo is set on both items
    // in the "second conversion with password" flow (would throw otherwise).
    updatedFile.fileInfo!.fileExst = file.fileInfo!.fileExst;

    self.displayedConversionFiles[fileIndex].action = "convert";
    self.displayedConversionFiles[fileIndex].error = null;
    self.displayedConversionFiles[fileIndex].errorShown = false;
  } else {
    self.displayedConversionFiles.push(file);
  }

  if (isFirstConversion) {
    self.startConversionFromFiles(t, isOpen);
  }
}

export function setConversionPercentImpl(
  self: UploadDataStore,
  percent: number,
  alert?: boolean,
) {
  const data = {
    operation: OPERATIONS_NAME.upload,
    percent,
    completed: false,
  };

  if (self.uploaded) {
    self.primaryProgressDataStore.setPrimaryProgressBarData(
      alert ? { ...data, ...{ alert } } : data,
    );
  }
}

export async function startConversionFromFilesImpl(
  self: UploadDataStore,
  t: TTranslation,
  isOpen = false,
) {
  const operationName = OPERATIONS_NAME.convert;

  runInAction(() => (self.convertedFromFiles = false));

  let index = 0;
  self.activeConversionQueue = removeDuplicate(self.activeConversionQueue);
  const filesToConversion = self.activeConversionQueue;

  while (index < filesToConversion.length) {
    const conversionItem = filesToConversion[index];
    const { fileId, password, format } = conversionItem;
    const itemPassword = password || null;

    // `find` and `findIndex` use the same predicate on the
    // same array, so after the `fileIndex === -1` break the original .js
    // relied on historyFile being defined; the non-null assertions keep it.
    const historyFile = self.displayedConversionFiles.find(
      (f) => f.fileId === fileId,
    );
    const fileIndex = self.displayedConversionFiles.findIndex(
      (f) => f.fileId === fileId,
    );

    if (fileIndex === -1) break;

    runInAction(() => (historyFile!.inConversion = true));

    const res = convertFile(fileId, format, itemPassword).catch(() => {
      const error = t("Common:FailedToConvert");

      runInAction(() => {
        historyFile!.error = error;
      });

      if (self.convertedFromFiles) {
        self.primaryProgressDataStore.setPrimaryProgressBarData({
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

    // `(progress ?? 100) < 100` is runtime-identical to the
    // original `progress < 100` (undefined < 100 is false, as is 100 < 100).
    while ((progress ?? 100) < 100) {
      const response = await getConversationProgress(fileId);
      progress = response?.[0]?.progress;
      fileInfo = response?.[0]?.result;

      historyFile!.convertProgress = progress;

      error = response && response[0] && response[0].error;

      if (error?.length) {
        self.primaryProgressDataStore.setPrimaryProgressBarData({
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
        // the original .js read fileInfo.id without a guard
        // (fileInfo is the conversion result; would throw on null).
        self.filesStore.openDocEditor((fileInfo as TFile).id);
      }

      runInAction(() => {
        historyFile!.error = error;
        historyFile!.convertProgress = progress;
        historyFile!.inConversion = false;

        // the original .js called error.indexOf without a
        // guard (would throw when the conversion result has no error text).
        if (error!.indexOf("password") !== -1) {
          historyFile!.needPassword = true;
        } else historyFile!.action = "converted";

        if (fileInfo && fileInfo !== "password") {
          historyFile!.fileInfo = fileInfo;
        }
      });

      if (!historyFile?.error && (historyFile?.fileInfo?.version ?? 0) > 2) {
        self.filesStore.setHighlightFile({
          highlightFileId: historyFile!.fileInfo!.id,
          isFileHasExst: !historyFile!.fileInfo!.fileExst,
        });
      }
    }

    index++;
  }

  self.primaryProgressDataStore.setPrimaryProgressBarData({
    operation: operationName,
    completed: true,
  });

  runInAction(() => {
    self.convertedFromFiles = true;

    if (self.convertedFromFiles) {
      self.activeConversionQueue = [];
    }
  });
}

export function retryConvertFilesImpl(
  self: UploadDataStore,
  t: TTranslation,
  fileId: number,
) {
  const fileIndex = self.files.findIndex((f) => f.fileId === fileId);
  const fileConversionInxex = self.displayedConversionFiles.findIndex(
    (f) => f.fileId === fileId,
  );

  if (fileIndex > -1) {
    const retryFile = self.files[fileIndex];
    retryFile.inConversion = false;
  }

  if (fileConversionInxex === -1) return;

  const retryFileConversion =
    self.displayedConversionFiles[fileConversionInxex];

  retryFileConversion.inConversion = false;

  self.convertFileFromFiles(retryFileConversion, t);
}
