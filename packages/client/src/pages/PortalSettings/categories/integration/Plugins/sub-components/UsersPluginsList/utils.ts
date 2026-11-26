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

import { Encoder } from "@onlyoffice/apps-ui-kit/utils/encoder";
import { EmployeeType } from "@docspace/shared/enums";
import { getUserAvatarRoleByType } from "@docspace/shared/utils/common";
import type { TMemberPlugin } from "@docspace/shared/api/plugins/types";

import { getLocalizedText } from "SRC_DIR/helpers/plugins/locale";

export type TUsersPluginsSortBy = "plugin" | "user" | "uploaded";

export type TUsersPluginsSort = {
  sortBy: TUsersPluginsSortBy;
  descending: boolean;
};

export const DEFAULT_USERS_PLUGINS_SORT: TUsersPluginsSort = {
  sortBy: "user",
  descending: false,
};

export const HIDEABLE_COLUMNS = [
  "User",
  "Version",
  "Domains",
  "Uploaded",
  "Enabled",
] as const;

export type THideableColumn = (typeof HIDEABLE_COLUMNS)[number];

const MEMBER_TYPES: Record<TMemberPlugin["createByType"], EmployeeType> = {
  DocSpaceAdmin: EmployeeType.Admin,
  RoomAdmin: EmployeeType.RoomAdmin,
  User: EmployeeType.User,
  Guest: EmployeeType.Guest,
};

export const getMemberAvatarRole = (
  plugin: Pick<TMemberPlugin, "createByType" | "createByIsOwner">,
) =>
  getUserAvatarRoleByType(
    plugin.createByIsOwner
      ? EmployeeType.Owner
      : (MEMBER_TYPES[plugin.createByType] ?? EmployeeType.Guest),
  );

export const getMemberName = (plugin: TMemberPlugin) =>
  Encoder.htmlDecode(plugin.createBy?.displayName ?? "");

export const getMemberPluginKey = (
  plugin: Pick<TMemberPlugin, "name" | "createBy">,
) => `${plugin.createBy?.id}-${plugin.name}`;

export const sortUsersPlugins = (
  items: TMemberPlugin[],
  { sortBy, descending }: TUsersPluginsSort,
  language: string,
) => {
  const collator = new Intl.Collator(language, {
    sensitivity: "base",
    numeric: true,
  });

  const title = (plugin: TMemberPlugin) =>
    getLocalizedText(plugin.nameLocale, language, plugin.name);
  const user = getMemberName;
  const uploaded = (plugin: TMemberPlugin) =>
    new Date(plugin.createOn).getTime() || 0;

  const byTitle = (a: TMemberPlugin, b: TMemberPlugin) =>
    collator.compare(title(a), title(b));
  const byUser = (a: TMemberPlugin, b: TMemberPlugin) =>
    collator.compare(user(a), user(b));

  const compare = {
    plugin: (a: TMemberPlugin, b: TMemberPlugin) =>
      byTitle(a, b) || byUser(a, b),
    user: (a: TMemberPlugin, b: TMemberPlugin) => byUser(a, b) || byTitle(a, b),
    uploaded: (a: TMemberPlugin, b: TMemberPlugin) =>
      uploaded(a) - uploaded(b) || byTitle(a, b),
  }[sortBy];

  return [...items].sort((a, b) =>
    descending ? compare(b, a) : compare(a, b),
  );
};

export const readHiddenColumns = (storageName: string): THideableColumn[] => {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(storageName) ?? "[]",
    );

    return Array.isArray(stored)
      ? HIDEABLE_COLUMNS.filter((key) => stored.includes(key))
      : [];
  } catch {
    return [];
  }
};

export const saveHiddenColumns = (
  storageName: string,
  hidden: THideableColumn[],
) => {
  try {
    localStorage.setItem(storageName, JSON.stringify(hidden));
    return true;
  } catch {
    return false;
  }
};
