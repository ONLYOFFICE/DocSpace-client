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

import { IDBFactory } from "fake-indexeddb";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  TofuStore,
  getTofuStore,
  resetTofuStores,
} from "../tofu-store";

/** A factory whose opens are answered with `answer`: "blocked" or an error name. */
const answeredOpen = (answer: string) => ({
  open: () => {
    const req: {
      error?: DOMException;
      onerror?: () => void;
      onblocked?: () => void;
    } = {};
    queueMicrotask(() => {
      if (answer === "blocked") {
        req.onblocked?.();
        return;
      }
      req.error = new DOMException(answer, answer);
      req.onerror?.();
    });
    return req;
  },
});

// Tests
describe("TofuStore", () => {
  beforeEach(() => {
    resetTofuStores();
    vi.stubGlobal("indexedDB", new IDBFactory());
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

  it("Peer with several keys", async () => {
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

  it("Earlier key listed again", async () => {
    const tofu = new TofuStore("alice");
    await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJL");
    expect((await tofu.checkKey("bob", "PKBOBABCDEFGHIJL")).kind).toBe("match");

    const again = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(again.kind).toBe("match");
    if (again.kind !== "match") return;
    expect(again.matchedKey.publicKey).toBe("PKBOBABCDEFGHIJK");
  });

  it("acceptKey on an already-trusted key only bumps lastSeenAt", async () => {
    const tofu = new TofuStore("alice");
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJK");
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJK");
    const list = await tofu.list();
    expect(list[0].keys).toHaveLength(1);
  });

  it("getKeys returns every recorded key and [] for unknown or empty userId", async () => {
    const tofu = new TofuStore("alice");
    expect(await tofu.getKeys("bob")).toEqual([]);
    expect(await tofu.getKeys("")).toEqual([]);

    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJK");
    await tofu.acceptKey("bob", "PKBOBABCDEFGHIJL");

    const keys = await tofu.getKeys("bob");
    expect(keys.map((k) => k.publicKey).sort()).toEqual([
      "PKBOBABCDEFGHIJK",
      "PKBOBABCDEFGHIJL",
    ]);
  });

  it("getKeys is read-only — it never creates a record", async () => {
    const tofu = new TofuStore("alice");
    await tofu.getKeys("bob");
    expect(await tofu.list()).toHaveLength(0);
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
    await new Promise<void>((resolve) => {
      const req = indexedDB.open("docspace-tofu-alice", 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore("known_keys", { keyPath: "userId" }).put({
          userId: "bob",
          publicKey: "PKBOBABCDEFGHIJK",
          firstSeenAt: 1000,
          lastSeenAt: 2000,
          verifiedAt: 1500,
        });
      };
      req.onsuccess = () => {
        req.result.close();
        resolve();
      };
    });

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

  it("Two keys of one peer seen at once", async () => {
    const tofu = new TofuStore("alice");

    const results = await Promise.all([
      tofu.checkKey("bob", "PKBOBABCDEFGHIJK"),
      tofu.checkKey("bob", "PKBOBABCDEFGHIJL"),
    ]);

    expect(results.map((r) => r.kind).sort()).toEqual(["first-seen", "mismatch"]);
    expect(await tofu.getKeys("bob")).toHaveLength(1);
  });

  it("One key of one peer seen twice at once", async () => {
    const tofu = new TofuStore("alice");

    const results = await Promise.all([
      tofu.checkKey("bob", "PKBOBABCDEFGHIJK"),
      tofu.checkKey("bob", "PKBOBABCDEFGHIJK"),
    ]);

    expect(results.map((r) => r.kind).sort()).toEqual(["first-seen", "match"]);
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

  it("IndexedDB unavailable: an open refused with InvalidStateError (private mode) keeps pins in memory", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("indexedDB", answeredOpen("InvalidStateError"));

    const tofu = new TofuStore("alice");
    const first = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(first.kind).toBe("first-seen");
    const same = await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(same.kind).toBe("match");
    const swap = await tofu.checkKey("bob", "PKBOBABCDEFGHIJL");
    expect(swap.kind).toBe("mismatch");
    expect(errSpy).toHaveBeenCalled();
  });

  it("Pin store cannot be opened: a blocked open refuses the operation", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("indexedDB", answeredOpen("blocked"));

    const tofu = new TofuStore("alice");
    expect((await tofu.checkKey("bob", "PKBOBABCDEFGHIJK")).kind).toBe(
      "unreadable",
    );
    expect(warnSpy).toHaveBeenCalled();
  });

  it("IndexedDB unavailable: list reflects the pins kept in memory", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("indexedDB", answeredOpen("InvalidStateError"));

    const tofu = new TofuStore("alice");
    expect(await tofu.list()).toEqual([]);
    await tofu.checkKey("bob", "PKBOBABCDEFGHIJK");
    expect(await tofu.list()).toHaveLength(1);
  });
});
