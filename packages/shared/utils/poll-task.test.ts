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


import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  pollTask,
  POLL_INTERVAL_MS,
  TaskPollingError,
  type TTaskLiveness,
} from "./poll-task";

type TTask = { percentage: number; isCompleted: boolean; failed?: boolean };

const task = (percentage: number, isCompleted = false): TTask => ({
  percentage,
  isCompleted,
});

const PROGRESS: TTaskLiveness = {
  kind: "progress",
  stallTimeoutMs: 3 * POLL_INTERVAL_MS,
};
const PRESENCE: TTaskLiveness = {
  kind: "presence",
  missingTimeoutMs: 3 * POLL_INTERVAL_MS,
};

const startPolling = (
  fetchTask: () => Promise<TTask | null | undefined>,
  liveness: TTaskLiveness = PROGRESS,
) => {
  const onProgress = vi.fn();
  const assertSucceeded = vi.fn((t: TTask) => {
    if (t.failed) throw new Error("failed");
  });

  const result = pollTask({
    name: "Test task",
    fetchTask,
    onProgress,
    assertSucceeded,
    liveness,
  });
  // Keeps an early rejection from being reported as unhandled while the
  // timers are advanced; the test awaits the same promise.
  result.catch(() => {});

  return { result, onProgress, assertSucceeded };
};

const polls = (count: number) =>
  vi.advanceTimersByTimeAsync(count * POLL_INTERVAL_MS);

describe("pollTask", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([PROGRESS, PRESENCE])(
    "resolves with the completed task after checking it succeeded (%o)",
    async (liveness) => {
      const fetchTask = vi
        .fn()
        .mockResolvedValueOnce(task(30))
        .mockResolvedValueOnce(task(100, true));

      const { result, onProgress, assertSucceeded } = startPolling(
        fetchTask,
        liveness,
      );
      await polls(2);

      await expect(result).resolves.toEqual(task(100, true));
      expect(onProgress).toHaveBeenCalledTimes(2);
      expect(assertSucceeded).toHaveBeenCalledWith(task(100, true));
    },
  );

  it.each([PROGRESS, PRESENCE])(
    "rejects when the completed task failed (%o)",
    async (liveness) => {
      const fetchTask = vi
        .fn()
        .mockResolvedValue({ ...task(100, true), failed: true });

      const { result } = startPolling(fetchTask, liveness);
      await polls(1);

      await expect(result).rejects.toThrow("failed");
    },
  );

  // Callers show their own message for these, and the server's for the rest.
  it("throws a TaskPollingError when the polling loses the task", async () => {
    const lost = startPolling(vi.fn().mockResolvedValue(null)).result;
    const stalled = startPolling(vi.fn().mockResolvedValue(task(10))).result;
    await polls(5);

    await expect(lost).rejects.toBeInstanceOf(TaskPollingError);
    await expect(stalled).rejects.toBeInstanceOf(TaskPollingError);
  });

  it("passes a failure of the task itself through as is", async () => {
    const fetchTask = vi
      .fn()
      .mockResolvedValue({ ...task(100, true), failed: true });

    const { result } = startPolling(fetchTask);
    await polls(1);

    await expect(result).rejects.not.toBeInstanceOf(TaskPollingError);
  });

  describe("failed requests", () => {
    it.each([PROGRESS, PRESENCE])(
      "rides out requests failing for up to the timeout (%o)",
      async (liveness) => {
        const fetchTask = vi
          .fn()
          .mockResolvedValueOnce(task(10))
          .mockRejectedValueOnce(new Error("502"))
          .mockRejectedValueOnce(new Error("502"))
          .mockResolvedValueOnce(task(20))
          .mockResolvedValueOnce(task(100, true));

        const { result, onProgress } = startPolling(fetchTask, liveness);
        await polls(5);

        await expect(result).resolves.toEqual(task(100, true));
        expect(onProgress).toHaveBeenCalledTimes(3);
      },
    );

    it.each([PROGRESS, PRESENCE])(
      "gives up with a TaskPollingError once they outlast the timeout (%o)",
      async (liveness) => {
        const cause = new Error("Network Error");
        const fetchTask = vi
          .fn()
          .mockResolvedValueOnce(task(10))
          .mockRejectedValue(cause);

        const { result } = startPolling(fetchTask, liveness);
        await polls(5);

        await expect(result).rejects.toThrow("Test task could not be polled");
        await expect(result).rejects.toBeInstanceOf(TaskPollingError);
        await expect(result).rejects.toHaveProperty("cause", cause);
        // Last seen on the first poll, silent for 4 seconds on the fifth.
        expect(fetchTask).toHaveBeenCalledTimes(5);
      },
    );

    it.each([500, 503, 408, 429])(
      "rides out an answer of %i as a failed request",
      async (status) => {
        const fetchTask = vi
          .fn()
          .mockRejectedValueOnce({ response: { status } })
          .mockResolvedValueOnce(task(100, true));

        const { result } = startPolling(fetchTask, PRESENCE);
        await polls(2);

        await expect(result).resolves.toEqual(task(100, true));
      },
    );

    // A DB sync checks the room on every poll: the right to edit it taken away
    // mid-run answers 403, the room deleted mid-run 404.
    it.each([
      [403, PROGRESS],
      [403, PRESENCE],
      [404, PROGRESS],
      [404, PRESENCE],
    ])(
      "passes an answer of %i through at once (%o)",
      async (status, liveness) => {
        const refused = { response: { status, data: {} } };
        const fetchTask = vi
          .fn()
          .mockResolvedValueOnce(task(10))
          .mockRejectedValue(refused);

        const { result } = startPolling(fetchTask, liveness);
        await polls(2);

        await expect(result).rejects.toBe(refused);
        expect(fetchTask).toHaveBeenCalledTimes(2);
      },
    );
  });

  describe("progress liveness", () => {
    it("times out once the percentage has not grown for stallTimeoutMs", async () => {
      const fetchTask = vi.fn().mockResolvedValue(task(10));

      const { result } = startPolling(fetchTask);
      await polls(5);

      await expect(result).rejects.toThrow("Test task timed out");
      // Grew on the first poll, then held past 3 seconds.
      expect(fetchTask).toHaveBeenCalledTimes(5);
    });

    it("keeps waiting past stallTimeoutMs while the percentage grows", async () => {
      let percentage = 0;
      const fetchTask = vi.fn(async () => {
        percentage += 1;
        return task(percentage, percentage === 10);
      });

      const { result } = startPolling(fetchTask);
      await polls(10);

      await expect(result).resolves.toEqual(task(10, true));
    });

    it("counts the stall from the last growth, not from the start", async () => {
      const fetchTask = vi
        .fn()
        .mockResolvedValueOnce(task(0))
        .mockResolvedValueOnce(task(0))
        .mockResolvedValueOnce(task(0))
        .mockResolvedValueOnce(task(25))
        .mockResolvedValueOnce(task(25))
        .mockResolvedValueOnce(task(25))
        .mockResolvedValueOnce(task(100, true));

      const { result } = startPolling(fetchTask);
      await polls(7);

      await expect(result).resolves.toEqual(task(100, true));
    });

    it("does not count a falling percentage as progress", async () => {
      const fetchTask = vi
        .fn()
        .mockResolvedValueOnce(task(50))
        .mockResolvedValue(task(40));

      const { result } = startPolling(fetchTask);
      await polls(5);

      await expect(result).rejects.toThrow("Test task timed out");
    });

    it.each([null, undefined])(
      "rejects at once when the server has no task (%s)",
      async (missing) => {
        const fetchTask = vi.fn().mockResolvedValue(missing);

        const { result, onProgress } = startPolling(fetchTask);
        await polls(1);

        await expect(result).rejects.toThrow("Test task task not found");
        expect(onProgress).not.toHaveBeenCalled();
      },
    );
  });

  describe("presence liveness", () => {
    it("keeps waiting while the task is there, whatever its percentage", async () => {
      // Far past any stall limit: a report queued behind other recoveries.
      const fetchTask = vi
        .fn()
        .mockImplementation(async () =>
          fetchTask.mock.calls.length < 600 ? task(0) : task(100, true),
        );

      const { result } = startPolling(fetchTask, PRESENCE);
      await polls(600);

      await expect(result).resolves.toEqual(task(100, true));
    });

    it("rides out a task missing for up to missingTimeoutMs in a row", async () => {
      const fetchTask = vi
        .fn()
        .mockResolvedValueOnce(task(10))
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(task(10))
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(task(100, true));

      const { result, onProgress } = startPolling(fetchTask, PRESENCE);
      await polls(7);

      await expect(result).resolves.toEqual(task(100, true));
      // Only the answers that had the task reach the progress.
      expect(onProgress).toHaveBeenCalledTimes(3);
    });

    it("rejects once the task has been missing for longer than missingTimeoutMs", async () => {
      const fetchTask = vi
        .fn()
        .mockResolvedValueOnce(task(10))
        .mockResolvedValue(null);

      const { result } = startPolling(fetchTask, PRESENCE);
      await polls(5);

      await expect(result).rejects.toThrow("Test task task not found");
      // Last seen on the first poll, missing for 4 seconds on the fifth.
      expect(fetchTask).toHaveBeenCalledTimes(5);
    });
  });
});
