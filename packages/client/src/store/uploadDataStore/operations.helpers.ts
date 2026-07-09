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

import uniqueid from "lodash/uniqueId";
import { ConflictResolveType, FileOperationStatus } from "@docspace/shared/enums";
import {
  getFolderInfo,
  copyToFolder,
  moveToFolder,
  fileCopyAs,
} from "@docspace/shared/api/files";
import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";
import { OPERATIONS_NAME } from "@docspace/shared/constants";

import { getUnexpectedErrorText } from "SRC_DIR/helpers/filesUtils";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";

import type { TOperation } from "@docspace/shared/api/files/types";
import type { Nullable } from "@docspace/shared/types";

import type {
  default as UploadDataStore,
  TItemOperationData,
  TPbData,
} from "../UploadDataStore";

// Copy/move operation pipeline extracted from UploadDataStore (Phase 2 of
// uploadDataStore/REFACTORING_PLAN.md). Every method is side-effect heavy
// (secondaryProgressDataStore, real FilesStore mutations, navigation), so all
// follow the `self`-technique: bodies transferred verbatim with this. → self.,
// including the mutual calls (copy/move → loop → moveToCopyTo →
// clearActiveOperations/navigateToNewFolderLocation) which stay as self.*() so
// the MobX action wrapping and test spies are preserved.
//
// TODO: converge copyToActionImpl and moveToActionImpl (near-identical shape,
// different api call and the `content` argument) — only after this refactor,
// as a separate task with its own tests.

export function copyToActionImpl(
  self: UploadDataStore,
  destFolderId: number | string | null | undefined,
  folderIds: number[],
  fileIds: number[],
  conflictResolveType: ConflictResolveType,
  deleteAfter: boolean,
  operationId: string,
  content?: boolean,
  toFillOut?: boolean,
) {
  const { setSecondaryProgressBarData } = self.secondaryProgressDataStore;

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
      return self.loopFilesOperations(data, pbData)
        .then((result) => {
          self.moveToCopyTo(destFolderId, pbData, true, fileIds, folderIds);
          return result;
        })
        .finally(async () => {
          // to update the status of trashIsEmpty filesStore
          if (self.treeFoldersStore.isRecycleBinFolder)
            await self.filesStore.getIsEmptyTrash();
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
      self.clearActiveOperations(fileIds, folderIds);

      return Promise.reject(err);
    });
}

export function moveToActionImpl(
  self: UploadDataStore,
  destFolderId: number | string | null | undefined,
  folderIds: number[],
  fileIds: number[],
  conflictResolveType: ConflictResolveType,
  deleteAfter: boolean,
  operationId: string,
  toFillOut?: boolean,
) {
  const { setSecondaryProgressBarData } = self.secondaryProgressDataStore;
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

      return self.loopFilesOperations(data, pbData)
        .then((result) => {
          self.moveToCopyTo(destFolderId, pbData, false, fileIds, folderIds);
          return result;
        })
        .finally(async () => {
          // to update the status of trashIsEmpty filesStore
          if (self.treeFoldersStore.isRecycleBinFolder)
            await self.filesStore.getIsEmptyTrash();
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
      self.clearActiveOperations(fileIds, folderIds);

      return Promise.reject(err);
    });
}

export function copyAsActionImpl(
  self: UploadDataStore,
  fileId: number,
  title: string,
  folderId: number,
  enableExternalExt?: boolean,
  password?: string,
) {
  const { fetchFiles, filter } = self.filesStore;

  // fileCopyAs declares enableExternalExt/password as
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
}

export function itemOperationToFolderImpl(
  self: UploadDataStore,
  data: TItemOperationData,
) {
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
  const { setSecondaryProgressBarData } = self.secondaryProgressDataStore;

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
    ? self.copyToAction(
        destFolderId,
        folderIds,
        fileIds,
        conflictResolveType,
        deleteAfter,
        operationId,
        content,
        toFillOut,
      )
    : self.moveToAction(
        destFolderId,
        folderIds,
        fileIds,
        conflictResolveType,
        deleteAfter,
        operationId,
        toFillOut,
      );
}

export async function loopFilesOperationsImpl(
  self: UploadDataStore,
  /** Callers (FilesActionsStore) pass `result ?? null`; the falsy case is
   * handled right below. */
  data: TOperation | null,
  pbData: TPbData,
): Promise<TOperation | undefined> {
  const { setSecondaryProgressBarData } = self.secondaryProgressDataStore;

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
      self.secondaryProgressDataStore.secondaryOperationsArray.find(
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
        self.secondaryProgressDataStore.secondaryOperationsArray.find(
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
}

export async function navigateToNewFolderLocationImpl(
  self: UploadDataStore,
  folderId: number | string | null,
) {
  const { filter } = self.filesStore;

  // FilesFilter.folder is declared as string, but the
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
}

export function moveToCopyToImpl(
  self: UploadDataStore,
  destFolderId: number | string | null | undefined,
  pbData: TPbData,
  isCopy: boolean,
  fileIds?: number[],
  folderIds?: number[],
) {
  const { setSecondaryProgressBarData } = self.secondaryProgressDataStore;
  const isMovingSelectedFolder =
    !isCopy && folderIds && self.selectedFolderStore.id === folderIds[0];

  if (!isCopy || destFolderId === self.selectedFolderStore.id) {
    self.clearActiveOperations(fileIds, folderIds);

    if (!isCopy) {
      self.filesStore.removeFiles(fileIds, folderIds, null, destFolderId);
    }

    isMovingSelectedFolder &&
      self.navigateToNewFolderLocation(self.selectedFolderStore.id);
    self.dialogsStore.setIsFolderActions(false);
  } else {
    self.clearActiveOperations(fileIds, folderIds);
  }

  setSecondaryProgressBarData({
    operation: pbData.operation,
    percent: 100,
    completed: true,
    operationId: pbData.operationId,
  });
}

export function clearActiveOperationsImpl(
  self: UploadDataStore,
  /** FilesActionsStore passes null for the unaffected side. */
  fileIds: Nullable<number[]> = [],
  folderIds: Nullable<number[]> = [],
) {
  const { activeFiles, activeFolders, setActiveFiles, setActiveFolders } =
    self.filesStore;

  const newActiveFiles = activeFiles.filter(
    (el) => !fileIds?.includes(el.id as number),
  );
  const newActiveFolders = activeFolders.filter(
    (el) => !folderIds?.includes(el.id as number),
  );

  setActiveFiles(newActiveFiles);
  setActiveFolders(newActiveFolders);
}
