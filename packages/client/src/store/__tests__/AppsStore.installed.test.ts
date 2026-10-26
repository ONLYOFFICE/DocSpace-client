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
import { observable, runInAction } from "mobx";

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";

const { getApps, temporarilyDisabled, frame } = vi.hoisted(() => ({
  getApps: vi.fn(),
  temporarilyDisabled: new Set<string>(),
  frame: { isSdkFrame: false },
}));

vi.mock("@docspace/shared/utils/common", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  isSdkFrameWindow: () => frame.isSdkFrame,
}));

vi.mock("@docspace/shared/api/apps", () => ({
  getApps,
  getAppSettings: vi.fn(),
  setAppEnabled: vi.fn(),
  setAppSettings: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    socketSubscribers: new Set(),
  },
}));

vi.mock("SRC_DIR/helpers/disabled-apps", () => ({
  isAppTemporarilyDisabled: (id: string) => temporarilyDisabled.has(id),
}));

const { default: AppsStore } = await import("../AppsStore");

const createStore = (standalone: boolean) =>
  new AppsStore({ standalone } as unknown as SettingsStore);

describe("AppsStore.isInstalled", () => {
  beforeEach(() => {
    temporarilyDisabled.clear();
  });

  it("is on in SaaS whatever the server says", async () => {
    getApps.mockResolvedValue([{ id: "ai-rooms", enabled: false }]);
    const store = createStore(false);

    await store.fetchApps();

    expect(store.canManageApps).toBe(false);
    expect(store.isInstalled("ai-rooms")).toBe(true);
  });

  it("follows the server flag on standalone once the list is loaded", async () => {
    getApps.mockResolvedValue([
      { id: "ai-rooms", enabled: false },
      { id: "ai-forms", enabled: true },
    ]);
    const store = createStore(true);

    await store.fetchApps();

    expect(store.isInstalled("ai-rooms")).toBe(false);
    expect(store.isInstalled("ai-forms")).toBe(true);
    // An app the server does not list is not on offer.
    expect(store.isInstalled("ai-agents")).toBe(false);
  });

  it("is optimistic on standalone until the list arrives", () => {
    const store = createStore(true);

    expect(store.isLoaded).toBe(false);
    expect(store.isInstalled("ai-rooms")).toBe(true);
  });

  it("stays optimistic and flags the failure when the list fails to load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getApps.mockRejectedValue(new Error("502"));
    const store = createStore(true);

    await store.fetchApps();

    expect(store.isLoaded).toBe(false);
    expect(store.isLoadFailed).toBe(true);
    expect(store.isInstalled("ai-rooms")).toBe(true);
  });

  it("clears the failure once a retry succeeds", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getApps.mockRejectedValueOnce(new Error("502"));
    getApps.mockResolvedValueOnce([{ id: "ai-rooms", enabled: false }]);
    const store = createStore(true);

    await store.fetchApps();
    store.ensureLoaded();
    await vi.waitFor(() => expect(store.isLoaded).toBe(true));

    expect(store.isLoadFailed).toBe(false);
    expect(store.isInstalled("ai-rooms")).toBe(false);
  });

  it("is off for an unreleased app in SaaS and on standalone alike", async () => {
    temporarilyDisabled.add("ai-arbiter");
    getApps.mockResolvedValue([{ id: "ai-arbiter", enabled: true }]);

    for (const standalone of [false, true]) {
      const store = createStore(standalone);
      await store.fetchApps();
      expect(store.isInstalled("ai-arbiter")).toBe(false);
    }
  });
});

describe("AppsStore.isPrivateRoomsSectionAvailable in an SDK frame", () => {
  const createFramedStore = () => {
    const settingsStore = observable({
      standalone: false,
      frameConfig: null as null | Record<string, unknown>,
    });
    const store = new AppsStore(settingsStore as unknown as SettingsStore);
    return { settingsStore, store };
  };

  beforeEach(() => {
    window.localStorage.removeItem("privateRooms");
    frame.isSdkFrame = true;
    getApps.mockResolvedValue([{ id: "e2e-rooms", enabled: true }]);
  });

  afterEach(() => {
    frame.isSdkFrame = false;
    vi.useRealTimers();
  });

  it("Host enables private rooms in a frame", async () => {
    const { settingsStore, store } = createFramedStore();
    await store.fetchApps();

    expect(store.isFrameOptInSettled).toBe(false);
    expect(store.isPrivateRoomsSectionAvailable).toBe(false);

    runInAction(() => {
      settingsStore.frameConfig = { frameId: "ds-frame", privateRooms: true };
    });
    await store.waitForFrameOptIn();

    expect(store.isPrivateRoomsSectionAvailable).toBe(true);
  });

  it("Frame without the property", async () => {
    const { settingsStore, store } = createFramedStore();
    await store.fetchApps();

    runInAction(() => {
      settingsStore.frameConfig = { frameId: "ds-frame" };
    });
    await store.waitForFrameOptIn();

    expect(store.isFrameOptInSettled).toBe(true);
    expect(store.isPrivateRoomsSectionAvailable).toBe(false);
  });

  it("treats a host that never sends its configuration as not opted in", async () => {
    vi.useFakeTimers();
    const { store } = createFramedStore();

    await vi.advanceTimersByTimeAsync(5000);
    await store.waitForFrameOptIn();

    expect(store.isFrameOptInSettled).toBe(true);
    expect(store.isPrivateRoomsSectionAvailable).toBe(false);
  });

  it("has nothing to wait for outside an SDK frame", () => {
    frame.isSdkFrame = false;

    expect(createFramedStore().store.isFrameOptInSettled).toBe(true);
  });
});

describe("AppsStore.isPrivateRoomsSectionAvailable", () => {
  const optIn = () => window.localStorage.setItem("privateRooms", "true");

  beforeEach(() => {
    window.localStorage.removeItem("privateRooms");
  });

  it("Opt-in absent: off whatever the app says", async () => {
    getApps.mockResolvedValue([{ id: "e2e-rooms", enabled: true }]);

    for (const standalone of [false, true]) {
      const store = createStore(standalone);
      await store.fetchApps();
      expect(store.isPrivateRoomsSectionAvailable).toBe(false);
    }
  });

  it("Opt-in set after load: stays off when the opt-in is set after the store was built", async () => {
    getApps.mockResolvedValue([{ id: "e2e-rooms", enabled: true }]);
    const store = createStore(false);
    optIn();

    await store.fetchApps();

    expect(store.isPrivateRoomsSectionAvailable).toBe(false);
  });

  it("is on in SaaS with the opt-in, whatever the server says", async () => {
    optIn();
    getApps.mockResolvedValue([{ id: "e2e-rooms", enabled: false }]);
    const store = createStore(false);

    await store.fetchApps();

    expect(store.isPrivateRoomsSectionAvailable).toBe(true);
  });

  it("follows the app on standalone once the list is loaded", async () => {
    optIn();
    getApps.mockResolvedValue([{ id: "e2e-rooms", enabled: false }]);
    const off = createStore(true);
    await off.fetchApps();

    getApps.mockResolvedValue([{ id: "e2e-rooms", enabled: true }]);
    const on = createStore(true);
    await on.fetchApps();

    expect(off.isPrivateRoomsSectionAvailable).toBe(false);
    expect(on.isPrivateRoomsSectionAvailable).toBe(true);
  });

  it("is optimistic on standalone until the list arrives", () => {
    optIn();
    const store = createStore(true);

    expect(store.isLoaded).toBe(false);
    expect(store.isPrivateRoomsSectionAvailable).toBe(true);
  });

  it("turns off when the app is switched off in another tab", async () => {
    optIn();
    getApps.mockResolvedValue([{ id: "e2e-rooms", enabled: true }]);
    const store = createStore(true);
    await store.fetchApps();

    store.handleAppEnabledChange({ id: "e2e-rooms", enabled: false });

    expect(store.isPrivateRoomsSectionAvailable).toBe(false);
  });
});
