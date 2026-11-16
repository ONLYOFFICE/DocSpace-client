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

type TMenuEntry = { key?: string | number; isSeparator?: boolean };

const MAX_PLUGIN_ITEMS_IN_MENU = 2;

export const groupProfilePluginItems = <T extends TMenuEntry>(
  items: T[],
  toSubmenu: (items: T[]) => T,
): T[] =>
  items.length > MAX_PLUGIN_ITEMS_IN_MENU ? [toSubmenu(items)] : items;

export const placeProfilePluginItems = <T extends TMenuEntry>(
  actions: T[],
  pluginItems: T[],
  separators: [before: T, after: T],
  { beforeKeys, endKey }: { beforeKeys: string[]; endKey: string },
): T[] => {
  if (pluginItems.length === 0) return actions;

  const indexOf = (keys: string[]) =>
    actions.findIndex(({ key }) => keys.includes(String(key)));

  const anchor = [indexOf(beforeKeys), indexOf([endKey])].find(
    (index) => index !== -1,
  );
  const insertAt = anchor ?? actions.length;
  const before = actions.slice(0, insertAt);
  const after = actions.slice(insertAt);
  const separatorBefore = before.length > 0 && !before.at(-1)?.isSeparator;
  const separatorAfter =
    after.length > 0 && !after[0].isSeparator && after[0].key !== endKey;

  return [
    ...before,
    ...(separatorBefore ? [separators[0]] : []),
    ...pluginItems,
    ...(separatorAfter ? [separators[1]] : []),
    ...after,
  ];
};
