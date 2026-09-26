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
import { makeAutoObservable } from "mobx";

import { CategoryType } from "@docspace/shared/constants";
import type { TFile } from "@docspace/shared/api/files/types";

import MediaViewerDataStore from "../MediaViewerDataStore";
import type PluginStore from "../PluginStore";
import type PublicRoomStore from "../PublicRoomStore";
import type FilesStore from "../FilesStore";
import { PluginDevices, PluginUserRole } from "../../helpers/plugins/enums";

const FOLDER_URL = "/rooms/shared/7/filter?folder=7";

const currentUrl = () => window.location.pathname + window.location.search;

const imageOf = (id: number) =>
  ({
    id,
    title: `image-${id}.png`,
    fileExst: ".png",
    viewUrl: `/view/${id}`,
    fileStatus: 0,
    canShare: true,
    version: 1,
    viewAccessibility: { ImageView: true, MediaView: false },
  }) as unknown as TFile;

class FakeFilesStore {
  files = [imageOf(1), imageOf(2)];

  categoryType = CategoryType.SharedRoom;

  filter = { folder: 7, toUrlParams: () => "folder=7" };

  constructor() {
    makeAutoObservable(this);
  }
}

class FakePluginStore {
  pluginMediaViewerVisible = false;

  pluginMediaViewerProps: Record<string, unknown> | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  getUserRole = () => PluginUserRole.fullAdmin;

  getCurrentDevice = () => PluginDevices.desktop;

  showViewer = (fileId: number) => {
    this.pluginMediaViewerVisible = true;
    this.pluginMediaViewerProps = { pluginName: "sample", fileId };
  };
}

const createStores = () => {
  const pluginStore = new FakePluginStore();

  const store = new MediaViewerDataStore(
    new FakeFilesStore() as unknown as FilesStore,
    {} as unknown as PublicRoomStore,
    pluginStore as unknown as PluginStore,
  );

  return { store, pluginStore };
};

beforeEach(() => {
  vi.spyOn(window.history, "back").mockImplementation(() => {});
  window.history.replaceState(null, "", FOLDER_URL);
});

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("MediaViewerDataStore history entry of the viewer", () => {
  it("adds one entry on opening and replaces it while paging", () => {
    const { store } = createStores();
    const length = window.history.length;

    store.changeUrl(1);
    store.changeUrl(2);

    expect(window.history.length).toBe(length + 1);
    expect(currentUrl()).toBe("/media/view/2");
  });

  it("steps back over its entry on closing", () => {
    const { store } = createStores();

    store.changeUrl(1);
    store.removeViewerHistoryEntry();

    expect(window.history.back).toHaveBeenCalledTimes(1);
  });

  it("puts the folder address in place of a viewer opened by a link", () => {
    const { store } = createStores();

    window.history.replaceState(null, "", "/media/view/1");
    const length = window.history.length;

    store.changeUrl(2);
    store.removeViewerHistoryEntry();

    expect(window.history.back).not.toHaveBeenCalled();
    expect(window.history.length).toBe(length);
    expect(currentUrl()).toBe(FOLDER_URL);
  });

  it("gives the plugin viewer an entry of its own at the folder address", () => {
    const { store, pluginStore } = createStores();
    const length = window.history.length;

    pluginStore.showViewer(1);
    store.openPluginViewer(1);

    expect(window.history.length).toBe(length + 1);
    expect(currentUrl()).toBe(FOLDER_URL);
  });

  it("adds nothing when the plugin viewer opens over the portal's viewer", () => {
    const { store, pluginStore } = createStores();

    store.changeUrl(1);
    const length = window.history.length;

    pluginStore.showViewer(1);
    store.openPluginViewer(1);

    expect(window.history.length).toBe(length);
    expect(currentUrl()).toBe("/media/view/1");
  });
});
