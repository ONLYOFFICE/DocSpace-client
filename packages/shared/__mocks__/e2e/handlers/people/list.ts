// (c) Copyright Ascensio System SIA 2009-2025
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

import { BASE_URL } from "../../utils";
import { successSelf, adminOnlyUser, roomAdminUser } from "./self";

export const PATH_PEOPLE_LIST = "people/filter";

// Regular user
const regularUser = {
  firstName: "Regular",
  lastName: "User",
  userName: "regularuser",
  email: "user@test.com",
  status: 1,
  activationStatus: 1,
  department: "Development",
  workFrom: "2022-06-01T09:00:00.0000000+08:00",
  isAdmin: false,
  isRoomAdmin: false,
  isLDAP: false,
  isOwner: false,
  isVisitor: false,
  isCollaborator: false,
  cultureName: "en-GB",
  mobilePhoneActivationStatus: 0,
  isSSO: false,
  id: "regular-user-id",
  displayName: "Regular User",
  avatar: "/static/images/default_user_photo_size_82-82.png?hash=1780467874",
  avatarOriginal:
    "/static/images/default_user_photo_size_200-200.png?hash=1780467874",
  avatarMax:
    "/static/images/default_user_photo_size_200-200.png?hash=1780467874",
  avatarMedium:
    "/static/images/default_user_photo_size_48-48.png?hash=1780467874",
  avatarSmall:
    "/static/images/default_user_photo_size_32-32.png?hash=1780467874",
  profileUrl: `${BASE_URL}/accounts/people/filter?search=user%40test.com`,
  hasAvatar: false,
  isAnonim: false,
  usedSpace: 512000,
};

// Guest user
const guestUser = {
  firstName: "Guest",
  lastName: "User",
  userName: "guest",
  email: "guest@test.com",
  status: 1,
  activationStatus: 1,
  department: "",
  workFrom: "2022-07-01T09:00:00.0000000+08:00",
  isAdmin: false,
  isRoomAdmin: false,
  isLDAP: false,
  isOwner: false,
  isVisitor: true,
  isCollaborator: false,
  cultureName: "en-GB",
  mobilePhoneActivationStatus: 0,
  isSSO: false,
  id: "guest-user-id",
  displayName: "Guest User",
  avatar: "/static/images/default_user_photo_size_82-82.png?hash=1780467874",
  avatarOriginal:
    "/static/images/default_user_photo_size_200-200.png?hash=1780467874",
  avatarMax:
    "/static/images/default_user_photo_size_200-200.png?hash=1780467874",
  avatarMedium:
    "/static/images/default_user_photo_size_48-48.png?hash=1780467874",
  avatarSmall:
    "/static/images/default_user_photo_size_32-32.png?hash=1780467874",
  profileUrl: `${BASE_URL}/accounts/people/filter?search=guest%40test.com`,
  hasAvatar: false,
  isAnonim: false,
  usedSpace: 0,
};

export const mockUsers = [
  successSelf, // Owner + Admin
];

export const peopleListEmpty = {
  response: {
    items: [],
    total: 0,
  },
};

export const peopleListSuccess = {
  response: {
    items: mockUsers,
    total: mockUsers.length,
  },
};

export const peopleListHandler = (headers?: Headers) => {
  if (headers?.get("x-mock-response") === "empty") {
    return new Response(JSON.stringify(peopleListEmpty));
  }

  return new Response(JSON.stringify(peopleListSuccess));
};

export const peopleListAccessDeniedHandler = () => {
  return new Response(
    JSON.stringify({
      error: {
        message: "Access denied",
      },
      status: 1,
      statusCode: 403,
    }),
  );
};
