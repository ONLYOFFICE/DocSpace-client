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

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { observable, runInAction } from "mobx";

vi.mock("@docspace/ui-kit/utils/socket", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
}));

vi.mock("SRC_DIR/i18n", () => ({ default: { t: (key: string) => key } }));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));

import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";

import FilesSettingsStore from "../FilesSettingsStore";
import type PluginStore from "../PluginStore";
import type PublicRoomStore from "../PublicRoomStore";
import type { ThirdPartyStore } from "../ThirdPartyStore";
import type TreeFoldersStore from "../TreeFoldersStore";

const USER = "user-1";
const OTHER_USER = "user-2";
const KEY = `show_quick_actions_${USER}`;

// Only the slice of AuthStore the store reads: the signed-in user's id, made
// observable so the tests can sign users in and out the way the app does.
const createAuthStore = (userId?: string) =>
  observable({
    userStore: { user: userId ? { id: userId } : null },
  });

const signIn = (
  authStore: ReturnType<typeof createAuthStore>,
  userId: string | null,
) => {
  runInAction(() => {
    authStore.userStore.user = userId ? { id: userId } : null;
  });
};

const createStore = (userId?: string) => {
  const authStore = createAuthStore(userId);
  const store = new FilesSettingsStore(
    {} as unknown as ThirdPartyStore,
    {} as unknown as TreeFoldersStore,
    {} as unknown as PublicRoomStore,
    {} as unknown as PluginStore,
    authStore as unknown as AuthStore,
    {} as unknown as SettingsStore,
  );

  return { store, authStore };
};

describe("FilesSettingsStore quick-actions visibility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts shown, which is right for everyone who has never hidden it", () => {
    expect(createStore().store.showQuickActions).toBe(true);
  });

  it("stays shown for a user with nothing stored", () => {
    expect(createStore(USER).store.showQuickActions).toBe(true);
  });

  it("is hidden from the first read for a user who turned it off", () => {
    // No page has to ask for it: the store reads the choice as soon as it
    // knows who is signed in, so the banner never renders before hiding.
    localStorage.setItem(KEY, "false");

    expect(createStore(USER).store.showQuickActions).toBe(false);
  });

  it("is tracked per user, because a browser is shared", () => {
    createStore(USER).store.setShowQuickActions(false);

    expect(createStore(OTHER_USER).store.showQuickActions).toBe(true);
  });

  it("picks the choice up when the user signs in later", () => {
    localStorage.setItem(KEY, "false");
    const { store, authStore } = createStore();

    expect(store.showQuickActions).toBe(true);

    signIn(authStore, USER);

    expect(store.showQuickActions).toBe(false);
  });

  it("switches with the account on the same store", () => {
    const { store, authStore } = createStore(USER);
    store.setShowQuickActions(false);

    signIn(authStore, OTHER_USER);
    expect(store.showQuickActions).toBe(true);

    signIn(authStore, USER);
    expect(store.showQuickActions).toBe(false);
  });

  it("is left alone while no user is signed in", () => {
    const { store, authStore } = createStore(USER);
    store.setShowQuickActions(false);

    signIn(authStore, null);

    expect(store.showQuickActions).toBe(false);
  });

  it("persists both directions", () => {
    const { store } = createStore(USER);

    store.setShowQuickActions(false);
    expect(localStorage.getItem(KEY)).toBe("false");

    store.setShowQuickActions(true);
    expect(localStorage.getItem(KEY)).toBe("true");
    expect(store.showQuickActions).toBe(true);
  });

  it("holds in memory when storage cannot be written", () => {
    const { store } = createStore(USER);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("nope");
    });

    expect(() => store.setShowQuickActions(false)).not.toThrow();
    expect(store.showQuickActions).toBe(false);
  });

  it("survives storage that cannot be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("nope");
    });

    const { store } = createStore(USER);

    expect(() => store.hydrateShowQuickActions()).not.toThrow();
    // Unreadable storage reads as shown, which is the safer of the two: the
    // banner appearing for someone who hid it beats it vanishing for everyone.
    expect(store.showQuickActions).toBe(true);
  });

  it("writes nothing while no user is signed in", () => {
    const { store } = createStore();

    store.setShowQuickActions(false);

    expect(store.showQuickActions).toBe(false);
    expect(localStorage.length).toBe(0);
  });
});
