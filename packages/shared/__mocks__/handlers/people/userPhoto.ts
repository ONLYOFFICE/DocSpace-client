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
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH_USER_PHOTO = "people/:userId/photo";

export const successUserPhoto = {
  original: `${BASE_URL}/static/images/default_user_photo_size_82-82.png`,
  retina: `${BASE_URL}/static/images/default_user_photo_size_82-82.png`,
  max: `${BASE_URL}/static/images/default_user_photo_size_82-82.png`,
  big: `${BASE_URL}/static/images/default_user_photo_size_82-82.png`,
  medium: `${BASE_URL}/static/images/default_user_photo_size_82-82.png`,
  small: `${BASE_URL}/static/images/default_user_photo_size_82-82.png`,
};

export const userPhotoResolver = (userId: string): Response => {
  // Don't return photos for anonymous users
  if (userId.startsWith("uid-")) {
    return new HttpResponse(null, { status: 404 });
  }

  return new Response(JSON.stringify({ response: successUserPhoto }));
};

export const userPhotoHandler = (port?: string) => {
  let baseUrl;
  if (port) {
    baseUrl = `${BASE_URL}:${port}`;
  } else {
    baseUrl =
      typeof window !== "undefined" ? window.location.origin : `${BASE_URL}`;
  }

  return http.get(
    `${baseUrl}/${API_PREFIX}/${PATH_USER_PHOTO}`,
    ({ params }) => {
      const { userId } = params;
      return userPhotoResolver(userId as string);
    },
  );
};
