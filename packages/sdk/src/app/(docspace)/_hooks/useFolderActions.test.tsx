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
import { afterEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mocks = vi.hoisted(() => ({
  pathname: "/private/7001",
  navigation: {
    updateNavigationItems: () => {},
    setCurrentFolderId: () => {},
    setCurrentTitle: () => {},
    setCurrentIsRootRoom: () => {},
  },
  selection: { setSelection: () => {} },
  filesList: { setHighlightFileId: vi.fn() },
  settings: { shareKey: undefined },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("../_store/NavigationStore", () => ({
  useNavigationStore: () => mocks.navigation,
}));

vi.mock("../_store/FilesSelectionStore", () => ({
  useFilesSelectionStore: () => mocks.selection,
}));

vi.mock("../_store/FilesListStore", () => ({
  useFilesListStore: () => mocks.filesList,
}));

vi.mock("../_store/SettingsStore", () => ({
  useSettingsStore: () => mocks.settings,
}));

import useFolderActions from "./useFolderActions";

describe("useFolderActions / openLocation", () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    vi.restoreAllMocks();
  });

  const openLocation = (search: string) => {
    let actions: ReturnType<typeof useFolderActions> | null = null;
    const Probe = () => {
      actions = useFolderActions({ t: (key: string) => key });
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));

    const pushState = vi
      .spyOn(window.history, "pushState")
      .mockImplementation(() => {});
    act(() => actions?.openLocation(7002, 9101, search));

    return new URL(String(pushState.mock.calls[0][2]), "http://localhost");
  };

  it("Open location from the history: the address carries no search text in a private room", () => {
    mocks.pathname = "/private/7001";

    const url = openLocation("Quarterly report");

    expect(url.searchParams.get("folder")).toBe("7002");
    expect(url.searchParams.has("search")).toBe(false);
    expect(url.href).not.toContain("Quarterly");
    expect(mocks.filesList.setHighlightFileId).toHaveBeenCalledWith(9101);
  });

  it("keeps the search text outside private rooms", () => {
    mocks.pathname = "/personal-files";

    const url = openLocation("Quarterly report");

    expect(url.searchParams.get("search")).toBe("Quarterly report");
  });
});
