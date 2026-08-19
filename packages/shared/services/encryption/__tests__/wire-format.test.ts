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

import { describe, it, expect } from "vitest";

import {
  generateIdentityKeyPair,
  serializeIdentity,
  unlockWithPassphrase,
  unlockWithRecoveryPhrase,
} from "../identity";
import { wrapDEK, unwrapDEK, inspectWrap } from "../hpke";
import { writeDSE3Header, parseDSE3Header } from "../streaming-encryption";
import { base64ToUint8Array } from "../utils";

function hex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fixedBytes(value: number, length: number): Uint8Array {
  return new Uint8Array(length).fill(value);
}

const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";

describe("DSE3 file header wire format", () => {
  it("matches the documented byte layout for fixed inputs without encryptedName", () => {
    const fileNonce = fixedBytes(0xab, 16);
    const header = writeDSE3Header(1, fileNonce, null);

    expect(header.byteLength).toBe(33);
    expect(hex(header)).toBe(
      [
        "44534533",
        "02",
        "01",
        "00",
        "00100000",
        "00000001",
        "abababababababababababababababab",
        "0000",
      ].join(""),
    );
  });

  it("matches the documented byte layout for fixed inputs with encryptedName", () => {
    const fileNonce = fixedBytes(0xcd, 16);
    const encryptedName = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const header = writeDSE3Header(7, fileNonce, encryptedName);

    expect(header.byteLength).toBe(33 + 4);
    expect(hex(header)).toBe(
      [
        "44534533",
        "02",
        "01",
        "01",
        "00100000",
        "00000007",
        "cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd",
        "0004",
        "01020304",
      ].join(""),
    );
  });

  it("rejects writeDSE3Header with mismatched fileNonce length", () => {
    expect(() => writeDSE3Header(1, new Uint8Array(15), null)).toThrow();
    expect(() => writeDSE3Header(1, new Uint8Array(17), null)).toThrow();
  });

  it("round-trips through parseDSE3Header", () => {
    const fileNonce = fixedBytes(0xef, 16);
    const header = writeDSE3Header(3, fileNonce, new Uint8Array([0x55]));
    const parsed = parseDSE3Header(header);

    expect(parsed.version).toBe(0x02);
    expect(parsed.suite).toBe(0x01);
    expect(parsed.flags).toBe(0x01);
    expect(parsed.chunkPlaintextSize).toBe(1_048_576);
    expect(parsed.chunkCount).toBe(3);
    expect(hex(parsed.fileNonce)).toBe("ef".repeat(16));
    expect(parsed.encryptedName).toEqual(new Uint8Array([0x55]));
  });
});

describe("HPKE wrap blob wire format", () => {
  it("locks the structural prefix and total size", async () => {
    const alice = await generateIdentityKeyPair();
    const bob = await generateIdentityKeyPair();
    const dek = fixedBytes(0x42, 32);

    const wrappedB64 = await wrapDEK({
      dek,
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 1,
    });

    const blob = base64ToUint8Array(wrappedB64);

    expect(blob.byteLength).toBe(102);
    expect(hex(blob.slice(0, 4))).toBe("48504b45");
    expect(blob[4]).toBe(0x02);
    expect(blob[5]).toBe(0x01);

    const senderIdSlice = blob.slice(6 + 32, 6 + 32 + 16);
    expect(hex(senderIdSlice)).toBe("11111111111111111111111111111111");
  });

  it("inspectWrap reports the locked offsets", async () => {
    const alice = await generateIdentityKeyPair();
    const bob = await generateIdentityKeyPair();
    const dek = fixedBytes(0x55, 32);

    const wrappedB64 = await wrapDEK({
      dek,
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 999,
    });

    const inspected = inspectWrap(wrappedB64);
    expect(inspected.version).toBe(0x02);
    expect(inspected.suite).toBe(0x01);
    expect(inspected.senderUserId).toBe(ALICE_ID);
  });

  it("wrap → unwrap round-trips a 32-byte DEK", async () => {
    const alice = await generateIdentityKeyPair();
    const bob = await generateIdentityKeyPair();
    const dek = fixedBytes(0x77, 32);

    const wrappedB64 = await wrapDEK({
      dek,
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 7,
    });

    const unwrapped = await unwrapDEK({
      wrapped: wrappedB64,
      recipientPrivateKey: bob.privateKey,
      recipientUserId: BOB_ID,
      expectedSenderPublicKey: alice.publicKey,
      expectedSenderUserId: ALICE_ID,
      fileId: 7,
    });

    expect(unwrapped).toEqual(dek);
  });
});

describe("Identity envelope wire format", () => {
  it("locks the structural prefix (magic + version + suite + flags + publicKey)", async () => {
    const kp = await generateIdentityKeyPair();
    const serialized = await serializeIdentity(kp, "test-passphrase");

    const envelope = base64ToUint8Array(serialized.privateKeyEnc);

    expect(envelope.byteLength).toBe(122);
    expect(hex(envelope.slice(0, 4))).toBe("4453454b");
    expect(envelope[4]).toBe(0x02);
    expect(envelope[5]).toBe(0x01);
    expect(envelope[6]).toBe(0x00);
    expect(envelope.slice(7, 39)).toEqual(kp.publicKey);
  });

  it("size grows by 76 bytes when a recovery slot is present", async () => {
    const kp = await generateIdentityKeyPair();
    const mnemonic =
      "abandon abandon abandon abandon abandon abandon " +
      "abandon abandon abandon abandon abandon abandon " +
      "abandon abandon abandon abandon abandon abandon " +
      "abandon abandon abandon abandon abandon art";

    const withoutRecovery = await serializeIdentity(kp, "test-passphrase");
    const withRecovery = await serializeIdentity(kp, "test-passphrase", {
      recoveryMnemonic: mnemonic,
    });

    const a = base64ToUint8Array(withoutRecovery.privateKeyEnc);
    const b = base64ToUint8Array(withRecovery.privateKeyEnc);

    expect(a.byteLength).toBe(122);
    expect(b.byteLength).toBe(198);
    expect(b[6]).toBe(0x01);
  });

  it("passphrase slot round-trips via unlockWithPassphrase", async () => {
    const kp = await generateIdentityKeyPair();
    const serialized = await serializeIdentity(kp, "round-trip-pass");

    const unlocked = await unlockWithPassphrase(serialized, "round-trip-pass");
    expect(unlocked.publicKey).toEqual(kp.publicKey);
    expect(unlocked.privateKey).toEqual(kp.privateKey);
  });

  it("recovery slot round-trips via unlockWithRecoveryPhrase", async () => {
    const kp = await generateIdentityKeyPair();
    const mnemonic =
      "abandon abandon abandon abandon abandon abandon " +
      "abandon abandon abandon abandon abandon abandon " +
      "abandon abandon abandon abandon abandon abandon " +
      "abandon abandon abandon abandon abandon art";

    const serialized = await serializeIdentity(kp, "ignored", {
      recoveryMnemonic: mnemonic,
    });

    const unlocked = await unlockWithRecoveryPhrase(serialized, mnemonic);
    expect(unlocked.privateKey).toEqual(kp.privateKey);
  });
});
