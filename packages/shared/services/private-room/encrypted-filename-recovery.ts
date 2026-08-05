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

import { getFileEncryptionAccess } from "../../api/files";
import { wipeDek } from "../encryption/file-keys";
import {
  getCachedEncryptedFilename,
  rememberEncryptedFilename,
} from "../encryption/filename-cache";
import {
  unwrapDekForCurrentUser,
  type RoomMemberPublicKey,
} from "../encryption/room-file-access";
import { reportPotentialGhostState } from "../encryption/ghost-state-notifier";
import {
  decryptFileNameRaw,
  parseDSE3Header,
} from "../encryption/streaming-encryption";
import type { IdentityKeyPair } from "../encryption/types";
import { loadRoomMemberKeysSafe } from "./room-member-keys";

export type RecoveryCandidate = {
  id: number;
  viewUrl: string;
};

const HEADER_FETCH_BYTES = 4096;
const MAX_PARALLEL = 5;

// Concurrent recovery pools (per-page auto-trigger from setFiles + explicit
// awaited passes, e.g. client-side search warm-up) must not Range-fetch the
// same file twice; awaiting callers also need to join an in-flight recovery.
const inFlight = new Map<number, Promise<void>>();

async function fetchHeaderBytes(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url, {
      headers: { Range: `bytes=0-${HEADER_FETCH_BYTES - 1}` },
    });
    if (!response.ok) return null;
    const buf = await response.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

function recoverOne(
  file: RecoveryCandidate,
  userId: string,
  identity: IdentityKeyPair,
  roomMemberKeys: RoomMemberPublicKey[],
): Promise<void> {
  if (getCachedEncryptedFilename(file.id)) return Promise.resolve();

  const existing = inFlight.get(file.id);
  if (existing) return existing;

  const task = recoverOneUncached(file, userId, identity, roomMemberKeys)
    // recoverOneUncached swallows its own errors, so chaining here cannot
    // surface an unhandled rejection to joined callers.
    .finally(() => inFlight.delete(file.id));
  inFlight.set(file.id, task);
  return task;
}

async function recoverOneUncached(
  file: RecoveryCandidate,
  userId: string,
  identity: IdentityKeyPair,
  roomMemberKeys: RoomMemberPublicKey[],
): Promise<void> {
  const headerBytes = await fetchHeaderBytes(file.viewUrl);
  if (!headerBytes) return;

  let header: ReturnType<typeof parseDSE3Header>;
  try {
    header = parseDSE3Header(headerBytes);
  } catch {
    return;
  }
  if (!header.encryptedName) return;

  let dek: Uint8Array | null = null;
  try {
    const info = await getFileEncryptionAccess(file.id);
    if (!info?.fileKeys || info.fileKeys.length === 0) return;
    dek = await unwrapDekForCurrentUser({
      fileKeys: info.fileKeys,
      roomMemberKeys,
      currentUserId: userId,
      currentIdentity: identity,
      fileId: file.id,
    });
    const name = await decryptFileNameRaw(
      header.encryptedName,
      dek,
      header.fileNonce,
    );
    if (name) rememberEncryptedFilename(file.id, name);
  } catch (error) {
    reportPotentialGhostState(error);
  } finally {
    if (dek) wipeDek(dek);
  }
}

export async function ensureDecryptedFilename(
  file: {
    id: number;
    viewUrl?: string | null;
    encrypted?: boolean | null;
  },
  userId: string,
  identity: IdentityKeyPair,
  roomId: number | string | null | undefined,
): Promise<void> {
  if (!file?.encrypted || !file.id || !file.viewUrl) return;
  if (getCachedEncryptedFilename(file.id)) return;
  await recoverEncryptedFilenames(
    [{ id: file.id, viewUrl: file.viewUrl }],
    userId,
    identity,
    roomId,
  );
}

export async function recoverEncryptedFilenames(
  candidates: RecoveryCandidate[],
  userId: string,
  identity: IdentityKeyPair,
  roomId: number | string | null | undefined,
): Promise<void> {
  if (candidates.length === 0) return;
  if (roomId === null || roomId === undefined) return;

  const roomMemberKeys = await loadRoomMemberKeysSafe(roomId);
  if (roomMemberKeys.length === 0) return;

  const queue = candidates.slice();
  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(MAX_PARALLEL, queue.length); i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const next = queue.shift();
          if (!next) return;
          await recoverOne(next, userId, identity, roomMemberKeys);
        }
      })(),
    );
  }
  await Promise.all(workers);
}
