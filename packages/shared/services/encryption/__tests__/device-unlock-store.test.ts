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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  forgetDeviceUnlock,
  hasDeviceUnlock,
  persistDeviceUnlock,
  restoreDeviceUnlock,
  resetDeviceUnlockStoreForTests,
} from "../device-unlock-store";
import { arrayBufferToBase64 } from "../utils";
import type { IdentityKeyPair } from "../types";

function makeFakeIDB() {
  const records = new Map<string, unknown>();
  const request = (result?: unknown) => {
    const req: Record<string, unknown> = { result };
    queueMicrotask(() => {
      (req.onsuccess as (() => void) | undefined)?.();
    });
    return req;
  };
  const objectStore = {
    get: (key: string) => request(records.get(key)),
    put: (value: { userId: string }) => {
      records.set(value.userId, value);
      return request(true);
    },
    delete: (key: string) => {
      records.delete(key);
      return request(undefined);
    },
  };
  const db = {
    objectStoreNames: { contains: () => true },
    transaction: () => ({ objectStore: () => objectStore }),
  };
  return {
    records,
    factory: {
      open: () => {
        const req: Record<string, unknown> = { result: db };
        queueMicrotask(() => {
          (req.onsuccess as (() => void) | undefined)?.();
        });
        return req;
      },
    },
  };
}

const kp: IdentityKeyPair = {
  publicKey: new Uint8Array(32).fill(7),
  privateKey: new Uint8Array(32).fill(9),
};
const publicKeyB64 = arrayBufferToBase64(kp.publicKey);

describe("device-unlock-store", () => {
  let fake: ReturnType<typeof makeFakeIDB>;

  beforeEach(() => {
    fake = makeFakeIDB();
    vi.stubGlobal("indexedDB", fake.factory);
    resetDeviceUnlockStoreForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetDeviceUnlockStoreForTests();
  });

  it("persist → restore roundtrips the identity", async () => {
    expect(await persistDeviceUnlock("user-1", publicKeyB64, kp)).toBe(true);
    const restored = await restoreDeviceUnlock("user-1", publicKeyB64);
    expect(restored).not.toBeNull();
    expect(new Uint8Array(restored!.privateKey)).toEqual(kp.privateKey);
    expect(new Uint8Array(restored!.publicKey)).toEqual(kp.publicKey);
  });

  it("hasDeviceUnlock reflects persisted state; forget clears it", async () => {
    expect(await hasDeviceUnlock("user-1")).toBe(false);
    await persistDeviceUnlock("user-1", publicKeyB64, kp);
    expect(await hasDeviceUnlock("user-1")).toBe(true);
    await forgetDeviceUnlock("user-1");
    expect(await hasDeviceUnlock("user-1")).toBe(false);
    expect(await restoreDeviceUnlock("user-1", publicKeyB64)).toBeNull();
  });

  it("drops the record when the expected public key does not match (rotated identity)", async () => {
    await persistDeviceUnlock("user-1", publicKeyB64, kp);
    const otherKey = arrayBufferToBase64(new Uint8Array(32).fill(1));
    expect(await restoreDeviceUnlock("user-1", otherKey)).toBeNull();
    expect(await hasDeviceUnlock("user-1")).toBe(false);
  });

  it("records are scoped per user", async () => {
    await persistDeviceUnlock("user-1", publicKeyB64, kp);
    expect(await restoreDeviceUnlock("user-2", publicKeyB64)).toBeNull();
    expect(await hasDeviceUnlock("user-2")).toBe(false);
  });

  it("is a no-op when IndexedDB is unavailable", async () => {
    vi.stubGlobal("indexedDB", undefined);
    resetDeviceUnlockStoreForTests();
    expect(await persistDeviceUnlock("user-1", publicKeyB64, kp)).toBe(false);
    expect(await restoreDeviceUnlock("user-1", publicKeyB64)).toBeNull();
    expect(await hasDeviceUnlock("user-1")).toBe(false);
    await expect(forgetDeviceUnlock("user-1")).resolves.toBeUndefined();
  });

  it("rejects tampered ciphertext (AES-GCM auth failure) and drops the record", async () => {
    await persistDeviceUnlock("user-1", publicKeyB64, kp);
    const record = fake.records.get("user-1") as { ciphertext: ArrayBuffer };
    new Uint8Array(record.ciphertext)[0] ^= 0xff;
    expect(await restoreDeviceUnlock("user-1", publicKeyB64)).toBeNull();
    expect(await hasDeviceUnlock("user-1")).toBe(false);
  });
});
