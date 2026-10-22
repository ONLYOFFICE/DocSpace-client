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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getFolderPath } from "@docspace/shared/api/files";
import { FolderType, RoomsType } from "@docspace/shared/enums";

import TreeFoldersStore from "../../TreeFoldersStore";

import {
  isDropRefused,
  resolveDropTarget,
  resolveFolderTarget,
  resolveOpenFolderTarget,
  type TDropRow,
} from "../target.helpers";
import type { TUploadTarget } from "../helpers";

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

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getFolderPath: vi.fn(),
}));

const ROOMS_SECTION_ID = 2002;
const PRIVATE_ROOM_ID = 50;

const roomsListOpen: TUploadTarget = {
  folderId: ROOMS_SECTION_ID,
  isPrivate: false,
  roomType: null,
  encryptionRoomId: null,
};

const privateRoomOpen: TUploadTarget = {
  folderId: PRIVATE_ROOM_ID,
  isPrivate: true,
  roomType: RoomsType.CustomRoom,
  encryptionRoomId: PRIVATE_ROOM_ID,
};

const roomRow = (overrides: Partial<TDropRow> = {}): TDropRow => ({
  id: PRIVATE_ROOM_ID,
  isFolder: true,
  isRoom: true,
  roomType: RoomsType.CustomRoom,
  isPrivateRoom: true,
  rootFolderType: FolderType.Rooms,
  ...overrides,
});

const folderRow = (overrides: Partial<TDropRow> = {}): TDropRow => ({
  id: 60,
  isFolder: true,
  isRoom: false,
  roomType: null,
  rootFolderType: FolderType.Rooms,
  ...overrides,
});

/** A GET folder/{id}/path answer: the section root, the room, the folder. */
const pathThrough = (room: {
  id: number;
  private: boolean;
  roomType: RoomsType;
}) =>
  [
    { id: ROOMS_SECTION_ID, title: "Rooms", private: false },
    {
      id: room.id,
      title: "Room",
      roomType: room.roomType,
      private: room.private,
    },
    { id: 60, title: "Folder", private: false },
  ] as never;

beforeEach(() => {
  vi.mocked(getFolderPath).mockReset();
});

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

describe("resolveDropTarget", () => {
  it("drops without a row, or on a file row, into the open folder", async () => {
    await expect(resolveDropTarget(privateRoomOpen, null)).resolves.toEqual(
      privateRoomOpen,
    );
    await expect(
      resolveDropTarget(privateRoomOpen, {
        id: 9,
        isFolder: false,
        fileExst: ".docx",
      }),
    ).resolves.toEqual(privateRoomOpen);
  });

  it("Files dropped on a private room row", async () => {
    const target = await resolveDropTarget(roomsListOpen, roomRow());

    expect(target).toEqual(privateRoomOpen);
    expect(isDropRefused(roomsListOpen, target)).toBe(true);
    expect(getFolderPath).not.toHaveBeenCalled();
  });

  it("Ordinary room row", async () => {
    const target = await resolveDropTarget(
      roomsListOpen,
      roomRow({
        id: 70,
        roomType: RoomsType.EditingRoom,
        isPrivateRoom: false,
      }),
    );

    expect(target).toEqual({
      folderId: 70,
      isPrivate: false,
      roomType: RoomsType.EditingRoom,
      encryptionRoomId: 70,
    });
    expect(isDropRefused(roomsListOpen, target)).toBe(false);
  });

  it("Folder row inside the open private room", async () => {
    const target = await resolveDropTarget(
      privateRoomOpen,
      folderRow({ parentId: PRIVATE_ROOM_ID }),
    );

    expect(target).toEqual({ ...privateRoomOpen, folderId: 60 });
    expect(isDropRefused(privateRoomOpen, target)).toBe(false);
    expect(getFolderPath).not.toHaveBeenCalled();
  });

  it("Another room opened during the directory read", async () => {
    vi.mocked(getFolderPath).mockResolvedValue(
      pathThrough({
        id: PRIVATE_ROOM_ID,
        private: true,
        roomType: RoomsType.CustomRoom,
      }),
    );
    const ordinaryRoomOpen: TUploadTarget = {
      folderId: 70,
      isPrivate: false,
      roomType: RoomsType.EditingRoom,
      encryptionRoomId: 70,
    };

    const target = await resolveDropTarget(
      ordinaryRoomOpen,
      folderRow({ parentId: PRIVATE_ROOM_ID }),
    );

    expect(vi.mocked(getFolderPath).mock.calls).toEqual([[60]]);
    expect(target).toEqual({ ...privateRoomOpen, folderId: 60 });
    expect(isDropRefused(ordinaryRoomOpen, target)).toBe(true);
  });

  it("keeps the open AI agent's target for a folder row outside the rooms sections", async () => {
    const agentOpen: TUploadTarget = {
      folderId: 71,
      isPrivate: false,
      roomType: RoomsType.AIRoom,
      encryptionRoomId: 70,
    };

    const target = await resolveDropTarget(
      agentOpen,
      folderRow({ parentId: 72, rootFolderType: FolderType.AIAgents }),
    );

    expect(target).toEqual({ ...agentOpen, folderId: 60 });
    expect(getFolderPath).not.toHaveBeenCalled();
  });

  it("Folder of a private room listed outside it", async () => {
    vi.mocked(getFolderPath).mockResolvedValue(
      pathThrough({
        id: PRIVATE_ROOM_ID,
        private: true,
        roomType: RoomsType.CustomRoom,
      }),
    );

    const target = await resolveDropTarget(roomsListOpen, folderRow());

    expect(vi.mocked(getFolderPath).mock.calls).toEqual([[60]]);
    expect(target).toEqual({ ...privateRoomOpen, folderId: 60 });
    expect(isDropRefused(roomsListOpen, target)).toBe(true);
  });

  it("uploads into a folder of an ordinary room listed outside it", async () => {
    vi.mocked(getFolderPath).mockResolvedValue(
      pathThrough({ id: 70, private: false, roomType: RoomsType.EditingRoom }),
    );

    const target = await resolveDropTarget(
      roomsListOpen,
      folderRow({ rootFolderType: FolderType.Archive }),
    );

    expect(target).toEqual({
      folderId: 60,
      isPrivate: false,
      roomType: RoomsType.EditingRoom,
      encryptionRoomId: 70,
    });
    expect(isDropRefused(roomsListOpen, target)).toBe(false);
  });

  it("Target room cannot be determined", async () => {
    vi.mocked(getFolderPath).mockRejectedValueOnce(new Error("403"));
    await expect(resolveDropTarget(roomsListOpen, folderRow())).rejects.toThrow(
      "403",
    );

    vi.mocked(getFolderPath).mockResolvedValueOnce([
      { id: 60, title: "Folder", private: false },
    ] as never);
    await expect(
      resolveDropTarget(roomsListOpen, folderRow()),
    ).rejects.toThrow();

    expect(isDropRefused(roomsListOpen, null)).toBe(true);
  });

  it("treats a folder outside the rooms sections as not private, without a lookup", async () => {
    const target = await resolveDropTarget(
      roomsListOpen,
      folderRow({ rootFolderType: FolderType.USER }),
    );

    expect(target).toEqual({
      folderId: 60,
      isPrivate: false,
      roomType: null,
      encryptionRoomId: null,
    });
    expect(getFolderPath).not.toHaveBeenCalled();
  });
});

describe("resolveFolderTarget", () => {
  it("takes the room on the folder's path", async () => {
    vi.mocked(getFolderPath).mockResolvedValue(
      pathThrough({
        id: PRIVATE_ROOM_ID,
        private: true,
        roomType: RoomsType.CustomRoom,
      }),
    );

    await expect(
      resolveFolderTarget({ id: 60, rootFolderType: FolderType.Rooms }),
    ).resolves.toEqual({ ...privateRoomOpen, folderId: 60 });
    expect(vi.mocked(getFolderPath).mock.calls).toEqual([[60]]);
  });

  it("is not private for a folder outside the rooms sections, without a lookup", async () => {
    await expect(
      resolveFolderTarget({ id: 60, rootFolderType: FolderType.USER }),
    ).resolves.toEqual({
      folderId: 60,
      isPrivate: false,
      roomType: null,
      encryptionRoomId: null,
    });
    expect(getFolderPath).not.toHaveBeenCalled();
  });

  it("looks up a folder whose section is unknown", async () => {
    vi.mocked(getFolderPath).mockResolvedValue([
      { id: 60, title: "Folder", private: false },
    ] as never);

    await expect(resolveFolderTarget({ id: 60 })).resolves.toEqual({
      folderId: 60,
      isPrivate: false,
      roomType: null,
      encryptionRoomId: null,
    });
    expect(vi.mocked(getFolderPath).mock.calls).toEqual([[60]]);
  });

  it("rejects when the path cannot be loaded", async () => {
    vi.mocked(getFolderPath).mockRejectedValueOnce(new Error("403"));

    await expect(
      resolveFolderTarget({ id: 60, rootFolderType: FolderType.Archive }),
    ).rejects.toThrow("403");
  });
});

describe("isDropRefused", () => {
  it("refuses a private target whose room is not known", () => {
    expect(
      isDropRefused(privateRoomOpen, {
        ...privateRoomOpen,
        encryptionRoomId: null,
      }),
    ).toBe(true);
  });

  it("allows the open private room whatever type its id has", () => {
    expect(
      isDropRefused(privateRoomOpen, {
        ...privateRoomOpen,
        encryptionRoomId: String(PRIVATE_ROOM_ID),
      }),
    ).toBe(false);
  });
});
