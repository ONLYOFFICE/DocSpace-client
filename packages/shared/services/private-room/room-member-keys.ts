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

import { getRoomEncryptionKeys } from "../../api/privacy";
import type { RoomMemberPublicKey } from "../encryption/room-file-access";

export async function loadRoomMemberKeys(
  roomId: number | string,
): Promise<{
  keyByUserId: Map<string, string>;
  keysByUserId: Map<string, RoomMemberPublicKey[]>;
  list: RoomMemberPublicKey[];
}> {
  const keys = await getRoomEncryptionKeys(roomId);
  const keyByUserId = new Map<string, string>();
  const keysByUserId = new Map<string, RoomMemberPublicKey[]>();
  const list: RoomMemberPublicKey[] = [];
  if (Array.isArray(keys)) {
    for (const k of keys) {
      if (!k?.userId || !k?.publicKey) continue;
      const id = String(k.userId);
      const entry: RoomMemberPublicKey = {
        userId: id,
        publicKey: k.publicKey,
        publicKeyId: k.id,
      };
      keyByUserId.set(id, k.publicKey);
      const bucket = keysByUserId.get(id);
      if (bucket) bucket.push(entry);
      else keysByUserId.set(id, [entry]);
      list.push(entry);
    }
  }
  return { keyByUserId, keysByUserId, list };
}

export async function loadRoomMemberKeysSafe(
  roomId: number | string | null | undefined,
): Promise<RoomMemberPublicKey[]> {
  if (!roomId && roomId !== 0) return [];
  try {
    const { list } = await loadRoomMemberKeys(roomId);
    return list;
  } catch {
    return [];
  }
}
