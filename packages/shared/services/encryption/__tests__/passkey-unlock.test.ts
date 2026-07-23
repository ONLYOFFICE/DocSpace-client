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
  enrollPasskeyUnlock,
  hasPasskeyUnlock,
  removePasskeyUnlock,
  resetPasskeyUnlockStoreForTests,
  unlockWithPasskey,
} from "../passkey-unlock";
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

const prfSecret = () => new Uint8Array(32).fill(0x42).buffer;
const CREDENTIAL_ID = new Uint8Array(16).fill(0xaa).buffer;

function makeCredential(prf: unknown) {
  return {
    rawId: CREDENTIAL_ID,
    getClientExtensionResults: () => ({ prf }),
  };
}

function stubCredentials({
  create,
  get,
}: {
  create?: () => Promise<unknown>;
  get?: () => Promise<unknown>;
}) {
  vi.stubGlobal("navigator", {
    credentials: {
      create: create ?? (async () => null),
      get: get ?? (async () => null),
    },
  });
}

const kp: IdentityKeyPair = {
  publicKey: new Uint8Array(32).fill(7),
  privateKey: new Uint8Array(32).fill(9),
};
const publicKeyB64 = arrayBufferToBase64(kp.publicKey);

describe("passkey-unlock", () => {
  let fake: ReturnType<typeof makeFakeIDB>;

  beforeEach(() => {
    fake = makeFakeIDB();
    vi.stubGlobal("indexedDB", fake.factory);
    resetPasskeyUnlockStoreForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetPasskeyUnlockStoreForTests();
  });

  it("enroll (PRF at create) → unlock roundtrips the identity", async () => {
    stubCredentials({
      create: async () =>
        makeCredential({ enabled: true, results: { first: prfSecret() } }),
      get: async () =>
        makeCredential({ results: { first: prfSecret() } }),
    });

    expect(
      await enrollPasskeyUnlock("user-1", publicKeyB64, kp, {
        rpName: "DocSpace",
        userName: "user@example.com",
      }),
    ).toBe("ok");
    expect(await hasPasskeyUnlock("user-1")).toBe(true);

    const result = await unlockWithPasskey("user-1", publicKeyB64);
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(new Uint8Array(result.kp.privateKey)).toEqual(kp.privateKey);
      expect(new Uint8Array(result.kp.publicKey)).toEqual(kp.publicKey);
    }
  });

  it("enroll falls back to a get() when create returns no PRF results", async () => {
    const get = vi.fn(async () =>
      makeCredential({ results: { first: prfSecret() } }),
    );
    stubCredentials({
      create: async () => makeCredential({ enabled: true }),
      get,
    });

    expect(
      await enrollPasskeyUnlock("user-1", publicKeyB64, kp, {
        rpName: "DocSpace",
        userName: "user@example.com",
      }),
    ).toBe("ok");
    expect(get).toHaveBeenCalledTimes(1);
    expect(await hasPasskeyUnlock("user-1")).toBe(true);
  });

  it("enroll fails cleanly when the authenticator does not support PRF", async () => {
    stubCredentials({
      create: async () => makeCredential({ enabled: false }),
    });

    expect(
      await enrollPasskeyUnlock("user-1", publicKeyB64, kp, {
        rpName: "DocSpace",
        userName: "user@example.com",
      }),
    ).toBe("failed");
    expect(await hasPasskeyUnlock("user-1")).toBe(false);
  });

  it("user cancellation keeps the record and reports cancelled", async () => {
    stubCredentials({
      create: async () =>
        makeCredential({ enabled: true, results: { first: prfSecret() } }),
    });
    await enrollPasskeyUnlock("user-1", publicKeyB64, kp, {
      rpName: "DocSpace",
      userName: "user@example.com",
    });

    stubCredentials({
      get: async () => {
        throw new DOMException("cancelled", "NotAllowedError");
      },
    });
    vi.stubGlobal("indexedDB", fake.factory);

    const result = await unlockWithPasskey("user-1", publicKeyB64);
    expect(result.status).toBe("cancelled");
    expect(await hasPasskeyUnlock("user-1")).toBe(true);
  });

  it("reports cancelled when the user declines the enrollment prompt", async () => {
    stubCredentials({
      create: async () => {
        throw new DOMException("cancelled", "NotAllowedError");
      },
    });

    expect(
      await enrollPasskeyUnlock("user-1", publicKeyB64, kp, {
        rpName: "DocSpace",
        userName: "user@example.com",
      }),
    ).toBe("cancelled");
    expect(await hasPasskeyUnlock("user-1")).toBe(false);
  });

  it("maps an aborted ceremony to cancelled and keeps the record", async () => {
    stubCredentials({
      create: async () =>
        makeCredential({ enabled: true, results: { first: prfSecret() } }),
    });
    await enrollPasskeyUnlock("user-1", publicKeyB64, kp, {
      rpName: "DocSpace",
      userName: "user@example.com",
    });

    stubCredentials({
      get: async () => {
        throw new DOMException("aborted", "AbortError");
      },
    });
    vi.stubGlobal("indexedDB", fake.factory);

    const controller = new AbortController();
    controller.abort();
    const result = await unlockWithPasskey(
      "user-1",
      publicKeyB64,
      controller.signal,
    );
    expect(result.status).toBe("cancelled");
    expect(await hasPasskeyUnlock("user-1")).toBe(true);
  });

  it("hasPasskeyUnlock reports false for a mismatched public key without deleting", async () => {
    stubCredentials({
      create: async () =>
        makeCredential({ enabled: true, results: { first: prfSecret() } }),
    });
    await enrollPasskeyUnlock("user-1", publicKeyB64, kp, {
      rpName: "DocSpace",
      userName: "user@example.com",
    });

    const otherKey = arrayBufferToBase64(new Uint8Array(32).fill(1));
    expect(await hasPasskeyUnlock("user-1", otherKey)).toBe(false);
    expect(await hasPasskeyUnlock("user-1", publicKeyB64)).toBe(true);
  });

  it("drops the record when the expected public key does not match", async () => {
    stubCredentials({
      create: async () =>
        makeCredential({ enabled: true, results: { first: prfSecret() } }),
    });
    await enrollPasskeyUnlock("user-1", publicKeyB64, kp, {
      rpName: "DocSpace",
      userName: "user@example.com",
    });

    const otherKey = arrayBufferToBase64(new Uint8Array(32).fill(1));
    const result = await unlockWithPasskey("user-1", otherKey);
    expect(result.status).toBe("failed");
    expect(await hasPasskeyUnlock("user-1")).toBe(false);
  });

  it("drops the record when the PRF secret no longer decrypts (wrong output)", async () => {
    stubCredentials({
      create: async () =>
        makeCredential({ enabled: true, results: { first: prfSecret() } }),
      get: async () =>
        makeCredential({
          results: { first: new Uint8Array(32).fill(0x13).buffer },
        }),
    });
    await enrollPasskeyUnlock("user-1", publicKeyB64, kp, {
      rpName: "DocSpace",
      userName: "user@example.com",
    });

    const result = await unlockWithPasskey("user-1", publicKeyB64);
    expect(result.status).toBe("failed");
    expect(await hasPasskeyUnlock("user-1")).toBe(false);
  });

  it("removePasskeyUnlock clears enrollment", async () => {
    stubCredentials({
      create: async () =>
        makeCredential({ enabled: true, results: { first: prfSecret() } }),
    });
    await enrollPasskeyUnlock("user-1", publicKeyB64, kp, {
      rpName: "DocSpace",
      userName: "user@example.com",
    });
    await removePasskeyUnlock("user-1");
    expect(await hasPasskeyUnlock("user-1")).toBe(false);
    expect((await unlockWithPasskey("user-1", publicKeyB64)).status).toBe(
      "failed",
    );
  });

  it("is a no-op when IndexedDB is unavailable", async () => {
    vi.stubGlobal("indexedDB", undefined);
    resetPasskeyUnlockStoreForTests();
    stubCredentials({
      create: async () =>
        makeCredential({ enabled: true, results: { first: prfSecret() } }),
    });

    expect(
      await enrollPasskeyUnlock("user-1", publicKeyB64, kp, {
        rpName: "DocSpace",
        userName: "user@example.com",
      }),
    ).toBe("failed");
    expect(await hasPasskeyUnlock("user-1")).toBe(false);
    expect((await unlockWithPasskey("user-1", publicKeyB64)).status).toBe(
      "failed",
    );
  });
});
