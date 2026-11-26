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
import type { TAPIPlugin, TMemberPlugin } from "../../../api/plugins/types";
import { mockPlugin1, PATH_WEB_PLUGINS } from "./webplugins";

export const PATH_PERSONAL_WEB_PLUGINS = "settings/personalwebplugins";

export const MEMBER_PLUGIN_OWNER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
export const MEMBER_PLUGIN_ADMIN_ID = "admin-user-id";
export const MEMBER_PLUGIN_USER_ID = "member-user-id";

const member = (id: string, displayName: string) => ({
  ...mockPlugin1.createBy,
  id,
  displayName,
});

const memberPlugin = (
  name: string,
  title: string,
  description: string,
  overrides: Partial<TMemberPlugin>,
): TMemberPlugin => ({
  ...mockPlugin1,
  name,
  pluginName: name.replace(/-/g, ""),
  description,
  nameLocale: { en: title, "en-US": title },
  descriptionLocale: { en: description, "en-US": description },
  personal: true,
  cspDomains: "",
  url: `/storage/personalwebplugins/root/${name}/plugin.js`,
  createByType: "User",
  createByIsOwner: false,
  ...overrides,
});

export const mockMemberPlugins: TMemberPlugin[] = [
  memberPlugin(
    "weather-now",
    "Weather now",
    "Shows the current weather in Riga from the profile menu.",
    {
      version: "2.1.0",
      cspDomains: "https://api.open-meteo.com",
      createBy: member(MEMBER_PLUGIN_USER_ID, "Smirnova Anna"),
      createOn: new Date("2026-11-20T10:00:00Z"),
    },
  ),
  memberPlugin(
    "copy-item-id",
    "Copy ID",
    "Copies the ID of a file, folder or room to the clipboard.",
    {
      createBy: member(MEMBER_PLUGIN_OWNER_ID, "Administrator "),
      createByType: "DocSpaceAdmin",
      createByIsOwner: true,
      createOn: new Date("2026-11-24T10:00:00Z"),
    },
  ),
  memberPlugin(
    "editor-link",
    "Editor link",
    "Copies a direct link that opens the file in the editor.",
    {
      version: "1.3.0",
      createBy: member(MEMBER_PLUGIN_ADMIN_ID, "Admin User"),
      createByType: "DocSpaceAdmin",
      createOn: new Date("2026-11-22T10:00:00Z"),
    },
  ),
  memberPlugin(
    "task-tracker-links",
    "Task tracker links",
    "Finds Jira, GitHub and GitLab issues that mention a file or folder.",
    {
      version: "3.0.0",
      enabled: false,
      cspDomains: "https://*.atlassian.net,https://api.github.com",
      createBy: member(MEMBER_PLUGIN_USER_ID, "Smirnova Anna"),
      createOn: new Date("2026-11-21T10:00:00Z"),
    },
  ),
];

export const personalPluginsSettings = (personal: boolean) => ({
  plugins: {
    enabled: true,
    upload: true,
    delete: true,
    personal,
    personalAvailable: true,
  },
});

const pluginsUrl = (port: string) =>
  `${BASE_URL}:${port}/${API_PREFIX}/${PATH_PERSONAL_WEB_PLUGINS}/plugins`;

export const membersPluginsHandler = (
  port: string,
  plugins: TMemberPlugin[] = mockMemberPlugins,
) =>
  http.get(pluginsUrl(port), () =>
    Response.json({ response: plugins, count: plugins.length, status: 0 }),
  );

const findMemberPlugin = (params: Record<string, unknown>) =>
  mockMemberPlugins.find(
    (p) => p.createBy.id === params.userId && p.name === params.name,
  );

export const memberPluginUpdateHandler = (port: string) =>
  http.put(
    `${pluginsUrl(port)}/:userId/:name`,
    async ({ params, request }) => {
      const { enabled } = (await request.json()) as { enabled: boolean };
      const plugin = findMemberPlugin(params);

      if (!plugin) return new Response(null, { status: 404 });

      return Response.json({ response: { ...plugin, enabled }, status: 0 });
    },
  );

export const memberPluginDeleteHandler = (port: string) =>
  http.delete(`${pluginsUrl(port)}/:userId/:name`, ({ params }) =>
    findMemberPlugin(params)
      ? Response.json({ response: null, status: 0 })
      : new Response(null, { status: 404 }),
  );

export const mockOwnPersonalPlugin: TAPIPlugin = {
  ...mockPlugin1,
  name: "my-notes",
  pluginName: "MyNotes",
  version: "1.0.0",
  description: "Keeps short notes for yourself.",
  nameLocale: { en: "My notes", "en-US": "My notes" },
  descriptionLocale: {
    en: "Keeps short notes for yourself.",
    "en-US": "Keeps short notes for yourself.",
  },
  scopes: "ContextMenu",
  url: "/plugins/my-notes/plugin.js",
  runtime: "module",
  personal: true,
  cspDomains: "",
};

const ownPluginSource = `export default {
  status: "active",
  onLoadCallback: async () => {},
  setOnLoadCallback() {},
  updateStatus(status) { this.status = status; },
  getStatus() { return this.status; },
  getContextMenuItems: () => new Map(),
};`;

const isPersonal = (request: Request) =>
  new URL(request.url).searchParams.get("personal") === "true";

const shadows = (portalPlugin: TAPIPlugin, plugin: TAPIPlugin) =>
  portalPlugin.name.toLowerCase() === plugin.name.toLowerCase() ||
  portalPlugin.pluginName === plugin.pluginName;

export const ownPersonalPluginsHandlers = (
  port: string,
  own: TAPIPlugin[] = [],
  portal: TAPIPlugin[] = [],
) => {
  const plugins = [...own];
  const url = `${BASE_URL}:${port}/${API_PREFIX}/${PATH_WEB_PLUGINS}`;

  return [
    http.get(url, ({ request }) => {
      const list = isPersonal(request)
        ? plugins
        : [
            ...portal,
            ...plugins.filter((p) => !portal.some((x) => shadows(x, p))),
          ];

      return Response.json({ response: list, count: list.length, status: 0 });
    }),
    http.delete(`${url}/:name`, ({ request, params }) => {
      if (!isPersonal(request)) return new Response(null, { status: 403 });

      const index = plugins.findIndex((p) => p.name === params.name);
      if (index === -1) return new Response(null, { status: 404 });

      plugins.splice(index, 1);

      return Response.json({ status: 0 });
    }),
    http.post(url, ({ request }) => {
      if (!isPersonal(request)) return new Response(null, { status: 403 });

      plugins.push(mockOwnPersonalPlugin);

      return Response.json({ response: mockOwnPersonalPlugin, status: 0 });
    }),
    http.get(
      `*${mockOwnPersonalPlugin.url}`,
      () =>
        new Response(ownPluginSource, {
          headers: { "Content-Type": "application/javascript; charset=utf-8" },
        }),
    ),
  ];
};

export const personalPluginsSwitchHandler = (port: string) =>
  http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_PERSONAL_WEB_PLUGINS}`,
    async ({ request }) => {
      const { enabled } = (await request.json()) as { enabled: boolean };

      return Response.json({
        response: personalPluginsSettings(enabled).plugins,
        status: 0,
      });
    },
  );
