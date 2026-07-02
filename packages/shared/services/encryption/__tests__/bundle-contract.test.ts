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

// biome-ignore-all lint/suspicious/noDeprecatedImports: this drift guard must
// exercise the deprecated legacy compat surface — that is exactly what it verifies.

// Drift guard for the standalone `onlyoffice-crypto.js` bundle handed to the
// document editor. It exercises the public bundle entry (lib-entry) — the same
// surface that `build:crypto` ships and `test-bundle.html` verifies in-browser.
//
// If a core change breaks the editor-facing contract (a symbol disappears, a
// call shape changes, a roundtrip stops working), this test fails BEFORE a
// stale/incompatible bundle can be shipped. Keep it in sync with
// test-bundle.html.

import { describe, it, expect } from "vitest";

import * as bundle from "../lib-entry";
import {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  encryptPrivateKey,
  decryptPrivateKey,
  reEncryptPrivateKey,
  serializeKeyPair,
  exportKeyToFile,
  importKeyFromFile,
  backupPrivateKey,
  restorePrivateKey,
  generateDEK,
  wrapDEK,
  unwrapDEK,
  encryptFile,
  decryptFile,
  encryptFileName,
  decryptFileName,
  getPublicKeyFingerprint,
  isDSE3Format,
  parseDSE3Header,
  estimateEncryptedSize,
  generateRecoveryMnemonic,
  validateMnemonic,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  ENCRYPTION_CONSTANTS,
  VERSION_DSE3_FILE,
  X25519_PUBLIC_KEY_SIZE,
  InvalidPassphraseError,
  DecryptionError,
} from "../lib-entry";

const SLOW = 30_000; // Argon2id derivations are intentionally expensive.

const UID_A = "11111111-1111-4111-8111-111111111111";
const UID_B = "22222222-2222-4222-8222-222222222222";

// The exact editor-facing surface the delivered bundle promised. Removing or
// renaming any of these is a breaking change for the editor integration.
const REQUIRED_EXPORTS = [
  // identity / keys
  "generateKeyPair",
  "exportPublicKey",
  "importPublicKey",
  "encryptPrivateKey",
  "decryptPrivateKey",
  "reEncryptPrivateKey",
  "serializeKeyPair",
  "exportKeyToFile",
  "importKeyFromFile",
  "getPublicKeyFingerprint",
  // DEK wrap / files
  "wrapDEK",
  "unwrapDEK",
  "generateDEK",
  "encryptFile",
  "decryptFile",
  "encryptFileName",
  "decryptFileName",
  "isDSE3Format",
  "parseDSE3Header",
  "estimateEncryptedSize",
  // recovery
  "generateRecoveryMnemonic",
  "validateMnemonic",
  "backupPrivateKey",
  "restorePrivateKey",
  // utils / constants
  "arrayBufferToBase64",
  "base64ToArrayBuffer",
  "ENCRYPTION_CONSTANTS",
  // errors
  "CryptoError",
  "InvalidPassphraseError",
  "DecryptionError",
  "NoAccessError",
  "InvalidFormatError",
  "WebCryptoUnavailableError",
  "KeyNotFoundError",
] as const;

describe("onlyoffice-crypto bundle contract", () => {
  it("exports every symbol the editor integration relies on", () => {
    for (const name of REQUIRED_EXPORTS) {
      expect(
        (bundle as Record<string, unknown>)[name],
        `missing bundle export: ${name}`,
      ).toBeDefined();
    }
  });

  it("exposes correct v2 suite constants", () => {
    expect(bundle.SUITE_X25519_HKDF_AES256GCM).toBe(0x01);
    expect(VERSION_DSE3_FILE).toBe(0x02);
    expect(X25519_PUBLIC_KEY_SIZE).toBe(32);
    expect(ENCRYPTION_CONSTANTS.AES_KEY_SIZE).toBe(256);
  });

  it("generateKeyPair -> X25519 key pair handle", async () => {
    const kp = await generateKeyPair();
    expect(kp.publicKey).toBeInstanceOf(Uint8Array);
    expect(kp.publicKey.byteLength).toBe(32);
    expect(kp.privateKey.privateKey).toBeInstanceOf(Uint8Array);
  });

  it("exportPublicKey / importPublicKey roundtrip", async () => {
    const kp = await generateKeyPair();
    const b64 = await exportPublicKey(kp.publicKey);
    expect(typeof b64).toBe("string");
    const back = await importPublicKey(b64);
    expect(Array.from(back)).toEqual(Array.from(kp.publicKey));
  });

  it("encryptPrivateKey / decryptPrivateKey roundtrip + wrong passphrase", async () => {
    const kp = await generateKeyPair();
    const enc = await encryptPrivateKey(kp.privateKey, "pw-123");
    expect(typeof enc).toBe("string");
    const dec = await decryptPrivateKey(enc, "pw-123");
    expect(Array.from(dec.privateKey)).toEqual(
      Array.from(kp.privateKey.privateKey),
    );
    await expect(decryptPrivateKey(enc, "wrong")).rejects.toBeInstanceOf(
      InvalidPassphraseError,
    );
  }, SLOW);

  it("reEncryptPrivateKey rotates the passphrase", async () => {
    const kp = await generateKeyPair();
    const enc = await encryptPrivateKey(kp.privateKey, "old");
    const enc2 = await reEncryptPrivateKey(enc, "old", "new");
    await expect(decryptPrivateKey(enc2, "new")).resolves.toBeTruthy();
    await expect(decryptPrivateKey(enc2, "old")).rejects.toBeInstanceOf(
      InvalidPassphraseError,
    );
  }, SLOW);

  it("generateDEK -> 32 random bytes", () => {
    const a = generateDEK();
    const b = generateDEK();
    expect(a.byteLength).toBe(32);
    expect(Array.from(a)).not.toEqual(Array.from(b));
  });

  it("wrapDEK / unwrapDEK roundtrip (HPKE-Auth)", async () => {
    const kp = await generateKeyPair();
    const dek = generateDEK();
    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: kp.privateKey.privateKey,
      senderPublicKey: kp.publicKey,
      senderUserId: UID_A,
      recipientPublicKey: kp.publicKey,
      recipientUserId: UID_A,
      fileId: 42,
    });
    expect(typeof wrapped).toBe("string");
    const un = await unwrapDEK({
      wrapped,
      recipientPrivateKey: kp.privateKey.privateKey,
      recipientUserId: UID_A,
      expectedSenderPublicKey: kp.publicKey,
      expectedSenderUserId: UID_A,
      fileId: 42,
    });
    expect(Array.from(un)).toEqual(Array.from(dek));
  });

  it("encryptFile / decryptFile roundtrip + fileName recovery (DSE3 v2)", async () => {
    const pt = new TextEncoder().encode("Hello, ONLYOFFICE Encryption!");
    const { encryptedBlob, dek } = await encryptFile(pt, {
      fileName: "report.docx",
    });
    const bytes = new Uint8Array(await encryptedBlob.arrayBuffer());
    expect(isDSE3Format(bytes)).toBe(true);
    const { data, fileName } = await decryptFile(bytes, dek);
    const out = new TextDecoder().decode(new Uint8Array(await data.arrayBuffer()));
    expect(out).toBe("Hello, ONLYOFFICE Encryption!");
    expect(fileName).toBe("report.docx");
  });

  it("wrong DEK -> DecryptionError", async () => {
    const { encryptedBlob } = await encryptFile(new Uint8Array([1, 2, 3]));
    const bytes = new Uint8Array(await encryptedBlob.arrayBuffer());
    await expect(decryptFile(bytes, generateDEK())).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });

  it("encryptFileName / decryptFileName roundtrip", async () => {
    const dek = generateDEK();
    const enc = await encryptFileName("Secret Report.pdf", dek);
    expect(typeof enc).toBe("string");
    expect(await decryptFileName(enc, dek)).toBe("Secret Report.pdf");
  });

  it("getPublicKeyFingerprint -> 64-char hex, deterministic", async () => {
    const kp = await generateKeyPair();
    const pub = await exportPublicKey(kp.publicKey);
    const fp = await getPublicKeyFingerprint(pub);
    expect(fp).toMatch(/^[0-9A-F]{64}$/);
    expect(await getPublicKeyFingerprint(pub)).toBe(fp);
  });

  it("serializeKeyPair -> { publicKey, privateKeyEnc }", async () => {
    const kp = await generateKeyPair();
    const ser = await serializeKeyPair(kp, "pw");
    expect(ser.publicKey).toBeTruthy();
    expect(ser.privateKeyEnc).toBeTruthy();
  }, SLOW);

  it("exportKeyToFile / importKeyFromFile roundtrip", async () => {
    const kp = await generateKeyPair();
    const ser = await serializeKeyPair(kp, "pw");
    const blob = exportKeyToFile(ser);
    const file = new File([blob], "key.json", { type: "application/json" });
    const back = await importKeyFromFile(file);
    expect(back.publicKey).toBe(ser.publicKey);
    expect(back.privateKeyEnc).toBe(ser.privateKeyEnc);
  }, SLOW);

  it("parseDSE3Header -> version 2, 16-byte nonce", async () => {
    const { encryptedBlob } = await encryptFile(new Uint8Array(100));
    const bytes = new Uint8Array(await encryptedBlob.arrayBuffer());
    const header = parseDSE3Header(bytes);
    expect(header.version).toBe(VERSION_DSE3_FILE);
    expect(header.fileNonce.byteLength).toBe(16);
  });

  it("estimateEncryptedSize grows with input", () => {
    expect(estimateEncryptedSize(1_000_000)).toBeGreaterThan(1_000_000);
  });

  it("recovery mnemonic: 24 words + validateMnemonic", async () => {
    const m = await generateRecoveryMnemonic();
    expect(m.split(" ")).toHaveLength(24);
    expect(await validateMnemonic(m)).toBe(true);
    expect(await validateMnemonic("not a valid phrase")).toBe(false);
  });

  it("backupPrivateKey / restorePrivateKey roundtrip", async () => {
    const kp = await generateKeyPair();
    const m = await generateRecoveryMnemonic();
    const backup = await backupPrivateKey(kp.privateKey, m);
    expect(backup.type).toBe("docspace-recovery-backup");
    const restored = await restorePrivateKey(backup, m);
    expect(Array.from(restored.privateKey)).toEqual(
      Array.from(kp.privateKey.privateKey),
    );
  }, SLOW);

  it("base64 utils roundtrip", () => {
    const data = new Uint8Array([72, 101, 108, 108, 111]);
    const b64 = arrayBufferToBase64(data.buffer);
    const back = new Uint8Array(base64ToArrayBuffer(b64));
    expect(Array.from(back)).toEqual(Array.from(data));
  });

  it("full editor workflow: keygen -> encrypt -> wrap(A->B) -> unwrap(B) -> decrypt", async () => {
    const a = await generateKeyPair();
    const b = await generateKeyPair();
    const content = new TextEncoder().encode("Document content");
    const { encryptedBlob, dek } = await encryptFile(content, {
      fileName: "doc.docx",
    });
    const bytes = new Uint8Array(await encryptedBlob.arrayBuffer());
    const fileId = 777;
    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: a.privateKey.privateKey,
      senderPublicKey: a.publicKey,
      senderUserId: UID_A,
      recipientPublicKey: b.publicKey,
      recipientUserId: UID_B,
      fileId,
    });
    const dekForB = await unwrapDEK({
      wrapped,
      recipientPrivateKey: b.privateKey.privateKey,
      recipientUserId: UID_B,
      expectedSenderPublicKey: a.publicKey,
      expectedSenderUserId: UID_A,
      fileId,
    });
    const { data, fileName } = await decryptFile(bytes, dekForB);
    const out = new TextDecoder().decode(new Uint8Array(await data.arrayBuffer()));
    expect(out).toBe("Document content");
    expect(fileName).toBe("doc.docx");
  });
});
