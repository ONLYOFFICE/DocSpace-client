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

export const aiChatResolver = () => {
  return new Response(JSON.stringify(successEmpty));
};

export const aiChatPutResolver = () => {
  return new Response(JSON.stringify(successUpdate));
};

export const aiChatDeleteResolver = () => {
  return new Response(null, { status: 204 });
};

export const aiChatHandler = (port: string) => {
  return http.get(
    `http://localhost:${port}/${API_PREFIX}/${PATH_AI_CHAT}`,
    () => {
      return aiChatResolver();
    },
  );
};

export const aiChatPutHandler = (port: string) => {
  return http.put(`${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_CHAT}`, () => {
    return aiChatPutResolver();
  });
};

export const aiChatDeleteHandler = (port: string) => {
  return http.delete(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_CHAT}`,
    () => {
      return aiChatDeleteResolver();
    },
  );
};
