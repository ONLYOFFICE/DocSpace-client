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
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH = "authentication/confirm";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export enum ErrorConfirm {
  Invalid = "Invalid",
  Expired = "Expired",
  TariffLimit = "TariffLimit",
  UserExisted = "UserExisted",
  UserExcluded = "UserExcluded",
  QuotaFailed = "QuotaFailed",
}

export const getConfirmSuccess = (
  result: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0,
  withEmail?: boolean,
) => {
  return {
    response: { result, email: withEmail ? "mail@mail.com" : undefined },
    count: 1,
    links: [
      {
        href: url,
        action: "POST",
      },
    ],
    status: 0,
    statusCode: 200,
    ok: true,
  };
};

export const confirmResolver = (
  errorType?: ErrorConfirm,
  withEmail?: boolean,
): Response => {
  switch (errorType) {
    case ErrorConfirm.Invalid:
      return new Response(JSON.stringify(getConfirmSuccess(1)));
    case ErrorConfirm.Expired:
      return new Response(JSON.stringify(getConfirmSuccess(2)));
    case ErrorConfirm.TariffLimit:
      return new Response(JSON.stringify(getConfirmSuccess(3)));
    case ErrorConfirm.UserExisted:
      return new Response(JSON.stringify(getConfirmSuccess(4)));
    case ErrorConfirm.UserExcluded:
      return new Response(JSON.stringify(getConfirmSuccess(5)));
    case ErrorConfirm.QuotaFailed:
      return new Response(JSON.stringify(getConfirmSuccess(6)));
    default:
      return new Response(JSON.stringify(getConfirmSuccess(0, withEmail)));
  }
};

export const confirmHandler = (
  port: string,
  errorType?: ErrorConfirm,
  withEmail?: boolean,
) => {
  return http.post(`${BASE_URL}:${port}/${API_PREFIX}/${PATH}`, () => {
    return confirmResolver(errorType, withEmail);
  });
};
