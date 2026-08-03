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
import { BASE_URL, API_PREFIX } from "../../e2e/utils";

export const PATH = "files/file/1/formroles";

const fillingStatusSuccess = {
  response: [
    {
      roleName: "Anyone",
      roleColor: "ffefbf",
      user: {
        firstName: "Administrator",
        lastName: "",
        userName: "administrator",
        email: "admin@gmail.com",
        status: 1,
        activationStatus: 0,
        department: "",
        workFrom: "2021-03-09T12:52:55.0000000+03:00",
        isAdmin: false,
        isRoomAdmin: false,
        isLDAP: false,
        listAdminModules: ["files"],
        isOwner: true,
        isVisitor: false,
        isCollaborator: false,
        mobilePhoneActivationStatus: 0,
        isSSO: false,
        usedSpace: 637430540,
        registrationDate: "2022-07-08T03:00:00.0000000+03:00",
        hasPersonalFolder: false,
        tfaAppEnabled: true,
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        displayName: "Administrator ",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=868996641",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=868996641",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=868996641",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=868996641",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=868996641",
        profileUrl: "",
        hasAvatar: false,
        isAnonim: false,
      },
      sequence: 1,
      submitted: true,
      history: {
        "0": "2025-12-30T17:04:29+00:00",
        "1": "2025-12-30T17:04:36+00:00",
      },
      roleStatus: 4,
    },
  ],
  count: 1,
  links: [
    {
      href: `${BASE_URL}${API_PREFIX}/files/file/1/formroles`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const fillingStatusResolver = () => {
  return new Response(JSON.stringify(fillingStatusSuccess));
};

export const fillingStatusHandler = (port: string) => {
  return http.get(`${BASE_URL}:${port}/${API_PREFIX}/${PATH}`, () => {
    return fillingStatusResolver();
  });
};
