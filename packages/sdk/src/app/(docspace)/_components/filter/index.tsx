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

"use client";

import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";

import FilterComponent from "@docspace/shared/components/filter";
import { TSortDataItem } from "@docspace/shared/components/filter/Filter.types";
import { DeviceType } from "@docspace/shared/enums";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";

import type { FilterProps } from "./Filter.types";
import useFilesFilter from "./useFilesFilter";

export type { FilterProps };

export const Filter = observer(
  ({ filesFilter, shareKey, filesSettings }: FilterProps) => {
    const { t } = useTranslation(["Common"]);
    const { filesViewAs, setFilesViewAs } = useSettingsStore();

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
    } = useFilesFilter({
      filesFilter,
      shareKey,
      canSearchByContent: filesSettings.canSearchByContent,
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
        viewAs={filesViewAs || "row"}
        viewSelectorVisible
        getFilterData={getFilterData}
        userId=""
        isRecentFolder
        currentDeviceType={DeviceType.desktop}
        filterHeader={t("Common:AdvancedFilter")}
        placeholder={t("Common:Search")}
        view={t("Common:View")}
        filterTitle={t("Common:Filter")}
        sortByTitle={t("Common:SortBy")}
        selectorLabel=""
        isIndexing={false}
        initSearchValue={initSearchValue}
      />
    );
  },
);
