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

import type { IdentityKeyPair } from "./types";
import {
  base64ToUint8Array,
  concatBuffers,
  getCrypto,
  getRandomBytes,
  utf8,
} from "./utils";

const DB_NAME = "docspace-device-unlock";
const STORE_NAME = "device_unlock";
const DB_VERSION = 1;
const IV_SIZE = 12;
const AAD_PREFIX = "dse-device-unlock-v1";

type DeviceUnlockRecord = {
  userId: string;
  publicKey: string;
  wrappingKey: CryptoKey;
  iv: ArrayBuffer;
  ciphertext: ArrayBuffer;
  updatedAt: number;
};

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
  if (dbPromise !== null) return dbPromise;
  if (typeof indexedDB === "undefined") {
    dbPromise = Promise.resolve(null);
    return dbPromise;
  }
  dbPromise = new Promise<IDBDatabase | null>((resolve) => {
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "userId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });
  return dbPromise;
}

function getRecord(userId: string): Promise<DeviceUnlockRecord | null> {
  return openDB().then((db) => {
    if (!db) return null;
    return new Promise<DeviceUnlockRecord | null>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(userId);
        req.onsuccess = () =>
          resolve((req.result as DeviceUnlockRecord | undefined) ?? null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  });
}

function putRecord(record: DeviceUnlockRecord): Promise<boolean> {
  return openDB().then((db) => {
    if (!db) return false;
    return new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const req = tx.objectStore(STORE_NAME).put(record);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  });
}

function deleteRecord(userId: string): Promise<void> {
  return openDB().then((db) => {
    if (!db) return undefined;
    return new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const req = tx.objectStore(STORE_NAME).delete(userId);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  });
}

function buildAad(publicKeyB64: string): Uint8Array {
  return concatBuffers(utf8(AAD_PREFIX), base64ToUint8Array(publicKeyB64));
}

export async function persistDeviceUnlock(
  userId: string,
  publicKeyB64: string,
  kp: IdentityKeyPair,
): Promise<boolean> {
  if (!userId || !publicKeyB64) return false;
  try {
    const subtle = getCrypto();
    const wrappingKey = await subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    const iv = getRandomBytes(IV_SIZE);
    const ciphertext = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
        additionalData: buildAad(publicKeyB64) as BufferSource,
      },
      wrappingKey,
      kp.privateKey as BufferSource,
    );
    return await putRecord({
      userId,
      publicKey: publicKeyB64,
      wrappingKey,
      iv: iv.buffer as ArrayBuffer,
      ciphertext,
      updatedAt: Date.now(),
    });
  } catch {
    return false;
  }
}

export async function restoreDeviceUnlock(
  userId: string,
  expectedPublicKeyB64: string,
): Promise<IdentityKeyPair | null> {
  if (!userId || !expectedPublicKeyB64) return null;
  const record = await getRecord(userId);
  if (!record) return null;
  if (record.publicKey !== expectedPublicKeyB64) {
    await deleteRecord(userId);
    return null;
  }
  try {
    const subtle = getCrypto();
    const plaintext = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: record.iv,
        additionalData: buildAad(record.publicKey) as BufferSource,
      },
      record.wrappingKey,
      record.ciphertext,
    );
    return {
      publicKey: base64ToUint8Array(record.publicKey),
      privateKey: new Uint8Array(plaintext),
    };
  } catch {
    await deleteRecord(userId);
    return null;
  }
}

export async function hasDeviceUnlock(userId: string): Promise<boolean> {
  if (!userId) return false;
  return (await getRecord(userId)) !== null;
}

export async function forgetDeviceUnlock(userId: string): Promise<void> {
  if (!userId) return;
  await deleteRecord(userId);
}

export function resetDeviceUnlockStoreForTests(): void {
  dbPromise = null;
}
