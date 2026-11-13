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

import { describe, expect, it, vi } from "vitest";

import { FolderType } from "@docspace/shared/enums";

import TreeFoldersStore from "../TreeFoldersStore";

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

type TOpenFolder = {
  rootFolderType: FolderType;
  private: boolean;
  navigationPath: { id: number; isRoom: boolean; private?: boolean }[];
};

const isPrivacyFolderIn = (folder: TOpenFolder) =>
  new TreeFoldersStore(
    ...([folder, {}, {}] as unknown as ConstructorParameters<
      typeof TreeFoldersStore
    >),
  ).isPrivacyFolder;

const roomRoot = (rootFolderType: FolderType, isPrivate: boolean) => ({
  rootFolderType,
  private: isPrivate,
  navigationPath: [{ id: 2, isRoom: false }],
});

const subfolderOf = (rootFolderType: FolderType, isPrivate: boolean) => ({
  rootFolderType,
  private: false,
  navigationPath: [
    { id: 7, isRoom: true, private: isPrivate },
    { id: 2, isRoom: false },
  ],
});

describe("TreeFoldersStore.isPrivacyFolder — Private-room rules follow the room into Archive", () => {
  it("is true at the root of an active private room and in its subfolders", () => {
    expect(isPrivacyFolderIn(roomRoot(FolderType.Rooms, true))).toBe(true);
    expect(isPrivacyFolderIn(subfolderOf(FolderType.Rooms, true))).toBe(true);
  });

  it("Archived private room opened", () => {
    expect(isPrivacyFolderIn(roomRoot(FolderType.Archive, true))).toBe(true);
  });

  it("Folder inside an archived private room", () => {
    expect(isPrivacyFolderIn(subfolderOf(FolderType.Archive, true))).toBe(
      true,
    );
  });

  it("Ordinary archived room", () => {
    expect(isPrivacyFolderIn(roomRoot(FolderType.Archive, false))).toBe(false);
    expect(isPrivacyFolderIn(subfolderOf(FolderType.Archive, false))).toBe(
      false,
    );
  });

  it("is false in an ordinary active room and in My documents", () => {
    expect(isPrivacyFolderIn(roomRoot(FolderType.Rooms, false))).toBe(false);
    expect(
      isPrivacyFolderIn({
        rootFolderType: FolderType.USER,
        private: false,
        navigationPath: [],
      }),
    ).toBe(false);
  });
});

describe("TreeFoldersStore — the Private list is a rooms list under its own root", () => {
  const ROOMS_ROOT_ID = 8;
  const PRIVATE_ROOT_ID = 9;

  const storeAt = (folder: { id: number; rootFolderType: FolderType }) => {
    const store = new TreeFoldersStore(
      ...([folder, {}, {}] as unknown as ConstructorParameters<
        typeof TreeFoldersStore
      >),
    );
    store.treeFolders = [
      { id: ROOMS_ROOT_ID, rootFolderType: FolderType.Rooms },
      { id: PRIVATE_ROOT_ID, rootFolderType: FolderType.PrivateRooms },
    ] as never;
    return store;
  };

  it("Private root open", () => {
    const store = storeAt({
      id: PRIVATE_ROOT_ID,
      rootFolderType: FolderType.PrivateRooms,
    });

    expect(store.isPrivateRoomsFolder).toBe(true);
    expect(store.isRoomsFolder).toBe(true);
    expect(store.isRoomsFolderRoot).toBe(true);
    expect(store.privateRoomsFolderId).toBe(PRIVATE_ROOT_ID);
  });

  it("Rooms root open", () => {
    const store = storeAt({
      id: ROOMS_ROOT_ID,
      rootFolderType: FolderType.Rooms,
    });

    expect(store.isPrivateRoomsFolder).toBe(false);
    expect(store.isRoomsFolder).toBe(true);
    expect(store.isRoomsFolderRoot).toBe(true);
  });

  it("Private room open: it reports the Rooms root, so it is not the list", () => {
    const store = storeAt({ id: 100, rootFolderType: FolderType.Rooms });

    expect(store.isPrivateRoomsFolder).toBe(false);
    expect(store.isRoomsFolder).toBeFalsy();
  });
});
