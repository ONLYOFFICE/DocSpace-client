// (c) Copyright Ascensio System SIA 2009-2025
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

import { ENCRYPTION_CONSTANTS } from "./types";

const DB_NAME = "docspace_encryption";
const STORE_NAME = "keys";
const DB_VERSION = 1;
const PRIVATE_KEY_ID = "user_private_key";
const TIMESTAMP_KEY = "cache_timestamp";
const USER_ID_KEY = "cache_user_id";

type UnlockRequestCallback = () => Promise<CryptoKey | null>;
let globalUnlockRequestHandler: UnlockRequestCallback | null = null;

export function registerUnlockHandler(
  handler: UnlockRequestCallback,
): void {
  globalUnlockRequestHandler = handler;
}

export function unregisterUnlockHandler(): void {
  globalUnlockRequestHandler = null;
}

export async function requestUnlock(): Promise<CryptoKey | null> {
  const cachedKey = await SecretStorageService.getCachedKey();
  if (cachedKey) return cachedKey;

  if (!globalUnlockRequestHandler) {
    console.warn(
      "[SecretStorage] No unlock handler registered. " +
        "Ensure EncryptionProvider is mounted.",
    );
    return null;
  }

  return globalUnlockRequestHandler();
}

// ============================================================================
// IndexedDB helpers
// ============================================================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbPut(
  db: IDBDatabase,
  key: string,
  value: unknown,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbGet<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

function idbClear(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

// ============================================================================
// SecretStorageService
//
// Stores CryptoKey objects in IndexedDB with extractable=false.
// The raw key material is never accessible to JavaScript — even if XSS
// reads IndexedDB, the attacker gets an opaque CryptoKey handle that
// cannot be exported.
// ============================================================================

export const SecretStorageService = {
  async cacheDecryptedKey(
    privateKey: CryptoKey,
    userId?: string,
  ): Promise<void> {
    if (!isIndexedDBAvailable()) {
      console.warn("IndexedDB not available — key will not be cached");
      return;
    }

    try {
      let keyToStore = privateKey;

      if (privateKey.extractable) {
        const subtle = globalThis.crypto.subtle;
        const pkcs8 = await subtle.exportKey("pkcs8", privateKey);
        keyToStore = await subtle.importKey(
          "pkcs8",
          pkcs8,
          { name: "ECDH", namedCurve: ENCRYPTION_CONSTANTS.ECDH_CURVE },
          false,
          ["deriveKey", "deriveBits"],
        );
        new Uint8Array(pkcs8).fill(0);
      }

      const db = await openDB();
      try {
        await idbPut(db, PRIVATE_KEY_ID, keyToStore);
        await idbPut(db, TIMESTAMP_KEY, Date.now());
        if (userId) {
          await idbPut(db, USER_ID_KEY, userId);
        }
      } finally {
        db.close();
      }
    } catch (error) {
      console.warn("Failed to cache encryption key:", error);
    }
  },

  async getCachedKey(userId?: string): Promise<CryptoKey | null> {
    if (!isIndexedDBAvailable()) return null;

    try {
      const db = await openDB();
      try {
        const timestamp = await idbGet<number>(db, TIMESTAMP_KEY);
        if (
          !timestamp ||
          Date.now() - timestamp >
            ENCRYPTION_CONSTANTS.SESSION_CACHE_DURATION_MS
        ) {
          await idbClear(db);
          return null;
        }

        // If userId provided, verify the cached key belongs to this user
        if (userId) {
          const cachedUserId = await idbGet<string>(db, USER_ID_KEY);
          if (cachedUserId && cachedUserId !== userId) {
            await idbClear(db);
            return null;
          }
        }

        const key = await idbGet<CryptoKey>(db, PRIVATE_KEY_ID);
        return key ?? null;
      } finally {
        db.close();
      }
    } catch (error) {
      console.warn("Failed to retrieve cached key:", error);
      return null;
    }
  },

  async hasDecryptedKey(userId?: string): Promise<boolean> {
    if (!isIndexedDBAvailable()) return false;
    try {
      const db = await openDB();
      try {
        const timestamp = await idbGet<number>(db, TIMESTAMP_KEY);
        if (
          !timestamp ||
          Date.now() - timestamp >
            ENCRYPTION_CONSTANTS.SESSION_CACHE_DURATION_MS
        ) {
          return false;
        }

        // If userId provided, verify ownership
        if (userId) {
          const cachedUserId = await idbGet<string>(db, USER_ID_KEY);
          if (cachedUserId && cachedUserId !== userId) {
            return false;
          }
        }

        const key = await idbGet<CryptoKey>(db, PRIVATE_KEY_ID);
        return key !== undefined;
      } finally {
        db.close();
      }
    } catch {
      return false;
    }
  },

  async clearCache(): Promise<void> {
    if (!isIndexedDBAvailable()) return;
    try {
      const db = await openDB();
      try {
        await idbClear(db);
      } finally {
        db.close();
      }
    } catch {
      // Ignore errors during cleanup
    }
  },

  async lockEncryption(): Promise<void> {
    await this.clearCache();
  },
};

export default SecretStorageService;
