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

import { changeIndex, reorderIndex } from "@docspace/shared/api/files";
import {
  ExportRoomIndexTaskStatus,
  VDRIndexingAction,
} from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import uniqueid from "lodash/uniqueId";
import api from "@docspace/shared/api";
import { showSuccessExportRoomIndexToast } from "SRC_DIR/helpers/toast-helpers";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import type { TTranslation } from "@docspace/shared/types";
import type { TIndexItems } from "@docspace/shared/api/files/types";
import type { TExportRoomIndexTask } from "@docspace/shared/api/rooms/types";
import { checkExportRoomIndexProgress } from "./helpers";
import type IndexingStore from "../IndexingStore";
import type FilesActionStore from "../FilesActionsStore";
import type { TActionItem, TOperationName } from "../FilesActionsStore";

export const setListOrderImpl = (
self: FilesActionStore,
  startIndex: number,
  finalIndex: number,
  indexMovedFromBottom = false,

)=> {
  const { setUpdateSelection } = self.indexingStore;
  // in the indexing view every list item carries an order
  // string; the old JS relied on that unchecked.
  const newFilesList = JSON.parse(
    JSON.stringify(self.filesStore.filesList),
  ) as (TActionItem & { order: string })[];

  let i = startIndex;
  while (i !== finalIndex) {
    if (newFilesList[i].order.includes(".")) {
      const splitItem = newFilesList[i].order.split(".");

      // the old JS stores numbers into the string[] before
      // join(); the erased casts keep that behavior.
      if (indexMovedFromBottom) {
        splitItem[splitItem.length - 1] = (+splitItem.at(-1)! +
          1) as unknown as string;
      } else {
        splitItem[splitItem.length - 1] = (+splitItem.at(-1)! -
          1) as unknown as string;
      }

      newFilesList[i].order = splitItem.join(".");
    } else if (indexMovedFromBottom) {
      newFilesList[i].order = `${+newFilesList[i].order + 1}`;
    } else {
      newFilesList[i].order = `${+newFilesList[i].order - 1}`;
    }
    setUpdateSelection([newFilesList[i]]);
    i++;
  }

  return newFilesList;
};


export const setFilesOrderImpl = (
self: FilesActionStore,
  currentItem: TActionItem,
  replaceableItem: TActionItem,
  indexMovedFromBottom?: boolean,

)=> {
  const { filesList, setFiles, setFolders } = self.filesStore;
  const { setPreviousFilesList, updateSelection, setUpdateSelection } =
    self.indexingStore;

  if (updateSelection.length === 0) {
    setPreviousFilesList(filesList);
  }

  const currentIndex = filesList.findIndex(
    (f) => f.order === currentItem.order,
  );
  const replaceableIndex = filesList.findIndex(
    (f) => f.order === replaceableItem.order,
  );

  let newFilesList: ReturnType<typeof self.setListOrder>;
  if (indexMovedFromBottom) {
    newFilesList = self.setListOrder(
      replaceableIndex,
      currentIndex,
      indexMovedFromBottom,
    );
    newFilesList[currentIndex].order = replaceableItem.order!;
  } else {
    newFilesList = self.setListOrder(currentIndex, replaceableIndex + 1);
    newFilesList[currentIndex].order = filesList[replaceableIndex].order!;
  }
  setUpdateSelection([newFilesList[currentIndex]]);

  const newFolders = newFilesList.filter((f) => f.isFolder);
  const newFiles = newFilesList.filter((f) => !f.isFolder);

  setFiles(newFiles);
  setFolders(newFolders);
};


export const revokeFilesOrderImpl = (
self: FilesActionStore
)=> {
  const { setFiles, setFolders } = self.filesStore;
  const { previousFilesList } = self.indexingStore;

  if (!previousFilesList.length) return;

  const newFolders = previousFilesList.filter((f) => f.isFolder);
  const newFiles = previousFilesList.filter((f) => !f.isFolder);

  // previousFilesList holds the same .js filesList
  // view-models this store works with; IndexingStore types them minimally.
  setFiles(newFiles as unknown as TActionItem[]);
  setFolders(newFolders as unknown as TActionItem[]);
};


export const changeIndexImpl = async (
self: FilesActionStore,
  action: VDRIndexingAction,
  item: TActionItem,
  t: TTranslation,
  isLastItem = true,

)=> {
  const { filesList, bufferSelection } = self.filesStore;

  const index = filesList.findIndex(
    (elem) => elem.id === item?.id && elem.fileExst === item?.fileExst,
  );

  if (
    (action === VDRIndexingAction.HigherIndex && index === 0) ||
    (action === VDRIndexingAction.LowerIndex &&
      index === filesList.length - 1)
  )
    return;

  // with no selection the old JS worked on [null] and
  // crashed below; the erased cast keeps that behavior.
  const selection = (
    self.filesStore.selection.length
      ? self.filesStore.selection
      : [bufferSelection]
  ) as TActionItem[];

  let replaceable: TActionItem | undefined;
  let current = item;

  switch (action) {
    case VDRIndexingAction.HigherIndex:
      replaceable = filesList[index - 1];
      break;

    case VDRIndexingAction.LowerIndex:
      replaceable = filesList[index + 1];
      break;

    default:
      current = selection[0];
      replaceable = item;
      break;
  }

  if (!replaceable || current.order === replaceable.order) return;

  try {
    let indexMovedFromBottom = +current.order! > +replaceable.order!;
    if (current.order!.includes(".")) {
      indexMovedFromBottom =
        +current.order!.split(".").at(-1)! >
        +replaceable.order!.split(".").at(-1)!;
    }

    const newRepIndex = filesList.findIndex(
      (f) => f.id === replaceable.id && f.isFolder === replaceable.isFolder,
    );

    const newReplaceable =
      indexMovedFromBottom || isLastItem
        ? replaceable
        : filesList[newRepIndex - 1];

    self.setFilesOrder(current, newReplaceable, indexMovedFromBottom);
    self.filesStore.setSelected("none");
  } catch (e) {
    console.error(e);
    toastr.error(t("Files:ErrorChangeIndex"));
  }
};


export const saveIndexOfFilesImpl = async (
self: FilesActionStore,t: TTranslation
)=> {
  const { getIndexingArray } = self.indexingStore;

  try {
    const items = getIndexingArray();

    if (items.length > 0) {
      // the shared TIndexItems declares order as a string,
      // but IndexingStore collects the raw (number|string) orders; the API
      // only serializes them (old JS behavior).
      await changeIndex(items as unknown as TIndexItems[]);
    }
  } catch (e) {
    console.error(e);
    toastr.error(t("Files:ErrorChangeIndex"));
  }
};


export const reorderIndexOfFilesImpl = async (
self: FilesActionStore,id: number, t: TTranslation
)=> {
  const { setIsIndexEditingMode } = self.indexingStore;

  try {
    const operationId = uniqueid("operation_");
    await reorderIndex(id);
    toastr.success(t("Common:SuccessfullyCompletedOperation"));
    setIsIndexEditingMode(false);
    self.updateCurrentFolder(true, operationId);
  } catch (e) {
    console.error(e);
    toastr.error(t("Files:ErrorChangeIndex"));
  }
};


export const checkPreviousExportRoomIndexInProgressImpl = async (
self: FilesActionStore
)=> {
  try {
    if (self.alreadyExportingRoomIndex) {
      return true;
    }

    const previousExport = await api.rooms.getExportRoomIndexProgress();

    return previousExport && !previousExport.isCompleted;
  } catch (e) {
    toastr.error(e as string);
  }
};


export const loopExportRoomIndexStatusCheckingImpl = async (
self: FilesActionStore,pbData: {
  operation: TOperationName;
  operationId: string;
}
): Promise<TExportRoomIndexTask>=> {
  const { setSecondaryProgressBarData } =
    self.uploadDataStore.secondaryProgressDataStore;

  let isCompleted = false;
  let res: TExportRoomIndexTask | undefined;

  while (!isCompleted) {
    res = await checkExportRoomIndexProgress();

    if (res?.isCompleted) {
      isCompleted = true;
    }

    if (res?.percentage) {
      setSecondaryProgressBarData({
        operation: pbData.operation,
        percent: res.percentage,
        alert: false,
        operationId: pbData.operationId,
      });
    }
  }

  // the loop only exits once a progress response arrived;
  // the `!` keeps the old unchecked return.
  return res!;
};


export const onSuccessExportRoomIndexImpl = (
self: FilesActionStore,t: TTranslation, fileName: string, fileUrl: string
)=> {
  const { openOnNewPage } = self.filesSettingsStore;
  const urlWithProxy = combineUrl(window.ClientConfig?.proxy?.url, fileUrl);

  showSuccessExportRoomIndexToast(t, fileName, urlWithProxy, openOnNewPage);
};


export const exportRoomIndexImpl = async (
self: FilesActionStore,t: TTranslation, roomId: number
)=> {
  const previousExportInProgress =
    await self.checkPreviousExportRoomIndexInProgress();

  if (previousExportInProgress) {
    return toastr.error(t("Files:ExportRoomIndexAlreadyInProgressError"));
  }

  const { setSecondaryProgressBarData } =
    self.uploadDataStore.secondaryProgressDataStore;

  const operationName = OPERATIONS_NAME.exportIndex;

  const pbData = {
    operation: operationName,
    operationId: uniqueid("operation_"),
  };

  setSecondaryProgressBarData({
    operation: pbData.operation,
    operationId: pbData.operationId,
    percent: 0,
  });

  self.alreadyExportingRoomIndex = true;

  try {
    let res: TExportRoomIndexTask = await api.rooms.exportRoomIndex(roomId);

    if (!res.isCompleted) {
      res = await self.loopExportRoomIndexStatusChecking(pbData);
    }

    if (res.error || res.status === ExportRoomIndexTaskStatus.Failed) {
      toastr.error(res.error);

      setSecondaryProgressBarData({
        operation: pbData.operation,
        completed: true,
        alert: true,
        operationId: pbData.operationId,
      });

      return;
    }

    if (res.status === ExportRoomIndexTaskStatus.Completed) {
      self.onSuccessExportRoomIndex(t, res.resultFileName, res.resultFileUrl);
    }

    setSecondaryProgressBarData({
      operation: pbData.operation,
      completed: true,
      operationId: pbData.operationId,
    });
  } catch (e) {
    toastr.error(e as string, null, 0, true);
  } finally {
    self.alreadyExportingRoomIndex = false;
  }
};

