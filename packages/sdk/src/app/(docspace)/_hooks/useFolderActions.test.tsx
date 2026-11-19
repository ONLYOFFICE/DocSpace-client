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

const mocks = vi.hoisted(() => ({
  pathname: "/private/7001",
  router: { push: vi.fn(), replace: vi.fn() },
  navigation: {
    updateNavigationItems: () => {},
    setCurrentFolderId: () => {},
    setCurrentTitle: () => {},
    setCurrentIsRootRoom: () => {},
  },
  selection: { setSelection: () => {} },
  filesList: {
    items: [] as unknown[],
    setHighlightFileId: vi.fn(),
  },
  settings: { shareKey: undefined },
  getFolderPath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => mocks.router,
}));

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getFolderPath: mocks.getFolderPath,
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

import { FolderType } from "@docspace/shared/enums";

import useFolderActions from "./useFolderActions";

const PRIVATE_PATH = [
  { id: 2, title: "Rooms" },
  { id: 7001, title: "Private", roomType: 5, private: true },
  { id: 7002, title: "Drafts" },
];
const PLAIN_PATH = [
  { id: 2, title: "Rooms" },
  { id: 50, title: "Shared", roomType: 6, private: false },
  { id: 7002, title: "Drafts" },
];

describe("useFolderActions", () => {
  let root: Root | null = null;

  beforeEach(() => {
    mocks.router.push.mockClear();
    mocks.router.replace.mockClear();
    mocks.getFolderPath.mockReset();
    mocks.filesList.items = [];
    window.history.replaceState({}, "", "/sdk/personal-files?privateRooms=true");
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    vi.restoreAllMocks();
  });

  const render = () => {
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
    return { actions: actions as unknown as ReturnType<typeof useFolderActions>, pushState };
  };

  const openLocation = async (search: string) => {
    const { actions, pushState } = render();
    await act(async () => actions.openLocation(7002, 9101, search));
    return new URL(String(pushState.mock.calls[0][2]), "http://localhost");
  };

  it("Open location from the history: the address carries no search text in a private room", async () => {
    mocks.pathname = "/private/7001";

    const url = await openLocation("Quarterly report");

    expect(url.searchParams.get("folder")).toBe("7002");
    expect(url.searchParams.has("search")).toBe(false);
    expect(url.href).not.toContain("Quarterly");
    expect(mocks.filesList.setHighlightFileId).toHaveBeenCalledWith(9101);
    expect(mocks.getFolderPath).not.toHaveBeenCalled();
  });

  it("keeps the search text outside private rooms", async () => {
    mocks.pathname = "/personal-files";
    mocks.getFolderPath.mockResolvedValue(PLAIN_PATH);

    const url = await openLocation("Quarterly report");

    expect(url.searchParams.get("search")).toBe("Quarterly report");
  });

  it("Open location of an encrypted file on a generic page", async () => {
    mocks.pathname = "/personal-files";
    mocks.getFolderPath.mockResolvedValue(PRIVATE_PATH);
    const { actions, pushState } = render();

    await act(async () => actions.openLocation(7002, 9101, "Quarterly report"));

    expect(pushState).not.toHaveBeenCalled();
    expect(mocks.router.push).not.toHaveBeenCalled();
    expect(mocks.router.replace).toHaveBeenCalledWith(
      "/private/7001?privateRooms=true&folder=7002",
    );
  });

  it("Folder of a private room reached on a generic page", async () => {
    mocks.pathname = "/personal-files";
    mocks.getFolderPath.mockResolvedValue(PRIVATE_PATH);
    const { actions, pushState } = render();

    await act(async () => actions.openFolder(7002, "Drafts"));

    expect(mocks.getFolderPath).toHaveBeenCalledWith(7002);
    expect(pushState).not.toHaveBeenCalled();
    expect(mocks.router.replace).toHaveBeenCalledWith(
      "/private/7001?privateRooms=true&folder=7002",
    );
  });

  it("opens a folder of My documents without a path request", async () => {
    mocks.pathname = "/personal-files";
    mocks.filesList.items = [
      { id: 55, isFolder: true, rootFolderType: FolderType.USER },
    ];
    const { actions, pushState } = render();

    await act(async () => actions.openFolder(55, "Notes"));

    expect(mocks.getFolderPath).not.toHaveBeenCalled();
    expect(pushState).toHaveBeenCalledTimes(1);
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });

  it("Room of the folder cannot be read: nothing is listed", async () => {
    mocks.pathname = "/rooms";
    mocks.getFolderPath.mockRejectedValue(new Error("403"));
    const { actions, pushState } = render();

    await act(async () => actions.openFolder(7002, "Drafts"));

    expect(pushState).not.toHaveBeenCalled();
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });
});
