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

import { beforeEach, expect, test, vi } from "vitest";

import { FolderType, RoomsType } from "@docspace/shared/enums";

const paths = vi.hoisted(() => ({ room: {} as Record<string, unknown> }));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
}));
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn((address: string) => {
    throw new Error(`NEXT_REDIRECT ${address}`);
  }),
}));

vi.mock("@/api/files", () => ({
  getFilesSettings: vi.fn(async () => ({})),
  getFolderPath: vi.fn(async () => [
    { id: 2, title: "Rooms", rootFolderType: FolderType.Rooms },
    paths.room,
  ]),
  getFolder: vi.fn(async () => ({
    current: { id: 10, rootFolderType: FolderType.Rooms },
    folders: [],
    files: [],
    pathParts: [],
    total: 0,
  })),
}));
vi.mock("@/api/settings", () => ({ getSettings: vi.fn(async () => ({})) }));
vi.mock("@/api/people", () => ({ getSelf: vi.fn(async () => ({ id: "me" })) }));

vi.mock("./page.client", () => ({ default: () => null }));

import { getFolder } from "@/api/files";

import PrivateRoomFiles from "./page";

const room = (over: Record<string, unknown>) => ({
  id: 10,
  title: "Vault",
  roomType: RoomsType.CustomRoom,
  private: true,
  rootFolderType: FolderType.Rooms,
  ...over,
});

beforeEach(() => {
  paths.room = room({});
});

test("Private room opened: a search parameter reaches neither the folder request nor the page", async () => {
  const element = await PrivateRoomFiles({
    params: Promise.resolve({ roomId: "10" }),
    searchParams: Promise.resolve({
      privateRooms: "true",
      search: "salaries",
      sortBy: "Title",
    }),
  });

  const [folderId, filter] = vi.mocked(getFolder).mock.calls[0];
  expect(folderId).toBe("10");
  expect(filter.search ?? "").toBe("");
  expect(filter.sortBy).toBe("Title");
  expect(element?.props.filesFilter).toContain("sortBy=Title");
  expect(element?.props.filesFilter).not.toContain("salaries");
});

test("Archived private room opened", async () => {
  paths.room = room({ rootFolderType: FolderType.Archive });

  const element = await PrivateRoomFiles({
    params: Promise.resolve({ roomId: "10" }),
    searchParams: Promise.resolve({ privateRooms: "true" }),
  });

  expect(element?.props.isArchive).toBe(true);
  expect(element?.props.roomId).toBe("10");
});

test("Non-private room at a private address", async () => {
  paths.room = room({ private: false });

  await expect(
    PrivateRoomFiles({
      params: Promise.resolve({ roomId: "10" }),
      searchParams: Promise.resolve({ privateRooms: "true" }),
    }),
  ).rejects.toThrow("NEXT_REDIRECT /rooms/10?privateRooms=true");
});

test("opens nothing for a folder outside the rooms", async () => {
  paths.room = { id: 10, title: "Docs", rootFolderType: FolderType.USER };

  await expect(
    PrivateRoomFiles({
      params: Promise.resolve({ roomId: "10" }),
      searchParams: Promise.resolve({ privateRooms: "true" }),
    }),
  ).rejects.toThrow("NEXT_NOT_FOUND");
});
