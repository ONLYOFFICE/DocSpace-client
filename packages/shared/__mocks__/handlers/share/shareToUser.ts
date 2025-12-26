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

import { http } from "msw";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

const id = "00000000-0000-0000-0000-000000000000";
export const PATH_SHARE_TO_USERS_FILE =
  /.*\/api\/2\.0\/files\/file\/\d+\/share.*/;

export const success = {
  response: [
    {
      access: 2,
      sharedTo: {
        firstName: "Admin",
        lastName: "Admin",
        userName: "admin",
        email: "admin@mail.com",
        status: 1,
        activationStatus: 0,
        department: "",
        workFrom: "2024-07-12T04:00:00.0000000+00:00",
        isAdmin: false,
        isRoomAdmin: true,
        isLDAP: false,
        isOwner: false,
        isVisitor: false,
        isCollaborator: false,
        cultureName: "ru",
        mobilePhoneActivationStatus: 0,
        isSSO: false,
        usedSpace: 3489170,
        registrationDate: "2024-07-12T10:35:08.0000000+00:00",
        hasPersonalFolder: false,
        id,
        displayName: "Admin Admin",
        avatar: "/static/images/default_user_photo_size_82-82.png",
        avatarOriginal: "/static/images/default_user_photo_size_200-200.png",
        avatarMax: "/static/images/default_user_photo_size_200-200.png",
        avatarMedium: "/static/images/default_user_photo_size_48-48.png",
        avatarSmall: "/static/images/default_user_photo_size_32-32.png",
        profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40mail.com`,
        hasAvatar: false,
        isAnonim: false,
      },
      sharedToUser: {
        firstName: "Admin",
        lastName: "Admin",
        userName: "Admin",
        email: "admin@mail.ru",
        status: 1,
        activationStatus: 0,
        department: "",
        workFrom: "2024-07-12T04:00:00.0000000+00:00",
        isAdmin: false,
        isRoomAdmin: true,
        isLDAP: false,
        isOwner: false,
        isVisitor: false,
        isCollaborator: false,
        cultureName: "ru",
        mobilePhoneActivationStatus: 0,
        isSSO: false,
        usedSpace: 3489170,
        registrationDate: "2024-07-12T10:35:08.0000000+00:00",
        hasPersonalFolder: false,
        id,
        displayName: "Admin Admin",
        avatar: "/static/images/default_user_photo_size_82-82.png",
        avatarOriginal: "/static/images/default_user_photo_size_200-200.png",
        avatarMax: "/static/images/default_user_photo_size_200-200.png",
        avatarMedium: "/static/images/default_user_photo_size_48-48.png",
        avatarSmall: "/static/images/default_user_photo_size_32-32.png",
        profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40mail.com`,
        hasAvatar: false,
        isAnonim: false,
      },
      isLocked: false,
      isOwner: false,
      canEditAccess: true,
      canEditInternal: true,
      canEditDenyDownload: true,
      canEditExpirationDate: true,
      canRevoke: false,
      subjectType: 0,
    },
  ],
  count: 1,
  total: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/folder/*/share?startIndex=0&count=100`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const shareToUserResolver = () => {
  return new Response(JSON.stringify(success));
};

export const shareToUserHandler = () => {
  return http.get(`${BASE_URL}/${API_PREFIX}/${PATH_SHARE_TO_USERS_FILE}`, 
    () => shareToUserResolver());
};
