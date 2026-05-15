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
import { API_PREFIX, BASE_URL, buildSseBody } from "../../e2e/utils";

export const PATH_AI_ROOMS_CHATS = "ai/rooms/*/chats";
export const PATH_AI_ROOMS_CHATS_STREAM = "ai/rooms/*/chats";

const createdBy = {
  id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
  displayName: "Administrator ",
  avatar: "/static/images/default_user_photo_size_82-82.png?hash=1340933600",
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
};

const successEmpty = {
  response: [],
  count: 0,
  total: 0,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_ROOMS_CHATS}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successWithChats = {
  response: [
    {
      id: "test-chat-id",
      title: "Lorem ipsum",
      createdOn: "2025-12-24T17:57:14.0000000+01:00",
      modifiedOn: "2025-12-24T17:57:14.0000000+01:00",
      createdBy: createdBy,
    },
    {
      id: "test-chat-id-2",
      title: "Lorem ipsum dolor",
      createdOn: "2025-12-24T17:57:14.0000000+01:00",
      modifiedOn: "2025-12-24T17:57:14.0000000+01:00",
      createdBy: createdBy,
    },
    {
      id: "test-chat-id-3",
      title: "Lorem ipsum dolor sit",
      createdOn: "2025-12-24T17:57:14.0000000+01:00",
      modifiedOn: "2025-12-24T17:57:14.0000000+01:00",
      createdBy: createdBy,
    },
    {
      id: "test-chat-id-4",
      title: "Lorem ipsum dolor sit amet",
      createdOn: "2025-12-24T17:57:14.0000000+01:00",
      modifiedOn: "2025-12-24T17:57:14.0000000+01:00",
      createdBy: createdBy,
    },
    {
      id: "test-chat-id-5",
      title: "Lorem ipsum dolor sit amet consectetur adipiscing elit",
      createdOn: "2025-12-24T17:57:14.0000000+01:00",
      modifiedOn: "2025-12-24T17:57:14.0000000+01:00",
      createdBy: createdBy,
    },
  ],
  count: 5,
  total: 5,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_ROOMS_CHATS}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const defaultStreamMessage = buildSseBody([
  {
    event: "message_start",
    data: { chatId: "cc7a19f1-512b-443b-b5b3-9bf4a37530cd", error: "" },
  },
  {
    event: "new_token",
    data: { text: "# Lorem\n\nLorem ipsum dolor sit amet consectetur" },
  },
  { event: "new_token", data: { text: " adipiscing elit" } },
  { event: "message_stop", data: { messageId: 1 } },
]);

const mcpNeedApproveStreamMessage = buildSseBody([
  {
    event: "message_start",
    data: { chatId: "3d3dbe04-3c15-4035-9785-5164e8bd985c", error: "" },
  },
  {
    event: "tool_call",
    data: {
      callId: "call_ythOFAESwqWM1S7naGhP225L",
      name: "mcp_tool_name",
      arguments: {
        key: "value",
      },
      managed: true,
      mcpServerInfo: {
        serverId: "883da87d-5ae0-49fd-8cb9-2cb82181667e",
        serverName: "docspace",
        serverType: 1,
      },
    },
  },
  // { event: "new_token", data: { text: " adipiscing elit" } },
  // { event: "message_stop", data: { messageId: 1 } },
]);

export const aiRoomsChatsResolver = (
  type: "empty" | "with-chats" = "with-chats",
) => {
  switch (type) {
    case "with-chats":
      return new Response(JSON.stringify(successWithChats));
    case "empty":
      return new Response(JSON.stringify(successEmpty));
  }
};

export const aiRoomsChatsStreamResolver = (
  type: "default" | "mcpNeedApprove" = "default",
) => {
  switch (type) {
    case "mcpNeedApprove":
      return new Response(mcpNeedApproveStreamMessage);
    case "default":
      return new Response(defaultStreamMessage);
  }
};

export const aiRoomsChatsHandler = (
  port: string,
  type?: "empty" | "with-chats",
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_ROOMS_CHATS}`,
    () => aiRoomsChatsResolver(type),
  );
};

export const aiRoomsChatsStreamHandler = (
  port: string,
  type?: "default" | "mcpNeedApprove",
) => {
  return http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_ROOMS_CHATS_STREAM}`,
    () => aiRoomsChatsStreamResolver(type),
  );
};
