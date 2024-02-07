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
}

export interface FilterButtonProps {
  onFilter: TOnFilter;
  getFilterData: TGetFilterData;
  selectedFilterValue: TItem[];
  filterHeader: string;
  selectorLabel: string;
  isRooms: boolean;
  isAccounts: boolean;
  id: string;
  title: string;
  userId: string;
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
  filterTitle: string;
  sortByTitle: string;

  clearSearch: boolean;
  setClearSearch: (value: boolean) => void;

  onSortButtonClick: TOnSortButtonClick;
  onClearFilter: () => void;
  currentDeviceType: DeviceType;
  userId: string;
}
