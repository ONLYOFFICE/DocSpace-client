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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

// Stable across renders, like the real hooks, so the fetch effect stays idle.
const mocks = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
  settings: {
    setIsEmptyList: () => {},
    filesViewAs: "table",
    setFilesViewAs: () => {},
    currentDeviceType: "desktop",
  },
  selection: { setSelection: () => {}, setBufferSelection: () => {} },
  navigation: { setCurrentFolderId: () => {}, setCurrentTitle: () => {} },
  icon: { getIcon: () => "" },
  itemList: {
    convertFileToItem: (file: object) => ({ ...file, isFolder: false }),
    convertFolderToItem: (folder: object) => ({ ...folder, isFolder: true }),
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/private/7001",
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@docspace/shared/api", () => ({
  default: { files: { getFolder: vi.fn() } },
}));

vi.mock("@/app/(docspace)/_store/SettingsStore", () => ({
  useSettingsStore: () => mocks.settings,
}));

vi.mock("@/app/(docspace)/_store/FilesSelectionStore", () => ({
  useFilesSelectionStore: () => mocks.selection,
}));

vi.mock("@/app/(docspace)/_store/NavigationStore", () => ({
  useNavigationStore: () => mocks.navigation,
}));

vi.mock("@/app/(docspace)/_hooks/useItemIcon", () => ({
  default: () => mocks.icon,
}));

vi.mock("@/app/(docspace)/_hooks/useItemList", () => ({
  default: () => mocks.itemList,
}));

vi.mock("@/app/(docspace)/_hooks/useFilesSocket", () => ({ default: vi.fn() }));

vi.mock("./hooks/useResetSelectionClick", () => ({ default: vi.fn() }));

vi.mock("../table-view", () => ({
  default: ({ items }: { items: { id: number; title: string }[] }) => (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  ),
}));

vi.mock("../tile-view", () => ({ default: () => null }));
vi.mock("../row-view", () => ({ default: () => null }));
vi.mock("../empty-view", () => ({ default: () => <p>empty folder</p> }));

import {
  FilesListStore,
  FilesListStoreContext,
} from "@/app/(docspace)/_store/FilesListStore";

import List from "./index";

describe("List", () => {
  let root: Root | null = null;
  let container: HTMLDivElement;
  let store: FilesListStore;

  beforeEach(() => {
    store = new FilesListStore();
    container = document.createElement("div");
    root = createRoot(container);
    act(() =>
      root?.render(
        <FilesListStoreContext.Provider value={store}>
          <List
            total={1}
            folders={[]}
            files={[{ id: 8101, title: "memo.txt" } as never]}
            filesSettings={{ displayFileExtension: true } as never}
            filesFilter=""
            portalSettings={{ timezone: "UTC", socketUrl: "" } as never}
            current={{ id: 7001, title: "Room", rootFolderType: 14 } as never}
          />
        </FilesListStoreContext.Provider>,
      ),
    );
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("drops the last item an action removed from the list", () => {
    expect(container.textContent).toContain("memo.txt");

    act(() => store.removeItem(8101));

    expect(container.textContent).not.toContain("memo.txt");
    expect(container.textContent).toContain("empty folder");
  });
});
