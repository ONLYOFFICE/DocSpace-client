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

const { listeners } = vi.hoisted(() => ({
  listeners: new Map<string, (data: unknown) => unknown>(),
}));

// The enum is spelled out: the installed ui-kit may predate the webhook events.
vi.mock("@onlyoffice/apps-ui-kit/utils/socket", () => ({
  default: {
    on: (event: string, cb: (data: unknown) => unknown) =>
      listeners.set(event, cb),
    off: vi.fn(),
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
  SocketEvents: {
    AddWebhook: "s:add-webhook",
    UpdateWebhook: "s:update-webhook",
    DeleteWebhook: "s:delete-webhook",
    AddWebhookLog: "s:add-webhook-log",
    UpdateWebhookLog: "s:update-webhook-log",
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("../../i18n", () => ({
  default: {
    t: (key: string) => key,
    loadNamespaces: () => Promise.resolve(),
  },
}));

vi.mock("@docspace/shared/api/settings", () => ({
  createWebhook: vi.fn(),
  getAllWebhooks: vi.fn(),
  getWebhookTriggers: vi.fn(),
  getWebhooksJournal: vi.fn(),
  removeWebhook: vi.fn(),
  toggleEnabledWebhook: vi.fn(),
  updateWebhook: vi.fn(),
}));

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import {
  getAllWebhooks,
  getWebhooksJournal,
} from "@docspace/shared/api/settings";

import WebhooksStore from "../WebhooksStore";

const emit = (event: string, data: unknown) => listeners.get(event)?.(data);

const config = (id: number, name = `hook-${id}`) => ({
  configs: { id, name, uri: `https://example.com/${id}`, enabled: true },
  status: 200,
});

const logItem = (id: number, status = 200) => ({ id, status });

const logItems = (...ids: number[]) => ids.map((id) => logItem(id));

const journal = (items: ReturnType<typeof logItem>[], total = items.length) => ({
  items,
  total,
});

const ids = (store: WebhooksStore) => store.historyItems.map((item) => item.id);

const navigate = vi.fn();

const createStore = () => new WebhooksStore(Object.create(null));

const params = { configId: 7, groupStatus: 4 };

const openHistory = async (
  store: WebhooksStore,
  items: ReturnType<typeof logItem>[],
  total = items.length,
  historyParams: { configId: number; groupStatus: number } = params,
) => {
  vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(items, total));
  store.setActiveConfigId(historyParams.configId);
  await store.fetchHistoryItems(historyParams);
};

const settle = () => vi.advanceTimersByTimeAsync(1000);

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(getAllWebhooks).mockReset();
  vi.mocked(getWebhooksJournal).mockReset();
  listeners.clear();
  Object.defineProperty(window, "DocSpace", {
    value: { navigate },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("WebhooksStore socket: subscriptions", () => {
  it("re-reads the list once for a burst of add and update events", async () => {
    const store = createStore();
    store.setIsWebhooksListActive(true);
    vi.mocked(getAllWebhooks).mockResolvedValue([config(1), config(2, "new")]);

    emit("s:add-webhook", { id: 2 });
    emit("s:update-webhook", { id: 1 });
    emit("s:update-webhook", { id: 1 });
    await vi.advanceTimersByTimeAsync(500);

    expect(getAllWebhooks).toHaveBeenCalledTimes(1);
    expect(store.webhooks.map((w) => [w.id, w.name, w.status])).toEqual([
      [1, "hook-1", 200],
      [2, "new", 200],
    ]);
    expect(store.errorWebhooks).toBeNull();
  });

  it("re-reads the list once when it is shown after changes behind a journal", async () => {
    const store = createStore();
    await openHistory(store, logItems(1));
    vi.mocked(getAllWebhooks).mockResolvedValue([config(7)]);

    emit("s:update-webhook", { id: 7 });
    emit("s:update-webhook", { id: 7 });
    await vi.advanceTimersByTimeAsync(2500);

    expect(getAllWebhooks).not.toHaveBeenCalled();

    store.setActiveConfigId(null);
    store.setIsWebhooksListActive(true);
    await vi.advanceTimersByTimeAsync(0);

    expect(getAllWebhooks).toHaveBeenCalledTimes(1);
    expect(store.webhooks.map((w) => w.id)).toEqual([7]);

    store.setIsWebhooksListActive(false);
    store.setIsWebhooksListActive(true);

    expect(getAllWebhooks).toHaveBeenCalledTimes(1);
  });

  it("does not re-read the list when it is shown with nothing changed", () => {
    const store = createStore();

    store.setIsWebhooksListActive(true);

    expect(getAllWebhooks).not.toHaveBeenCalled();
  });

  it("does not re-read the list outside the webhooks section", async () => {
    createStore();

    emit("s:add-webhook", { id: 2 });
    emit("s:update-webhook", { id: 1 });
    await vi.advanceTimersByTimeAsync(2500);

    expect(getAllWebhooks).not.toHaveBeenCalled();
  });

  it("re-reads the list under steady traffic instead of waiting for a pause", async () => {
    const store = createStore();
    store.setIsWebhooksListActive(true);
    vi.mocked(getAllWebhooks).mockResolvedValue([]);

    for (let i = 0; i < 6; i++) {
      emit("s:update-webhook", { id: 1 });
      await vi.advanceTimersByTimeAsync(400);
    }

    expect(getAllWebhooks).toHaveBeenCalledTimes(1);
  });

  it("keeps the list and shows no error when the re-read fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = createStore();
    store.setIsWebhooksListActive(true);
    store.webhooks = [{ id: 1, name: "a", uri: "u", enabled: true }];
    vi.mocked(getAllWebhooks).mockRejectedValue(new Error("network"));

    emit("s:update-webhook", { id: 1 });
    await vi.advanceTimersByTimeAsync(500);

    expect(store.webhooks).toHaveLength(1);
    expect(store.errorWebhooks).toBeNull();
    consoleError.mockRestore();
  });

  it("removes a deleted subscription without a request", () => {
    const store = createStore();
    store.webhooks = [
      { id: 1, name: "a", uri: "u", enabled: true },
      { id: 2, name: "b", uri: "u", enabled: true },
    ];

    emit("s:delete-webhook", { id: 1 });

    expect(store.webhooks.map((w) => w.id)).toEqual([2]);
    expect(getAllWebhooks).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(toastr.info).not.toHaveBeenCalled();
  });

  it("leaves the journal of a deleted subscription for the list with a notice", async () => {
    const store = createStore();
    store.setActiveConfigId("7");

    emit("s:delete-webhook", { id: 7 });
    await vi.advanceTimersByTimeAsync(0);

    expect(toastr.info).toHaveBeenCalledWith("Webhooks:WebhookWasDeleted");
    expect(navigate).toHaveBeenCalledWith("/developer-tools/webhooks");
  });
});

describe("WebhooksStore socket: delivery journal", () => {
  it("re-reads the top once for a burst of journal events", async () => {
    const store = createStore();
    await openHistory(store, logItems(5, 4), 120);
    store.toggleEventId(5);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(
      journal(logItems(8, 7, 6, 5, 4), 123),
    );

    emit("s:add-webhook-log", { id: 6, configId: 7 });
    emit("s:update-webhook-log", { id: 7, configId: 7 });
    emit("s:update-webhook-log", { id: 8, configId: 7 });
    emit("s:update-webhook-log", { id: 5, configId: 7 });
    await settle();

    expect(getWebhooksJournal).toHaveBeenCalledTimes(2);
    expect(getWebhooksJournal).toHaveBeenLastCalledWith({
      ...params,
      startIndex: 0,
      count: store.FETCH_COUNT,
    });
    expect(ids(store)).toEqual([8, 7, 6, 5, 4]);
    expect(store.totalItems).toBe(123);
    expect(store.startIndex).toBe(5);
    expect(store.checkedEventIds).toEqual([5]);
  });

  it("picks up records announced only by update-webhook-log", async () => {
    const store = createStore();
    await openHistory(store, logItems(5));
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(
      journal([logItem(6, 0), ...logItems(5)]),
    );

    emit("s:add-webhook-log", { id: 6, configId: 7 });
    await settle();
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(
      journal([logItem(9), logItem(8), logItem(7), logItem(6, 200), logItem(5)]),
    );

    emit("s:update-webhook-log", { id: 7, configId: 7 });
    emit("s:update-webhook-log", { id: 6, configId: 7 });
    await settle();

    expect(ids(store)).toEqual([9, 8, 7, 6, 5]);
    expect(store.historyItems[3]).toEqual(logItem(6, 200));
  });

  it("re-reads the top under steady traffic instead of waiting for a pause", async () => {
    const store = createStore();
    await openHistory(store, logItems(5));
    vi.mocked(getWebhooksJournal).mockResolvedValue(journal(logItems(5)));

    for (let i = 0; i < 5; i++) {
      emit("s:update-webhook-log", { id: 5, configId: 7 });
      await vi.advanceTimersByTimeAsync(250);
    }

    expect(getWebhooksJournal).toHaveBeenCalledTimes(2);
  });

  it("drops records of the top that no longer match the filter", async () => {
    const store = createStore();
    await openHistory(store, logItems(6, 5, 4), 50);
    store.toggleEventId(5);
    store.toggleEventId(6);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(6, 4), 49));

    emit("s:update-webhook-log", { id: 5, configId: 7 });
    await settle();

    expect(ids(store)).toEqual([6, 4]);
    expect(store.totalItems).toBe(49);
    expect(store.checkedEventIds).toEqual([6]);
  });

  it("keeps the pages loaded below the top", async () => {
    const store = createStore();
    store.FETCH_COUNT = 2;
    await openHistory(store, logItems(6, 5), 4);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(4, 3), 4));
    await store.fetchMoreItems(params);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(7, 6), 5));

    emit("s:add-webhook-log", { id: 7, configId: 7 });
    await settle();

    expect(ids(store)).toEqual([7, 6, 5, 4, 3]);
    expect(store.startIndex).toBe(5);
    expect(store.totalItems).toBe(5);
  });

  it("starts the journal over when the new top does not reach the loaded rows", async () => {
    const store = createStore();
    store.FETCH_COUNT = 2;
    await openHistory(store, logItems(4, 3), 4);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(2, 1), 4));
    await store.fetchMoreItems(params);
    store.toggleEventId(3);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(9, 8), 9));

    emit("s:add-webhook-log", { id: 5, configId: 7 });
    await settle();

    expect(ids(store)).toEqual([9, 8]);
    expect(store.startIndex).toBe(2);
    expect(store.totalItems).toBe(9);
    expect(store.hasMoreItems).toBe(true);
    expect(store.checkedEventIds).toEqual([]);
  });

  it("drops a lower row once the whole journal fits into the top", async () => {
    const store = createStore();
    store.FETCH_COUNT = 2;
    await openHistory(store, logItems(6, 5), 3);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(4), 3));
    await store.fetchMoreItems(params);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(6, 5), 2));

    emit("s:update-webhook-log", { id: 4, configId: 7 });
    await settle();

    expect(ids(store)).toEqual([6, 5]);
    expect(store.hasMoreItems).toBe(false);
  });

  it("drops a page that loads while the top is being re-read", async () => {
    const store = createStore();
    store.FETCH_COUNT = 2;
    await openHistory(store, logItems(6, 5), 4);

    let resolvePage: (value: unknown) => void = () => {};
    vi.mocked(getWebhooksJournal).mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePage = resolve;
      }),
    );
    const pending = store.fetchMoreItems(params);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(7, 6), 5));

    emit("s:add-webhook-log", { id: 7, configId: 7 });
    await settle();
    resolvePage(journal(logItems(4, 3), 4));
    await pending;

    expect(ids(store)).toEqual([7, 6, 5]);
    expect(store.startIndex).toBe(3);
  });

  it("re-reads by id a record loaded below the top", async () => {
    const store = createStore();
    store.FETCH_COUNT = 2;
    await openHistory(store, logItems(6, 5), 4);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(4, 3), 4));
    await store.fetchMoreItems(params);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(
      journal([logItem(9), logItem(3, 500)]),
    );

    await emit("s:update-webhook-log", { id: 3, configId: 7 });
    await settle();

    expect(getWebhooksJournal).toHaveBeenLastCalledWith({
      ...params,
      eventId: 3,
    });
    expect(store.historyItems[3]).toEqual(logItem(3, 500));
    expect(getWebhooksJournal).toHaveBeenCalledTimes(3);
  });

  it("ignores records of another subscription", async () => {
    const store = createStore();
    await openHistory(store, logItems(5));

    emit("s:add-webhook-log", { id: 9, configId: 8 });
    emit("s:update-webhook-log", { id: 5, configId: 8 });
    await settle();

    expect(getWebhooksJournal).toHaveBeenCalledTimes(1);
  });

  it("drops a pending re-read when the journal is closed", async () => {
    const store = createStore();
    await openHistory(store, logItems(5));

    emit("s:add-webhook-log", { id: 6, configId: 7 });
    store.clearHistoryParams();
    await settle();

    expect(getWebhooksJournal).toHaveBeenCalledTimes(1);
  });

  it("drops a response that arrives after the filter changed", async () => {
    const store = createStore();
    await openHistory(store, logItems(5));

    let resolveTop: (value: unknown) => void = () => {};
    vi.mocked(getWebhooksJournal).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveTop = resolve;
      }),
    );
    emit("s:add-webhook-log", { id: 6, configId: 7 });
    await settle();

    await openHistory(store, logItems(3), 1, { configId: 7, groupStatus: 8 });
    resolveTop(journal(logItems(6, 5)));
    await settle();

    expect(ids(store)).toEqual([3]);
  });

  it("does not duplicate rows when a page loads after new records arrived", async () => {
    const store = createStore();
    store.FETCH_COUNT = 2;
    await openHistory(store, logItems(6, 5), 4);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(5, 4), 5));

    await store.fetchMoreItems(params);

    expect(ids(store)).toEqual([6, 5, 4]);
  });

  it("re-reads the opened event details", async () => {
    vi.useRealTimers();
    const store = createStore();
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(5)));
    await store.fetchEventData(5);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(
      journal([logItem(5, 500)]),
    );

    emit("s:update-webhook-log", { id: 5, configId: 7 });
    await vi.waitFor(() => expect(store.eventDetails).toEqual(logItem(5, 500)));

    expect(getWebhooksJournal).toHaveBeenLastCalledWith({ eventId: 5 });
  });

  it("does not show a late re-read over the details opened next", async () => {
    const store = createStore();
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(5)));
    await store.fetchEventData(5);

    let resolveStale: (value: unknown) => void = () => {};
    vi.mocked(getWebhooksJournal).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveStale = resolve;
      }),
    );
    emit("s:update-webhook-log", { id: 5, configId: 7 });

    store.clearEventDetails();
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(6)));
    await store.fetchEventData(6);
    resolveStale(journal([logItem(5, 500)]));
    await vi.advanceTimersByTimeAsync(0);

    expect(store.eventDetails).toEqual(logItem(6));
  });

  it("does not fill the details after they were closed", async () => {
    const store = createStore();

    let resolveDetails: (value: unknown) => void = () => {};
    vi.mocked(getWebhooksJournal).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDetails = resolve;
      }),
    );
    const pending = store.fetchEventData(5);
    store.clearEventDetails();
    resolveDetails(journal(logItems(5)));
    await pending;

    expect(store.eventDetails).toEqual({});
  });

  it("logs a failed re-read of the event details", async () => {
    vi.useRealTimers();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = createStore();
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(logItems(5)));
    await store.fetchEventData(5);
    vi.mocked(getWebhooksJournal).mockRejectedValueOnce(new Error("network"));

    emit("s:update-webhook-log", { id: 5, configId: 7 });
    await vi.waitFor(() => expect(consoleError).toHaveBeenCalled());

    expect(store.eventDetails).toEqual(logItem(5));
    consoleError.mockRestore();
  });
});
