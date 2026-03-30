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

// BIP-39 Recovery Codes
//
// Generates a 24-word mnemonic (256-bit entropy + 8-bit checksum) that
// can be used to backup and restore the user's private key.
// The wordlist is loaded lazily on first use.

import type { RecoveryBackup } from "./types";
import { ENCRYPTION_CONSTANTS } from "./types";
import { InvalidPassphraseError } from "./errors";
import {
  getCrypto,
  getRandomBytes,
  concatBuffers,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from "./utils";

const C = ENCRYPTION_CONSTANTS;

// BIP-39 English wordlist (2048 words). Loaded lazily.
let wordlistPromise: Promise<string[]> | null = null;

async function getWordlist(): Promise<string[]> {
  if (!wordlistPromise) {
    wordlistPromise = import("./bip39-wordlist")
      .then((m) => m.WORDLIST)
      .catch((err) => {
        wordlistPromise = null;
        throw err;
      });
  }
  return wordlistPromise;
}

// ============================================================================
// Mnemonic generation (BIP-39 compatible)
//
// 1. Generate 256 bits of entropy (32 bytes)
// 2. SHA-256 hash → take first 8 bits as checksum
// 3. Concatenate entropy + checksum = 264 bits
// 4. Split into 24 groups of 11 bits each → 24 word indices
// ============================================================================

export async function generateRecoveryMnemonic(): Promise<string> {
  const subtle = getCrypto();
  const wordlist = await getWordlist();

  const entropy = getRandomBytes(32); // 256 bits
  const hash = await subtle.digest("SHA-256", entropy as BufferSource);
  const checksumByte = new Uint8Array(hash)[0]; // first 8 bits

  // Build bit string: 256 bits entropy + 8 bits checksum = 264 bits
  const bits = new Uint8Array(33);
  bits.set(entropy);
  bits[32] = checksumByte;

  // Extract 24 groups of 11 bits
  const words: string[] = [];
  for (let i = 0; i < 24; i++) {
    const bitOffset = i * 11;
    const byteIdx = Math.floor(bitOffset / 8);
    const bitIdx = bitOffset % 8;

    // Read 16 bits starting from byteIdx, extract 11 bits
    const val =
      ((bits[byteIdx] << 8) | (bits[byteIdx + 1] ?? 0)) >>
      (16 - 11 - bitIdx);
    const index = val & 0x7ff; // 11 bits mask
    words.push(wordlist[index]);
  }

  return words.join(" ");
}

export async function validateMnemonic(mnemonic: string): Promise<boolean> {
  const wordlist = await getWordlist();
  const words = mnemonic.normalize("NFKD").trim().toLowerCase().split(/\s+/);

  if (words.length !== 24) return false;

  // Check all words are in wordlist
  const wordSet = new Set(wordlist);
  for (const word of words) {
    if (!wordSet.has(word)) return false;
  }

  // Reconstruct bits and verify checksum
  const indices = words.map((w) => wordlist.indexOf(w));
  const bits = new Uint8Array(33);

  for (let i = 0; i < 24; i++) {
    const bitOffset = i * 11;
    for (let b = 0; b < 11; b++) {
      const bit = (indices[i] >> (10 - b)) & 1;
      const pos = bitOffset + b;
      if (bit) {
        bits[Math.floor(pos / 8)] |= 1 << (7 - (pos % 8));
      }
    }
  }

  const entropy = bits.slice(0, 32);
  const checksumByte = bits[32];

  const subtle = getCrypto();
  const hash = await subtle.digest("SHA-256", entropy as BufferSource);
  const expectedChecksum = new Uint8Array(hash)[0];

  return checksumByte === expectedChecksum;
}

// ============================================================================
// Key backup/restore with recovery mnemonic
//
// Uses PBKDF2 with the mnemonic as passphrase to derive an AES-GCM key,
// then encrypts the PKCS8 private key. Same format as passphrase encryption:
// [salt 16B][iv 12B][ciphertext + GCM tag]
// ============================================================================

export async function backupPrivateKey(
  privateKey: CryptoKey,
  mnemonic: string,
): Promise<RecoveryBackup> {
  const subtle = getCrypto();
  const pkcs8 = await subtle.exportKey("pkcs8", privateKey);

  const salt = getRandomBytes(C.SALT_SIZE);
  const iv = getRandomBytes(C.AES_GCM_IV_SIZE);

  const passphraseKey = await subtle.importKey(
    "raw",
    new TextEncoder().encode(mnemonic),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const derivedKey = await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: C.KDF_ITERATIONS,
      hash: C.KDF_HASH,
    },
    passphraseKey,
    { name: "AES-GCM", length: C.AES_KEY_SIZE },
    false,
    ["encrypt"],
  );

  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource, tagLength: C.AES_GCM_TAG_BITS },
    derivedKey,
    pkcs8,
  );

  const data = arrayBufferToBase64(
    concatBuffers(salt, iv, ciphertext).buffer as ArrayBuffer,
  );

  return {
    version: 1,
    type: "docspace-recovery-backup",
    data,
  };
}

export async function restorePrivateKey(
  backup: RecoveryBackup,
  mnemonic: string,
): Promise<CryptoKey> {
  if (backup.version !== 1 || backup.type !== "docspace-recovery-backup") {
    throw new Error("Invalid recovery backup format");
  }

  const subtle = getCrypto();
  const raw = new Uint8Array(base64ToArrayBuffer(backup.data));

  const saltEnd = C.SALT_SIZE;
  const ivEnd = saltEnd + C.AES_GCM_IV_SIZE;

  const salt = raw.slice(0, saltEnd);
  const iv = raw.slice(saltEnd, ivEnd);
  const ciphertext = raw.slice(ivEnd);

  const passphraseKey = await subtle.importKey(
    "raw",
    new TextEncoder().encode(mnemonic),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const derivedKey = await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: C.KDF_ITERATIONS,
      hash: C.KDF_HASH,
    },
    passphraseKey,
    { name: "AES-GCM", length: C.AES_KEY_SIZE },
    false,
    ["decrypt"],
  );

  try {
    const pkcs8 = await subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource, tagLength: C.AES_GCM_TAG_BITS },
      derivedKey,
      ciphertext,
    );

    return subtle.importKey(
      "pkcs8",
      pkcs8,
      { name: "ECDH", namedCurve: C.ECDH_CURVE },
      true,
      ["deriveKey", "deriveBits"],
    );
  } catch {
    throw new InvalidPassphraseError();
  }
}
