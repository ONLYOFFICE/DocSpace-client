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

import type { TAPIPlugin } from "@docspace/shared/api/plugins/types";

type TPluginIdentity = Pick<TAPIPlugin, "name" | "pluginName"> & {
  personal?: boolean;
};

export type TPersonalPluginRow<TLoaded extends TPluginIdentity> = {
  own: TAPIPlugin;
  loaded?: TLoaded;
  shadowedBy?: TLoaded;
};

const isSameName = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase();

export const clashesWith = (plugin: TPluginIdentity, other: TPluginIdentity) =>
  isSameName(plugin.name, other.name) || plugin.pluginName === other.pluginName;

export const isUserPlugin = (
  plugin: Pick<TAPIPlugin, "name" | "createBy">,
  userId: string,
  name: string,
) => plugin.createBy?.id === userId && isSameName(plugin.name, name);

const baseLanguage = (language: string) => language.split("-")[0].toLowerCase();

export const getLocalizedText = (
  map: { [key: string]: string } | undefined,
  language: string,
  fallback: string,
) => {
  if (!map) return fallback;
  if (map[language]) return map[language];

  const sameLanguage = Object.keys(map).find(
    (key) => map[key] && baseLanguage(key) === baseLanguage(language),
  );

  return sameLanguage ? map[sameLanguage] : fallback;
};

export const getPersonalPluginRows = <TLoaded extends TPluginIdentity>(
  own: TAPIPlugin[],
  loaded: TLoaded[],
): TPersonalPluginRow<TLoaded>[] =>
  own.map((plugin) => ({
    own: plugin,
    loaded: loaded.find((p) => p.personal && isSameName(p.name, plugin.name)),
    shadowedBy: loaded.find((p) => !p.personal && clashesWith(plugin, p)),
  }));
