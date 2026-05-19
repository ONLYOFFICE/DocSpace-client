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

"use client";

import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";

import FilterComponent from "@docspace/ui-kit/components/filter";
import renderFilterSelector from "@docspace/shared/utils/renderFilterSelector";

import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";

import useDeviceType from "@/hooks/useDeviceType";
import type { FilterProps } from "./Filter.types";
import useFilesFilter from "./useFilesFilter";

export type { FilterProps };

export const Filter = observer(({ filesFilter, shareKey }: FilterProps) => {
  const { t } = useTranslation(["Common"]);
  const { filesViewAs, setFilesViewAs } = useSettingsStore();
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
  } = useFilesFilter({
    filesFilter,
    shareKey,
    filesViewAs,
    setFilesViewAs,
  });

  const initSearchValue = getSelectedInputValue();

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
      viewAs={filesViewAs === "table" ? "row" : filesViewAs || "row"}
      viewSelectorVisible
      getFilterData={getFilterData}
      userId=""
      isRecentFolder
      currentDeviceType={currentDeviceType}
      filterHeader={t("Common:AdvancedFilter")}
      placeholder={t("Common:Search")}
      view={t("Common:View")}
      filterTitle={t("Files:Filter")}
      sortByTitle={t("Common:SortBy")}
      selectorLabel=""
      isIndexing={false}
      initSearchValue={initSearchValue}
      initSelectedFilterData={initSelectedFilterData}
      renderSelector={renderFilterSelector}
    />
  );
});
