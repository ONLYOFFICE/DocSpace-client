import React from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

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

    isRecentTab,
    removeSelectedItem,

    isRooms,
    isAccounts,
    filterTitle,
    sortByTitle,

    clearSearch,
    setClearSearch,

    onSortButtonClick,
    onClearFilter,
    currentDeviceType,
    userId,
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
    const { interfaceDirection } = useTheme();
    const styleViewSelector =
      interfaceDirection === "rtl"
        ? { marginRight: "8px" }
        : { marginLeft: "8px" };
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
            title={filterTitle}
            userId={userId}
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

          {((viewSettings &&
            currentDeviceType === DeviceType.desktop &&
            viewSelectorVisible) ||
            isRecentTab) && (
            <ViewSelector
              id={viewAs === "tile" ? "view-switch--row" : "view-switch--tile"}
              style={styleViewSelector}
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
