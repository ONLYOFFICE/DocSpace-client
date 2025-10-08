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

// TODO: remove in future versions
// Deprecated method, will be removed in future versions
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getUserFilter = (storageKey: string) => {
  // Disable getting filter to localStorage

  // const storageValue = localStorage.getItem(
  //   `${storageKey}&ver=${FILTER_VERSION}`,
  // );
  // const filterValue = storageValue ? JSON.parse(storageValue) : {};

  // return filterValue;

  return {};
};

// TODO: remove in future versions
// Deprecated method, will be removed in future versions
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setUserFilter = (storageKey: string, filterObj: FilterObject) => {
  // Disable saving filter to localStorage
  // const filterValue = cleanUpFilterObj(filterObj, storageKey);
  // localStorage.setItem(`${storageKey}&ver=${FILTER_VERSION}`, filterValue);
};

export const removeUserFilter = (storageKey: string) => {
  localStorage.removeItem(`${storageKey}&ver=${FILTER_VERSION}`);
};
