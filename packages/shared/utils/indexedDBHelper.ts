/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
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
