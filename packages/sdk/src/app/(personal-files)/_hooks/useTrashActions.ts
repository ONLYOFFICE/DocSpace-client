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

import { removeFiles } from "@docspace/shared/api/files";
import { FolderType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";

export default function useTrashActions() {
  const filesListStore = useFilesListStore();
  const filesSelectionStore = useFilesSelectionStore();

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
    const immediately = isTrash;

    setIsDeleting(true);
    try {
      await removeFiles(folderIds, fileIds, false, immediately);
      for (const item of pendingDeleteItems) {
        filesListStore.removeItem(item.id);
      }
      filesSelectionStore.setSelection();
      setDeleteDialogVisible(false);
      setPendingDeleteItems([]);
    } catch (error) {
      toastr.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsDeleting(false);
    }
  }, [isTrash, filesListStore, filesSelectionStore, pendingDeleteItems]);

  return {
    isTrash,
    requestDeleteItem,
    requestDelete,
    deleteDialogVisible,
    deleteDialogItemCount: pendingDeleteItems.length,
    isDeleting,
    closeDeleteDialog,
    confirmDelete,
  };
}
