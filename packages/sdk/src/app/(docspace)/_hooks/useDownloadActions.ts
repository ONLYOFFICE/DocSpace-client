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
import { openUrl } from "@docspace/shared/utils/common";
import { UrlActionType } from "@docspace/shared/enums";

import { useSDKConfig } from "@/providers/SDKConfigProvider";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";

import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import { useDownloadDialogStore } from "@/app/(docspace)/_store/DownloadDialogStore";
import { SDKDialogs } from "@/app/(docspace)/_enums/dialogs";

import type { TFileItem, TFolderItem } from "./useItemList";
import useFileType from "./useFileType";
import useDownloadFiles from "./useDownloadFiles";

export default function useDownloadActions() {
  const { sdkConfig } = useSDKConfig();
  const { selection, bufferSelection, getSortedFilesFromSelection } =
    useFilesSelectionStore();

  const { openDialog } = useDialogsStore();
  const { setSortedFiles } = useDownloadDialogStore();
  const { isDocument, isMasterForm, isPresentation, isSpreadsheet, isDiagram } =
    useFileType();
  const { downloadFiles } = useDownloadFiles();

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

    downloadFiles(fileIds, folderIds);
  }, [bufferSelection, selection, downloadFiles]);

  const downloadAction = useCallback(
    (item?: TFileItem | TFolderItem) => {
      if (!item) {
        return downloadFromSelection();
      }

      if (item.isFolder) {
        return downloadFiles([], [item.id]);
      }

      return openUrl({
        url: item.viewUrl,
        action: UrlActionType.Download,
        isFrame: true,
        frameConfig: sdkConfig,
      });
    },
    [downloadFromSelection, downloadFiles, sdkConfig],
  );

  const downloadAsAction = useCallback(() => {
    setSortedFiles(
      getSortedFilesFromSelection(
        isDocument,
        isSpreadsheet,
        isPresentation,
        isMasterForm,
        isDiagram,
      ),
    );
    openDialog(SDKDialogs.DownloadDialog);
  }, [
    getSortedFilesFromSelection,
    isDocument,
    isMasterForm,
    isPresentation,
    isSpreadsheet,
    isDiagram,
    openDialog,
    setSortedFiles,
  ]);

  return { downloadAction, downloadAsAction };
}
