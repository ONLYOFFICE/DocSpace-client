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

"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import {
  copyToFolder,
  moveToFolder,
  duplicate,
  getFolder,
  getFoldersTree,
  checkFileConflicts,
} from "@docspace/shared/api/files";
import { getApps } from "@docspace/shared/api/apps";
import type {
  TFolder,
  TFile,
  TFileSecurity,
  TFolderSecurity,
  TGetFolder,
} from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TBreadCrumb } from "@onlyoffice/apps-ui-kit/components/selector";
import FilesFilter from "@docspace/shared/api/files/filter";
import { ConflictResolveType, FolderType } from "@docspace/shared/enums";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useEncryptedFileActions } from "@/app/(docspace)/_contexts/EncryptedFileActionsContext";
import { PAGE_COUNT } from "@/utils/constants";
import { resolveFolderTarget } from "@docspace/shared/services/private-room/upload-target";
import {
  getSelectorTransfer,
  getShowEncryptedTransferBanner,
  planPrivateTransfer,
} from "@docspace/shared/services/private-room/private-transfer";
import { getIsDisabled } from "@docspace/shared/utils/filesSelector";
import { getEncryptedOperationErrorMessage } from "@docspace/shared/services/encryption/error-i18n";
import useOperationToast from "./useOperationToast";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";

export type SelectorMode = "copy" | "move" | "restore";

export type OperationProgress = {
  icon: "copy" | "move" | "duplicate" | "trash" | "deletePermanently";
  percent: number;
  completed: boolean;
  alert: boolean;
};

export type TrackOperation = (
  operationId: string,
  icon: OperationProgress["icon"],
  onComplete?: () => void,
) => Promise<void>;

export type SelectorInitData = {
  items: (TFile | TFolder)[];
  breadCrumbs: TBreadCrumb[];
  currentFolderId: number | string;
  rootFolderType: FolderType;
  total: number;
  hasNextPage: boolean;
};

/** Where a transfer to the folder lands; null when its path cannot be read. */
const resolveDestination = (folderId: number | string) =>
  resolveFolderTarget({ id: folderId }).catch(() => null);

type UseFileOperationsOptions = {
  /** The standard upload, with its conflict check, for decrypted copies. */
  uploadDecryptedFiles: (
    files: File[],
    folderId: number | string,
  ) => Promise<void>;
};

export default function useFileOperations({
  uploadDecryptedFiles,
}: UseFileOperationsOptions) {
  const { t } = useTranslation(["Common"]);
  const router = useRouter();
  const { showCopyToast, showMoveToast } = useOperationToast();
  const filesListStore = useFilesListStore();
  const filesSelectionStore = useFilesSelectionStore();
  const encryptedActions = useEncryptedFileActions();

  const [selectorDialogVisible, setSelectorDialogVisible] = useState(false);
  const [selectorMode, setSelectorMode] = useState<SelectorMode>("copy");
  const [pendingItems, setPendingItems] = useState<(TFileItem | TFolderItem)[]>(
    [],
  );

  const [conflictDialogVisible, setConflictDialogVisible] = useState(false);
  const [conflictItems, setConflictItems] = useState<
    { title: string; isFile: boolean }[]
  >([]);
  const pendingConflictDestRef = useRef<{
    destFolderId: number;
    destFolderTitle: string;
    isMove: boolean;
  } | null>(null);

  // Panel init data
  const [foldersTree, setFoldersTree] = useState<TFolder[] | null>(null);
  const [selectorInitData, setSelectorInitData] =
    useState<SelectorInitData | null>(null);
  const [hasRooms, setHasRooms] = useState(false);

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

  // Spec: private-rooms/sdk-surface, "Encrypted errors are localized"
  const toErrorText = useCallback(
    (error: unknown) => {
      if (typeof error === "string" && error) return error;
      if (encryptedActions) return getEncryptedOperationErrorMessage(t, error);
      return error instanceof Error ? error.message : String(error);
    },
    [encryptedActions, t],
  );

  const trackOperation = useCallback(
    async (
      operationId: string,
      icon: OperationProgress["icon"],
      onComplete?: () => void,
    ) => {
      setOperationProgress({
        icon,
        percent: 0,
        completed: false,
        alert: false,
      });

      try {
        let finished = false;
        while (!finished) {
          const result = await getOperationProgress(
            operationId,
            encryptedActions
              ? t("Common:EncryptedOperationFailed")
              : "Operation failed",
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
        toastr.error(toErrorText(error));
        progressTimerRef.current = setTimeout(clearProgress, 5000);
      }
    },
    [clearProgress, encryptedActions, t, toErrorText],
  );

  const openSelector = useCallback(
    async (mode: SelectorMode, items: (TFileItem | TFolderItem)[]) => {
      setPendingItems(items);
      setSelectorMode(mode);

      try {
        const filter = FilesFilter.getDefault();
        filter.page = 0;
        filter.pageCount = PAGE_COUNT;

        const isInRoomsContext =
          filesListStore.rootFolderType === FolderType.Rooms ||
          filesListStore.rootFolderType === FolderType.Archive;
        const initialFolderId =
          mode !== "restore" && isInRoomsContext && filesListStore.currentFolder
            ? filesListStore.currentFolder.id
            : "@my";

        const [tree, folderData, apps] = await Promise.all([
          getFoldersTree(),
          getFolder(initialFolderId, filter),
          mode !== "restore" && !isInRoomsContext ? getApps() : Promise.resolve(null),
        ]);

        const aiRoomsEnabled =
          isInRoomsContext ||
          (apps?.some((a) => a.id === "ai-rooms" && a.enabled) ?? false);
        setHasRooms(aiRoomsEnabled);

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
        toastr.error(toErrorText(error));
      }
    },
    [toErrorText],
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
      if (
        encryptedActions &&
        !item.isFolder &&
        (item as TFileItem).encrypted
      ) {
        try {
          await encryptedActions.duplicateFile(item as TFileItem);
        } catch (error) {
          toastr.error(toErrorText(error));
        }
        return;
      }

      // Folders cannot be duplicated inside a private room — the server would
      // create an unencrypted copy of the folder tree. Reference:
      // packages/client/src/store/FilesActionsStore.js:1616-1618
      if (item.isFolder && encryptedActions) {
        return;
      }

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
        toastr.error(toErrorText(error));
      }
    },
    [router, trackOperation, encryptedActions, toErrorText],
  );

  const closeSelectorDialog = useCallback(() => {
    setSelectorDialogVisible(false);
    setPendingItems([]);
    setFoldersTree(null);
    setSelectorInitData(null);
    setHasRooms(false);
  }, []);

  const executeOperation = useCallback(
    async (
      destFolderId: number,
      isMove: boolean,
      resolveType: ConflictResolveType,
      itemsToProcess: (TFileItem | TFolderItem)[],
      destFolderTitle: string,
    ) => {
      const fileIds = itemsToProcess
        .filter((i) => !i.isFolder)
        .map((i) => i.id as number);
      const folderIds = itemsToProcess
        .filter((i) => i.isFolder)
        .map((i) => i.id as number);

      const operations = isMove
        ? await moveToFolder(
            destFolderId,
            folderIds,
            fileIds,
            resolveType,
            false,
          )
        : await copyToFolder(
            destFolderId,
            folderIds,
            fileIds,
            resolveType,
            false,
          );

      const opId = operations?.[0]?.id;
      const icon: OperationProgress["icon"] = isMove ? "move" : "copy";

      const showSuccessToast = () => {
        const toastArgs = {
          items: itemsToProcess,
          destFolderId,
          destFolderTitle,
        };
        if (isMove) {
          showMoveToast(toastArgs);
        } else {
          showCopyToast(toastArgs);
        }
      };

      if (opId) {
        await trackOperation(opId, icon, () => {
          if (isMove) {
            for (const item of itemsToProcess) {
              filesListStore.removeItem(item.id);
            }
            filesSelectionStore.setSelection();
          }
          showSuccessToast();
        });
      } else {
        if (isMove) {
          for (const item of itemsToProcess) {
            filesListStore.removeItem(item.id);
          }
          filesSelectionStore.setSelection();
        }
        showSuccessToast();
      }
    },
    [
      filesListStore,
      filesSelectionStore,
      showCopyToast,
      showMoveToast,
      trackOperation,
    ],
  );

  const confirmOperation = useCallback(
    async (destFolderId: number | string, destFolderTitle: string) => {
      if (!pendingItems.length) return;

      const isMove = selectorMode === "move" || selectorMode === "restore";

      // Close selector panel immediately
      setSelectorDialogVisible(false);
      setFoldersTree(null);
      setSelectorInitData(null);

      let serverItems: (TFileItem | TFolderItem)[] = pendingItems;
      if (encryptedActions) {
        const destination = await resolveDestination(destFolderId);
        // Spec: private-rooms/sdk-surface, "Moves stay inside the private room"
        const plan = planPrivateTransfer({
          items: pendingItems,
          sourceInPrivateRoom: true,
          sourceRoomId: encryptedActions.roomId,
          move: isMove,
          dest: destination
            ? {
                insidePrivateRoom: destination.isPrivate,
                roomId: destination.encryptionRoomId,
              }
            : null,
        });

        if (plan.kind === "refuse-into") {
          toastr.error(t("Common:CannotTransferToPrivateRoom"));
          serverItems = [];
        } else if (plan.kind === "refuse-folder-out") {
          toastr.error(t("Common:CannotTransferFolderFromPrivateRoom"));
          serverItems = [];
        } else if (plan.kind === "refuse-move-into") {
          toastr.error(t("Common:CannotMoveToAnotherPrivateRoom"));
          serverItems = [];
        } else {
          const transfer = getSelectorTransfer({
            plan,
            selection: pendingItems,
            selectedItemId: destFolderId,
            isCopy: !isMove,
            isMove,
          });
          if (transfer.kind === "encrypted") {
            if (transfer.movesIntoItself) {
              toastr.error(t("Common:MoveToFolderMessage"));
            }
            if (transfer.refusedFolders) {
              toastr.error(t("Common:CannotTransferFolderFromPrivateRoom"));
            }
            serverItems = pendingItems.filter((i) =>
              i.isFolder
                ? transfer.folderIds.includes(i.id as number)
                : transfer.fileIds.includes(i.id as number),
            );
            try {
              await encryptedActions.copyFiles(
                transfer.encryptedFiles as unknown as TFileItem[],
                destFolderId,
                uploadDecryptedFiles,
              );
            } catch (error) {
              toastr.error(toErrorText(error));
            }
          }
        }
      }

      if (!serverItems.length) {
        setPendingItems([]);
        return;
      }

      const fileIds = serverItems
        .filter((i) => !i.isFolder)
        .map((i) => i.id as number);
      const folderIds = serverItems
        .filter((i) => i.isFolder)
        .map((i) => i.id as number);

      try {
        const conflicts = await checkFileConflicts(
          destFolderId as number,
          folderIds,
          fileIds,
        );

        if (conflicts.length > 0) {
          pendingConflictDestRef.current = {
            destFolderId: destFolderId as number,
            destFolderTitle,
            isMove,
          };
          setConflictItems(
            conflicts.map((c) => ({
              title: c.title,
              isFile: !("isFolder" in c && c.isFolder),
            })),
          );
          setPendingItems(serverItems);
          setConflictDialogVisible(true);
          return;
        }

        await executeOperation(
          destFolderId as number,
          isMove,
          ConflictResolveType.Overwrite,
          serverItems,
          destFolderTitle,
        );
      } catch (error) {
        toastr.error(toErrorText(error));
      }

      setPendingItems([]);
    },
    [
      selectorMode,
      pendingItems,
      executeOperation,
      encryptedActions,
      uploadDecryptedFiles,
      t,
      toErrorText,
    ],
  );

  const confirmConflict = useCallback(
    async (resolveType: ConflictResolveType) => {
      const dest = pendingConflictDestRef.current;
      if (!dest || !pendingItems.length) return;

      setConflictDialogVisible(false);
      pendingConflictDestRef.current = null;

      try {
        await executeOperation(
          dest.destFolderId,
          dest.isMove,
          resolveType,
          pendingItems,
          dest.destFolderTitle,
        );
      } catch (error) {
        toastr.error(toErrorText(error));
      } finally {
        setPendingItems([]);
        setConflictItems([]);
      }
    },
    [pendingItems, executeOperation, toErrorText],
  );

  const closeConflictDialog = useCallback(() => {
    setConflictDialogVisible(false);
    setConflictItems([]);
    pendingConflictDestRef.current = null;
    setPendingItems([]);
  }, []);

  // Compute disabled items (can't move folder into itself)
  const disabledItems = pendingItems
    .filter((i) => i.isFolder)
    .map((i) => i.id as number);

  // Spec: private-rooms/sdk-surface, "Moves stay inside the private room"
  const selectorPinnedRootId =
    encryptedActions && selectorMode === "move"
      ? encryptedActions.roomId
      : undefined;

  const showEncryptedTransferBanner =
    !!encryptedActions &&
    getShowEncryptedTransferBanner({
      selection: pendingItems as unknown as Parameters<
        typeof getShowEncryptedTransferBanner
      >[0]["selection"],
      sourceInPrivateRoom: true,
      isCopy: selectorMode === "copy",
    });

  /** The client's destination rules when the picker opens in a private room. */
  const getSelectorIsDisabled = useCallback(
    (
      isFirstLoad: boolean,
      isSelectedParentFolder: boolean,
      selectedItemId: string | number | undefined,
      selectedItemType: "rooms" | "files" | "agents" | undefined,
      isRoot: boolean,
      selectedItemSecurity?: TFileSecurity | TFolderSecurity | TRoomSecurity,
      selectedFileInfo?: unknown,
      isDisabledFolder?: boolean,
      isInsideKnowledge?: boolean,
      isInsideResultStorage?: boolean,
      isInsidePrivateRoom?: boolean,
    ) =>
      encryptedActions
        ? getIsDisabled(
            isFirstLoad,
            isSelectedParentFolder,
            String(filesListStore.currentFolder?.id) === String(selectedItemId),
            selectedItemType === "rooms",
            isRoot,
            selectorMode === "copy",
            selectorMode === "move",
            false,
            false,
            selectedItemSecurity,
            undefined,
            !!selectedFileInfo,
            pendingItems.some((i) => i.isFolder),
            selectorMode === "restore",
            isDisabledFolder,
            isInsideKnowledge,
            isInsideResultStorage,
            selectedItemType === "agents",
            isInsidePrivateRoom,
            true,
          )
        : isFirstLoad || isRoot,
    [encryptedActions, filesListStore, selectorMode, pendingItems],
  );

  return {
    selectorDialogVisible,
    selectorMode,
    hasRooms,
    pendingItemCount: pendingItems.length,
    selectorPinnedRootId,
    showEncryptedTransferBanner,
    getSelectorIsDisabled,
    foldersTree,
    selectorInitData,
    disabledItems,
    operationProgress,
    trackOperation,
    requestCopy,
    requestCopyItems,
    requestMove,
    requestMoveItems,
    requestRestore,
    requestRestoreItems,
    requestDuplicate,
    closeSelectorDialog,
    confirmOperation,
    conflictDialogVisible,
    conflictItems,
    closeConflictDialog,
    confirmConflict,
  };
}
