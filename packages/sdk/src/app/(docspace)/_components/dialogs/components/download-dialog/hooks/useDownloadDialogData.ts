/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { useCallback } from "react";

import type { TOperation } from "@docspace/shared/api/files/types";
import { TData, toastr } from "@docspace/shared/components/toast";
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
