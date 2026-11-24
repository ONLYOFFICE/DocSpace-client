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

import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/api/files", () => ({
  getFilesSettings: vi.fn(async () => ({})),
  getFolder: vi.fn(),
  getFolderPath: vi.fn(),
}));
vi.mock("@/api/settings", () => ({ getSettings: vi.fn(async () => ({})) }));
vi.mock("@/api/people", () => ({ getSelf: vi.fn(async () => undefined) }));

vi.mock("./rooms/[roomId]/page.client", () => ({ default: () => null }));
vi.mock("./archive/[roomId]/page.client", () => ({ default: () => null }));

import { notFound, redirect } from "next/navigation";

import { getFolder, getFolderPath } from "@/api/files";

import RoomFiles from "./rooms/[roomId]/page";
import ArchiveRoomFiles from "./archive/[roomId]/page";

const ROOMS_SECTION = { id: 2, title: "Rooms" };
const PRIVATE_ROOM = { id: 7001, title: "Private", roomType: 5, private: true };
const DRAFTS = { id: 7020, title: "Drafts", private: false };

const open = (page: typeof RoomFiles, roomId: string, sp: object) =>
  page({
    params: Promise.resolve({ roomId }),
    searchParams: Promise.resolve(sp as Record<string, string>),
  });

describe("generic room pages of a private room", () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear();
    vi.mocked(notFound).mockClear();
    vi.mocked(getFolder).mockReset();
    vi.mocked(getFolderPath).mockReset();
  });

  test("Private room opened by its generic address", async () => {
    vi.mocked(getFolderPath).mockResolvedValue([
      ROOMS_SECTION,
      PRIVATE_ROOM,
    ] as never);

    await expect(
      open(RoomFiles, "7001", { privateRooms: "true", theme: "Base" }),
    ).rejects.toThrow("NEXT_REDIRECT");
    await expect(
      open(ArchiveRoomFiles, "7001", { privateRooms: "true" }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(vi.mocked(redirect).mock.calls).toEqual([
      ["/private/7001?privateRooms=true&theme=Base"],
      ["/private/7001?privateRooms=true"],
    ]);
    expect(getFolder).not.toHaveBeenCalled();
  });

  test("opens a folder of a private room on the room's private page", async () => {
    vi.mocked(getFolderPath).mockResolvedValue([
      ROOMS_SECTION,
      PRIVATE_ROOM,
      DRAFTS,
    ] as never);

    await expect(
      open(RoomFiles, "7001", { folder: "7020", privateRooms: "true" }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(getFolderPath).toHaveBeenCalledWith("7020");
    expect(redirect).toHaveBeenCalledWith(
      "/private/7001?folder=7020&privateRooms=true",
    );
    expect(getFolder).not.toHaveBeenCalled();
  });

  test("Folder named with a search text", async () => {
    vi.mocked(getFolderPath).mockResolvedValue([
      ROOMS_SECTION,
      PRIVATE_ROOM,
      DRAFTS,
    ] as never);

    await expect(
      open(ArchiveRoomFiles, "7001", { folder: "7020", search: "plan" }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(getFolderPath).toHaveBeenCalledTimes(1);
    expect(getFolder).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/private/7001?folder=7020");
  });

  test("Room of the folder cannot be read", async () => {
    vi.mocked(getFolderPath).mockRejectedValue(new Error("403"));

    await expect(open(RoomFiles, "7001", { folder: "7020" })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );

    expect(getFolder).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  test("renders an ordinary room in place", async () => {
    const room = { id: 50, title: "Shared", roomType: 6, private: false };
    vi.mocked(getFolderPath).mockResolvedValue([ROOMS_SECTION, room] as never);
    vi.mocked(getFolder).mockResolvedValue({
      folders: [],
      files: [],
      total: 0,
      current: room,
      pathParts: [ROOMS_SECTION, room],
    } as never);

    expect(await open(RoomFiles, "50", { search: "plan" })).not.toBeNull();
    expect(redirect).not.toHaveBeenCalled();
    expect(vi.mocked(getFolder).mock.calls[0][1]).toMatchObject({
      search: "plan",
    });
  });
});
