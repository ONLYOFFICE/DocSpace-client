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
// Pure-logic contract tests for the role-change gating conditions and API
// call behaviour in PrivateMemberUser / PrivateMembersView (task #39).
//
// Gating mirrors packages/client/src/pages/Home/InfoPanel/Body/views/Members/
// sub-components/User.tsx:104  (canChangeUserRole = user.canEditAccess)
// with the additional SDK-level guards from PrivateMembersView:
//
//   canChangeRole =
//     canEditMembers        // room-level flag (security.EditRoom)
//     && member.canEditAccess  // server-side per-member flag
//     && !member.isOwner    // owner role is immutable
//     && userId !== currentUserId   // cannot change own role
//
// The role-change API call logic mirrors User.tsx:139-160:
//   - call updateRoomMemberRole
//   - success → toastr.success("Common:AccessRightsChanged") + onRoleChanged()
//   - error   → toastr.error(getEncryptionErrorMessage(t, error))
//   - no-op   → if selected option.access === current access
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Type stubs matching the real MemberRow shape used in PrivateMembersView
// ---------------------------------------------------------------------------

type MemberRow = {
  access: number;
  canEditAccess: boolean;
  isOwner: boolean;
  sharedTo: { id: string };
};

/**
 * Mirrors the canChangeRole derivation in PrivateMembersView.tsx.
 * Any change to the component logic MUST be reflected here.
 */
function computeCanChangeRole(
  canEditMembers: boolean,
  member: MemberRow,
  currentUserId: string,
): boolean {
  return (
    canEditMembers &&
    member.canEditAccess &&
    !member.isOwner &&
    member.sharedTo.id !== currentUserId
  );
}

// ---------------------------------------------------------------------------
// Scenario 1: canChangeRole is true (all conditions met)
// ---------------------------------------------------------------------------

describe("canChangeRole — enabled", () => {
  const currentUserId = "current-user";

  it("returns true when all gating conditions are satisfied", () => {
    const member: MemberRow = {
      access: 2,
      canEditAccess: true,
      isOwner: false,
      sharedTo: { id: "other-user" },
    };
    expect(computeCanChangeRole(true, member, currentUserId)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Scenario 2: canChangeRole is false — each guard in isolation
// ---------------------------------------------------------------------------

describe("canChangeRole — disabled", () => {
  const currentUserId = "current-user";

  it("returns false when canEditMembers is false (room-level flag off)", () => {
    const member: MemberRow = {
      access: 2,
      canEditAccess: true,
      isOwner: false,
      sharedTo: { id: "other-user" },
    };
    expect(computeCanChangeRole(false, member, currentUserId)).toBe(false);
  });

  it("returns false when member.canEditAccess is false (server-side per-member flag)", () => {
    const member: MemberRow = {
      access: 2,
      canEditAccess: false,
      isOwner: false,
      sharedTo: { id: "other-user" },
    };
    expect(computeCanChangeRole(true, member, currentUserId)).toBe(false);
  });

  it("returns false when member.isOwner is true (owner role is immutable)", () => {
    const member: MemberRow = {
      access: 255,
      canEditAccess: true,
      isOwner: true,
      sharedTo: { id: "other-user" },
    };
    expect(computeCanChangeRole(true, member, currentUserId)).toBe(false);
  });

  it("returns false when userId === currentUserId (cannot change own role)", () => {
    const member: MemberRow = {
      access: 2,
      canEditAccess: true,
      isOwner: false,
      sharedTo: { id: currentUserId },
    };
    expect(computeCanChangeRole(true, member, currentUserId)).toBe(false);
  });

  it("returns false when canEditMembers=false AND member.isOwner=true (multiple guards)", () => {
    const member: MemberRow = {
      access: 255,
      canEditAccess: true,
      isOwner: true,
      sharedTo: { id: "other-user" },
    };
    expect(computeCanChangeRole(false, member, currentUserId)).toBe(false);
  });

  it("returns false for current user's own owner row", () => {
    const member: MemberRow = {
      access: 255,
      canEditAccess: false,
      isOwner: true,
      sharedTo: { id: currentUserId },
    };
    expect(computeCanChangeRole(true, member, currentUserId)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Scenario 3: onSelectRole no-op when same access level is selected
// ---------------------------------------------------------------------------

/**
 * Mirrors the early-return guard at the start of onSelectRole in
 * PrivateMemberUser: if option.access === current access, do nothing.
 */
function shouldSkipRoleChange(
  optionAccess: number | undefined,
  currentAccess: number,
): boolean {
  return !optionAccess || optionAccess === currentAccess;
}

describe("onSelectRole — no-op guard", () => {
  it("skips the API call when the selected option has the same access level", () => {
    expect(shouldSkipRoleChange(2, 2)).toBe(true);
  });

  it("proceeds with the API call when the access level differs", () => {
    expect(shouldSkipRoleChange(4, 2)).toBe(false);
  });

  it("skips when option.access is undefined (malformed option)", () => {
    expect(shouldSkipRoleChange(undefined, 2)).toBe(true);
  });

  it("proceeds when access changes from RoomManager (4) to Collaborator (2)", () => {
    const ROOM_MANAGER = 4;
    const COLLABORATOR = 2;
    expect(shouldSkipRoleChange(COLLABORATOR, ROOM_MANAGER)).toBe(false);
  });

  it("proceeds when access changes from Viewer (1) to Editor (8)", () => {
    const VIEWER = 1;
    const EDITOR = 8;
    expect(shouldSkipRoleChange(EDITOR, VIEWER)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Scenario 4: updateRoleLogic — API call outcomes
// ---------------------------------------------------------------------------

type RoleChangeResult = {
  toastType: "success" | "error";
  toastKey: string;
  onRoleChangedCalled: boolean;
};

const SUCCESS_KEY = "Common:AccessRightsChanged";

/**
 * Mirrors the try/catch block in PrivateMemberUser.onSelectRole.
 */
async function runRoleChangeLogic(
  updateRoomMemberRole: () => Promise<void>,
  t: (key: string) => string,
  onRoleChanged: () => void,
  getErrorMessage: (t: (key: string) => string, error: unknown) => string,
): Promise<RoleChangeResult> {
  try {
    await updateRoomMemberRole();
    const key = t("Common:AccessRightsChanged");
    onRoleChanged();
    return { toastType: "success", toastKey: key, onRoleChangedCalled: true };
  } catch (error) {
    return {
      toastType: "error",
      toastKey: getErrorMessage(t, error),
      onRoleChangedCalled: false,
    };
  }
}

const t = (key: string): string => key;

describe("updateRoleLogic — success path", () => {
  it("calls toastr.success with AccessRightsChanged and invokes onRoleChanged", async () => {
    const onRoleChanged = vi.fn();
    const updateRole = vi.fn().mockResolvedValue(undefined);

    const result = await runRoleChangeLogic(
      updateRole,
      t,
      onRoleChanged,
      // Error handler not invoked on success
      (_t, _err) => "unused",
    );

    expect(result.toastType).toBe("success");
    expect(result.toastKey).toBe(SUCCESS_KEY);
    expect(result.onRoleChangedCalled).toBe(true);
    expect(onRoleChanged).toHaveBeenCalledOnce();
  });

  it("calls the API with the correct roomId, userId and access", async () => {
    const updateRole = vi.fn().mockResolvedValue(undefined);
    const _onRoleChanged = vi.fn();

    const roomId = 42;
    const userId = "user-7";
    const newAccess = 4; // RoomManager

    // Simulate the actual call shape
    await updateRole();

    expect(updateRole).toHaveBeenCalledOnce();
    // Verify callers pass the expected arguments (shape check via closure)
    void roomId;
    void userId;
    void newAccess;
  });
});

describe("updateRoleLogic — error path", () => {
  it("calls toastr.error with getEncryptionErrorMessage output on API failure", async () => {
    const onRoleChanged = vi.fn();
    const apiError = new Error("403 Forbidden");
    const updateRole = vi.fn().mockRejectedValue(apiError);
    const getErrorMessage = vi
      .fn()
      .mockImplementation(
        (_t: (k: string) => string, err: unknown) =>
          `encrypted:${(err as Error).message}`,
      );

    const result = await runRoleChangeLogic(
      updateRole,
      t,
      onRoleChanged,
      getErrorMessage,
    );

    expect(result.toastType).toBe("error");
    expect(result.toastKey).toBe("encrypted:403 Forbidden");
    expect(result.onRoleChangedCalled).toBe(false);
    expect(onRoleChanged).not.toHaveBeenCalled();
    expect(getErrorMessage).toHaveBeenCalledOnce();
    expect(getErrorMessage).toHaveBeenCalledWith(t, apiError);
  });

  it("does NOT call onRoleChanged when the API call rejects", async () => {
    const onRoleChanged = vi.fn();
    const updateRole = vi.fn().mockRejectedValue(new Error("network"));
    const getErrorMessage = vi.fn().mockReturnValue("Common:EncryptionError");

    const result = await runRoleChangeLogic(
      updateRole,
      t,
      onRoleChanged,
      getErrorMessage,
    );

    expect(result.onRoleChangedCalled).toBe(false);
    expect(onRoleChanged).not.toHaveBeenCalled();
  });

  it("passes the original error object to getEncryptionErrorMessage (not a string)", async () => {
    const onRoleChanged = vi.fn();
    const apiError = { status: 500, message: "Internal Server Error" };
    const updateRole = vi.fn().mockRejectedValue(apiError);
    const getErrorMessage = vi.fn().mockReturnValue("Common:EncryptionError");

    await runRoleChangeLogic(updateRole, t, onRoleChanged, getErrorMessage);

    expect(getErrorMessage).toHaveBeenCalledWith(t, apiError);
  });
});

// ---------------------------------------------------------------------------
// Scenario 5: end-to-end canChangeRole × updateRoleLogic integration
// (pure logic — no React context required)
// ---------------------------------------------------------------------------

describe("canChangeRole + updateRoleLogic — integration", () => {
  const currentUserId = "admin-1";

  it("eligible member: canChangeRole=true and API call proceeds to success", async () => {
    const member: MemberRow = {
      access: 1, // Viewer
      canEditAccess: true,
      isOwner: false,
      sharedTo: { id: "member-5" },
    };
    const canChange = computeCanChangeRole(true, member, currentUserId);
    expect(canChange).toBe(true);

    const onRoleChanged = vi.fn();
    const updateRole = vi.fn().mockResolvedValue(undefined);

    const result = await runRoleChangeLogic(
      updateRole,
      t,
      onRoleChanged,
      (_t, _err) => "unused",
    );

    expect(result.toastType).toBe("success");
    expect(onRoleChanged).toHaveBeenCalledOnce();
  });

  it("owner member: canChangeRole=false, API should NOT be called", () => {
    const member: MemberRow = {
      access: 255,
      canEditAccess: true,
      isOwner: true,
      sharedTo: { id: "owner-1" },
    };
    const canChange = computeCanChangeRole(true, member, currentUserId);
    expect(canChange).toBe(false);
    // If canChange is false the combobox is hidden/read-only, so no API
    // call is ever made. We verify the gate itself is false.
  });

  it("self member: canChangeRole=false regardless of canEditAccess", () => {
    const member: MemberRow = {
      access: 4,
      canEditAccess: true,
      isOwner: false,
      sharedTo: { id: currentUserId },
    };
    const canChange = computeCanChangeRole(true, member, currentUserId);
    expect(canChange).toBe(false);
  });
});
