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

// IndexedDB-backed TOFU store for peer X25519 public keys.
// Per-scopeId DB (one per logged-in user). Soft-fails when IDB is unavailable.

import { base64ToUint8Array } from "./utils";

export type TofuKeySource = "first-seen" | "accepted" | "migrated-v1";

export type TofuKeyEntry = {
  publicKey: string;
  firstSeenAt: number;
  lastSeenAt: number;
  verifiedAt: number | null;
  source: TofuKeySource;
};

export type TofuRecord = {
  userId: string;
  keys: TofuKeyEntry[];
};

type LegacyTofuRecordV1 = {
  userId: string;
  publicKey: string;
  firstSeenAt: number;
  lastSeenAt: number;
  verifiedAt: number | null;
};

export type TofuCheckResult =
  | { kind: "first-seen" }
  /** The pin store is open but the peer's record could not be read. */
  | { kind: "unavailable" }
  | { kind: "match"; record: TofuRecord; matchedKey: TofuKeyEntry }
  | {
      kind: "mismatch";
      known: TofuKeyEntry;
      knownKeys: TofuKeyEntry[];
      submitted: string;
    };

const UNREADABLE = Symbol("unreadable");

/** The pin store exists but cannot be opened now; the next call tries again. */
const NOT_OPEN = Symbol("not-open");

/** An open database, `null` for the in-memory store, or `NOT_OPEN`. */
type OpenResult = IDBDatabase | null | typeof NOT_OPEN;

// Errors of a browser that gives the page no IndexedDB at all.
const STORAGE_REFUSED = new Set(["SecurityError", "InvalidStateError"]);

const DB_NAME_PREFIX = "docspace-tofu-";
const STORE_NAME = "known_keys";
const DB_VERSION = 2;

function isLegacyRecord(row: unknown): row is LegacyTofuRecordV1 {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  return typeof r.publicKey === "string" && !Array.isArray(r.keys);
}

function migrateLegacyRecord(row: LegacyTofuRecordV1): TofuRecord {
  return {
    userId: row.userId,
    keys: [
      {
        publicKey: row.publicKey,
        firstSeenAt: row.firstSeenAt,
        lastSeenAt: row.lastSeenAt,
        verifiedAt: row.verifiedAt,
        source: "migrated-v1",
      },
    ],
  };
}

function normalizeRecord(row: unknown): TofuRecord | null {
  if (!row || typeof row !== "object") return null;
  if (isLegacyRecord(row)) return migrateLegacyRecord(row);
  const r = row as TofuRecord;
  if (!Array.isArray(r.keys) || r.keys.length === 0) return null;
  return r;
}

function mostRecentKey(keys: TofuKeyEntry[]): TofuKeyEntry {
  let best = keys[0];
  for (const k of keys) {
    if (k.lastSeenAt >= best.lastSeenAt) best = k;
  }
  return best;
}

type KeyDecision = { result: TofuCheckResult; record?: TofuRecord };

/** What a seen key means against the peer's record, and the record to store. */
function decideKey(
  existing: TofuRecord | null,
  userId: string,
  publicKey: string,
  now: number,
): KeyDecision {
  if (!existing) {
    const record: TofuRecord = {
      userId,
      keys: [
        {
          publicKey,
          firstSeenAt: now,
          lastSeenAt: now,
          verifiedAt: null,
          source: "first-seen",
        },
      ],
    };
    return { result: { kind: "first-seen" }, record };
  }

  const matchIndex = existing.keys.findIndex((k) =>
    keysEqual(k.publicKey, publicKey),
  );
  if (matchIndex > -1) {
    const matchedKey: TofuKeyEntry = {
      ...existing.keys[matchIndex],
      lastSeenAt: now,
    };
    const updated: TofuRecord = {
      ...existing,
      keys: existing.keys.map((k, i) => (i === matchIndex ? matchedKey : k)),
    };
    return {
      result: { kind: "match", record: updated, matchedKey },
      record: updated,
    };
  }

  return {
    result: {
      kind: "mismatch",
      known: mostRecentKey(existing.keys),
      knownKeys: existing.keys,
      submitted: publicKey,
    },
  };
}

function getIDB(): IDBFactory | null {
  if (typeof indexedDB === "undefined") return null;
  return indexedDB;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function keysEqual(a: string, b: string): boolean {
  try {
    return constantTimeEqual(base64ToUint8Array(a), base64ToUint8Array(b));
  } catch {
    return false;
  }
}

let warnedUnavailable = false;
function warnUnavailableOnce(): void {
  if (warnedUnavailable) return;
  warnedUnavailable = true;
  if (typeof console !== "undefined") {
    // biome-ignore lint/suspicious/noConsole: surface IndexedDB unavailability once per session for diagnostics.
    console.warn(
      "TofuStore: IndexedDB is unavailable; falling back to in-memory state. " +
        "Key-change detection works for the current session only.",
    );
  }
}

export class TofuStore {
  private readonly scopeId: string;

  private dbPromise: Promise<OpenResult> | null = null;

  private memoryStore: Map<string, TofuRecord> | null = null;

  constructor(scopeId: string) {
    if (!scopeId) {
      throw new Error("TofuStore: scopeId is required");
    }
    this.scopeId = scopeId;
  }

  private getMemoryStore(): Map<string, TofuRecord> {
    if (!this.memoryStore) this.memoryStore = new Map();
    return this.memoryStore;
  }

  private keepInMemory(): Promise<OpenResult> {
    warnUnavailableOnce();
    this.dbPromise = Promise.resolve(null);
    return this.dbPromise;
  }

  // Spec: private-rooms/encryption-core, "Peer public keys are pinned on first use"
  private openDB(): Promise<OpenResult> {
    if (this.dbPromise !== null) return this.dbPromise;
    const factory = getIDB();
    if (!factory) return this.keepInMemory();
    let req: IDBOpenDBRequest;
    try {
      req = factory.open(`${DB_NAME_PREFIX}${this.scopeId}`, DB_VERSION);
    } catch {
      return this.keepInMemory();
    }
    let refused = false;
    const opening = new Promise<OpenResult>((resolve) => {
      const refuse = () => {
        refused = true;
        if (this.dbPromise === opening) this.dbPromise = null;
        resolve(NOT_OPEN);
      };
      req.onupgradeneeded = (event) => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "userId" });
        }
        const oldVersion = event?.oldVersion ?? 0;
        if (oldVersion > 0 && oldVersion < 2) {
          try {
            const store = req.transaction?.objectStore(STORE_NAME);
            const getAllReq = store?.getAll();
            if (getAllReq && store) {
              getAllReq.onsuccess = () => {
                for (const row of getAllReq.result ?? []) {
                  if (isLegacyRecord(row)) {
                    store.put(migrateLegacyRecord(row));
                  }
                }
              };
              getAllReq.onerror = () => {
                if (typeof console !== "undefined") {
                  // biome-ignore lint/suspicious/noConsole: diagnostic-only on migration read failure.
                  console.warn("TofuStore: v1→v2 bulk migration read failed");
                }
              };
            }
          } catch {
          }
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        // Refused while blocked: the next call opens a connection of its own.
        if (refused) {
          db.close();
          return;
        }
        db.onversionchange = () => {
          db.close();
          this.dbPromise = null;
        };
        resolve(db);
      };
      req.onerror = () => {
        if (typeof console !== "undefined") {
          // biome-ignore lint/suspicious/noConsole: diagnostic-only on IndexedDB open failure.
          console.error("TofuStore: open failed", req.error);
        }
        if (STORAGE_REFUSED.has(req.error?.name ?? "")) {
          warnUnavailableOnce();
          resolve(null);
          return;
        }
        refuse();
      };
      req.onblocked = () => {
        if (typeof console !== "undefined") {
          // biome-ignore lint/suspicious/noConsole: diagnostic-only on IndexedDB open blocked.
          console.warn("TofuStore: open blocked");
        }
        refuse();
      };
    });
    this.dbPromise = opening;
    return opening;
  }

  /** The peer's record, `null` when there is none, `UNREADABLE` when the read failed. */
  private async readRecord(
    userId: string,
  ): Promise<TofuRecord | null | typeof UNREADABLE> {
    const db = await this.openDB();
    if (db === NOT_OPEN) return UNREADABLE;
    if (!db) {
      return normalizeRecord(this.getMemoryStore().get(userId));
    }
    return new Promise<TofuRecord | null | typeof UNREADABLE>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(userId);
        req.onsuccess = () => {
          resolve(normalizeRecord(req.result));
        };
        req.onerror = () => resolve(UNREADABLE);
      } catch {
        resolve(UNREADABLE);
      }
    });
  }

  private async getRecord(userId: string): Promise<TofuRecord | null> {
    const record = await this.readRecord(userId);
    return record === UNREADABLE ? null : record;
  }

  /** Runs one write in a transaction of its own; true once it is committed. */
  private async write(
    inMemory: (memory: Map<string, TofuRecord>) => void,
    inStore: (store: IDBObjectStore) => void,
  ): Promise<boolean> {
    const db = await this.openDB();
    if (db === NOT_OPEN) return false;
    if (!db) {
      inMemory(this.getMemoryStore());
      return true;
    }
    return new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        inStore(tx.objectStore(STORE_NAME));
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  private putRecord(record: TofuRecord): Promise<boolean> {
    return this.write(
      (memory) => memory.set(record.userId, record),
      (store) => store.put(record),
    );
  }

  private deleteRecord(userId: string): Promise<boolean> {
    return this.write(
      (memory) => memory.delete(userId),
      (store) => store.delete(userId),
    );
  }

  async checkKey(
    userId: string,
    publicKey: string,
  ): Promise<TofuCheckResult> {
    if (!userId || !publicKey) {
      throw new Error("TofuStore.checkKey: userId and publicKey are required");
    }

    // Spec: private-rooms/encryption-core, "The first sight of a peer key is decided once per peer"
    const db = await this.openDB();
    if (db === NOT_OPEN) return { kind: "unavailable" };
    if (!db) {
      // Read and write with no await between them, so the tab decides once.
      const memory = this.getMemoryStore();
      const decision = decideKey(
        normalizeRecord(memory.get(userId)),
        userId,
        publicKey,
        Date.now(),
      );
      if (decision.record) memory.set(userId, decision.record);
      return decision.result;
    }

    // One readwrite transaction reads and pins, so tabs cannot both find the
    // peer unpinned; the answer waits for the commit.
    return new Promise<TofuCheckResult>((resolve) => {
      let decision: KeyDecision | null = null;
      const failed = () =>
        // A match stands without its timestamp; nothing else does.
        resolve(
          decision?.result.kind === "match"
            ? decision.result
            : { kind: "unavailable" },
        );
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(userId);
        req.onsuccess = () => {
          decision = decideKey(
            normalizeRecord(req.result),
            userId,
            publicKey,
            Date.now(),
          );
          if (decision.record) store.put(decision.record);
        };
        tx.oncomplete = () => resolve(decision?.result ?? { kind: "unavailable" });
        tx.onerror = failed;
        tx.onabort = failed;
      } catch {
        resolve({ kind: "unavailable" });
      }
    });
  }

  /** Trusts the key for the peer; resolves whether it is stored. */
  async acceptKey(userId: string, publicKey: string): Promise<boolean> {
    if (!userId || !publicKey) {
      throw new Error("TofuStore.acceptKey: userId and publicKey are required");
    }
    const existing = await this.readRecord(userId);
    if (existing === UNREADABLE) return false;
    const now = Date.now();
    if (!existing) {
      return this.putRecord({
        userId,
        keys: [
          {
            publicKey,
            firstSeenAt: now,
            lastSeenAt: now,
            verifiedAt: null,
            source: "accepted",
          },
        ],
      });
    }
    const idx = existing.keys.findIndex((k) =>
      keysEqual(k.publicKey, publicKey),
    );
    const keys =
      idx > -1
        ? existing.keys.map((k, i) =>
            i === idx ? { ...k, lastSeenAt: now } : k,
          )
        : [
            ...existing.keys,
            {
              publicKey,
              firstSeenAt: now,
              lastSeenAt: now,
              verifiedAt: null,
              source: "accepted" as const,
            },
          ];
    return this.putRecord({ ...existing, keys });
  }

  async getKeys(userId: string): Promise<TofuKeyEntry[]> {
    if (!userId) return [];
    const existing = await this.getRecord(userId);
    return existing ? [...existing.keys] : [];
  }

  async forgetKey(userId: string, publicKey: string): Promise<void> {
    if (!userId || !publicKey) {
      throw new Error("TofuStore.forgetKey: userId and publicKey are required");
    }
    const existing = await this.getRecord(userId);
    if (!existing) return;
    const keys = existing.keys.filter((k) => !keysEqual(k.publicKey, publicKey));
    if (keys.length === existing.keys.length) return;
    if (keys.length === 0) {
      await this.deleteRecord(userId);
      return;
    }
    await this.putRecord({ ...existing, keys });
  }

  async markVerified(userId: string, publicKey?: string): Promise<void> {
    const existing = await this.getRecord(userId);
    if (!existing) return;
    const target = publicKey
      ? existing.keys.find((k) => keysEqual(k.publicKey, publicKey))
      : mostRecentKey(existing.keys);
    if (!target) return;
    const now = Date.now();
    await this.putRecord({
      ...existing,
      keys: existing.keys.map((k) =>
        k === target ? { ...k, verifiedAt: now } : k,
      ),
    });
  }

  async forget(userId: string): Promise<void> {
    await this.deleteRecord(userId);
  }

  async list(): Promise<TofuRecord[]> {
    const db = await this.openDB();
    if (db === NOT_OPEN) return [];
    if (!db) {
      return Array.from(this.getMemoryStore().values());
    }
    return new Promise<TofuRecord[]>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () =>
          resolve(
            ((req.result as unknown[]) ?? [])
              .map(normalizeRecord)
              .filter((r): r is TofuRecord => r !== null),
          );
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  async clear(): Promise<void> {
    await this.write(
      (memory) => memory.clear(),
      (store) => store.clear(),
    );
  }
}

const instances = new Map<string, TofuStore>();

export function getTofuStore(scopeId: string): TofuStore {
  let s = instances.get(scopeId);
  if (!s) {
    s = new TofuStore(scopeId);
    instances.set(scopeId, s);
  }
  return s;
}

export function resetTofuStores(): void {
  instances.clear();
}

// Mismatch resolver - lives in the React context (shows a modal); helpers
// without React access call the registered handler. No handler => refuse.

export type KeyMismatchInfo = {
  userId: string;
  knownKey: string;
  newKey: string;
  knownFirstSeenAt: number;
  knownLastSeenAt: number;
  displayName?: string;
};

export type KeyMismatchDecision = "accept" | "refuse";

export type KeyMismatchResolver = (
  info: KeyMismatchInfo,
) => Promise<KeyMismatchDecision>;

let _mismatchHandler: KeyMismatchResolver | null = null;

export function registerKeyMismatchHandler(handler: KeyMismatchResolver): void {
  _mismatchHandler = handler;
}

export function unregisterKeyMismatchHandler(): void {
  _mismatchHandler = null;
}

export function getKeyMismatchHandler(): KeyMismatchResolver | null {
  return _mismatchHandler;
}
