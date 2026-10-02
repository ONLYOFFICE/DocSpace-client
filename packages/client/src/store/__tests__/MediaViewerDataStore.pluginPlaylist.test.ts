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

const fileOf = (id: number, fileExst = ".png") =>
  ({
    id,
    title: `file-${id}${fileExst}`,
    fileExst,
    viewUrl: `/view/${id}`,
    fileStatus: 0,
    canShare: true,
    version: 1,
    viewAccessibility: { ImageView: fileExst === ".png", MediaView: false },
  }) as unknown as TFile;

class FakeFilesStore {
  files: TFile[];

  constructor(files: TFile[]) {
    this.files = files;
    makeAutoObservable(this);
  }
}

class FakePluginStore {
  pluginMediaViewerVisible = true;

  pluginMediaViewerProps: Record<string, unknown> | null;

  constructor(props: Record<string, unknown>) {
    this.pluginMediaViewerProps = { pluginName: "sample", ...props };
    makeAutoObservable(this);
  }

  getUserRole = () => PluginUserRole.fullAdmin;

  getCurrentDevice = () => PluginDevices.desktop;

  closeViewer = () => {
    this.pluginMediaViewerVisible = false;
    this.pluginMediaViewerProps = null;
  };
}

const openPluginViewer = (files: TFile[], props: Record<string, unknown>) => {
  const pluginStore = new FakePluginStore(props);

  const store = new MediaViewerDataStore(
    new FakeFilesStore(files) as unknown as FilesStore,
    {} as unknown as PublicRoomStore,
    pluginStore as unknown as PluginStore,
  );

  return { store, pluginStore };
};

describe("MediaViewerDataStore plugin viewer and the open folder", () => {
  it("opens on a file of the open folder", () => {
    const { store } = openPluginViewer([fileOf(1), fileOf(2)], { fileId: 2 });

    store.setMediaViewerData({ visible: true, id: 2 });

    expect(store.isPluginFileOutsidePlaylist).toBe(false);
    expect(store.currentPostionIndex).toBe(1);
  });

  it("finds that file when the plugin passed its id as a string", () => {
    const { store } = openPluginViewer([fileOf(1), fileOf(2)], { fileId: "2" });

    store.setMediaViewerData({ visible: true, id: "2" });

    expect(store.isPluginFileOutsidePlaylist).toBe(false);
    expect(store.currentPostionIndex).toBe(1);
  });

  it("reports a file that is not in the open folder", () => {
    const { store } = openPluginViewer([fileOf(1), fileOf(2)], { fileId: 99 });

    expect(store.isPluginFileOutsidePlaylist).toBe(true);
  });

  it("reports a file of the folder that the plugin's own filter leaves out", () => {
    const { store } = openPluginViewer([fileOf(1), fileOf(3, ".docx")], {
      fileId: 3,
      playlistFilter: { filesExsts: [".png"] },
    });

    expect(store.isPluginFileOutsidePlaylist).toBe(true);
  });

  it("reports nothing when the plugin names no file", () => {
    const { store } = openPluginViewer([fileOf(1)], {});

    expect(store.isPluginFileOutsidePlaylist).toBe(false);
  });

  it("leaves the portal's own viewer alone", () => {
    const { store, pluginStore } = openPluginViewer([fileOf(1), fileOf(2)], {
      fileId: 99,
    });

    pluginStore.closeViewer();
    store.setMediaViewerData({ visible: true, id: 2 });

    expect(store.isPluginFileOutsidePlaylist).toBe(false);
    expect(store.currentPostionIndex).toBe(1);
  });
});
