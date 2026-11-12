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

import { makeAutoObservable } from "mobx";

/** A member granted a private room who still lacks the keys of some files. */
export type TPendingAccess = {
  roomId: number;
  userId: string;
  /** `"all"` when the re-wrap failed before telling which files it missed. */
  missingFileIds: number[] | "all";
};

const keyOf = (roomId: number, userId: string) => `${roomId}:${userId}`;

/**
 * Pending access of room members. The server's list of missing keys is the
 * source when a members list loads; what this device records in between
 * (after an invitation, an upload or a retry) holds until the next load.
 */
class PendingAccessStore {
  entries = new Map<string, TPendingAccess>();

  /** Counts the local writes, so a server list never undoes a later one. */
  private writes = 0;

  private writtenAt = new Map<string, number>();

  constructor() {
    makeAutoObservable(this);
  }

  /** The number of local writes so far; taken before a server list is asked. */
  get localWrites() {
    return this.writes;
  }

  private touch = (key: string) => {
    this.writes += 1;
    this.writtenAt.set(key, this.writes);
  };

  record = (entry: TPendingAccess) => {
    const key = keyOf(entry.roomId, entry.userId);
    this.entries.set(key, entry);
    this.touch(key);
  };

  /**
   * Takes the server's list for a room: the listed members are pending for
   * the listed files, every other member of the room is not. A record written
   * on this device after `sinceLocalWrites` was taken is left as it is.
   */
  applyServerList = (
    roomId: number,
    listed: { userId: string; fileIds: number[] }[],
    sinceLocalWrites: number,
  ) => {
    const untouched = (key: string) =>
      (this.writtenAt.get(key) ?? 0) <= sinceLocalWrites;
    const missing = new Map<string, number[]>();
    for (const { userId, fileIds } of listed) {
      if (fileIds.length > 0) missing.set(keyOf(roomId, userId), fileIds);
    }
    for (const [key, entry] of Array.from(this.entries)) {
      if (entry.roomId === roomId && !missing.has(key) && untouched(key)) {
        this.entries.delete(key);
      }
    }
    for (const { userId } of listed) {
      const key = keyOf(roomId, userId);
      const fileIds = missing.get(key);
      if (fileIds && untouched(key)) {
        this.entries.set(key, { roomId, userId, missingFileIds: fileIds });
      }
    }
  };

  /** Adds files to what the member misses; a record of every file stays so. */
  addMissingFiles = (roomId: number, userId: string, fileIds: number[]) => {
    const current = this.get(roomId, userId)?.missingFileIds ?? [];
    if (current === "all") return;
    this.record({
      roomId,
      userId,
      missingFileIds: [...new Set([...current, ...fileIds])],
    });
  };

  clear = (roomId: number, userId: string) => {
    const key = keyOf(roomId, userId);
    this.entries.delete(key);
    this.touch(key);
  };

  get = (roomId: number, userId: string): TPendingAccess | undefined =>
    this.entries.get(keyOf(roomId, userId));

  /** The records of one member, one per room. */
  listForUser = (userId: string): TPendingAccess[] =>
    [...this.entries.values()].filter((entry) => entry.userId === userId);
}

export const pendingAccessStore = new PendingAccessStore();
