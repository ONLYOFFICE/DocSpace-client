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

import { http, HttpResponse } from "msw";
import { v4 as uuidv4 } from "uuid";
import moment from "moment/moment";

import { TFileLink } from "../../../../api/files/types";
import { BASE_URL } from "../../utils";

const linkUrl = `${BASE_URL}/files/file/:fileId/link`;
const linksUrl = `${BASE_URL}/files/file/:fileId/links`;

const generateFileLink = ({
  id = uuidv4(),
  title = "New link",
  access = 2,
  primary = false,
  internal = false,
  expirationDate,
  isExpired = false,
}: {
  id?: string;
  title?: string;
  access?: number;
  primary?: boolean;
  internal?: boolean;
  expirationDate?: moment.Moment;
  isExpired?: boolean;
} = {}): TFileLink => {
  return {
    access,
    canEditInternal: true,
    sharedTo: {
      id,
      title,
      shareLink: "",
      linkType: 1,
      denyDownload: false,
      isExpired,
      primary,
      internal,
      requestToken: "",
      expirationDate: expirationDate?.toISOString(),
    },
    canEditDenyDownload: false,
    isLocked: false,
    isOwner: false,
    canEditAccess: false,
    subjectType: 1,
  };
};

function generateFileLinks(count = 3): TFileLink[] {
  return Array.from({ length: count }, (_, i) =>
    generateFileLink({
      title: `Link ${i + 1}`,
      primary: i === 0,
      isExpired: i === count - 1,
    }),
  );
}

export const createGetExternalLinksHandler = () =>
  http.get(linksUrl, () => {
    const response = { items: generateFileLinks(3), total: 3 };

    return HttpResponse.json({ response });
  });

export const createGetPrimaryLinkHandler = () =>
  http.get(linkUrl, () => {
    const response = generateFileLink({
      title: "Primary link",
      primary: true,
    });

    return HttpResponse.json({ response });
  });

export const createEditExternalLinkHandler = () =>
  http.put(linksUrl, async ({ request }) => {
    const body = await request.json();

    const { linkId, access, primary, internal, expirationDate } = body as {
      linkId: string;
      access: number;
      primary: boolean;
      internal: boolean;
      expirationDate?: moment.Moment;
    };

    const response = generateFileLink({
      id: linkId,
      title: `Edited Link ${linkId}`,
      access,
      primary,
      internal,
      expirationDate,
    });

    return HttpResponse.json({ response });
  });
