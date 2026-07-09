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

import { Trans } from "react-i18next";
import { TIMEOUT } from "SRC_DIR/helpers/filesConstants";
import SocketHelper, { SocketCommands } from "@docspace/ui-kit/utils/socket";
import { toastr } from "@docspace/ui-kit/components/toast";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { Link } from "@docspace/ui-kit/components/link";

import type { TFunction } from "i18next";
import type { TFolder } from "@docspace/shared/api/files/types";
import type { TTranslation } from "@docspace/shared/types";

import { releaseUploadAutoLockSuspension } from "./helpers";
import type { TUploadFile } from "./helpers";
import type {
  default as UploadDataStore,
  TUploadData,
} from "../UploadDataStore";

// Upload finalization and its toasts extracted from UploadDataStore (Phase 8
// of uploadDataStore/REFACTORING_PLAN.md). This is the first .tsx helper:
// showFinishUploadToastr builds <Trans>/<Link> JSX toasts. Transferred
// verbatim via the self-technique. Preserved as-is (do NOT fix): the
// deferred setUploadData behind setTimeout(TIMEOUT), the read of the
// non-existent primaryProgressDataStore.alert, the SocketHelper RefreshFolder
// emit and refreshFiles' unshift + filter.total mutation of the real
// FilesStore. The finishUploadFilesCalled latch lives in the callers, not
// here. Sibling calls stay self.*().

export async function refreshFilesImpl(
  self: UploadDataStore,
  currentFile?: TUploadFile,
) {
  const { files, setFiles, folders, setFolders, filter, setFilter } =
    self.filesStore;

  const { filesCount, setFilesCount } = self.selectedFolderStore;

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
    const index = path.findIndex((x) => x === self.selectedFolderStore.id);
    const folderId = index !== -1 ? path[index + 1] : null;
    // if (folderId && folderId !== self.aiRoomStore.knowledgeId)
    //   folderInfo = await getFolderInfo(folderId);

    const newPath: number[] = [];
    if (folderInfo || path[path.length - 1] === self.selectedFolderStore.id) {
      let i = 0;
      while (path[i] && path[i] !== folderId) {
        newPath.push(path[i]);
        i++;
      }
    }

    if (
      newPath[newPath.length - 1] !== self.selectedFolderStore.id &&
      path.length
    ) {
      return;
    }

    const addNewFile = () => {
      if (!self.filesStore.showNewFilesInList) {
        return;
      }

      if (folderInfo) {
        const isFolderExist = newFolders.find((x) => x.id === folderInfo.id);
        if (!isFolderExist && folderInfo) {
          console.error(self.selectedFolderStore.id);
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
        } else if (!self.filesSettingsStore.storeOriginalFiles) {
          newFiles[fileIndex] = currentFile.fileInfo;
          setFiles(newFiles);
        }
      }
    };

    const isFiltered =
      filter.filterType || filter.authorType || filter.search;

    if ((!currentFile && !folderInfo) || isFiltered) return;
    if (folderInfo && self.selectedFolderStore.id === folderInfo.id) return;

    if (folderInfo) {
      const folderIndex = folders.findIndex((f) => f.id === folderInfo.id);
      if (folderIndex !== -1) {
        folders[folderIndex] = folderInfo;
        return;
      }
    }

    addNewFile();
  }
}

export function showFinishUploadToastrImpl(
  self: UploadDataStore,
  t: TTranslation,
  totalErrorsCount: number,
  filesWithoutErrors: TUploadFile[],
  filesWithErrors: TUploadFile[],
  filesWithAllErrors: number,
) {
  if (totalErrorsCount === 0) {
    toastr.success(
      t("Common:ItemsSuccessfullyUploaded", {
        count: filesWithoutErrors.length,
      }),
    );
    return;
  }

  self.primaryProgressDataStore.setPrimaryProgressBarData({
    operation: OPERATIONS_NAME.upload,
    alert: true,
    errorCount: filesWithAllErrors,
  });

  self.uploadedFilesHistory.forEach((f) => {
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
              self.setUploadPanelVisible(true);
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
            self.setUploadPanelVisible(true);
          }}
        />,
      ]}
    />,
    null,
    60000,
    true,
  );
}

export function finishUploadFilesImpl(
  self: UploadDataStore,
  t: TTranslation,
  waitConversion?: boolean,
) {
  releaseUploadAutoLockSuspension();

  const filesWithErrors = self.uploadedFilesHistory.filter(
    (f) => f.error && !f.errorShown,
  );
  const filesWithAllErrors = self.uploadedFilesHistory.filter((f) => f.error);
  const filesWithoutErrors = self.uploadedFilesHistory.filter(
    (f) => !f.error,
  );

  self.showFinishUploadToastr(
    t,
    filesWithAllErrors.length,
    filesWithoutErrors,
    filesWithErrors,
    filesWithAllErrors.length,
  );

  self.uploaded = true;
  self.converted = true;
  self.uploadedFilesSize = 0;
  self.asyncUploadObj = {};

  self.files = self.files.map((f) => {
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

  if (self.files.length > 0) {
    const toFolderId = self.files[0]?.toFolderId;

    if (toFolderId) {
      // the socket typings declare the RefreshFolder payload
      // as a string, but the original .js has always sent this object.
      SocketHelper?.emit(SocketCommands.RefreshFolder, {
        toFolderId,
      } as unknown as string);
    }
  }

  if (!waitConversion)
    self.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: OPERATIONS_NAME.upload,
      completed: true,
    });

  setTimeout(() => {
    // PrimaryProgressDataStore has no `alert` member (it has
    // primaryOperationsAlert); the original .js read an undefined property
    // here, which the cast preserves without changing the runtime.
    if (
      self.uploadPanelVisible ||
      (self.primaryProgressDataStore as { alert?: boolean }).alert
    ) {
      uploadData.files = self.files;
      uploadData.filesToConversion = self.filesToConversion;
    }

    self.setUploadData(uploadData);
  }, TIMEOUT);
}
