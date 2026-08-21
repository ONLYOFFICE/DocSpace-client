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

import { getFilePublicKeys, getRoomEncryptionKeys } from "../../api/privacy";
import type { TEncryptionKeyPair } from "../../api/privacy/types";
import type { RoomMemberPublicKey } from "../encryption/room-file-access";

const toMemberKeys = (
  keys: TEncryptionKeyPair[] | undefined,
): RoomMemberPublicKey[] => {
  const list: RoomMemberPublicKey[] = [];
  if (!Array.isArray(keys)) return list;
  for (const k of keys) {
    if (!k?.userId || !k?.publicKey) continue;
    list.push({
      userId: String(k.userId),
      publicKey: k.publicKey,
      publicKeyId: k.id,
    });
  }
  return list;
};

export async function loadRoomMemberKeys(
  roomId: number | string,
): Promise<{
  keyByUserId: Map<string, string>;
  keysByUserId: Map<string, RoomMemberPublicKey[]>;
  list: RoomMemberPublicKey[];
}> {
  const list = toMemberKeys(await getRoomEncryptionKeys(roomId));
  const keyByUserId = new Map<string, string>();
  const keysByUserId = new Map<string, RoomMemberPublicKey[]>();
  for (const entry of list) {
    keyByUserId.set(entry.userId, entry.publicKey);
    const bucket = keysByUserId.get(entry.userId);
    if (bucket) bucket.push(entry);
    else keysByUserId.set(entry.userId, [entry]);
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

/**
 * Public keys usable as sender candidates when unwrapping a file's DEK.
 *
 * The wrap names its sender, so unwrap needs that user's public key. The
 * file-scoped source lists everyone holding an entry on the file and needs no
 * room id, which the room roster does — and callers do not always have a
 * correct one (a file in a subfolder knows only its folder id). Both sources
 * are merged so a known room id still contributes its members.
 */
export async function loadFileSenderKeysSafe(
  fileId: number | string,
  roomId?: number | string | null,
): Promise<RoomMemberPublicKey[]> {
  const [fileKeys, roomKeys] = await Promise.all([
    getFilePublicKeys(fileId)
      .then(toMemberKeys)
      .catch(() => [] as RoomMemberPublicKey[]),
    loadRoomMemberKeysSafe(roomId),
  ]);

  const merged: RoomMemberPublicKey[] = [];
  const seen = new Set<string>();
  for (const entry of [...fileKeys, ...roomKeys]) {
    const dedupeKey = `${entry.userId}:${entry.publicKey}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    merged.push(entry);
  }
  return merged;
}
