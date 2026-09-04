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

const createStore = () =>
  new FilesSettingsStore(
    {} as unknown as ThirdPartyStore,
    {} as unknown as TreeFoldersStore,
    {} as unknown as PublicRoomStore,
    {} as unknown as PluginStore,
    {} as unknown as AuthStore,
    {} as unknown as SettingsStore,
  );

describe("FilesSettingsStore quick-actions visibility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts shown, which is right for everyone who has never hidden it", () => {
    expect(createStore().showQuickActions).toBe(true);
  });

  it("stays shown for a user with nothing stored", () => {
    const store = createStore();

    store.hydrateShowQuickActions(USER);

    expect(store.showQuickActions).toBe(true);
  });

  it("is hidden for a user who turned it off", () => {
    localStorage.setItem(KEY, "false");
    const store = createStore();

    store.hydrateShowQuickActions(USER);

    expect(store.showQuickActions).toBe(false);
  });

  it("is tracked per user, because a browser is shared", () => {
    const store = createStore();
    store.setShowQuickActions(false, USER);

    store.hydrateShowQuickActions(OTHER_USER);

    expect(store.showQuickActions).toBe(true);
  });

  it("is left alone until a user id is known", () => {
    const store = createStore();
    store.setShowQuickActions(false, USER);

    store.hydrateShowQuickActions(undefined);

    expect(store.showQuickActions).toBe(false);
  });

  it("persists both directions", () => {
    const store = createStore();

    store.setShowQuickActions(false, USER);
    expect(localStorage.getItem(KEY)).toBe("false");

    store.setShowQuickActions(true, USER);
    expect(localStorage.getItem(KEY)).toBe("true");
    expect(store.showQuickActions).toBe(true);
  });

  it("holds in memory when storage cannot be written", () => {
    const store = createStore();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("nope");
    });

    expect(() => store.setShowQuickActions(false, USER)).not.toThrow();
    expect(store.showQuickActions).toBe(false);
  });

  it("survives storage that cannot be read", () => {
    const store = createStore();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("nope");
    });

    expect(() => store.hydrateShowQuickActions(USER)).not.toThrow();
    // Unreadable storage reads as shown, which is the safer of the two: the
    // banner appearing for someone who hid it beats it vanishing for everyone.
    expect(store.showQuickActions).toBe(true);
  });

  it("takes no user id from the profile toggle without one", () => {
    const store = createStore();

    store.setShowQuickActions(false);

    expect(store.showQuickActions).toBe(false);
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
