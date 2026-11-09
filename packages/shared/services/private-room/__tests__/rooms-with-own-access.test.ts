// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../api/rooms", () => ({
  getRooms: vi.fn(),
}));
vi.mock("../../../api/files", () => ({
  getFolder: vi.fn(),
  getFileEncryptionAccess: vi.fn(),
}));

import { getFileEncryptionAccess, getFolder } from "../../../api/files";
import { getRooms } from "../../../api/rooms";
import type RoomsFilter from "../../../api/rooms/filter";
import { RoomPrivacyFilter, RoomSearchArea } from "../../../enums";
import { findRoomsWithOwnAccess } from "../rooms-with-own-access";

const USER = "user-1";

type TFolderSeed = {
  files?: { id: number; encrypted?: boolean }[];
  folders?: number[];
};

const seedRooms = (active: [number, string][], archived: [number, string][]) =>
  vi.mocked(getRooms).mockImplementation(async (filter: RoomsFilter) => {
    const rooms =
      filter.searchArea === RoomSearchArea.Archive ? archived : active;
    return {
      folders: rooms.map(([id, title]) => ({ id, title })),
      total: rooms.length,
    } as never;
  });

const seedFolders = (folders: Record<number, TFolderSeed>) =>
  vi.mocked(getFolder).mockImplementation(async (id) => {
    const seed = folders[Number(id)] ?? {};
    const files = seed.files ?? [];
    const subfolders = (seed.folders ?? []).map((folderId) => ({ id: folderId }));
    return {
      files,
      folders: subfolders,
      total: files.length + subfolders.length,
    } as never;
  });

/** File ids that carry an access entry of USER. */
const seedAccess = (ownEntries: number[]) =>
  vi.mocked(getFileEncryptionAccess).mockImplementation(async (id) => ({
    userKeys: [],
    fileKeys: ownEntries.includes(Number(id))
      ? [{ userId: USER, publicKeyId: "k", privateKeyEnc: "w" }]
      : [],
  }) as never);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("findRoomsWithOwnAccess", () => {
  it("Affected rooms listed: active and archived rooms with an entry of the user", async () => {
    seedRooms(
      [
        [10, "Alpha"],
        [11, "Beta"],
      ],
      [[12, "Gamma"]],
    );
    seedFolders({
      10: { files: [{ id: 100, encrypted: true }] },
      11: { files: [{ id: 110, encrypted: true }] },
      12: { files: [{ id: 120, encrypted: true }] },
    });
    seedAccess([100, 120]);

    expect(await findRoomsWithOwnAccess(USER)).toEqual([
      { id: 10, title: "Alpha" },
      { id: 12, title: "Gamma" },
    ]);
    for (const [filter] of vi.mocked(getRooms).mock.calls) {
      expect(filter.privacyFilter).toBe(RoomPrivacyFilter.Private);
    }
  });

  it("names a room listed in both areas once", async () => {
    seedRooms([[10, "Alpha"]], [[10, "Alpha"]]);
    seedFolders({ 10: { files: [{ id: 100, encrypted: true }] } });
    seedAccess([100]);

    expect(await findRoomsWithOwnAccess(USER)).toEqual([
      { id: 10, title: "Alpha" },
    ]);
  });

  it("stops reading a room at its first entry", async () => {
    seedRooms([[10, "Alpha"]], []);
    seedFolders({
      10: {
        files: [
          { id: 100, encrypted: true },
          { id: 101, encrypted: true },
        ],
        folders: [20],
      },
    });
    seedAccess([100, 101]);

    await findRoomsWithOwnAccess(USER);

    expect(getFileEncryptionAccess).toHaveBeenCalledTimes(1);
    expect(getFolder).toHaveBeenCalledTimes(1);
  });

  it("finds an entry in a subfolder and skips files that are not encrypted", async () => {
    seedRooms([[10, "Alpha"]], []);
    seedFolders({
      10: { files: [{ id: 100, encrypted: false }], folders: [20] },
      20: { files: [{ id: 200, encrypted: true }] },
    });
    seedAccess([200]);

    expect(await findRoomsWithOwnAccess(USER)).toEqual([
      { id: 10, title: "Alpha" },
    ]);
    expect(vi.mocked(getFileEncryptionAccess).mock.calls).toEqual([[200]]);
  });

  it("No affected rooms: a user left out of every file", async () => {
    seedRooms([[10, "Alpha"]], []);
    seedFolders({ 10: { files: [{ id: 100, encrypted: true }] } });
    seedAccess([]);

    expect(await findRoomsWithOwnAccess(USER)).toEqual([]);
  });
});
