// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  copyToFolder,
  moveToFolder,
  duplicate,
  getFolder,
  getFoldersTree,
} from "@docspace/shared/api/files";
import type {
  TFolder,
  TFile,
  TGetFolder,
} from "@docspace/shared/api/files/types";
import type { TBreadCrumb } from "@docspace/ui-kit/components/selector";
import FilesFilter from "@docspace/shared/api/files/filter";
import { ConflictResolveType, FolderType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { PAGE_COUNT } from "@/utils/constants";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";

export type SelectorMode = "copy" | "move" | "restore";

export type OperationProgress = {
  icon: "copy" | "move" | "duplicate";
  percent: number;
  completed: boolean;
  alert: boolean;
};

export type SelectorInitData = {
  items: (TFile | TFolder)[];
  breadCrumbs: TBreadCrumb[];
  currentFolderId: number | string;
  rootFolderType: FolderType;
  total: number;
  hasNextPage: boolean;
};

export default function useFileOperations() {
  const router = useRouter();
  const filesListStore = useFilesListStore();
  const filesSelectionStore = useFilesSelectionStore();

  const [selectorDialogVisible, setSelectorDialogVisible] = useState(false);
  const [selectorMode, setSelectorMode] = useState<SelectorMode>("copy");
  const [pendingItems, setPendingItems] = useState<
    (TFileItem | TFolderItem)[]
  >([]);

  // Panel init data
  const [foldersTree, setFoldersTree] = useState<TFolder[] | null>(null);
  const [selectorInitData, setSelectorInitData] =
    useState<SelectorInitData | null>(null);

  // Operation progress
  const [operationProgress, setOperationProgress] =
    useState<OperationProgress | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearProgress = useCallback(() => {
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setOperationProgress(null);
  }, []);

  const trackOperation = useCallback(
    async (
      operationId: string,
      icon: OperationProgress["icon"],
      onComplete?: () => void,
    ) => {
      setOperationProgress({ icon, percent: 0, completed: false, alert: false });

      try {
        let finished = false;
        while (!finished) {
          const result = await getOperationProgress(
            operationId,
            "Operation failed",
            true,
          );
          if (result) {
            setOperationProgress((prev) =>
              prev ? { ...prev, percent: result.progress } : prev,
            );
            finished = result.finished;
          } else {
            finished = true;
          }
        }

        onComplete?.();
        setOperationProgress((prev) =>
          prev ? { ...prev, completed: true, percent: 100 } : prev,
        );
        progressTimerRef.current = setTimeout(clearProgress, 3000);
      } catch (error) {
        setOperationProgress((prev) =>
          prev ? { ...prev, alert: true } : prev,
        );
        toastr.error(error instanceof Error ? error.message : String(error));
        progressTimerRef.current = setTimeout(clearProgress, 5000);
      }
    },
    [clearProgress],
  );

  const openSelector = useCallback(
    async (mode: SelectorMode, items: (TFileItem | TFolderItem)[]) => {
      setPendingItems(items);
      setSelectorMode(mode);

      try {
        const filter = FilesFilter.getDefault();
        filter.page = 0;
        filter.pageCount = PAGE_COUNT;

        const [tree, folderData] = await Promise.all([
          getFoldersTree(),
          getFolder("@my", filter),
        ]);

        const { folders, files, current, pathParts, total } =
          folderData as TGetFolder;

        const breadCrumbs: TBreadCrumb[] = pathParts.map((part) => ({
          id: part.id,
          label: part.title,
        }));

        setFoldersTree(tree as TFolder[]);
        setSelectorInitData({
          items: [...folders, ...files],
          breadCrumbs,
          currentFolderId: current.id,
          rootFolderType: current.rootFolderType as unknown as FolderType,
          total,
          hasNextPage: total > PAGE_COUNT,
        });

        setSelectorDialogVisible(true);
      } catch (error) {
        toastr.error(error instanceof Error ? error.message : String(error));
      }
    },
    [],
  );

  const requestCopy = useCallback(
    (item: TFileItem | TFolderItem) => openSelector("copy", [item]),
    [openSelector],
  );

  const requestCopyItems = useCallback(
    (items: (TFileItem | TFolderItem)[]) => openSelector("copy", items),
    [openSelector],
  );

  const requestMove = useCallback(
    (item: TFileItem | TFolderItem) => openSelector("move", [item]),
    [openSelector],
  );

  const requestMoveItems = useCallback(
    (items: (TFileItem | TFolderItem)[]) => openSelector("move", items),
    [openSelector],
  );

  const requestRestore = useCallback(
    (item: TFileItem | TFolderItem) => openSelector("restore", [item]),
    [openSelector],
  );

  const requestRestoreItems = useCallback(
    (items: (TFileItem | TFolderItem)[]) => openSelector("restore", items),
    [openSelector],
  );

  const requestDuplicate = useCallback(
    async (item: TFileItem | TFolderItem) => {
      const fileIds = item.isFolder ? [] : [item.id as number];
      const folderIds = item.isFolder ? [item.id as number] : [];

      try {
        const operations = await duplicate(folderIds, fileIds);
        const opId = operations?.[0]?.id;
        if (opId) {
          await trackOperation(opId, "duplicate", () => {
            router.refresh();
          });
        } else {
          router.refresh();
        }
      } catch (error) {
        toastr.error(error instanceof Error ? error.message : String(error));
      }
    },
    [router, trackOperation],
  );

  const closeSelectorDialog = useCallback(() => {
    setSelectorDialogVisible(false);
    setPendingItems([]);
    setFoldersTree(null);
    setSelectorInitData(null);
  }, []);

  const confirmOperation = useCallback(
    async (destFolderId: number | string) => {
      if (!pendingItems.length) return;

      const fileIds = pendingItems
        .filter((i) => !i.isFolder)
        .map((i) => i.id as number);
      const folderIds = pendingItems
        .filter((i) => i.isFolder)
        .map((i) => i.id as number);

      const isMove = selectorMode === "move" || selectorMode === "restore";

      // Close panel immediately
      setSelectorDialogVisible(false);

      try {
        let operations;
        if (selectorMode === "copy") {
          operations = await copyToFolder(
            destFolderId as number,
            folderIds,
            fileIds,
            ConflictResolveType.Duplicate,
            false,
          );
        } else {
          operations = await moveToFolder(
            destFolderId as number,
            folderIds,
            fileIds,
            ConflictResolveType.Duplicate,
            false,
          );
        }

        const opId = operations?.[0]?.id;
        const icon = selectorMode === "copy" ? "copy" : "move";

        if (opId) {
          await trackOperation(opId, icon, () => {
            if (isMove) {
              for (const item of pendingItems) {
                filesListStore.removeItem(item.id);
              }
              filesSelectionStore.setSelection();
            }
          });
        } else if (isMove) {
          for (const item of pendingItems) {
            filesListStore.removeItem(item.id);
          }
          filesSelectionStore.setSelection();
        }
      } catch (error) {
        toastr.error(error instanceof Error ? error.message : String(error));
      } finally {
        setPendingItems([]);
        setFoldersTree(null);
        setSelectorInitData(null);
      }
    },
    [
      selectorMode,
      filesListStore,
      filesSelectionStore,
      pendingItems,
      trackOperation,
    ],
  );

  // Compute disabled items (can't move folder into itself)
  const disabledItems = pendingItems
    .filter((i) => i.isFolder)
    .map((i) => i.id as number);

  return {
    selectorDialogVisible,
    selectorMode,
    pendingItemCount: pendingItems.length,
    foldersTree,
    selectorInitData,
    disabledItems,
    operationProgress,
    requestCopy,
    requestCopyItems,
    requestMove,
    requestMoveItems,
    requestRestore,
    requestRestoreItems,
    requestDuplicate,
    closeSelectorDialog,
    confirmOperation,
  };
}
