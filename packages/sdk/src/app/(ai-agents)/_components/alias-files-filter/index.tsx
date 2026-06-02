// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import FilterComponent from "@docspace/ui-kit/components/filter";
import renderFilterSelector from "@docspace/shared/utils/renderFilterSelector";
import type { MainButtonProps } from "@docspace/ui-kit/components/main-button/MainButton.types";

import useDeviceType from "@/hooks/useDeviceType";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";

import useAliasFilesFilter, {
  type AliasFilterConfig,
} from "./useAliasFilesFilter";

type Props = {
  config: AliasFilterConfig;
  showMainButton?: boolean;
  mainButtonProps?: MainButtonProps;
  mainButtonIcon?: React.ReactNode;
  // When true, render the filter bar even if the alias is currently empty
  // — needed for surfaces where the main button (e.g. Knowledge upload)
  // is the empty-state CTA and must stay reachable.
  alwaysVisible?: boolean;
};

// Generic files-alias filter — wraps ui-kit FilterComponent and drives it
// from useAliasFilesFilter. Caller passes a per-alias config (Recent /
// Favorites / …); see `recent-files-filter` and `favorites-files-filter`
// route slot pages for the concrete bindings.
const AliasFilesFilter = observer(
  ({
    config,
    showMainButton,
    mainButtonProps,
    mainButtonIcon,
    alwaysVisible = false,
  }: Props) => {
    const { t } = useTranslation(["Common"]);
    const store = config.useStore();
    const settingsStore = useSettingsStore();
    const { currentDeviceType } = useDeviceType();

    const {
      getFilterData,
      getSortData,
      getViewSettingsData,
      onClearFilter,
      onSearch,
      getSelectedInputValue,
      getSelectedSortData,
      onSort,
      clearAll,
      onFilter,
      getSelectedFilterData,
      removeSelectedItem,
      onChangeViewAs,
      initSelectedFilterData,
    } = useAliasFilesFilter(config);

    const initSearchValue = getSelectedInputValue();

    // Hide the filter bar entirely when the alias is genuinely empty (no
    // active filter, no loading, no items). There's nothing to filter, and
    // rendering an empty search/sort row above the EmptyView looks noisy.
    // Bail-out is intentionally placed AFTER all hooks (useAliasFilesFilter
    // owns useCallback/useMemo internally) — an early return upstream would
    // break Rules of Hooks on transitions.
    if (
      !alwaysVisible &&
      !store.isLoading &&
      !store.hasActiveFilter &&
      store.files.length === 0
    ) {
      return null;
    }

    return (
      <FilterComponent
        onSearch={onSearch}
        onChangeViewAs={onChangeViewAs}
        onClearFilter={onClearFilter}
        onFilter={onFilter}
        onSort={onSort}
        onSortButtonClick={() => {}}
        clearSearch={false}
        setClearSearch={() => {}}
        getSelectedFilterData={getSelectedFilterData}
        getViewSettingsData={getViewSettingsData}
        clearAll={clearAll}
        removeSelectedItem={removeSelectedItem}
        isRooms={false}
        isContactsPage={false}
        isContactsPeoplePage={false}
        isContactsGroupsPage={false}
        isContactsInsideGroupPage={false}
        isContactsGuestsPage={false}
        getSelectedInputValue={getSelectedInputValue}
        isIndexEditingMode={false}
        getSortData={getSortData}
        getSelectedSortData={getSelectedSortData}
        viewAs={
          (settingsStore.filesViewAs ?? "row") === "table"
            ? "row"
            : (settingsStore.filesViewAs ?? "row")
        }
        viewSelectorVisible
        getFilterData={getFilterData}
        userId=""
        isRecentFolder={!!config.isRecentFolder}
        currentDeviceType={currentDeviceType}
        filterHeader={t("Common:AdvancedFilter", {
          defaultValue: "Advanced filter",
        })}
        placeholder={t("Common:Search", { defaultValue: "Search" })}
        view={t("Common:View", { defaultValue: "View" })}
        filterTitle={t("Common:Filter", { defaultValue: "Filter" })}
        sortByTitle={t("Common:SortBy", { defaultValue: "Sort by" })}
        selectorLabel=""
        isIndexing={false}
        initSearchValue={initSearchValue}
        initSelectedFilterData={initSelectedFilterData}
        renderSelector={renderFilterSelector}
        showMainButton={showMainButton}
        mainButtonProps={mainButtonProps}
        mainButtonIcon={mainButtonIcon}
      />
    );
  },
);

export default AliasFilesFilter;
