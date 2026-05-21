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

import { typeDefinition as roomsTypeDefinition } from "../api/rooms/typeDefinition";
import { typeDefinition as peopleTypeDefinition } from "../api/people/filter";
import { typeDefinition as filesTypeDefinition } from "../api/files/filter";
import { typeDefinition as groupsTypeDefinition } from "../api/groups/filter";
import {
  FILTER_VERSION,
  FILTER_SHARED_ROOM,
  FILTER_ARCHIVE_ROOM,
  FILTER_TEMPLATES_ROOM,
  FILTER_PEOPLE,
  FILTER_GUESTS,
  FILTER_INSIDE_GROUPS,
  FILTER_DOCUMENTS,
  FILTER_RECENT,
  FILTER_FAVORITES,
  FILTER_TRASH,
  FILTER_ROOM_DOCUMENTS,
  FILTER_ARCHIVE_DOCUMENTS,
  FILTER_GROUPS,
  FILTER_SHARE,
} from "./filterConstants";
import { validateAndFixObject } from "./filterValidator";

// Define a more specific type for filter objects to avoid circular dependency
interface FilterObject {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | string[]
    | FilterObject
    | (() => void);
}

const getTypeDefinition = (storageKey: string) => {
  const key = storageKey.split("=")?.[0];

  switch (key) {
    case FILTER_SHARED_ROOM:
    case FILTER_ARCHIVE_ROOM:
    case FILTER_TEMPLATES_ROOM:
      return roomsTypeDefinition;
    case FILTER_PEOPLE:
    case FILTER_GUESTS:
    case FILTER_INSIDE_GROUPS:
      return peopleTypeDefinition;
    case FILTER_DOCUMENTS:
    case FILTER_RECENT:
    case FILTER_FAVORITES:
    case FILTER_TRASH:
    case FILTER_SHARE:
    case FILTER_ROOM_DOCUMENTS:
    case FILTER_ARCHIVE_DOCUMENTS:
      return filesTypeDefinition;
    case FILTER_GROUPS:
      return groupsTypeDefinition;
    default:
      return null;
  }
};

export const cleanUpFilterObj = (filter: FilterObject, storageKey: string) => {
  const filterObject = Object.entries(filter).reduce(
    (result, [key, value]) => {
      if (typeof value === "function" || value === null || value === false) {
        return result;
      }
      result[key] = value;
      return result;
    },
    {} as Record<
      string,
      string | number | boolean | string[] | FilterObject | undefined
    >,
  );

  const typeDefinition = getTypeDefinition(storageKey);

  if (typeDefinition) {
    const validObj = validateAndFixObject(
      filterObject as Record<string, string>,
      typeDefinition,
    );

    return JSON.stringify(validObj);
  }

  return JSON.stringify(filterObject);
};

export const getUserFilter = (storageKey: string) => {
  const storageValue = localStorage.getItem(
    `${storageKey}&ver=${FILTER_VERSION}`,
  );
  const filterValue = storageValue ? JSON.parse(storageValue) : {};

  return filterValue;
};

export const setUserFilter = (storageKey: string, filterObj: FilterObject) => {
  const filterValue = cleanUpFilterObj(filterObj, storageKey);

  localStorage.setItem(`${storageKey}&ver=${FILTER_VERSION}`, filterValue);
};

export const removeUserFilter = (storageKey: string) => {
  localStorage.removeItem(`${storageKey}&ver=${FILTER_VERSION}`);
};
