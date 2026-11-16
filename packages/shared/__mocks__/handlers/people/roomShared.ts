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

import { http } from "msw";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";
import { regularUser } from "./self";

export type RoomSharedUser = {
  id: string;
  displayName: string;
  email: string;
  /** Whether the account already has access to the room. */
  shared?: boolean;
};

/**
 * The profile EmployeeFullDtoHelper.GetShareCandidateAsync answers for
 * another account to a caller with access to the contacts, which is
 * GetFullAsync: the names, the states, the e-mail, the role flags and
 * `shared` of CreateWithTypeAsync; the user name, `isLDAP` and `isSSO`; the
 * id, the display name, the avatars and the profile link of
 * EmployeeDtoHelper; the phone activation status, the culture, the
 * department (empty for an account in no group) and the registration date.
 * `workFrom` is never filled, `theme` and `loginEventId` belong to the
 * caller's own profile (UserController.Self), and the quota fields are
 * filled for a DocSpace administrator only, so none of them is here.
 * @see server/common/ASC.Api.Core/Model/EmployeeFullDto.cs
 */
const shareCandidate = (user: RoomSharedUser) => ({
  firstName: user.displayName.split(" ")[0],
  lastName: user.displayName.split(" ").slice(1).join(" "),
  status: 1,
  activationStatus: 1,
  email: user.email,
  isVisitor: false,
  isAdmin: false,
  isRoomAdmin: false,
  isOwner: false,
  isCollaborator: true,
  shared: user.shared ?? false,
  userName: user.email.split("@")[0],
  isLDAP: false,
  isSSO: false,
  id: user.id,
  displayName: user.displayName,
  hasAvatar: regularUser.hasAvatar,
  isAnonim: false,
  avatar: regularUser.avatar,
  avatarOriginal: regularUser.avatarOriginal,
  avatarMax: regularUser.avatarMax,
  avatarMedium: regularUser.avatarMedium,
  avatarSmall: regularUser.avatarSmall,
  profileUrl: `${BASE_URL}/accounts/people/filter?search=${encodeURIComponent(user.email)}`,
  mobilePhoneActivationStatus: 0,
  cultureName: "en-GB",
  department: "",
  registrationDate: "2021-03-09T17:52:55.0000000+08:00",
});

/**
 * Mirrors UserController.GetUsersWithRoomShared (HttpGet "room/{id}"): the
 * accounts relevant to the room, each the profile of a share candidate
 * carrying `shared`, with `count` and `total` set from the paging. The mock
 * lists the given users and ignores the search filters; it has no caller,
 * so it answers as to one who has access to the contacts and is not a
 * DocSpace administrator.
 * @see server/products/ASC.People/Server/Api/UserController.cs
 */
export const usersWithRoomSharedHandler = (
  port: string,
  roomId: number | string,
  users: RoomSharedUser[],
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/people/room/${roomId}`,
    ({ request }) => {
      const query = new URL(request.url).searchParams;
      const startIndex = Number(query.get("startIndex") ?? 0);
      const count = Number(query.get("count") ?? users.length);
      const page = users.slice(startIndex, startIndex + count);
      return new Response(
        JSON.stringify({
          count: page.length,
          total: users.length,
          response: page.map(shareCandidate),
          status: 0,
          statusCode: 200,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    },
  );
