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

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { removeFiles, emptyTrash } from "@docspace/shared/api/files";
import { FolderType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useEncryptedFileActions } from "@/app/(docspace)/_contexts/EncryptedFileActionsContext";
import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";
import type { TrackOperation } from "./useFileOperations";

export default function useTrashActions(trackOperation?: TrackOperation) {
  const filesListStore = useFilesListStore();
  const filesSelectionStore = useFilesSelectionStore();
  // Non-null when the hook is rendered inside a private room — the provider is
  // mounted only in (private)/private/[roomId]/page.client.tsx.
  const encryptedActions = useEncryptedFileActions();
  const router = useRouter();
  const { t } = useTranslation(["Common"]);
  const { openFolder } = useFolderActions({ t });

  const isTrash = filesListStore.rootFolderType === FolderType.TRASH;

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeleteItems, setPendingDeleteItems] = useState<
    (TFileItem | TFolderItem)[]
  >([]);

  const requestDelete = useCallback(
    (items: (TFileItem | TFolderItem)[]) => {
      setPendingDeleteItems(items);
      setDeleteDialogVisible(true);
    },
    [],
  );

  const requestDeleteItem = useCallback(
    (item: TFileItem | TFolderItem) => {
      requestDelete([item]);
    },
    [requestDelete],
  );

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogVisible(false);
    setPendingDeleteItems([]);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDeleteItems.length) return;

    const fileIds = pendingDeleteItems
      .filter((i) => !i.isFolder)
      .map((i) => i.id as number);
    const folderIds = pendingDeleteItems
      .filter((i) => i.isFolder)
      .map((i) => i.id as number);
    // Private-room files must never go to the recycle bin — bypass it the same
    // way the reference client does for privacy folders (FilesActionsStore.js).
    const immediately = isTrash || !!encryptedActions;
    const itemsToRemove = pendingDeleteItems;

    const currentFolder = filesListStore.currentFolder;
    const pathParts = filesListStore.pathParts;
    const isDeletingCurrentFolder =
      !!currentFolder &&
      itemsToRemove.some(
        (item) => item.isFolder && item.id === currentFolder.id,
      );
    const parentFolderId =
      isDeletingCurrentFolder && currentFolder
        ? currentFolder.parentId
        : undefined;
    const parentFolderTitle =
      isDeletingCurrentFolder && pathParts && pathParts.length >= 2
        ? pathParts[pathParts.length - 2].title
        : "";

    setIsDeleting(true);
    try {
      const operations = await removeFiles(
        folderIds,
        fileIds,
        false,
        immediately,
      );
      setDeleteDialogVisible(false);
      setPendingDeleteItems([]);

      const opId = operations?.[0]?.id;
      const icon = immediately ? "deletePermanently" : "trash";

      const onComplete = () => {
        for (const item of itemsToRemove) {
          filesListStore.removeItem(item.id);
        }
        filesSelectionStore.setSelection();

        if (isDeletingCurrentFolder && parentFolderId !== undefined) {
          openFolder(parentFolderId, parentFolderTitle);
          router.refresh();
        }
      };

      if (opId && trackOperation) {
        await trackOperation(opId, icon, onComplete);
      } else {
        onComplete();
      }
    } catch (error) {
      toastr.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsDeleting(false);
    }
  }, [
    isTrash,
    encryptedActions,
    filesListStore,
    filesSelectionStore,
    pendingDeleteItems,
    trackOperation,
    openFolder,
    router,
  ]);

  // Empty all — permanently clear the whole trash via the dedicated emptyTrash
  // API (not a per-item bulk delete), confirmed through the same DeleteDialog
  // shown in its "empty trash" variant.
  const [emptyTrashDialogVisible, setEmptyTrashDialogVisible] = useState(false);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);

  const requestEmptyTrash = useCallback(() => {
    setEmptyTrashDialogVisible(true);
  }, []);

  const closeEmptyTrashDialog = useCallback(() => {
    setEmptyTrashDialogVisible(false);
  }, []);

  const confirmEmptyTrash = useCallback(async () => {
    setIsEmptyingTrash(true);
    try {
      const operations = await emptyTrash();
      setEmptyTrashDialogVisible(false);

      const opId = operations?.[0]?.id;
      const onComplete = () => {
        filesListStore.setItems([]);
        filesSelectionStore.setSelection();
      };

      if (opId && trackOperation) {
        await trackOperation(opId, "deletePermanently", onComplete);
      } else {
        onComplete();
      }
    } catch (error) {
      toastr.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsEmptyingTrash(false);
    }
  }, [filesListStore, filesSelectionStore, trackOperation]);

  return {
    isTrash,
    requestDeleteItem,
    requestDelete,
    deleteDialogVisible,
    deleteDialogItemCount: pendingDeleteItems.length,
    isDeleting,
    closeDeleteDialog,
    confirmDelete,
    requestEmptyTrash,
    emptyTrashDialogVisible,
    isEmptyingTrash,
    closeEmptyTrashDialog,
    confirmEmptyTrash,
  };
}
