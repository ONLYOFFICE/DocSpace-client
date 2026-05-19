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

import { useCallback } from "react";

import type { TOperation } from "@docspace/shared/api/files/types";
import { TData, toastr } from "@docspace/ui-kit/components/toast";
import type {
  TFileConvertId,
  TTranslationsForDownload,
} from "@docspace/shared/dialogs/download-dialog/DownloadDialog.types";

import { useFilesSettingsStore } from "@/app/(docspace)/_store/FilesSettingsStore";
import { useDownloadDialogStore } from "@/app/(docspace)/_store/DownloadDialogStore";
import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import { SDKDialogs } from "@/app/(docspace)/_enums/dialogs";
import { getDownloadPasswordError } from "@/app/(docspace)/_utils/getDownloadPasswordError";
import useItemIcon, {
  type TItemIconSizes,
} from "@/app/(docspace)/_hooks/useItemIcon";
import useDownloadFiles from "@/app/(docspace)/_hooks/useDownloadFiles";

export const useDownloadDialogData = () => {
  const { filesSettings } = useFilesSettingsStore();
  const {
    sortedFiles,
    sortedDownloadFiles,
    setSortedDownloadFiles,
    downloadItems,
    setDownloadItems,
    sortedPasswordFiles,
    getDownloadItems,
    resetDownloadedFileFormat,
    updateDownloadedFilePassword,
    discardDownloadedFile,
    handlePasswordError,
  } = useDownloadDialogStore();
  const { downloadFiles } = useDownloadFiles();
  const { openDialog } = useDialogsStore();
  const { getIcon: getIconFromHook } = useItemIcon({
    filesSettings: filesSettings || undefined,
  });

  const onDownload = useCallback(
    async (
      fileConvertIds: TFileConvertId[],
      folderIds: number[],
      translations: TTranslationsForDownload,
    ) => {
      try {
        await downloadFiles(fileConvertIds, folderIds);
      } catch (error) {
        const passwordError = getDownloadPasswordError(
          error as Error | TOperation,
        );

        if (passwordError) {
          handlePasswordError(fileConvertIds, passwordError, translations);
          openDialog(SDKDialogs.DownloadDialog);
          return;
        }

        return toastr.error(error as TData, undefined, 0, true);
      }
    },
    [downloadFiles, handlePasswordError, openDialog],
  );

  const getIcon = useCallback(
    (size: number, extension?: string) =>
      getIconFromHook(extension, size as TItemIconSizes),
    [getIconFromHook],
  );

  const getFolderIcon = useCallback(
    (size: number) => getIconFromHook(undefined, size as TItemIconSizes),
    [getIconFromHook],
  );

  return {
    sortedFiles,
    sortedPasswordFiles,
    sortedDownloadFiles,
    downloadItems,
    extsConvertible: filesSettings?.extsConvertible ?? {},
    setDownloadItems,
    getDownloadItems,
    setSortedDownloadFiles,
    resetDownloadedFileFormat,
    updateDownloadedFilePassword,
    discardDownloadedFile,
    onDownload,
    getIcon,
    getFolderIcon,
  };
};
