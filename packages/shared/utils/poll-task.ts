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

import { delay } from "@onlyoffice/apps-ui-kit/utils/pipe";

type TPolledTask = {
  percentage: number;
  isCompleted: boolean;
};

/**
 * How a task shows it is alive between polls -- part of the contract with the
 * server behind it, so each caller states the one its server keeps.
 *
 * - "progress": the percentage grows at least once per stallTimeoutMs. A
 *   missing task is a failure at once, as in getOperationProgress.
 * - "presence": the server keeps the task published for as long as it runs,
 *   whatever its percentage does, so a task that is there and not completed
 *   is alive. It fails once it has been missing for longer than
 *   missingTimeoutMs in a row: the server may drop it briefly between
 *   publications.
 */
export type TTaskLiveness =
  | { kind: "progress"; stallTimeoutMs: number }
  | { kind: "presence"; missingTimeoutMs: number };

type TPollTaskOptions<T extends TPolledTask> = {
  /** Names the task in the errors, e.g. "XLSX update". */
  name: string;
  /** Resolves to null or undefined while the server has no such task. */
  fetchTask: () => Promise<T | null | undefined>;
  onProgress: (task: T) => void;
  /** Throws if the completed task ended in a failed or cancelled state. */
  assertSucceeded: (task: T) => void;
  liveness: TTaskLiveness;
};

/**
 * The polling lost the task: it went missing, or stopped showing it is alive.
 * Unlike a failure the server reports for the task, its message is not meant
 * for the user, so callers show their own.
 */
export class TaskPollingError extends Error {
  name = "TaskPollingError";
}

export const POLL_INTERVAL_MS = 1000;

/**
 * Polls a distributed task once a second until it completes, and gives up only
 * when the task stops showing it is alive (see TTaskLiveness).
 *
 * There is deliberately no ceiling on the total time: a run may honestly take
 * hours (a recovery of a thousand responses before a report takes over half an
 * hour), and cutting it short is the failure this function exists to avoid;
 * the file operations in loopFilesOperationsImpl have no ceiling either.
 */
export const pollTask = <T extends TPolledTask>({
  name,
  fetchTask,
  onProgress,
  assertSucceeded,
  liveness,
}: TPollTaskOptions<T>): Promise<T> => {
  let lastPercentage = -1;
  let lastSignOfLife = Date.now();

  // Calls itself for the next poll; every await unwinds the call, so the
  // stack does not grow however long the task runs.
  const poll = async (): Promise<T> => {
    await delay(POLL_INTERVAL_MS)(undefined);

    const task = await fetchTask();
    const silentFor = Date.now() - lastSignOfLife;

    if (!task) {
      if (
        liveness.kind === "progress" ||
        silentFor > liveness.missingTimeoutMs
      ) {
        throw new TaskPollingError(`${name} task not found`);
      }
      return poll();
    }

    // Strictly greater: a percentage that holds or falls is no progress.
    const grew = task.percentage > lastPercentage;
    if (grew) lastPercentage = task.percentage;

    if (liveness.kind === "presence" || grew) {
      lastSignOfLife = Date.now();
    } else if (silentFor > liveness.stallTimeoutMs) {
      throw new TaskPollingError(`${name} timed out`);
    }

    onProgress(task);

    if (!task.isCompleted) return poll();

    assertSucceeded(task);
    return task;
  };

  return poll();
};
