/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { API_PREFIX, BASE_URL } from "../../utils";

export const PATH_AI_CHAT = "ai/chats/*";

const successEmpty = {
  response: {
    id: "test-chat-id",
    title: "Greeting and Introduction Conversation",
    createdOn: "2025-12-24T15:49:21.0000000+01:00",
    modifiedOn: "2025-12-24T15:49:21.0000000+01:00",
    createdBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar:
        "/static/images/default_user_photo_size_82-82.png?hash=1340933600",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=1340933600",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=1340933600",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=1340933600",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=1340933600",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_CHAT}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successUpdate = {
  response: {
    id: "test-chat-id",
    title: "Updated chat name",
    createdOn: "2025-12-24T15:49:21.0000000+01:00",
    modifiedOn: "2025-12-24T15:49:21.0000000+01:00",
    createdBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar:
        "/static/images/default_user_photo_size_82-82.png?hash=1340933600",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=1340933600",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=1340933600",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=1340933600",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=1340933600",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_CHAT}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const aiChatHandler = () => {
  return new Response(JSON.stringify(successEmpty));
};

export const aiChatPutHandler = () => {
  return new Response(JSON.stringify(successUpdate));
};
