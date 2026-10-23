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

import { getFileEncryptionAccess, getFolder } from "../../api/files";
import FilesFilter from "../../api/files/filter";
import { getRooms } from "../../api/rooms";
import RoomsFilter from "../../api/rooms/filter";
import { RoomPrivacyFilter, RoomSearchArea } from "../../enums";

const PAGE_SIZE = 100;
/** Rooms read at the same time; each read is a listing and a few access reads. */
const ROOM_CONCURRENCY = 4;

export type TRoomRef = { id: number; title: string };

/** Every private room the user can see, active and archived, each once. */
async function listPrivateRooms(signal?: AbortSignal): Promise<TRoomRef[]> {
  const rooms = new Map<number, TRoomRef>();
  for (const searchArea of [RoomSearchArea.Active, RoomSearchArea.Archive]) {
    for (let page = 0; ; page += 1) {
      const filter = RoomsFilter.getDefault(undefined, searchArea);
      filter.privacyFilter = RoomPrivacyFilter.Private;
      filter.page = page;
      filter.pageCount = PAGE_SIZE;

      const data = await getRooms(filter, signal);
      for (const room of data.folders) {
        rooms.set(room.id, { id: room.id, title: room.title });
      }
      const loaded = page * PAGE_SIZE + data.folders.length;
      if (data.folders.length === 0 || loaded >= data.total) break;
    }
  }
  return [...rooms.values()];
}

/**
 * Whether any encrypted file under the folder carries an access entry of the
 * user; stops at the first one.
 */
async function holdsOwnEntry(
  folderId: number,
  userId: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const subfolders: number[] = [];
  for (let page = 0; ; page += 1) {
    const filter = FilesFilter.getDefault();
    filter.page = page;
    filter.pageCount = PAGE_SIZE;

    const data = await getFolder(folderId, filter, signal);
    for (const file of data.files) {
      if (!file.encrypted) continue;
      signal?.throwIfAborted();
      const access = await getFileEncryptionAccess(file.id);
      if (access?.fileKeys?.some((k) => String(k.userId) === userId)) {
        return true;
      }
    }
    for (const folder of data.folders) subfolders.push(folder.id);

    const count = data.files.length + data.folders.length;
    const loaded = page * PAGE_SIZE + count;
    if (count === 0 || loaded >= data.total) break;
  }

  for (const id of subfolders) {
    if (await holdsOwnEntry(id, userId, signal)) return true;
  }
  return false;
}

/**
 * The private rooms in which the user holds at least one file access entry,
 * in the order the room list returns them. The server has no per-room read of
 * those entries, so each room is read file by file until the first entry.
 * Spec: private-rooms/key-management, "Delete a key".
 */
export async function findRoomsWithOwnAccess(
  userId: string,
  signal?: AbortSignal,
): Promise<TRoomRef[]> {
  const rooms = await listPrivateRooms(signal);
  const affected = new Array<boolean>(rooms.length).fill(false);

  let next = 0;
  const worker = async () => {
    while (next < rooms.length) {
      const index = next;
      next += 1;
      affected[index] = await holdsOwnEntry(rooms[index].id, userId, signal);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(ROOM_CONCURRENCY, rooms.length) }, worker),
  );

  return rooms.filter((_, index) => affected[index]);
}
