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

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { generateIdentityKeyPair } from "../../encryption/identity";
import { generateDEK } from "../../encryption/fileKeys";
import { wrapDekForRecipients } from "../../encryption/roomFileAccess";
import { resetTofuStores } from "../../encryption/tofuStore";
import type {
  IdentityKeyPair,
  ServerAccessKeyDto,
} from "../../encryption/types";
import { arrayBufferToBase64 } from "../../encryption/utils";
import {
  addMembersToEncryptedRoom,
  revokeMemberFromEncryptedRoom,
  rotateOwnIdentityForRoom,
  validateMembersForEncryption,
} from "../roomEncryption";

const getFolderMock = vi.fn();
const getFileEncryptionAccessMock = vi.fn();
const setFileEncryptionKeysMock = vi.fn();
const getRoomEncryptionKeysMock = vi.fn();

vi.mock("../../../api/files", () => ({
  getFolder: (...args: unknown[]) => getFolderMock(...args),
  getFileEncryptionAccess: (...args: unknown[]) =>
    getFileEncryptionAccessMock(...args),
  setFileEncryptionKeys: (...args: unknown[]) =>
    setFileEncryptionKeysMock(...args),
}));

vi.mock("../../../api/privacy", () => ({
  getRoomEncryptionKeys: (...args: unknown[]) =>
    getRoomEncryptionKeysMock(...args),
}));

vi.mock("../../../api/files/filter", () => {
  class FilesFilter {
    page = 1;
    pageCount = 100;
    static getDefault() {
      return new FilesFilter();
    }
  }
  return { default: FilesFilter };
});

type Store = Map<string, unknown>;

class MockOpenRequest {
  result: MockDB | null = null;
  error: Error | null = null;
  onupgradeneeded: (() => void) | null = null;
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onblocked: (() => void) | null = null;
}

class MockRequest<T> {
  result: T | undefined;
  error: Error | null = null;
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;
}

class MockObjectStoreNames {
  constructor(private names: Set<string>) {}
  contains(name: string): boolean {
    return this.names.has(name);
  }
}

class MockObjectStore {
  constructor(private store: Store) {}

  get(key: string): MockRequest<unknown> {
    const req = new MockRequest<unknown>();
    queueMicrotask(() => {
      req.result = this.store.get(key);
      req.onsuccess?.();
    });
    return req;
  }

  put(value: { userId: string }): MockRequest<void> {
    const req = new MockRequest<void>();
    queueMicrotask(() => {
      this.store.set(value.userId, value);
      req.onsuccess?.();
    });
    return req;
  }

  delete(key: string): MockRequest<void> {
    const req = new MockRequest<void>();
    queueMicrotask(() => {
      this.store.delete(key);
      req.onsuccess?.();
    });
    return req;
  }

  getAll(): MockRequest<unknown[]> {
    const req = new MockRequest<unknown[]>();
    queueMicrotask(() => {
      req.result = Array.from(this.store.values());
      req.onsuccess?.();
    });
    return req;
  }

  clear(): MockRequest<void> {
    const req = new MockRequest<void>();
    queueMicrotask(() => {
      this.store.clear();
      req.onsuccess?.();
    });
    return req;
  }
}

class MockTransaction {
  constructor(private store: Store) {}
  objectStore(_name: string): MockObjectStore {
    return new MockObjectStore(this.store);
  }
}

class MockDB {
  objectStoreNames: MockObjectStoreNames;
  constructor(
    private store: Store,
    private storeNames: Set<string>,
  ) {
    this.objectStoreNames = new MockObjectStoreNames(storeNames);
  }
  createObjectStore(name: string, _options: { keyPath: string }): void {
    this.storeNames.add(name);
  }
  transaction(_names: string, _mode: IDBTransactionMode): MockTransaction {
    return new MockTransaction(this.store);
  }
}

const dbs = new Map<string, { store: Store; storeNames: Set<string> }>();

function resetMockIDB(): void {
  dbs.clear();
}

const mockIDB = {
  open(name: string, _version: number): MockOpenRequest {
    const req = new MockOpenRequest();
    let entry = dbs.get(name);
    const isFresh = !entry;
    if (!entry) {
      entry = { store: new Map(), storeNames: new Set() };
      dbs.set(name, entry);
    }
    const db = new MockDB(entry.store, entry.storeNames);
    queueMicrotask(() => {
      if (isFresh) {
        req.result = db;
        req.onupgradeneeded?.();
      }
      req.result = db;
      req.onsuccess?.();
    });
    return req;
  },
};

const ALICE = "11111111-1111-1111-1111-111111111111";
const BOB = "22222222-2222-2222-2222-222222222222";
const ROOM_ID = 100;
const FILE_ID = 4242;

function pubB64(kp: IdentityKeyPair): string {
  return arrayBufferToBase64(kp.publicKey.buffer as ArrayBuffer);
}

function singleFile(fileId: number): { id: number; encrypted: boolean }[] {
  return [{ id: fileId, encrypted: true }];
}

describe("addMembersToEncryptedRoom", () => {
  let alice: IdentityKeyPair;
  let bob: IdentityKeyPair;
  let carol: IdentityKeyPair;
  let dek: Uint8Array;
  let aliceOwnWrap: ServerAccessKeyDto[];

  beforeEach(async () => {
    alice = await generateIdentityKeyPair();
    bob = await generateIdentityKeyPair();
    carol = await generateIdentityKeyPair();
    dek = generateDEK();

    aliceOwnWrap = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE,
      recipients: [{ userId: ALICE, publicKey: pubB64(alice) }],
      fileId: FILE_ID,
    });

    getFolderMock.mockReset();
    getFileEncryptionAccessMock.mockReset();
    setFileEncryptionKeysMock.mockReset();
    setFileEncryptionKeysMock.mockResolvedValue({});
    getRoomEncryptionKeysMock.mockReset();

    resetMockIDB();
    resetTofuStores();
    vi.stubGlobal("indexedDB", mockIDB);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns empty result when newMembers is empty", async () => {
    const result = await addMembersToEncryptedRoom(ROOM_ID, [], {
      currentUserId: ALICE,
      identity: alice,
    });
    expect(result.fileResults).toEqual([]);
    expect(result.skippedMembers).toEqual([]);
    expect(getFolderMock).not.toHaveBeenCalled();
    expect(getRoomEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("returns empty result when no encrypted files in room", async () => {
    getFolderMock.mockResolvedValue({ files: [], folders: [] });

    const result = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: BOB }],
      { currentUserId: ALICE, identity: alice },
    );

    expect(result.fileResults).toEqual([]);
    expect(result.skippedMembers).toEqual([]);
    expect(getRoomEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("re-wraps DEK for a new member listed in the room ACL", async () => {
    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID),
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: aliceOwnWrap,
      userKeys: [],
    });
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: ALICE, publicKey: pubB64(alice) },
      { userId: BOB, publicKey: pubB64(bob) },
    ]);

    const result = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: BOB, displayName: "Bob" }],
      { currentUserId: ALICE, identity: alice },
    );

    expect(result.skippedMembers).toEqual([]);
    expect(result.fileResults).toEqual([
      { fileId: FILE_ID, success: true },
    ]);
    expect(setFileEncryptionKeysMock).toHaveBeenCalledTimes(1);
    const [, keysPosted] = setFileEncryptionKeysMock.mock.calls[0];
    expect(keysPosted).toHaveLength(2);
    expect(
      (keysPosted as ServerAccessKeyDto[]).map((k) => String(k.userId)).sort(),
    ).toEqual([ALICE, BOB].sort());
  });

  it("marks the member as 'no-key' when absent from the room ACL", async () => {
    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID),
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: aliceOwnWrap,
      userKeys: [],
    });
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: ALICE, publicKey: pubB64(alice) },
    ]);

    const result = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: BOB, displayName: "Bob" }],
      { currentUserId: ALICE, identity: alice },
    );

    expect(result.skippedMembers).toEqual([
      { id: BOB, displayName: "Bob", reason: "no-key" },
    ]);
    expect(result.fileResults).toEqual([
      { fileId: FILE_ID, success: true },
    ]);
    expect(setFileEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("does not re-wrap for a member already present in fileKeys", async () => {
    const aliceAndBobWraps = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE,
      recipients: [
        { userId: ALICE, publicKey: pubB64(alice) },
        { userId: BOB, publicKey: pubB64(bob) },
      ],
      fileId: FILE_ID,
    });
    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID),
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: aliceAndBobWraps,
      userKeys: [],
    });
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: ALICE, publicKey: pubB64(alice) },
      { userId: BOB, publicKey: pubB64(bob) },
    ]);

    const result = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: BOB, displayName: "Bob" }],
      { currentUserId: ALICE, identity: alice },
    );

    expect(result.skippedMembers).toEqual([]);
    expect(result.fileResults).toEqual([
      { fileId: FILE_ID, success: true },
    ]);
    expect(setFileEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("marks the member as 'key-mismatch-refused' when the resolver rejects", async () => {
    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID),
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: aliceOwnWrap,
      userKeys: [],
    });

    getRoomEncryptionKeysMock.mockResolvedValueOnce([
      { userId: ALICE, publicKey: pubB64(alice) },
      { userId: BOB, publicKey: pubB64(bob) },
    ]);

    const firstRun = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: BOB, displayName: "Bob" }],
      { currentUserId: ALICE, identity: alice },
    );
    expect(firstRun.skippedMembers).toEqual([]);

    setFileEncryptionKeysMock.mockReset();
    setFileEncryptionKeysMock.mockResolvedValue({});

    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID + 1),
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: aliceOwnWrap,
      userKeys: [],
    });
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: ALICE, publicKey: pubB64(alice) },
      { userId: BOB, publicKey: pubB64(carol) },
    ]);

    const refuseResolver = vi.fn(async () => "refuse" as const);

    const result = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: BOB, displayName: "Bob" }],
      {
        currentUserId: ALICE,
        identity: alice,
        onKeyChange: refuseResolver,
      },
    );

    expect(refuseResolver).toHaveBeenCalledTimes(1);
    expect(result.skippedMembers).toEqual([
      { id: BOB, displayName: "Bob", reason: "key-mismatch-refused" },
    ]);
    expect(setFileEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("reports progress for each encrypted file processed", async () => {
    getFolderMock.mockResolvedValue({
      files: [
        { id: FILE_ID, encrypted: true },
        { id: FILE_ID + 1, encrypted: true },
      ],
      folders: [],
    });
    const secondWrap = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE,
      recipients: [{ userId: ALICE, publicKey: pubB64(alice) }],
      fileId: FILE_ID + 1,
    });
    getFileEncryptionAccessMock
      .mockResolvedValueOnce({ fileKeys: aliceOwnWrap, userKeys: [] })
      .mockResolvedValueOnce({ fileKeys: secondWrap, userKeys: [] });
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: ALICE, publicKey: pubB64(alice) },
      { userId: BOB, publicKey: pubB64(bob) },
    ]);

    const progress: Array<[number, number]> = [];
    const result = await addMembersToEncryptedRoom(
      ROOM_ID,
      [{ id: BOB }],
      {
        currentUserId: ALICE,
        identity: alice,
        onProgress: (p, total) => progress.push([p, total]),
      },
    );

    expect(result.fileResults).toHaveLength(2);
    expect(result.fileResults.every((r) => r.success)).toBe(true);
    expect(progress[0]).toEqual([0, 2]);
    expect(progress.at(-1)).toEqual([2, 2]);
  });
});

describe("validateMembersForEncryption", () => {
  let alice: IdentityKeyPair;
  let bob: IdentityKeyPair;

  beforeEach(async () => {
    alice = await generateIdentityKeyPair();
    bob = await generateIdentityKeyPair();

    getRoomEncryptionKeysMock.mockReset();

    resetMockIDB();
    resetTofuStores();
    vi.stubGlobal("indexedDB", mockIDB);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns empty result for empty memberIds", async () => {
    const result = await validateMembersForEncryption(ROOM_ID, [], ALICE);
    expect(result.valid).toEqual([]);
    expect(result.skipped).toEqual([]);
    expect(getRoomEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("returns valid entry when member has key in room ACL", async () => {
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: BOB, publicKey: pubB64(bob) },
    ]);

    const result = await validateMembersForEncryption(
      ROOM_ID,
      [BOB],
      ALICE,
      undefined,
      { [BOB]: "Bob" },
    );

    expect(result.skipped).toEqual([]);
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0]).toMatchObject({
      id: BOB,
      publicKey: pubB64(bob),
    });
  });

  it("reports skipped 'no-key' when member is absent from room ACL", async () => {
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: ALICE, publicKey: pubB64(alice) },
    ]);

    const result = await validateMembersForEncryption(
      ROOM_ID,
      [BOB],
      ALICE,
      undefined,
      { [BOB]: "Bob" },
    );

    expect(result.valid).toEqual([]);
    expect(result.skipped).toEqual([
      { id: BOB, displayName: "Bob", reason: "no-key" },
    ]);
  });
});

const CAROL = "33333333-3333-3333-3333-333333333333";

describe("revokeMemberFromEncryptedRoom", () => {
  let alice: IdentityKeyPair;
  let bob: IdentityKeyPair;
  let aliceAndBobWraps: ServerAccessKeyDto[];

  beforeEach(async () => {
    alice = await generateIdentityKeyPair();
    bob = await generateIdentityKeyPair();
    const dek = generateDEK();
    aliceAndBobWraps = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE,
      recipients: [
        { userId: ALICE, publicKey: pubB64(alice) },
        { userId: BOB, publicKey: pubB64(bob) },
      ],
      fileId: FILE_ID,
    });

    getFolderMock.mockReset();
    getFileEncryptionAccessMock.mockReset();
    setFileEncryptionKeysMock.mockReset();
    setFileEncryptionKeysMock.mockResolvedValue({});

    resetMockIDB();
    resetTofuStores();
    vi.stubGlobal("indexedDB", mockIDB);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns empty result when revokedUserIds is empty", async () => {
    const result = await revokeMemberFromEncryptedRoom(ROOM_ID, [], {});
    expect(result).toEqual([]);
    expect(getFolderMock).not.toHaveBeenCalled();
  });

  it("returns empty result when the room has no encrypted files", async () => {
    getFolderMock.mockResolvedValue({ files: [], folders: [] });

    const result = await revokeMemberFromEncryptedRoom(ROOM_ID, [BOB], {});

    expect(result).toEqual([]);
    expect(getFileEncryptionAccessMock).not.toHaveBeenCalled();
    expect(setFileEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("removes the revoked user's entry and writes back the filtered fileKeys", async () => {
    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID),
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: aliceAndBobWraps,
      userKeys: [],
    });

    const result = await revokeMemberFromEncryptedRoom(ROOM_ID, [BOB], {});

    expect(result).toEqual([{ fileId: FILE_ID, success: true }]);
    expect(setFileEncryptionKeysMock).toHaveBeenCalledTimes(1);
    const [fileId, keysPosted] = setFileEncryptionKeysMock.mock.calls[0];
    expect(fileId).toBe(FILE_ID);
    const userIds = (keysPosted as ServerAccessKeyDto[]).map((k) =>
      String(k.userId),
    );
    expect(userIds).toEqual([ALICE]);
    expect(userIds).not.toContain(BOB);
  });

  it("skips the API write when the revoked user is not in fileKeys (no-op)", async () => {
    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID),
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: aliceAndBobWraps,
      userKeys: [],
    });

    const result = await revokeMemberFromEncryptedRoom(ROOM_ID, [CAROL], {});

    expect(result).toEqual([{ fileId: FILE_ID, success: true }]);
    expect(setFileEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("accepts a single userId string in addition to an array", async () => {
    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID),
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: aliceAndBobWraps,
      userKeys: [],
    });

    await revokeMemberFromEncryptedRoom(ROOM_ID, BOB, {});

    expect(setFileEncryptionKeysMock).toHaveBeenCalledTimes(1);
    const [, keysPosted] = setFileEncryptionKeysMock.mock.calls[0];
    expect(
      (keysPosted as ServerAccessKeyDto[]).map((k) => String(k.userId)),
    ).toEqual([ALICE]);
  });

  it("returns an error result when fileKeys is missing", async () => {
    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID),
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({ fileKeys: null });

    const result = await revokeMemberFromEncryptedRoom(ROOM_ID, [BOB], {});

    expect(result).toEqual([
      {
        fileId: FILE_ID,
        success: false,
        error: "no encryption keys for file",
      },
    ]);
    expect(setFileEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("records per-file errors and KEEPS processing the rest", async () => {
    const fileA = 4242;
    const fileB = 4343;
    getFolderMock.mockResolvedValue({
      files: [
        { id: fileA, encrypted: true },
        { id: fileB, encrypted: true },
      ],
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: aliceAndBobWraps,
      userKeys: [],
    });
    setFileEncryptionKeysMock.mockImplementationOnce(async () => {
      throw new Error("file A access denied");
    });

    const result = await revokeMemberFromEncryptedRoom(ROOM_ID, [BOB], {});

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      fileId: fileA,
      success: false,
      error: "file A access denied",
    });
    expect(result[1]).toEqual({ fileId: fileB, success: true });
  });

  it("reports progress 0/N at start and N/N at end", async () => {
    getFolderMock.mockResolvedValue({
      files: [
        { id: 1, encrypted: true },
        { id: 2, encrypted: true },
      ],
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: aliceAndBobWraps,
      userKeys: [],
    });

    const progress: Array<[number, number]> = [];
    await revokeMemberFromEncryptedRoom(ROOM_ID, [BOB], {
      onProgress: (p, total) => progress.push([p, total]),
    });

    expect(progress[0]).toEqual([0, 2]);
    expect(progress.at(-1)).toEqual([2, 2]);
  });
});

describe("rotateOwnIdentityForRoom", () => {
  let aliceOld: IdentityKeyPair;
  let aliceNew: IdentityKeyPair;
  let bob: IdentityKeyPair;
  let dek: Uint8Array;
  let initialWraps: ServerAccessKeyDto[];

  beforeEach(async () => {
    aliceOld = await generateIdentityKeyPair();
    aliceNew = await generateIdentityKeyPair();
    bob = await generateIdentityKeyPair();
    dek = generateDEK();

    initialWraps = await wrapDekForRecipients({
      dek,
      senderIdentity: aliceOld,
      senderUserId: ALICE,
      recipients: [
        { userId: ALICE, publicKey: pubB64(aliceOld) },
        { userId: BOB, publicKey: pubB64(bob) },
      ],
      fileId: FILE_ID,
    });

    getFolderMock.mockReset();
    getFileEncryptionAccessMock.mockReset();
    setFileEncryptionKeysMock.mockReset();
    setFileEncryptionKeysMock.mockResolvedValue({});
    getRoomEncryptionKeysMock.mockReset();

    resetMockIDB();
    resetTofuStores();
    vi.stubGlobal("indexedDB", mockIDB);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const opts = () => ({
    currentUserId: ALICE,
    oldIdentity: aliceOld,
    newIdentity: aliceNew,
  });

  it("returns empty result when the room has no encrypted files", async () => {
    getFolderMock.mockResolvedValue({ files: [], folders: [] });

    const result = await rotateOwnIdentityForRoom(ROOM_ID, opts());

    expect(result).toEqual([]);
    expect(getRoomEncryptionKeysMock).not.toHaveBeenCalled();
    expect(setFileEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("re-wraps Alice's own entry with the new identity, preserving Bob's untouched", async () => {
    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID),
      folders: [],
    });
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: initialWraps,
      userKeys: [],
    });
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: ALICE, publicKey: pubB64(aliceOld) },
      { userId: BOB, publicKey: pubB64(bob) },
    ]);

    const result = await rotateOwnIdentityForRoom(ROOM_ID, opts());

    expect(result).toEqual([{ fileId: FILE_ID, success: true }]);
    expect(setFileEncryptionKeysMock).toHaveBeenCalledTimes(1);
    const [fileId, posted] = setFileEncryptionKeysMock.mock.calls[0];
    expect(fileId).toBe(FILE_ID);

    const aliceOriginal = initialWraps.find(
      (k) => String(k.userId) === ALICE,
    )!;
    const bobOriginal = initialWraps.find(
      (k) => String(k.userId) === BOB,
    )!;
    const aliceNewEntry = (posted as ServerAccessKeyDto[]).find(
      (k) => String(k.userId) === ALICE,
    )!;
    const bobAfter = (posted as ServerAccessKeyDto[]).find(
      (k) => String(k.userId) === BOB,
    )!;

    expect(bobAfter.privateKeyEnc).toBe(bobOriginal.privateKeyEnc);
    expect(aliceNewEntry.privateKeyEnc).not.toBe(aliceOriginal.privateKeyEnc);
  });

  it("returns an error when fileKeys is missing", async () => {
    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID),
      folders: [],
    });
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: ALICE, publicKey: pubB64(aliceOld) },
    ]);
    getFileEncryptionAccessMock.mockResolvedValue({ fileKeys: null });

    const result = await rotateOwnIdentityForRoom(ROOM_ID, opts());
    expect(result).toEqual([
      {
        fileId: FILE_ID,
        success: false,
        error: "no encryption keys for file",
      },
    ]);
    expect(setFileEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("reports a per-file error when unwrap fails (wrong old identity)", async () => {
    getFolderMock.mockResolvedValue({
      files: singleFile(FILE_ID),
      folders: [],
    });
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: ALICE, publicKey: pubB64(aliceOld) },
    ]);
    getFileEncryptionAccessMock.mockResolvedValue({
      fileKeys: initialWraps,
      userKeys: [],
    });

    // Pass `bob` as oldIdentity so unwrap fails.
    const result = await rotateOwnIdentityForRoom(ROOM_ID, {
      currentUserId: ALICE,
      oldIdentity: bob,
      newIdentity: aliceNew,
    });

    expect(result).toHaveLength(1);
    expect(result[0].success).toBe(false);
    expect(result[0].error).toBeTruthy();
    expect(setFileEncryptionKeysMock).not.toHaveBeenCalled();
  });

  it("continues processing other files when one file fails", async () => {
    const fileA = 4242;
    const fileB = 4343;
    getFolderMock.mockResolvedValue({
      files: [
        { id: fileA, encrypted: true },
        { id: fileB, encrypted: true },
      ],
      folders: [],
    });
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: ALICE, publicKey: pubB64(aliceOld) },
      { userId: BOB, publicKey: pubB64(bob) },
    ]);

    getFileEncryptionAccessMock
      .mockResolvedValueOnce({ fileKeys: initialWraps, userKeys: [] })
      .mockResolvedValueOnce({ fileKeys: null });

    const result = await rotateOwnIdentityForRoom(ROOM_ID, opts());

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ fileId: fileA, success: true });
    expect(result[1].success).toBe(false);
  });

  it("reports progress 0/N then N/N", async () => {
    // Wraps are bound to fileId via AAD — separate wrap set per fileId.
    const fileA = FILE_ID;
    const fileB = FILE_ID + 1;
    const wrapsA = initialWraps;
    const wrapsB = await wrapDekForRecipients({
      dek,
      senderIdentity: aliceOld,
      senderUserId: ALICE,
      recipients: [
        { userId: ALICE, publicKey: pubB64(aliceOld) },
        { userId: BOB, publicKey: pubB64(bob) },
      ],
      fileId: fileB,
    });

    getFolderMock.mockResolvedValue({
      files: [
        { id: fileA, encrypted: true },
        { id: fileB, encrypted: true },
      ],
      folders: [],
    });
    getRoomEncryptionKeysMock.mockResolvedValue([
      { userId: ALICE, publicKey: pubB64(aliceOld) },
      { userId: BOB, publicKey: pubB64(bob) },
    ]);
    getFileEncryptionAccessMock
      .mockResolvedValueOnce({ fileKeys: wrapsA, userKeys: [] })
      .mockResolvedValueOnce({ fileKeys: wrapsB, userKeys: [] });

    const progress: Array<[number, number]> = [];
    const result = await rotateOwnIdentityForRoom(ROOM_ID, {
      ...opts(),
      onProgress: (p, total) => progress.push([p, total]),
    });

    expect(result.every((r) => r.success)).toBe(true);
    expect(progress[0]).toEqual([0, 2]);
    expect(progress.at(-1)).toEqual([2, 2]);
  });
});
