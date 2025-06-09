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

import { DeviceType, FilterGroups } from "../../enums";
import { TSortBy, TViewAs } from "../../types";

import { TViewSelectorOption } from "../view-selector";
import { TOption } from "../combobox";

export type TSortDataItem = {
  id: string;
  className?: string;
  key: string;
  isSelected?: boolean;
  label: string;
  sortDirection?: string;
  sortId?: string;
};

export type TGetSortData = () => TSortDataItem[];

export type TGetSelectedSortData = () => {
  sortDirection: "asc" | "desc";
  sortId: TSortBy;
};

export type TOnChangeViewAs = () => void;

export type TOnSort = (key: string, sortDirection: string) => void;

export type TOnSortButtonClick = (value: boolean) => void;

export type TChangeFilterValue = (
  group: FilterGroups,
  key: string,
  isSelected: boolean,
  label?: string,
  isMultiSelect?: boolean,
) => void;

export type TShowSelector = (selectorType: string, group: FilterGroups) => void;

export type TSelectorItem = {
  group: FilterGroups;
  isSelected?: boolean;
  selectedKey?: string | number;
  displaySelectorType?: string;
  key: string | number;
  selectedLabel?: string;
  label?: string;
};

export type TToggleButtonItem = {
  group: FilterGroups;
  key: string | number;
  label?: string;
  isSelected?: boolean;
  isToggle?: boolean;
};

export type TWithOptionItem = {
  group: FilterGroups;
  options: TOption[];
  withOptions?: boolean;
  id?: string;
  key?: string | number;
  label?: undefined;
  isSelected?: boolean;
};

export type TCheckboxItem = {
  group: FilterGroups;
  key: string | number;
  id: string;
  label?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  isCheckbox?: boolean;
};

export type TTagItem = {
  group: FilterGroups;
  key: string | number | string[];
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
  key: string | number | string[];
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
  isCheckbox?: boolean;
};

export type TGetFilterData = () => Promise<TItem[]>;
export type TOnFilter = (value: TItem[] | TGroupItem[]) => void;

export type FilterBlockProps = {
  getFilterData: TGetFilterData;
  onFilter: TOnFilter;

  selectedFilterValue: Map<FilterGroups, Map<string | number, TItem>>;

  filterHeader: string;
  selectorLabel: string;

  hideFilterBlock: () => void;
  userId: string;
  isRooms: boolean;
  isContactsPage: boolean;
  isContactsPeoplePage: boolean;
  isContactsGroupsPage: boolean;
  isContactsInsideGroupPage: boolean;
  isContactsGuestsPage: boolean;

  isFlowsPage?: boolean;
  disableThirdParty?: boolean;
};

export type FilterButtonProps = Omit<FilterBlockProps, "hideFilterBlock"> & {
  id: string;
  title: string;
};

export type SortButtonProps = {
  id: string;
  title: string;

  getSortData: TGetSortData;
  getSelectedSortData: TGetSelectedSortData;

  onChangeViewAs: TOnChangeViewAs;
  view: string;
  viewAs: TViewAs;
  viewSettings: TViewSelectorOption[];

  onSort: TOnSort;
  viewSelectorVisible: boolean;

  onSortButtonClick: TOnSortButtonClick;
};

export type SearchInputProps = {
  onSearch: (value: string) => void;
  onClearFilter: () => void;

  clearSearch: boolean;
  setClearSearch: (value: boolean) => void;

  getSelectedInputValue: () => string;

  placeholder: string;

  isIndexEditingMode: boolean;

  initSearchValue?: string;
};

export type FilterProps = SearchInputProps &
  Omit<SortButtonProps, "id" | "title" | "viewSettings"> &
  Omit<FilterButtonProps, "id" | "title" | "selectedFilterValue"> & {
    getSelectedFilterData: () => Promise<TItem[]> | TItem[];
    getViewSettingsData: () => TViewSelectorOption[];

    clearAll: () => void;

    isRecentFolder: boolean;
    removeSelectedItem: ({
      key,
      group,
    }: {
      key: string | number;
      group?: FilterGroups;
    }) => void;

    isIndexing: boolean;

    filterTitle: string;
    sortByTitle: string;

    currentDeviceType: DeviceType;
    initSelectedFilterData?: TItem[];
  };
