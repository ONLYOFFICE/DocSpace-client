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

export const PATH_AI_SERVERS = "ai/servers";
export const PATH_AI_SERVERS_AVAILABLE = "ai/servers/available";

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
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_SERVERS}`,
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
      needReset: false,
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
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_SERVERS}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successListDisabled = {
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
      enabled: false,
      needReset: false,
    },
    {
      id: "883da87d-5ae0-49fd-8cb9-2cb82181667e",
      name: "test system server",
      endpoint: "http://system-mcp.com",
      serverType: 1,
      enabled: false,
    },
  ],
  count: 2,
  total: 2,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_SERVERS}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successListNeedReset = {
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
      enabled: false,
      needReset: true,
    },
  ],
  count: 1,
  total: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_SERVERS}`,
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

export const aiServersAvailableResolver = () => {
  return new Response(JSON.stringify(successAvailable));
};

export const aiServersGetResolver = (
  type: "enabled" | "disabled" | "needReset" = "enabled",
) => {
  if (type === "needReset") {
    return new Response(JSON.stringify(successListNeedReset));
  }

  return new Response(
    JSON.stringify(type === "enabled" ? successList : successListDisabled),
  );
};

export const aiServersPostResolver = () => {
  return new Response(JSON.stringify(successCreate));
};

export const aiServersDeleteResolver = () => {
  return new Response(JSON.stringify(successDelete));
};

export const aiServersAvailableHandler = (port: string) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_SERVERS_AVAILABLE}`,
    () => {
      return aiServersAvailableResolver();
    },
  );
};

export const aiServersGetHandler = (
  port: string,
  type?: "enabled" | "disabled" | "needReset",
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_SERVERS}`,
    () => {
      return aiServersGetResolver(type);
    },
  );
};

export const aiServersPostHandler = (port: string) => {
  return http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_SERVERS}`,
    () => {
      return aiServersPostResolver();
    },
  );
};

export const aiServersDeleteHandler = (port: string) => {
  return http.delete(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_SERVERS}`,
    () => {
      return aiServersDeleteResolver();
    },
  );
};
