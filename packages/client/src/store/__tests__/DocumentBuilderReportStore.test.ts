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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { autorun } from "mobx";

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock("../../i18n", () => ({
  default: { t: (key: string) => key },
}));

// The real pollUntil sleeps between attempts; the store's contract is only that
// it keeps calling `check` until it returns true or the signal aborts.
vi.mock("@docspace/ui-kit/billing/utils/stripe-flow", () => ({
  pollUntil: vi.fn(
    async (check: () => Promise<boolean>, signal: AbortSignal) => {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        if (signal.aborted) return;
        if (await check()) return;
      }
    },
  ),
}));

import { toastr } from "@docspace/ui-kit/components/toast";
import { pollUntil } from "@docspace/ui-kit/billing/utils/stripe-flow";
import type { TDocumentBuilderTask } from "@docspace/shared/api/files/types";

import DocumentBuilderReportStore, {
  ReportType,
} from "../DocumentBuilderReportStore";
import type FilesSettingsStore from "../FilesSettingsStore";

const RESULT_URL = "/products/files/doceditor?fileId=42";
const PROXY_URL = "https://portal.example.com";

const IOS_OPEN_DELAY_MS = 100;

const makeTask = (task: Partial<TDocumentBuilderTask> = {}) =>
  ({
    id: "1",
    error: "",
    percentage: 100,
    isCompleted: true,
    resultFileId: 42,
    resultFileName: "report.xlsx",
    resultFileUrl: RESULT_URL,
    ...task,
  }) as TDocumentBuilderTask;

const makeStore = (openOnNewPage = true) =>
  new DocumentBuilderReportStore({
    openOnNewPage,
  } as FilesSettingsStore);

/** Lets the "hack for ios" setTimeout inside finishReport fire. */
const flushOpen = () =>
  new Promise((resolve) => {
    setTimeout(resolve, IOS_OPEN_DELAY_MS + 50);
  });

let openSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();

  openSpy = vi.fn();
  window.open = openSpy as unknown as typeof window.open;
  window.ClientConfig = { proxy: { url: PROXY_URL } } as Window["ClientConfig"];
});

afterEach(() => {
  delete (window as { ClientConfig?: unknown }).ClientConfig;
});

describe("DocumentBuilderReportStore", () => {
  it("polls until the task completes, then announces and opens the file", async () => {
    const store = makeStore();

    const start = vi.fn().mockResolvedValue(makeTask({ isCompleted: false }));
    const getStatus = vi
      .fn()
      .mockResolvedValueOnce(makeTask({ isCompleted: false, percentage: 50 }))
      .mockResolvedValueOnce(makeTask());

    await store.buildReport(ReportType.AuditTrail, { start, getStatus });
    await flushOpen();

    expect(start).toHaveBeenCalledTimes(1);
    expect(getStatus).toHaveBeenCalledTimes(2);
    expect(toastr.success).toHaveBeenCalledWith("Common:ReportSaveLocation");
    expect(openSpy).toHaveBeenCalledWith(`${PROXY_URL}${RESULT_URL}`, "_blank");
    expect(store.isReportBuilding(ReportType.AuditTrail)).toBe(false);
  });

  it("skips polling when the task is already completed", async () => {
    const store = makeStore(false);

    const start = vi.fn().mockResolvedValue(makeTask());
    const getStatus = vi.fn();

    await store.buildReport(ReportType.LoginHistory, { start, getStatus });
    await flushOpen();

    expect(pollUntil).not.toHaveBeenCalled();
    expect(getStatus).not.toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith(`${PROXY_URL}${RESULT_URL}`, "_self");
  });

  it("exposes the building flag reactively while the report runs", async () => {
    const store = makeStore();

    const seen: boolean[] = [];
    const dispose = autorun(() => {
      seen.push(store.isReportBuilding(ReportType.RoomHistory));
    });

    const build = store.buildReport(ReportType.RoomHistory, {
      start: vi.fn().mockResolvedValue(makeTask()),
      getStatus: vi.fn(),
    });

    expect(store.isReportBuilding(ReportType.RoomHistory)).toBe(true);

    await build;
    await flushOpen();

    dispose();

    expect(seen).toEqual([false, true, false]);
  });

  it("ignores a second build of the same report but not of another one", async () => {
    const store = makeStore();

    let resolveFirst: (task: TDocumentBuilderTask) => void = () => {};
    const start = vi.fn().mockImplementation(
      () =>
        new Promise<TDocumentBuilderTask>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const requests = { start, getStatus: vi.fn() };

    const first = store.buildReport(ReportType.AuditTrail, requests);
    const second = store.buildReport(ReportType.AuditTrail, requests);

    const otherStart = vi.fn().mockResolvedValue(makeTask());
    await store.buildReport(ReportType.LoginHistory, {
      start: otherStart,
      getStatus: vi.fn(),
    });

    expect(start).toHaveBeenCalledTimes(1);
    expect(otherStart).toHaveBeenCalledTimes(1);

    resolveFirst(makeTask());
    await Promise.all([first, second]);
    await flushOpen();
  });

  it("announces but does not open a report whose page was left", async () => {
    const store = makeStore();

    let resolveTask: (task: TDocumentBuilderTask) => void = () => {};
    const build = store.buildReport(ReportType.AuditTrail, {
      start: vi.fn().mockImplementation(
        () =>
          new Promise<TDocumentBuilderTask>((resolve) => {
            resolveTask = resolve;
          }),
      ),
      getStatus: vi.fn(),
    });

    store.markReportPageLeft(ReportType.AuditTrail);
    resolveTask(makeTask());

    await build;
    await flushOpen();

    expect(toastr.success).toHaveBeenCalledWith("Common:ReportSaveLocation");
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("opens the file again when the user comes back before it is ready", async () => {
    const store = makeStore();

    let resolveTask: (task: TDocumentBuilderTask) => void = () => {};
    const build = store.buildReport(ReportType.AuditTrail, {
      start: vi.fn().mockImplementation(
        () =>
          new Promise<TDocumentBuilderTask>((resolve) => {
            resolveTask = resolve;
          }),
      ),
      getStatus: vi.fn(),
    });

    store.markReportPageLeft(ReportType.AuditTrail);
    store.resetReportPageLeft(ReportType.AuditTrail);
    resolveTask(makeTask());

    await build;
    await flushOpen();

    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it("does not mark a report as left when it is not building", async () => {
    const store = makeStore();

    store.markReportPageLeft(ReportType.AuditTrail);

    await store.buildReport(ReportType.AuditTrail, {
      start: vi.fn().mockResolvedValue(makeTask()),
      getStatus: vi.fn(),
    });
    await flushOpen();

    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it("reports the server-side error and opens nothing", async () => {
    const store = makeStore();

    await store.buildReport(ReportType.LoginHistory, {
      start: vi.fn().mockResolvedValue(makeTask({ isCompleted: false })),
      getStatus: vi
        .fn()
        .mockResolvedValue(makeTask({ isCompleted: false, error: "Boom" })),
    });
    await flushOpen();

    expect(toastr.error).toHaveBeenCalledWith("Boom");
    expect(toastr.success).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(store.isReportBuilding(ReportType.LoginHistory)).toBe(false);
  });

  it("reports a completed task that carries no result file as a failure", async () => {
    const store = makeStore();

    await store.buildReport(ReportType.AuditTrail, {
      start: vi.fn().mockResolvedValue(makeTask({ resultFileUrl: "" })),
      getStatus: vi.fn(),
    });
    await flushOpen();

    expect(toastr.error).toHaveBeenCalledWith("Common:SomethingWentWrong");
    expect(toastr.success).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("points at the save location when it gives up on a still-running task", async () => {
    const store = makeStore();

    await store.buildReport(ReportType.AuditTrail, {
      start: vi.fn().mockResolvedValue(makeTask({ isCompleted: false })),
      getStatus: vi.fn().mockResolvedValue(makeTask({ isCompleted: false })),
    });
    await flushOpen();

    expect(toastr.info).toHaveBeenCalledWith("Common:ReportSaveLocation");
    expect(toastr.success).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("clears the building flag when a request throws", async () => {
    const store = makeStore();

    const error = new Error("Network down");

    await store.buildReport(ReportType.RoomHistory, {
      start: vi.fn().mockRejectedValue(error),
      getStatus: vi.fn(),
    });

    expect(toastr.error).toHaveBeenCalledWith(error);
    expect(store.isReportBuilding(ReportType.RoomHistory)).toBe(false);
  });

  it("lets a report be rebuilt after it failed while its page was left", async () => {
    const store = makeStore();

    let resolveFirst: (task: TDocumentBuilderTask) => void = () => {};
    const first = store.buildReport(ReportType.AuditTrail, {
      start: vi.fn().mockImplementation(
        () =>
          new Promise<TDocumentBuilderTask>((resolve) => {
            resolveFirst = resolve;
          }),
      ),
      getStatus: vi.fn(),
    });

    store.markReportPageLeft(ReportType.AuditTrail);
    resolveFirst(makeTask({ isCompleted: true, error: "Boom" }));
    await first;

    await store.buildReport(ReportType.AuditTrail, {
      start: vi.fn().mockResolvedValue(makeTask()),
      getStatus: vi.fn(),
    });
    await flushOpen();

    expect(openSpy).toHaveBeenCalledTimes(1);
  });
});
