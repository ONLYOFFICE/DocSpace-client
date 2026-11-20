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

type Store = Map<string, unknown>;

export type MockUpgradeEvent = {
  oldVersion: number;
  newVersion: number | null;
};

class MockOpenRequest {
  result: MockDB | null = null;
  transaction: MockTransaction | null = null;
  error: Error | null = null;
  onupgradeneeded: ((event: MockUpgradeEvent) => void) | null = null;
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
  constructor(
    private store: Store,
    private tx?: MockTransaction,
  ) {}

  /** Runs one request: its result, its success callback, then the commit. */
  private run<T>(apply: () => T): MockRequest<T> {
    const req = new MockRequest<T>();
    this.tx?.begin();
    queueMicrotask(() => {
      req.result = apply();
      req.onsuccess?.();
      this.tx?.end();
    });
    return req;
  }

  get(key: string): MockRequest<unknown> {
    return this.run(() => this.store.get(key));
  }

  put(value: { userId: string }): MockRequest<void> {
    return this.run(() => {
      this.store.set(value.userId, value);
    });
  }

  delete(key: string): MockRequest<void> {
    return this.run(() => {
      this.store.delete(key);
    });
  }

  getAll(): MockRequest<unknown[]> {
    return this.run(() => Array.from(this.store.values()));
  }

  clear(): MockRequest<void> {
    return this.run(() => {
      this.store.clear();
    });
  }
}

/** Completes once every request made through it has settled. */
class MockTransaction {
  oncomplete: (() => void) | null = null;

  onabort: (() => void) | null = null;

  onerror: (() => void) | null = null;

  private pending = 0;

  constructor(private store: Store) {}

  objectStore(_name: string): MockObjectStore {
    return new MockObjectStore(this.store, this);
  }

  begin(): void {
    this.pending += 1;
  }

  end(): void {
    this.pending -= 1;
    if (this.pending > 0) return;
    queueMicrotask(() => {
      if (this.pending === 0) this.oncomplete?.();
    });
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

export function resetMockIDB(): void {
  dbs.clear();
}

export function seedMockIDB(
  name: string,
  version: number,
  storeName: string,
  records: { userId: string }[],
): void {
  const store: Store = new Map();
  for (const r of records) store.set(r.userId, r);
  dbs.set(name, { store, storeNames: new Set([storeName]), version });
}

export const mockIDB = {
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
} as unknown as IDBFactory;
