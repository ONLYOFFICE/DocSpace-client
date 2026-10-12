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

import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
}));

vi.mock("SRC_DIR/i18n", () => ({ default: { t: (key: string) => key } }));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/api", () => ({
  default: { files: { changeShowQuickActions: vi.fn() } },
}));

import api from "@docspace/shared/api";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { TFilesSettings } from "@docspace/shared/api/files/types";

import FilesSettingsStore from "../FilesSettingsStore";
import type PluginStore from "../PluginStore";
import type PublicRoomStore from "../PublicRoomStore";
import type { ThirdPartyStore } from "../ThirdPartyStore";
import type TreeFoldersStore from "../TreeFoldersStore";

const changeShowQuickActions = vi.mocked(api.files.changeShowQuickActions);

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
    changeShowQuickActions.mockResolvedValue(true);
  });

  it("starts shown, which is right for everyone who has never hidden it", () => {
    expect(createStore().showQuickActions).toBe(true);
  });

  it("takes the stored value from the portal settings", () => {
    const store = createStore();

    store.setFilesSettings({ showQuickActions: false } as TFilesSettings);

    expect(store.showQuickActions).toBe(false);
  });

  it("keeps the banner until the portal saves the change", () => {
    const store = createStore();
    changeShowQuickActions.mockReturnValue(new Promise(() => {}));

    store.setShowQuickActions(false);

    expect(store.showQuickActions).toBe(true);
  });

  it("sends the new value to the portal", async () => {
    const store = createStore();
    changeShowQuickActions.mockResolvedValue(false);

    await store.setShowQuickActions(false);

    expect(changeShowQuickActions).toHaveBeenCalledWith(false);
    expect(store.showQuickActions).toBe(false);
  });

  it("restores both directions", async () => {
    const store = createStore();

    changeShowQuickActions.mockResolvedValue(false);
    await store.setShowQuickActions(false);
    expect(store.showQuickActions).toBe(false);

    changeShowQuickActions.mockResolvedValue(true);
    await store.setShowQuickActions(true);
    expect(store.showQuickActions).toBe(true);
  });

  it("settles on what the portal answers, not on what was asked", async () => {
    const store = createStore();
    changeShowQuickActions.mockResolvedValue(true);

    await store.setShowQuickActions(false);

    expect(store.showQuickActions).toBe(true);
  });

  it("leaves the banner shown when the request fails", async () => {
    const store = createStore();
    changeShowQuickActions.mockRejectedValue(new Error("nope"));

    await store.setShowQuickActions(false);

    expect(store.showQuickActions).toBe(true);
    expect(toastr.error).toHaveBeenCalled();
  });

  it("keeps the previous value, not the default, when the request fails", async () => {
    const store = createStore();
    store.setFilesSettings({ showQuickActions: false } as TFilesSettings);
    changeShowQuickActions.mockRejectedValue(new Error("nope"));

    await store.setShowQuickActions(true);

    expect(store.showQuickActions).toBe(false);
  });

  it("resolves to false instead of rejecting when the request fails", async () => {
    const store = createStore();
    changeShowQuickActions.mockRejectedValue(new Error("nope"));

    await expect(store.setShowQuickActions(false)).resolves.toBe(false);
  });

  it("resolves to true when the change is saved", async () => {
    const store = createStore();
    changeShowQuickActions.mockResolvedValue(false);

    await expect(store.setShowQuickActions(false)).resolves.toBe(true);
  });

  it("keeps Undo when the hide answers after it", async () => {
    const store = createStore();
    let answerHide: (value: boolean) => void = () => {};
    changeShowQuickActions.mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        answerHide = resolve;
      }),
    );
    changeShowQuickActions.mockResolvedValueOnce(true);

    const hide = store.setShowQuickActions(false);
    await store.setShowQuickActions(true);
    answerHide(false);
    await hide;

    expect(store.showQuickActions).toBe(true);
  });

  it("does not report the earlier hide failing once Undo is sent", async () => {
    const store = createStore();
    let failHide: (error: Error) => void = () => {};
    changeShowQuickActions.mockReturnValueOnce(
      new Promise<boolean>((_, reject) => {
        failHide = reject;
      }),
    );
    changeShowQuickActions.mockResolvedValueOnce(true);

    const hide = store.setShowQuickActions(false);
    await store.setShowQuickActions(true);
    failHide(new Error("nope"));

    await expect(hide).resolves.toBe(false);
    expect(store.showQuickActions).toBe(true);
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("stays on what the portal saved last when Undo fails", async () => {
    const store = createStore();
    let answerHide: (value: boolean) => void = () => {};
    let failUndo: (error: Error) => void = () => {};
    changeShowQuickActions.mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        answerHide = resolve;
      }),
    );
    changeShowQuickActions.mockReturnValueOnce(
      new Promise<boolean>((_, reject) => {
        failUndo = reject;
      }),
    );

    const hide = store.setShowQuickActions(false);
    const undo = store.setShowQuickActions(true);
    answerHide(false);
    await hide;
    failUndo(new Error("nope"));

    await expect(undo).resolves.toBe(false);
    expect(store.showQuickActions).toBe(false);
  });
});

