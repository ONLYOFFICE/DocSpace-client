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

const DB_VERSION = 1;
const MAX_COUNT_STORE = 30;

const idb = window?.indexedDB;

class IndexedDBHelper {
  db: IDBDatabase | null = null;

  ignoreIds: IDBValidKey[] = [];

  firstCheck: boolean = false;

  init = async (userId: string, storeNames: string[]) => {
    return new Promise<void>((resolve, reject) => {
      if (!idb) {
        this.setDB(null);
        reject();
      }

      const request = idb.open(`${userId}`, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        storeNames.forEach((store) => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: "id" });
          }
        });
      };

      request.onerror = () => {
        console.error("Error", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.setDB(request.result);
        resolve();
      };
    });
  };

  setDB = (db: IDBDatabase | null) => {
    this.db = db;
  };

  getDB = () => {
    return this.db;
  };

  deleteDatabase = (dbName: string) => {
    idb.deleteDatabase(`${dbName}`);
  };

  clearStore = (storeName: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const transaction = this.db?.transaction(storeName, "readwrite");

        const store = transaction?.objectStore(storeName);

        store?.clear();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };

  deleteStore = (storeName: string) => {
    this.db?.deleteObjectStore(storeName);
  };

  addItem = (
    storeName: string,
    item: { id: IDBValidKey; src?: Blob; version?: number; created?: Date },
  ) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const transaction = this.db?.transaction(storeName, "readwrite");

        const store = transaction?.objectStore(storeName);

        store?.add(item);
        this.ignoreIds.push(item.id);

        this.checkStore(store);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };

  getItem = (storeName: string, id: string | number) => {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db?.transaction(storeName, "readonly");

        const store = transaction?.objectStore(storeName);

        const request = store?.get(id);

        if (request) {
          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => {
            console.error("Error", request.error);
            reject(request.error);
          };
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  checkStore = (store: IDBObjectStore | undefined) => {
    let newIgnoreIds = [...this.ignoreIds];

    newIgnoreIds = newIgnoreIds.filter(
      (id, index) => newIgnoreIds.indexOf(id) === index,
    );

    if (!this.firstCheck) {
      this.firstCheck = true;
      const countRequest = store?.getAllKeys();

      if (countRequest) {
        countRequest.onsuccess = () => {
          newIgnoreIds = [...countRequest.result, ...newIgnoreIds];
          if (newIgnoreIds.length > MAX_COUNT_STORE) {
            const id = newIgnoreIds.shift();
            if (id) store?.delete(id);
          }

          this.ignoreIds = newIgnoreIds;
        };
      }
    } else {
      if (newIgnoreIds.length > MAX_COUNT_STORE) {
        const id = newIgnoreIds.shift();
        if (id) store?.delete(id);
      }
      this.ignoreIds = newIgnoreIds;
    }
  };
}

const indexedDbHelper = new IndexedDBHelper();

export default indexedDbHelper;
