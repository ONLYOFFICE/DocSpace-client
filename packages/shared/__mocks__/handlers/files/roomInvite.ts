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

export const PATH_ROOM_INVITATION_LINK = "files/rooms/:id(\\d+)";

const emptyLink = {
  response: [],
  count: 0,
  total: 0,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms/43/share`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const newRoomLink = {
  response: {
    access: 11,
    sharedTo: {
      id: "faae827c-76f3-42ab-ad46-9b05064a38ef",
      title: "Invite",
      shareLink: `${BASE_URL}/${API_PREFIX}/s/qty9MgnZ8qDV44V`,
      expiration: "3025-12-16T11:16:00.0000000+03:00",
      linkType: 0,
      denyDownload: false,
      isExpired: false,
      primary: false,
      internal: false,
      currentUseCount: 0,
    },
    sharedLink: {
      id: "faae827c-76f3-42ab-ad46-9b05064a38ef",
      title: "Invite",
      shareLink: `${BASE_URL}/${API_PREFIX}/s/qty9MgnZ8qDV44V`,
      expiration: "3025-12-16T11:16:00.0000000+03:00",
      linkType: 0,
      denyDownload: false,
      isExpired: false,
      primary: false,
      internal: false,
      currentUseCount: 0,
    },
    isLocked: false,
    isOwner: false,
    canEditAccess: false,
    canEditInternal: false,
    canEditDenyDownload: true,
    canEditExpirationDate: true,
    canRevoke: false,
    subjectType: 3,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms/43/links`,
      action: "PUT",
    },
  ],
  status: 0,
  statusCode: 200,
};

const getRoomLink = {
  response: [
    {
      access: 11,
      sharedTo: {
        id: "faae827c-76f3-42ab-ad46-9b05064a38ef",
        title: "Invite",
        shareLink: `${BASE_URL}/${API_PREFIX}/s/qty9MgnZ8qDV44V`,
        expiration: "3025-12-16T11:16:00.0000000+03:00",
        linkType: 0,
        denyDownload: false,
        isExpired: false,
        primary: false,
        internal: false,
        currentUseCount: 0,
      },
      sharedLink: {
        id: "faae827c-76f3-42ab-ad46-9b05064a38ef",
        title: "Invite",
        shareLink: `${BASE_URL}/${API_PREFIX}/s/qty9MgnZ8qDV44V`,
        expiration: "3025-12-16T11:16:00.0000000+03:00",
        linkType: 0,
        denyDownload: false,
        isExpired: false,
        primary: false,
        internal: false,
        currentUseCount: 0,
      },
      isLocked: false,
      isOwner: false,
      canEditAccess: false,
      canEditInternal: false,
      canEditDenyDownload: true,
      canEditExpirationDate: true,
      canRevoke: false,
      subjectType: 3,
    },
  ],
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms/43/links`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  total: 1,
};

const updatedUserLink = {
  response: {
    access: 2,
    sharedTo: {
      id: "bdf8a67d-f2dd-4e96-bde5-514e7760d781",
      title: "Invite",
      shareLink: `${BASE_URL}/${API_PREFIX}/s/NKCLGM9mjy9VFJ5`,
      expirationDate: "3025-12-16T11:16:00.0000000+03:00",
      linkType: 0,
      denyDownload: false,
      isExpired: false,
      primary: false,
      internal: false,
      maxUseCount: 30,
      currentUseCount: 0,
    },
    sharedLink: {
      id: "bdf8a67d-f2dd-4e96-bde5-514e7760d781",
      title: "Invite",
      shareLink: `${BASE_URL}/${API_PREFIX}/s/NKCLGM9mjy9VFJ5`,
      expirationDate: "3025-12-16T11:16:00.0000000+03:00",
      linkType: 0,
      denyDownload: false,
      isExpired: false,
      primary: false,
      internal: false,
      maxUseCount: 30,
      currentUseCount: 0,
    },
    isLocked: false,
    isOwner: false,
    canEditAccess: false,
    canEditInternal: true,
    canEditDenyDownload: true,
    canEditExpirationDate: true,
    canRevoke: false,
    subjectType: 3,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms/43/links`,
      action: "PUT",
    },
  ],
  status: 0,
  statusCode: 200,
};

const expiredUserLink = {
  response: [
    {
      access: 11,
      sharedTo: {
        id: "c8f81984-2288-4a1a-ab75-c7875d9e6f23",
        title: "Invite",
        shareLink: `${BASE_URL}/${API_PREFIX}/s/NKCLGM9mjy9VFJ5`,
        expirationDate: "2025-12-16T11:16:00.0000000+03:00",
        linkType: 0,
        denyDownload: false,
        isExpired: true,
        primary: false,
        internal: false,
        maxUseCount: 1,
        currentUseCount: 0,
      },
      sharedLink: {
        id: "c8f81984-2288-4a1a-ab75-c7875d9e6f23",
        title: "Invite",
        shareLink: `${BASE_URL}/${API_PREFIX}/s/NKCLGM9mjy9VFJ5`,
        expirationDate: "2025-12-16T11:16:00.0000000+03:00",
        linkType: 0,
        denyDownload: false,
        isExpired: true,
        primary: false,
        internal: false,
        maxUseCount: 1,
        currentUseCount: 0,
      },
      isLocked: false,
      isOwner: false,
      canEditAccess: false,
      canEditInternal: false,
      canEditDenyDownload: true,
      canEditExpirationDate: true,
      canRevoke: false,
      subjectType: 3,
    },
  ],
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms/43/links`,
      action: "PUT",
    },
  ],
  status: 0,
  statusCode: 200,
  total: 1,
};

const limitedUserLink = {
  response: [
    {
      access: 11,
      sharedTo: {
        id: "c8f81984-2288-4a1a-ab75-c7875d9e6f23",
        title: "Invite",
        shareLink: `${BASE_URL}/${API_PREFIX}/s/NKCLGM9mjy9VFJ5`,
        expirationDate: "3025-12-16T11:16:00.0000000+03:00",
        linkType: 0,
        denyDownload: false,
        isExpired: false,
        primary: false,
        internal: false,
        maxUseCount: 1,
        currentUseCount: 1,
      },
      sharedLink: {
        id: "c8f81984-2288-4a1a-ab75-c7875d9e6f23",
        title: "Invite",
        shareLink: `${BASE_URL}/${API_PREFIX}/s/NKCLGM9mjy9VFJ5`,
        expirationDate: "3025-12-16T11:16:00.0000000+03:00",
        linkType: 0,
        denyDownload: false,
        isExpired: false,
        primary: false,
        internal: false,
        maxUseCount: 1,
        currentUseCount: 1,
      },
      isLocked: false,
      isOwner: false,
      canEditAccess: false,
      canEditInternal: false,
      canEditDenyDownload: true,
      canEditExpirationDate: true,
      canRevoke: false,
      subjectType: 3,
    },
  ],
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms/43/links`,
      action: "PUT",
    },
  ],
  status: 0,
  statusCode: 200,
  total: 1,
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

  return new Response(JSON.stringify(getRoomLink));
};

export const createInvitationLinkResolver = () => {
  return new Response(JSON.stringify(newRoomLink));
};

export const deleteInvitationLinkResolver = () => {
  return new Response(JSON.stringify(emptyLink));
};

export const updateInvitationLinkResolver = () => {
  return new Response(JSON.stringify(updatedUserLink));
};

export const getEmptyInvitationLink = (port: string) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOM_INVITATION_LINK}/share`,
    () => {
      return getInvitationEmptyLinkResolver();
    },
  );
};

export const getInvitationLink = (
  port: string,
  isExpired?: boolean,
  limitIsExceeded?: boolean,
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOM_INVITATION_LINK}/share`,
    () => {
      return getInvitationLinkResolver(isExpired, limitIsExceeded);
    },
  );
};

export const createInvitationLink = (port: string) => {
  return http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOM_INVITATION_LINK}/links`,
    () => {
      return createInvitationLinkResolver();
    },
  );
};

export const deleteInvitationLink = (port: string) => {
  return http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOM_INVITATION_LINK}/links`,
    () => {
      return deleteInvitationLinkResolver();
    },
  );
};

export const updateInvitationLink = (port: string) => {
  return http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOM_INVITATION_LINK}/links`,
    () => {
      return updateInvitationLinkResolver();
    },
  );
};
