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
  generateIdentityKeyPair,
  serializeIdentity,
  unlockWithPassphrase,
  unlockWithRecoveryPhrase,
  changePassphrase,
  getPublicKeyFingerprint,
  exportIdentityToBlob,
  importIdentityFromFile,
  DEFAULT_ARGON2_PARAMS,
} from "../identity";
import {
  InvalidPassphraseError,
  InvalidRecoveryPhraseError,
  InvalidFormatError,
} from "../errors";
import {
  X25519_PUBLIC_KEY_SIZE,
  X25519_PRIVATE_KEY_SIZE,
  type IdentityKeyPair,
} from "../types";

// Use lightweight Argon2 params for tests so suite runs fast. Real production
// uses 64 MiB / t=3 / p=4 (DEFAULT_ARGON2_PARAMS).
const FAST_PARAMS = { m_KiB: 256, t: 1, p: 1 };

describe("identity", () => {
  let kp: IdentityKeyPair;

  beforeAll(async () => {
    kp = await generateIdentityKeyPair();
  });

  describe("generateIdentityKeyPair", () => {
    it("produces 32-byte raw X25519 keypair", () => {
      expect(kp.publicKey).toBeInstanceOf(Uint8Array);
      expect(kp.privateKey).toBeInstanceOf(Uint8Array);
      expect(kp.publicKey.byteLength).toBe(X25519_PUBLIC_KEY_SIZE);
      expect(kp.privateKey.byteLength).toBe(X25519_PRIVATE_KEY_SIZE);
    });

    it("generates fresh keypair each call", async () => {
      const a = await generateIdentityKeyPair();
      const b = await generateIdentityKeyPair();
      expect(a.privateKey).not.toEqual(b.privateKey);
      expect(a.publicKey).not.toEqual(b.publicKey);
    });
  });

  describe("serializeIdentity / unlockWithPassphrase", () => {
    it("round-trips with passphrase only", async () => {
      const passphrase = "correct horse battery staple";
      const serialized = await serializeIdentity(kp, passphrase, {
        argon2Params: FAST_PARAMS,
      });
      expect(serialized.publicKey).toBeTypeOf("string");
      expect(serialized.privateKeyEnc).toBeTypeOf("string");

      const unlocked = await unlockWithPassphrase(serialized, passphrase);
      expect(unlocked.publicKey).toEqual(kp.publicKey);
      expect(unlocked.privateKey).toEqual(kp.privateKey);
    });

    it("rejects wrong passphrase with InvalidPassphraseError", async () => {
      const serialized = await serializeIdentity(kp, "right", {
        argon2Params: FAST_PARAMS,
      });
      await expect(
        unlockWithPassphrase(serialized, "wrong"),
      ).rejects.toBeInstanceOf(InvalidPassphraseError);
    });

    it("public key field must match envelope public key (server tampering)", async () => {
      const serialized = await serializeIdentity(kp, "pp", {
        argon2Params: FAST_PARAMS,
      });
      // Swap publicKey field to a different valid X25519 public key
      const other = await generateIdentityKeyPair();
      const tampered = {
        ...serialized,
        publicKey: btoa(String.fromCharCode(...other.publicKey)),
      };
      await expect(
        unlockWithPassphrase(tampered, "pp"),
      ).rejects.toBeInstanceOf(InvalidFormatError);
    });
  });

  describe("recovery slot", () => {
    const mnemonic =
      "abandon abandon abandon abandon abandon abandon abandon abandon " +
      "abandon abandon abandon abandon abandon abandon abandon abandon " +
      "abandon abandon abandon abandon abandon abandon abandon art";

    it("round-trips via recovery phrase", async () => {
      const serialized = await serializeIdentity(kp, "pp", {
        argon2Params: FAST_PARAMS,
        recoveryMnemonic: mnemonic,
      });

      const unlocked = await unlockWithRecoveryPhrase(serialized, mnemonic);
      expect(unlocked.privateKey).toEqual(kp.privateKey);
    });

    it("rejects wrong mnemonic with InvalidRecoveryPhraseError", async () => {
      const serialized = await serializeIdentity(kp, "pp", {
        argon2Params: FAST_PARAMS,
        recoveryMnemonic: mnemonic,
      });
      const wrong = mnemonic.replace("art", "abandon");
      await expect(
        unlockWithRecoveryPhrase(serialized, wrong),
      ).rejects.toBeInstanceOf(InvalidRecoveryPhraseError);
    });

    it("rejects recovery unlock when no recovery slot exists", async () => {
      const serialized = await serializeIdentity(kp, "pp", {
        argon2Params: FAST_PARAMS,
      });
      await expect(
        unlockWithRecoveryPhrase(serialized, mnemonic),
      ).rejects.toBeInstanceOf(InvalidRecoveryPhraseError);
    });

    it("passphrase still works after adding recovery slot", async () => {
      const serialized = await serializeIdentity(kp, "pp", {
        argon2Params: FAST_PARAMS,
        recoveryMnemonic: mnemonic,
      });
      const unlocked = await unlockWithPassphrase(serialized, "pp");
      expect(unlocked.privateKey).toEqual(kp.privateKey);
    });
  });

  describe("changePassphrase", () => {
    it("re-encrypts under new passphrase, old passphrase no longer works", async () => {
      const oldPp = "old-passphrase";
      const newPp = "new-passphrase";
      const serialized = await serializeIdentity(kp, oldPp, {
        argon2Params: FAST_PARAMS,
      });
      const updated = await changePassphrase(serialized, oldPp, newPp);

      const unlocked = await unlockWithPassphrase(updated, newPp);
      expect(unlocked.privateKey).toEqual(kp.privateKey);
      await expect(
        unlockWithPassphrase(updated, oldPp),
      ).rejects.toBeInstanceOf(InvalidPassphraseError);
    });

    it("preserves recovery slot when changing passphrase", async () => {
      const mnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon " +
        "abandon abandon abandon abandon abandon abandon abandon abandon " +
        "abandon abandon abandon abandon abandon abandon abandon art";
      const serialized = await serializeIdentity(kp, "old", {
        argon2Params: FAST_PARAMS,
        recoveryMnemonic: mnemonic,
      });
      const updated = await changePassphrase(serialized, "old", "new");
      // Recovery still works
      const recovered = await unlockWithRecoveryPhrase(updated, mnemonic);
      expect(recovered.privateKey).toEqual(kp.privateKey);
    });

    it("rejects wrong old passphrase", async () => {
      const serialized = await serializeIdentity(kp, "old", {
        argon2Params: FAST_PARAMS,
      });
      await expect(
        changePassphrase(serialized, "wrong", "new"),
      ).rejects.toBeInstanceOf(InvalidPassphraseError);
    });
  });

  describe("getPublicKeyFingerprint", () => {
    it("produces deterministic uppercase hex SHA-256 of the key", async () => {
      const serialized = await serializeIdentity(kp, "pp", {
        argon2Params: FAST_PARAMS,
      });
      const fp1 = await getPublicKeyFingerprint(serialized.publicKey);
      const fp2 = await getPublicKeyFingerprint(serialized.publicKey);
      expect(fp1).toBe(fp2);
      expect(fp1).toMatch(/^[0-9A-F]{64}$/);
    });

    it("different keys produce different fingerprints", async () => {
      const a = await generateIdentityKeyPair();
      const b = await generateIdentityKeyPair();
      const sa = await serializeIdentity(a, "p", { argon2Params: FAST_PARAMS });
      const sb = await serializeIdentity(b, "p", { argon2Params: FAST_PARAMS });
      const fpA = await getPublicKeyFingerprint(sa.publicKey);
      const fpB = await getPublicKeyFingerprint(sb.publicKey);
      expect(fpA).not.toBe(fpB);
    });
  });

  describe("export / import file", () => {
    it("round-trips through Blob export and File import", async () => {
      const serialized = await serializeIdentity(kp, "pp", {
        argon2Params: FAST_PARAMS,
      });
      const blob = exportIdentityToBlob(serialized);
      expect(blob.type).toBe("application/json");
      const file = new File([blob], "identity.json", { type: "application/json" });
      const reread = await importIdentityFromFile(file);
      expect(reread).toEqual(serialized);

      // Reread blob still decryptable
      const unlocked = await unlockWithPassphrase(reread, "pp");
      expect(unlocked.privateKey).toEqual(kp.privateKey);
    });

    it("rejects file with wrong type/version", async () => {
      const bad = new File(
        [JSON.stringify({ version: 1, type: "wrong", data: {} })],
        "x.json",
      );
      await expect(importIdentityFromFile(bad)).rejects.toBeInstanceOf(
        InvalidFormatError,
      );
    });

    it("rejects malformed JSON", async () => {
      const bad = new File(["{not json"], "x.json");
      await expect(importIdentityFromFile(bad)).rejects.toBeInstanceOf(
        InvalidFormatError,
      );
    });
  });

  describe("DEFAULT_ARGON2_PARAMS", () => {
    it("uses production parameters", () => {
      expect(DEFAULT_ARGON2_PARAMS.m_KiB).toBe(65536);
      expect(DEFAULT_ARGON2_PARAMS.t).toBe(3);
      expect(DEFAULT_ARGON2_PARAMS.p).toBe(4);
    });
  });

  describe("envelope validation (corrupted input)", () => {
    it("serializeIdentity rejects wrong-size public key", async () => {
      const bad = { publicKey: new Uint8Array(16), privateKey: kp.privateKey };
      await expect(
        serializeIdentity(bad, "secret", { argon2Params: FAST_PARAMS }),
      ).rejects.toBeInstanceOf(InvalidFormatError);
    });

    it("serializeIdentity rejects wrong-size private key", async () => {
      const bad = { publicKey: kp.publicKey, privateKey: new Uint8Array(16) };
      await expect(
        serializeIdentity(bad, "secret", { argon2Params: FAST_PARAMS }),
      ).rejects.toBeInstanceOf(InvalidFormatError);
    });

    it("unlockWithPassphrase rejects truncated envelope (header bytes only)", async () => {
      const truncated = {
        publicKey: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        privateKeyEnc: "AA==",
      };
      await expect(
        unlockWithPassphrase(truncated, "secret"),
      ).rejects.toBeInstanceOf(InvalidFormatError);
    });

    it("unlockWithPassphrase rejects KDF id corruption", async () => {
      const { base64ToUint8Array, arrayBufferToBase64 } = await import(
        "../utils"
      );
      const ser = await serializeIdentity(kp, "secret", {
        argon2Params: FAST_PARAMS,
      });
      const bytes = base64ToUint8Array(ser.privateKeyEnc);
      bytes[8] = 0xff;
      await expect(
        unlockWithPassphrase(
          { publicKey: ser.publicKey, privateKeyEnc: arrayBufferToBase64(bytes) },
          "secret",
        ),
      ).rejects.toBeInstanceOf(InvalidFormatError);
    });

    it("unlockWithPassphrase rejects zero argon2 params", async () => {
      const { base64ToUint8Array, arrayBufferToBase64 } = await import(
        "../utils"
      );
      const ser = await serializeIdentity(kp, "secret", {
        argon2Params: FAST_PARAMS,
      });
      const bytes = base64ToUint8Array(ser.privateKeyEnc);
      bytes[9] = 0;
      bytes[10] = 0;
      await expect(
        unlockWithPassphrase(
          { publicKey: ser.publicKey, privateKeyEnc: arrayBufferToBase64(bytes) },
          "secret",
        ),
      ).rejects.toBeInstanceOf(InvalidFormatError);
    });
  });

  describe("importIdentityFromFile", () => {
    it("propagates FileReader.onerror", async () => {
      const mockBlob: Partial<Blob> = {};
      const fakeFile = mockBlob as File;

      const original = global.FileReader;
      class FakeFileReader {
        result: string | null = null;
        error: DOMException | null = null;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        readAsText(_f: Blob) {
          queueMicrotask(() => {
            this.error = new DOMException("read failed", "NotReadableError");
            this.onerror?.();
          });
        }
      }
      // biome-ignore lint/suspicious/noExplicitAny: simple swap for test
      (global as any).FileReader = FakeFileReader;

      try {
        await expect(importIdentityFromFile(fakeFile)).rejects.toBeInstanceOf(
          DOMException,
        );
      } finally {
        global.FileReader = original;
      }
    });
  });
});
