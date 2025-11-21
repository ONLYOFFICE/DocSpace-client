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
