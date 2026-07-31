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
  TofuStore,
  getTofuStore,
  resetTofuStores,
} from "../tofu-store";

// Minimal in-memory IDBFactory good enough for tofu-store.ts. Persists data
// per-database in a module-level Map so reopening a DB returns the same data
// (mirrors real IndexedDB). Object-store schema is fixed (keyPath: "userId"),
// matching what tofuStore.openDB creates on upgrade.
type Store = Map<string, unknown>;

class MockOpenRequest {
  result: MockDB | null = null;
  transaction: MockTransaction | null = null;
  error: Error | null = null;
  onupgradeneeded:
    | ((event: { oldVersion: number; newVersion: number | null }) => void)
    | null = null;
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onblocked: (() => void) | null = null;
}

class MockRequest<T> {
  result: T | undefined;
  error: Error | null = null;
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;
}

class MockObjectStoreNames {
  constructor(private names: Set<string>) {}
  contains(name: string): boolean {
    return this.names.has(name);
  }
}

class MockObjectStore {
  constructor(private store: Store) {}

  get(key: string): MockRequest<unknown> {
    const req = new MockRequest<unknown>();
    queueMicrotask(() => {
      req.result = this.store.get(key);
      req.onsuccess?.();
    });
    return req;
  }

  put(value: { userId: string }): MockRequest<void> {
    const req = new MockRequest<void>();
    queueMicrotask(() => {
      this.store.set(value.userId, value);
      req.onsuccess?.();
    });
    return req;
  }

  delete(key: string): MockRequest<void> {
    const req = new MockRequest<void>();
    queueMicrotask(() => {
      this.store.delete(key);
      req.onsuccess?.();
    });
    return req;
  }

  getAll(): MockRequest<unknown[]> {
    const req = new MockRequest<unknown[]>();
    queueMicrotask(() => {
      req.result = Array.from(this.store.values());
      req.onsuccess?.();
    });
    return req;
  }

  clear(): MockRequest<void> {
    const req = new MockRequest<void>();
    queueMicrotask(() => {
      this.store.clear();
      req.onsuccess?.();
    });
    return req;
  }
}

class MockTransaction {
  constructor(private store: Store) {}
  objectStore(_name: string): MockObjectStore {
    return new MockObjectStore(this.store);
  }
}

class MockDB {
  objectStoreNames: MockObjectStoreNames;
  constructor(
    private store: Store,
    private storeNames: Set<string>,
  ) {
    this.objectStoreNames = new MockObjectStoreNames(storeNames);
  }
  createObjectStore(name: string, _options: { keyPath: string }): void {
    this.storeNames.add(name);
  }
  transaction(_names: string, _mode: IDBTransactionMode): MockTransaction {
    return new MockTransaction(this.store);
  }
}

const dbs = new Map<
  string,
  { store: Store; storeNames: Set<string>; version: number }
>();

function resetMockIDB(): void {
  dbs.clear();
}

function seedMockIDB(
  name: string,
  version: number,
  storeName: string,
  records: ({ userId: string } & Record<string, unknown>)[],
): void {
  const store: Store = new Map();
  for (const r of records) store.set(r.userId, r);
  dbs.set(name, { store, storeNames: new Set([storeName]), version });
}

const mockIDB = {
  open(name: string, version = 1): MockOpenRequest {
    const req = new MockOpenRequest();
    let entry = dbs.get(name);
    if (!entry) {
      entry = { store: new Map(), storeNames: new Set(), version: 0 };
      dbs.set(name, entry);
    }
    const upgradeFrom = entry.version < version ? entry.version : null;
    const db = new MockDB(entry.store, entry.storeNames);
    queueMicrotask(() => {
      req.result = db;
      if (upgradeFrom !== null) {
        req.transaction = new MockTransaction(entry.store);
        req.onupgradeneeded?.({ oldVersion: upgradeFrom, newVersion: version });
        req.transaction = null;
        entry.version = version;
      }
      req.onsuccess?.();
    });
    return req;
  },
};

// Tests
describe("TofuStore", () => {
  beforeEach(() => {
    resetMockIDB();
    resetTofuStores();
    vi.stubGlobal("indexedDB", mockIDB);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("records first-seen on a brand-new userId", async () => {
    const tofu = new TofuStore("alice");
    const result = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(result.kind).toBe("first-seen");

    const list = await tofu.list();
    expect(list).toHaveLength(1);
    expect(list[0].userId).toBe("bob");
    expect(list[0].keys).toHaveLength(1);
    expect(list[0].keys[0].publicKey).toBe("PKBOBABCDEFGHIJK");
    expect(list[0].keys[0].verifiedAt).toBeNull();
    expect(list[0].keys[0].source).toBe("first-seen");
    expect(list[0].keys[0].firstSeenAt).toBe(list[0].keys[0].lastSeenAt);
  });

  it("returns match + bumps lastSeenAt on identical key", async () => {
    const tofu = new TofuStore("alice");
    const before = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(before.kind).toBe("first-seen");

    const t0 = await tofu.list();
    const firstSeenAt = t0[0].keys[0].firstSeenAt;

    // small delay so lastSeenAt advances
    await new Promise((r) => setTimeout(r, 5));

    const result = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(result.kind).toBe("match");
    if (result.kind !== "match") return;
    expect(result.matchedKey.firstSeenAt).toBe(firstSeenAt);
    expect(result.matchedKey.lastSeenAt).toBeGreaterThanOrEqual(firstSeenAt);
  });

  it("returns mismatch without overwriting when key changes", async () => {
    const tofu = new TofuStore("alice");
    await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");

    const result = await tofu.checkKey("bob", "PKBOBABCDEFGHIJL");
    expect(result.kind).toBe("mismatch");
    if (result.kind !== "mismatch") return;
    expect(result.known.publicKey).toBe("PKBOBABCDEFGHIJK");
    expect(result.knownKeys).toHaveLength(1);
    expect(result.submitted).toBe("PKBOBABCDEFGHIJL");

    // Stored record is still the original key.
    const list = await tofu.list();
    expect(list[0].keys).toHaveLength(1);
    expect(list[0].keys[0].publicKey).toBe("PKBOBABCDEFGHIJK");
  });

  it("acceptKey appends; previously trusted keys stay trusted", async () => {
    const tofu = new TofuStore("alice");
    await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    await tofu.markVerified("bob");

    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJL");

    const list = await tofu.list();
    expect(list[0].keys).toHaveLength(2);
    const oldEntry = list[0].keys.find(
      (k) => k.publicKey === "PKBOBABCDEFGHIJK",
    );
    const newEntry = list[0].keys.find(
      (k) => k.publicKey === "PKBOBABCDEFGHIJL",
    );
    expect(oldEntry?.verifiedAt).not.toBeNull();
    expect(newEntry?.verifiedAt).toBeNull();
    expect(newEntry?.source).toBe("accepted");

    expect((await tofu.checkKey("bob", "PKBOBABCDEFGHIJK")).kind).toBe("match");
    expect((await tofu.checkKey("bob", "PKBOBABCDEFGHIJL")).kind).toBe("match");
  });

  it("acceptKey on an already-trusted key only bumps lastSeenAt", async () => {
    const tofu = new TofuStore("alice");
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJK");
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJK");
    const list = await tofu.list();
    expect(list[0].keys).toHaveLength(1);
  });

  it("forgetKey removes exactly one key and keeps the rest trusted", async () => {
    const tofu = new TofuStore("alice");
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJK");
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJL");

    await tofu.forgetKey("bob", "PKBOBABCDEFGHIJK");

    const list = await tofu.list();
    expect(list[0].keys).toHaveLength(1);
    expect(list[0].keys[0].publicKey).toBe("PKBOBABCDEFGHIJL");
    expect((await tofu.checkKey("bob", "PKBOBABCDEFGHIJK")).kind).toBe(
      "mismatch",
    );
    expect((await tofu.checkKey("bob", "PKBOBABCDEFGHIJL")).kind).toBe("match");
  });

  it("forgetKey on the last key drops the record entirely", async () => {
    const tofu = new TofuStore("alice");
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJK");
    await tofu.forgetKey("bob", "PKBOBABCDEFGHIJK");
    expect(await tofu.list()).toHaveLength(0);
    expect((await tofu.checkKey("bob", "PKBOBABCDEFGHIJK")).kind).toBe(
      "first-seen",
    );
  });

  it("markVerified targets a specific key when publicKey is given", async () => {
    const tofu = new TofuStore("alice");
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJK");
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJL");

    await tofu.markVerified("bob", "PKBOBABCDEFGHIJK");

    const keys = (await tofu.list())[0].keys;
    expect(
      keys.find((k) => k.publicKey === "PKBOBABCDEFGHIJK")?.verifiedAt,
    ).not.toBeNull();
    expect(
      keys.find((k) => k.publicKey === "PKBOBABCDEFGHIJL")?.verifiedAt,
    ).toBeNull();
  });

  it("migrates a v1 single-key record to the multi-key shape", async () => {
    seedMockIDB("docspace-tofu-alice", 1, "known_keys", [
      {
        userId: "bob",
        publicKey: "PKBOBABCDEFGHIJK",
        firstSeenAt: 1000,
        lastSeenAt: 2000,
        verifiedAt: 1500,
      },
    ]);

    const tofu = new TofuStore("alice");
    const result = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(result.kind).toBe("match");

    const list = await tofu.list();
    expect(list[0].keys).toHaveLength(1);
    expect(list[0].keys[0].publicKey).toBe("PKBOBABCDEFGHIJK");
    expect(list[0].keys[0].firstSeenAt).toBe(1000);
    expect(list[0].keys[0].verifiedAt).toBe(1500);
    expect(list[0].keys[0].source).toBe("migrated-v1");
  });

  it("markVerified is a no-op for unknown userId", async () => {
    const tofu = new TofuStore("alice");
    await tofu.markVerified("bob");
    const list = await tofu.list();
    expect(list).toHaveLength(0);
  });

  it("forget removes the record", async () => {
    const tofu = new TofuStore("alice");
    await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    await tofu.forget("bob");
    const list = await tofu.list();
    expect(list).toHaveLength(0);

    // After forget, the next check is again first-seen.
    const result = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(result.kind).toBe("first-seen");
  });

  it("clear wipes the entire scope", async () => {
    const tofu = new TofuStore("alice");
    await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    await tofu.checkKey("carol", "PKCAROLABCDEFGHI");
    expect((await tofu.list()).length).toBe(2);
    await tofu.clear();
    expect((await tofu.list()).length).toBe(0);
  });

  it("isolates state per scopeId", async () => {
    const aliceStore = new TofuStore("alice");
    const eveStore = new TofuStore("eve");

    await aliceStore.checkKey("bob", "PKBOBABCDEFGHIJK");

    // Eve has never seen bob, so she gets first-seen with HER chosen key.
    const result = await eveStore.checkKey("bob", "PKBOBDIFFERENTAB");
    expect(result.kind).toBe("first-seen");

    // Alice's record is untouched by Eve's session.
    const aliceList = await aliceStore.list();
    expect(aliceList[0].keys[0].publicKey).toBe("PKBOBABCDEFGHIJK");
  });

  it("getTofuStore reuses the same instance for one scopeId", () => {
    const a = getTofuStore("alice");
    const b = getTofuStore("alice");
    expect(a).toBe(b);
  });

  it("getTofuStore returns different instances for different scopeIds", () => {
    const a = getTofuStore("alice");
    const e = getTofuStore("eve");
    expect(a).not.toBe(e);
  });

  it("rejects empty arguments", async () => {
    const tofu = new TofuStore("alice");
    await expect(tofu.checkKey("", "x")).rejects.toThrow();
    await expect(tofu.checkKey("bob", "")).rejects.toThrow();
    await expect(tofu.acceptKey("", "x")).rejects.toThrow();
    await expect(tofu.acceptKey("bob", "")).rejects.toThrow();
    expect(() => new TofuStore("")).toThrow();
  });
});

describe("TofuStore — IndexedDB unavailable (in-memory fallback)", () => {
  beforeEach(() => {
    resetTofuStores();
    vi.stubGlobal("indexedDB", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects key mismatch within a session even when IDB is unavailable", async () => {
    const tofu = new TofuStore("alice");
    const a = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(a.kind).toBe("first-seen");
    const b = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(b.kind).toBe("match");
    const c = await tofu.checkKey("bob", "PKBOBABCDEFGHIJL");
    expect(c.kind).toBe("mismatch");
  });

  it("list/forget/markVerified/clear/acceptKey operate on the in-memory store", async () => {
    const tofu = new TofuStore("alice");
    expect(await tofu.list()).toEqual([]);
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJK");
    const after = await tofu.list();
    expect(after).toHaveLength(1);
    expect(after[0].keys[0].publicKey).toBe("PKBOBABCDEFGHIJK");
    await tofu.markVerified("bob");
    expect((await tofu.list())[0].keys[0].verifiedAt).not.toBeNull();
    await tofu.forget("bob");
    expect(await tofu.list()).toEqual([]);
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJK");
    await tofu.clear();
    expect(await tofu.list()).toEqual([]);
  });
});

describe("TofuStore — IndexedDB open failure modes", () => {
  beforeEach(() => {
    resetTofuStores();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("checkKey survives indexedDB.open onerror (Safari private mode, quota exceeded)", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("indexedDB", {
      open: () => {
        const req = new MockOpenRequest();
        queueMicrotask(() => {
          req.error = new Error("InvalidStateError");
          req.onerror?.();
        });
        return req;
      },
    });

    const tofu = new TofuStore("alice");
    const first = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(first.kind).toBe("first-seen");
    const same = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(same.kind).toBe("match");
    const swap = await tofu.checkKey("bob", "PKBOBABCDEFGHIJL");
    expect(swap.kind).toBe("mismatch");
    expect(errSpy).toHaveBeenCalled();
  });

  it("checkKey survives indexedDB.open onblocked (other tab holds older version)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("indexedDB", {
      open: () => {
        const req = new MockOpenRequest();
        queueMicrotask(() => req.onblocked?.());
        return req;
      },
    });

    const tofu = new TofuStore("alice");
    const first = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(first.kind).toBe("first-seen");
    const swap = await tofu.checkKey("bob", "PKBOBABCDEFGHIJL");
    expect(swap.kind).toBe("mismatch");
    expect(warnSpy).toHaveBeenCalled();
  });

  it("list starts empty after open failure but reflects subsequent writes", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("indexedDB", {
      open: () => {
        const req = new MockOpenRequest();
        queueMicrotask(() => {
          req.error = new Error("InvalidStateError");
          req.onerror?.();
        });
        return req;
      },
    });

    const tofu = new TofuStore("alice");
    expect(await tofu.list()).toEqual([]);
    await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(await tofu.list()).toHaveLength(1);
  });
});

describe("TofuStore — per-operation IndexedDB error paths", () => {
  beforeEach(() => {
    resetMockIDB();
    resetTofuStores();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function installFlakyIDB(failingOp: keyof MockObjectStore | "all") {
    class FlakyObjectStore extends MockObjectStore {
      get(key: string): MockRequest<unknown> {
        if (failingOp === "get" || failingOp === "all") {
          const req = new MockRequest<unknown>();
          queueMicrotask(() => {
            req.error = new Error("TransactionInactiveError");
            req.onerror?.();
          });
          return req;
        }
        return super.get(key);
      }
      put(value: { userId: string }): MockRequest<void> {
        if (failingOp === "put" || failingOp === "all") {
          const req = new MockRequest<void>();
          queueMicrotask(() => {
            req.error = new Error("QuotaExceededError");
            req.onerror?.();
          });
          return req;
        }
        return super.put(value);
      }
      delete(key: string): MockRequest<void> {
        if (failingOp === "delete" || failingOp === "all") {
          const req = new MockRequest<void>();
          queueMicrotask(() => {
            req.error = new Error("TransactionInactiveError");
            req.onerror?.();
          });
          return req;
        }
        return super.delete(key);
      }
      getAll(): MockRequest<unknown[]> {
        if (failingOp === "getAll" || failingOp === "all") {
          const req = new MockRequest<unknown[]>();
          queueMicrotask(() => {
            req.error = new Error("TransactionInactiveError");
            req.onerror?.();
          });
          return req;
        }
        return super.getAll();
      }
      clear(): MockRequest<void> {
        if (failingOp === "clear" || failingOp === "all") {
          const req = new MockRequest<void>();
          queueMicrotask(() => {
            req.error = new Error("TransactionInactiveError");
            req.onerror?.();
          });
          return req;
        }
        return super.clear();
      }
    }

    class FlakyTransaction extends MockTransaction {
      objectStore(name: string): MockObjectStore {
        const base = super.objectStore(name);
        // biome-ignore lint/suspicious/noExplicitAny: reach into private field for the flaky variant
        return new FlakyObjectStore((base as any).store);
      }
    }

    class FlakyDB extends MockDB {
      transaction(names: string, mode: IDBTransactionMode): MockTransaction {
        const base = super.transaction(names, mode);
        // biome-ignore lint/suspicious/noExplicitAny: bridge the private store field
        return new FlakyTransaction((base as any).store);
      }
    }

    vi.stubGlobal("indexedDB", {
      open(name: string, _v: number): MockOpenRequest {
        const req = new MockOpenRequest();
        const entry = (mockIDB as unknown as {
          open(name: string, v: number): MockOpenRequest;
          // biome-ignore lint/suspicious/noExplicitAny: reuse the success-path open and swap DB
        }).open(name, _v) as any;
        // Replace result with a flaky version after the success-path mock prepared it
        queueMicrotask(() => {
          const realDb = entry.result as MockDB;
          // biome-ignore lint/suspicious/noExplicitAny: pull the private store/storeNames out
          const store = (realDb as any).store;
          // biome-ignore lint/suspicious/noExplicitAny: same
          const storeNames = (realDb as any).storeNames;
          const flaky = new FlakyDB(store, storeNames);
          req.result = flaky;
          req.onsuccess?.();
        });
        return req;
      },
    });
  }

  it("getRecord resolves null when the underlying get fires onerror", async () => {
    installFlakyIDB("get");
    const tofu = new TofuStore("alice");
    // checkKey internally calls getRecord — when read fails, treat as first-seen
    const result = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(result.kind).toBe("first-seen");
  });

  it("putRecord resolves silently when write fires onerror", async () => {
    installFlakyIDB("put");
    const tofu = new TofuStore("alice");
    await expect(tofu.checkKey("bob", "PKBOBABCDEFGHIJK")).resolves.toEqual({
      kind: "first-seen",
    });
    await expect(tofu.acceptKey("bob", "PKBOBNEWABCDEFGH")).resolves.toBeUndefined();
  });

  it("deleteRecord resolves silently when delete fires onerror", async () => {
    installFlakyIDB("delete");
    const tofu = new TofuStore("alice");
    await expect(tofu.forget("bob")).resolves.toBeUndefined();
  });

  it("list resolves to [] when getAll fires onerror", async () => {
    installFlakyIDB("getAll");
    const tofu = new TofuStore("alice");
    expect(await tofu.list()).toEqual([]);
  });

  it("clear resolves silently when underlying clear fires onerror", async () => {
    installFlakyIDB("clear");
    const tofu = new TofuStore("alice");
    await expect(tofu.clear()).resolves.toBeUndefined();
  });
});
