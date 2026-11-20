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

// Spec: private-rooms/key-management, "A lock reaches every tab of the user"

/** Kept from the SDK channel, so pages of an older build still hear a lock. */
export const LOCK_BROADCAST_PREFIX = "docspace-encryption-lock";

export function getLockBroadcastChannelName(userId: string): string {
  return `${LOCK_BROADCAST_PREFIX}:${userId}`;
}

export type LockBroadcastMessage = {
  type: "lock";
  sessionId: string;
  /** The key list changed: the receiver reads it again. */
  keysChanged?: boolean;
};

export type LockBroadcastEvent = { keysChanged: boolean };

/** One id per page, so a page skips the locks it sent itself. */
export const LOCK_BROADCAST_SESSION_ID =
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const openChannel = (userId: string): BroadcastChannel | null => {
  if (!userId || typeof BroadcastChannel === "undefined") return null;
  try {
    return new BroadcastChannel(getLockBroadcastChannelName(userId));
  } catch {
    return null;
  }
};

/** Tells the user's other pages in this browser to lock the identity. */
export function broadcastLock(
  userId: string,
  { keysChanged = false }: { keysChanged?: boolean } = {},
): void {
  const channel = openChannel(userId);
  if (!channel) return;
  const message: LockBroadcastMessage = {
    type: "lock",
    sessionId: LOCK_BROADCAST_SESSION_ID,
    keysChanged,
  };
  try {
    channel.postMessage(message);
  } catch {
    // A page that cannot post leaves the others to their own locks.
  } finally {
    channel.close();
  }
}

/**
 * Calls the handler for each lock another page of the user sends; returns
 * the unsubscribe function.
 */
export function subscribeLockBroadcast(
  userId: string,
  handler: (event: LockBroadcastEvent) => void,
): () => void {
  const channel = openChannel(userId);
  if (!channel) return () => {};
  channel.onmessage = (event: MessageEvent<Partial<LockBroadcastMessage>>) => {
    const data = event.data;
    if (data?.type !== "lock") return;
    if (data.sessionId === LOCK_BROADCAST_SESSION_ID) return;
    handler({ keysChanged: data.keysChanged === true });
  };
  return () => {
    channel.onmessage = null;
    channel.close();
  };
}
