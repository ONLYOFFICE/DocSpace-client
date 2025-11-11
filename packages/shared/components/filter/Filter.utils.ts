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

import find from "lodash/find";
import result from "lodash/result";

import { FilterGroups, FilterKeys } from "../../enums";

import { TGroupItem, TItem } from "./Filter.types";

export const syncGroupManagerCheckBox = (filterData: TItem[]) => {
  const filterGroupManager = filterData.find(
    (item) => item.group === FilterGroups.groupsFilterManager,
  );

  if (!filterGroupManager) return;

  const filterGroupMember = filterData.find(
    (item) => item.group === FilterGroups.groupsFilterMember,
  );

  if (!filterGroupMember) return;

  const isSomeMemberSelected = filterGroupMember.groupItem?.some(
    (item) => item.isSelected,
  );

  const checkBoxItem = filterGroupManager.groupItem?.[0];

  if (checkBoxItem && "isDisabled" in checkBoxItem) {
    checkBoxItem.isDisabled = !isSomeMemberSelected;
  }
};

export const removeGroupManagerFilterValueIfNeeded = (
  filterValues: TGroupItem[],
): TGroupItem[] => {
  const filterManager = filterValues.find(
    (item) => item.key === FilterKeys.byManager,
  );

  if (!filterManager) return filterValues;

  const hasFilterGroupMember = filterValues.some(
    (item) => item.group === FilterGroups.groupsFilterMember,
  );

  if (!hasFilterGroupMember) {
    return filterValues.filter(
      (item) => item.group !== FilterGroups.groupsFilterManager,
    );
  }

  return filterValues;
};

const getFilterType = (filterValues: TGroupItem[] | TItem[]) => {
  const filterType = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterType;
    }),
    "key",
  );

  return filterType?.toString() ? +filterType : null;
};

const getFilterLocation = (filterValues: TGroupItem[] | TItem[]) => {
  const filterType = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterLocation;
    }),
    "key",
  );

  return filterType?.toString() ? +filterType : null;
};

const getSubjectFilter = (filterValues: TGroupItem[] | TItem[]) => {
  const subjectFilter = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.roomFilterOwner;
    }),
    "key",
  );

  return subjectFilter?.toString() ? subjectFilter?.toString() : null;
};

const getAuthorType = (filterValues: TGroupItem[] | TItem[]) => {
  const authorType = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterAuthor;
    }),
    "key",
  );

  return authorType || null;
};

const getSharedBy = (filterValues: TGroupItem[] | TItem[]) => {
  const sharedBy = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterSharedBy;
    }),
    "key",
  );

  return sharedBy || null;
};

const getRoomId = (filterValues: TGroupItem[] | TItem[]) => {
  const filterRoomId = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterRoom;
    }),
    "key",
  );

  return filterRoomId || null;
};

const getSearchParams = (filterValues: TGroupItem[] | TItem[]) => {
  const searchParams = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterFolders;
    }),
    "key",
  );

  return searchParams || FilterKeys.excludeSubfolders;
};

const getType = (filterValues: TGroupItem[] | TItem[]) => {
  const filterType = filterValues.find(
    (value) => value.group === FilterGroups.roomFilterType,
  )?.key;

  const type = filterType;

  return type;
};

const getProviderType = (filterValues: TGroupItem[] | TItem[]) => {
  const filterType = filterValues.find(
    (value) => value.group === FilterGroups.roomFilterProviderType,
  )?.key;

  const type = filterType;

  return type;
};

const getSubjectId = (filterValues: TGroupItem[] | TItem[]) => {
  const filterOwner = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.roomFilterSubject;
    }),
    "key",
  );

  return filterOwner || null;
};

const getFilterContent = (filterValues: TGroupItem[] | TItem[]) => {
  const filterContent = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterContent;
    }),
    "key",
  );

  return filterContent || null;
};

const getTags = (filterValues: TGroupItem[] | TItem[]) => {
  const filterTags = filterValues.find(
    (value) => value.group === FilterGroups.roomFilterTags,
  )?.key;

  const tags =
    Array.isArray(filterTags) && filterTags?.length > 0 ? filterTags : null;

  return tags;
};

const getQuotaFilter = (filterValues: TGroupItem[] | TItem[]) => {
  const filterType = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterQuota;
    }),
    "key",
  );

  return filterType?.toString() ? +filterType : null;
};

const convertFilterDataToSelectedFilterValues = (
  filterData: TItem[],
): Map<FilterGroups, Map<string | number, TItem>> => {
  const newValue: Map<FilterGroups, Map<string | number, TItem>> = new Map();

  filterData.forEach((item) => {
    const groupItems = Array.isArray(item.key)
      ? (item.key.map((key) => ({
          key,
          group: item.group,
          label: key,
        })) as TItem[])
      : [item];

    if (!newValue.has(item.group)) {
      const groupItemsMap = new Map(
        groupItems.map((groupItem) => [groupItem.key as string, groupItem]),
      );

      newValue.set(item.group, groupItemsMap);
    } else {
      groupItems.forEach((groupItem) => {
        newValue.get(item.group)?.set(groupItem.key as string, groupItem);
      });
    }
  });

  return newValue;
};

const convertFilterDataToSelectedItems = (filterData: TItem[]): TItem[] => {
  const newSelectedItems: TItem[] = [];

  filterData.forEach((item) => {
    const groupItems = Array.isArray(item.key)
      ? (item.key.map((key) => ({
          key,
          group: item.group,
          label: key,
        })) as TItem[])
      : [item];

    newSelectedItems.push(...groupItems);
  });

  return newSelectedItems;
};

const replaceEqualFilterValuesWithPrev = (
  prevFilterValues: TItem[] | null,
  newFilterValues: TItem[],
): TItem[] => {
  if (!prevFilterValues) return newFilterValues;

  const items = prevFilterValues.map((v) => {
    const item = newFilterValues.find((f) => f.group === v.group);

    if (item) {
      if (item.isMultiSelect && Array.isArray(item.key)) {
        let isEqual = true;

        item.key.forEach((k) => {
          if (!Array.isArray(v.key) || !v.key.includes(k)) {
            isEqual = false;
          }
        });

        if (isEqual) return item;

        return false;
      }
      if (item.key === v.key) return item;
      return false;
    }
    return false;
  });

  const newItems = newFilterValues.filter(
    (v) => !items.find((i) => i && i.group === v.group),
  );

  items.push(...newItems);

  return [...items.filter((i) => i !== false)];
};

export {
  getFilterType,
  getSharedBy,
  getFilterLocation,
  getSubjectFilter,
  getAuthorType,
  getRoomId,
  getSearchParams,
  getType,
  getProviderType,
  getSubjectId,
  getFilterContent,
  getTags,
  getQuotaFilter,
  convertFilterDataToSelectedFilterValues,
  convertFilterDataToSelectedItems,
  replaceEqualFilterValuesWithPrev,
};
