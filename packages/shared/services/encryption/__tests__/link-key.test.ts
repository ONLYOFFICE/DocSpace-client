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

import { describe, expect, it } from "vitest";

import {
  AuthenticationError,
  InvalidFormatError,
  InvalidPassphraseError,
} from "../errors";
import { unwrapDEK, wrapDEK } from "../hpke";
import { generateIdentityKeyPair, unlockWithPassphrase } from "../identity";
import {
  createLinkKey,
  deriveLinkProof,
  generateLinkSecret,
  isLinkSecret,
  LINK_SECRET_LENGTH,
  openLinkKey,
  sealLinkKey,
} from "../link-key";
import {
  arrayBufferToBase64,
  base64ToUint8Array,
  base64UrlEncode,
  getRandomBytes,
} from "../utils";

const PASSWORD = "correct horse";

const sha256 = async (base64: string) =>
  arrayBufferToBase64(
    await crypto.subtle.digest(
      "SHA-256",
      base64ToUint8Array(base64) as BufferSource,
    ),
  );

describe("The secret of a link stays in the address", () => {
  it("opens the sealed key with the secret alone when the link has no password", async () => {
    const secret = generateLinkSecret();
    const { keyPair, material } = await createLinkKey(secret);

    const opened = await openLinkKey(material, secret);

    expect(opened.privateKey).toEqual(keyPair.privateKey);
    expect(opened.publicKey).toEqual(keyPair.publicKey);
  });

  it("opens the sealed key with the secret and the password", async () => {
    const secret = generateLinkSecret();
    const { keyPair, material } = await createLinkKey(secret, PASSWORD);

    const opened = await openLinkKey(material, secret, PASSWORD);

    expect(opened.privateKey).toEqual(keyPair.privateKey);
  });

  it("Address without the secret", async () => {
    const { material } = await createLinkKey(generateLinkSecret());

    await expect(openLinkKey(material, "")).rejects.toBeInstanceOf(
      InvalidFormatError,
    );
    await expect(
      openLinkKey(material, generateLinkSecret()),
    ).rejects.toBeInstanceOf(InvalidPassphraseError);
  });

  it("Wrong password", async () => {
    const secret = generateLinkSecret();
    const { material } = await createLinkKey(secret, PASSWORD);

    await expect(
      openLinkKey(material, secret, "wrong horse"),
    ).rejects.toBeInstanceOf(InvalidPassphraseError);
    await expect(openLinkKey(material, secret)).rejects.toBeInstanceOf(
      InvalidPassphraseError,
    );
    expect(await deriveLinkProof(secret, "wrong horse")).not.toBe(
      await deriveLinkProof(secret, PASSWORD),
    );
  });

  it("Proof seen by the server", async () => {
    const secret = generateLinkSecret();
    const { material } = await createLinkKey(secret);
    const proof = await deriveLinkProof(secret);

    expect(await sha256(proof)).toBe(material.linkProofHash);
    await expect(
      unlockWithPassphrase(
        {
          publicKey: material.linkPublicKey,
          privateKeyEnc: material.linkPrivateKeyEnc,
        },
        base64UrlEncode(base64ToUint8Array(proof)),
      ),
    ).rejects.toBeInstanceOf(InvalidPassphraseError);
  });

  it("sends the server values of the sizes it accepts", async () => {
    const { material } = await createLinkKey(generateLinkSecret(), PASSWORD);
    const canonical32 = /^[A-Za-z0-9+/]{43}=$/;

    expect(material.linkPublicKey).toMatch(canonical32);
    expect(material.linkProofHash).toMatch(canonical32);
    expect(base64ToUint8Array(material.linkPublicKey)).toHaveLength(32);
    expect(base64ToUint8Array(material.linkProofHash)).toHaveLength(32);
    expect(material.linkPrivateKeyEnc.length).toBeGreaterThan(0);
    expect(material.linkPrivateKeyEnc.length).toBeLessThanOrEqual(4096);
  });

  it("seals the same key pair again for a new password", async () => {
    const secret = generateLinkSecret();
    const { keyPair, material } = await createLinkKey(secret, PASSWORD);

    const replaced = await sealLinkKey(keyPair, secret, "another horse");

    expect(replaced.linkPublicKey).toBe(material.linkPublicKey);
    expect(replaced.linkProofHash).not.toBe(material.linkProofHash);
    expect(
      (await openLinkKey(replaced, secret, "another horse")).privateKey,
    ).toEqual(keyPair.privateKey);
    await expect(
      openLinkKey(replaced, secret, PASSWORD),
    ).rejects.toBeInstanceOf(InvalidPassphraseError);
  });
});

describe("The secret of a link is encoded for an address", () => {
  it("makes 43 characters of the URL-safe alphabet, different each time", () => {
    const secret = generateLinkSecret();

    expect(secret).toHaveLength(LINK_SECRET_LENGTH);
    expect(secret).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(isLinkSecret(secret)).toBe(true);
    expect(generateLinkSecret()).not.toBe(secret);
  });

  it("Secret cut short", () => {
    expect(isLinkSecret(generateLinkSecret().slice(0, 42))).toBe(false);
    expect(isLinkSecret("")).toBe(false);
    expect(isLinkSecret(undefined)).toBe(false);
  });

  it("takes one spelling of a secret, not the four that decode to the same bytes", () => {
    const secret = generateLinkSecret();
    const lastIndex =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".indexOf(
        secret[42],
      );
    const sameBytes =
      secret.slice(0, 42) +
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"[
        lastIndex + 1
      ];

    expect(lastIndex % 4).toBe(0);
    expect(isLinkSecret(sameBytes)).toBe(false);
  });

  it("Foreign character in the secret", () => {
    const secret = generateLinkSecret();

    expect(isLinkSecret(`${secret.slice(0, 42)}*`)).toBe(false);
    expect(isLinkSecret(`${secret.slice(0, 42)}=`)).toBe(false);
    expect(isLinkSecret(`${secret} `)).toBe(false);
  });
});

describe("An external link has a key pair of its own", () => {
  const FILE_ID = 4711;
  const MEMBER_ID = "11111111-1111-4111-8111-111111111111";
  const OTHER_MEMBER_ID = "22222222-2222-4222-8222-222222222222";
  const LINK_ID = "33333333-3333-4333-8333-333333333333";
  const OTHER_LINK_ID = "44444444-4444-4444-8444-444444444444";

  const setup = async () => {
    const secret = generateLinkSecret();
    const member = await generateIdentityKeyPair();
    const { material } = await createLinkKey(secret);
    const dek = getRandomBytes(32);
    const wrapFor = (recipientPublicKey: Uint8Array, recipientUserId: string) =>
      wrapDEK({
        dek,
        senderPrivateKey: member.privateKey,
        senderPublicKey: member.publicKey,
        senderUserId: MEMBER_ID,
        recipientPublicKey,
        recipientUserId,
        fileId: FILE_ID,
      });
    const openAs = async (
      wrapped: string,
      recipientPrivateKey: Uint8Array,
      recipientUserId: string,
    ) =>
      unwrapDEK({
        wrapped,
        recipientPrivateKey,
        recipientUserId,
        expectedSenderPublicKey: member.publicKey,
        expectedSenderUserId: MEMBER_ID,
        fileId: FILE_ID,
      });
    return { secret, member, material, dek, wrapFor, openAs };
  };

  it("Link to a file created", async () => {
    const { secret, material, dek, wrapFor, openAs } = await setup();

    const wrap = await wrapFor(
      base64ToUint8Array(material.linkPublicKey),
      LINK_ID,
    );
    const visitor = await openLinkKey(material, secret);

    expect(await openAs(wrap, visitor.privateKey, LINK_ID)).toEqual(dek);
  });

  it("File added under a linked folder", async () => {
    const { secret, material, dek, wrapFor, openAs } = await setup();
    const otherMember = await generateIdentityKeyPair();

    const forMember = await wrapFor(otherMember.publicKey, OTHER_MEMBER_ID);
    const forLink = await wrapFor(
      base64ToUint8Array(material.linkPublicKey),
      LINK_ID,
    );
    const visitor = await openLinkKey(material, secret);

    expect(
      await openAs(forMember, otherMember.privateKey, OTHER_MEMBER_ID),
    ).toEqual(dek);
    expect(await openAs(forLink, visitor.privateKey, LINK_ID)).toEqual(dek);
  });

  it("Wrap made for a member offered to a link", async () => {
    const { secret, material, wrapFor, openAs } = await setup();
    const otherMember = await generateIdentityKeyPair();
    const otherLink = await createLinkKey(generateLinkSecret());
    const visitor = await openLinkKey(material, secret);

    const forMember = await wrapFor(otherMember.publicKey, OTHER_MEMBER_ID);
    const forOtherLink = await wrapFor(
      base64ToUint8Array(otherLink.material.linkPublicKey),
      OTHER_LINK_ID,
    );
    const forThisKeyUnderAnotherId = await wrapFor(
      base64ToUint8Array(material.linkPublicKey),
      OTHER_LINK_ID,
    );

    for (const wrap of [forMember, forOtherLink, forThisKeyUnderAnotherId]) {
      await expect(
        openAs(wrap, visitor.privateKey, LINK_ID),
      ).rejects.toBeInstanceOf(AuthenticationError);
    }
  });
});
