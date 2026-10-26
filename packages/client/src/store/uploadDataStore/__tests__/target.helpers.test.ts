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

import { afterEach, describe, expect, it, vi } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import TreeFoldersStore from "../../TreeFoldersStore";

import { resolveOpenFolderTarget } from "../target.helpers";

vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (key: string) => key },
}));

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (importOriginal) => ({
  ...((await importOriginal()) as Record<string, unknown>),
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
}));

const PRIVATE_ROOM_ID = 50;

describe("resolveOpenFolderTarget", () => {
  const deps = (overrides: {
    selected?: Record<string, unknown>;
    isPrivacyFolder?: boolean;
    knowledgeId?: number | null;
  }) =>
    ({
      selectedFolderStore: {
        id: 60,
        isRoom: false,
        isAIRoom: false,
        roomType: null,
        navigationPath: [],
        ...overrides.selected,
      },
      treeFoldersStore: { isPrivacyFolder: !!overrides.isPrivacyFolder },
      aiRoomStore: { knowledgeId: overrides.knowledgeId ?? null },
    }) as never;

  it("takes the room of a folder inside a private room from the navigation path", () => {
    expect(
      resolveOpenFolderTarget(
        deps({
          selected: {
            navigationPath: [{ id: PRIVATE_ROOM_ID, isRoom: true }],
          },
          isPrivacyFolder: true,
        }),
      ),
    ).toEqual({
      folderId: 60,
      isPrivate: true,
      roomType: RoomsType.CustomRoom,
      encryptionRoomId: PRIVATE_ROOM_ID,
    });
  });

  it("is the room itself when a room is open", () => {
    expect(
      resolveOpenFolderTarget(
        deps({
          selected: { id: 70, isRoom: true, roomType: RoomsType.EditingRoom },
        }),
      ),
    ).toEqual({
      folderId: 70,
      isPrivate: false,
      roomType: RoomsType.EditingRoom,
      encryptionRoomId: 70,
    });
  });

  it("points an AI agent's uploads at its knowledge folder", () => {
    expect(
      resolveOpenFolderTarget(
        deps({
          selected: { id: 70, isRoom: true, isAIRoom: true },
          knowledgeId: 71,
        }),
      ),
    ).toMatchObject({ folderId: 71, roomType: RoomsType.AIRoom });
  });
});

describe("resolveOpenFolderTarget — the section does not decide encryption", () => {
  // The open folder as SelectedFolderStore holds it: a folder of a private room.
  const openFolder = {
    id: 60,
    isRoom: false,
    isAIRoom: false,
    roomType: null,
    private: false,
    navigationPath: [{ id: PRIVATE_ROOM_ID, isRoom: true, private: true }],
  };

  const targetUnder = (pathname: string) => {
    window.history.pushState({}, "", pathname);
    const treeFoldersStore = new TreeFoldersStore(
      ...([openFolder, {}, {}] as unknown as ConstructorParameters<
        typeof TreeFoldersStore
      >),
    );
    return resolveOpenFolderTarget({
      selectedFolderStore: openFolder,
      treeFoldersStore,
      aiRoomStore: { knowledgeId: null },
    } as never);
  };

  afterEach(() => window.history.pushState({}, "", "/"));

  it("Private room opened under Rooms: the same encrypted target as under /private", () => {
    const underRooms = targetUnder(`/rooms/shared/60/filter?folder=60`);
    const underPrivate = targetUnder(`/private/60/filter?folder=60`);

    expect(underRooms).toEqual({
      folderId: 60,
      isPrivate: true,
      roomType: RoomsType.CustomRoom,
      encryptionRoomId: PRIVATE_ROOM_ID,
    });
    expect(underPrivate).toEqual(underRooms);
  });
});
