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

// IndexedDB-backed TOFU store for peer X25519 public keys.
// Per-scopeId DB (one per logged-in user). Soft-fails when IDB is unavailable.

export type TofuRecord = {
  userId: string;
  publicKey: string;
  firstSeenAt: number;
  lastSeenAt: number;
  verifiedAt: number | null;
};

export type TofuCheckResult =
  | { kind: "first-seen" }
  | { kind: "match"; record: TofuRecord }
  | { kind: "mismatch"; known: TofuRecord; submitted: string };

const DB_NAME_PREFIX = "docspace-tofu-";
const STORE_NAME = "known_keys";
const DB_VERSION = 1;

function getIDB(): IDBFactory | null {
  if (typeof indexedDB === "undefined") return null;
  return indexedDB;
}

let warnedUnavailable = false;
function warnUnavailableOnce(): void {
  if (warnedUnavailable) return;
  warnedUnavailable = true;
  if (typeof console !== "undefined") {
    console.warn(
      "TofuStore: IndexedDB is unavailable; key-change detection disabled.",
    );
  }
}

export class TofuStore {
  private readonly scopeId: string;

  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor(scopeId: string) {
    if (!scopeId) {
      throw new Error("TofuStore: scopeId is required");
    }
    this.scopeId = scopeId;
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
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "userId" });
        }
      };
      req.onsuccess = () => {
        resolve(req.result);
      };
      req.onerror = () => {
        if (typeof console !== "undefined") {
          console.error("TofuStore: open failed", req.error);
        }
        resolve(null);
      };
      req.onblocked = () => {
        if (typeof console !== "undefined") {
          console.warn("TofuStore: open blocked");
        }
        resolve(null);
      };
    });
    return this.dbPromise;
  }

  private async getRecord(userId: string): Promise<TofuRecord | null> {
    const db = await this.openDB();
    if (!db) return null;
    return new Promise<TofuRecord | null>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(userId);
        req.onsuccess = () => {
          const result = req.result as TofuRecord | undefined;
          resolve(result ?? null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  private async putRecord(record: TofuRecord): Promise<void> {
    const db = await this.openDB();
    if (!db) return;
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
    if (!db) return;
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
        publicKey,
        firstSeenAt: now,
        lastSeenAt: now,
        verifiedAt: null,
      };
      await this.putRecord(record);
      return { kind: "first-seen" };
    }

    if (existing.publicKey === publicKey) {
      const updated: TofuRecord = { ...existing, lastSeenAt: now };
      await this.putRecord(updated);
      return { kind: "match", record: updated };
    }

    return { kind: "mismatch", known: existing, submitted: publicKey };
  }

  /** Overwrite the entry; resets verifiedAt. */
  async acceptKey(userId: string, publicKey: string): Promise<void> {
    if (!userId || !publicKey) {
      throw new Error("TofuStore.acceptKey: userId and publicKey are required");
    }
    const existing = await this.getRecord(userId);
    const now = Date.now();
    const record: TofuRecord = {
      userId,
      publicKey,
      firstSeenAt: existing?.firstSeenAt ?? now,
      lastSeenAt: now,
      verifiedAt: null,
    };
    await this.putRecord(record);
  }

  /** Mark the current key as out-of-band verified; no-op if unknown. */
  async markVerified(userId: string): Promise<void> {
    const existing = await this.getRecord(userId);
    if (!existing) return;
    await this.putRecord({ ...existing, verifiedAt: Date.now() });
  }

  async forget(userId: string): Promise<void> {
    await this.deleteRecord(userId);
  }

  async list(): Promise<TofuRecord[]> {
    const db = await this.openDB();
    if (!db) return [];
    return new Promise<TofuRecord[]>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as TofuRecord[]) ?? []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  async clear(): Promise<void> {
    const db = await this.openDB();
    if (!db) return;
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
// without React access call the registered handler. No handler ⇒ refuse.

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
