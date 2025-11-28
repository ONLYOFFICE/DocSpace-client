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
  return http.post(`http://localhost:${port}/${API_PREFIX}/${PATH}`, () => {
    return confirmResolver(errorType, withEmail);
  });
};
