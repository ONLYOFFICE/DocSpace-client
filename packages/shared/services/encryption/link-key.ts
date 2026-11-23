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

// Spec: private-rooms/encryption-core, "The secret of a link stays in the address"
//
// An external link of a private item has an X25519 key pair of its own. Its
// private key is stored on the server sealed under a key derived from the
// secret that stays after `#` in the address, and from the password when the
// link has one. The proof shown to the server comes from the same input
// under another label, so it does not open the sealed key.

import { argon2id } from "hash-wasm";

import { InvalidFormatError } from "./errors";
import {
  DEFAULT_ARGON2_PARAMS,
  generateIdentityKeyPair,
  serializeIdentity,
  unlockWithPassphrase,
} from "./identity";
import {
  ARGON2ID_DK_LEN,
  type IdentityKeyPair,
  SALT_SIZE,
} from "./types";
import {
  arrayBufferToBase64,
  base64ToUint8Array,
  base64UrlEncode,
  concatBuffers,
  getCrypto,
  getRandomBytes,
  utf8,
  zeroBuffer,
} from "./utils";

const SECRET_BYTES = 32;

/** The secret as it stands in the address: URL-safe base64 without padding. */
export const LINK_SECRET_LENGTH = 43;

// 43 characters carry 258 bits: the last one holds four of the secret's and two
// that are zero, so only sixteen characters may end a secret. One address then
// stands for one secret.
const SECRET_PATTERN = /^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/;

const INFO_SEAL = "docspace-link-seal-v1";
const INFO_PROOF = "docspace-link-proof-v1";
const INFO_PASSWORD_SALT = "docspace-link-password-salt-v1";

// The sealing key is 256 uniform bits already, so the envelope's own
// stretching adds nothing: the smallest parameters the KDF takes.
const ENVELOPE_KDF = { m_KiB: 8, t: 1, p: 1 };

export type LinkKeyMaterial = {
  /** The public X25519 key of the link, base64 of 32 bytes. */
  linkPublicKey: string;
  /** The private key of the link, sealed; the server cannot open it. */
  linkPrivateKeyEnc: string;
  /** SHA-256 of the proof, base64 of 32 bytes. */
  linkProofHash: string;
};

export function generateLinkSecret(): string {
  return base64UrlEncode(getRandomBytes(SECRET_BYTES));
}

/** Whether a value read from an address has the length and alphabet of a secret. */
export function isLinkSecret(value: unknown): value is string {
  return typeof value === "string" && SECRET_PATTERN.test(value);
}

function decodeSecret(secret: string): Uint8Array {
  if (!isLinkSecret(secret)) {
    throw new InvalidFormatError("link secret: 43 URL-safe base64 characters");
  }
  return base64ToUint8Array(`${secret.replace(/-/g, "+").replace(/_/g, "/")}=`);
}

async function hkdf(
  ikm: Uint8Array,
  info: string,
  length: number,
): Promise<Uint8Array> {
  const subtle = getCrypto();
  const key = await subtle.importKey("raw", ikm as BufferSource, "HKDF", false, [
    "deriveBits",
  ]);
  const bits = await subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(0),
      info: utf8(info) as BufferSource,
    },
    key,
    length * 8,
  );
  return new Uint8Array(bits);
}

/**
 * The input both derived values come from: the secret, followed by the
 * stretched password when the link has one. The salt of the password comes
 * from the secret, which whoever opens the link holds before anything else.
 */
async function deriveInput(
  secret: string,
  password?: string,
): Promise<Uint8Array> {
  const secretBytes = decodeSecret(secret);
  if (!password) return secretBytes;

  try {
    // shortcut: the password is stretched with fixed parameters, since the envelope has no field for them; a change of them needs new labels.
    const stretched = await argon2id({
      password: utf8(password.normalize("NFKC")),
      salt: await hkdf(secretBytes, INFO_PASSWORD_SALT, SALT_SIZE),
      iterations: DEFAULT_ARGON2_PARAMS.t,
      parallelism: DEFAULT_ARGON2_PARAMS.p,
      memorySize: DEFAULT_ARGON2_PARAMS.m_KiB,
      hashLength: ARGON2ID_DK_LEN,
      outputType: "binary",
    });
    const input = concatBuffers(secretBytes, stretched);
    zeroBuffer(stretched);
    return input;
  } finally {
    zeroBuffer(secretBytes);
  }
}

async function deriveSealAndProof(
  secret: string,
  password?: string,
): Promise<{ sealPassphrase: string; proof: Uint8Array }> {
  const input = await deriveInput(secret, password);
  try {
    const sealKey = await hkdf(input, INFO_SEAL, 32);
    const proof = await hkdf(input, INFO_PROOF, 32);
    const sealPassphrase = base64UrlEncode(sealKey);
    zeroBuffer(sealKey);
    return { sealPassphrase, proof };
  } finally {
    zeroBuffer(input);
  }
}

/** The value a visitor shows to the server, base64 of 32 bytes. */
export async function deriveLinkProof(
  secret: string,
  password?: string,
): Promise<string> {
  const { proof } = await deriveSealAndProof(secret, password);
  return arrayBufferToBase64(proof);
}

/**
 * Seals the key pair of a link under its secret and password. A new password
 * for an existing link seals the same key pair again: the public key and the
 * wraps made for it stay.
 */
export async function sealLinkKey(
  keyPair: IdentityKeyPair,
  secret: string,
  password?: string,
): Promise<LinkKeyMaterial> {
  const { sealPassphrase, proof } = await deriveSealAndProof(secret, password);
  const envelope = await serializeIdentity(keyPair, sealPassphrase, {
    argon2Params: ENVELOPE_KDF,
  });
  const proofHash = await getCrypto().digest("SHA-256", proof as BufferSource);
  zeroBuffer(proof);

  return {
    linkPublicKey: envelope.publicKey,
    linkPrivateKeyEnc: envelope.privateKeyEnc,
    linkProofHash: arrayBufferToBase64(proofHash),
  };
}

/** Makes the key pair of a new link and seals it. */
export async function createLinkKey(
  secret: string,
  password?: string,
): Promise<{ keyPair: IdentityKeyPair; material: LinkKeyMaterial }> {
  const keyPair = await generateIdentityKeyPair();
  return { keyPair, material: await sealLinkKey(keyPair, secret, password) };
}

/**
 * Opens the sealed key of a link. A wrong secret or password ends in
 * InvalidPassphraseError, a malformed secret in InvalidFormatError.
 */
export async function openLinkKey(
  material: Pick<LinkKeyMaterial, "linkPublicKey" | "linkPrivateKeyEnc">,
  secret: string,
  password?: string,
): Promise<IdentityKeyPair> {
  const { sealPassphrase, proof } = await deriveSealAndProof(secret, password);
  zeroBuffer(proof);
  return unlockWithPassphrase(
    {
      publicKey: material.linkPublicKey,
      privateKeyEnc: material.linkPrivateKeyEnc,
    },
    sealPassphrase,
  );
}
