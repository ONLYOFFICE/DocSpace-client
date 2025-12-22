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
import { API_PREFIX } from "../../e2e/utils";

export const PATH = "capabilities";

export const emptySuccessCapabilities = {
  response: {
    ldapEnabled: false,
    providers: [],
    ssoLabel: "",
    oauthEnabled: false,
    ssoUrl: "",
    identityServerEnabled: false,
  },
  count: 1,
  links: [
    {
      href: `/${API_PREFIX}/${PATH}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const successCapabilities = {
  response: {
    ldapEnabled: false,
    providers: [
      "google",
      "zoom",
      "linkedin",
      "facebook",
      "twitter",
      "microsoft",
    ],
    ssoLabel: "Single Sign-on",
    oauthEnabled: true,
    ssoUrl: `/sso/login`,
    identityServerEnabled: true,
  },
  count: 1,
  links: [
    {
      href: `/${API_PREFIX}/${PATH}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const capabilitiesResolver = (isNotEmpty?: boolean): Response => {
  if (isNotEmpty) {
    return new Response(JSON.stringify(successCapabilities));
  }

  return new Response(JSON.stringify(emptySuccessCapabilities));
};

export const capabilitiesHandler = (port: string, isNotEmpty?: boolean) => {
  return http.get(`http://localhost:${port}/${API_PREFIX}/${PATH}`, () => {
    return capabilitiesResolver(isNotEmpty);
  });
};
