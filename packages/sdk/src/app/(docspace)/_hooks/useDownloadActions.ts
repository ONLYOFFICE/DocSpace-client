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
import { useTranslation } from "react-i18next";

import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";
import type { TOperation } from "@docspace/shared/api/files/types";
import { TData, toastr } from "@docspace/shared/components/toast";
import { downloadFiles } from "@docspace/shared/api/files";
import { openUrl } from "@docspace/shared/utils/common";
import { UrlActionType } from "@docspace/shared/enums";
import type {
  TDownloadedFile,
  TFileConvertId,
  TSortedFiles,
} from "@docspace/shared/dialogs/download-dialog/DownloadDialog.types";

import useSDK from "@/hooks/useSDK";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";

import type { TFileItem, TFolderItem } from "./useItemList";
import useFileType from "./useFileType";
import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import { useDownloadDialogStore } from "@/app/(docspace)/_store/DownloadDialogStore";
import { SDKDialogs } from "@/app/(docspace)/_enums/dialogs";
import { getDownloadPasswordError } from "@/app/(docspace)/_utils/getDownloadPasswordError";

export default function useDownloadActions() {
  const { sdkConfig } = useSDK();
  const { selection, bufferSelection } = useFilesSelectionStore();
  const { shareKey } = useSettingsStore();
  const { openDialog } = useDialogsStore();
  const { setSortedFiles } = useDownloadDialogStore();
  const { isDocument, isMasterForm, isPresentation, isSpreadsheet } =
    useFileType();
  const { t } = useTranslation("Common");

  const loopFilesOperations = useCallback(
    async (data?: TOperation) => {
      if (!data) return;

      let operationItem: TOperation | undefined = data;
      let finished = data.finished;

      while (!finished) {
        const item = await getOperationProgress(
          data.id,
          t("Common:UnexpectedError"),
        );
        operationItem = item;

        finished = item ? item.finished : true;
      }

      return operationItem;
    },
    [t],
  );

  const downloadItems = useCallback(
    async (fileIds: number[] | TFileConvertId[], folderIds: number[]) => {
      try {
        const operations = await downloadFiles(fileIds, folderIds, shareKey);
        const operation = operations?.[operations.length - 1];

        if (!operation) {
          return Promise.reject();
        }

        if (operation.error) {
          throw new Error(operation.error);
        }

        const completedOperation =
          operation.finished && operation.url
            ? operation
            : await loopFilesOperations(operation);

        if (completedOperation?.url) {
          openUrl({
            url: completedOperation.url,
            action: UrlActionType.Download,
            replace: true,
            isFrame: true,
            frameConfig: sdkConfig,
          });
        } else {
          toastr.error(t("Common:ArchivingData"), undefined, 0, true);
        }
      } catch (error) {
        const passwordError = getDownloadPasswordError(
          error as Error | TOperation,
        );

        if (passwordError) {
          throw new Error(passwordError);
        }

        toastr.error(error as TData, undefined, 0, true);
      }
    },
    [loopFilesOperations, sdkConfig, shareKey, t],
  );

  const downloadFromSelection = useCallback(() => {
    const fileIds: number[] = [];
    const folderIds: number[] = [];

    const data = selection.length
      ? selection
      : bufferSelection
        ? [bufferSelection]
        : null;

    if (!data) return;

    data.forEach((item) => {
      if (item.isFolder) {
        folderIds.push(item.id);
      } else {
        fileIds.push(item.id);
      }
    });

    downloadItems(fileIds, folderIds);
  }, [bufferSelection, selection, downloadItems]);

  const downloadAction = useCallback(
    (item?: TFileItem | TFolderItem) => {
      if (!item) {
        return downloadFromSelection();
      }

      if (item.isFolder) {
        return downloadItems([], [item.id]);
      }

      return openUrl({
        url: item.viewUrl,
        action: UrlActionType.Download,
        isFrame: true,
        frameConfig: sdkConfig,
      });
    },
    [downloadFromSelection, downloadItems, sdkConfig],
  );

  const getSortedFilesFromSelection = useCallback(() => {
    const newSortedFiles: TSortedFiles = {
      documents: [],
      spreadsheets: [],
      presentations: [],
      masterForms: [],
      other: [],
    };

    let data = selection.length
      ? selection
      : bufferSelection
        ? [bufferSelection]
        : [];

    data = JSON.parse(JSON.stringify(data));

    data.forEach((item: TDownloadedFile) => {
      item.checked = true;
      item.format = null;

      if (
        "fileExst" in item &&
        item.fileExst &&
        item.viewAccessibility?.CanConvert
      ) {
        if (isSpreadsheet(item.fileExst)) {
          newSortedFiles.spreadsheets.push(item);
        } else if (isPresentation(item.fileExst)) {
          newSortedFiles.presentations.push(item);
        } else if (isMasterForm(item.fileExst)) {
          newSortedFiles.masterForms.push(item);
        } else if (isDocument(item.fileExst)) {
          newSortedFiles.documents.push(item);
        } else {
          newSortedFiles.other.push(item);
        }
      } else {
        newSortedFiles.other.push(item);
      }
    });

    return newSortedFiles;
  }, [
    bufferSelection,
    isDocument,
    isMasterForm,
    isPresentation,
    isSpreadsheet,
    selection,
  ]);

  const downloadAsAction = useCallback(() => {
    setSortedFiles(getSortedFilesFromSelection());
    openDialog(SDKDialogs.DownloadDialog);
  }, [getSortedFilesFromSelection, openDialog, setSortedFiles]);

  return { downloadAction, downloadAsAction, downloadItems };
}
