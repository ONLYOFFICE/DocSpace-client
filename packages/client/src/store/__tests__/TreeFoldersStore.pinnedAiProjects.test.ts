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

const room = (id: number, title: string) => ({
  id,
  title,
  roomType: RoomsType.AiProjectRoom,
  pinned: true,
  logo: { color: "FF6680" },
});

const tree = (...pinned: ReturnType<typeof room>[]) => [
  { id: 1, title: "My documents", rootFolderType: FolderType.USER },
  {
    id: 9,
    title: "AI",
    rootFolderType: FolderType.AiHub,
    pinnedAiProjects: pinned,
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

describe("TreeFoldersStore pinned AI projects", () => {
  beforeEach(() => {
    getFoldersTree.mockReset();
  });

  it("reads the pinned projects of the AI rooms section with the tree", async () => {
    getFoldersTree.mockResolvedValue(tree(room(11, "First"), room(12, "Second")));
    const store = createStore();

    await store.fetchTreeFolders();

    expect(store.pinnedAiProjects).toEqual([
      { id: "11", name: "First", logo: { color: "#FF6680" } },
      { id: "12", name: "Second", logo: { color: "#FF6680" } },
    ]);
  });

  it("lists none while the tree has no AI rooms section", async () => {
    getFoldersTree.mockResolvedValue(tree().slice(0, 1));
    const store = createStore();

    await store.fetchTreeFolders();

    expect(store.pinnedAiProjects).toEqual([]);
  });

  it("renames a listed project in place, without reading the tree", async () => {
    getFoldersTree.mockResolvedValue(tree(room(11, "First"), room(12, "Second")));
    const store = createStore();
    await store.fetchTreeFolders();

    store.syncPinnedAiProject(project(12, "Renamed"));

    expect(store.pinnedAiProjects.map((p) => p.name)).toEqual(["First", "Renamed"]);
    expect(getFoldersTree).toHaveBeenCalledTimes(1);
  });

  it("drops an unpinned project and ignores one that was never listed", async () => {
    getFoldersTree.mockResolvedValue(tree(room(11, "First"), room(12, "Second")));
    const store = createStore();
    await store.fetchTreeFolders();

    store.syncPinnedAiProject(project(11, "First", false));
    store.syncPinnedAiProject(project(40, "Other", false));

    expect(store.pinnedAiProjects.map((p) => p.id)).toEqual(["12"]);
    expect(getFoldersTree).toHaveBeenCalledTimes(1);
  });

  it("reads the tree again for a project pinned just now", async () => {
    getFoldersTree.mockResolvedValue(tree(room(11, "First")));
    const store = createStore();
    await store.fetchTreeFolders();
    getFoldersTree.mockResolvedValue(tree(room(13, "New"), room(11, "First")));

    store.syncPinnedAiProject(project(13, "New"));
    await vi.waitFor(() => expect(store.pinnedAiProjects).toHaveLength(2));

    expect(store.pinnedAiProjects.map((p) => p.id)).toEqual(["13", "11"]);
  });

  it("drops a deleted project by its id", async () => {
    getFoldersTree.mockResolvedValue(tree(room(11, "First"), room(12, "Second")));
    const store = createStore();
    await store.fetchTreeFolders();

    store.removePinnedAiProject(11);

    expect(store.pinnedAiProjects.map((p) => p.id)).toEqual(["12"]);
  });
});
