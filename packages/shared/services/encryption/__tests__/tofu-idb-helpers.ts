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

// An IndexedDB with real transactions for the pin store tests: a fresh
// factory per test, a second connection standing for another tab, failures
// injected into one request, and an open blocked by an older version.

import { IDBFactory, IDBObjectStore } from "fake-indexeddb";
import { afterEach, beforeEach, vi } from "vitest";

import { resetTofuStores } from "../tofu-store";

export const pinStoreName = (scopeId: string) => `docspace-tofu-${scopeId}`;

/** Gives each test of the calling file an empty IndexedDB of its own. */
export function useFreshIndexedDb(): void {
  beforeEach(() => {
    vi.stubGlobal("indexedDB", new IDBFactory());
    resetTofuStores();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    resetTofuStores();
  });
}

const request = <T>(req: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

/** A connection of another tab to the pin store of `scopeId`, at its version. */
export function openAnotherTab(scopeId: string): Promise<IDBDatabase> {
  const req = indexedDB.open(pinStoreName(scopeId), 2);
  req.onupgradeneeded = () => {
    if (!req.result.objectStoreNames.contains("known_keys")) {
      req.result.createObjectStore("known_keys", { keyPath: "userId" });
    }
  };
  return request(req);
}

/** The peer's record as another tab reads it. */
export async function readPin(scopeId: string, peerId: string) {
  const db = await openAnotherTab(scopeId);
  try {
    return await request(
      db.transaction("known_keys", "readonly").objectStore("known_keys").get(peerId),
    );
  } finally {
    db.close();
  }
}

/**
 * Holds the pin store open at version 1 without giving way, as a tab of an
 * older build does, so an open at version 2 is blocked. Returns the release.
 */
export async function holdOlderVersion(scopeId: string): Promise<() => void> {
  const req = indexedDB.open(pinStoreName(scopeId), 1);
  req.onupgradeneeded = () => {
    req.result.createObjectStore("known_keys", { keyPath: "userId" });
  };
  const db = await request(req);
  return () => db.close();
}

type StoreMethod = "get" | "put" | "delete" | "getAll" | "clear";

/** The next `method` call fails: its transaction aborts before the request. */
export function failNextRequest(method: StoreMethod): void {
  const original = IDBObjectStore.prototype[method];
  vi.spyOn(IDBObjectStore.prototype, method).mockImplementationOnce(function (
    this: IDBObjectStore,
    ...args: unknown[]
  ) {
    const req = (original as (...a: unknown[]) => IDBRequest).apply(this, args);
    this.transaction.abort();
    return req;
  });
}

/**
 * The next `method` call succeeds, then its transaction aborts, so nothing
 * it wrote is committed.
 */
export function abortAfterNextRequest(method: StoreMethod): void {
  const original = IDBObjectStore.prototype[method];
  vi.spyOn(IDBObjectStore.prototype, method).mockImplementationOnce(function (
    this: IDBObjectStore,
    ...args: unknown[]
  ) {
    const req = (original as (...a: unknown[]) => IDBRequest).apply(this, args);
    const transaction = this.transaction;
    req.addEventListener("success", () => transaction.abort());
    return req;
  });
}
