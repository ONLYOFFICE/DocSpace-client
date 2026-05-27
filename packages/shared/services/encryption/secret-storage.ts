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

// In-memory cache of the unlocked X25519 keypair for the current user.
// Single-slot, per-page-session. Lives in main thread (no Worker isolation).

import { SESSION_CACHE_DURATION_MS, type IdentityKeyPair } from "./types";
import { zeroBuffer } from "./utils";

type CacheEntry = {
  userId: string;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  lastUsedAt: number;
};

let _state: CacheEntry | null = null;

/**
 * Handler invoked when `requireUnlock` finds no cached identity. `reason`
 * is currently always "no-cache" because `getCached` clears expired /
 * user-mismatch state before this runs; kept as a sum-type for future
 * out-of-band wakeup paths but UI-facing copy should not assume it varies.
 */
type UnlockRequestCallback = (
  reason: "no-cache",
  expectedUserId?: string,
) => Promise<IdentityKeyPair | null>;

let _unlockHandler: UnlockRequestCallback | null = null;

export function registerUnlockHandler(handler: UnlockRequestCallback): void {
  _unlockHandler = handler;
}

export function unregisterUnlockHandler(): void {
  _unlockHandler = null;
}

const pendingUnlocks = new Map<
  string,
  Promise<IdentityKeyPair | null>
>();

function isExpired(entry: CacheEntry): boolean {
  return Date.now() - entry.lastUsedAt > SESSION_CACHE_DURATION_MS;
}

function bump(entry: CacheEntry): void {
  entry.lastUsedAt = Date.now();
}

function clearState(): void {
  if (_state) {
    zeroBuffer(_state.privateKey);
    zeroBuffer(_state.publicKey);
    _state = null;
  }
}

export const SecretStorage = {
  cacheUnlocked(userId: string, kp: IdentityKeyPair): void {
    if (!userId) {
      throw new Error("SecretStorage.cacheUnlocked: userId is required");
    }
    clearState();
    _state = {
      userId,
      publicKey: new Uint8Array(kp.publicKey),
      privateKey: new Uint8Array(kp.privateKey),
      lastUsedAt: Date.now(),
    };
  },

  /** Side-effect: any expiry / userId-mismatch wipes the slot before returning null. */
  getCached(userId: string): IdentityKeyPair | null {
    if (!_state) return null;
    if (_state.userId !== userId) {
      clearState();
      return null;
    }
    if (isExpired(_state)) {
      clearState();
      return null;
    }
    bump(_state);
    return {
      publicKey: _state.publicKey,
      privateKey: _state.privateKey,
    };
  },

  hasUnlocked(userId: string): boolean {
    return SecretStorage.getCached(userId) !== null;
  },

  lock(): void {
    clearState();
  },
};

export async function requireUnlock(
  userId: string,
): Promise<IdentityKeyPair | null> {
  if (!userId) {
    throw new Error("requireUnlock: userId is required");
  }

  const cached = SecretStorage.getCached(userId);
  if (cached) return cached;

  const inFlight = pendingUnlocks.get(userId);
  if (inFlight) return inFlight;

  if (!_unlockHandler) {
    if (typeof console !== "undefined") {
      // biome-ignore lint/suspicious/noConsole: developer hint when EncryptionProvider is missing; production build strips console.
      console.warn(
        "[SecretStorage] No unlock handler registered. Mount EncryptionProvider before calling requireUnlock.",
      );
    }
    return null;
  }

  // `getCached` above wipes _state on expiry / user-mismatch before this
  // runs, so reason is always "no-cache" in practice.
  const handler = _unlockHandler;
  const promise = (async () => {
    try {
      const kp = await handler("no-cache", userId);
      if (!kp) return null;
      if (!SecretStorage.hasUnlocked(userId)) {
        SecretStorage.cacheUnlocked(userId, kp);
      }
      return kp;
    } finally {
      pendingUnlocks.delete(userId);
    }
  })();

  pendingUnlocks.set(userId, promise);
  return promise;
}
