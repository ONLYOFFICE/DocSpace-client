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
import { useTranslation } from "react-i18next";

import FilterInput from "@onlyoffice/apps-ui-kit/components/filter";
import type { TGroupItem, TItem } from "@onlyoffice/apps-ui-kit/components/filter";
import { FilterGroups } from "@onlyoffice/apps-ui-kit/enums";
import type { DeviceType } from "@docspace/shared/enums";

import {
  KNOWLEDGE_FILTER_KEY,
  SKILLS_FILTER_KEY,
  type TProjectsQuery,
  type TProjectsSortId,
} from "../utils";

type ProjectsFilterProps = {
  query: TProjectsQuery;
  onChange: (query: TProjectsQuery) => void;
  onCreate: () => void;
  canCreate: boolean;
  userId: string;
  currentDeviceType: DeviceType;
  isDesktop: boolean;
};

const SOURCES_GROUP = FilterGroups.filterOther;

/**
 * The filter row of the AI Projects page: the portal's FilterInput with the
 * "New project" main button, a name search, a "Sources" filter (projects
 * with a skills room, with a knowledge base) and a sort by name or date.
 * The page owns the query; this only translates it to and from the bar.
 */
const ProjectsFilter = ({
  query,
  onChange,
  onCreate,
  canCreate,
  userId,
  currentDeviceType,
  isDesktop,
}: ProjectsFilterProps) => {
  const { t } = useTranslation(["Common"]);
  const [clearSearch, setClearSearch] = React.useState(false);

  // The bar re-reads its getters whenever their identity changes, so they
  // read the latest query through a ref and stay stable otherwise.
  const queryRef = React.useRef(query);
  queryRef.current = query;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const update = React.useCallback((patch: Partial<TProjectsQuery>) => {
    onChangeRef.current({ ...queryRef.current, ...patch });
  }, []);

  const skillsLabel = t("Common:AIProjectSkills");
  const knowledgeLabel = t("Common:Knowledge");

  const getFilterData = React.useCallback(
    async (): Promise<TItem[]> => [
      {
        key: SOURCES_GROUP,
        group: SOURCES_GROUP,
        label: t("Common:AIProjectSources"),
        isHeader: true,
        isLast: true,
      },
      {
        id: "filter_ai-projects-skills",
        key: SKILLS_FILTER_KEY,
        group: SOURCES_GROUP,
        label: skillsLabel,
        isMultiSelect: true,
      },
      {
        id: "filter_ai-projects-knowledge",
        key: KNOWLEDGE_FILTER_KEY,
        group: SOURCES_GROUP,
        label: knowledgeLabel,
        isMultiSelect: true,
      },
    ],
    [t, skillsLabel, knowledgeLabel],
  );

  const { withSkills, withKnowledge } = query;
  const getSelectedFilterData = React.useCallback((): TItem[] => {
    const items: TItem[] = [];
    if (withSkills) {
      items.push({
        key: SKILLS_FILTER_KEY,
        group: SOURCES_GROUP,
        label: skillsLabel,
        isMultiSelect: true,
      });
    }
    if (withKnowledge) {
      items.push({
        key: KNOWLEDGE_FILTER_KEY,
        group: SOURCES_GROUP,
        label: knowledgeLabel,
        isMultiSelect: true,
      });
    }
    return items;
  }, [withSkills, withKnowledge, skillsLabel, knowledgeLabel]);

  const onFilter = React.useCallback(
    (items: TItem[] | TGroupItem[]) => {
      const keys = new Set<unknown>();
      for (const item of items) {
        if (Array.isArray(item.key)) item.key.forEach((key) => keys.add(key));
        else keys.add(item.key);
      }
      update({
        withSkills: keys.has(SKILLS_FILTER_KEY),
        withKnowledge: keys.has(KNOWLEDGE_FILTER_KEY),
      });
    },
    [update],
  );

  const removeSelectedItem = React.useCallback(
    ({ key }: { key: string | number }) => {
      if (key === SKILLS_FILTER_KEY) update({ withSkills: false });
      if (key === KNOWLEDGE_FILTER_KEY) update({ withKnowledge: false });
    },
    [update],
  );

  const clearAll = React.useCallback(() => {
    update({ withSkills: false, withKnowledge: false, search: "" });
    setClearSearch(true);
  }, [update]);

  const getSortData = React.useCallback(
    () => [
      { id: "sort-by_name", key: "AZ", label: t("Common:Name") },
      { id: "sort-by_created", key: "DateAndTime", label: t("Common:ByCreation") },
    ],
    [t],
  );

  const { sortId, sortDirection } = query;
  const getSelectedSortData = React.useCallback(
    () => ({ sortId, sortDirection }),
    [sortId, sortDirection],
  );

  const onSort = React.useCallback(
    (nextSortId: string, nextDirection: string) => {
      update({
        sortId: nextSortId as TProjectsSortId,
        sortDirection: nextDirection === "asc" ? "asc" : "desc",
      });
    },
    [update],
  );

  const search = query.search;
  const getSelectedInputValue = React.useCallback(() => search, [search]);
  const onSearch = React.useCallback(
    (value: string) => update({ search: value }),
    [update],
  );
  const onClearFilter = React.useCallback(
    () => update({ search: "" }),
    [update],
  );

  const getViewSettingsData = React.useCallback(() => [], []);
  const noop = React.useCallback(() => {}, []);

  const mainButtonProps = React.useMemo(
    () => ({
      isDropdown: false,
      model: [],
      onAction: onCreate,
      text: t("Common:NewAIProject"),
    }),
    [onCreate, t],
  );

  return (
    <FilterInput
      onFilter={onFilter}
      getFilterData={getFilterData}
      getSelectedFilterData={getSelectedFilterData}
      onSort={onSort}
      getSortData={getSortData}
      getSelectedSortData={getSelectedSortData}
      viewAs="tile"
      viewSelectorVisible={false}
      onChangeViewAs={noop}
      getViewSettingsData={getViewSettingsData}
      onSearch={onSearch}
      onClearFilter={onClearFilter}
      getSelectedInputValue={getSelectedInputValue}
      filterHeader={t("Common:AdvancedFilter")}
      placeholder={t("Common:Search")}
      view={t("Common:View")}
      removeSelectedItem={removeSelectedItem}
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
};

export default ProjectsFilter;
