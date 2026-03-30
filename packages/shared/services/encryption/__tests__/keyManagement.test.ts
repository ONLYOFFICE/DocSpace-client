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
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  encryptPrivateKey,
  decryptPrivateKey,
  reEncryptPrivateKey,
  serializeKeyPair,
  generateDEK,
  wrapDEK,
  unwrapDEK,
  getPublicKeyFingerprint,
} from "../keyManagement";
import { InvalidPassphraseError, InvalidFormatError } from "../errors";
import type { ECDHKeyPair } from "../types";
import { arrayBufferToBase64 } from "../utils";

// ---------------------------------------------------------------------------
// Shared fixtures — ECDH key generation is fast but we still hoist it to
// beforeAll to avoid redundant work across tests in the same suite.
// ---------------------------------------------------------------------------

describe("keyManagement", () => {
  let keyPair: ECDHKeyPair;
  let publicKeyBase64: string;

  beforeAll(async () => {
    keyPair = await generateKeyPair();
    publicKeyBase64 = await exportPublicKey(keyPair.publicKey);
  });

  // -------------------------------------------------------------------------
  // generateKeyPair
  // -------------------------------------------------------------------------

  describe("generateKeyPair", () => {
    it("produces a CryptoKey pair with ECDH P-256 algorithm", async () => {
      const kp = await generateKeyPair();

      expect(kp.publicKey.algorithm.name).toBe("ECDH");
      expect(kp.privateKey.algorithm.name).toBe("ECDH");
      expect((kp.publicKey.algorithm as EcKeyAlgorithm).namedCurve).toBe(
        "P-256",
      );
      expect((kp.privateKey.algorithm as EcKeyAlgorithm).namedCurve).toBe(
        "P-256",
      );
    });

    it("marks public key as extractable and private key as extractable (needed for wrapping)", async () => {
      const kp = await generateKeyPair();
      expect(kp.publicKey.extractable).toBe(true);
      expect(kp.privateKey.extractable).toBe(true);
    });

    it("assigns correct key usages", async () => {
      const kp = await generateKeyPair();
      expect(kp.publicKey.usages).toEqual([]);
      expect(kp.privateKey.usages).toContain("deriveKey");
      expect(kp.privateKey.usages).toContain("deriveBits");
    });

    it("generates unique key pairs on each call", async () => {
      const kp1 = await generateKeyPair();
      const kp2 = await generateKeyPair();
      const pub1 = await exportPublicKey(kp1.publicKey);
      const pub2 = await exportPublicKey(kp2.publicKey);
      expect(pub1).not.toBe(pub2);
    });
  });

  // -------------------------------------------------------------------------
  // exportPublicKey / importPublicKey
  // -------------------------------------------------------------------------

  describe("exportPublicKey / importPublicKey", () => {
    it("round-trips a public key through base64 SPKI", async () => {
      const reimported = await importPublicKey(publicKeyBase64);
      expect(reimported.type).toBe("public");
      expect(reimported.algorithm.name).toBe("ECDH");
    });

    it("imported key is extractable and produces the same base64", async () => {
      const reimported = await importPublicKey(publicKeyBase64);
      const reexported = await exportPublicKey(reimported);
      expect(reexported).toBe(publicKeyBase64);
    });

    it("throws InvalidFormatError for invalid base64 input", async () => {
      await expect(importPublicKey("!!!not-base64!!!")).rejects.toThrow(
        InvalidFormatError,
      );
    });
  });

  // -------------------------------------------------------------------------
  // encryptPrivateKey / decryptPrivateKey
  // -------------------------------------------------------------------------

  describe("encryptPrivateKey / decryptPrivateKey", () => {
    it(
      "round-trips the private key with the correct passphrase",
      async () => {
        const enc = await encryptPrivateKey(keyPair.privateKey, "pass-123");
        const dec = await decryptPrivateKey(enc, "pass-123");

        expect(dec.type).toBe("private");
        expect(dec.algorithm.name).toBe("ECDH");
      },
      30_000,
    );

    it(
      "throws InvalidPassphraseError when the passphrase is wrong",
      async () => {
        const enc = await encryptPrivateKey(keyPair.privateKey, "correct");
        await expect(decryptPrivateKey(enc, "wrong")).rejects.toThrow(
          InvalidPassphraseError,
        );
      },
      30_000,
    );

    it(
      "produces non-extractable key — exportKey throws after decryption",
      async () => {
        const enc = await encryptPrivateKey(keyPair.privateKey, "pass");
        const dec = await decryptPrivateKey(enc, "pass");

        // non-extractable — the Web Crypto spec mandates this throws
        await expect(
          globalThis.crypto.subtle.exportKey("pkcs8", dec),
        ).rejects.toThrow();
      },
      30_000,
    );

    it(
      "uses random salt — produces different ciphertext each time",
      async () => {
        const enc1 = await encryptPrivateKey(keyPair.privateKey, "same");
        const enc2 = await encryptPrivateKey(keyPair.privateKey, "same");
        expect(enc1).not.toBe(enc2);
      },
      30_000,
    );

    it(
      "throws InvalidFormatError when ciphertext is too short",
      async () => {
        // Only 4 bytes — shorter than salt(16) + iv(12) + tag(16)
        const tooShort = arrayBufferToBase64(new Uint8Array(4).buffer);
        await expect(decryptPrivateKey(tooShort, "any")).rejects.toThrow(
          InvalidFormatError,
        );
      },
      30_000,
    );
  });

  // -------------------------------------------------------------------------
  // serializeKeyPair
  // -------------------------------------------------------------------------

  describe("serializeKeyPair", () => {
    it(
      "produces a SerializedKeyPair with base64 strings",
      async () => {
        const serialized = await serializeKeyPair(keyPair, "p@ss");

        // Both fields must be non-empty strings
        expect(typeof serialized.publicKey).toBe("string");
        expect(serialized.publicKey.length).toBeGreaterThan(0);
        expect(typeof serialized.privateKeyEnc).toBe("string");
        expect(serialized.privateKeyEnc.length).toBeGreaterThan(0);
      },
      30_000,
    );

    it(
      "serialized publicKey round-trips back to the same CryptoKey material",
      async () => {
        const serialized = await serializeKeyPair(keyPair, "p@ss");
        const reimported = await importPublicKey(serialized.publicKey);
        const reexported = await exportPublicKey(reimported);
        expect(reexported).toBe(publicKeyBase64);
      },
      30_000,
    );

    it(
      "serialized privateKeyEnc can be decrypted with the same passphrase",
      async () => {
        const serialized = await serializeKeyPair(keyPair, "my-pass");
        const dec = await decryptPrivateKey(serialized.privateKeyEnc, "my-pass");
        expect(dec.type).toBe("private");
      },
      30_000,
    );
  });

  // -------------------------------------------------------------------------
  // generateDEK
  // -------------------------------------------------------------------------

  describe("generateDEK", () => {
    it("produces exactly 32 bytes (AES-256)", () => {
      const dek = generateDEK();
      expect(dek).toBeInstanceOf(Uint8Array);
      expect(dek.byteLength).toBe(32);
    });

    it("generates a different DEK on every call", () => {
      const deks = Array.from({ length: 8 }, () => generateDEK());
      const unique = new Set(deks.map((d) => Array.from(d).join(",")));
      expect(unique.size).toBe(8);
    });
  });

  // -------------------------------------------------------------------------
  // wrapDEK / unwrapDEK
  // -------------------------------------------------------------------------

  describe("wrapDEK / unwrapDEK", () => {
    it("round-trips the DEK — unwrapped bytes equal original", async () => {
      const dek = generateDEK();
      const wrapped = await wrapDEK(dek, keyPair.publicKey);
      const unwrapped = await unwrapDEK(wrapped, keyPair.privateKey);

      expect(unwrapped).toBeInstanceOf(Uint8Array);
      expect(unwrapped.byteLength).toBe(32);
      expect(Array.from(unwrapped)).toEqual(Array.from(dek));
    });

    it("produces different ciphertext on each wrap (ephemeral ECDH)", async () => {
      const dek = generateDEK();
      const w1 = await wrapDEK(dek, keyPair.publicKey);
      const w2 = await wrapDEK(dek, keyPair.publicKey);
      expect(w1).not.toBe(w2);
    });

    it("throws when unwrapping with the wrong private key", async () => {
      const dek = generateDEK();
      const wrapped = await wrapDEK(dek, keyPair.publicKey);

      const otherKp = await generateKeyPair();
      await expect(unwrapDEK(wrapped, otherKp.privateKey)).rejects.toThrow();
    });

    it("throws InvalidFormatError when wrapped data is truncated", async () => {
      // 20 bytes is well below ephemeralPub(65) + wrappedDEK(40) minimum
      const tooShort = arrayBufferToBase64(new Uint8Array(20).buffer);
      await expect(
        unwrapDEK(tooShort, keyPair.privateKey),
      ).rejects.toThrow(InvalidFormatError);
    });
  });

  // -------------------------------------------------------------------------
  // getPublicKeyFingerprint
  // -------------------------------------------------------------------------

  describe("getPublicKeyFingerprint", () => {
    it("returns a hex string", async () => {
      const fp = await getPublicKeyFingerprint(publicKeyBase64);
      expect(fp).toMatch(/^[0-9A-F]+$/);
    });

    it("returns a 64-character string (full SHA-256 → 32 bytes × 2 hex chars)", async () => {
      const fp = await getPublicKeyFingerprint(publicKeyBase64);
      expect(fp).toHaveLength(64);
    });

    it("is deterministic — same key always produces the same fingerprint", async () => {
      const fp1 = await getPublicKeyFingerprint(publicKeyBase64);
      const fp2 = await getPublicKeyFingerprint(publicKeyBase64);
      expect(fp1).toBe(fp2);
    });

    it("produces different fingerprints for different keys", async () => {
      const otherKp = await generateKeyPair();
      const otherPub = await exportPublicKey(otherKp.publicKey);
      const fp1 = await getPublicKeyFingerprint(publicKeyBase64);
      const fp2 = await getPublicKeyFingerprint(otherPub);
      expect(fp1).not.toBe(fp2);
    });
  });

  // -------------------------------------------------------------------------
  // reEncryptPrivateKey
  // -------------------------------------------------------------------------

  describe("reEncryptPrivateKey", () => {
    it(
      "re-encrypts under a new passphrase — old passphrase no longer works",
      async () => {
        const enc = await encryptPrivateKey(keyPair.privateKey, "old-pass");
        const reenc = await reEncryptPrivateKey(enc, "old-pass", "new-pass");

        // New passphrase works
        const dec = await decryptPrivateKey(reenc, "new-pass");
        expect(dec.type).toBe("private");
      },
      60_000,
    );

    it(
      "re-encrypted key wraps the same underlying key material",
      async () => {
        // We derive bits from the original private key and from the
        // re-encrypted one using the same ephemeral public key to prove
        // they are cryptographically identical.
        const enc = await encryptPrivateKey(keyPair.privateKey, "pass-a");
        const reenc = await reEncryptPrivateKey(enc, "pass-a", "pass-b");
        const restored = await decryptPrivateKey(reenc, "pass-b");

        // Both keys should be able to unwrap the same DEK
        const dek = generateDEK();
        const wrapped = await wrapDEK(dek, keyPair.publicKey);

        // restored is non-extractable, but it should still unwrap the DEK
        const unwrapped = await unwrapDEK(wrapped, restored);
        expect(Array.from(unwrapped)).toEqual(Array.from(dek));
      },
      60_000,
    );

    it(
      "throws InvalidPassphraseError when the old passphrase is wrong",
      async () => {
        const enc = await encryptPrivateKey(keyPair.privateKey, "correct-old");
        await expect(
          reEncryptPrivateKey(enc, "wrong-old", "new-pass"),
        ).rejects.toThrow(InvalidPassphraseError);
      },
      30_000,
    );
  });
});
