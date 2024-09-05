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

import React from "react";
import { useTranslation } from "react-i18next";

import { isTablet, isIOS } from "react-device-detect";

import { DeviceType, FilterGroups } from "../../enums";

import { TViewSelectorOption, ViewSelector } from "../view-selector";
import { Link, LinkType } from "../link";
import { SelectedItem } from "../selected-item";
import { InputSize } from "../text-input";

import FilterButton from "./sub-components/FilterButton";
import SortButton from "./sub-components/SortButton";

import { StyledFilterInput, StyledSearchInput } from "./Filter.styled";
import { FilterProps, TItem } from "./Filter.types";

const FilterInput = React.memo(
  ({
    onFilter,
    getFilterData,
    getSelectedFilterData,
    onSort,
    getSortData,
    getSelectedSortData,
    view,
    viewAs,
    viewSelectorVisible,
    getViewSettingsData,
    onChangeViewAs,
    placeholder,
    onSearch,
    getSelectedInputValue,

    filterHeader,
    selectorLabel,
    clearAll,

    removeSelectedItem,

    isRooms,
    isAccounts,
    isPeopleAccounts,
    isGroupsAccounts,
    isInsideGroup,
    filterTitle,
    sortByTitle,

    clearSearch,
    setClearSearch,

    onSortButtonClick,
    onClearFilter,
    currentDeviceType,
    userId,

    disableThirdParty,
  }: FilterProps) => {
    const [viewSettings, setViewSettings] = React.useState<
      TViewSelectorOption[]
    >([]);
    const [inputValue, setInputValue] = React.useState("");
    const [selectedFilterValue, setSelectedFilterValue] = React.useState<
      TItem[]
    >([]);
    const [selectedItems, setSelectedItems] = React.useState<TItem[]>([]);

    const { t } = useTranslation(["Common"]);

    const mountRef = React.useRef(true);
    React.useEffect(() => {
      const value = getViewSettingsData?.();

      if (value) setViewSettings(value);
    }, [getViewSettingsData]);

    React.useEffect(() => {
      if (clearSearch) {
        setInputValue("");
        onClearFilter?.();
        setClearSearch(false);
      }
    }, [clearSearch, onClearFilter, setClearSearch]);

    React.useEffect(() => {
      const value = getSelectedInputValue?.();

      setInputValue(value);
    }, [getSelectedInputValue]);

    const getSelectedFilterDataAction = React.useCallback(async () => {
      const value = await getSelectedFilterData();

      if (!mountRef.current) return;
      setSelectedFilterValue(value);

      const newSelectedItems: TItem[] = [];

      value.forEach((item) => {
        if (item.isMultiSelect && Array.isArray(item.key)) {
          const newKeys = item.key.map((oldKey: string | {}) => ({
            key:
              typeof oldKey !== "string" && "key" in oldKey && oldKey.key
                ? (oldKey.key as string)
                : (oldKey as string),
            group: item.group,
            label:
              typeof oldKey !== "string" && "label" in oldKey && oldKey.label
                ? (oldKey.label as string)
                : (oldKey as string),
          }));

          return newSelectedItems.push(...newKeys);
        }

        return newSelectedItems.push({ ...item });
      });

      setSelectedItems(newSelectedItems);
    }, [getSelectedFilterData]);

    React.useEffect(() => {
      getSelectedFilterDataAction();
    }, [getSelectedFilterDataAction, getSelectedFilterData]);

    const onClearSearch = React.useCallback(() => {
      onSearch?.("");
    }, [onSearch]);

    const removeSelectedItemAction = React.useCallback(
      (
        key: string,
        label: string | React.ReactNode,
        group?: string | FilterGroups,
      ) => {
        const newItems = selectedItems
          .map((item) => ({ ...item }))
          .filter((item) => item.key !== key);

        setSelectedItems(newItems);

        const newGroup = group as FilterGroups;

        removeSelectedItem({ key, group: newGroup });
      },
      [selectedItems, removeSelectedItem],
    );

    const onInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (isTablet && isIOS) {
        const scrollEvent = () => {
          e.preventDefault();
          e.stopPropagation();
          window.scrollTo(0, 0);
          window.onscroll = () => {};
        };

        window.onscroll = scrollEvent;
      }
    };

    React.useEffect(() => {
      return () => {
        mountRef.current = false;
      };
    }, []);

    return (
      <StyledFilterInput>
        <div className="filter-input_filter-row">
          <StyledSearchInput
            placeholder={placeholder}
            value={inputValue}
            onChange={onSearch}
            onClearSearch={onClearSearch}
            id="filter_search-input"
            size={InputSize.base}
            onFocus={onInputFocus}
          />
          <FilterButton
            id="filter-button"
            onFilter={onFilter}
            getFilterData={getFilterData}
            selectedFilterValue={selectedFilterValue}
            filterHeader={filterHeader}
            selectorLabel={selectorLabel}
            isRooms={isRooms}
            isAccounts={isAccounts}
            isPeopleAccounts={isPeopleAccounts}
            isGroupsAccounts={isGroupsAccounts}
            isInsideGroup={isInsideGroup}
            title={filterTitle}
            userId={userId}
            disableThirdParty={disableThirdParty}
          />
          <SortButton
            id="sort-by-button"
            onSort={onSort}
            getSortData={getSortData}
            getSelectedSortData={getSelectedSortData}
            view={view}
            viewAs={viewAs === "table" ? "row" : viewAs}
            viewSettings={viewSettings}
            onChangeViewAs={onChangeViewAs}
            onSortButtonClick={onSortButtonClick}
            viewSelectorVisible={
              viewSettings &&
              viewSelectorVisible &&
              currentDeviceType !== DeviceType.desktop
            }
            title={sortByTitle}
          />

          {viewSettings &&
            currentDeviceType === DeviceType.desktop &&
            viewSelectorVisible && (
              <ViewSelector
                id={
                  viewAs === "tile" ? "view-switch--row" : "view-switch--tile"
                }
                style={{ marginInlineStart: "8px" }}
                viewAs={viewAs === "table" ? "row" : viewAs}
                viewSettings={viewSettings}
                onChangeView={onChangeViewAs}
                isFilter
              />
            )}
        </div>
        {selectedItems && selectedItems.length > 0 && (
          <div className="filter-input_selected-row">
            {selectedItems.map((item) => (
              <SelectedItem
                key={`${item.key}_${item.group}`}
                propKey={Array.isArray(item.key) ? item.key[0] : item.key}
                label={item.selectedLabel ? item.selectedLabel : item.label}
                group={item.group}
                onClose={removeSelectedItemAction}
                onClick={removeSelectedItemAction}
              />
            ))}
            {selectedItems.filter((item) => item.label).length > 1 && (
              <Link
                className="clear-all-link"
                isHovered
                fontWeight={600}
                isSemitransparent
                type={LinkType.action}
                onClick={clearAll}
              >
                {t("Common:ClearAll")}
              </Link>
            )}
          </div>
        )}
      </StyledFilterInput>
    );
  },
);

FilterInput.displayName = "FilterInput";

export default FilterInput;
