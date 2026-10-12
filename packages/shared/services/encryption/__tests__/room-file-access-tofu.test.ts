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

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { generateIdentityKeyPair } from "../identity";
import { generateDEK } from "../file-keys";
import {
  unwrapDekForCurrentUser,
  wrapDekForRecipients,
  type RoomMemberPublicKey,
} from "../room-file-access";
import {
  getTofuStore,
  resetTofuStores,
  registerKeyMismatchHandler,
  unregisterKeyMismatchHandler,
  type KeyMismatchResolver,
} from "../tofu-store";
import { AuthenticationError } from "../errors";
import type { IdentityKeyPair, ServerAccessKeyDto } from "../types";
import { arrayBufferToBase64 } from "../utils";
import { mockIDB, resetMockIDB } from "../../private-room/__tests__/_helpers/mock-idb";

const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";
const ATTACKER_ID = "99999999-9999-9999-9999-999999999999";
const FILE_ID = 4242;

function pubB64(kp: IdentityKeyPair): string {
  return arrayBufferToBase64(kp.publicKey.buffer as ArrayBuffer);
}

describe("unwrapDekForCurrentUser — TOFU verification on sender public key", () => {
  let alice: IdentityKeyPair;
  let bob: IdentityKeyPair;
  let attacker: IdentityKeyPair;
  let dek: Uint8Array;
  let legitimateFileKeys: ServerAccessKeyDto[];
  let attackerFileKeys: ServerAccessKeyDto[];

  beforeEach(async () => {
    alice = await generateIdentityKeyPair();
    bob = await generateIdentityKeyPair();
    attacker = await generateIdentityKeyPair();
    dek = generateDEK();

    legitimateFileKeys = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [
        { userId: ALICE_ID, publicKey: pubB64(alice) },
        { userId: BOB_ID, publicKey: pubB64(bob) },
      ],
      fileId: FILE_ID,
    });

    attackerFileKeys = await wrapDekForRecipients({
      dek,
      senderIdentity: attacker,
      senderUserId: ALICE_ID,
      recipients: [{ userId: BOB_ID, publicKey: pubB64(bob) }],
      fileId: FILE_ID,
    });

    resetMockIDB();
    resetTofuStores();
    unregisterKeyMismatchHandler();
    vi.stubGlobal("indexedDB", mockIDB);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    unregisterKeyMismatchHandler();
  });

  it("records sender's key as first-seen on the very first unwrap (no resolver invoked)", async () => {
    const resolver = vi.fn<KeyMismatchResolver>(async () => "refuse");
    registerKeyMismatchHandler(resolver);

    const out = await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    expect(out).toEqual(dek);
    expect(resolver).not.toHaveBeenCalled();
  });

  it("matches on a subsequent unwrap with the same sender key", async () => {
    const roomMemberKeys: RoomMemberPublicKey[] = [
      { userId: ALICE_ID, publicKey: pubB64(alice) },
    ];

    await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys,
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    const out = await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys,
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });
    expect(out).toEqual(dek);
  });

  it("refuses to unwrap when sender's pinned key was swapped server-side and no resolver is registered", async () => {
    await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    await expect(
      unwrapDekForCurrentUser({
        fileKeys: attackerFileKeys,
        roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(attacker) }],
        currentUserId: BOB_ID,
        currentIdentity: bob,
        fileId: FILE_ID,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("invokes the registered global resolver on mismatch and refuses on 'refuse'", async () => {
    await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    const resolver = vi.fn<KeyMismatchResolver>(async () => "refuse");
    registerKeyMismatchHandler(resolver);

    await expect(
      unwrapDekForCurrentUser({
        fileKeys: attackerFileKeys,
        roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(attacker) }],
        currentUserId: BOB_ID,
        currentIdentity: bob,
        fileId: FILE_ID,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);

    expect(resolver).toHaveBeenCalledTimes(1);
    const call = resolver.mock.calls[0][0];
    expect(call.userId).toBe(ALICE_ID);
    expect(call.knownKey).toBe(pubB64(alice));
    expect(call.newKey).toBe(pubB64(attacker));
  });

  it("accepts the new key when resolver returns 'accept' and proceeds with unwrap", async () => {
    await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    const resolver = vi.fn<KeyMismatchResolver>(async () => "accept");

    const out = await unwrapDekForCurrentUser({
      fileKeys: attackerFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(attacker) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
      onKeyChange: resolver,
    });

    expect(out).toEqual(dek);
    expect(resolver).toHaveBeenCalledTimes(1);

    const second = await unwrapDekForCurrentUser({
      fileKeys: attackerFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(attacker) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });
    expect(second).toEqual(dek);
  });

  it("param resolver takes precedence over global handler", async () => {
    await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    const globalResolver = vi.fn<KeyMismatchResolver>(async () => "refuse");
    registerKeyMismatchHandler(globalResolver);
    const paramResolver = vi.fn<KeyMismatchResolver>(async () => "accept");

    const out = await unwrapDekForCurrentUser({
      fileKeys: attackerFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(attacker) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
      onKeyChange: paramResolver,
    });

    expect(out).toEqual(dek);
    expect(paramResolver).toHaveBeenCalledTimes(1);
    expect(globalResolver).not.toHaveBeenCalled();
  });

  it("treats a thrown resolver as refuse", async () => {
    await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    const resolver = vi.fn<KeyMismatchResolver>(async () => {
      throw new Error("resolver crashed");
    });

    await expect(
      unwrapDekForCurrentUser({
        fileKeys: attackerFileKeys,
        roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(attacker) }],
        currentUserId: BOB_ID,
        currentIdentity: bob,
        fileId: FILE_ID,
        onKeyChange: resolver,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("unwraps via the TOFU-trusted sender key after the sender left the room (bug 82872)", async () => {
    // First unwrap pins the sender's key; the second runs after the sender
    // left, when both live key sources come back empty.
    await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    const out = await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys: [],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });
    expect(out).toEqual(dek);
  });

  it("still refuses when the device never saw the departed sender's key", async () => {
    await expect(
      unwrapDekForCurrentUser({
        fileKeys: legitimateFileKeys,
        roomMemberKeys: [],
        currentUserId: BOB_ID,
        currentIdentity: bob,
        fileId: FILE_ID,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("TOFU fallback cannot unwrap when the trusted key is not the wrap's real sender key", async () => {
    await getTofuStore(BOB_ID).acceptKey(ALICE_ID, pubB64(attacker));

    await expect(
      unwrapDekForCurrentUser({
        fileKeys: legitimateFileKeys,
        roomMemberKeys: [],
        currentUserId: BOB_ID,
        currentIdentity: bob,
        fileId: FILE_ID,
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("falls back to the TOFU key when the live key for the sender does not open the wrap", async () => {
    await getTofuStore(BOB_ID).acceptKey(ALICE_ID, pubB64(alice));

    const out = await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(attacker) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });
    expect(out).toEqual(dek);
  });

  it("does not invoke resolver when sender is unrelated (different userId) — separate TOFU record", async () => {
    const resolver = vi.fn<KeyMismatchResolver>(async () => "refuse");
    registerKeyMismatchHandler(resolver);

    await unwrapDekForCurrentUser({
      fileKeys: legitimateFileKeys,
      roomMemberKeys: [{ userId: ALICE_ID, publicKey: pubB64(alice) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    expect(resolver).not.toHaveBeenCalled();

    const carolKp = await generateIdentityKeyPair();
    const carolWrap = await wrapDekForRecipients({
      dek,
      senderIdentity: carolKp,
      senderUserId: ATTACKER_ID,
      recipients: [{ userId: BOB_ID, publicKey: pubB64(bob) }],
      fileId: FILE_ID,
    });

    const out = await unwrapDekForCurrentUser({
      fileKeys: carolWrap,
      roomMemberKeys: [{ userId: ATTACKER_ID, publicKey: pubB64(carolKp) }],
      currentUserId: BOB_ID,
      currentIdentity: bob,
      fileId: FILE_ID,
    });

    expect(out).toEqual(dek);
    expect(resolver).not.toHaveBeenCalled();
  });
});
