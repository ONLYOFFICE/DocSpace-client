// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the
// Free Software Foundation. In accordance with Section 7(a) of the GNU AGPL its
// Section 15 shall be amended to the effect that Ascensio System SIA expressly
// excludes the warranty of non-infringement of any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied
// warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE.
// For details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { generateIdentityKeyPair } from "../identity";
import { generateDEK } from "../file-keys";
import {
  unwrapDekForCurrentUser,
  wrapDekForRecipients,
  type RoomMemberPublicKey,
} from "../room-file-access";
import {
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
