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

import type { TFunction } from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../room-encryption", () => ({
  addMembersToEncryptedRoom: vi.fn(),
  backfillEncryptedFilesForRoomMembers: vi.fn(),
  revokeMemberFromEncryptedRoom: vi.fn(),
  validateMembersForEncryption: vi.fn(),
}));
vi.mock("../../../api/groups", () => ({
  getGroupById: vi.fn(),
}));

import { getGroupById } from "../../../api/groups";
import type { IdentityKeyPair } from "../../encryption/types";
import {
  addMembersToEncryptedRoom,
  backfillEncryptedFilesForRoomMembers,
  revokeMemberFromEncryptedRoom,
} from "../room-encryption";
import {
  revokeRemovedMemberAccess,
  rewrapForInvitedMembers,
} from "../room-member-flows";
import { pendingAccessStore } from "../pending-access";

declare global {
  // eslint-disable-next-line no-var
  var allowConsoleError: (matcher: RegExp | string) => void;
}

/** Echoes the key and its interpolation values, so tests assert both. */
const t = ((key: string, values?: object) =>
  values ? `${key} ${JSON.stringify(values)}` : key) as unknown as TFunction;

const ROOM_ID = 9100;
const identity = {
  publicKey: new Uint8Array(32),
  privateKey: new Uint8Array(32),
} as IdentityKeyPair;

const ok = (fileId: number) => ({ fileId, success: true });
const failed = (fileId: number) => ({ fileId, success: false });

describe("rewrapForInvitedMembers", () => {
  const newMembers = [
    { id: "u-ann", displayName: "Ann" },
    { id: "u-bob", displayName: "Bob" },
    { id: "u-cid", displayName: "Cid" },
  ];
  const onProgress = vi.fn();
  const rewrap = () =>
    rewrapForInvitedMembers({
      t,
      roomId: ROOM_ID,
      newMembers,
      currentUserId: "u-me",
      identity,
      onProgress,
    });

  beforeEach(() => {
    vi.mocked(backfillEncryptedFilesForRoomMembers).mockResolvedValue(
      undefined as never,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("reports the invite and starts the backfill when every file is wrapped for every member", async () => {
    vi.mocked(addMembersToEncryptedRoom).mockImplementation(
      async (_roomId, _members, options) => {
        options?.onProgress?.(1, 3);
        return {
          fileResults: [ok(1), ok(2), ok(3)],
          skippedMembers: [],
          missingFileIdsByMember: {},
        };
      },
    );

    const notices = await rewrap();

    expect(notices).toEqual([{ level: "success", text: "Common:UsersInvited" }]);
    expect(addMembersToEncryptedRoom).toHaveBeenCalledWith(
      ROOM_ID,
      newMembers,
      expect.objectContaining({ currentUserId: "u-me", identity }),
    );
    expect(onProgress).toHaveBeenNthCalledWith(1, { percent: 33 });
    expect(onProgress).toHaveBeenLastCalledWith({
      percent: 100,
      completed: true,
      alert: false,
    });

    expect(backfillEncryptedFilesForRoomMembers).toHaveBeenCalledWith(
      ROOM_ID,
      expect.objectContaining({ currentUserId: "u-me", identity }),
    );
    const options = vi.mocked(backfillEncryptedFilesForRoomMembers).mock
      .calls[0][1];
    await expect(options?.onKeyChange?.({} as never)).resolves.toBe("refuse");
  });

  it("names the members skipped for a missing key and for a refused key change, without the invite notice", async () => {
    vi.mocked(addMembersToEncryptedRoom).mockResolvedValue({
      fileResults: [ok(1)],
      skippedMembers: [
        { id: "u-ann", reason: "no-key" },
        { id: "u-bob", displayName: "Robert", reason: "key-mismatch-refused" },
        { id: "u-zed", reason: "no-key" },
      ],
    } as never);

    const notices = await rewrap();

    expect(notices).toEqual([
      {
        level: "warning",
        text: `Common:EncryptedSkippedNoKeys ${JSON.stringify({ users: "Ann, u-zed" })}`,
      },
      {
        level: "warning",
        text: `Common:EncryptedSkippedKeyMismatch ${JSON.stringify({ users: "Robert" })}`,
      },
    ]);
    expect(onProgress).toHaveBeenLastCalledWith({
      percent: 100,
      completed: true,
      alert: true,
    });
    expect(backfillEncryptedFilesForRoomMembers).toHaveBeenCalledTimes(1);
  });

  it("warns with the count of files left without the new members' entries", async () => {
    vi.mocked(addMembersToEncryptedRoom).mockResolvedValue({
      fileResults: [ok(1), failed(2), failed(3)],
      skippedMembers: [],
    } as never);

    const notices = await rewrap();

    expect(notices).toEqual([
      {
        level: "warning",
        text: `Common:EncryptedReencryptPartialFailure ${JSON.stringify({ count: 2 })}`,
      },
    ]);
    expect(onProgress).toHaveBeenLastCalledWith({
      percent: 100,
      completed: true,
      alert: true,
    });
  });

  it("reports the failed re-encryption and ends the progress when the re-wrap rejects", async () => {
    vi.mocked(addMembersToEncryptedRoom).mockRejectedValue(new Error("down"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const notices = await rewrap();

    expect(notices).toEqual([
      { level: "error", text: "Common:EncryptedReencryptFailed" },
    ]);
    expect(onProgress).toHaveBeenLastCalledWith({
      percent: 100,
      completed: true,
      alert: true,
    });
    expect(backfillEncryptedFilesForRoomMembers).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("Mixed invitation: the outcome sorts the invitees into granted, pending and skipped", async () => {
    vi.mocked(addMembersToEncryptedRoom).mockResolvedValue({
      fileResults: [ok(1), failed(2)],
      skippedMembers: [{ id: "u-cid", reason: "no-key" }],
      missingFileIdsByMember: { "u-bob": [2] },
    } as never);
    const onOutcome = vi.fn();

    await rewrapForInvitedMembers({
      t,
      roomId: ROOM_ID,
      newMembers: [
        { id: "u-ann", displayName: "Ann" },
        { id: "u-bob", displayName: "Bob" },
        { id: "u-cid", displayName: "Cid" },
      ],
      currentUserId: "u-me",
      identity,
      onProgress,
      onOutcome,
    });

    expect(onOutcome).toHaveBeenCalledWith({
      granted: [{ id: "u-ann", displayName: "Ann" }],
      pending: [
        { member: { id: "u-bob", displayName: "Bob" }, missingFileIds: [2] },
      ],
      skipped: [{ id: "u-cid", displayName: "Cid", reason: "no-key" }],
    });
  });

  it("Some files fail: the invitee left without some files is recorded as pending access, and a granted one is cleared", async () => {
    pendingAccessStore.record({
      roomId: ROOM_ID,
      userId: "u-ann",
      missingFileIds: [1],
    });
    vi.mocked(addMembersToEncryptedRoom).mockResolvedValue({
      fileResults: [ok(1), failed(2)],
      skippedMembers: [],
      missingFileIdsByMember: { "u-bob": [2] },
    } as never);

    await rewrapForInvitedMembers({
      t,
      roomId: ROOM_ID,
      newMembers: [
        { id: "u-ann", displayName: "Ann" },
        { id: "u-bob", displayName: "Bob" },
      ],
      currentUserId: "u-me",
      identity,
      onProgress,
    });

    expect(pendingAccessStore.get(ROOM_ID, "u-ann")).toBeUndefined();
    expect(pendingAccessStore.get(ROOM_ID, "u-bob")).toEqual({
      roomId: ROOM_ID,
      userId: "u-bob",
      missingFileIds: [2],
    });
    pendingAccessStore.clear(ROOM_ID, "u-bob");
  });

  it("Re-encryption fails as a whole: every invitee is marked pending and recorded as missing all files", async () => {
    vi.mocked(addMembersToEncryptedRoom).mockRejectedValue(new Error("down"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onOutcome = vi.fn();

    await rewrapForInvitedMembers({
      t,
      roomId: ROOM_ID,
      newMembers: [{ id: "u-ann", displayName: "Ann" }],
      currentUserId: "u-me",
      identity,
      onProgress,
      onOutcome,
    });

    expect(onOutcome).toHaveBeenCalledWith({
      granted: [],
      pending: [
        { member: { id: "u-ann", displayName: "Ann" }, missingFileIds: [] },
      ],
      skipped: [],
      failed: true,
    });
    expect(pendingAccessStore.get(ROOM_ID, "u-ann")).toEqual({
      roomId: ROOM_ID,
      userId: "u-ann",
      missingFileIds: "all",
    });
    pendingAccessStore.clear(ROOM_ID, "u-ann");
    consoleError.mockRestore();
  });

  it("keeps the notices when the backfill fails", async () => {
    allowConsoleError(/Post-invite backfill failed/);
    vi.mocked(addMembersToEncryptedRoom).mockResolvedValue({
      fileResults: [ok(1)],
      skippedMembers: [],
    } as never);
    vi.mocked(backfillEncryptedFilesForRoomMembers).mockRejectedValue(
      new Error("down"),
    );

    await expect(rewrap()).resolves.toEqual([
      { level: "success", text: "Common:UsersInvited" },
    ]);
  });
});

describe("revokeRemovedMemberAccess", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("revokes the entries of every member of a removed group", async () => {
    vi.mocked(getGroupById).mockResolvedValue({
      members: [{ id: "u-ann" }, { id: "u-bob" }],
    } as never);
    vi.mocked(revokeMemberFromEncryptedRoom).mockResolvedValue([
      ok(1),
      ok(2),
    ] as never);

    const notice = await revokeRemovedMemberAccess(t, ROOM_ID, {
      id: "g-1",
      isGroup: true,
    });

    expect(getGroupById).toHaveBeenCalledWith("g-1", true);
    expect(revokeMemberFromEncryptedRoom).toHaveBeenCalledWith(
      ROOM_ID,
      ["u-ann", "u-bob"],
      {},
    );
    expect(notice).toEqual({
      level: "success",
      text: "Common:EncryptedRevokeCompleted",
    });
  });

  it("revokes nothing for a group without members", async () => {
    vi.mocked(getGroupById).mockResolvedValue({ members: [] } as never);

    const notice = await revokeRemovedMemberAccess(t, ROOM_ID, {
      id: "g-2",
      isGroup: true,
    });

    expect(notice).toBeNull();
    expect(revokeMemberFromEncryptedRoom).not.toHaveBeenCalled();
  });

  it("revokes a removed user's own entries and reports nothing when the room holds no encrypted file", async () => {
    vi.mocked(revokeMemberFromEncryptedRoom).mockResolvedValue([] as never);

    const notice = await revokeRemovedMemberAccess(t, ROOM_ID, { id: "u-ann" });

    expect(getGroupById).not.toHaveBeenCalled();
    expect(revokeMemberFromEncryptedRoom).toHaveBeenCalledWith(
      ROOM_ID,
      ["u-ann"],
      {},
    );
    expect(notice).toBeNull();
  });

  it("warns with the count of files that kept the removed member's entries", async () => {
    vi.mocked(revokeMemberFromEncryptedRoom).mockResolvedValue([
      ok(1),
      failed(2),
    ] as never);

    const notice = await revokeRemovedMemberAccess(t, ROOM_ID, { id: "u-ann" });

    expect(notice).toEqual({
      level: "warning",
      text: `Common:EncryptedRevokePartialFailure ${JSON.stringify({ count: 1 })}`,
    });
  });

  it("reports the failed revocation when it rejects", async () => {
    allowConsoleError(/revoke encrypted access failed/);
    vi.mocked(revokeMemberFromEncryptedRoom).mockRejectedValue(
      new Error("down"),
    );

    const notice = await revokeRemovedMemberAccess(t, ROOM_ID, { id: "u-ann" });

    expect(notice).toEqual({
      level: "error",
      text: "Common:EncryptedRevokeFailed",
    });
  });
});
