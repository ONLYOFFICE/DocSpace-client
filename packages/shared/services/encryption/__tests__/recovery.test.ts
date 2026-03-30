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

import { describe, it, expect, beforeAll } from "vitest";

import {
  generateRecoveryMnemonic,
  validateMnemonic,
  backupPrivateKey,
  restorePrivateKey,
} from "../recovery";
import { generateKeyPair, generateDEK, wrapDEK, unwrapDEK } from "../keyManagement";
import { InvalidPassphraseError } from "../errors";
import type { ECDHKeyPair } from "../types";

// ---------------------------------------------------------------------------
// Known-valid BIP-39 test vector
//
// All-zeros 32-byte entropy → SHA-256 checksum first byte = 0x66 (102).
// Using the correct BIP-39 bit-packing: 256 bits of 0 + 8 checksum bits →
// 24 groups of 11 bits → first 23 words are index 0 ("abandon"), last word
// is index 102 ("art").  validateMnemonic reconstructs using the same
// correct bit-packing so this vector always passes.
// ---------------------------------------------------------------------------
const KNOWN_VALID_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon " +
  "abandon abandon abandon abandon abandon abandon abandon abandon " +
  "abandon abandon abandon abandon abandon abandon abandon art";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

describe("recovery", () => {
  let keyPair: ECDHKeyPair;

  beforeAll(async () => {
    keyPair = await generateKeyPair();
  });

  // -------------------------------------------------------------------------
  // generateRecoveryMnemonic
  // -------------------------------------------------------------------------

  describe("generateRecoveryMnemonic", () => {
    it("returns exactly 24 space-separated words", async () => {
      const mnemonic = await generateRecoveryMnemonic();
      const words = mnemonic.trim().split(/\s+/);
      expect(words).toHaveLength(24);
    });

    it("every word is a non-empty string", async () => {
      const mnemonic = await generateRecoveryMnemonic();
      const words = mnemonic.trim().split(/\s+/);
      for (const w of words) {
        expect(w.length).toBeGreaterThan(0);
      }
    });

    it("generates a different mnemonic on each call (random entropy)", async () => {
      const m1 = await generateRecoveryMnemonic();
      const m2 = await generateRecoveryMnemonic();
      expect(m1).not.toBe(m2);
    });
  });

  // -------------------------------------------------------------------------
  // validateMnemonic
  // -------------------------------------------------------------------------

  describe("validateMnemonic", () => {
    it("returns true for the all-zeros BIP-39 test vector", async () => {
      expect(await validateMnemonic(KNOWN_VALID_MNEMONIC)).toBe(true);
    });

    it("returns false when a word is not in the BIP-39 wordlist", async () => {
      const words = KNOWN_VALID_MNEMONIC.split(" ");
      words[5] = "xyzzyinvalidword";
      expect(await validateMnemonic(words.join(" "))).toBe(false);
    });

    it("returns false when the word count is less than 24", async () => {
      const words = KNOWN_VALID_MNEMONIC.split(" ");
      expect(await validateMnemonic(words.slice(0, 23).join(" "))).toBe(false);
    });

    it("returns false when the word count is greater than 24", async () => {
      const words = KNOWN_VALID_MNEMONIC.split(" ");
      expect(
        await validateMnemonic([...words, "abandon"].join(" ")),
      ).toBe(false);
    });

    it("returns false for an empty string", async () => {
      expect(await validateMnemonic("")).toBe(false);
    });

    it("returns false when a valid word is replaced and the checksum breaks", async () => {
      // Swap the last word ("art") for "ability" (index 1) — this changes
      // the checksum bits and breaks the SHA-256 checksum verification.
      const words = KNOWN_VALID_MNEMONIC.split(" ");
      words[23] = "ability"; // index 1 instead of 102
      expect(await validateMnemonic(words.join(" "))).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // backupPrivateKey / restorePrivateKey
  // -------------------------------------------------------------------------

  describe("backupPrivateKey / restorePrivateKey", () => {
    it(
      "round-trips the private key — restored key has correct type and algorithm",
      async () => {
        const backup = await backupPrivateKey(
          keyPair.privateKey,
          KNOWN_VALID_MNEMONIC,
        );
        const restored = await restorePrivateKey(backup, KNOWN_VALID_MNEMONIC);

        expect(restored.type).toBe("private");
        expect(restored.algorithm.name).toBe("ECDH");
      },
      30_000,
    );

    it(
      "backup produces the expected RecoveryBackup shape",
      async () => {
        const backup = await backupPrivateKey(
          keyPair.privateKey,
          KNOWN_VALID_MNEMONIC,
        );

        expect(backup.version).toBe(1);
        expect(backup.type).toBe("docspace-recovery-backup");
        expect(typeof backup.data).toBe("string");
        expect(backup.data.length).toBeGreaterThan(0);
      },
      30_000,
    );

    it(
      "restored key can unwrap a DEK that was wrapped with the original public key",
      async () => {
        const backup = await backupPrivateKey(
          keyPair.privateKey,
          KNOWN_VALID_MNEMONIC,
        );
        const restored = await restorePrivateKey(backup, KNOWN_VALID_MNEMONIC);

        const dek = generateDEK();
        const wrapped = await wrapDEK(dek, keyPair.publicKey);
        const unwrapped = await unwrapDEK(wrapped, restored);

        expect(Array.from(unwrapped)).toEqual(Array.from(dek));
      },
      30_000,
    );

    it(
      "produces different backup data on each call (random salt + IV)",
      async () => {
        const b1 = await backupPrivateKey(
          keyPair.privateKey,
          KNOWN_VALID_MNEMONIC,
        );
        const b2 = await backupPrivateKey(
          keyPair.privateKey,
          KNOWN_VALID_MNEMONIC,
        );
        expect(b1.data).not.toBe(b2.data);
      },
      30_000,
    );

    it(
      "throws InvalidPassphraseError when the wrong mnemonic is used for restoration",
      async () => {
        // Use two distinct passphrase strings; they need not be valid BIP-39
        // mnemonics — backup/restore only treat them as passphrase bytes.
        const correctMnemonic = KNOWN_VALID_MNEMONIC;
        const wrongMnemonic =
          "zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo " +
          "zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo vote";

        const backup = await backupPrivateKey(
          keyPair.privateKey,
          correctMnemonic,
        );

        await expect(
          restorePrivateKey(backup, wrongMnemonic),
        ).rejects.toThrow(InvalidPassphraseError);
      },
      30_000,
    );

    it(
      "throws when the backup object has an invalid type field",
      async () => {
        const mnemonic = await generateRecoveryMnemonic();
        const backup = await backupPrivateKey(keyPair.privateKey, mnemonic);
        const tampered = { ...backup, type: "wrong-type" as never };

        await expect(restorePrivateKey(tampered, mnemonic)).rejects.toThrow();
      },
      30_000,
    );

    it(
      "throws when the backup object has an invalid version field",
      async () => {
        const mnemonic = await generateRecoveryMnemonic();
        const backup = await backupPrivateKey(keyPair.privateKey, mnemonic);
        const tampered = { ...backup, version: 99 as never };

        await expect(restorePrivateKey(tampered, mnemonic)).rejects.toThrow();
      },
      30_000,
    );
  });
});
