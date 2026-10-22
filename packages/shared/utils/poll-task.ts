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


import { pipe, delay, stopWhen } from "@onlyoffice/apps-ui-kit/utils/pipe";

type TPolledTask = {
  percentage: number;
  isCompleted: boolean;
};

type TPollTaskOptions<T extends TPolledTask> = {
  /** Names the task in the errors, e.g. "XLSX update". */
  name: string;
  /** Resolves to null or undefined once the server no longer has the task. */
  fetchTask: () => Promise<T | null | undefined>;
  onProgress: (task: T) => void;
  /** Throws if the completed task ended in a failed or cancelled state. */
  assertSucceeded: (task: T) => void;
  /** Polls in a row without progress before giving up. */
  maxStalledPolls?: number;
};

/**
 * Polls a distributed task once a second until it completes.
 *
 * Gives up only after maxStalledPolls polls in which the percentage did not
 * grow, not after a fixed number of polls: a long run (e.g. the recovery of
 * form responses before a report) is alive while its percentage grows, and a
 * stuck one is still caught. A task the server no longer has is an error, as
 * in getOperationProgress.
 */
export const pollTask = <T extends TPolledTask>({
  name,
  fetchTask,
  onProgress,
  assertSucceeded,
  maxStalledPolls = 120,
}: TPollTaskOptions<T>): Promise<T> => {
  let stalledPolls = 0;
  let lastPercentage = -1;

  const step: () => Promise<T> = pipe<T>(
    delay(1000),
    async () => {
      if (++stalledPolls > maxStalledPolls) {
        throw new Error(`${name} timed out`);
      }

      const task = await fetchTask();
      if (!task) throw new Error(`${name} task not found`);

      return task;
    },
    (task) => {
      if (task.percentage > lastPercentage) {
        lastPercentage = task.percentage;
        stalledPolls = 0;
      }

      onProgress(task);
      return task;
    },
    stopWhen(
      (task) => task.isCompleted,
      (task) => {
        assertSucceeded(task);
        return task;
      },
      () => step(),
    ),
  );

  return step();
};
