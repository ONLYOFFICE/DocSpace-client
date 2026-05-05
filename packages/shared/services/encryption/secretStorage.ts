// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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

type UnlockRequestCallback = (
  reason: "no-cache" | "expired" | "user-mismatch",
  expectedUserId?: string,
) => Promise<IdentityKeyPair | null>;

let _unlockHandler: UnlockRequestCallback | null = null;

export function registerUnlockHandler(handler: UnlockRequestCallback): void {
  _unlockHandler = handler;
}

export function unregisterUnlockHandler(): void {
  _unlockHandler = null;
}

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

  if (!_unlockHandler) {
    if (typeof console !== "undefined") {
      console.warn(
        "[SecretStorage] No unlock handler registered. Mount EncryptionProvider before calling requireUnlock.",
      );
    }
    return null;
  }

  // Reason is always "no-cache" in practice - getCached() above wipes
  // _state on expiry/mismatch before this runs.
  const reason: "no-cache" | "expired" | "user-mismatch" = (() => {
    if (!_state) return "no-cache";
    if (_state.userId !== userId) return "user-mismatch";
    return "expired";
  })();

  const kp = await _unlockHandler(reason, userId);
  if (!kp) return null;

  if (!SecretStorage.hasUnlocked(userId)) {
    SecretStorage.cacheUnlocked(userId, kp);
  }
  return kp;
}
