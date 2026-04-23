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

import { pipe, delay, stopWhen } from "@docspace/ui-kit/utils/pipe";

import {
  getProgressXlsx,
  updateXlsxFile,
  updateXlsxFolder,
} from "../api/files";
import { DistributedTaskStatus } from "../enums";
import type { UpdateXlsxResponse } from "../api/files/types";

type XlsxTask = UpdateXlsxResponse["task"];

export class XlsxUpdateService {
  /**
   * Starts an XLSX update for a file or folder.
   */
  static start(itemId: number, itemIsFolder: boolean) {
    const api = itemIsFolder ? updateXlsxFolder : updateXlsxFile;
    return api(itemId);
  }

  /**
   * Throws if the task ended in a failed or cancelled state.
   */
  static assertTaskSucceeded(task: XlsxTask): void {
    if (
      task.status === DistributedTaskStatus.Failed ||
      task.status === DistributedTaskStatus.Canceled
    ) {
      throw new Error(task.error);
    }
  }

  /**
   * Polls task progress until completion, calling onProgress on each tick.
   */
  static poll(
    itemId: number,
    taskId: string,
    onProgress: (task: XlsxTask) => void,
    maxAttempts = 120,
  ): Promise<XlsxTask> {
    let attempts = 0;

    const step: () => Promise<XlsxTask> = pipe(
      delay(1000),
      () => {
        if (++attempts > maxAttempts) throw new Error("XLSX update timed out");
        return getProgressXlsx(itemId) as Promise<XlsxTask>;
      },
      (task) => {
        onProgress(task);
        return task;
      },
      stopWhen(
        (task) => task.isCompleted,
        (task) => {
          XlsxUpdateService.assertTaskSucceeded(task);
          return task;
        },
        () => step(),
      ),
    );

    return step();
  }
}
