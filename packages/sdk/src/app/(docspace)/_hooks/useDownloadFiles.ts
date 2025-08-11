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
import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";
import type { TFileConvertId } from "@docspace/shared/dialogs/download-dialog/DownloadDialog.types";
import { downloadFiles as downloadFilesApi } from "@docspace/shared/api/files";
import { openUrl } from "@docspace/shared/utils/common";
import { UrlActionType } from "@docspace/shared/enums";
import { TData, toastr } from "@docspace/shared/components/toast";
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
