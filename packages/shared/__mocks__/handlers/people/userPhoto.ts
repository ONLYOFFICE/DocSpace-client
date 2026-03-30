// (c) Copyright Ascensio System SIA 2009-2026
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
