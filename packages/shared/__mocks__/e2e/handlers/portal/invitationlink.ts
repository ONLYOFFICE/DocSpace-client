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

export const INVITATION_PATH = "portal/users/invitationlink";

type LinkDateType = {
  userType: string;
  isEmpty?: boolean;
  isExpired?: boolean;
  limitIsExceeded?: boolean;
};

const newLinkResponse = {
  response: {
    id: "c2dec7c5-197c-4811-9c2a-f55978b3aea4",
    employeeType: 4,
    expiration: "3025-12-16T11:16:00.0000000+03:00",
    currentUseCount: 0,
    url: "http://localhost:8092/s/T9rfXjDdy5y5k_5",
  },
  count: 1,
  links: [
    {
      href: "http://localhost:8092/api/2.0/portal/users/invitationlink",
      action: "POST",
    },
  ],
  status: 0,
  statusCode: 200,
};

const updatedLinkResponse = {
  response: {
    id: "c2dec7c5-197c-4811-9c2a-f55978b3aea4",
    employeeType: 4,
    expiration: "3025-12-16T08:16:00.000Z",
    maxUseCount: 30,
    currentUseCount: 10,
    url: "http://localhost:8092/s/T9rfXjDdy5y5k_5",
  },
  count: 1,
  links: [
    {
      href: "http://localhost:8092/api/2.0/portal/users/invitationlink",
      action: "PUT",
    },
  ],
  status: 0,
  statusCode: 200,
};

const emptyLinkResponse = {
  count: 0,
  links: [
    {
      href: "http://localhost:8092/api/2.0/portal/users/invitationlink/3",
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const getInvitationSuccess = (linkData: LinkDateType) => {
  const { userType, isEmpty, isExpired, limitIsExceeded } = linkData;
  const expiration = isExpired
    ? "2025-01-01T11:16:00.0000000+03:00"
    : "3025-12-16T11:16:00.0000000+03:00";
  const currentUseCount = limitIsExceeded ? 20 : 10;

  if (isEmpty) return emptyLinkResponse;

  return {
    response: {
      id: "c2dec7c5-197c-4811-9c2a-f55978b3aea4",
      employeeType: userType,
      expiration,
      maxUseCount: 20,
      currentUseCount,
      url: "http://localhost:8092/s/T9rfXjDdy5y5k_5",
    },
    count: 1,
    links: [
      {
        href: `http://localhost:8092/api/2.0/portal/users/invitationlink/${userType}`,
        action: "GET",
      },
    ],
    status: 0,
    statusCode: 200,
  };
};

export const portalInvitationHandler = (linkData: LinkDateType): Response => {
  return new Response(JSON.stringify(getInvitationSuccess(linkData)));
};

export const setPortalInvitationLink = () => {
  return new Response(JSON.stringify(updatedLinkResponse));
};

export const createPortalInvitationLink = () => {
  return new Response(JSON.stringify(newLinkResponse));
};

export const deletePortalInvitationLink = () => {
  return new Response(JSON.stringify(emptyLinkResponse));
};
