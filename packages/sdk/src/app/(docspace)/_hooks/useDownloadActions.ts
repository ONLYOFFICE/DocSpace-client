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
import { useTranslation } from "react-i18next";
import { openUrl } from "@docspace/shared/utils/common";
import { UrlActionType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useSDKConfig } from "@/providers/SDKConfigProvider";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";

import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import { useDownloadDialogStore } from "@/app/(docspace)/_store/DownloadDialogStore";
import { SDKDialogs } from "@/app/(docspace)/_enums/dialogs";

import type { TFileItem, TFolderItem } from "./useItemList";
import useFileType from "./useFileType";
import useDownloadFiles from "./useDownloadFiles";
import { useEncryptedFileActions } from "../_contexts/EncryptedFileActionsContext";

export default function useDownloadActions() {
  const { t } = useTranslation(["Common"]);
  const { sdkConfig } = useSDKConfig();
  const { selection, bufferSelection, getSortedFilesFromSelection } =
    useFilesSelectionStore();

  const { openDialog } = useDialogsStore();
  const { setSortedFiles } = useDownloadDialogStore();
  const { isDocument, isMasterForm, isPresentation, isSpreadsheet, isDiagram } =
    useFileType();
  const { downloadFiles } = useDownloadFiles();
  const encryptedActions = useEncryptedFileActions();

  const downloadFromSelection = useCallback(() => {
    const fileIds: number[] = [];
    const folderIds: number[] = [];

    const data = selection.length
      ? selection
      : bufferSelection
        ? [bufferSelection]
        : null;

    if (!data) return;

    if (encryptedActions) {
      const encryptedFiles = (data.filter(
        (item) => !item.isFolder && (item as TFileItem).encrypted,
      ) as TFileItem[]);
      if (encryptedFiles.length === data.length) {
        encryptedActions.downloadZip(encryptedFiles).catch((error) => {
          const msg = error instanceof Error ? error.message : String(error);
          toastr.error(msg);
        });
        return;
      }
      if (encryptedFiles.length > 0) {
        toastr.error(t("Common:PrivateRoomMixedDownloadNotSupported"));
        return;
      }
    }

    data.forEach((item) => {
      if (item.isFolder) {
        folderIds.push(item.id);
      } else {
        fileIds.push(item.id);
      }
    });

    downloadFiles(fileIds, folderIds);
  }, [bufferSelection, selection, downloadFiles, encryptedActions, t]);

  const downloadAction = useCallback(
    (item?: TFileItem | TFolderItem) => {
      if (!item) {
        return downloadFromSelection();
      }

      if (item.isFolder) {
        if (encryptedActions) {
          toastr.error(t("Common:PrivateRoomFolderDownloadNotSupported"));
          return;
        }
        return downloadFiles([], [item.id]);
      }

      if (encryptedActions && (item as TFileItem).encrypted) {
        return encryptedActions
          .downloadFile(item as TFileItem)
          .catch((error) => {
            const msg = error instanceof Error ? error.message : String(error);
            toastr.error(msg);
          });
      }

      return openUrl({
        url: item.viewUrl,
        action: UrlActionType.Download,
        isFrame: true,
        frameConfig: sdkConfig,
      });
    },
    [downloadFromSelection, downloadFiles, sdkConfig, encryptedActions, t],
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

  // Downloads the raw encrypted ciphertext — no crypto pipeline.
  // For files: triggers a direct browser download of item.viewUrl.
  // For folders/rooms: creates a server-side ZIP archive of the raw blobs,
  // identical to client ContextOptionsStore.onClickDownloadEncrypted.
  const downloadEncryptedAction = useCallback(
    (item: TFileItem | TFolderItem) => {
      if (item.isFolder) {
        return downloadFiles([], [item.id]).catch((error) => {
          const msg = error instanceof Error ? error.message : String(error);
          toastr.error(msg);
        });
      }

      openUrl({
        url: (item as TFileItem).viewUrl,
        action: UrlActionType.Download,
        isFrame: true,
        frameConfig: sdkConfig,
      });
    },
    [downloadFiles, sdkConfig],
  );

  return { downloadAction, downloadAsAction, downloadEncryptedAction };
}
