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
 * source code, which remains agreed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import { useCallback, useRef, useState } from "react";

import { copyToFolder, getFolder } from "@docspace/shared/api/files";
import FilesFilter from "@docspace/shared/api/files/filter";
import { ConflictResolveType } from "@docspace/shared/enums";
import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";

import useOperationToast from "./useOperationToast";

export type CopyProgress = {
  icon: "copy";
  percent: number;
  completed: boolean;
  alert: boolean;
};

/**
 * After a room is created from My Documents context menu / header action,
 * copies the items that triggered the dialog into the new room.
 *
 * Mirrors client FilesActionsStore.preparingDataForCopyingToRoom +
 * UploadDataStore secondary-progress tracking, but uses the SDK's
 * existing trackOperation pattern (FloatingButton + operationProgress state).
 */
export default function useCreateRoomWithCopy() {
  const filesSelectionStore = useFilesSelectionStore();
  const { showCopyToast } = useOperationToast();

  const pendingItemsRef = useRef<(TFileItem | TFolderItem)[]>([]);

  const [copyProgress, setCopyProgress] = useState<CopyProgress | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCopyProgress = useCallback(() => {
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setCopyProgress(null);
  }, []);

  /**
   * Snapshot the current selection before the dialog opens so that
   * selection changes (e.g. user clicks away) don't affect the copy.
   */
  const snapshotSelection = useCallback(() => {
    const items =
      filesSelectionStore.selection.length > 0
        ? [...filesSelectionStore.selection]
        : filesSelectionStore.bufferSelection
          ? [filesSelectionStore.bufferSelection]
          : [];
    pendingItemsRef.current = items;
  }, [filesSelectionStore]);

  /**
   * Called by CreateEditRoomDialog.onRoomCreated.
   * Copies the snapshotted items into the newly created room, tracking
   * progress via FloatingButton and showing a success toast.
   */
  const copyItemsToRoom = useCallback(
    async (roomId: number, roomTitle: string) => {
      const items = pendingItemsRef.current;
      pendingItemsRef.current = [];

      if (!items.length) return;

      // Mirrors preparingDataForCopyingToRoom: single-folder copies its
      // contents (content: true); mixed/file selections copy the items directly.
      const oneFolder = items.length === 1 && items[0].isFolder;

      const itemsToCopy = items;

      if (oneFolder) {
        // Peek inside to get the actual count (for toast); bail if empty.
        try {
          const { total } = await getFolder(items[0].id, FilesFilter.getDefault());
          if (total === 0) return;
        } catch (e) {
          toastr.error(e as Error);
          return;
        }
      }

      const fileIds = itemsToCopy
        .filter((i) => !i.isFolder)
        .map((i) => i.id as number);
      const folderIds = itemsToCopy
        .filter((i) => i.isFolder)
        .map((i) => i.id as number);

      setCopyProgress({ icon: "copy", percent: 0, completed: false, alert: false });

      try {
        const operations = await copyToFolder(
          roomId,
          folderIds,
          fileIds,
          ConflictResolveType.Duplicate,
          false,
          /* content */ oneFolder,
        );

        const opId = operations?.[0]?.id;

        if (opId) {
          let finished = false;
          while (!finished) {
            const result = await getOperationProgress(opId, "", true);
            if (result) {
              setCopyProgress((prev) =>
                prev ? { ...prev, percent: result.progress } : prev,
              );
              finished = result.finished;
            } else {
              finished = true;
            }
          }
        }

        setCopyProgress((prev) =>
          prev ? { ...prev, completed: true, percent: 100 } : prev,
        );
        progressTimerRef.current = setTimeout(clearCopyProgress, 3000);

        showCopyToast({
          items: itemsToCopy,
          destFolderId: roomId,
          destFolderTitle: roomTitle,
        });
      } catch (e) {
        setCopyProgress((prev) =>
          prev ? { ...prev, alert: true } : prev,
        );
        toastr.error(e as Error);
        progressTimerRef.current = setTimeout(clearCopyProgress, 5000);
      }
    },
    [showCopyToast, clearCopyProgress],
  );

  return { snapshotSelection, copyItemsToRoom, copyProgress };
}
