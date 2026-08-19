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

import { renameFolder, updateFile } from "@docspace/shared/api/files";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import type { TFileItem, TFolderItem } from "@/app/(docspace)/_hooks/useItemList";
import getTitleWithoutExt from "@/app/(docspace)/_utils/get-title-without-ext";

export default function useRenameActions() {
  const router = useRouter();
  const filesListStore = useFilesListStore();

  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState<
    TFileItem | TFolderItem | null
  >(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const requestRename = useCallback((item: TFileItem | TFolderItem) => {
    setRenameTarget(item);
    setRenameDialogVisible(true);
  }, []);

  const closeRenameDialog = useCallback(() => {
    setRenameDialogVisible(false);
    setRenameTarget(null);
  }, []);

  const renameInitialName = renameTarget
    ? renameTarget.isFolder
      ? renameTarget.title
      : getTitleWithoutExt(
          renameTarget.title,
          (renameTarget as TFileItem).fileExst ?? "",
        )
    : "";

  const confirmRename = useCallback(
    async (newName: string) => {
      if (!renameTarget) return;

      const fileExst = renameTarget.isFolder
        ? ""
        : ((renameTarget as TFileItem).fileExst ?? "");
      const fullName = fileExst ? `${newName}${fileExst}` : newName;

      setIsRenaming(true);
      try {
        if (renameTarget.isFolder) {
          const updated = await renameFolder(
            renameTarget.id as number,
            fullName,
          );
          filesListStore.updateItemTitle(renameTarget.id, updated.title);
        } else {
          const updated = await updateFile(renameTarget.id, fullName);
          filesListStore.updateItemTitle(renameTarget.id, updated.title);
        }
        setRenameDialogVisible(false);
        setRenameTarget(null);
        router.refresh();
      } catch (error) {
        toastr.error(error instanceof Error ? error.message : String(error));
      } finally {
        setIsRenaming(false);
      }
    },
    [renameTarget, filesListStore, router],
  );

  return {
    renameDialogVisible,
    renameInitialName,
    isRenaming,
    requestRename,
    closeRenameDialog,
    confirmRename,
  };
}
