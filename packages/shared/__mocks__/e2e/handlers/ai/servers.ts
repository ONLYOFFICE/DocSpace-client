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

import { API_PREFIX, BASE_URL } from "../../utils";

export const PATH_AI_SERVERS_WITH_FILTER = "ai/servers?*";
export const PATH_AI_SERVERS = "ai/servers";
export const PATH_AI_SERVERS_AVAILABLE = "ai/servers/available?*";

const successAvailable = {
  response: [
    {
      id: "883da87d-5ae0-49fd-8cb9-2cb82181667e",
      name: "docspace",
      serverType: 1,
      enabled: true,
    },
    {
      id: "883da87d-5ae0-49fd-8cb9-2cb82181667b",
      name: "custom",
      serverType: 0,
      enabled: true,
    },
  ],
  count: 2,
  total: 2,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_SERVERS_AVAILABLE}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successList = {
  response: [
    {
      id: "7a1f3c6d-1c3b-4704-b8ed-8dc90d0f371f",
      name: "test custom server",
      description: "asdf",
      endpoint: "http://custom-mcp.com",
      serverType: 0,
      headers: {
        headerKey: "headerValue",
      },
      enabled: true,
    },
    {
      id: "883da87d-5ae0-49fd-8cb9-2cb82181667e",
      name: "test system server",
      endpoint: "http://system-mcp.com",
      serverType: 1,
      enabled: true,
    },
  ],
  count: 2,
  total: 2,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_SERVERS_WITH_FILTER}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successCreate = {
  response: {
    id: "b4b46038-4c1d-465b-9394-fd5544ca4f32",
    name: "created_mcp",
    description: "descr",
    endpoint: "https://createdmcp.com/",
    serverType: 0,
    headers: {
      headerKey: "headerValue",
    },
    enabled: true,
    needReset: false,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_SERVERS}`,
      action: "POST",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successDelete = {
  response: null,
  status: 0,
  statusCode: 200,
};

export const aiServersAvailableHandler = () => {
  return new Response(JSON.stringify(successAvailable));
};

export const aiServersGetHandler = () => {
  return new Response(JSON.stringify(successList));
};

export const aiServersPostHandler = () => {
  return new Response(JSON.stringify(successCreate));
};

export const aiServersDeleteHandler = () => {
  return new Response(JSON.stringify(successDelete));
};
