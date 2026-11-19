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

import { describe, expect, it, vi } from "vitest";

import { TofuStore, getTofuStore } from "../tofu-store";
import {
  abortAfterNextRequest,
  failNextRequest,
  holdOlderVersion,
  openAnotherTab,
  readPin,
  useFreshIndexedDb,
} from "./tofu-idb-helpers";

const PEER = "peer-1";
const KEY_A = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
const KEY_B = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=";

/** An open request that fails with an error of the given name. */
const failingOpen = (name: string) => {
  const req = { error: { name } } as unknown as IDBOpenDBRequest;
  queueMicrotask(() => req.onerror?.(new Event("error")));
  return req;
};

/** The browser's factory, with its next open answered by `next`. */
const answerNextOpen = (next: () => IDBOpenDBRequest) => {
  const real = indexedDB;
  let used = false;
  vi.stubGlobal("indexedDB", {
    open: (...args: Parameters<IDBFactory["open"]>) => {
      if (used) return real.open(...args);
      used = true;
      return next();
    },
  });
};

/** A pin of KEY_A for PEER, stored the way another tab stores it. */
const storePinInAnotherTab = async () => {
  const db = await openAnotherTab("me");
  await new Promise<void>((resolve) => {
    const tx = db.transaction("known_keys", "readwrite");
    tx.objectStore("known_keys").put({
      userId: PEER,
      keys: [
        {
          publicKey: KEY_A,
          firstSeenAt: 1,
          lastSeenAt: 1,
          verifiedAt: null,
          source: "first-seen",
        },
      ],
    });
    tx.oncomplete = () => resolve();
  });
  db.close();
};

describe("Pin store on IndexedDB", () => {
  useFreshIndexedDb();

  describe("Fresh database per test", () => {
    it("stores a pin another tab can read", async () => {
      expect(await getTofuStore("me").checkKey(PEER, KEY_A)).toEqual({
        kind: "first-seen",
      });

      expect(await readPin("me", PEER)).toMatchObject({
        userId: PEER,
        keys: [{ publicKey: KEY_A }],
      });
    });

    it("starts without the pin of the test before", async () => {
      expect(await readPin("me", PEER)).toBeUndefined();
    });
  });

  describe("Peer public keys are pinned on first use", () => {
    it("IndexedDB unavailable", async () => {
      vi.stubGlobal("indexedDB", undefined);
      const store = getTofuStore("me");

      expect(await store.checkKey(PEER, KEY_A)).toEqual({ kind: "first-seen" });
      expect((await store.checkKey(PEER, KEY_A)).kind).toBe("match");
    });

    it.each(["SecurityError", "InvalidStateError"])(
      "IndexedDB unavailable: an open refused with %s keeps pins in memory",
      async (name) => {
        answerNextOpen(() => failingOpen(name));
        const store = getTofuStore("me");

        expect(await store.checkKey(PEER, KEY_A)).toEqual({
          kind: "first-seen",
        });
        expect((await store.checkKey(PEER, KEY_A)).kind).toBe("match");
        // The memory choice holds for the session: nothing reached IndexedDB.
        expect(await readPin("me", PEER)).toBeUndefined();
      },
    );

    it("IndexedDB unavailable: an open that throws keeps pins in memory", async () => {
      answerNextOpen(() => {
        throw new DOMException("refused", "SecurityError");
      });
      const store = getTofuStore("me");

      expect(await store.checkKey(PEER, KEY_A)).toEqual({ kind: "first-seen" });
      expect((await store.checkKey(PEER, KEY_A)).kind).toBe("match");
    });

    it("Pin store cannot be opened: an open error refuses, the next call opens again", async () => {
      await storePinInAnotherTab();
      answerNextOpen(() => failingOpen("UnknownError"));
      const store = getTofuStore("me");

      expect((await store.checkKey(PEER, KEY_A)).kind).toBe("unreadable");
      // A refused open is not a first sight: the stored pin is still read.
      expect((await store.checkKey(PEER, KEY_A)).kind).toBe("match");
    });

    it("Pin store cannot be opened: a blocked open refuses at once, the next call opens again", async () => {
      const release = await holdOlderVersion("me");
      const store = getTofuStore("me");

      expect((await store.checkKey(PEER, KEY_A)).kind).toBe("unreadable");

      release();
      expect(await store.checkKey(PEER, KEY_A)).toEqual({ kind: "first-seen" });
      expect((await readPin("me", PEER))?.keys).toHaveLength(1);
    });
  });

  describe("Peer public keys are pinned on first use: storing and reading", () => {
    it("First sight", async () => {
      const seen = getTofuStore("me").checkKey(PEER, KEY_A);

      expect(await seen).toEqual({ kind: "first-seen" });
      // Reported once committed: another tab reads the pin at once.
      expect((await readPin("me", PEER))?.keys).toHaveLength(1);
    });

    it("Pin cannot be stored", async () => {
      abortAfterNextRequest("put");

      expect((await getTofuStore("me").checkKey(PEER, KEY_A)).kind).toBe(
        "unreadable",
      );
      expect(await readPin("me", PEER)).toBeUndefined();
    });

    it("Pin cannot be read", async () => {
      await storePinInAnotherTab();
      failNextRequest("get");

      expect((await getTofuStore("me").checkKey(PEER, KEY_B)).kind).toBe(
        "unreadable",
      );
      // The stored pin is not overwritten.
      expect((await readPin("me", PEER))?.keys).toEqual([
        expect.objectContaining({ publicKey: KEY_A }),
      ]);
    });

    it("Last-seen time not recorded", async () => {
      await storePinInAnotherTab();
      abortAfterNextRequest("put");

      expect((await getTofuStore("me").checkKey(PEER, KEY_A)).kind).toBe(
        "match",
      );
      expect((await readPin("me", PEER))?.keys[0].lastSeenAt).toBe(1);
    });
  });

  describe("The first sight of a peer key is decided once per peer", () => {
    it("Two keys of one peer seen at once", async () => {
      const store = getTofuStore("me");

      const results = await Promise.all([
        store.checkKey(PEER, KEY_A),
        store.checkKey(PEER, KEY_B),
      ]);

      expect(results.map((r) => r.kind).sort()).toEqual([
        "first-seen",
        "mismatch",
      ]);
      expect((await readPin("me", PEER))?.keys).toHaveLength(1);
    });

    it("One key of one peer seen twice at once", async () => {
      const store = getTofuStore("me");

      const results = await Promise.all([
        store.checkKey(PEER, KEY_A),
        store.checkKey(PEER, KEY_A),
      ]);

      expect(results.map((r) => r.kind).sort()).toEqual(["first-seen", "match"]);
    });

    it("Two tabs see a new peer", async () => {
      // Two stores of one user, each with its own connection, as two tabs.
      const results = await Promise.all([
        new TofuStore("me").checkKey(PEER, KEY_A),
        new TofuStore("me").checkKey(PEER, KEY_B),
      ]);

      expect(results.map((r) => r.kind).sort()).toEqual([
        "first-seen",
        "mismatch",
      ]);
      expect((await readPin("me", PEER))?.keys).toHaveLength(1);
    });
  });

  describe("writes that fail", () => {
    it("forget resolves when the delete fails", async () => {
      failNextRequest("delete");
      await expect(getTofuStore("me").forget(PEER)).resolves.toBeUndefined();
    });

    it("list is empty when the read fails", async () => {
      failNextRequest("getAll");
      expect(await getTofuStore("me").list()).toEqual([]);
    });

    it("clear resolves when the clear fails", async () => {
      failNextRequest("clear");
      await expect(getTofuStore("me").clear()).resolves.toBeUndefined();
    });
  });
});
