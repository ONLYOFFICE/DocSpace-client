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
import { FilterGroups, FilterKeys, FilterSelectorTypes } from "@onlyoffice/apps-ui-kit/enums";
import RoomSelector from "@onlyoffice/apps-ui-kit/selectors/Room";
import type { SelectorRenderProps } from "@onlyoffice/apps-ui-kit/components/filter/Filter.types";
import type { DeviceType } from "@docspace/shared/enums";
import { INSTRUCTIONS_ROOM_TYPE, KNOWLEDGE_ROOM_TYPE } from "@docspace/shared/api/ai/projects";
import renderFilterSelector from "@docspace/shared/utils/renderFilterSelector";
import ViewRowsReactSvgUrl from "PUBLIC_DIR/images/view-rows.react.svg?url";
import ViewTilesReactSvgUrl from "PUBLIC_DIR/images/view-tiles.react.svg?url";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import type { TAiProjectsFilterEntity } from "SRC_DIR/store/AiProjectsStore";

const SELECT_INSTRUCTIONS_ROOM = "filter_instructions-room";
const SELECT_KNOWLEDGE_ROOM = "filter_knowledge-room";

// The group of each room kind, and the room type its selector offers.
const INSTRUCTIONS_GROUP = FilterGroups.roomFilterContent;
const KNOWLEDGE_GROUP = FilterGroups.roomFilterFolders;

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

    const instructionsTitle = t("Common:AIProjectInstructions");
    const knowledgeTitle = t("Common:Knowledge");

    // The owner opens the people selector of the Rooms filter; a room kind's
    // "Select room" opens the room selector limited to that kind.
    const renderSelector = React.useCallback(
      (props: SelectorRenderProps): React.ReactNode => {
        if (props.selectorType !== FilterSelectorTypes.rooms) return renderFilterSelector(props);
        const isInstructions = props.group === INSTRUCTIONS_GROUP;
        return (
          <RoomSelector
            className="room-selector"
            onSubmit={props.onSubmit}
            withHeader
            headerProps={{
              onBackClick: props.onBackClick,
              onCloseClick: props.onCloseClick,
              headerLabel: isInstructions ? t("Common:InstructionsRooms") : t("Common:AIProjectKnowledgeRooms"),
              withoutBackButton: false,
              withoutBorder: false,
            }}
            isMultiSelect={false}
            withSearch
            roomType={isInstructions ? INSTRUCTIONS_ROOM_TYPE : KNOWLEDGE_ROOM_TYPE}
          />
        );
      },
      [t],
    );

    // The owner (the caller, or a user picked in the people selector, as in
    // Rooms) and, for each room kind, one linked room picked in the room
    // selector. The groups reuse the Rooms filter's own group ids.
    const getFilterData = React.useCallback(
      async (): Promise<TItem[]> => [
        {
          key: FilterGroups.roomFilterOwner,
          group: FilterGroups.roomFilterOwner,
          label: t("Common:Owner"),
          isHeader: true,
          withoutSeparator: true,
          withMultiItems: true,
        },
        {
          id: "filter_owner-me",
          key: FilterKeys.me,
          group: FilterGroups.roomFilterOwner,
          label: t("Common:MeLabel"),
        },
        {
          id: "filter_owner-user",
          key: FilterKeys.user,
          group: FilterGroups.roomFilterOwner,
          // Shows the picked user's name; the bar fills it in.
          label: "",
          displaySelectorType: "link",
        },
        {
          id: "filter_owner-other",
          key: FilterKeys.other,
          group: FilterGroups.roomFilterOwner,
          label: t("Common:SelectAction"),
        },
        {
          key: INSTRUCTIONS_GROUP,
          group: INSTRUCTIONS_GROUP,
          label: instructionsTitle,
          isHeader: true,
          withoutSeparator: true,
        },
        {
          id: SELECT_INSTRUCTIONS_ROOM,
          key: SELECT_INSTRUCTIONS_ROOM,
          group: INSTRUCTIONS_GROUP,
          label: t("Common:SelectRoom"),
          displaySelectorType: "button",
          selectorType: FilterSelectorTypes.rooms,
        },
        {
          key: KNOWLEDGE_GROUP,
          group: KNOWLEDGE_GROUP,
          label: knowledgeTitle,
          isHeader: true,
          isLast: true,
        },
        {
          id: SELECT_KNOWLEDGE_ROOM,
          key: SELECT_KNOWLEDGE_ROOM,
          group: KNOWLEDGE_GROUP,
          label: t("Common:SelectRoom"),
          displaySelectorType: "button",
          selectorType: FilterSelectorTypes.rooms,
        },
      ],
      [t, instructionsTitle, knowledgeTitle],
    );

    const { ownerFilter, instructionsRoomFilter, knowledgeRoomFilter } = store;
    const getSelectedFilterData = React.useCallback((): TItem[] => {
      const selected: TItem[] = [];
      if (ownerFilter) {
        const isMe = ownerFilter.id === userId;
        const label = isMe ? t("Common:MeLabel") : ownerFilter.label;
        selected.push({
          key: isMe ? FilterKeys.me : ownerFilter.id,
          group: FilterGroups.roomFilterOwner,
          label,
          selectedLabel: `${t("Common:Owner")}: ${label}`,
        });
      }
      if (instructionsRoomFilter) {
        selected.push({
          key: instructionsRoomFilter.id,
          group: INSTRUCTIONS_GROUP,
          label: instructionsRoomFilter.label,
          selectedLabel: `${instructionsTitle}: ${instructionsRoomFilter.label}`,
        });
      }
      if (knowledgeRoomFilter) {
        selected.push({
          key: knowledgeRoomFilter.id,
          group: KNOWLEDGE_GROUP,
          label: knowledgeRoomFilter.label,
          selectedLabel: `${knowledgeTitle}: ${knowledgeRoomFilter.label}`,
        });
      }
      return selected;
    }, [
      ownerFilter,
      instructionsRoomFilter,
      knowledgeRoomFilter,
      instructionsTitle,
      knowledgeTitle,
      userId,
      t,
    ]);

    // The bar hands over the whole selection: one item per group at most.
    // A user or room picked in a selector comes with its name; an unchanged
    // choice keeps the name it had.
    const onFilter = React.useCallback(
      (data: TItem[]) => {
        const pick = (group: FilterGroups, current: TAiProjectsFilterEntity | null): TAiProjectsFilterEntity | null => {
          const item = data.find((i) => i.group === group);
          if (!item) return null;
          const id = item.key === FilterKeys.me ? userId : String(item.key);
          return { id, label: item.label || (current?.id === id ? current.label : "") };
        };
        store.setFilterOptions({
          owner: pick(FilterGroups.roomFilterOwner, ownerFilter),
          instructionsRoom: pick(INSTRUCTIONS_GROUP, instructionsRoomFilter),
          knowledgeRoom: pick(KNOWLEDGE_GROUP, knowledgeRoomFilter),
        });
      },
      [store, userId, ownerFilter, instructionsRoomFilter, knowledgeRoomFilter],
    );

    const removeSelectedItem = React.useCallback(
      ({ group }: { key: string | number | string[]; group?: FilterGroups }) => {
        store.setFilterOptions({
          owner: group === FilterGroups.roomFilterOwner ? null : ownerFilter,
          instructionsRoom: group === INSTRUCTIONS_GROUP ? null : instructionsRoomFilter,
          knowledgeRoom: group === KNOWLEDGE_GROUP ? null : knowledgeRoomFilter,
        });
      },
      [store, ownerFilter, instructionsRoomFilter, knowledgeRoomFilter],
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
        renderSelector={renderSelector}
        showMainButton={canCreate && isDesktop}
        mainButtonProps={mainButtonProps}
      />
    );
  },
);

export default ProjectsFilter;
