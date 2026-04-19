// (c) Copyright Ascensio System SIA 2009-2026
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

import { useCallback, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";

import { TTableColumn } from "@docspace/ui-kit/components/table";
import { Events } from "@docspace/shared/enums";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import EmptyScreenGroups from "../../EmptyScreenGroups";

import GroupsTableItem from "./TableItem";
import { GroupsStyledTable } from "./TableView.styled";

import type {
  ExternalGroupsTableViewProps,
  GroupsTableViewProps,
  InjectedGroupsTableViewProps,
} from "./TableView.types";

const GroupsTableView = ({
  groups,
  selection,
  sectionWidth,
  viewAs,
  setViewAs,
  infoPanelVisible,
  currentDeviceType,
  fetchMoreGroups,
  hasMoreGroups,
  groupsFilterTotal,
  filter,
  setFilter,
  setIsLoading,
  peopleGroupsColumnIsEnabled,
  managerGroupsColumnIsEnabled,
  setColumnEnable,
  tableStorageName,
  columnStorageName,
  columnInfoPanelStorageName,
  withContentSelection,
}: GroupsTableViewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(["People", "Common", "PeopleTranslations"]);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType: currentDeviceType!,
  });

  const onFilter = useCallback(
    (sortBy: string) => {
      const newFilter = filter!.clone();
      const reverseSortOrder =
        newFilter.sortOrder === "ascending" ? "descending" : "ascending";

      if (newFilter.sortBy === sortBy && sortBy !== "AZ")
        newFilter.sortOrder = reverseSortOrder;
      else {
        newFilter.sortBy = sortBy;
        if (sortBy === "AZ") newFilter.sortOrder = reverseSortOrder;
      }

      setIsLoading!(true);
      setFilter!(newFilter);
      navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
    },
    [filter, setFilter, setIsLoading, navigate, location.pathname],
  );

  const onColumnChange = useCallback(
    (key: string) => {
      setColumnEnable!(key);

      const nextPeople =
        key === "People"
          ? !peopleGroupsColumnIsEnabled
          : (peopleGroupsColumnIsEnabled ?? false);
      const nextManager =
        key === "Head of Group"
          ? !managerGroupsColumnIsEnabled
          : (managerGroupsColumnIsEnabled ?? false);

      const tableColumns = [
        "Name",
        nextPeople && "People",
        nextManager && "Head of Group",
      ];
      localStorage.setItem(tableStorageName, tableColumns.toString());

      const event = new Event(Events.CHANGE_COLUMN);
      window.dispatchEvent(event);
    },
    [
      setColumnEnable,
      tableStorageName,
      peopleGroupsColumnIsEnabled,
      managerGroupsColumnIsEnabled,
    ],
  );

  const columns: TTableColumn[] = useMemo(
    () => [
      {
        key: "Name",
        title: t("Common:Title"),
        resizable: true,
        enable: true,
        default: true,
        sortBy: "title",
        minWidth: 210,
        onClick: onFilter,
      },
      {
        key: "People",
        title: t("Common:Members"),
        enable: peopleGroupsColumnIsEnabled,
        sortBy: "membersCount",
        onClick: onFilter,
        resizable: true,
        onChange: onColumnChange,
      },
      {
        key: "Head of Group",
        title: t("Common:HeadOfGroup"),
        enable: managerGroupsColumnIsEnabled,
        sortBy: "manager",
        onClick: onFilter,
        resizable: true,
        onChange: onColumnChange,
      },
    ],
    [
      t,
      peopleGroupsColumnIsEnabled,
      managerGroupsColumnIsEnabled,
      onFilter,
      onColumnChange,
    ],
  );

  const sortBy = filter.sortBy === "displayname" ? "AZ" : filter.sortBy;
  const sorted = filter.sortOrder === "descending";

  if (!groups?.length) return <EmptyScreenGroups />;

  return (
    <GroupsStyledTable
      showSettings
      useReactWindow
      itemHeight={48}
      sortBy={sortBy}
      sorted={sorted}
      columns={columns}
      filesLength={groups.length}
      sectionWidth={sectionWidth!}
      hasMoreFiles={hasMoreGroups}
      itemCount={groupsFilterTotal}
      noSelect={!withContentSelection}
      fetchMoreFiles={fetchMoreGroups}
      infoPanelVisible={infoPanelVisible}
      columnStorageName={columnStorageName}
      columnInfoPanelStorageName={columnInfoPanelStorageName}
    >
      {groups.map((item, index) => (
        <GroupsTableItem
          key={item.id}
          item={item}
          isChecked={selection?.includes(item) ?? false}
          itemIndex={index}
          managerGroupsColumnIsEnabled={managerGroupsColumnIsEnabled ?? false}
          peopleGroupsColumnIsEnabled={peopleGroupsColumnIsEnabled ?? false}
        />
      ))}
    </GroupsStyledTable>
  );
};

export default inject<
  TStore,
  ExternalGroupsTableViewProps,
  InjectedGroupsTableViewProps
>(
  ({
    peopleStore,
    settingsStore,
    infoPanelStore,
    tableStore,
    clientLoadingStore,
  }) => {
    const { groupsStore, contactsHotkeysStore, viewAs, setViewAs } =
      peopleStore;

    const {
      groups,
      selection,
      fetchMoreGroups,
      hasMoreGroups,
      groupsFilterTotal,
      groupsFilter: filter,
      setGroupsFilter: setFilter,
    } = groupsStore;

    const { currentDeviceType } = settingsStore;
    const { isVisible: infoPanelVisible } = infoPanelStore;

    const {
      managerGroupsColumnIsEnabled,
      peopleGroupsColumnIsEnabled,
      setColumnEnable,
      tableStorageName,
      columnStorageName,
      columnInfoPanelStorageName,
    } = tableStore;

    const { withContentSelection } = contactsHotkeysStore;

    return {
      filter,
      setFilter,
      groups,
      viewAs,
      setViewAs,
      selection,
      hasMoreGroups,
      setColumnEnable,
      infoPanelVisible,
      currentDeviceType,
      fetchMoreGroups,
      groupsFilterTotal,
      tableStorageName,
      columnStorageName,
      managerGroupsColumnIsEnabled,
      peopleGroupsColumnIsEnabled,
      columnInfoPanelStorageName,
      withContentSelection,
      setIsLoading: clientLoadingStore.setIsSectionBodyLoading,
    };
  },
)(observer(GroupsTableView as React.FC<ExternalGroupsTableViewProps>));

