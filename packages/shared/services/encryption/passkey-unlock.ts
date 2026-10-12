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
  zeroBuffer,
} from "./utils";

const DB_NAME = "docspace-passkey-unlock";
const STORE_NAME = "passkey_unlock";
const DB_VERSION = 1;
const IV_SIZE = 12;
const PRF_SALT_SIZE = 32;
const AAD_PREFIX = "dse-passkey-unlock-v1";
const HKDF_INFO = "dse-passkey-unlock-kek-v1";

type PasskeyUnlockRecord = {
  userId: string;
  publicKey: string;
  credentialId: ArrayBuffer;
  prfSalt: ArrayBuffer;
  iv: ArrayBuffer;
  ciphertext: ArrayBuffer;
  updatedAt: number;
};

export type EnrollPasskeyOptions = {
  rpName: string;
  userName: string;
  userDisplayName?: string;
};

export type PasskeyUnlockResult =
  | { status: "ok"; kp: IdentityKeyPair }
  | { status: "cancelled" }
  | { status: "failed" };

export type PasskeyEnrollResult = "ok" | "cancelled" | "failed";

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

function getRecord(userId: string): Promise<PasskeyUnlockRecord | null> {
  return openDB().then((db) => {
    if (!db) return null;
    return new Promise<PasskeyUnlockRecord | null>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(userId);
        req.onsuccess = () =>
          resolve((req.result as PasskeyUnlockRecord | undefined) ?? null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  });
}

function putRecord(record: PasskeyUnlockRecord): Promise<boolean> {
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
        resolve(undefined);
      }
    });
  });
}

function buildAad(publicKeyB64: string): Uint8Array {
  return concatBuffers(utf8(AAD_PREFIX), base64ToUint8Array(publicKeyB64));
}

async function deriveKek(prfOutput: ArrayBuffer): Promise<CryptoKey> {
  const subtle = getCrypto();
  const hkdfKey = await subtle.importKey("raw", prfOutput, "HKDF", false, [
    "deriveKey",
  ]);
  return subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(0) as BufferSource,
      info: utf8(HKDF_INFO) as BufferSource,
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

type PrfExtensionResults = {
  prf?: { enabled?: boolean; results?: { first?: ArrayBuffer } };
};

function getPrfResults(
  credential: PublicKeyCredential,
): PrfExtensionResults["prf"] {
  return (credential.getClientExtensionResults() as PrfExtensionResults).prf;
}

export async function isPasskeyUnlockAvailable(): Promise<boolean> {
  try {
    if (
      typeof window === "undefined" ||
      typeof PublicKeyCredential === "undefined"
    ) {
      return false;
    }
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function hasPasskeyUnlock(
  userId: string,
  expectedPublicKeyB64?: string,
): Promise<boolean> {
  if (!userId) return false;
  const record = await getRecord(userId);
  if (!record) return false;
  if (expectedPublicKeyB64 && record.publicKey !== expectedPublicKeyB64) {
    return false;
  }
  return true;
}

export async function removePasskeyUnlock(userId: string): Promise<void> {
  if (!userId) return;
  await deleteRecord(userId);
}

export async function enrollPasskeyUnlock(
  userId: string,
  publicKeyB64: string,
  kp: IdentityKeyPair,
  options: EnrollPasskeyOptions,
): Promise<PasskeyEnrollResult> {
  if (!userId || !publicKeyB64) return "failed";
  if (!(await openDB())) return "failed";
  try {
    const prfSalt = getRandomBytes(PRF_SALT_SIZE);
    const residentKeyPreference: ResidentKeyRequirement = "preferred";
    const createOptions: CredentialCreationOptions = {
      publicKey: {
        challenge: getRandomBytes(32) as BufferSource,
        rp: { name: options.rpName },
        user: {
          id: utf8(userId) as BufferSource,
          name: options.userName,
          displayName: options.userDisplayName || options.userName,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          residentKey: residentKeyPreference,
          userVerification: "required",
        },
        timeout: 60000,
        extensions: {
          prf: { eval: { first: prfSalt } },
        } as AuthenticationExtensionsClientInputs,
      },
    };

    const credential = (await navigator.credentials.create(
      createOptions,
    )) as PublicKeyCredential | null;
    if (!credential) return "failed";

    const prf = getPrfResults(credential);
    if (!prf?.enabled && !prf?.results?.first) return "failed";

    let prfOutput = prf?.results?.first ?? null;
    if (!prfOutput) {
      prfOutput = await evalPrf(credential.rawId, prfSalt as BufferSource);
      if (!prfOutput) return "failed";
    }

    const kek = await deriveKek(prfOutput);
    zeroBuffer(new Uint8Array(prfOutput));
    const iv = getRandomBytes(IV_SIZE);
    const subtle = getCrypto();
    const ciphertext = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
        additionalData: buildAad(publicKeyB64) as BufferSource,
      },
      kek,
      kp.privateKey as BufferSource,
    );

    const stored = await putRecord({
      userId,
      publicKey: publicKeyB64,
      credentialId: credential.rawId,
      prfSalt: prfSalt.buffer as ArrayBuffer,
      iv: iv.buffer as ArrayBuffer,
      ciphertext,
      updatedAt: Date.now(),
    });
    return stored ? "ok" : "failed";
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.name === "NotAllowedError" || e.name === "AbortError")
    ) {
      return "cancelled";
    }
    return "failed";
  }
}

async function evalPrf(
  credentialId: ArrayBuffer,
  prfSalt: BufferSource,
  signal?: AbortSignal,
): Promise<ArrayBuffer | null> {
  const getOptions: CredentialRequestOptions = {
    publicKey: {
      challenge: getRandomBytes(32) as BufferSource,
      allowCredentials: [{ type: "public-key", id: credentialId }],
      userVerification: "required",
      timeout: 60000,
      extensions: {
        prf: { eval: { first: prfSalt } },
      } as AuthenticationExtensionsClientInputs,
    },
    signal,
  };
  const assertion = (await navigator.credentials.get(
    getOptions,
  )) as PublicKeyCredential | null;
  if (!assertion) return null;
  return getPrfResults(assertion)?.results?.first ?? null;
}

export async function unlockWithPasskey(
  userId: string,
  expectedPublicKeyB64: string,
  signal?: AbortSignal,
): Promise<PasskeyUnlockResult> {
  if (!userId || !expectedPublicKeyB64) return { status: "failed" };
  const record = await getRecord(userId);
  if (!record) return { status: "failed" };
  if (record.publicKey !== expectedPublicKeyB64) {
    await deleteRecord(userId);
    return { status: "failed" };
  }

  let prfOutput: ArrayBuffer | null;
  try {
    prfOutput = await evalPrf(record.credentialId, record.prfSalt, signal);
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.name === "NotAllowedError" || e.name === "AbortError")
    ) {
      return { status: "cancelled" };
    }
    return { status: "failed" };
  }
  if (!prfOutput) return { status: "failed" };

  try {
    const kek = await deriveKek(prfOutput);
    zeroBuffer(new Uint8Array(prfOutput));
    const subtle = getCrypto();
    const plaintext = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: record.iv,
        additionalData: buildAad(record.publicKey) as BufferSource,
      },
      kek,
      record.ciphertext,
    );
    return {
      status: "ok",
      kp: {
        publicKey: base64ToUint8Array(record.publicKey),
        privateKey: new Uint8Array(plaintext),
      },
    };
  } catch {
    await deleteRecord(userId);
    return { status: "failed" };
  }
}

export function resetPasskeyUnlockStoreForTests(): void {
  dbPromise = null;
}
