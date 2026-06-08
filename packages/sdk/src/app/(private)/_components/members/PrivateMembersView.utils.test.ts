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

import { describe, it, expect } from "vitest";

import {
  EmployeeActivationStatus,
  ShareAccessRights,
} from "@docspace/shared/enums";
import type { RoomMember } from "@docspace/shared/api/rooms/types";

import {
  classifyMembers,
  type MemberSectionKey,
} from "./PrivateMembersView.utils";

const mk = (
  access: number,
  sharedTo: Record<string, unknown>,
  isOwner = false,
): RoomMember =>
  ({
    access,
    canEditAccess: true,
    isLocked: false,
    isOwner,
    subjectType: 0,
    sharedTo,
  }) as unknown as RoomMember;

const sectionFor = (
  sections: ReturnType<typeof classifyMembers>,
  key: MemberSectionKey,
): RoomMember[] => sections.find((s) => s.key === key)?.members ?? [];

describe("classifyMembers (private room — users only, no groups/guests)", () => {
  it("always returns the three sections in fixed order", () => {
    const sections = classifyMembers([]);
    expect(sections.map((s) => s.key)).toEqual([
      "administrators",
      "users",
      "expected",
    ]);
    expect(sections.every((s) => s.members.length === 0)).toBe(true);
  });

  it("buckets FullAccess and RoomManager as administrators", () => {
    const a = mk(ShareAccessRights.FullAccess, { id: "a", displayName: "A" });
    const b = mk(ShareAccessRights.RoomManager, { id: "b", displayName: "B" });
    const sections = classifyMembers([a, b]);
    expect(sectionFor(sections, "administrators")).toEqual([a, b]);
    expect(sectionFor(sections, "users")).toEqual([]);
  });

  it("buckets a non-admin member as a user", () => {
    const u = mk(ShareAccessRights.None, { id: "u", displayName: "U" });
    const sections = classifyMembers([u]);
    expect(sectionFor(sections, "users")).toEqual([u]);
    expect(sectionFor(sections, "administrators")).toEqual([]);
  });

  it("buckets a pending member as expected regardless of access level", () => {
    const p = mk(ShareAccessRights.FullAccess, {
      id: "p",
      displayName: "P",
      activationStatus: EmployeeActivationStatus.Pending,
    });
    const sections = classifyMembers([p]);
    expect(sectionFor(sections, "expected")).toEqual([p]);
    expect(sectionFor(sections, "administrators")).toEqual([]);
  });

  it("never drops a member — anything not admin/pending falls into users", () => {
    const stray = mk(ShareAccessRights.None, {
      id: "g",
      displayName: "G",
      isGroup: true,
    });
    const sections = classifyMembers([stray]);
    expect(sections.flatMap((s) => s.members)).toContain(stray);
  });
});
