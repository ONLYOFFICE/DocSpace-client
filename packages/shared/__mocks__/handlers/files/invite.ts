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
import { EmployeeType } from "../../../enums";

export const PATH_PORTAL_INVITATION_LINK = "portal/users/invitationlink";

const emptyLink = {
  count: 0,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/portal/users/invitationlink`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const newUserLink = {
  response: {
    id: "52cf0821-7023-457b-9b79-17e8fd861d4f",
    employeeType: 4,
    expiration: "3025-12-16T11:16:00.0000000+03:00",
    isExpired: false,
    currentUseCount: 0,
    url: `${BASE_URL}/${API_PREFIX}/s/NKCLGM9mjy9VFJ5`,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/portal/users/invitationlink`,
      action: "POST",
    },
  ],
  status: 0,
  statusCode: 200,
};

const updatedUserLink = {
  response: {
    id: "52cf0821-7023-457b-9b79-17e8fd861d4f",
    employeeType: 4,
    expiration: "3025-12-16T11:16:00.0000000+03:00",
    isExpired: false,
    maxUseCount: 30,
    currentUseCount: 0,
    url: `${BASE_URL}/${API_PREFIX}/s/NKCLGM9mjy9VFJ5`,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/portal/users/invitationlink`,
      action: "PUT",
    },
  ],
  status: 0,
  statusCode: 200,
};

const expiredUserLink = {
  response: {
    id: "52cf0821-7023-457b-9b79-17e8fd861d4f",
    employeeType: 4,
    expiration: "2025-12-16T11:16:00.0000000+03:00",
    isExpired: false,
    currentUseCount: 0,
    url: `${BASE_URL}/${API_PREFIX}/s/NKCLGM9mjy9VFJ5`,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/portal/users/invitationlink`,
      action: "POST",
    },
  ],
  status: 0,
  statusCode: 200,
};

const limitedUserLink = {
  response: {
    id: "52cf0821-7023-457b-9b79-17e8fd861d4f",
    employeeType: 4,
    expiration: "3025-12-16T11:16:00.0000000+03:00",
    isExpired: false,
    maxUseCount: 20,
    currentUseCount: 20,
    url: `${BASE_URL}/${API_PREFIX}/s/NKCLGM9mjy9VFJ5`,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/portal/users/invitationlink`,
      action: "POST",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const getInvitationEmptyLinkResolver = () => {
  return new Response(JSON.stringify(emptyLink));
};

export const getInvitationLinkResolver = (
  isExpired?: boolean,
  limitIsExceeded?: boolean,
) => {
  if (isExpired) {
    return new Response(JSON.stringify(expiredUserLink));
  } else if (limitIsExceeded) {
    return new Response(JSON.stringify(limitedUserLink));
  }
  return new Response(JSON.stringify(newUserLink));
};

export const createInvitationLinkResolver = (userType: EmployeeType) => {
  switch (userType) {
    case EmployeeType.User:
      return new Response(JSON.stringify(newUserLink));
    default:
      return;
  }
};

export const deleteInvitationLinkResolver = () => {
  return new Response(JSON.stringify(emptyLink));
};

export const updateInvitationLinkResolver = () => {
  return new Response(JSON.stringify(updatedUserLink));
};

export const getEmptyPortalInvitationLink = (
  port: string,
  userType: EmployeeType,
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_PORTAL_INVITATION_LINK}/${userType}`,
    () => {
      return getInvitationEmptyLinkResolver();
    },
  );
};

export const getPortalInvitationLink = (
  port: string,
  userType: EmployeeType,
  isExpired?: boolean,
  limitIsExceeded?: boolean,
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_PORTAL_INVITATION_LINK}/${userType}`,
    () => {
      return getInvitationLinkResolver(isExpired, limitIsExceeded);
    },
  );
};

export const createPortalInvitationLink = (
  port: string,
  userType: EmployeeType,
) => {
  return http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_PORTAL_INVITATION_LINK}`,
    () => {
      return createInvitationLinkResolver(userType);
    },
  );
};

export const deletePortalInvitationLink = (port: string) => {
  return http.delete(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_PORTAL_INVITATION_LINK}`,
    () => {
      return deleteInvitationLinkResolver();
    },
  );
};

export const updatePortalInvitationLink = (
  port: string,
  userType: EmployeeType,
) => {
  return http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_PORTAL_INVITATION_LINK}`,
    () => {
      return updateInvitationLinkResolver();
    },
  );
};
