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
import api from "@docspace/shared/api";
import { AnalyticsEvents, FolderType } from "@docspace/shared/enums";
import { thumbnailStatuses } from "@docspace/shared/constants";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";
import type { TFile } from "@docspace/shared/api/files/types";

let navigate: ReturnType<typeof vi.fn>;

beforeEach(() => {
  navigate = vi.fn();
  (window as unknown as { DocSpace: unknown }).DocSpace = { navigate };
  (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
});

const authedSettings = {
  getPortalCultures: () => Promise.resolve(),
  getInvitationSettings: () => Promise.resolve(),
  getFilesSettings: () => Promise.resolve(),
  getIsEncryptionSupport: () => Promise.resolve(),
  isDesktopClient: false,
};

describe("FilesStore.initFiles — characterization", () => {
  it("marks the store initialised after the settings requests resolve", async () => {
    const store = createTestFilesStore({
      authStore: { isAuthenticated: true },
      settingsStore: authedSettings,
      filesSettingsStore: { getFilesSettings: () => Promise.resolve() },
      treeFoldersStore: { fetchTreeFolders: () => Promise.resolve([]) },
    });

    await store.initFiles();
    expect(store.isInit).toBe(true);
  });

  it("does not initialise an unauthenticated session", async () => {
    const store = createTestFilesStore({
      authStore: { isAuthenticated: false },
    });

    await store.initFiles();
    expect(store.isInit).toBe(false);
  });

  it("is a no-op once already initialised", async () => {
    const store = createTestFilesStore({ authStore: { isAuthenticated: true } });
    store.setIsInit(true);
    // No settings fakes provided: if the guard failed it would throw calling
    // undefined settings methods.
    await store.initFiles();
    expect(store.isInit).toBe(true);
  });
});

describe("FilesStore.createThumbnail — characterization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("requests a thumbnail for a WAITING tile file", async () => {
    const store = createTestFilesStore();
    store.setViewAs("tile");
    const createThumbnails = vi
      .spyOn(api.files, "createThumbnails")
      .mockResolvedValue([] as never);

    await store.createThumbnail({
      id: 1,
      versionGroup: 1,
      thumbnailStatus: thumbnailStatuses.WAITING,
    } as unknown as TFile);

    expect(createThumbnails).toHaveBeenCalledWith([1]);
  });

  it("no-ops outside tile view", async () => {
    const store = createTestFilesStore(); // list view
    const createThumbnails = vi.spyOn(api.files, "createThumbnails");
    await store.createThumbnail({
      id: 1,
      thumbnailStatus: thumbnailStatuses.WAITING,
    } as unknown as TFile);
    expect(createThumbnails).not.toHaveBeenCalled();
  });
});

describe("FilesStore.wsModifyFolderCreate — add branches", () => {
  afterEach(() => vi.restoreAllMocks());

  it("pushes a FileCreated analytics event for a new file in the current folder", async () => {
    const store = createTestFilesStore();
    store.getFilesContextOptions = (() => []) as never;
    store.files = [];

    await store.wsModifyFolderCreate({
      type: "file",
      id: 7,
      data: JSON.stringify({ id: 7, folderId: 1, title: "New.docx" }),
    } as never);

    const layer = (window as unknown as { dataLayer: { event: string }[] })
      .dataLayer;
    expect(layer).toHaveLength(1);
    expect(layer[0].event).toBe(AnalyticsEvents.FileCreated);
  });

  it("increments a sibling folder's foldersCount for a subfolder created elsewhere", async () => {
    const store = createTestFilesStore();
    store.folders = [{ id: 50, foldersCount: 0 } as TItem] as never;

    await store.wsModifyFolderCreate({
      type: "folder",
      id: 99,
      data: JSON.stringify({ id: 99, parentId: 50 }), // not the current folder
    } as never);

    expect((store.folders[0] as { foldersCount: number }).foldersCount).toBe(1);
  });
});

describe("FilesStore.redirectToParent — routing", () => {
  const pathPart = (id: number) => ({ id }) as never;

  it("routes an AI-agents room removal to the agents listing", () => {
    const store = createTestFilesStore();
    store.redirectToParent(
      { id: 5 } as never,
      [pathPart(1), pathPart(5)],
      false,
      false,
      FolderType.AIAgents,
    );
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("routes a personal-folder removal to the parent folder listing", () => {
    const store = createTestFilesStore();
    store.redirectToParent(
      { id: 5 } as never,
      [pathPart(2), pathPart(5)],
      false,
      false,
      FolderType.USER,
    );
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(String(navigate.mock.calls[0][0])).toContain("folder=2");
  });
});
