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

// =============================================================================
// One-off generator for the deterministic crypto fixture in crypto.ts.
//
// USAGE (must be run from packages/shared where hash-wasm is installed):
//
//   cd packages/shared
//   node --input-type=module < ../sdk/__tests__/e2e/fixtures/gen-crypto.mjs
//
// OUTPUT: prints PASSPHRASE, PUBLIC_KEY, and PRIVATE_KEY_ENC constants.
// Copy those values into crypto.ts → FIXTURE_IDENTITY.
//
// WHY FAST_PARAMS?
//   argon2id with production params (m=65536 KiB, t=3, p=4) takes 200-600ms on
//   developer hardware but up to several seconds in a headless Chromium CI
//   container with shared cores. FAST_PARAMS (m=256 KiB, t=1, p=1) reduces this
//   to <50ms, making the unlock step non-flaky in Playwright.
//
// DETERMINISM:
//   The X25519 keypair is generated fresh each run (no deterministic seed API
//   available in WebCrypto). The SALT and IV are fixed constants, so two runs
//   with the same keypair and passphrase produce the same envelope — but the
//   keypair itself differs per run. After running, COPY the output into
//   crypto.ts and commit. Do NOT regenerate unless you want all MSW key state
//   to change (which would break any tests seeded from the previous fixture).
// =============================================================================

import { argon2id } from "hash-wasm";
import crypto from "crypto";

const MAGIC_IDENTITY = new Uint8Array([0x44, 0x53, 0x45, 0x4b]); // "DSEK"
const VERSION_IDENTITY = 0x02;
const SUITE_X25519_HKDF_AES256GCM = 0x01;
const KDF_ID_ARGON2ID = 0x01;
const AAD_IDENTITY_PASSPHRASE_PREFIX = "docspace-identity-v2|passphrase|";

// Lightweight argon2id params for test speed (production uses m=65536, t=3, p=4)
const FAST_PARAMS = { m_KiB: 256, t: 1, p: 1 };
const PASSPHRASE = "test-passphrase-12345";

// Fixed salt and IV — keep these constants so the envelope format is stable.
// These are TEST-ONLY values; do NOT use in production.
const FIXED_SALT = new Uint8Array([
  0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66,
  0x77, 0x88, 0x99, 0x00,
]);
const FIXED_IV = new Uint8Array([
  0xde, 0xad, 0xbe, 0xef, 0xca, 0xfe, 0xba, 0xbe, 0x00, 0x11, 0x22, 0x33,
]);

function concatBuffers(...bufs) {
  const total = bufs.reduce((s, b) => s + b.byteLength, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const b of bufs) {
    out.set(b, off);
    off += b.byteLength;
  }
  return out;
}

function uint32BE(n) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, false);
  return b;
}

function utf8(s) {
  return new TextEncoder().encode(s);
}

function base64UrlEncode(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function main() {
  // Generate a fresh X25519 keypair. Each run produces a unique keypair.
  // The PKCS8 export's last 32 bytes are the raw private scalar.
  const kp = await crypto.subtle.generateKey(
    { name: "X25519" },
    true,
    ["deriveKey", "deriveBits"],
  );
  const rawPub = new Uint8Array(
    await crypto.subtle.exportKey("raw", kp.publicKey),
  );
  const pkcs8 = new Uint8Array(
    await crypto.subtle.exportKey("pkcs8", kp.privateKey),
  );
  const rawPriv = pkcs8.slice(pkcs8.byteLength - 32);

  // Derive KEK from passphrase using argon2id (from hash-wasm, same as identity.ts)
  const kek = await argon2id({
    password: utf8(PASSPHRASE.normalize("NFKC")),
    salt: FIXED_SALT,
    iterations: FAST_PARAMS.t,
    parallelism: FAST_PARAMS.p,
    memorySize: FAST_PARAMS.m_KiB,
    hashLength: 32,
    outputType: "binary",
  });

  // Build AAD as identity.ts does: prefix + base64url(publicKey)
  const aadStr = AAD_IDENTITY_PASSPHRASE_PREFIX + base64UrlEncode(rawPub);
  const aad = utf8(aadStr);

  // Encrypt raw private key with AES-256-GCM
  const aesKey = await crypto.subtle.importKey(
    "raw",
    kek,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: FIXED_IV, additionalData: aad, tagLength: 128 },
    aesKey,
    rawPriv,
  );
  const ctBytes = new Uint8Array(ct); // 32 bytes plaintext + 16 bytes GCM tag = 48 bytes

  // Assemble the passphrase slot:
  // kdfId(1) + t(1) + p(1) + m_KiB(4) + salt(16) + iv(12) + ct+tag(48)
  const ppSlot = concatBuffers(
    new Uint8Array([KDF_ID_ARGON2ID, FAST_PARAMS.t, FAST_PARAMS.p]),
    uint32BE(FAST_PARAMS.m_KiB),
    FIXED_SALT,
    FIXED_IV,
    ctBytes,
  );

  // Assemble the full DSEK v2 envelope:
  // magic(4) + version(1) + suite(1) + flags(1) + pubkey(32) + ppSlot
  const envelope = concatBuffers(
    MAGIC_IDENTITY,
    new Uint8Array([VERSION_IDENTITY, SUITE_X25519_HKDF_AES256GCM, 0x00]),
    rawPub,
    ppSlot,
  );

  const publicKeyB64 = Buffer.from(rawPub).toString("base64");
  const privateKeyEncB64 = Buffer.from(envelope).toString("base64");

  console.log("--- Copy these constants into crypto.ts → FIXTURE_IDENTITY ---");
  console.log("PASSPHRASE:", JSON.stringify(PASSPHRASE));
  console.log("  publicKey:", JSON.stringify(publicKeyB64));
  console.log("  privateKeyEnc:", JSON.stringify(privateKeyEncB64));
  console.log("");
  console.log(
    "Verify with: unlockWithPassphrase({ publicKey, privateKeyEnc }, PASSPHRASE)",
  );
  console.log("Expected: resolves without error, returns a 32-byte keypair.");
}

main().catch((e) => {
  console.error(e.stack || e);
  process.exit(1);
});
