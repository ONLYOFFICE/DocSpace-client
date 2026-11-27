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

import type { Page } from "@playwright/test";
import { http } from "msw";

import type { TAPIPlugin } from "@docspace/shared/api/plugins/types";
import {
  mockWorkspaceAppPlugin,
  webPluginsListHandler,
} from "@docspace/shared/__mocks__/handlers";

import { TEST_PORT } from "../fixtures/base";

type TFakePlugin = { name: string; enabled?: boolean };

const fakePluginManifest = (
  plugin: TFakePlugin,
  scopes: string,
): TAPIPlugin => ({
  ...mockWorkspaceAppPlugin,
  name: plugin.name,
  version: "1.0.0",
  description: `${plugin.name} description`,
  pluginName: plugin.name.replace(/-/g, ""),
  scopes,
  image: "icon.svg",
  url: `/plugins/${plugin.name}/plugin.js`,
  enabled: plugin.enabled ?? true,
  settings: "",
});

export const fakePlugins = <T extends TFakePlugin>(
  plugins: T[],
  scopes: string,
  source: (plugin: T) => string,
  iconSvg?: string,
) => [
  webPluginsListHandler(
    TEST_PORT,
    plugins.map((plugin) => fakePluginManifest(plugin, scopes)),
  ),
  ...plugins.map((plugin) =>
    http.get(
      `*/plugins/${plugin.name}/plugin.js`,
      () =>
        new Response(source(plugin), {
          headers: { "Content-Type": "application/javascript; charset=utf-8" },
        }),
    ),
  ),
  ...(iconSvg
    ? [
        http.get(
          "*/plugins/:pluginName/assets/icon.svg",
          () =>
            new Response(iconSvg, {
              headers: { "Content-Type": "image/svg+xml" },
            }),
        ),
      ]
    : []),
];

export const openWithPlugins = async (
  page: Page,
  url: string,
  plugins: TFakePlugin[],
) => {
  const loaded = plugins.map(({ name }) =>
    page.waitForResponse(`**/plugins/${name}/plugin.js`),
  );
  await page.goto(url);
  await Promise.all(loaded);
};
