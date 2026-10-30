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
  toastr: { success: vi.fn(), error: vi.fn() },
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

const journal = (items: ReturnType<typeof logItem>[], total = items.length) => ({
  items,
  total,
});

const navigate = vi.fn();

const createStore = () => new WebhooksStore(Object.create(null));

const openHistory = async (
  store: WebhooksStore,
  params: { configId: number; groupStatus: number },
  items: ReturnType<typeof logItem>[],
  total = items.length,
) => {
  vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal(items, total));
  store.setActiveConfigId(params.configId);
  await store.fetchHistoryItems(params);
};

beforeEach(() => {
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
  it("does not re-read the list while the list page is closed", async () => {
    vi.useFakeTimers();
    createStore();

    emit("s:update-webhook", { id: 1 });
    await vi.advanceTimersByTimeAsync(1000);

    expect(getAllWebhooks).not.toHaveBeenCalled();
  });

  it("re-reads the list once for a burst of add and update events", async () => {
    vi.useFakeTimers();
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

  it("keeps the list and shows no error when the re-read fails", async () => {
    vi.useFakeTimers();
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
  });

  it("leaves the journal of a deleted subscription for the list", () => {
    const store = createStore();
    store.setActiveConfigId("7");

    emit("s:delete-webhook", { id: 7 });

    expect(navigate).toHaveBeenCalledWith("/developer-tools/webhooks");
  });
});

describe("WebhooksStore socket: delivery journal", () => {
  const params = { configId: 7, groupStatus: 4 };

  it("adds the records missing at the top and keeps the loaded ones", async () => {
    const store = createStore();
    await openHistory(store, params, [logItem(5), logItem(4)], 120);
    store.toggleEventId(5);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(
      journal([logItem(7), logItem(6), logItem(5), logItem(4)], 122),
    );

    await emit("s:add-webhook-log", { id: 6, configId: 7 });

    expect(getWebhooksJournal).toHaveBeenLastCalledWith({
      ...params,
      startIndex: 0,
      count: store.FETCH_COUNT,
    });
    expect(store.historyItems.map((item) => item.id)).toEqual([7, 6, 5, 4]);
    expect(store.totalItems).toBe(122);
    expect(store.startIndex).toBe(store.FETCH_COUNT + 2);
    expect(store.checkedEventIds).toEqual([5]);
  });

  it("ignores records of another subscription", async () => {
    const store = createStore();
    await openHistory(store, params, [logItem(5)]);

    await emit("s:add-webhook-log", { id: 9, configId: 8 });
    await emit("s:update-webhook-log", { id: 5, configId: 8 });

    expect(getWebhooksJournal).toHaveBeenCalledTimes(1);
  });

  it("ignores records while the journal is closed", async () => {
    const store = createStore();
    await openHistory(store, params, [logItem(5)]);
    store.clearHistoryParams();

    await emit("s:add-webhook-log", { id: 6, configId: 7 });

    expect(getWebhooksJournal).toHaveBeenCalledTimes(1);
  });

  it("replaces an updated record in place", async () => {
    const store = createStore();
    await openHistory(store, params, [logItem(6), logItem(5, 0), logItem(4)]);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(
      journal([logItem(8), logItem(5, 500)]),
    );

    await emit("s:update-webhook-log", { id: 5, configId: 7 });

    expect(getWebhooksJournal).toHaveBeenLastCalledWith({
      ...params,
      eventId: 5,
    });
    expect(store.historyItems).toEqual([
      logItem(6),
      logItem(5, 500),
      logItem(4),
    ]);
  });

  it("drops a record that no longer matches the filter", async () => {
    const store = createStore();
    await openHistory(store, params, [logItem(6), logItem(5)], 50);
    store.toggleEventId(5);
    store.toggleEventId(6);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal([]));

    await emit("s:update-webhook-log", { id: 5, configId: 7 });

    expect(store.historyItems.map((item) => item.id)).toEqual([6]);
    expect(store.totalItems).toBe(49);
    expect(store.startIndex).toBe(store.FETCH_COUNT - 1);
    expect(store.checkedEventIds).toEqual([6]);
  });

  it("does not request a record that is not loaded", async () => {
    const store = createStore();
    await openHistory(store, params, [logItem(6)]);

    await emit("s:update-webhook-log", { id: 5, configId: 7 });

    expect(getWebhooksJournal).toHaveBeenCalledTimes(1);
  });

  it("drops a response that arrives after the filter changed", async () => {
    const store = createStore();
    await openHistory(store, params, [logItem(5)]);

    let resolveHead: (value: unknown) => void = () => {};
    vi.mocked(getWebhooksJournal).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveHead = resolve;
      }),
    );
    const pending = emit("s:add-webhook-log", { id: 6, configId: 7 });

    await openHistory(store, { configId: 7, groupStatus: 8 }, [logItem(3)]);
    resolveHead(journal([logItem(6), logItem(5)]));
    await pending;

    expect(store.historyItems.map((item) => item.id)).toEqual([3]);
  });

  it("re-reads the opened event details", async () => {
    const store = createStore();
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(journal([logItem(5)]));
    await store.fetchEventData(5);
    vi.mocked(getWebhooksJournal).mockResolvedValueOnce(
      journal([logItem(5, 500)]),
    );

    await emit("s:update-webhook-log", { id: 5, configId: 7 });
    await vi.waitFor(() => expect(store.eventDetails).toEqual(logItem(5, 500)));

    expect(getWebhooksJournal).toHaveBeenLastCalledWith({ eventId: 5 });
  });
});
