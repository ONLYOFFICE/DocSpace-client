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
