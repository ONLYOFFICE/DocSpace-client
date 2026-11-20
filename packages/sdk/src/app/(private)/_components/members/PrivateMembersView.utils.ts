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

import type { RoomMember } from "@docspace/shared/api/rooms/types";
import type { TUser } from "@docspace/shared/api/people/types";
import {
  EmployeeActivationStatus,
  EmployeeStatus,
  MembersSubjectType,
  ShareAccessRights,
} from "@docspace/shared/enums";

/** ShareFilterType.User: the server answers user records only. */
export const USERS_ONLY = 16;

export type MemberSectionKey = "administrators" | "users" | "expected";

export type ClassifiedMemberSection = {
  key: MemberSectionKey;
  members: RoomMember[];
};

/**
 * Whether the members view lists a member, in its sections and in a search:
 * not a group or a guest, and a disabled user only as the owner.
 */
// Spec: private-rooms/sdk-surface, "Members grouped without groups and guests"
export function isListedMember(member: RoomMember): boolean {
  const shared = member.sharedTo as TUser & { status?: EmployeeStatus };
  if (member.subjectType === MembersSubjectType.Group || shared.isVisitor) {
    return false;
  }
  return !(shared.status === EmployeeStatus.Disabled && !member.isOwner);
}

export function classifyMembers(
  members: RoomMember[],
): ClassifiedMemberSection[] {
  const administrators: RoomMember[] = [];
  const users: RoomMember[] = [];
  const expected: RoomMember[] = [];

  for (const member of members.filter(isListedMember)) {
    const shared = member.sharedTo as TUser & {
      activationStatus?: EmployeeActivationStatus;
    };

    if (shared.activationStatus === EmployeeActivationStatus.Pending) {
      expected.push(member);
    } else if (
      member.access === ShareAccessRights.FullAccess ||
      member.access === ShareAccessRights.RoomManager
    ) {
      administrators.push(member);
    } else {
      users.push(member);
    }
  }

  return [
    { key: "administrators", members: administrators },
    { key: "users", members: users },
    { key: "expected", members: expected },
  ];
}
