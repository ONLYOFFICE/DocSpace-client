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

import { describe, it, expect, beforeAll } from "vitest";

import {
  generateRSAKeyPair,
  exportPublicKey,
  importPublicKey,
  exportPrivateKeyRaw,
  importPrivateKeyRaw,
  encryptPrivateKey,
  decryptPrivateKey,
  serializeKeyPair,
  getPublicKeyFingerprint,
  getKeyStatus,
  exportKeyToFile,
  importKeyFromFile,
  encryptAESKeyWithRSA,
  decryptAESKeyWithRSA,
  generateAESKey,
  getCrypto,
} from "../keyManagement";

// Test helpers
const createMockFile = (
  content: string,
  name: string,
  type = "text/plain",
): File => {
  const file = new File([new Blob([content], { type })], name, { type });
  (file as unknown as { text: () => Promise<string> }).text = () =>
    Promise.resolve(content);
  return file;
};

const blobToText = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

describe("keyManagement", () => {
  // Shared fixtures - RSA key generation is expensive
  let keyPair: CryptoKeyPair;
  let exportedPublicKey: string;
  let exportedPrivateKey: string;

  beforeAll(async () => {
    keyPair = await generateRSAKeyPair();
    exportedPublicKey = await exportPublicKey(keyPair.publicKey);
    exportedPrivateKey = await exportPrivateKeyRaw(keyPair.privateKey);
  });

  describe("getCrypto", () => {
    it("should return SubtleCrypto instance with required methods", () => {
      const subtle = getCrypto();
      expect(subtle).toBeDefined();
      expect(subtle.generateKey).toBeDefined();
      expect(subtle.encrypt).toBeDefined();
      expect(subtle.decrypt).toBeDefined();
    });
  });

  describe("generateRSAKeyPair", () => {
    it("should generate valid RSA-2048 key pair with correct properties", async () => {
      const kp = await generateRSAKeyPair();

      expect(kp.publicKey.algorithm.name).toBe("RSA-OAEP");
      expect(kp.privateKey.algorithm.name).toBe("RSA-OAEP");
      expect(kp.publicKey.extractable).toBe(true);
      expect(kp.privateKey.extractable).toBe(true);
      expect(kp.publicKey.usages).toContain("encrypt");
      expect(kp.privateKey.usages).toContain("decrypt");
    });

    it("should generate unique key pairs", async () => {
      const kp1 = await generateRSAKeyPair();
      const kp2 = await generateRSAKeyPair();
      expect(await exportPublicKey(kp1.publicKey)).not.toBe(
        await exportPublicKey(kp2.publicKey),
      );
    });
  });

  describe("exportPublicKey / importPublicKey", () => {
    it("should round-trip and preserve encryption capability", async () => {
      const imported = await importPublicKey(exportedPublicKey);
      expect(imported.algorithm.name).toBe("RSA-OAEP");
      expect(imported.type).toBe("public");

      // Verify encryption works
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      const subtle = getCrypto();
      const encrypted = await subtle.encrypt(
        { name: "RSA-OAEP" },
        imported,
        testData,
      );
      const decrypted = await subtle.decrypt(
        { name: "RSA-OAEP" },
        keyPair.privateKey,
        encrypted,
      );
      expect(new Uint8Array(decrypted)).toEqual(testData);
    });

    it("should throw on invalid base64 input", async () => {
      await expect(importPublicKey("not-valid-base64!@#$")).rejects.toThrow();
    });
  });

  describe("exportPrivateKeyRaw / importPrivateKeyRaw", () => {
    it("should round-trip and preserve decryption capability", async () => {
      const imported = await importPrivateKeyRaw(exportedPrivateKey);
      expect(imported.algorithm.name).toBe("RSA-OAEP");
      expect(imported.type).toBe("private");

      // Verify decryption works
      const testData = new Uint8Array([10, 20, 30]);
      const subtle = getCrypto();
      const encrypted = await subtle.encrypt(
        { name: "RSA-OAEP" },
        keyPair.publicKey,
        testData,
      );
      const decrypted = await subtle.decrypt(
        { name: "RSA-OAEP" },
        imported,
        encrypted,
      );
      expect(new Uint8Array(decrypted)).toEqual(testData);
    });
  });

  describe("encryptPrivateKey / decryptPrivateKey", () => {
    it("should encrypt and decrypt with passphrase", async () => {
      const encrypted = await encryptPrivateKey(
        keyPair.privateKey,
        "test-pass",
      );
      const decrypted = await decryptPrivateKey(encrypted, "test-pass");
      expect(decrypted.type).toBe("private");
    });

    it("should produce different ciphertext each time (random salt)", async () => {
      const pass = "same-pass";
      const enc1 = await encryptPrivateKey(keyPair.privateKey, pass);
      const enc2 = await encryptPrivateKey(keyPair.privateKey, pass);
      expect(enc1).not.toBe(enc2);
    });

    it("should fail with wrong passphrase", async () => {
      const encrypted = await encryptPrivateKey(keyPair.privateKey, "correct");
      await expect(decryptPrivateKey(encrypted, "wrong")).rejects.toThrow(
        "Invalid passphrase",
      );
    });

    it.each([
      "",
      "пароль-🔐",
      "a".repeat(100),
    ])("should handle passphrase: %s", async (pass) => {
      const encrypted = await encryptPrivateKey(keyPair.privateKey, pass);
      const decrypted = await decryptPrivateKey(encrypted, pass);
      expect(decrypted.type).toBe("private");
    });
  });

  describe("serializeKeyPair", () => {
    it("should serialize and allow deserialization", async () => {
      const serialized = await serializeKeyPair(keyPair, "pass");
      expect(serialized.publicKey).toBeDefined();
      expect(serialized.privateKeyEnc).toBeDefined();

      const pubKey = await importPublicKey(serialized.publicKey);
      const privKey = await decryptPrivateKey(serialized.privateKeyEnc, "pass");
      expect(pubKey.type).toBe("public");
      expect(privKey.type).toBe("private");
    });
  });

  describe("getPublicKeyFingerprint", () => {
    it("should return deterministic 16-char hex fingerprint", async () => {
      const fp1 = await getPublicKeyFingerprint(exportedPublicKey);
      const fp2 = await getPublicKeyFingerprint(exportedPublicKey);
      expect(fp1).toMatch(/^[0-9A-F]{16}$/);
      expect(fp1).toBe(fp2);
    });

    it("should produce different fingerprints for different keys", async () => {
      const kp2 = await generateRSAKeyPair();
      const fp1 = await getPublicKeyFingerprint(exportedPublicKey);
      const fp2 = await getPublicKeyFingerprint(
        await exportPublicKey(kp2.publicKey),
      );
      expect(fp1).not.toBe(fp2);
    });
  });

  describe("getKeyStatus", () => {
    it.each([
      [null, false],
      [{ publicKey: "", privateKeyEnc: "data" }, false],
    ])("should return hasKey: %s for %o", async (input, expected) => {
      const status = await getKeyStatus(
        input as Parameters<typeof getKeyStatus>[0],
      );
      expect(status.hasKey).toBe(expected);
    });

    it("should return valid status for serialized key", async () => {
      const serialized = await serializeKeyPair(keyPair, "pass");
      const status = await getKeyStatus(serialized);
      expect(status.hasKey).toBe(true);
      expect(status.publicKeyFingerprint).toMatch(/^[0-9A-F]{16}$/);
      expect(status.algorithm).toBe("RSA-2048");
    });
  });

  describe("exportKeyToFile / importKeyFromFile", () => {
    it("should round-trip key through file", async () => {
      const serialized = await serializeKeyPair(keyPair, "pass");
      const blob = exportKeyToFile(serialized);
      expect(blob.type).toBe("application/json");

      const content = await blobToText(blob);
      const file = createMockFile(content, "key.json", "application/json");
      const imported = await importKeyFromFile(file);
      expect(imported.publicKey).toBe(serialized.publicKey);
    });

    it.each([
      ["not-json-content", "Invalid JSON in key file"],
      [
        JSON.stringify({ type: "wrong", version: 1, data: {} }),
        "Invalid key file format",
      ],
      [
        JSON.stringify({
          type: "docspace-encryption-key",
          version: 99,
          data: {},
        }),
        "Unsupported key file version",
      ],
      [
        JSON.stringify({
          type: "docspace-encryption-key",
          version: 1,
          data: { publicKey: "x" },
        }),
        "missing required fields",
      ],
    ])("should reject invalid file: %s", async (content, errorMsg) => {
      const file = createMockFile(content, "test.json");
      await expect(importKeyFromFile(file)).rejects.toThrow(errorMsg);
    });
  });

  describe("generateAESKey", () => {
    it("should generate unique 32-byte keys", () => {
      const keys = Array.from({ length: 5 }, () => generateAESKey());
      expect(keys[0].length).toBe(32);
      const unique = new Set(keys.map((k) => Array.from(k).join(",")));
      expect(unique.size).toBe(5);
    });
  });

  describe("encryptAESKeyWithRSA / decryptAESKeyWithRSA", () => {
    it("should encrypt and decrypt AES key", async () => {
      const aesKey = generateAESKey();
      const encrypted = await encryptAESKeyWithRSA(aesKey, keyPair.publicKey);
      const decrypted = await decryptAESKeyWithRSA(
        encrypted,
        keyPair.privateKey,
      );
      expect(decrypted).toEqual(aesKey);
    });

    it("should produce different ciphertext due to OAEP padding", async () => {
      const aesKey = generateAESKey();
      const enc1 = await encryptAESKeyWithRSA(aesKey, keyPair.publicKey);
      const enc2 = await encryptAESKeyWithRSA(aesKey, keyPair.publicKey);
      expect(enc1).not.toBe(enc2);
    });

    it("should fail with wrong private key", async () => {
      const kp2 = await generateRSAKeyPair();
      const encrypted = await encryptAESKeyWithRSA(
        generateAESKey(),
        keyPair.publicKey,
      );
      await expect(
        decryptAESKeyWithRSA(encrypted, kp2.privateKey),
      ).rejects.toThrow();
    });

    it.each([16, 24, 32])("should handle %d-byte key", async (size) => {
      const key = crypto.getRandomValues(new Uint8Array(size));
      const encrypted = await encryptAESKeyWithRSA(key, keyPair.publicKey);
      const decrypted = await decryptAESKeyWithRSA(
        encrypted,
        keyPair.privateKey,
      );
      expect(decrypted).toEqual(key);
    });
  });

  describe("integration", () => {
    it("should work end-to-end: generate, serialize, file export/import, encrypt/decrypt", async () => {
      const kp = await generateRSAKeyPair();
      const serialized = await serializeKeyPair(kp, "pass");

      // File round-trip
      const blob = exportKeyToFile(serialized);
      const file = createMockFile(
        await blobToText(blob),
        "k.json",
        "application/json",
      );
      const reimported = await importKeyFromFile(file);

      // Restore and use keys
      const pubKey = await importPublicKey(reimported.publicKey);
      const privKey = await decryptPrivateKey(reimported.privateKeyEnc, "pass");

      const aesKey = generateAESKey();
      const encrypted = await encryptAESKeyWithRSA(aesKey, pubKey);
      const decrypted = await decryptAESKeyWithRSA(encrypted, privKey);
      expect(decrypted).toEqual(aesKey);
    });
  });
});
