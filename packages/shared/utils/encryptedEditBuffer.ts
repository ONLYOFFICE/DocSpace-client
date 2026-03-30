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

const DB_NAME = "docspace_encrypted_edit";
const STORE_NAME = "buffers";
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

function getIDB(): IDBFactory | undefined {
  return typeof window !== "undefined" ? window.indexedDB : undefined;
}

async function ensureDB(): Promise<IDBDatabase> {
  if (db) {
    try {
      db.transaction(STORE_NAME, "readonly");
      return db;
    } catch {
      db = null;
    }
  }

  const idb = getIDB();
  if (!idb) throw new Error("IndexedDB is not available");

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = idb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error ?? new Error("Failed to open IndexedDB"));
    };
  });
}

export type EncryptedEditEntry = {
  id: string;
  fileId: number | string;
  buffer: ArrayBuffer;
  fileName: string;
  fileType: string;
  userPublicKey: string;
  wrappedDEK: string; // base64 wrapped DEK for re-encryption after edit
  userId: string;
  createdAt: number;
};

export function generateEditSessionId(fileId: number | string): string {
  return `encrypted_edit_${fileId}_${Date.now()}`;
}

export async function storeEditBuffer(
  entry: EncryptedEditEntry,
): Promise<void> {
  const database = await ensureDB();

  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put(entry);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Failed to store edit buffer"));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Transaction aborted"));
  });
}

export async function getEditBuffer(
  sessionId: string,
): Promise<EncryptedEditEntry | null> {
  const database = await ensureDB();

  return new Promise<EncryptedEditEntry | null>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(sessionId);

    request.onsuccess = () =>
      resolve((request.result as EncryptedEditEntry) ?? null);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to read edit buffer"));
  });
}

export async function deleteEditBuffer(sessionId: string): Promise<void> {
  const database = await ensureDB();

  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.delete(sessionId);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Failed to delete edit buffer"));
  });
}

export async function cleanupStaleBuffers(
  maxAgeMs: number = 3600000,
): Promise<void> {
  const database = await ensureDB();

  const items = await new Promise<EncryptedEditEntry[]>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () =>
      resolve((request.result as EncryptedEditEntry[]) ?? []);
    request.onerror = () => reject(request.error);
  });

  const cutoff = Date.now() - maxAgeMs;
  const staleIds = items
    .filter((entry) => entry.createdAt < cutoff)
    .map((entry) => entry.id);

  if (staleIds.length === 0) return;

  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    for (const id of staleIds) {
      store.delete(id);
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
