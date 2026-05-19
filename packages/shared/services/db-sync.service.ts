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

import { externalDbSync } from "../api/rooms";
import { DistributedTaskStatus } from "../enums";
import type { ExternalSyncDB } from "../api/rooms/types";

export class DbSyncService {
  static assertTaskSucceeded(task: ExternalSyncDB): void {
    if (
      task.status === DistributedTaskStatus.Failed ||
      task.status === DistributedTaskStatus.Canceled
    ) {
      throw new Error(task.error ?? "DB sync failed");
    }
  }

  static poll(
    roomId: number,
    onProgress: (task: ExternalSyncDB) => void,
    maxAttempts = 120,
  ): Promise<ExternalSyncDB> {
    let attempts = 0;

    const step: () => Promise<ExternalSyncDB> = pipe(
      delay(1000),
      () => {
        if (++attempts > maxAttempts) throw new Error("DB sync timed out");
        return externalDbSync(roomId) as Promise<ExternalSyncDB>;
      },
      (task) => {
        onProgress(task);
        return task;
      },
      stopWhen(
        (task) => task.isCompleted,
        (task) => {
          DbSyncService.assertTaskSucceeded(task);
          return task;
        },
        () => step(),
      ),
    );

    return step();
  }
}
