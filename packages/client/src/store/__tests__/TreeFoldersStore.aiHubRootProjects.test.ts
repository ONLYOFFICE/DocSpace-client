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

import { beforeEach, describe, expect, it, vi } from "vitest";

import { FolderType, RoomsType } from "@docspace/shared/enums";

import TreeFoldersStore from "../TreeFoldersStore";

const getFoldersTree = vi.hoisted(() => vi.fn());

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getFoldersTree,
}));

vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (key: string) => key },
}));

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    default: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      socketSubscribers: new Set<string>(),
    },
  };
});

const room = (id: number, title: string, pinned = true) => ({
  id,
  title,
  roomType: RoomsType.AiProjectRoom,
  pinned,
  logo: { color: "FF6680" },
});

const tree = (...projects: ReturnType<typeof room>[]) => [
  { id: 1, title: "My documents", rootFolderType: FolderType.USER },
  {
    id: 9,
    title: "AI",
    rootFolderType: FolderType.AiHub,
    aiHubRootProjects: projects,
  },
];

const createStore = () =>
  new TreeFoldersStore(
    ...([{}, {}, { isPublicRoom: false }] as unknown as ConstructorParameters<
      typeof TreeFoldersStore
    >),
  );

const project = (id: number, title: string, pinned = true) => ({
  id,
  title,
  pinned,
  logo: { color: "#FF6680" },
});

const fivePinned = () =>
  [11, 12, 13, 14, 15].map((id) => room(id, `Project ${id}`));

const ids = (store: TreeFoldersStore) =>
  store.aiHubRootProjects.map((p) => p.id);

describe("TreeFoldersStore AI projects of the sidebar", () => {
  beforeEach(() => {
    getFoldersTree.mockReset();
  });

  it("reads the projects of the AI rooms section with the tree, pinned or not", async () => {
    getFoldersTree.mockResolvedValue(
      tree(room(11, "First"), room(12, "Second", false)),
    );
    const store = createStore();

    await store.fetchTreeFolders();

    expect(store.aiHubRootProjects).toEqual([
      { id: "11", name: "First", logo: { color: "#FF6680" }, pinned: true },
      { id: "12", name: "Second", logo: { color: "#FF6680" }, pinned: false },
    ]);
  });

  it("lists none while the tree has no AI rooms section", async () => {
    getFoldersTree.mockResolvedValue(tree().slice(0, 1));
    const store = createStore();

    await store.fetchTreeFolders();

    expect(store.aiHubRootProjects).toEqual([]);
  });

  it("renames a listed project in place, without reading the tree", async () => {
    getFoldersTree.mockResolvedValue(tree(room(11, "First"), room(12, "Second")));
    const store = createStore();
    await store.fetchTreeFolders();

    store.syncAiHubRootProject(project(12, "Renamed"));

    expect(store.aiHubRootProjects.map((p) => p.name)).toEqual(["First", "Renamed"]);
    expect(getFoldersTree).toHaveBeenCalledTimes(1);
  });

  it("keeps an unpinned project listed and reads the tree again for its new place", async () => {
    getFoldersTree.mockResolvedValue(tree(room(11, "First"), room(12, "Second")));
    const store = createStore();
    await store.fetchTreeFolders();
    getFoldersTree.mockResolvedValue(
      tree(room(12, "Second"), room(11, "First", false)),
    );

    store.syncAiHubRootProject(project(11, "First", false));
    await vi.waitFor(() => expect(ids(store)).toEqual(["12", "11"]));

    expect(store.aiHubRootProjects[1].pinned).toBe(false);
    expect(getFoldersTree).toHaveBeenCalledTimes(2);
  });

  it("reads the tree again for a project pinned just now", async () => {
    getFoldersTree.mockResolvedValue(tree(...fivePinned()));
    const store = createStore();
    await store.fetchTreeFolders();
    getFoldersTree.mockResolvedValue(
      tree(room(20, "New"), ...fivePinned().slice(0, 4)),
    );

    store.syncAiHubRootProject(project(20, "New"));
    await vi.waitFor(() => expect(ids(store)[0]).toBe("20"));

    expect(ids(store)).toEqual(["20", "11", "12", "13", "14"]);
  });

  it("reads the tree again for a new project while the list has room for it", async () => {
    getFoldersTree.mockResolvedValue(tree(room(11, "First")));
    const store = createStore();
    await store.fetchTreeFolders();
    getFoldersTree.mockResolvedValue(
      tree(room(11, "First"), room(30, "Created", false)),
    );

    store.syncAiHubRootProject(project(30, "Created", false));
    await vi.waitFor(() => expect(ids(store)).toEqual(["11", "30"]));
  });

  it("reads the tree again for a new project that may push out one that is not pinned", async () => {
    getFoldersTree.mockResolvedValue(
      tree(...fivePinned().slice(0, 4), room(15, "Loose", false)),
    );
    const store = createStore();
    await store.fetchTreeFolders();

    store.syncAiHubRootProject(project(30, "Created", false));

    expect(getFoldersTree).toHaveBeenCalledTimes(2);
  });

  it("takes no other project into a list of five pinned ones", async () => {
    getFoldersTree.mockResolvedValue(tree(...fivePinned()));
    const store = createStore();
    await store.fetchTreeFolders();

    store.syncAiHubRootProject(project(30, "Created", false));

    expect(ids(store)).toEqual(["11", "12", "13", "14", "15"]);
    expect(getFoldersTree).toHaveBeenCalledTimes(1);
  });

  it("drops a deleted project by its id, and ignores one that is not listed", async () => {
    getFoldersTree.mockResolvedValue(tree(room(11, "First"), room(12, "Second")));
    const store = createStore();
    await store.fetchTreeFolders();

    store.removeAiHubRootProject(11);
    store.removeAiHubRootProject(40);

    expect(ids(store)).toEqual(["12"]);
    expect(getFoldersTree).toHaveBeenCalledTimes(1);
  });

  it("reads the tree again for the project that takes the place of one deleted from a full list", async () => {
    getFoldersTree.mockResolvedValue(tree(...fivePinned()));
    const store = createStore();
    await store.fetchTreeFolders();
    getFoldersTree.mockResolvedValue(
      tree(...fivePinned().slice(1), room(16, "Next", false)),
    );

    store.removeAiHubRootProject(11);
    expect(ids(store)).toEqual(["12", "13", "14", "15"]);
    await vi.waitFor(() => expect(ids(store)).toHaveLength(5));

    expect(ids(store)).toEqual(["12", "13", "14", "15", "16"]);
  });
});
