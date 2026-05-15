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

import { http, HttpResponse } from "msw";
import type { DateTime } from "luxon";
import { uuid } from "@docspace/ui-kit/utils/uuid";

import { TFileLink } from "../../../api/files/types";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH_LINK = "files/file/:fileId/link";
export const PATH_LINKS = "files/file/:fileId/links";

const generateFileLink = ({
  id = uuid(),
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
  expirationDate?: DateTime | string;
  isExpired?: boolean;
} = {}): TFileLink => {
  return {
    access,
    canEditInternal: true,
    canEditExpirationDate: true,
    canRevoke: true,
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
      expirationDate:
        typeof expirationDate === "string"
          ? expirationDate
          : (expirationDate?.toISO() ?? undefined),
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

export const externalLinksHandler = (port?: string) => {
  let baseUrl;
  if (port) {
    baseUrl = `${BASE_URL}:${port}`;
  } else {
    baseUrl =
      typeof window !== "undefined" ? window.location.origin : `${BASE_URL}`;
  }

  return http.get(`${baseUrl}/${API_PREFIX}/${PATH_LINKS}`, () => {
    const response = { items: generateFileLinks(3), total: 3 };

    return HttpResponse.json({ response });
  });
};

export const primaryLinkHandler = (port?: string) => {
  let baseUrl;
  if (port) {
    baseUrl = `${BASE_URL}:${port}`;
  } else {
    baseUrl =
      typeof window !== "undefined" ? window.location.origin : `${BASE_URL}`;
  }
  return http.get(`${baseUrl}/${API_PREFIX}/${PATH_LINK}`, () => {
    const response = generateFileLink({
      title: "Primary link",
      primary: true,
    });

    return HttpResponse.json({ response });
  });
};

export const editExternalLinkHandler = (port?: string) => {
  let baseUrl;
  if (port) {
    baseUrl = `${BASE_URL}:${port}`;
  } else {
    baseUrl = window.location.origin;
  }

  return http.put(
    `${baseUrl}/${API_PREFIX}/${PATH_LINKS}`,
    async ({ request }) => {
      const body = await request.json();

      const { linkId, access, primary, internal, expirationDate } = body as {
        linkId: string;
        access: number;
        primary: boolean;
        internal: boolean;
        expirationDate?: DateTime | string;
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
    },
  );
};
