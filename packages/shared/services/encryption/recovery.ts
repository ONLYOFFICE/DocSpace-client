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

  // entropy(32) || checksum(1) = 264 bits = 24 × 11 bits.
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

/** Split into N-word groups for grid display. */
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
