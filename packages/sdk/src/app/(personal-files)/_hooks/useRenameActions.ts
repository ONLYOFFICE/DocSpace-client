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
