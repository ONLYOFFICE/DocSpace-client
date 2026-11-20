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

export const PLUGIN_TAB_PREFIX = "p/";

export type TProfileTabState =
  | { kind: "tab"; id: string }
  | { kind: "pending" }
  | { kind: "missing" };

export const getPluginTabId = (key: string) => `${PLUGIN_TAB_PREFIX}${key}`;

export const getProfileTabPath = (tabId: string) =>
  tabId.startsWith(PLUGIN_TAB_PREFIX)
    ? getPluginTabId(encodeURIComponent(tabId.slice(PLUGIN_TAB_PREFIX.length)))
    : tabId;

export const getProfileBasePath = (pathname: string) =>
  pathname.replace(/\/profile(\/.*)?$/, "/profile");

const decodePath = (path: string) => {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
};

export const getProfileTabId = (pathname: string) =>
  decodePath(pathname.replace(/^.*?\/profile\/?/, "").replace(/\/$/, ""));

export const resolveProfileTab = (
  tabId: string,
  tabIds: string[],
  arePluginsPending: boolean,
): TProfileTabState => {
  if (tabIds.includes(tabId)) return { kind: "tab", id: tabId };

  if (!tabId.startsWith(PLUGIN_TAB_PREFIX)) {
    return { kind: "tab", id: tabIds[0] };
  }

  return arePluginsPending ? { kind: "pending" } : { kind: "missing" };
};
