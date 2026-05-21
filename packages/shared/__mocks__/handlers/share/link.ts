/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { http } from "msw";
import { ShareAccessRights } from "../../../enums";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";
import type { MethodType } from "../../e2e/types";

export type LinkTemplateOptions = {
  linkId?: string;
  title?: string;
  requestToken?: string;
  shareLink?: string;
  access: ShareAccessRights;
};

export const LINK_FILE_PATH = "files/file/:id/link";
export const LINKS_FILE_PATH = "files/file/:id/links";

const id = "00000000-0000-0000-0000-000000000000";
const shareLink = `${BASE_URL}:5110/s/linkId`;

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

const createLink = (option: LinkTemplateOptions) => {
  return {
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
  };
};

export const createLinkRoute = (
  option: LinkTemplateOptions | LinkTemplateOptions[],
  method: MethodType = "POST",
  url: string | RegExp = LINK_FILE_PATH,
  withTotal = false,
) => {
  const isArray = Array.isArray(option);

  const count = isArray ? option.length : 1;

  const data = {
    ...linkHandle,
    response: isArray ? option.map(createLink) : createLink(option),
    count,
    ...(withTotal ? { total: count } : {}),
  };

  return data;
};

export const linkResolver = () => {
  return new Response(JSON.stringify(linkHandle));
};

export const linkHandler = () => {
  return http.post(
    `${BASE_URL}:5110/${API_PREFIX}/${LINK_FILE_PATH}`,
    linkResolver,
  );
};

export const createLinkRouteResolver = (
  option: LinkTemplateOptions | LinkTemplateOptions[],
  method?: MethodType,
  url?: string | RegExp,
  withTotal?: boolean,
) => {
  return new Response(
    JSON.stringify(createLinkRoute(option, method, url, withTotal)),
  );
};

export const createLinkRouteHandler = (
  port: string,
  option: LinkTemplateOptions | LinkTemplateOptions[],
  method?: MethodType,
  url?: string | RegExp,
  withTotal?: boolean,
) => {
  const isArray = Array.isArray(option);

  return http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/${isArray ? LINKS_FILE_PATH : LINK_FILE_PATH}`,
    () => createLinkRouteResolver(option, method, url, withTotal),
  );
};

export const createLinksRouteHandler = (
  port: string,
  option: LinkTemplateOptions | LinkTemplateOptions[],
  method?: MethodType,
  withTotal?: boolean,
) => {
  return http.get(`${BASE_URL}:${port}/${API_PREFIX}/${LINKS_FILE_PATH}`, () =>
    createLinkRouteResolver(option, method, "", withTotal),
  );
};
