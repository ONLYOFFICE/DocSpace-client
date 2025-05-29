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

import React from "react";
import { useTranslation } from "react-i18next";

import { DeviceType, FilterGroups } from "../../enums";

import { TViewSelectorOption, ViewSelector } from "../view-selector";
import { Link, LinkType } from "../link";
import { SelectedItem } from "../selected-item";

import FilterButton from "./sub-components/FilterButton";
import SortButton from "./sub-components/SortButton";

import useSearch from "./hooks/useSearch";

import styles from "./Filter.module.scss";
import { FilterProps, TItem } from "./Filter.types";
import {
  convertFilterDataToSelectedFilterValues,
  convertFilterDataToSelectedItems,
  replaceEqualFilterValuesWithPrev,
} from "./Filter.utils";

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
    isContactsPage,
    isContactsPeoplePage,
    isContactsGroupsPage,
    isContactsInsideGroupPage,
    isContactsGuestsPage,
    isFlowsPage,
    isIndexing,
    isIndexEditingMode,

    filterTitle,
    sortByTitle,

    clearSearch,
    setClearSearch,

    onSortButtonClick,
    onClearFilter,
    currentDeviceType,
    userId,

    disableThirdParty,

    initSearchValue,
    initSelectedFilterData,
  }: FilterProps) => {
    const { searchComponent } = useSearch({
      onSearch,
      onClearFilter,
      clearSearch,
      setClearSearch,
      getSelectedInputValue,
      placeholder,
      isIndexEditingMode,
      initSearchValue,
    });

    const [viewSettings, setViewSettings] = React.useState<
      TViewSelectorOption[]
    >(getViewSettingsData());
    const [selectedFilterValue, setSelectedFilterValue] = React.useState<
      Map<FilterGroups, Map<string | number, TItem>>
    >(() =>
      initSelectedFilterData
        ? convertFilterDataToSelectedFilterValues(initSelectedFilterData)
        : new Map(),
    );
    const [selectedItems, setSelectedItems] = React.useState<TItem[]>(() =>
      initSelectedFilterData
        ? convertFilterDataToSelectedItems(initSelectedFilterData)
        : [],
    );
    const currentSelectedFilterDataRef = React.useRef<TItem[] | null>(
      initSelectedFilterData || null,
    );

    const { t } = useTranslation(["Common"]);

    const mountRef = React.useRef(true);

    const isFirstRenderRef = React.useRef(true);

    React.useEffect(() => {
      const value = getViewSettingsData?.();

      if (value) setViewSettings(value);
    }, [getViewSettingsData]);

    const getSelectedFilterDataAction = React.useCallback(async () => {
      const newSelectedFilterData = await getSelectedFilterData();
      const processedFilterData = replaceEqualFilterValuesWithPrev(
        currentSelectedFilterDataRef.current,
        newSelectedFilterData,
      );

      currentSelectedFilterDataRef.current = processedFilterData;

      if (!mountRef.current) return;

      const newSelectedValue =
        convertFilterDataToSelectedFilterValues(processedFilterData);
      const newSelectedItems =
        convertFilterDataToSelectedItems(processedFilterData);

      setSelectedFilterValue(newSelectedValue);
      setSelectedItems(newSelectedItems);
    }, [getSelectedFilterData]);

    React.useEffect(() => {
      if (isFirstRenderRef.current && currentSelectedFilterDataRef.current) {
        return;
      }

      getSelectedFilterDataAction();
    }, [getSelectedFilterDataAction]);

    const removeSelectedItemAction = React.useCallback(
      (
        key: string | number,
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

    React.useEffect(() => {
      mountRef.current = true;

      return () => {
        mountRef.current = false;
      };
    }, []);

    React.useEffect(() => {
      isFirstRenderRef.current = false;
    }, []);

    return (
      <div className={styles.filterInput}>
        <div className="filter-input_filter-row">
          {searchComponent}
          {!isIndexEditingMode && !isFlowsPage ? (
            <FilterButton
              id="filter-button"
              onFilter={onFilter}
              getFilterData={getFilterData}
              selectedFilterValue={selectedFilterValue}
              filterHeader={filterHeader}
              selectorLabel={selectorLabel}
              isRooms={isRooms}
              isContactsPage={isContactsPage}
              isContactsPeoplePage={isContactsPeoplePage}
              isContactsGroupsPage={isContactsGroupsPage}
              isContactsInsideGroupPage={isContactsInsideGroupPage}
              isContactsGuestsPage={isContactsGuestsPage}
              title={filterTitle}
              userId={userId}
              disableThirdParty={disableThirdParty}
            />
          ) : null}

          {!isIndexing && !isFlowsPage ? (
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
                viewSettings && viewSelectorVisible
                  ? currentDeviceType !== DeviceType.desktop
                  : false
              }
              title={sortByTitle}
            />
          ) : null}
          {viewSettings &&
          !isIndexing &&
          !isFlowsPage &&
          currentDeviceType === DeviceType.desktop &&
          viewSelectorVisible ? (
            <ViewSelector
              id={viewAs === "tile" ? "view-switch--row" : "view-switch--tile"}
              className={styles.viewSelector}
              style={{ marginInlineStart: "8px" }}
              viewAs={viewAs === "table" ? "row" : viewAs}
              viewSettings={viewSettings}
              onChangeView={onChangeViewAs}
              isFilter
            />
          ) : null}
        </div>
        {selectedItems && selectedItems.length > 0 ? (
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
            {selectedItems.filter((item) => item.label).length > 1 ? (
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
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

FilterInput.displayName = "FilterInput";

export default FilterInput;
