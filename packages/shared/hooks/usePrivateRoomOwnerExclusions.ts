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

import { useEffect, useMemo, useState } from "react";

import Filter from "../api/people/filter";
import { getUserList } from "../api/people";
import { getRoomMembers } from "../api/rooms";
import {
  EmployeeStatus,
  EmployeeType,
  MembersSubjectType,
} from "../enums";

/**
 * The people an owner change of a private room leaves out of the owner
 * picker: the current user and the administrators who are not room members.
 * The room's first 100 members and administrators are read; when they cannot
 * be read, only the current user is left out.
 */
export function usePrivateRoomOwnerExclusions({
  isPrivateRoom,
  roomId,
  userId,
}: {
  isPrivateRoom: boolean;
  roomId?: number | string;
  userId?: string;
}) {
  const baseExclude = useMemo(
    () => (isPrivateRoom && userId ? [userId] : []),
    [isPrivateRoom, userId],
  );

  const [excludeItems, setExcludeItems] = useState<string[]>(baseExclude);
  const [excludeReady, setExcludeReady] = useState(!isPrivateRoom);

  useEffect(() => {
    setExcludeItems(baseExclude);
    setExcludeReady(!isPrivateRoom);

    if (!isPrivateRoom || !roomId) return undefined;

    const controller = new AbortController();
    let cancelled = false;

    const adminsFilter = Filter.getDefault();
    adminsFilter.role = [EmployeeType.Admin, EmployeeType.RoomAdmin];
    adminsFilter.employeeStatus = EmployeeStatus.Active;
    adminsFilter.pageCount = 100;

    Promise.all([
      getRoomMembers(roomId, { count: 100 }, controller.signal),
      getUserList(adminsFilter, controller.signal),
    ])
      .then(([members, admins]) => {
        if (cancelled) return;
        const memberIds = new Set(
          (members?.items ?? [])
            .filter((m) => m?.subjectType === MembersSubjectType.User)
            .map((m) => m?.sharedTo?.id)
            .filter(Boolean),
        );
        const nonMemberAdmins = (admins?.items ?? [])
          .map((a) => a.id)
          .filter((id) => id && !memberIds.has(id));
        const merged = new Set([...baseExclude, ...nonMemberAdmins]);
        setExcludeItems(Array.from(merged));
        setExcludeReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setExcludeReady(true);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isPrivateRoom, roomId, baseExclude]);

  return { excludeItems, excludeReady };
}
