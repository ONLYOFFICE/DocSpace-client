// (c) Copyright Ascensio System SIA 2009-2024
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

import { DeviceType, FilterGroups } from "../../enums";
import { TViewAs } from "../../types";

import { TViewSelectorOption } from "../view-selector";
import { TOption } from "../combobox";

export type TSortDataItem = {
  id: string;
  className: string;
  key: string;
  isSelected: boolean;
  label: string;
  sortDirection: string;
  sortId: string;
};

export type TGetSortData = () => TSortDataItem[];

export type TGetSelectedSortData = () => TSortDataItem;

export type TOnChangeViewAs = () => void;

export type TOnSort = (key: string, sortDirection: string) => void;

export type TOnSortButtonClick = (value: boolean) => void;

export interface SortButtonProps {
  id: string;
  getSortData: TGetSortData;
  getSelectedSortData: TGetSelectedSortData;

  onChangeViewAs: TOnChangeViewAs;
  view: string;
  viewAs: TViewAs;
  viewSettings: TViewSelectorOption[];

  onSort: TOnSort;
  viewSelectorVisible: boolean;

  onSortButtonClick: TOnSortButtonClick;
  title: string;
}

export type TChangeFilterValue = (
  group: FilterGroups,
  key: string | string[],
  isSelected: boolean,
  label?: string,
  isMultiSelect?: boolean,
  withOptions?: boolean,
) => void;

export type TShowSelector = (selectorType: string, group: FilterGroups) => void;

export type TSelectorItem = {
  group: FilterGroups;
  isSelected?: boolean;
  selectedKey?: string;
  displaySelectorType?: string;
  key: string;
  selectedLabel?: string;
  label?: string;
};

export type TToggleButtonItem = {
  group: FilterGroups;
  key: string;
  label?: string;
  isSelected?: boolean;
  isToggle?: boolean;
};

export type TWithOptionItem = {
  group: FilterGroups;
  options: TOption[];
  withOptions?: boolean;
  id?: string;
  key?: string;
  label?: undefined;
  isSelected?: boolean;
};

export type TCheckboxItem = {
  group: FilterGroups;
  key: string;
  id: string;
  label?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  isCheckbox?: boolean;
};

export type TTagItem = {
  group: FilterGroups;
  key: string | string[];
  label?: string;
  isSelected?: boolean;
  id?: string;
  isMultiSelect?: boolean;
};

export type TGroupItem =
  | TTagItem
  | TCheckboxItem
  | TWithOptionItem
  | TSelectorItem
  | TToggleButtonItem;

export interface FilterBlockItemProps {
  group: FilterGroups;
  label: string;
  groupItem: TGroupItem[];
  isLast: boolean;
  withoutHeader: boolean;
  withoutSeparator: boolean;
  changeFilterValue: TChangeFilterValue;
  showSelector: TShowSelector;
  isFirst: boolean;
  withMultiItems: boolean;
}

export type TItem = {
  id?: string;
  key: string | string[];
  label: string;
  group: FilterGroups;
  isLast?: boolean;
  withoutHeader?: boolean;
  withoutSeparator?: boolean;
  withMultiItems?: boolean;
  isHeader?: boolean;
  isSelected?: boolean;
  groupItem?: TGroupItem[];
  selectedKey?: string;
  displaySelectorType?: string;
  isMultiSelect?: boolean;
  selectedLabel?: string;
};

export type TGetFilterData = () => Promise<TItem[]>;
export type TOnFilter = (value: TItem[] | TGroupItem[]) => void;

export interface FilterBlockProps {
  selectedFilterValue: TItem[];
  filterHeader: string;
  getFilterData: TGetFilterData;
  hideFilterBlock: () => void;
  onFilter: TOnFilter;
  selectorLabel: string;
  userId: string;
  isRooms: boolean;
  isAccounts: boolean;
  isPeopleAccounts: boolean;
  isGroupsAccounts: boolean;
  isInsideGroup: boolean;
  disableThirdParty?: boolean;
}

export interface FilterButtonProps {
  onFilter: TOnFilter;
  getFilterData: TGetFilterData;
  selectedFilterValue: TItem[];
  filterHeader: string;
  selectorLabel: string;
  isRooms: boolean;
  isAccounts: boolean;
  isPeopleAccounts: boolean;
  isGroupsAccounts: boolean;
  isInsideGroup: boolean;
  id: string;
  title: string;
  userId: string;
  disableThirdParty?: boolean;
}

export interface FilterProps {
  onFilter: TOnFilter;
  getFilterData: TGetFilterData;
  getSelectedFilterData: () => Promise<TItem[]>;
  onSort: TOnSort;
  getSortData: TGetSortData;
  getSelectedSortData: TGetSelectedSortData;
  view: string;
  viewAs: TViewAs;
  viewSelectorVisible: boolean;
  getViewSettingsData: () => TViewSelectorOption[];
  onChangeViewAs: TOnChangeViewAs;
  placeholder: string;
  onSearch: (value: string) => void;
  getSelectedInputValue: () => string;

  filterHeader: string;
  selectorLabel: string;
  clearAll: () => void;

  isRecentFolder: boolean;
  removeSelectedItem: ({
    key,
    group,
  }: {
    key: string;
    group?: FilterGroups;
  }) => void;

  isRooms: boolean;
  isAccounts: boolean;
  isPeopleAccounts: boolean;
  isGroupsAccounts: boolean;
  isInsideGroup: boolean;
  isIndexing: boolean;
  isIndexEditingMode: boolean;

  filterTitle: string;
  sortByTitle: string;

  clearSearch: boolean;
  setClearSearch: (value: boolean) => void;

  onSortButtonClick: TOnSortButtonClick;
  onClearFilter: () => void;
  currentDeviceType: DeviceType;
  userId: string;

  disableThirdParty?: boolean;
}
