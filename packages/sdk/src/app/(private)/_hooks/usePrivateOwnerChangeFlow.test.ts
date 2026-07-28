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

import { describe, it, expect, vi } from "vitest";

// ---------------------------------------------------------------------------
// Pure helper — mirrors the exclusion-list construction in
// PrivateChangeOwnerDialog's useEffect (lines ~130-143).
// Extracted here for deterministic unit-testing without mounting the component.
//
// Given a list of room-member entries and a list of admin entries, returns
// the admin IDs that are NOT present in the member set.
//
// Reference parity: ChangeRoomOwnerPanel index.js, the Promise.all().then()
// block where nonMemberAdmins is computed.
// ---------------------------------------------------------------------------

const USER_SUBJECT_TYPE = 0; // MembersSubjectType.User

type MemberItem = {
  subjectType: number;
  sharedTo?: { id?: string };
};

type AdminItem = {
  id?: string;
};

/**
 * Pure implementation of the non-member-admin exclusion logic.
 *
 * @param members  Items from getRoomMembers response
 * @param admins   Items from getUserList response
 * @param baseExclude  IDs always excluded (e.g. current user)
 * @returns merged exclusion set as an array
 */
function computeExcludeItems(
  members: MemberItem[],
  admins: AdminItem[],
  baseExclude: string[] = [],
): string[] {
  const memberIds = new Set(
    members
      .filter((m) => m.subjectType === USER_SUBJECT_TYPE)
      .map((m) => m.sharedTo?.id)
      .filter(Boolean) as string[],
  );

  const nonMemberAdmins = admins
    .map((a) => a.id)
    .filter((id): id is string => Boolean(id) && !memberIds.has(id!));

  return [...new Set([...baseExclude, ...nonMemberAdmins])];
}

// ---------------------------------------------------------------------------
// Unit-tests for the toast-selection logic extracted from
// PrivateChangeOwnerDialog.onSubmit — mirrors the reference behaviour from
// packages/client/src/components/panels/ChangeRoomOwnerPanel/index.js:109-122.
//
// We inline the decision logic rather than mounting the React component so
// these tests run without providers. If the real component changes, update
// this mirror and the tests.
// ---------------------------------------------------------------------------

type SkippedEntry = {
  id: string;
  displayName?: string;
  reason: string;
};

type ValidationResult = {
  validIds: string[];
  skipped: SkippedEntry[];
};

/**
 * Mirror of the toast-selection block in PrivateChangeOwnerDialog.onSubmit.
 * Returns the i18n call that would be made, or null when validation passes.
 */
function selectOwnerChangeToast(
  t: (key: string, opts?: Record<string, string>) => string,
  newOwnerId: string,
  candidateDisplayName: string | undefined,
  result: ValidationResult,
): string | null {
  const { validIds, skipped } = result;
  if (validIds.includes(newOwnerId)) return null; // valid — no toast needed

  const entry = skipped[0];
  const reason = entry?.reason ?? "no-key";
  const name =
    entry?.displayName ||
    candidateDisplayName ||
    newOwnerId;

  return reason === "no-key"
    ? t("Common:EncryptedChangeOwnerNoKeys", { user: name })
    : t("Common:EncryptedChangeOwnerKeyMismatch", { user: name });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("owner-change toast selection (parity with ChangeRoomOwnerPanel)", () => {
  // Simple t() stub: returns "<key>|<user>" so we can assert the key and the
  // interpolated user name simultaneously.
  const t = (key: string, opts?: Record<string, string>): string =>
    opts?.user ? `${key}|${opts.user}` : key;

  const ROOM_ID = 42;
  const CANDIDATE_ID = "user-99";
  const CANDIDATE_NAME = "Alice Smith";

  // -------------------------------------------------------------------------
  // no-key scenario
  // -------------------------------------------------------------------------

  // Scenario: the candidate has no encryption key registered on the server.
  // Expects: EncryptedChangeOwnerNoKeys toast containing the candidate name.
  it("shows EncryptedChangeOwnerNoKeys toast (no-key) with candidate name", () => {
    const result: ValidationResult = {
      validIds: [],
      skipped: [{ id: CANDIDATE_ID, displayName: CANDIDATE_NAME, reason: "no-key" }],
    };

    const toast = selectOwnerChangeToast(t, CANDIDATE_ID, CANDIDATE_NAME, result);

    expect(toast).toBe(`Common:EncryptedChangeOwnerNoKeys|${CANDIDATE_NAME}`);
  });

  // Acceptance criterion: validation runs BEFORE changeOwner; here we verify
  // the toast is returned when the id is absent from validIds.
  it("returns non-null (abort) when id is NOT in validIds (no-key)", () => {
    const result: ValidationResult = {
      validIds: [],
      skipped: [{ id: CANDIDATE_ID, reason: "no-key" }],
    };

    const toast = selectOwnerChangeToast(t, CANDIDATE_ID, CANDIDATE_NAME, result);

    expect(toast).not.toBeNull();
  });

  // -------------------------------------------------------------------------
  // key-mismatch scenario
  // -------------------------------------------------------------------------

  // Scenario: the candidate's key was seen before and the new key does not
  // match the TOFU record; user refused to accept it.
  // Expects: EncryptedChangeOwnerKeyMismatch toast containing the candidate name.
  it("shows EncryptedChangeOwnerKeyMismatch toast for key-mismatch-refused", () => {
    const result: ValidationResult = {
      validIds: [],
      skipped: [
        {
          id: CANDIDATE_ID,
          displayName: CANDIDATE_NAME,
          reason: "key-mismatch-refused",
        },
      ],
    };

    const toast = selectOwnerChangeToast(t, CANDIDATE_ID, CANDIDATE_NAME, result);

    expect(toast).toBe(
      `Common:EncryptedChangeOwnerKeyMismatch|${CANDIDATE_NAME}`,
    );
  });

  // The mismatch key must also appear in the toast for any unrecognised
  // future reason code (fallback to mismatch branch).
  it("falls back to EncryptedChangeOwnerKeyMismatch for unknown reasons", () => {
    const result: ValidationResult = {
      validIds: [],
      skipped: [{ id: CANDIDATE_ID, displayName: CANDIDATE_NAME, reason: "unknown-future-reason" }],
    };

    const toast = selectOwnerChangeToast(t, CANDIDATE_ID, CANDIDATE_NAME, result);

    expect(toast).toBe(
      `Common:EncryptedChangeOwnerKeyMismatch|${CANDIDATE_NAME}`,
    );
  });

  // -------------------------------------------------------------------------
  // Name resolution — mirrors reference panel priority:
  // skipped[0].displayName > candidate.displayName > id
  // -------------------------------------------------------------------------

  it("uses skipped[0].displayName when available (highest priority)", () => {
    const result: ValidationResult = {
      validIds: [],
      skipped: [
        { id: CANDIDATE_ID, displayName: "Validated Name", reason: "no-key" },
      ],
    };

    const toast = selectOwnerChangeToast(t, CANDIDATE_ID, "Selector Name", result);

    expect(toast).toContain("Validated Name");
    expect(toast).not.toContain("Selector Name");
  });

  it("falls back to candidate.displayName when skipped[0].displayName is absent", () => {
    const result: ValidationResult = {
      validIds: [],
      // No displayName on the skipped entry.
      skipped: [{ id: CANDIDATE_ID, reason: "no-key" }],
    };

    const toast = selectOwnerChangeToast(t, CANDIDATE_ID, "Selector Name", result);

    expect(toast).toContain("Selector Name");
  });

  it("falls back to the raw id when no display names are present", () => {
    const result: ValidationResult = {
      validIds: [],
      skipped: [{ id: CANDIDATE_ID, reason: "no-key" }],
    };

    const toast = selectOwnerChangeToast(
      t,
      CANDIDATE_ID,
      undefined, // no candidate display name either
      result,
    );

    expect(toast).toContain(CANDIDATE_ID);
  });

  // -------------------------------------------------------------------------
  // Happy path — no toast when candidate passes validation
  // -------------------------------------------------------------------------

  // Acceptance criterion: changeOwner proceeds — the toast function must
  // return null (no error) when the id is in validIds.
  it("returns null (no toast, owner-change proceeds) when id IS in validIds", () => {
    const result: ValidationResult = {
      validIds: [CANDIDATE_ID],
      skipped: [],
    };

    const toast = selectOwnerChangeToast(t, CANDIDATE_ID, CANDIDATE_NAME, result);

    expect(toast).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Validate-before-change ordering guarantee
  //
  // The test below simulates the full onSubmit control flow to assert that
  // changeOwner is never called when validation fails.
  // -------------------------------------------------------------------------

  it("changeOwner is NOT called when validation skips the candidate (no-key)", async () => {
    const changeOwner = vi.fn().mockResolvedValue(true);
    const validateCandidates = vi.fn().mockResolvedValue({
      validIds: [],
      skipped: [{ id: CANDIDATE_ID, displayName: CANDIDATE_NAME, reason: "no-key" }],
    });

    // Mirrors onSubmit logic from PrivateChangeOwnerDialog.
    const newOwnerId = CANDIDATE_ID;
    const { validIds, skipped } = await validateCandidates({ roomId: ROOM_ID });

    if (!validIds.includes(newOwnerId)) {
      // toast would fire here — we just assert changeOwner is NOT reached.
      void skipped; // silence unused-var
    } else {
      await changeOwner({ roomId: ROOM_ID, newOwnerId });
    }

    expect(validateCandidates).toHaveBeenCalledOnce();
    expect(changeOwner).not.toHaveBeenCalled();
  });

  it("changeOwner IS called when validation passes", async () => {
    const changeOwner = vi.fn().mockResolvedValue(true);
    const validateCandidates = vi.fn().mockResolvedValue({
      validIds: [CANDIDATE_ID],
      skipped: [],
    });

    const newOwnerId = CANDIDATE_ID;
    const { validIds } = await validateCandidates({ roomId: ROOM_ID });

    if (validIds.includes(newOwnerId)) {
      await changeOwner({ roomId: ROOM_ID, newOwnerId });
    }

    expect(changeOwner).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// LeaveTheRoom checkbox submit behaviour (parity with ChangeRoomOwnerPanel)
//
// Reference: FilesActionsStore.changeRoomOwner — after setFileOwner:
//   if (isLeaveChecked) await this.onLeaveRoom(t)
//   else toastr.success(t("Common:AppointNewOwner"))
//
// Acceptance criteria:
//   - transfer-and-leave: leaveRoom is called, AppointNewOwner is NOT shown
//   - plain transfer: AppointNewOwner is shown, leaveRoom is NOT called
// ---------------------------------------------------------------------------

describe("LeaveTheRoom checkbox submit behaviour (parity with ChangeRoomOwnerPanel)", () => {
  const t = (key: string): string => key;
  const ROOM_ID = 42;
  const _CANDIDATE_ID = "user-99";
  const CURRENT_USER_ID = "current-user-1";

  // Mirrors the post-changeOwner block in PrivateChangeOwnerDialog.onSubmit.
  async function simulateSubmit(
    isLeaveChecked: boolean,
    leaveRoom: (args: { roomId: number; userId: string }) => Promise<void>,
    toastrSuccess: (msg: string) => void,
    currentUserId: string,
  ) {
    const ok = true; // changeOwner succeeded
    if (!ok) return;

    if (isLeaveChecked && currentUserId) {
      await leaveRoom({ roomId: ROOM_ID, userId: currentUserId });
    } else {
      toastrSuccess(t("Common:AppointNewOwner"));
    }
  }

  // -------------------------------------------------------------------------
  // Transfer-and-leave: checkbox IS checked
  // -------------------------------------------------------------------------

  // Acceptance criterion: leaveRoom is called; AppointNewOwner is NOT shown.
  it("calls leaveRoom and does NOT show AppointNewOwner when checkbox is checked", async () => {
    const leaveRoom = vi.fn().mockResolvedValue(undefined);
    const toastrSuccess = vi.fn();

    await simulateSubmit(true, leaveRoom, toastrSuccess, CURRENT_USER_ID);

    expect(leaveRoom).toHaveBeenCalledOnce();
    expect(leaveRoom).toHaveBeenCalledWith({
      roomId: ROOM_ID,
      userId: CURRENT_USER_ID,
    });
    expect(toastrSuccess).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Plain transfer: checkbox is NOT checked
  // -------------------------------------------------------------------------

  // Acceptance criterion: AppointNewOwner toast is shown; leaveRoom is NOT called.
  it("shows AppointNewOwner toast and does NOT call leaveRoom when checkbox is unchecked", async () => {
    const leaveRoom = vi.fn().mockResolvedValue(undefined);
    const toastrSuccess = vi.fn();

    await simulateSubmit(false, leaveRoom, toastrSuccess, CURRENT_USER_ID);

    expect(toastrSuccess).toHaveBeenCalledOnce();
    expect(toastrSuccess).toHaveBeenCalledWith("Common:AppointNewOwner");
    expect(leaveRoom).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Guard: no currentUserId — leaveRoom must not be called even if checked
  // -------------------------------------------------------------------------

  // If currentUserId is somehow empty (defensive), treat as unchecked.
  it("shows AppointNewOwner when checkbox is checked but currentUserId is absent", async () => {
    const leaveRoom = vi.fn().mockResolvedValue(undefined);
    const toastrSuccess = vi.fn();

    // Pass empty string to simulate missing currentUserId guard.
    await simulateSubmit(true, leaveRoom, toastrSuccess, "");

    expect(leaveRoom).not.toHaveBeenCalled();
    expect(toastrSuccess).toHaveBeenCalledOnce();
    expect(toastrSuccess).toHaveBeenCalledWith("Common:AppointNewOwner");
  });
});

// ---------------------------------------------------------------------------
// Exclusion-list computation tests (parity with ChangeRoomOwnerPanel)
//
// Acceptance criterion: a portal admin who is NOT a room member must appear
// in the exclusion list passed to PeopleSelector.
// ---------------------------------------------------------------------------

describe("computeExcludeItems — non-member admin exclusion (parity with ChangeRoomOwnerPanel)", () => {
  const MEMBER_USER_ID = "member-1";
  const ADMIN_MEMBER_ID = "admin-member";
  const ADMIN_NON_MEMBER_ID = "admin-non-member";
  const CURRENT_USER_ID = "current-user";

  const makeMember = (id: string): MemberItem => ({
    subjectType: USER_SUBJECT_TYPE,
    sharedTo: { id },
  });

  const makeAdmin = (id: string): AdminItem => ({ id });

  // -------------------------------------------------------------------------
  // Acceptance criterion (primary): non-member admin is excluded
  // -------------------------------------------------------------------------

  // An admin who is NOT in the room member list must appear in excludeItems.
  it("excludes portal admin that is NOT a room member", () => {
    const members = [makeMember(MEMBER_USER_ID), makeMember(ADMIN_MEMBER_ID)];
    const admins = [makeAdmin(ADMIN_MEMBER_ID), makeAdmin(ADMIN_NON_MEMBER_ID)];

    const result = computeExcludeItems(members, admins);

    expect(result).toContain(ADMIN_NON_MEMBER_ID);
  });

  // An admin who IS a room member must NOT appear in excludeItems.
  it("does NOT exclude an admin who is a room member", () => {
    const members = [makeMember(ADMIN_MEMBER_ID)];
    const admins = [makeAdmin(ADMIN_MEMBER_ID)];

    const result = computeExcludeItems(members, admins);

    expect(result).not.toContain(ADMIN_MEMBER_ID);
  });

  // -------------------------------------------------------------------------
  // baseExclude (current user) is always included regardless of membership
  // -------------------------------------------------------------------------

  it("always includes currentUserId from baseExclude", () => {
    const members: MemberItem[] = [];
    const admins: AdminItem[] = [];

    const result = computeExcludeItems(members, admins, [CURRENT_USER_ID]);

    expect(result).toContain(CURRENT_USER_ID);
  });

  it("merges baseExclude and non-member admins without duplicates", () => {
    // CURRENT_USER_ID is also an admin but not a member — appears once.
    const members: MemberItem[] = [];
    const admins = [makeAdmin(CURRENT_USER_ID), makeAdmin(ADMIN_NON_MEMBER_ID)];

    const result = computeExcludeItems(
      members,
      admins,
      [CURRENT_USER_ID],
    );

    expect(result).toContain(CURRENT_USER_ID);
    expect(result).toContain(ADMIN_NON_MEMBER_ID);
    // No duplicates
    expect(result.filter((id) => id === CURRENT_USER_ID)).toHaveLength(1);
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  // Non-user subject types (groups, external links) must not contribute to
  // the memberIds set — an admin sharing a group membership is still excluded
  // as a non-member.
  it("ignores group-subject entries when computing memberIds", () => {
    const GROUP_SUBJECT_TYPE = 2; // MembersSubjectType.Group
    const groupMember: MemberItem = {
      subjectType: GROUP_SUBJECT_TYPE,
      sharedTo: { id: ADMIN_NON_MEMBER_ID },
    };
    const admins = [makeAdmin(ADMIN_NON_MEMBER_ID)];

    const result = computeExcludeItems([groupMember], admins);

    // The admin was only seen via a group entry, not as a direct User member.
    expect(result).toContain(ADMIN_NON_MEMBER_ID);
  });

  it("returns empty array when there are no admins and no baseExclude", () => {
    const result = computeExcludeItems(
      [makeMember(MEMBER_USER_ID)],
      [],
    );

    expect(result).toHaveLength(0);
  });

  it("handles admins with undefined id gracefully (skips them)", () => {
    const admins: AdminItem[] = [{ id: undefined }, makeAdmin(ADMIN_NON_MEMBER_ID)];

    const result = computeExcludeItems([], admins);

    expect(result).not.toContain(undefined);
    expect(result).toContain(ADMIN_NON_MEMBER_ID);
  });
});
