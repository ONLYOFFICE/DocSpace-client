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

import { ShareAccessRights } from "../../../../enums";

import { API_PREFIX, BASE_URL } from "../../utils";

export type LinkTemplateOptions = {
  linkId?: string;
  title?: string;
  requestToken?: string;
  shareLink?: string;
  access: ShareAccessRights;
};

export const LINK_PATH = /.*\/api\/2\.0\/files\/file\/\d+\/link.*/;

const id = "00000000-0000-0000-0000-000000000000";
const shareLink = `${BASE_URL}/s/linkId`;

export const linkHandle = {
  response: {
    access: ShareAccessRights.ReadOnly,
    sharedTo: {
      id,
      title: "Shared link",
      shareLink,
      linkType: 1,
      denyDownload: false,
      isExpired: false,
      primary: true,
      internal: false,
      requestToken: "requestToken",
    },
    sharedLink: {
      id,
      title: "Shared link",
      shareLink,
      linkType: 1,
      denyDownload: false,
      isExpired: false,
      primary: true,
      internal: false,
      requestToken: "requestToken",
    },
    isLocked: false,
    isOwner: false,
    canEditAccess: false,
    canEditInternal: true,
    canEditDenyDownload: true,
    canEditExpirationDate: true,
    canRevoke: false,
    subjectType: 4,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/file/*/link`,
      action: "POST",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const createLinkRoute = (
  option: LinkTemplateOptions,
  url: string | RegExp = LINK_PATH,
) => {
  const data = {
    ...linkHandle,
    response: {
      ...linkHandle.response,
      access: option.access ?? ShareAccessRights.ReadOnly,
      sharedTo: {
        ...linkHandle.response.sharedTo,
        id: option.linkId ?? id,
        title: option.title ?? "Shared link",
        shareLink: option.shareLink ?? shareLink,
        requestToken: option.requestToken ?? "requestToken",
      },
      sharedLink: {
        ...linkHandle.response.sharedLink,
        id: option.linkId ?? id,
        title: option.title ?? "Shared link",
        shareLink: option.shareLink ?? shareLink,
        requestToken: option.requestToken ?? "requestToken",
      },
    },
  };

  return {
    url,
    dataHandler: () => new Response(JSON.stringify(data)),
  };
};

export const LinkHandler = () => {
  return new Response(JSON.stringify(linkHandle));
};
