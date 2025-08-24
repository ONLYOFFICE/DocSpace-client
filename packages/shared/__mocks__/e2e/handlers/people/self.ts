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

import {
  BASE_URL,
  HEADER_SELF_ERROR_400,
  HEADER_SELF_ERROR_404,
} from "../../utils";

export const PATH = "people";
export const PATH_CHANGE_AUTH_DATA = "people/**/password";
export const PATH_ACTIVATION_STATUS = "people/activationstatus/*";
export const PATH_UPDATE_USER = "people/*";
export const PATH_DELETE_USER = "people/@self";
export const PATH_USER_BY_EMAIL = "people/email?email=**";
export const PATH_ADD_GUEST = "people/guests/share/approve";

export const successSelf = {
  firstName: "Administrator",
  lastName: "",
  userName: "administrator",
  email: "test@gmail.com",
  status: 1,
  activationStatus: 0,
  department: "",
  workFrom: "2021-03-09T17:52:55.0000000+08:00",
  isAdmin: true,
  isRoomAdmin: false,
  isLDAP: false,
  isOwner: true,
  isVisitor: false,
  isCollaborator: false,
  cultureName: "en-GB",
  mobilePhoneActivationStatus: 0,
  isSSO: false,
  theme: "System",
  usedSpace: 3489170,
  loginEventId: 45,
  id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
  displayName: "Administrator ",
  avatar: "/static/images/default_user_photo_size_82-82.png?hash=1780467874",
  avatarOriginal:
    "/static/images/default_user_photo_size_200-200.png?hash=1780467874",
  avatarMax:
    "/static/images/default_user_photo_size_200-200.png?hash=1780467874",
  avatarMedium:
    "/static/images/default_user_photo_size_48-48.png?hash=1780467874",
  avatarSmall:
    "/static/images/default_user_photo_size_32-32.png?hash=1780467874",
  profileUrl: `${BASE_URL}/accounts/people/filter?search=test%40gmail.com`,
  hasAvatar: false,
  isAnonim: false,
};

export const usersSuccess = { response: [successSelf] };

export const selfError404 = {
  response: {
    data: {
      error: {
        message: "The record could not be found",
      },
    },
    status: 404,
    statusText: "Not Found",
  },
  status: 1,
  statusCode: 404,
};

export const selfError400 = {
  response: {
    title: "One or more validation errors occurred.",
    status: 400,
  },
  count: 1,
  status: 0,
  statusCode: 400,
};

export const self = (
  errorStatus: 400 | 404 | null = null,
  headers?: Headers | null,
  isEmailActivated?: boolean,
) => {
  if (errorStatus === 404 || headers?.get(HEADER_SELF_ERROR_404))
    return new Response(JSON.stringify(selfError404));

  if (errorStatus === 400 || headers?.get(HEADER_SELF_ERROR_400))
    return new Response(JSON.stringify(selfError400));

  if (isEmailActivated) {
    return new Response(JSON.stringify(usersSuccess));
  }

  return new Response(JSON.stringify({ response: successSelf }));
};
