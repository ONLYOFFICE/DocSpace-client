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

import { describe, it, expect } from "vitest";
import { makeAutoObservable } from "mobx";

import type { TFile } from "@docspace/shared/api/files/types";

import MediaViewerDataStore from "../MediaViewerDataStore";
import type PluginStore from "../PluginStore";
import type PublicRoomStore from "../PublicRoomStore";
import type FilesStore from "../FilesStore";
import { PluginDevices, PluginUserRole } from "../../helpers/plugins/enums";

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
  files = [imageOf(1), imageOf(2), imageOf(3)];

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

  showViewer = (fileId: number | string) => {
    this.pluginMediaViewerVisible = true;
    this.pluginMediaViewerProps = { pluginName: "sample", fileId };
  };

  updateViewer = (fileId: number | string) => {
    this.pluginMediaViewerProps = { pluginName: "sample", fileId };
  };
}

const openPluginViewer = (fileId: number) => {
  const pluginStore = new FakePluginStore();

  const store = new MediaViewerDataStore(
    new FakeFilesStore() as unknown as FilesStore,
    {} as unknown as PublicRoomStore,
    pluginStore as unknown as PluginStore,
  );

  pluginStore.showViewer(fileId);
  store.openPluginViewer(fileId);

  return { store, pluginStore };
};

describe("MediaViewerDataStore switching the plugin viewer to another file", () => {
  it("switches to the file the plugin asks for through an update", () => {
    const { store, pluginStore } = openPluginViewer(1);

    pluginStore.updateViewer(3);

    expect(store.pendingPluginFileId).toBe(3);

    store.showPluginFile(3);

    expect(store.pendingPluginFileId).toBeUndefined();
    expect(store.id).toBe(3);
    expect(store.currentPostionIndex).toBe(2);
  });

  it("shows the requested file again after the user moved away from it", () => {
    const { store, pluginStore } = openPluginViewer(1);

    pluginStore.updateViewer(3);
    store.showPluginFile(3);
    store.setCurrentId(2);
    pluginStore.updateViewer(3);

    expect(store.pendingPluginFileId).toBe(3);
  });

  it("keeps the file the user moved to while the plugin sends nothing", () => {
    const { store } = openPluginViewer(1);

    store.setCurrentId(2);

    expect(store.pendingPluginFileId).toBeUndefined();
    expect(store.id).toBe(2);
  });

  it("switches to a file whose id came as a string", () => {
    const { store, pluginStore } = openPluginViewer(1);

    pluginStore.updateViewer("3");
    store.showPluginFile("3");

    expect(store.currentPostionIndex).toBe(2);
  });

  it("leaves the first file to opening the viewer", () => {
    const pluginStore = new FakePluginStore();

    const store = new MediaViewerDataStore(
      new FakeFilesStore() as unknown as FilesStore,
      {} as unknown as PublicRoomStore,
      pluginStore as unknown as PluginStore,
    );

    pluginStore.showViewer(2);

    expect(store.pendingPluginFileId).toBeUndefined();
  });
});
