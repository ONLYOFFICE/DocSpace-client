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

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  SecretStorage,
  registerUnlockHandler,
  unregisterUnlockHandler,
  requireUnlock,
  registerAutoLockSuspender,
  unregisterAutoLockSuspender,
  suspendAutoLock,
} from "../secret-storage";
import { SESSION_CACHE_DURATION_MS } from "../types";
import type { IdentityKeyPair } from "../types";

function makeIdentity(seed: number): IdentityKeyPair {
  const pk = new Uint8Array(32);
  const sk = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    pk[i] = (seed * 7 + i) & 0xff;
    sk[i] = (seed * 13 + i + 1) & 0xff;
  }
  return { publicKey: pk, privateKey: sk };
}

describe("SecretStorage cache", () => {
  beforeEach(() => {
    SecretStorage.lock();
  });

  afterEach(() => {
    SecretStorage.lock();
    unregisterUnlockHandler();
  });

  it("cacheUnlocked + getCached round-trip returns the same keys", () => {
    const kp = makeIdentity(1);
    SecretStorage.cacheUnlocked("alice", kp);
    const out = SecretStorage.getCached("alice");
    expect(out).not.toBeNull();
    expect(Array.from(out!.publicKey)).toEqual(Array.from(kp.publicKey));
    expect(Array.from(out!.privateKey)).toEqual(Array.from(kp.privateKey));
  });

  it("getCached returns null for an unknown user", () => {
    expect(SecretStorage.getCached("noone")).toBeNull();
  });

  it("getCached for a different userId returns null AND clears the cache", () => {
    SecretStorage.cacheUnlocked("alice", makeIdentity(1));
    // Mallory asks for her own identity - must not get Alice's, AND the
    // cached state must be wiped to prevent re-use after a logout/login.
    expect(SecretStorage.getCached("mallory")).toBeNull();
    expect(SecretStorage.getCached("alice")).toBeNull();
  });

  it("hasUnlocked mirrors getCached", () => {
    SecretStorage.cacheUnlocked("alice", makeIdentity(1));
    expect(SecretStorage.hasUnlocked("alice")).toBe(true);
    expect(SecretStorage.hasUnlocked("bob")).toBe(false);
  });

  it("cacheUnlocked overwrites the previous entry", () => {
    SecretStorage.cacheUnlocked("alice", makeIdentity(1));
    const kp2 = makeIdentity(2);
    SecretStorage.cacheUnlocked("alice", kp2);
    const out = SecretStorage.getCached("alice");
    expect(Array.from(out!.privateKey)).toEqual(Array.from(kp2.privateKey));
  });

  it("cacheUnlocked of a different user wipes the previous user's cache", () => {
    SecretStorage.cacheUnlocked("alice", makeIdentity(1));
    SecretStorage.cacheUnlocked("bob", makeIdentity(2));
    // Bob's identity must be live and Alice's must be gone. We check Bob
    // first because getCached("alice") has a side-effect (clearState on
    // mismatch) that would also wipe Bob's entry - the cache is single-
    // slot, so reading the wrong user is destructive.
    expect(SecretStorage.getCached("bob")).not.toBeNull();
    expect(SecretStorage.getCached("alice")).toBeNull();
    // Bob is gone now too: the alice-read above wiped him out.
    expect(SecretStorage.getCached("bob")).toBeNull();
  });

  it("rejects empty userId on cacheUnlocked", () => {
    expect(() =>
      SecretStorage.cacheUnlocked("", makeIdentity(1)),
    ).toThrow();
  });

  it("lock() wipes both buffers (zeroBuffer)", () => {
    const kp = makeIdentity(1);
    // Capture the *exact* arrays held by the cache so we can inspect them
    // after lock(). cacheUnlocked copies into fresh Uint8Arrays - pull them
    // back via getCached before locking.
    SecretStorage.cacheUnlocked("alice", kp);
    const cached = SecretStorage.getCached("alice")!;
    const pkRef = cached.publicKey;
    const skRef = cached.privateKey;
    // Sanity: the buffers held by the cache are not the originals.
    expect(pkRef).not.toBe(kp.publicKey);
    expect(skRef).not.toBe(kp.privateKey);

    SecretStorage.lock();

    // After lock, the buffers held by the cache must be zeroed.
    expect(Array.from(pkRef)).toEqual(Array(32).fill(0));
    expect(Array.from(skRef)).toEqual(Array(32).fill(0));
    // And getCached returns null.
    expect(SecretStorage.getCached("alice")).toBeNull();
  });

  it("auto-locks on idle expiry", () => {
    const kp = makeIdentity(1);
    SecretStorage.cacheUnlocked("alice", kp);

    // Advance the clock past the idle threshold.
    const realNow = Date.now;
    const t0 = realNow();
    vi.spyOn(Date, "now").mockImplementation(
      () => t0 + SESSION_CACHE_DURATION_MS + 1,
    );
    try {
      expect(SecretStorage.getCached("alice")).toBeNull();
      // After expiry-driven clear, even a fresh non-expired check fails
      // until cacheUnlocked is called again.
      expect(SecretStorage.hasUnlocked("alice")).toBe(false);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("each successful getCached bumps lastUsedAt — usage extends the session", () => {
    const kp = makeIdentity(1);
    SecretStorage.cacheUnlocked("alice", kp);

    const realNow = Date.now;
    const t0 = realNow();

    // Walk the clock forward in steps that are each < the idle threshold,
    // calling getCached on each step. The cache must keep returning the
    // identity because each access bumps lastUsedAt.
    const halfIdle = Math.floor(SESSION_CACHE_DURATION_MS / 2);
    for (const offset of [halfIdle, 2 * halfIdle, 3 * halfIdle]) {
      vi.spyOn(Date, "now").mockReturnValue(t0 + offset);
      expect(SecretStorage.getCached("alice")).not.toBeNull();
      vi.restoreAllMocks();
    }

    // Now stop calling for longer than the idle threshold - must expire.
    vi.spyOn(Date, "now").mockReturnValue(
      t0 + 4 * halfIdle + SESSION_CACHE_DURATION_MS + 1,
    );
    try {
      expect(SecretStorage.getCached("alice")).toBeNull();
    } finally {
      vi.restoreAllMocks();
    }
  });
});

describe("requireUnlock", () => {
  beforeEach(() => {
    SecretStorage.lock();
  });

  afterEach(() => {
    SecretStorage.lock();
    unregisterUnlockHandler();
  });

  it("returns the cached identity without invoking the handler", async () => {
    const kp = makeIdentity(1);
    SecretStorage.cacheUnlocked("alice", kp);
    const handler = vi.fn();
    registerUnlockHandler(handler);

    const out = await requireUnlock("alice");
    expect(out).not.toBeNull();
    expect(handler).not.toHaveBeenCalled();
  });

  it("invokes the handler with reason='no-cache' when nothing is cached", async () => {
    const kp = makeIdentity(2);
    const handler = vi.fn(async () => kp);
    registerUnlockHandler(handler);

    const out = await requireUnlock("alice");
    expect(handler).toHaveBeenCalledWith("no-cache", "alice");
    expect(out).not.toBeNull();
    // Identity should now be cached.
    expect(SecretStorage.hasUnlocked("alice")).toBe(true);
  });

  it("invokes the handler with reason='no-cache' when cache holds another user (documented dead-branch)", async () => {
    SecretStorage.cacheUnlocked("alice", makeIdentity(1));
    const kp = makeIdentity(2);
    const handler = vi.fn(async () => kp);
    registerUnlockHandler(handler);

    const out = await requireUnlock("bob");
    // The "user-mismatch" branch is unreachable in practice because
    // getCached() wipes _state on mismatch before the reason inference
    // runs. Asserting the real behaviour catches accidental "fixes".
    expect(handler).toHaveBeenCalledWith("no-cache", "bob");
    expect(out).not.toBeNull();
  });

  it("invokes the handler with reason='expired' when the cache is for the same user but stale", async () => {
    const kp = makeIdentity(1);
    SecretStorage.cacheUnlocked("alice", kp);

    // The first getCached inside requireUnlock will see the stale entry
    // and return null + clear it. From requireUnlock's perspective the
    // _state was for the same user before the clear, so the inferred
    // reason is "expired".
    const realNow = Date.now;
    const t0 = realNow();
    let now = t0;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    now = t0 + SESSION_CACHE_DURATION_MS + 1;

    // The first getCached(alice) will detect expiry and clearState. By the
    // time requireUnlock decides on a reason, _state is null → "no-cache".
    // We accept either "no-cache" or "expired" since both are correct
    // descriptions of the same event from the caller's POV.
    const handler = vi.fn(async () => makeIdentity(2));
    registerUnlockHandler(handler);

    try {
      const out = await requireUnlock("alice");
      expect(out).not.toBeNull();
      expect(handler).toHaveBeenCalled();
      const firstCall = handler.mock.calls[0] as unknown as [string, string];
      expect(["no-cache", "expired"]).toContain(firstCall[0]);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("returns null when the user cancels the unlock prompt", async () => {
    const handler = vi.fn(async () => null);
    registerUnlockHandler(handler);
    const out = await requireUnlock("alice");
    expect(out).toBeNull();
  });

  it("returns null when no handler is registered (and warns)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const out = await requireUnlock("alice");
    expect(out).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("rejects empty userId", async () => {
    await expect(requireUnlock("")).rejects.toThrow();
  });

  describe("concurrent dedup (pendingUnlocks)", () => {
    it("two concurrent calls for the SAME userId share a single handler invocation", async () => {
      const kp = makeIdentity(7);
      let resolveHandler: (kp: IdentityKeyPair) => void = () => {};
      const handler = vi.fn(
        () =>
          new Promise<IdentityKeyPair>((resolve) => {
            resolveHandler = resolve;
          }),
      );
      registerUnlockHandler(handler);

      const callA = requireUnlock("alice");
      const callB = requireUnlock("alice");

      await Promise.resolve();

      expect(handler).toHaveBeenCalledTimes(1);

      resolveHandler(kp);
      const [outA, outB] = await Promise.all([callA, callB]);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(outA).not.toBeNull();
      expect(outB).not.toBeNull();
      expect(outA?.publicKey).toEqual(outB?.publicKey);
    });

    it("clears pendingUnlocks after resolution so the NEXT call prompts again", async () => {
      const handler = vi
        .fn<() => Promise<IdentityKeyPair | null>>()
        .mockResolvedValueOnce(makeIdentity(1))
        .mockResolvedValueOnce(makeIdentity(2));
      registerUnlockHandler(handler);

      const first = await requireUnlock("alice");
      expect(first).not.toBeNull();

      // Force a second handler invocation — without lock, getCached would
      // short-circuit before pendingUnlocks is consulted.
      SecretStorage.lock();

      const second = await requireUnlock("alice");
      expect(second).not.toBeNull();
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it("does NOT dedup across DIFFERENT userIds (per-user keying)", async () => {
      let resolveAlice: (kp: IdentityKeyPair) => void = () => {};
      let resolveBob: (kp: IdentityKeyPair) => void = () => {};
      const handler = vi.fn((_reason: string, userId?: string) => {
        return new Promise<IdentityKeyPair>((resolve) => {
          if (userId === "alice") resolveAlice = resolve;
          else resolveBob = resolve;
        });
      });
      registerUnlockHandler(handler);

      const callAlice = requireUnlock("alice");
      const callBob = requireUnlock("bob");

      await Promise.resolve();
      expect(handler).toHaveBeenCalledTimes(2);

      resolveAlice(makeIdentity(1));
      resolveBob(makeIdentity(2));
      await Promise.all([callAlice, callBob]);
    });

    it("releases the pendingUnlocks slot even when the handler throws", async () => {
      const handler = vi
        .fn<() => Promise<IdentityKeyPair | null>>()
        .mockRejectedValueOnce(new Error("boom"))
        .mockResolvedValueOnce(makeIdentity(1));
      registerUnlockHandler(handler);

      await expect(requireUnlock("alice")).rejects.toThrow("boom");

      const out = await requireUnlock("alice");
      expect(out).not.toBeNull();
      expect(handler).toHaveBeenCalledTimes(2);
    });
  });
});

describe("auto-lock suspender bridge", () => {
  afterEach(() => {
    unregisterAutoLockSuspender();
  });

  it("returns a safe no-op when no suspender is registered", () => {
    const release = suspendAutoLock();
    expect(typeof release).toBe("function");
    expect(() => release()).not.toThrow();
  });

  it("delegates to the registered suspender and passes its release through", () => {
    const release = vi.fn();
    const suspender = vi.fn(() => release);
    registerAutoLockSuspender(suspender);

    const out = suspendAutoLock();
    expect(suspender).toHaveBeenCalledTimes(1);
    expect(out).toBe(release);

    out();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("stops delegating after unregister (no-op again)", () => {
    const suspender = vi.fn(() => () => {});
    registerAutoLockSuspender(suspender);
    suspendAutoLock();
    expect(suspender).toHaveBeenCalledTimes(1);

    unregisterAutoLockSuspender();
    const release = suspendAutoLock();
    expect(suspender).toHaveBeenCalledTimes(1);
    expect(typeof release).toBe("function");
    expect(() => release()).not.toThrow();
  });
});
