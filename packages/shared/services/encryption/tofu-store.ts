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
  | { kind: "match"; record: TofuRecord; matchedKey: TofuKeyEntry }
  | {
      kind: "mismatch";
      known: TofuKeyEntry;
      knownKeys: TofuKeyEntry[];
      submitted: string;
    };

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

  private dbPromise: Promise<IDBDatabase | null> | null = null;

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

  private openDB(): Promise<IDBDatabase | null> {
    if (this.dbPromise !== null) return this.dbPromise;
    const factory = getIDB();
    if (!factory) {
      warnUnavailableOnce();
      this.dbPromise = Promise.resolve(null);
      return this.dbPromise;
    }
    this.dbPromise = new Promise<IDBDatabase | null>((resolve) => {
      const req = factory.open(`${DB_NAME_PREFIX}${this.scopeId}`, DB_VERSION);
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
        warnUnavailableOnce();
        resolve(null);
      };
      req.onblocked = () => {
        if (typeof console !== "undefined") {
          // biome-ignore lint/suspicious/noConsole: diagnostic-only on IndexedDB open blocked.
          console.warn("TofuStore: open blocked");
        }
        warnUnavailableOnce();
        resolve(null);
      };
    });
    return this.dbPromise;
  }

  private async getRecord(userId: string): Promise<TofuRecord | null> {
    const db = await this.openDB();
    if (!db) {
      return normalizeRecord(this.getMemoryStore().get(userId));
    }
    return new Promise<TofuRecord | null>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(userId);
        req.onsuccess = () => {
          resolve(normalizeRecord(req.result));
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  private async putRecord(record: TofuRecord): Promise<void> {
    const db = await this.openDB();
    if (!db) {
      this.getMemoryStore().set(record.userId, record);
      return;
    }
    return new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private async deleteRecord(userId: string): Promise<void> {
    const db = await this.openDB();
    if (!db) {
      this.getMemoryStore().delete(userId);
      return;
    }
    return new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(userId);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async checkKey(
    userId: string,
    publicKey: string,
  ): Promise<TofuCheckResult> {
    if (!userId || !publicKey) {
      throw new Error("TofuStore.checkKey: userId and publicKey are required");
    }

    const existing = await this.getRecord(userId);
    const now = Date.now();

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
      await this.putRecord(record);
      return { kind: "first-seen" };
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
      await this.putRecord(updated);
      return { kind: "match", record: updated, matchedKey };
    }

    return {
      kind: "mismatch",
      known: mostRecentKey(existing.keys),
      knownKeys: existing.keys,
      submitted: publicKey,
    };
  }

  async acceptKey(userId: string, publicKey: string): Promise<void> {
    if (!userId || !publicKey) {
      throw new Error("TofuStore.acceptKey: userId and publicKey are required");
    }
    const existing = await this.getRecord(userId);
    const now = Date.now();
    if (!existing) {
      await this.putRecord({
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
      return;
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
    await this.putRecord({ ...existing, keys });
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
    const db = await this.openDB();
    if (!db) {
      this.getMemoryStore().clear();
      return;
    }
    return new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
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
