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

/** Pending access recorded on this device for the page session. */
class PendingAccessStore {
  entries = new Map<string, TPendingAccess>();

  constructor() {
    makeAutoObservable(this);
  }

  record = (entry: TPendingAccess) => {
    this.entries.set(keyOf(entry.roomId, entry.userId), entry);
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
    this.entries.delete(keyOf(roomId, userId));
  };

  get = (roomId: number, userId: string): TPendingAccess | undefined =>
    this.entries.get(keyOf(roomId, userId));

  /** The records of one member, one per room. */
  listForUser = (userId: string): TPendingAccess[] =>
    [...this.entries.values()].filter((entry) => entry.userId === userId);
}

export const pendingAccessStore = new PendingAccessStore();
