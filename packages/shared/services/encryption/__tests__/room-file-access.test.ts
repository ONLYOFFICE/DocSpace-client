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

import { describe, it, expect, beforeAll } from "vitest";

import { generateIdentityKeyPair } from "../identity";
import { generateDEK } from "../file-keys";
import {
  wrapDekForRecipients,
  unwrapDekForCurrentUser,
  type RoomMemberPublicKey,
} from "../room-file-access";
import { NoAccessError, AuthenticationError } from "../errors";
import { getTofuStore, resetTofuStores } from "../tofu-store";
import { type IdentityKeyPair, type ServerAccessKeyDto } from "../types";
import { arrayBufferToBase64 } from "../utils";

const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";
const CAROL_ID = "33333333-3333-3333-3333-333333333333";
const MALLORY_ID = "99999999-9999-9999-9999-999999999999";

const FILE_ID = 4242;

function pubB64(kp: IdentityKeyPair): string {
  return arrayBufferToBase64(kp.publicKey.buffer as ArrayBuffer);
}

describe("roomFileAccess wrap → unwrap → revoke roundtrip", () => {
  let alice: IdentityKeyPair;
  let bob: IdentityKeyPair;
  let carol: IdentityKeyPair;
  let mallory: IdentityKeyPair;

  let dek: Uint8Array;
  let fileKeys: ServerAccessKeyDto[];
  let roomMemberKeys: RoomMemberPublicKey[];

  beforeAll(async () => {
    alice = await generateIdentityKeyPair();
    bob = await generateIdentityKeyPair();
    carol = await generateIdentityKeyPair();
    mallory = await generateIdentityKeyPair();

    dek = generateDEK();

    // Alice (sender) wraps the DEK for herself, Bob, and Carol - exactly
    // the layout the upload pipeline pushes via setFileEncryptionKeys.
    fileKeys = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [
        { userId: ALICE_ID, publicKey: pubB64(alice) },
        { userId: BOB_ID, publicKey: pubB64(bob) },
        { userId: CAROL_ID, publicKey: pubB64(carol) },
      ],
      fileId: FILE_ID,
    });

    roomMemberKeys = [
      { userId: ALICE_ID, publicKey: pubB64(alice) },
      { userId: BOB_ID, publicKey: pubB64(bob) },
      { userId: CAROL_ID, publicKey: pubB64(carol) },
    ];
  });

  it("produces one wrap entry per recipient", () => {
    expect(fileKeys.map((k) => k.userId).sort()).toEqual(
      [ALICE_ID, BOB_ID, CAROL_ID].sort(),
    );
    // Each entry has a distinct ciphertext.
    const ciphertexts = new Set(fileKeys.map((k) => k.privateKeyEnc));
    expect(ciphertexts.size).toBe(3);
  });

  it("Bob unwraps with his own identity", async () => {
    const out = await unwrapDekForCurrentUser({
      fileKeys,
      roomMemberKeys,
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });
    expect(out).toEqual(dek);
  });

  it("Carol unwraps with her own identity", async () => {
    const out = await unwrapDekForCurrentUser({
      fileKeys,
      roomMemberKeys,
      currentUserId: CAROL_ID,
      currentIdentity: carol,
      fileId: FILE_ID,
    });
    expect(out).toEqual(dek);
  });

  it("Alice unwraps her own slot (sender = self)", async () => {
    const out = await unwrapDekForCurrentUser({
      fileKeys,
      roomMemberKeys,
      currentUserId: ALICE_ID,
      currentIdentity: alice,
      fileId: FILE_ID,
    });
    expect(out).toEqual(dek);
  });

  it("Mallory has no entry → NoAccessError", async () => {
    await expect(
      unwrapDekForCurrentUser({
        fileKeys,
        roomMemberKeys,
        currentUserId: MALLORY_ID,
        currentIdentity: mallory,
        fileId: FILE_ID,
      }),
    ).rejects.toBeInstanceOf(NoAccessError);
  });

  it("Bob with the wrong identity → AuthenticationError (HPKE-Auth)", async () => {
    // Bob's userId, but Carol's private key.
    await expect(
      unwrapDekForCurrentUser({
        fileKeys,
        roomMemberKeys,
        currentUserId: BOB_ID,
        currentIdentity: carol,
        fileId: FILE_ID,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("Wrong fileId at unwrap fails (AAD binding)", async () => {
    await expect(
      unwrapDekForCurrentUser({
        fileKeys,
        roomMemberKeys,
        currentUserId: BOB_ID,
        currentIdentity: bob,
        fileId: FILE_ID + 1,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("Empty roomMemberKeys → AuthenticationError (sender unknown)", async () => {
    await expect(
      unwrapDekForCurrentUser({
        fileKeys,
        roomMemberKeys: [],
        currentUserId: BOB_ID,
        currentIdentity: bob,
        fileId: FILE_ID,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("Sender's public key substituted in roomMemberKeys → AuthenticationError", async () => {
    // Server returns Mallory's pubkey under Alice's userId. The sender
    // claim inside the wrapped blob points at Alice; HPKE-Auth verifies
    // the sender's key matches what we expect, so this must fail.
    const tamperedRoomKeys: RoomMemberPublicKey[] = [
      { userId: ALICE_ID, publicKey: pubB64(mallory) },
      { userId: BOB_ID, publicKey: pubB64(bob) },
      { userId: CAROL_ID, publicKey: pubB64(carol) },
    ];
    await expect(
      unwrapDekForCurrentUser({
        fileKeys,
        roomMemberKeys: tamperedRoomKeys,
        currentUserId: BOB_ID,
        currentIdentity: bob,
        fileId: FILE_ID,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  describe("after revoking Bob (server-side wrap removal)", () => {
    let revokedFileKeys: ServerAccessKeyDto[];

    beforeAll(() => {
      // Simulate what `revokeMemberFromEncryptedRoom` does at the API
      // level: re-publish the file's access list with Bob's entry dropped.
      revokedFileKeys = fileKeys.filter(
        (k) => String(k.userId) !== BOB_ID,
      );
    });

    it("Bob no longer finds his entry → NoAccessError", async () => {
      await expect(
        unwrapDekForCurrentUser({
          fileKeys: revokedFileKeys,
          roomMemberKeys,
          currentUserId: BOB_ID,
          currentIdentity: bob,
          fileId: FILE_ID,
        }),
      ).rejects.toBeInstanceOf(NoAccessError);
    });

    it("Carol is unaffected and can still unwrap", async () => {
      const out = await unwrapDekForCurrentUser({
        fileKeys: revokedFileKeys,
        roomMemberKeys,
        currentUserId: CAROL_ID,
        currentIdentity: carol,
        fileId: FILE_ID,
      });
      expect(out).toEqual(dek);
    });

    it("DOCUMENTED LIMITATION: a Bob who kept the original wrap blob can still unwrap it locally", async () => {
      // Revoke is a server-side ACL change; the original wrap is still
      // cryptographically valid for whoever cached it before the change.
      const bobOldEntry = fileKeys.find((k) => String(k.userId) === BOB_ID);
      expect(bobOldEntry).toBeDefined();
      const out = await unwrapDekForCurrentUser({
        fileKeys: [bobOldEntry!],
        roomMemberKeys,
        currentUserId: BOB_ID,
        currentIdentity: bob,
        fileId: FILE_ID,
      });
      expect(out).toEqual(dek);
    });
  });
});

describe("multi-key user (several concurrent registered keys)", () => {
  const KEY_IDS = ["alice-key-1", "alice-key-2", "alice-key-3"];

  let aliceKeys: IdentityKeyPair[];
  let bob: IdentityKeyPair;
  let carol: IdentityKeyPair;
  let dek: Uint8Array;
  let roomMemberKeys: RoomMemberPublicKey[];
  let wraps: ServerAccessKeyDto[][];

  beforeAll(async () => {
    resetTofuStores();
    aliceKeys = [
      await generateIdentityKeyPair(),
      await generateIdentityKeyPair(),
      await generateIdentityKeyPair(),
    ];
    bob = await generateIdentityKeyPair();
    carol = await generateIdentityKeyPair();
    dek = generateDEK();

    roomMemberKeys = [
      ...aliceKeys.map((kp, i) => ({
        userId: ALICE_ID,
        publicKey: pubB64(kp),
        publicKeyId: KEY_IDS[i],
      })),
      { userId: BOB_ID, publicKey: pubB64(bob) },
      { userId: CAROL_ID, publicKey: pubB64(carol) },
    ];

    wraps = [];
    for (let i = 0; i < aliceKeys.length; i++) {
      wraps.push(
        await wrapDekForRecipients({
          dek,
          senderIdentity: aliceKeys[i],
          senderUserId: ALICE_ID,
          recipients: [
            {
              userId: ALICE_ID,
              publicKey: pubB64(aliceKeys[i]),
              publicKeyId: KEY_IDS[i],
            },
            { userId: BOB_ID, publicKey: pubB64(bob) },
            { userId: CAROL_ID, publicKey: pubB64(carol) },
          ],
          fileId: FILE_ID,
        }),
      );
    }

    const tofu = getTofuStore(ALICE_ID);
    for (const kp of aliceKeys) {
      await tofu.acceptKey(ALICE_ID, pubB64(kp));
    }
  });

  it("every key opens its own wrap, regardless of member-list order", async () => {
    for (let i = 0; i < aliceKeys.length; i++) {
      const out = await unwrapDekForCurrentUser({
        fileKeys: wraps[i],
        roomMemberKeys,
        currentUserId: ALICE_ID,
        currentIdentity: aliceKeys[i],
        fileId: FILE_ID,
      });
      expect(out).toEqual(dek);

      const reversed = await unwrapDekForCurrentUser({
        fileKeys: wraps[i],
        roomMemberKeys: [...roomMemberKeys].reverse(),
        currentUserId: ALICE_ID,
        currentIdentity: aliceKeys[i],
        fileId: FILE_ID,
      });
      expect(reversed).toEqual(dek);
    }
  });

  it("REGRESSION: a wrap by the newest key opens even though older keys are listed first", async () => {
    const out = await unwrapDekForCurrentUser({
      fileKeys: wraps[wraps.length - 1],
      roomMemberKeys,
      currentUserId: ALICE_ID,
      currentIdentity: aliceKeys[aliceKeys.length - 1],
      fileId: FILE_ID,
    });
    expect(out).toEqual(dek);
  });

  it("a file carrying wraps for several of the user's keys opens with any of them", async () => {
    const combined = wraps.flatMap((w) =>
      w.filter((k) => String(k.userId) === ALICE_ID),
    );
    for (let i = 0; i < aliceKeys.length; i++) {
      const out = await unwrapDekForCurrentUser({
        fileKeys: combined,
        roomMemberKeys,
        currentUserId: ALICE_ID,
        currentIdentity: aliceKeys[i],
        fileId: FILE_ID,
      });
      expect(out).toEqual(dek);

      const shuffled = await unwrapDekForCurrentUser({
        fileKeys: [...combined].reverse(),
        roomMemberKeys,
        currentUserId: ALICE_ID,
        currentIdentity: aliceKeys[i],
        fileId: FILE_ID,
      });
      expect(shuffled).toEqual(dek);
    }
  });

  it("currentPublicKeyId hint (correct, stale, or absent) never breaks the unwrap", async () => {
    const combined = wraps.flatMap((w) =>
      w.filter((k) => String(k.userId) === ALICE_ID),
    );
    for (const hint of [KEY_IDS[1], "no-such-key-id", undefined]) {
      const out = await unwrapDekForCurrentUser({
        fileKeys: combined,
        roomMemberKeys,
        currentUserId: ALICE_ID,
        currentIdentity: aliceKeys[1],
        fileId: FILE_ID,
        currentPublicKeyId: hint,
      });
      expect(out).toEqual(dek);
    }
  });

  it("peer side: resolver fires at most once per unwrap across N sender candidates", async () => {
    const first = await unwrapDekForCurrentUser({
      fileKeys: wraps[0],
      roomMemberKeys,
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });
    expect(first).toEqual(dek);

    let calls = 0;
    const out = await unwrapDekForCurrentUser({
      fileKeys: wraps[1],
      roomMemberKeys,
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
      onKeyChange: async () => {
        calls += 1;
        return "accept";
      },
    });
    expect(out).toEqual(dek);
    expect(calls).toBe(1);

    calls = 0;
    await unwrapDekForCurrentUser({
      fileKeys: wraps[1],
      roomMemberKeys,
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
      onKeyChange: async () => {
        calls += 1;
        return "accept";
      },
    });
    expect(calls).toBe(0);

    const oldAgain = await unwrapDekForCurrentUser({
      fileKeys: wraps[0],
      roomMemberKeys,
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
      onKeyChange: async () => {
        throw new Error("must not prompt for an already-trusted key");
      },
    });
    expect(oldAgain).toEqual(dek);
  });

  it("peer side: refusing the key change withholds the DEK", async () => {
    await unwrapDekForCurrentUser({
      fileKeys: wraps[0],
      roomMemberKeys,
      currentUserId: CAROL_ID,
      currentIdentity: carol,
      fileId: FILE_ID,
    });
    await expect(
      unwrapDekForCurrentUser({
        fileKeys: wraps[2],
        roomMemberKeys,
        currentUserId: CAROL_ID,
        currentIdentity: carol,
        fileId: FILE_ID,
        onKeyChange: async () => "refuse",
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });
});
