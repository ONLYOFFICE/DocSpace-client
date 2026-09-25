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

import { describe, it, expect, afterEach, vi } from "vitest";
import { makeAutoObservable } from "mobx";

import { CategoryType } from "@docspace/shared/constants";
import type { TFile } from "@docspace/shared/api/files/types";

import MediaViewerDataStore from "../MediaViewerDataStore";
import type PluginStore from "../PluginStore";
import type PublicRoomStore from "../PublicRoomStore";
import type FilesStore from "../FilesStore";
import { PluginDevices, PluginUserRole } from "../../helpers/plugins/enums";

const FOLDER_URL = "/rooms/shared/7/filter?folder=7";

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

  closeViewer = () => {
    this.pluginMediaViewerVisible = false;
    this.pluginMediaViewerProps = null;
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

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("MediaViewerDataStore closing the plugin viewer", () => {
  it("does not hand the viewer over to the portal once the plugin closed it", () => {
    const { store, pluginStore } = createStores();

    pluginStore.showViewer(2);
    store.openPluginViewer(2);

    expect(store.isPluginViewerClosing).toBe(false);

    pluginStore.closeViewer();

    expect(store.isPluginViewerClosing).toBe(true);

    store.closePluginViewer();

    expect(store.visible).toBe(false);
    expect(store.isPluginViewerClosing).toBe(false);
  });

  it("leaves the portal's own viewer open when the plugin never opened it", () => {
    const { store, pluginStore } = createStores();

    store.setMediaViewerData({ visible: true, id: 1 });
    pluginStore.showViewer(99);
    pluginStore.closeViewer();

    expect(store.isPluginViewerClosing).toBe(false);
    expect(store.visible).toBe(true);
  });

  it("gives the folder address back after the portal's viewer put a file in it", () => {
    const { store, pluginStore } = createStores();

    window.history.replaceState(null, "", "/media/view/2");
    pluginStore.showViewer(2);
    store.openPluginViewer(2);
    pluginStore.closeViewer();
    store.closePluginViewer();

    expect(window.location.pathname + window.location.search).toBe(FOLDER_URL);
  });

  it("adds no history entry when the address is already the folder's", () => {
    const { store, pluginStore } = createStores();
    const pushState = vi.spyOn(window.history, "pushState");

    window.history.replaceState(null, "", FOLDER_URL);
    pluginStore.showViewer(2);
    store.openPluginViewer(2);
    pluginStore.closeViewer();
    store.closePluginViewer();

    expect(pushState).not.toHaveBeenCalled();
  });
});
