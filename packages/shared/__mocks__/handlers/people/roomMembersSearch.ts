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

import { http } from "msw";

import { BASE_URL, API_PREFIX } from "../../e2e/utils";

export type RoomMemberSearchEntry = {
  id: string;
  displayName: string;
  email: string;
  isAdmin?: boolean;
  isRoomAdmin?: boolean;
  isCollaborator?: boolean;
};

export type RoomMembersSearchOptions = {
  members: RoomMemberSearchEntry[];
};

const baseUserFields = {
  status: 1,
  activationStatus: 1,
  department: "",
  workFrom: "2021-03-09T17:52:55.0000000+08:00",
  isLDAP: false,
  cultureName: "en-GB",
  mobilePhoneActivationStatus: 0,
  isSSO: false,
  theme: "System",
  avatar: "/static/images/default_user_photo_size_82-82.png?hash=1780467874",
  avatarOriginal:
    "/static/images/default_user_photo_size_200-200.png?hash=1780467874",
  avatarMax:
    "/static/images/default_user_photo_size_200-200.png?hash=1780467874",
  avatarMedium:
    "/static/images/default_user_photo_size_48-48.png?hash=1780467874",
  avatarSmall:
    "/static/images/default_user_photo_size_32-32.png?hash=1780467874",
  hasAvatar: false,
  isAnonim: false,
  isVisitor: false,
  isOwner: false,
};

const okResponse = <T>(response: T): Response =>
  new Response(JSON.stringify({ response, status: 0, statusCode: 200 }), {
    headers: { "Content-Type": "application/json" },
  });

export const roomMembersSearchHandler = (
  port: string,
  roomId: number | string,
  opts: RoomMembersSearchOptions,
) => {
  const url = `${BASE_URL}:${port}/${API_PREFIX}/people/room/${roomId}`;

  return http.get(url, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const search = (params.get("search") ?? "").toLowerCase();
    const items = opts.members
      .filter((m) => {
        if (!search) return true;
        return (
          m.displayName.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search)
        );
      })
      .map((m) => ({
        ...baseUserFields,
        firstName: m.displayName.split(" ")[0] ?? m.displayName,
        lastName: m.displayName.split(" ").slice(1).join(" "),
        userName: m.email.split("@")[0],
        email: m.email,
        isAdmin: !!m.isAdmin,
        isRoomAdmin: !!m.isRoomAdmin,
        isCollaborator: !!m.isCollaborator,
        usedSpace: 0,
        loginEventId: 0,
        id: m.id,
        displayName: m.displayName,
        profileUrl: `${BASE_URL}/accounts/people/filter?search=${encodeURIComponent(m.email)}`,
      }));

    return okResponse({ items, total: items.length });
  });
};
