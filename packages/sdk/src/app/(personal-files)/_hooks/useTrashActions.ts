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
