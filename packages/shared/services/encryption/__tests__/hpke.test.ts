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

import { generateIdentityKeyPair } from "../identity";
import { generateDEK } from "../file-keys";
import { wrapDEK, unwrapDEK, inspectWrap } from "../hpke";
import {
  AuthenticationError,
  InvalidFormatError,
  UnsupportedSuiteError,
  UnsupportedVersionError,
} from "../errors";
import { type IdentityKeyPair, USER_ID_BYTES } from "../types";
import { base64ToUint8Array, arrayBufferToBase64 } from "../utils";

const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";
const CAROL_ID = "33333333-3333-3333-3333-333333333333";

describe("hpke wrapDEK / unwrapDEK", () => {
  let alice: IdentityKeyPair;
  let bob: IdentityKeyPair;
  let carol: IdentityKeyPair;

  beforeAll(async () => {
    alice = await generateIdentityKeyPair();
    bob = await generateIdentityKeyPair();
    carol = await generateIdentityKeyPair();
  });

  it("Alice wraps a DEK for Bob; Bob unwraps successfully", async () => {
    const dek = generateDEK();
    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 42,
    });

    const unwrapped = await unwrapDEK({
      wrapped,
      recipientPrivateKey: bob.privateKey,
      recipientUserId: BOB_ID,
      expectedSenderPublicKey: alice.publicKey,
      expectedSenderUserId: ALICE_ID,
      fileId: 42,
    });

    expect(unwrapped).toEqual(dek);
  });

  it("Carol cannot unwrap a DEK addressed to Bob", async () => {
    const dek = generateDEK();
    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 42,
    });

    await expect(
      unwrapDEK({
        wrapped,
        recipientPrivateKey: carol.privateKey,
        recipientUserId: CAROL_ID,
        expectedSenderPublicKey: alice.publicKey,
        expectedSenderUserId: ALICE_ID,
        fileId: 42,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("unwrap fails if expected sender public key does not match", async () => {
    const dek = generateDEK();
    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 42,
    });

    // Bob expects Carol as the sender - must fail (HPKE-Auth check).
    await expect(
      unwrapDEK({
        wrapped,
        recipientPrivateKey: bob.privateKey,
        recipientUserId: BOB_ID,
        expectedSenderPublicKey: carol.publicKey,
        expectedSenderUserId: ALICE_ID,
        fileId: 42,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("unwrap fails if expected sender userId does not match blob", async () => {
    const dek = generateDEK();
    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 42,
    });

    await expect(
      unwrapDEK({
        wrapped,
        recipientPrivateKey: bob.privateKey,
        recipientUserId: BOB_ID,
        expectedSenderPublicKey: alice.publicKey,
        expectedSenderUserId: CAROL_ID,
        fileId: 42,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("unwrap fails if fileId differs (AAD binding)", async () => {
    const dek = generateDEK();
    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 42,
    });

    await expect(
      unwrapDEK({
        wrapped,
        recipientPrivateKey: bob.privateKey,
        recipientUserId: BOB_ID,
        expectedSenderPublicKey: alice.publicKey,
        expectedSenderUserId: ALICE_ID,
        fileId: 43,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("unwrap fails if recipient userId differs (AAD binding)", async () => {
    const dek = generateDEK();
    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 42,
    });

    // Bob's key, but we claim a different recipient UUID - AAD does not
    // match, AEAD fails.
    await expect(
      unwrapDEK({
        wrapped,
        recipientPrivateKey: bob.privateKey,
        recipientUserId: CAROL_ID,
        expectedSenderPublicKey: alice.publicKey,
        expectedSenderUserId: ALICE_ID,
        fileId: 42,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("rejects fileId = 0 at wrap time", async () => {
    await expect(
      wrapDEK({
        dek: generateDEK(),
        senderPrivateKey: alice.privateKey,
        senderPublicKey: alice.publicKey,
        senderUserId: ALICE_ID,
        recipientPublicKey: bob.publicKey,
        recipientUserId: BOB_ID,
        fileId: 0,
      }),
    ).rejects.toBeInstanceOf(InvalidFormatError);
  });

  it("rejects malformed UUID inputs", async () => {
    await expect(
      wrapDEK({
        dek: generateDEK(),
        senderPrivateKey: alice.privateKey,
        senderPublicKey: alice.publicKey,
        senderUserId: "not-a-uuid",
        recipientPublicKey: bob.publicKey,
        recipientUserId: BOB_ID,
        fileId: 1,
      }),
    ).rejects.toBeInstanceOf(InvalidFormatError);
  });

  it("inspectWrap exposes senderUserId without unwrapping", async () => {
    const wrapped = await wrapDEK({
      dek: generateDEK(),
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 42,
    });
    const inspected = inspectWrap(wrapped);
    expect(inspected.senderUserId).toBe(ALICE_ID);
    expect(inspected.version).toBe(2);
    expect(inspected.suite).toBe(1);
  });

  it("rejects malformed wrap blob (truncated)", async () => {
    const wrapped = await wrapDEK({
      dek: generateDEK(),
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 42,
    });
    const trunc = wrapped.slice(0, wrapped.length - 4);
    await expect(
      unwrapDEK({
        wrapped: trunc,
        recipientPrivateKey: bob.privateKey,
        recipientUserId: BOB_ID,
        expectedSenderPublicKey: alice.publicKey,
        expectedSenderUserId: ALICE_ID,
        fileId: 42,
      }),
    ).rejects.toBeInstanceOf(InvalidFormatError);
  });

  it("rejects wrong magic bytes", async () => {
    const wrapped = await wrapDEK({
      dek: generateDEK(),
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 42,
    });
    const bytes = base64ToUint8Array(wrapped);
    bytes[0] = 0x00;
    const broken = arrayBufferToBase64(bytes);

    await expect(
      unwrapDEK({
        wrapped: broken,
        recipientPrivateKey: bob.privateKey,
        recipientUserId: BOB_ID,
        expectedSenderPublicKey: alice.publicKey,
        expectedSenderUserId: ALICE_ID,
        fileId: 42,
      }),
    ).rejects.toBeInstanceOf(InvalidFormatError);
  });

  it("rejects future version byte", async () => {
    const wrapped = await wrapDEK({
      dek: generateDEK(),
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 42,
    });
    const bytes = base64ToUint8Array(wrapped);
    bytes[4] = 0xff; // version
    const broken = arrayBufferToBase64(bytes);

    await expect(
      unwrapDEK({
        wrapped: broken,
        recipientPrivateKey: bob.privateKey,
        recipientUserId: BOB_ID,
        expectedSenderPublicKey: alice.publicKey,
        expectedSenderUserId: ALICE_ID,
        fileId: 42,
      }),
    ).rejects.toBeInstanceOf(UnsupportedVersionError);
  });
});

describe("USER_ID_BYTES constant", () => {
  it("equals 16", () => {
    expect(USER_ID_BYTES).toBe(16);
  });
});

describe("hpke input validation (size checks)", () => {
  let alice: IdentityKeyPair;
  let bob: IdentityKeyPair;

  beforeAll(async () => {
    alice = await generateIdentityKeyPair();
    bob = await generateIdentityKeyPair();
  });

  it("rejects wrong-size DEK (not 32 bytes)", async () => {
    await expect(
      wrapDEK({
        dek: new Uint8Array(31),
        senderPrivateKey: alice.privateKey,
        senderPublicKey: alice.publicKey,
        senderUserId: ALICE_ID,
        recipientPublicKey: bob.publicKey,
        recipientUserId: BOB_ID,
        fileId: 1,
      }),
    ).rejects.toBeInstanceOf(InvalidFormatError);
  });

  it("rejects wrong-size sender public key", async () => {
    await expect(
      wrapDEK({
        dek: generateDEK(),
        senderPrivateKey: alice.privateKey,
        senderPublicKey: new Uint8Array(16),
        senderUserId: ALICE_ID,
        recipientPublicKey: bob.publicKey,
        recipientUserId: BOB_ID,
        fileId: 1,
      }),
    ).rejects.toBeInstanceOf(InvalidFormatError);
  });

  it("rejects wrong-size sender private key", async () => {
    await expect(
      wrapDEK({
        dek: generateDEK(),
        senderPrivateKey: new Uint8Array(16),
        senderPublicKey: alice.publicKey,
        senderUserId: ALICE_ID,
        recipientPublicKey: bob.publicKey,
        recipientUserId: BOB_ID,
        fileId: 1,
      }),
    ).rejects.toBeInstanceOf(InvalidFormatError);
  });

  it("rejects wrong-size recipient public key", async () => {
    await expect(
      wrapDEK({
        dek: generateDEK(),
        senderPrivateKey: alice.privateKey,
        senderPublicKey: alice.publicKey,
        senderUserId: ALICE_ID,
        recipientPublicKey: new Uint8Array(16),
        recipientUserId: BOB_ID,
        fileId: 1,
      }),
    ).rejects.toBeInstanceOf(InvalidFormatError);
  });

  it("rejects wrong-size recipient private key on unwrap", async () => {
    const wrapped = await wrapDEK({
      dek: generateDEK(),
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 1,
    });
    await expect(
      unwrapDEK({
        wrapped,
        recipientPrivateKey: new Uint8Array(16),
        recipientUserId: BOB_ID,
        expectedSenderPublicKey: alice.publicKey,
        expectedSenderUserId: ALICE_ID,
        fileId: 1,
      }),
    ).rejects.toBeInstanceOf(InvalidFormatError);
  });

  it("rejects unsupported suite id in wrap blob", async () => {
    const wrapped = await wrapDEK({
      dek: generateDEK(),
      senderPrivateKey: alice.privateKey,
      senderPublicKey: alice.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: 1,
    });
    const bytes = base64ToUint8Array(wrapped);
    bytes[5] = 0x99;
    const broken = arrayBufferToBase64(bytes);

    await expect(
      unwrapDEK({
        wrapped: broken,
        recipientPrivateKey: bob.privateKey,
        recipientUserId: BOB_ID,
        expectedSenderPublicKey: alice.publicKey,
        expectedSenderUserId: ALICE_ID,
        fileId: 1,
      }),
    ).rejects.toBeInstanceOf(UnsupportedSuiteError);
  });

  it("inspectWrap rejects truncated blob", () => {
    expect(() => inspectWrap("aGVsbG8=")).toThrow(InvalidFormatError);
  });

  it("inspectWrap rejects wrong magic bytes", () => {
    const fakeBlob = new Uint8Array(112);
    fakeBlob.fill(0xff);
    expect(() => inspectWrap(arrayBufferToBase64(fakeBlob))).toThrow(
      InvalidFormatError,
    );
  });
});
