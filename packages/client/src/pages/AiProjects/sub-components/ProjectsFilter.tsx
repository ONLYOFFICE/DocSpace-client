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

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import FilterInput from "@onlyoffice/apps-ui-kit/components/filter";
import type { FilterProps, TItem } from "@onlyoffice/apps-ui-kit/components/filter";
import { FilterGroups } from "@onlyoffice/apps-ui-kit/enums";
import type { DeviceType } from "@docspace/shared/enums";
import { AiProjectAccess } from "@docspace/shared/api/ai/projects";
import type { TAiProjectAccess } from "@docspace/shared/api/ai/projects";
import ViewRowsReactSvgUrl from "PUBLIC_DIR/images/view-rows.react.svg?url";
import ViewTilesReactSvgUrl from "PUBLIC_DIR/images/view-tiles.react.svg?url";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";

const HAS_INSTRUCTIONS = "hasInstructions";
const HAS_KNOWLEDGE = "hasKnowledge";

type ProjectsFilterProps = {
  store: AiProjectsStore;
  onCreate: () => void;
  canCreate: boolean;
  userId: string;
  currentDeviceType: DeviceType;
  isDesktop: boolean;
};

const ProjectsFilter = observer(
  ({ store, onCreate, canCreate, userId, currentDeviceType, isDesktop }: ProjectsFilterProps) => {
    const { t } = useTranslation(["Common"]);
    const [clearSearch, setClearSearch] = React.useState(false);

    const noop = React.useCallback(() => {}, []);

    // Three groups: the caller's role (one of), and the two room kinds (each
    // a yes/no). The groups reuse the Rooms filter's own group ids.
    const roleLabels = React.useMemo<Record<string, string>>(
      () => ({
        [AiProjectAccess.Owner]: t("Common:Owner"),
        [AiProjectAccess.ProjectManager]: t("Common:AIProjectManager"),
        [AiProjectAccess.Member]: t("Common:Member"),
      }),
      [t],
    );

    const getFilterData = React.useCallback(
      async (): Promise<TItem[]> => [
        {
          key: FilterGroups.roomFilterSubject,
          group: FilterGroups.roomFilterSubject,
          label: t("Common:AIProjectMyRole"),
          isHeader: true,
        },
        ...Object.entries(roleLabels).map(([access, label]) => ({
          id: `filter_role-${access}`,
          key: access,
          group: FilterGroups.roomFilterSubject,
          label,
        })),
        // The bar keeps one key per group (several only for tags), so each
        // yes/no flag is a group of its own.
        {
          key: FilterGroups.roomFilterContent,
          group: FilterGroups.roomFilterContent,
          label: t("Common:AIProjectInstructions"),
          isHeader: true,
          withoutSeparator: true,
        },
        {
          id: "filter_has-instructions",
          key: HAS_INSTRUCTIONS,
          group: FilterGroups.roomFilterContent,
          label: t("Common:AIProjectHasInstructions"),
        },
        {
          key: FilterGroups.roomFilterFolders,
          group: FilterGroups.roomFilterFolders,
          label: t("Common:Knowledge"),
          isHeader: true,
          isLast: true,
        },
        {
          id: "filter_has-knowledge",
          key: HAS_KNOWLEDGE,
          group: FilterGroups.roomFilterFolders,
          label: t("Common:AIProjectHasKnowledge"),
        },
      ],
      [t, roleLabels],
    );

    const { roleFilter, hasInstructionsFilter, hasKnowledgeFilter } = store;
    const getSelectedFilterData = React.useCallback((): TItem[] => {
      const selected: TItem[] = [];
      if (roleFilter !== AiProjectAccess.None) {
        selected.push({
          key: String(roleFilter),
          group: FilterGroups.roomFilterSubject,
          label: roleLabels[roleFilter] ?? "",
        });
      }
      if (hasInstructionsFilter) {
        selected.push({
          key: HAS_INSTRUCTIONS,
          group: FilterGroups.roomFilterContent,
          label: t("Common:AIProjectHasInstructions"),
        });
      }
      if (hasKnowledgeFilter) {
        selected.push({
          key: HAS_KNOWLEDGE,
          group: FilterGroups.roomFilterFolders,
          label: t("Common:AIProjectHasKnowledge"),
        });
      }
      return selected;
    }, [roleFilter, hasInstructionsFilter, hasKnowledgeFilter, roleLabels, t]);

    // The bar hands over the whole selection: one item per group at most.
    const onFilter = React.useCallback(
      (data: TItem[]) => {
        const has = (group: FilterGroups, key: string) =>
          data.some((item) => item.group === group && String(item.key) === key);
        const role = data.find((item) => item.group === FilterGroups.roomFilterSubject);
        store.setFilterOptions({
          role: role ? (Number(role.key) as TAiProjectAccess) : undefined,
          hasInstructions: has(FilterGroups.roomFilterContent, HAS_INSTRUCTIONS),
          hasKnowledge: has(FilterGroups.roomFilterFolders, HAS_KNOWLEDGE),
        });
      },
      [store],
    );

    const removeSelectedItem = React.useCallback(
      ({ key, group }: { key: string | number | string[]; group?: FilterGroups }) => {
        store.setFilterOptions({
          role: group === FilterGroups.roomFilterSubject ? undefined : roleFilter,
          hasInstructions: key === HAS_INSTRUCTIONS ? false : hasInstructionsFilter,
          hasKnowledge: key === HAS_KNOWLEDGE ? false : hasKnowledgeFilter,
        });
      },
      [store, roleFilter, hasInstructionsFilter, hasKnowledgeFilter],
    );

    const getSortData = React.useCallback(
      () => [
        { id: "sort-by_name", key: "AZ", label: t("Common:Name") },
        { id: "sort-by_activity", key: "DateAndTime", label: t("Common:AIProjectLastActivity") },
        { id: "sort-by_created", key: "DateAndTimeCreation", label: t("Common:ByCreation") },
      ],
      [t],
    );
    const { sortBy, sortOrder } = store;
    const getSelectedSortData = React.useCallback(
      () =>
        ({
          sortId: sortBy,
          sortDirection: sortOrder === "ascending" ? "asc" : "desc",
        }) as unknown as ReturnType<FilterProps["getSelectedSortData"]>,
      [sortBy, sortOrder],
    );
    const onSort = React.useCallback(
      (nextSortId: string, nextDirection: string) => {
        store.setSort(
          nextSortId === "AZ" || nextSortId === "DateAndTimeCreation" ? nextSortId : "DateAndTime",
          nextDirection === "asc" ? "ascending" : "descending",
        );
      },
      [store],
    );

    const { filterValue } = store;
    const getSelectedInputValue = React.useCallback(() => filterValue, [filterValue]);
    const onSearch = React.useCallback((value: string) => store.setFilterValue(value), [store]);
    const onClearFilter = React.useCallback(() => store.clearFilter(), [store]);
    const clearAll = React.useCallback(() => {
      store.clearFilter();
      setClearSearch(true);
    }, [store]);

    // The bar names the views "row" and "tile" (FilterInput maps "table" to
    // "row" itself, and in the filter it shows the one icon whose value is
    // not the current view); "row" means the table on a desktop, as in Rooms.
    const getViewSettingsData = React.useCallback(
      () => [
        { id: "view-switch_rows", value: "row", icon: ViewRowsReactSvgUrl },
        { id: "view-switch_tiles", value: "tile", icon: ViewTilesReactSvgUrl },
      ],
      [],
    );
    // Typed `() => void` in ui-kit 4.0.2 though it is called with the view;
    // the cast goes once the published type says `(view: string) => void`.
    const onChangeViewAs = React.useCallback(
      (view: string) => {
        if (view === "row") store.setViewAs(isDesktop ? "table" : "row");
        else if (view === "tile") store.setViewAs("tile");
      },
      [isDesktop, store],
    );

    const mainButtonProps = React.useMemo(
      () => ({ isDropdown: false, model: [], onAction: onCreate, text: t("Common:NewAIProject") }),
      [onCreate, t],
    );

    return (
      <FilterInput
        onFilter={onFilter as FilterProps["onFilter"]}
        getFilterData={getFilterData}
        getSelectedFilterData={getSelectedFilterData}
        onSort={onSort}
        getSortData={getSortData}
        getSelectedSortData={getSelectedSortData}
        viewAs={store.viewAs}
        viewSelectorVisible
        onChangeViewAs={onChangeViewAs as FilterProps["onChangeViewAs"]}
        getViewSettingsData={getViewSettingsData}
        onSearch={onSearch}
        onClearFilter={onClearFilter}
        getSelectedInputValue={getSelectedInputValue}
        filterHeader={t("Common:AdvancedFilter")}
        placeholder={t("Common:Search")}
        view={t("Common:View")}
        removeSelectedItem={removeSelectedItem as FilterProps["removeSelectedItem"]}
        clearAll={clearAll}
        filterTitle={t("Common:Filter")}
        sortByTitle={t("Common:SortBy")}
        clearSearch={clearSearch}
        setClearSearch={setClearSearch}
        onSortButtonClick={noop}
        currentDeviceType={currentDeviceType}
        userId={userId}
        isIndexing={false}
        isIndexEditingMode={false}
        isRecentFolder={false}
        isRooms={false}
        isContactsPage={false}
        isContactsPeoplePage={false}
        isContactsGroupsPage={false}
        isContactsInsideGroupPage={false}
        isContactsGuestsPage={false}
        selectorLabel=""
        showMainButton={canCreate && isDesktop}
        mainButtonProps={mainButtonProps}
      />
    );
  },
);

export default ProjectsFilter;
