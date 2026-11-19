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

// BIP-39 24-word recovery mnemonic. The mnemonic itself is the secret;
// encrypting the private key under it is identity.ts's job.

import { getCrypto, getRandomBytes } from "./utils";

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

export async function generateRecoveryMnemonic(): Promise<string> {
  const subtle = getCrypto();
  const wordlist = await getWordlist();

  const entropy = getRandomBytes(32);
  const hash = await subtle.digest("SHA-256", entropy as BufferSource);
  const checksumByte = new Uint8Array(hash)[0];

  // entropy(32) || checksum(1) = 264 bits = 24 * 11 bits.
  const bits = new Uint8Array(33);
  bits.set(entropy);
  bits[32] = checksumByte;

  // Bit-by-bit packing avoids the negative-shift edge case at (i*11)%8 > 5.
  const words: string[] = [];
  for (let i = 0; i < 24; i++) {
    let index = 0;
    for (let b = 0; b < 11; b++) {
      const pos = i * 11 + b;
      const bit = (bits[Math.floor(pos / 8)] >> (7 - (pos % 8))) & 1;
      index = (index << 1) | bit;
    }
    words.push(wordlist[index]);
  }
  return words.join(" ");
}

export async function validateMnemonic(mnemonic: string): Promise<boolean> {
  const wordlist = await getWordlist();
  const words = mnemonic
    .normalize("NFKD")
    .trim()
    .toLowerCase()
    .split(/\s+/);

  if (words.length !== 24) return false;

  const wordSet = new Set(wordlist);
  for (const word of words) {
    if (!wordSet.has(word)) return false;
  }

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

export function splitMnemonicForDisplay(
  mnemonic: string,
  groupSize = 4,
): string[][] {
  const words = mnemonic.trim().split(/\s+/);
  const groups: string[][] = [];
  for (let i = 0; i < words.length; i += groupSize) {
    groups.push(words.slice(i, i + groupSize));
  }
  return groups;
}

export function normalizeMnemonic(input: string): string {
  return input.normalize("NFKD").trim().toLowerCase().replace(/\s+/g, " ");
}

export const RECOVERY_PHRASE_WORD_COUNT = 24;

/** Number of words in a typed recovery phrase, split as `normalizeMnemonic` splits it. */
export function countMnemonicWords(input: string): number {
  const normalized = normalizeMnemonic(input);
  return normalized === "" ? 0 : normalized.split(" ").length;
}

/**
 * The first word of a typed recovery phrase that no recovery phrase can hold,
 * with its position counted from 1, or null when every word is a recovery word.
 */
export async function findUnknownMnemonicWord(
  input: string,
): Promise<{ word: string; position: number } | null> {
  const normalized = normalizeMnemonic(input);
  if (normalized === "") return null;

  const wordSet = new Set(await getWordlist());
  const words = normalized.split(" ");
  const index = words.findIndex((word) => !wordSet.has(word));
  return index === -1 ? null : { word: words[index], position: index + 1 };
}
