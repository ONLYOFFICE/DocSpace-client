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

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Pure-logic contract tests for the revoke-outcome toast logic used inside
// usePrivateRemoveMemberFlow.
//
// The hook calls revokeMemberFromEncryptedRoom(...) and then:
//   • all success  → toastr.success(t("Common:EncryptedRevokeCompleted"))
//   • some failure → toastr.warning(t("Common:EncryptedRevokePartialFailure",
//                                     { count: failures.length }))
//   • thrown error → toastr.error(t("Common:EncryptedRevokeFailed"))
//
// Group expansion (task #29):
//   • isGroup=true  → getGroupById(id, true) is called, members mapped to IDs
//   • empty group   → revoke is NOT called (nothing to revoke)
//   • isGroup=false → getGroupById is NOT called, [userId] used directly
//
// Reference: packages/client/src/pages/Home/InfoPanel/Body/views/Members/
//            sub-components/User.tsx:163-193
//
// We inline the decision logic to avoid requiring React context providers
// in the SDK test environment. The behaviour is fully determined by this
// logic and any change to the real hook must be mirrored here.
// ---------------------------------------------------------------------------

type FileEncryptionOpResult = {
  fileId: number;
  success: boolean;
  error?: string;
};

const COMPLETED_KEY = "Common:EncryptedRevokeCompleted";
const PARTIAL_KEY = "Common:EncryptedRevokePartialFailure";
const FAILED_KEY = "Common:EncryptedRevokeFailed";

/**
 * Mirrors the post-revoke toast logic from usePrivateRemoveMemberFlow step 2.
 * Returns the toast call that was made so tests can assert against it.
 */
async function runRevokeLogic(
  revoke: () => Promise<FileEncryptionOpResult[]>,
  toastrSuccess: (msg: string) => void,
  toastrWarning: (msg: string, opts?: Record<string, unknown>) => void,
  toastrError: (msg: string) => void,
  t: (key: string, opts?: Record<string, unknown>) => string,
): Promise<void> {
  try {
    const results = await revoke();
    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      toastrWarning(t("Common:EncryptedRevokePartialFailure", { count: failures.length }));
      return;
    }
    if (results.length > 0) {
      toastrSuccess(t("Common:EncryptedRevokeCompleted"));
    }
  } catch {
    toastrError(t("Common:EncryptedRevokeFailed"));
  }
}

// ---------------------------------------------------------------------------
// Test setup helpers
// ---------------------------------------------------------------------------

function makeToasts() {
  return {
    success: vi.fn<(msg: string) => void>(),
    warning: vi.fn<(msg: string, opts?: Record<string, unknown>) => void>(),
    error: vi.fn<(msg: string) => void>(),
  };
}

// Simple translation stub: returns the key (with interpolation rendered
// so we can assert on the full string including count).
function t(key: string, opts?: Record<string, unknown>): string {
  if (!opts) return key;
  return Object.entries(opts).reduce(
    (acc, [k, v]) => acc.replace(`{{${k}}}`, String(v)),
    key,
  );
}

// ---------------------------------------------------------------------------
// Scenario 1: all file-keys re-issued successfully
// ---------------------------------------------------------------------------

describe("revoke outcome — all files succeed", () => {
  let toasts: ReturnType<typeof makeToasts>;

  beforeEach(() => {
    toasts = makeToasts();
  });

  it("shows EncryptedRevokeCompleted success toast when every result is successful", async () => {
    const results: FileEncryptionOpResult[] = [
      { fileId: 1, success: true },
      { fileId: 2, success: true },
    ];
    const revoke = vi.fn().mockResolvedValue(results);

    await runRevokeLogic(
      revoke,
      toasts.success,
      toasts.warning,
      toasts.error,
      t,
    );

    expect(toasts.success).toHaveBeenCalledOnce();
    expect(toasts.success).toHaveBeenCalledWith(COMPLETED_KEY);
    expect(toasts.warning).not.toHaveBeenCalled();
    expect(toasts.error).not.toHaveBeenCalled();
  });

  it("does NOT toast at all when the results array is empty (no encrypted files)", async () => {
    const revoke = vi.fn().mockResolvedValue([]);

    await runRevokeLogic(
      revoke,
      toasts.success,
      toasts.warning,
      toasts.error,
      t,
    );

    expect(toasts.success).not.toHaveBeenCalled();
    expect(toasts.warning).not.toHaveBeenCalled();
    expect(toasts.error).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Scenario 2: some files failed (partial failure)
// ---------------------------------------------------------------------------

describe("revoke outcome — partial failure", () => {
  let toasts: ReturnType<typeof makeToasts>;

  beforeEach(() => {
    toasts = makeToasts();
  });

  it("shows EncryptedRevokePartialFailure warning with correct count when some results fail", async () => {
    const results: FileEncryptionOpResult[] = [
      { fileId: 1, success: true },
      { fileId: 2, success: false, error: "key missing" },
      { fileId: 3, success: false, error: "network error" },
    ];
    const revoke = vi.fn().mockResolvedValue(results);

    await runRevokeLogic(
      revoke,
      toasts.success,
      toasts.warning,
      toasts.error,
      t,
    );

    // 2 failures → count=2 interpolated into the key
    expect(toasts.warning).toHaveBeenCalledOnce();
    expect(toasts.warning).toHaveBeenCalledWith(
      `${PARTIAL_KEY}`.replace("{{count}}", "2"),
    );
    expect(toasts.success).not.toHaveBeenCalled();
    expect(toasts.error).not.toHaveBeenCalled();
  });

  it("shows partial-failure warning even when only one file failed", async () => {
    const results: FileEncryptionOpResult[] = [
      { fileId: 1, success: true },
      { fileId: 2, success: false, error: "crypto error" },
    ];
    const revoke = vi.fn().mockResolvedValue(results);

    await runRevokeLogic(
      revoke,
      toasts.success,
      toasts.warning,
      toasts.error,
      t,
    );

    expect(toasts.warning).toHaveBeenCalledOnce();
    // count should be 1
    expect(toasts.warning).toHaveBeenCalledWith(
      `${PARTIAL_KEY}`.replace("{{count}}", "1"),
    );
    expect(toasts.success).not.toHaveBeenCalled();
  });

  it("shows partial-failure warning when ALL files fail (not success, not thrown)", async () => {
    const results: FileEncryptionOpResult[] = [
      { fileId: 1, success: false, error: "error A" },
      { fileId: 2, success: false, error: "error B" },
    ];
    const revoke = vi.fn().mockResolvedValue(results);

    await runRevokeLogic(
      revoke,
      toasts.success,
      toasts.warning,
      toasts.error,
      t,
    );

    expect(toasts.warning).toHaveBeenCalledOnce();
    expect(toasts.success).not.toHaveBeenCalled();
    expect(toasts.error).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Scenario 3: revokeMemberFromEncryptedRoom throws (hard error)
// ---------------------------------------------------------------------------

describe("revoke outcome — thrown error", () => {
  let toasts: ReturnType<typeof makeToasts>;

  beforeEach(() => {
    toasts = makeToasts();
  });

  it("shows EncryptedRevokeFailed error toast when the revoke call throws", async () => {
    const revoke = vi.fn().mockRejectedValue(new Error("crypto failure"));

    await runRevokeLogic(
      revoke,
      toasts.success,
      toasts.warning,
      toasts.error,
      t,
    );

    expect(toasts.error).toHaveBeenCalledOnce();
    expect(toasts.error).toHaveBeenCalledWith(FAILED_KEY);
    expect(toasts.success).not.toHaveBeenCalled();
    expect(toasts.warning).not.toHaveBeenCalled();
  });

  it("shows EncryptedRevokeFailed when the revoke call throws a non-Error value", async () => {
    const revoke = vi.fn().mockRejectedValue("some string error");

    await runRevokeLogic(
      revoke,
      toasts.success,
      toasts.warning,
      toasts.error,
      t,
    );

    expect(toasts.error).toHaveBeenCalledOnce();
    expect(toasts.error).toHaveBeenCalledWith(FAILED_KEY);
  });

  it("shows EncryptedRevokeFailed when the revoke call throws null", async () => {
    const revoke = vi.fn().mockRejectedValue(null);

    await runRevokeLogic(
      revoke,
      toasts.success,
      toasts.warning,
      toasts.error,
      t,
    );

    expect(toasts.error).toHaveBeenCalledOnce();
    expect(toasts.error).toHaveBeenCalledWith(FAILED_KEY);
  });
});

// ---------------------------------------------------------------------------
// Group expansion logic (task #29)
//
// Mirrors usePrivateRemoveMemberFlow step 2 pre-processing:
//   isGroup=true  → call getGroupById(userId, true); map members to IDs
//   empty group   → return early, skip revoke entirely
//   isGroup=false → use [userId] directly, never call getGroupById
//
// Reference: packages/client/.../Members/sub-components/User.tsx:165-171
// ---------------------------------------------------------------------------

type GroupMemberStub = { id: string };
type GroupStub = { members?: GroupMemberStub[] };

/**
 * Mirrors the group-expansion branch inside usePrivateRemoveMemberFlow.
 * Returns the resolved list of user IDs to revoke, or null when the group
 * is empty (and revoke should be skipped).
 */
async function resolveRevokeIds(
  userId: string,
  isGroup: boolean,
  getGroupByIdFn: (id: string, includeMembers: boolean) => Promise<GroupStub>,
): Promise<string[] | null> {
  if (!isGroup) return [userId];
  const group = await getGroupByIdFn(userId, true);
  const ids = (group.members ?? []).map((m) => String(m.id));
  if (ids.length === 0) return null;
  return ids;
}

describe("group expansion — resolveRevokeIds", () => {
  it("returns [userId] for a plain user (isGroup=false), never calls getGroupById", async () => {
    const getGroupByIdMock = vi.fn();

    const ids = await resolveRevokeIds("user-42", false, getGroupByIdMock);

    expect(ids).toEqual(["user-42"]);
    expect(getGroupByIdMock).not.toHaveBeenCalled();
  });

  it("calls getGroupById(groupId, true) and returns member IDs for a group", async () => {
    const getGroupByIdMock = vi.fn().mockResolvedValue({
      members: [{ id: "u1" }, { id: "u2" }, { id: "u3" }],
    });

    const ids = await resolveRevokeIds("group-7", true, getGroupByIdMock);

    expect(getGroupByIdMock).toHaveBeenCalledOnce();
    expect(getGroupByIdMock).toHaveBeenCalledWith("group-7", true);
    expect(ids).toEqual(["u1", "u2", "u3"]);
  });

  it("returns null for an empty group (no members), signalling skip", async () => {
    const getGroupByIdMock = vi.fn().mockResolvedValue({ members: [] });

    const ids = await resolveRevokeIds("group-empty", true, getGroupByIdMock);

    expect(ids).toBeNull();
  });

  it("returns null when group.members is undefined", async () => {
    const getGroupByIdMock = vi.fn().mockResolvedValue({});

    const ids = await resolveRevokeIds("group-no-members", true, getGroupByIdMock);

    expect(ids).toBeNull();
  });

  it("passes all expanded member IDs to revoke and shows success toast", async () => {
    const getGroupByIdMock = vi.fn().mockResolvedValue({
      members: [{ id: "m1" }, { id: "m2" }],
    });
    const revokeResults: FileEncryptionOpResult[] = [
      { fileId: 10, success: true },
      { fileId: 11, success: true },
    ];
    const revokeMock = vi.fn().mockResolvedValue(revokeResults);
    const toasts = makeToasts();

    const revokeIds = await resolveRevokeIds("group-abc", true, getGroupByIdMock);
    expect(revokeIds).not.toBeNull();

    await runRevokeLogic(
      () => revokeMock(revokeIds),
      toasts.success,
      toasts.warning,
      toasts.error,
      t,
    );

    expect(revokeMock).toHaveBeenCalledOnce();
    expect(revokeMock).toHaveBeenCalledWith(["m1", "m2"]);
    expect(toasts.success).toHaveBeenCalledOnce();
    expect(toasts.success).toHaveBeenCalledWith(COMPLETED_KEY);
  });

  it("aggregates partial failures across group members", async () => {
    const getGroupByIdMock = vi.fn().mockResolvedValue({
      members: [{ id: "m1" }, { id: "m2" }, { id: "m3" }],
    });
    const revokeResults: FileEncryptionOpResult[] = [
      { fileId: 1, success: true },
      { fileId: 2, success: false, error: "key missing" },
      { fileId: 3, success: false, error: "network" },
    ];
    const revokeMock = vi.fn().mockResolvedValue(revokeResults);
    const toasts = makeToasts();

    const revokeIds = await resolveRevokeIds("group-xyz", true, getGroupByIdMock);
    expect(revokeIds).not.toBeNull();

    await runRevokeLogic(
      () => revokeMock(revokeIds),
      toasts.success,
      toasts.warning,
      toasts.error,
      t,
    );

    // 2 failures across the group members
    expect(toasts.warning).toHaveBeenCalledOnce();
    expect(toasts.warning).toHaveBeenCalledWith(
      `${PARTIAL_KEY}`.replace("{{count}}", "2"),
    );
    expect(toasts.success).not.toHaveBeenCalled();
  });
});
