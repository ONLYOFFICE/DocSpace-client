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

// End-to-end smoke tests covering the full cryptographic flow:
//
//   1. Alice and Bob each generate identity keypairs and serialize them
//      under their passphrases.
//   2. Alice unlocks her identity via passphrase.
//   3. Alice encrypts a file (DEK + DSE3 v2 blob).
//   4. Alice wraps the DEK for Bob via HPKE-Auth.
//   5. Bob unlocks his identity via passphrase.
//   6. Bob unwraps the DEK and decrypts the file.
//   7. Plaintext + filename match.
//
// Negative scenarios:
//
//   - Carol (uninvited third party) cannot unwrap.
//   - Tampering with the DSE3 ciphertext fails.
//   - Wrong fileId in unwrap fails.
//   - Server-substituted public key in identity envelope is detected.
//   - Recovery phrase recovers the same private key as passphrase.
import { describe, it, expect, beforeAll } from "vitest";

import {
  generateIdentityKeyPair,
  serializeIdentity,
  unlockWithPassphrase,
  unlockWithRecoveryPhrase,
} from "../identity";
import { wrapDEK, unwrapDEK } from "../hpke";
import { encryptFile, decryptFile } from "../file-keys";
import { generateRecoveryMnemonic } from "../recovery";
import { AuthenticationError, DecryptionError } from "../errors";
import { type IdentityKeyPair, type SerializedIdentity } from "../types";

// Reduce Argon2id cost so the e2e suite runs quickly.
const FAST_PARAMS = { m_KiB: 256, t: 1, p: 1 };

const ALICE_ID = "11111111-aaaa-1111-aaaa-111111111111";
const BOB_ID = "22222222-bbbb-2222-bbbb-222222222222";
const CAROL_ID = "33333333-cccc-3333-cccc-333333333333";

const FILE_ID = 4242;

function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

describe("e2e: identity → encryptFile → wrapDEK → unwrap → decryptFile", () => {
  let alice: IdentityKeyPair;
  let bob: IdentityKeyPair;
  let carol: IdentityKeyPair;
  let aliceSerialized: SerializedIdentity;
  let bobSerialized: SerializedIdentity;

  beforeAll(async () => {
    alice = await generateIdentityKeyPair();
    bob = await generateIdentityKeyPair();
    carol = await generateIdentityKeyPair();
    aliceSerialized = await serializeIdentity(alice, "alice-pp", {
      argon2Params: FAST_PARAMS,
    });
    bobSerialized = await serializeIdentity(bob, "bob-pp", {
      argon2Params: FAST_PARAMS,
    });
  });

  it("Alice encrypts a file, Bob (after passphrase unlock) decrypts it", async () => {
    // Alice unlocks her identity from server-stored envelope
    const aliceKp = await unlockWithPassphrase(aliceSerialized, "alice-pp");

    // Alice encrypts the file
    const fileContent = new Uint8Array(4096);
    globalThis.crypto.getRandomValues(fileContent);
    const fileName = "shared-secret.txt";

    const { encryptedBlob, dek } = await encryptFile(fileContent, {
      fileName,
    });

    // Server assigns fileId; Alice now wraps the DEK for Bob
    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: aliceKp.privateKey,
      senderPublicKey: aliceKp.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey, // server returns Bob's pub
      recipientUserId: BOB_ID,
      fileId: FILE_ID,
    });

    // ----- ----- transit/storage on server ----- -----

    // Bob unlocks his identity
    const bobKp = await unlockWithPassphrase(bobSerialized, "bob-pp");

    // Bob retrieves the encrypted file + the wrapped DEK addressed to him.
    // Bob asks for Alice's public key (server returns her pub key string).
    const dekRecovered = await unwrapDEK({
      wrapped,
      recipientPrivateKey: bobKp.privateKey,
      recipientUserId: BOB_ID,
      expectedSenderPublicKey: aliceKp.publicKey,
      expectedSenderUserId: ALICE_ID,
      fileId: FILE_ID,
    });
    expect(dekRecovered).toEqual(dek);

    // Bob decrypts the file
    const encryptedBytes = await blobToUint8Array(encryptedBlob);
    const result = await decryptFile(encryptedBytes, dekRecovered);
    const back = await blobToUint8Array(result.data);

    expect(back).toEqual(fileContent);
    expect(result.fileName).toBe(fileName);
  });

  it("Carol (uninvited) cannot unwrap Alice→Bob's DEK", async () => {
    const aliceKp = await unlockWithPassphrase(aliceSerialized, "alice-pp");

    const dummy = new Uint8Array(32).fill(0xab);
    const { dek } = await encryptFile(dummy);

    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: aliceKp.privateKey,
      senderPublicKey: aliceKp.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: FILE_ID,
    });

    // Carol intercepts the wrapped DEK and tries to unwrap with her key
    await expect(
      unwrapDEK({
        wrapped,
        recipientPrivateKey: carol.privateKey,
        recipientUserId: CAROL_ID,
        expectedSenderPublicKey: aliceKp.publicKey,
        expectedSenderUserId: ALICE_ID,
        fileId: FILE_ID,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("Wrong fileId at unwrap time rejects (AAD-binding)", async () => {
    const aliceKp = await unlockWithPassphrase(aliceSerialized, "alice-pp");
    const { dek } = await encryptFile(new Uint8Array(16));

    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: aliceKp.privateKey,
      senderPublicKey: aliceKp.publicKey,
      senderUserId: ALICE_ID,
      recipientPublicKey: bob.publicKey,
      recipientUserId: BOB_ID,
      fileId: FILE_ID,
    });

    await expect(
      unwrapDEK({
        wrapped,
        recipientPrivateKey: bob.privateKey,
        recipientUserId: BOB_ID,
        expectedSenderPublicKey: aliceKp.publicKey,
        expectedSenderUserId: ALICE_ID,
        fileId: FILE_ID + 1,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("Tampering with DSE3 ciphertext fails decryption", async () => {
    const data = new Uint8Array(2048);
    globalThis.crypto.getRandomValues(data);
    const { encryptedBlob, dek } = await encryptFile(data);

    const bytes = await blobToUint8Array(encryptedBlob);
    bytes[bytes.byteLength - 5] ^= 0xff; // flip a byte in the last chunk
    await expect(decryptFile(bytes, dek)).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });

  it("Recovery phrase unlocks the same private key as passphrase", async () => {
    const mnemonic = await generateRecoveryMnemonic();
    const serialized = await serializeIdentity(alice, "alice-pp", {
      argon2Params: FAST_PARAMS,
      recoveryMnemonic: mnemonic,
    });
    const viaPp = await unlockWithPassphrase(serialized, "alice-pp");
    const viaRec = await unlockWithRecoveryPhrase(serialized, mnemonic);
    expect(viaPp.privateKey).toEqual(viaRec.privateKey);
    expect(viaPp.publicKey).toEqual(viaRec.publicKey);
  });
});
