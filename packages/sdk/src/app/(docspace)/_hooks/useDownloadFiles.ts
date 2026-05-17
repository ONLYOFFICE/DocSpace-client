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
import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";
import type { TFileConvertId } from "@docspace/shared/dialogs/download-dialog/DownloadDialog.types";
import { downloadFiles as downloadFilesApi } from "@docspace/shared/api/files";
import { openUrl } from "@docspace/shared/utils/common";
import { UrlActionType } from "@docspace/shared/enums";
import { TData, toastr } from "@docspace/ui-kit/components/toast";
import { getDownloadPasswordError } from "@/app/(docspace)/_utils/getDownloadPasswordError";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import { useActiveItemsStore } from "@/app/(docspace)/_store/ActiveItemsStore";
import { useSDKConfig } from "@/providers/SDKConfigProvider";

export default function useDownloadFiles() {
  const { t } = useTranslation("Common");
  const { shareKey } = useSettingsStore();
  const { sdkConfig } = useSDKConfig();
  const { addActiveItems, removeActiveItems } = useActiveItemsStore();

  const loopFilesOperations = useCallback(
    async (data?: TOperation) => {
      if (!data) return;

      let operationItem: TOperation | undefined = data;
      let finished = data.finished;

      while (!finished) {
        const item = (await getOperationProgress(
          data.id,
          t("Common:UnexpectedError"),
        )) as TOperation;
        operationItem = item;

        finished = item ? item.finished : true;
      }

      return operationItem;
    },
    [t],
  );

  const downloadFiles = useCallback(
    async (fileIds: number[] | TFileConvertId[], folderIds: number[]) => {
      const activeFileIds = fileIds.map((f) =>
        typeof f !== "number" ? f.key : f,
      );

      try {
        addActiveItems(activeFileIds, folderIds);
        const operations = await downloadFilesApi(fileIds, folderIds, shareKey);
        const operation = operations?.[operations.length - 1];

        if (!operation) {
          return await Promise.reject();
        }

        if (operation.error) {
          throw new Error(operation.error);
        }

        const completedOperation =
          operation.finished && operation.url
            ? operation
            : await loopFilesOperations(operation);

        removeActiveItems(activeFileIds, folderIds);

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
        removeActiveItems(activeFileIds, folderIds);

        const passwordError = getDownloadPasswordError(
          error as Error | TOperation,
        );

        if (passwordError) {
          throw new Error(passwordError);
        }

        toastr.error(error as TData, undefined, 0, true);
      }
    },
    [
      addActiveItems,
      loopFilesOperations,
      removeActiveItems,
      sdkConfig,
      shareKey,
      t,
    ],
  );

  return { downloadFiles };
}
