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

// HPKE-Auth wrap/unwrap of DEKs.
// Suite: DHKEM(X25519, HKDF-SHA256) / HKDF-SHA256 / AES-256-GCM.

import { Aes256Gcm, CipherSuite, HkdfSha256 } from "@hpke/core";
import { DhkemX25519HkdfSha256, X25519 } from "@hpke/dhkem-x25519";

import {
  AES_GCM_TAG_SIZE,
  AES_KEY_SIZE_BYTES,
  HPKE_INFO_DEK_WRAP,
  MAGIC_HPKE_WRAP,
  SUITE_X25519_HKDF_AES256GCM,
  USER_ID_BYTES,
  VERSION_HPKE_WRAP,
  X25519_PUBLIC_KEY_SIZE,
  X25519_PRIVATE_KEY_SIZE,
} from "./types";
import {
  AuthenticationError,
  InvalidFormatError,
  UnsupportedSuiteError,
  UnsupportedVersionError,
} from "./errors";
import {
  arrayBufferToBase64,
  base64ToUint8Array,
  bytesToUuid,
  concatBuffers,
  uint64BE,
  utf8,
  uuidToBytes,
} from "./utils";

const ENCAPPED_KEY_SIZE = X25519_PUBLIC_KEY_SIZE;
const CIPHERTEXT_SIZE = AES_KEY_SIZE_BYTES + AES_GCM_TAG_SIZE;
const HEADER_SIZE = 4 + 1 + 1; // magic + version + suite
const TOTAL_BLOB_SIZE =
  HEADER_SIZE + ENCAPPED_KEY_SIZE + USER_ID_BYTES + CIPHERTEXT_SIZE;

let suiteSingleton: CipherSuite | null = null;
let x25519Singleton: X25519 | null = null;

function getSuite(): CipherSuite {
  if (!suiteSingleton) {
    suiteSingleton = new CipherSuite({
      kem: new DhkemX25519HkdfSha256(),
      kdf: new HkdfSha256(),
      aead: new Aes256Gcm(),
    });
  }
  return suiteSingleton;
}

function getX25519(): X25519 {
  if (!x25519Singleton) {
    x25519Singleton = new X25519(new HkdfSha256());
  }
  return x25519Singleton;
}

function buildInfo(
  senderUserId: Uint8Array,
  recipientUserId: Uint8Array,
  fileId: number,
): Uint8Array {
  if (senderUserId.byteLength !== USER_ID_BYTES) {
    throw new InvalidFormatError(`senderUserId must be ${USER_ID_BYTES} bytes`);
  }
  if (recipientUserId.byteLength !== USER_ID_BYTES) {
    throw new InvalidFormatError(
      `recipientUserId must be ${USER_ID_BYTES} bytes`,
    );
  }
  return concatBuffers(
    utf8(HPKE_INFO_DEK_WRAP),
    new Uint8Array([0x01]),
    senderUserId,
    recipientUserId,
    uint64BE(fileId),
  );
}

async function importPrivateKeyRaw(raw: Uint8Array): Promise<CryptoKey> {
  if (raw.byteLength !== X25519_PRIVATE_KEY_SIZE) {
    throw new InvalidFormatError(
      `X25519 private key must be ${X25519_PRIVATE_KEY_SIZE} bytes`,
    );
  }
  // @hpke X25519 deserializePrivateKey accepts raw 32 bytes and produces
  // a CryptoKey-compatible object that the suite accepts (whether backed by
  // native WebCrypto or the library's pure-JS fallback).
  const x = getX25519();
  return x.deserializePrivateKey(raw.buffer.slice(
    raw.byteOffset,
    raw.byteOffset + raw.byteLength,
  ) as ArrayBuffer);
}

async function importPublicKeyRaw(raw: Uint8Array): Promise<CryptoKey> {
  if (raw.byteLength !== X25519_PUBLIC_KEY_SIZE) {
    throw new InvalidFormatError(
      `X25519 public key must be ${X25519_PUBLIC_KEY_SIZE} bytes`,
    );
  }
  const x = getX25519();
  return x.deserializePublicKey(raw.buffer.slice(
    raw.byteOffset,
    raw.byteOffset + raw.byteLength,
  ) as ArrayBuffer);
}

export type WrapDekParams = {
  dek: Uint8Array;
  senderPrivateKey: Uint8Array;
  senderPublicKey: Uint8Array;
  senderUserId: string;
  recipientPublicKey: Uint8Array;
  recipientUserId: string;
  /** Server-assigned, must be > 0; bound into HPKE info. */
  fileId: number;
};

export async function wrapDEK(params: WrapDekParams): Promise<string> {
  const {
    dek,
    senderPrivateKey,
    senderPublicKey,
    senderUserId,
    recipientPublicKey,
    recipientUserId,
    fileId,
  } = params;

  if (dek.byteLength !== AES_KEY_SIZE_BYTES) {
    throw new InvalidFormatError(
      `DEK must be ${AES_KEY_SIZE_BYTES} bytes`,
    );
  }
  if (!Number.isFinite(fileId) || fileId <= 0) {
    throw new InvalidFormatError(
      "fileId must be a positive integer (server-assigned)",
    );
  }

  const senderIdBytes = uuidToBytes(senderUserId);
  const recipientIdBytes = uuidToBytes(recipientUserId);
  const info = buildInfo(senderIdBytes, recipientIdBytes, fileId);

  const senderPriv = await importPrivateKeyRaw(senderPrivateKey);
  const senderPub = await importPublicKeyRaw(senderPublicKey);
  const recipientPub = await importPublicKeyRaw(recipientPublicKey);

  const suite = getSuite();
  // HPKE-Auth mode: senderKey provided.
  const sender = await suite.createSenderContext({
    senderKey: { privateKey: senderPriv, publicKey: senderPub },
    recipientPublicKey: recipientPub,
    info: info as BufferSource,
  });

  const ciphertext = new Uint8Array(
    await sender.seal(dek as BufferSource),
  );
  if (ciphertext.byteLength !== CIPHERTEXT_SIZE) {
    throw new InvalidFormatError(
      `unexpected HPKE ciphertext size: ${ciphertext.byteLength}`,
    );
  }

  const enc = new Uint8Array(sender.enc);
  if (enc.byteLength !== ENCAPPED_KEY_SIZE) {
    throw new InvalidFormatError(
      `unexpected encapped key size: ${enc.byteLength}`,
    );
  }

  const blob = concatBuffers(
    MAGIC_HPKE_WRAP,
    new Uint8Array([VERSION_HPKE_WRAP, SUITE_X25519_HKDF_AES256GCM]),
    enc,
    senderIdBytes,
    ciphertext,
  );
  if (blob.byteLength !== TOTAL_BLOB_SIZE) {
    throw new InvalidFormatError(
      `unexpected wrap blob size: ${blob.byteLength}, expected ${TOTAL_BLOB_SIZE}`,
    );
  }
  return arrayBufferToBase64(blob);
}

export type UnwrapDekParams = {
  wrapped: string;
  recipientPrivateKey: Uint8Array;
  recipientUserId: string;
  expectedSenderPublicKey: Uint8Array;
  expectedSenderUserId: string;
  fileId: number;
};

export async function unwrapDEK(
  params: UnwrapDekParams,
): Promise<Uint8Array> {
  const buf = base64ToUint8Array(params.wrapped);
  if (buf.byteLength !== TOTAL_BLOB_SIZE) {
    throw new InvalidFormatError(
      `wrap blob has wrong size: ${buf.byteLength}, expected ${TOTAL_BLOB_SIZE}`,
    );
  }
  for (let i = 0; i < MAGIC_HPKE_WRAP.length; i++) {
    if (buf[i] !== MAGIC_HPKE_WRAP[i]) {
      throw new InvalidFormatError("wrap blob: invalid magic");
    }
  }
  const version = buf[4];
  if (version !== VERSION_HPKE_WRAP) {
    throw new UnsupportedVersionError(version, VERSION_HPKE_WRAP);
  }
  const suite = buf[5];
  if (suite !== SUITE_X25519_HKDF_AES256GCM) {
    throw new UnsupportedSuiteError(suite);
  }

  let cur = HEADER_SIZE;
  const enc = buf.slice(cur, cur + ENCAPPED_KEY_SIZE);
  cur += ENCAPPED_KEY_SIZE;
  const senderIdInBlob = buf.slice(cur, cur + USER_ID_BYTES);
  cur += USER_ID_BYTES;
  const ciphertext = buf.slice(cur, cur + CIPHERTEXT_SIZE);

  const expectedSenderIdBytes = uuidToBytes(params.expectedSenderUserId);
  if (!constantTimeEqual(senderIdInBlob, expectedSenderIdBytes)) {
    throw new AuthenticationError(
      `senderUserId mismatch: blob=${bytesToUuid(senderIdInBlob)} expected=${params.expectedSenderUserId}`,
    );
  }

  const recipientIdBytes = uuidToBytes(params.recipientUserId);
  const info = buildInfo(senderIdInBlob, recipientIdBytes, params.fileId);

  const recipientPriv = await importPrivateKeyRaw(params.recipientPrivateKey);
  const senderPub = await importPublicKeyRaw(params.expectedSenderPublicKey);

  const cipherSuite = getSuite();
  let recipient: Awaited<
    ReturnType<typeof cipherSuite.createRecipientContext>
  >;
  try {
    recipient = await cipherSuite.createRecipientContext({
      recipientKey: recipientPriv,
      enc: enc.buffer.slice(
        enc.byteOffset,
        enc.byteOffset + enc.byteLength,
      ) as ArrayBuffer,
      senderPublicKey: senderPub,
      info: info as BufferSource,
    });
  } catch (e) {
    throw new AuthenticationError(
      `HPKE setup failed: ${e instanceof Error ? e.message : "unknown"}`,
    );
  }

  let plaintext: ArrayBuffer;
  try {
    plaintext = await recipient.open(ciphertext as BufferSource);
  } catch {
    throw new AuthenticationError("HPKE open failed (auth or AAD mismatch)");
  }

  const dek = new Uint8Array(plaintext);
  if (dek.byteLength !== AES_KEY_SIZE_BYTES) {
    throw new InvalidFormatError(
      `unwrapped DEK has wrong size: ${dek.byteLength}`,
    );
  }
  return dek;
}

/** Read the senderUserId from a wrap blob without unwrapping. */
export function inspectWrap(wrappedBase64: string): {
  version: number;
  suite: number;
  senderUserId: string;
} {
  const buf = base64ToUint8Array(wrappedBase64);
  if (buf.byteLength !== TOTAL_BLOB_SIZE) {
    throw new InvalidFormatError("wrap blob has wrong size");
  }
  for (let i = 0; i < MAGIC_HPKE_WRAP.length; i++) {
    if (buf[i] !== MAGIC_HPKE_WRAP[i]) {
      throw new InvalidFormatError("wrap blob: invalid magic");
    }
  }
  const senderId = buf.slice(
    HEADER_SIZE + ENCAPPED_KEY_SIZE,
    HEADER_SIZE + ENCAPPED_KEY_SIZE + USER_ID_BYTES,
  );
  return {
    version: buf[4],
    suite: buf[5],
    senderUserId: bytesToUuid(senderId),
  };
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
