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

import { pollTask } from "./poll-task";

type TTask = { percentage: number; isCompleted: boolean; failed?: boolean };

const task = (percentage: number, isCompleted = false): TTask => ({
  percentage,
  isCompleted,
});

const startPolling = (
  fetchTask: () => Promise<TTask | null | undefined>,
  maxStalledPolls = 3,
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
    maxStalledPolls,
  });
  // Keeps an early rejection from being reported as unhandled while the
  // timers are advanced; the test awaits the same promise.
  result.catch(() => {});

  return { result, onProgress, assertSucceeded };
};

describe("pollTask", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves with the completed task after checking it succeeded", async () => {
    const fetchTask = vi
      .fn()
      .mockResolvedValueOnce(task(30))
      .mockResolvedValueOnce(task(100, true));

    const { result, onProgress, assertSucceeded } = startPolling(fetchTask);
    await vi.advanceTimersByTimeAsync(2000);

    await expect(result).resolves.toEqual(task(100, true));
    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(assertSucceeded).toHaveBeenCalledWith(task(100, true));
  });

  it("times out after maxStalledPolls polls without progress", async () => {
    const fetchTask = vi.fn().mockResolvedValue(task(10));

    const { result } = startPolling(fetchTask);
    // The first poll is progress (from nothing), then 3 polls stall.
    await vi.advanceTimersByTimeAsync(5000);

    await expect(result).rejects.toThrow("Test task timed out");
    expect(fetchTask).toHaveBeenCalledTimes(4);
  });

  it("keeps waiting past maxStalledPolls while the percentage grows", async () => {
    let percentage = 0;
    const fetchTask = vi.fn(async () => {
      percentage += 1;
      return task(percentage, percentage === 10);
    });

    const { result } = startPolling(fetchTask);
    await vi.advanceTimersByTimeAsync(10000);

    await expect(result).resolves.toEqual(task(10, true));
    expect(fetchTask).toHaveBeenCalledTimes(10);
  });

  it("counts the stall from the last progress, not from the start", async () => {
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
    await vi.advanceTimersByTimeAsync(7000);

    await expect(result).resolves.toEqual(task(100, true));
  });

  it("does not count a falling percentage as progress", async () => {
    const fetchTask = vi
      .fn()
      .mockResolvedValueOnce(task(50))
      .mockResolvedValue(task(40));

    const { result } = startPolling(fetchTask);
    await vi.advanceTimersByTimeAsync(5000);

    await expect(result).rejects.toThrow("Test task timed out");
  });

  it.each([null, undefined])(
    "rejects when the server no longer has the task (%s)",
    async (missing) => {
      const fetchTask = vi.fn().mockResolvedValue(missing);

      const { result, onProgress } = startPolling(fetchTask);
      await vi.advanceTimersByTimeAsync(1000);

      await expect(result).rejects.toThrow("Test task task not found");
      expect(onProgress).not.toHaveBeenCalled();
    },
  );

  it("rejects when the completed task failed", async () => {
    const fetchTask = vi
      .fn()
      .mockResolvedValue({ ...task(100, true), failed: true });

    const { result } = startPolling(fetchTask);
    await vi.advanceTimersByTimeAsync(1000);

    await expect(result).rejects.toThrow("failed");
  });
});
