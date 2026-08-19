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

import { useCallback, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";

import { Table, TTableColumn } from "@docspace/ui-kit/components/table";
import { Events } from "@docspace/shared/enums";

import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";
import type { TContactsViewAs } from "SRC_DIR/helpers/contacts";
import EmptyScreenGroups from "../../EmptyScreenGroups";

import GroupsTableItem from "./TableItem";
import styles from "./TableView.module.scss";

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
    view: viewAs!,
    setView: (view: string) => {
      setViewAs!(view as TContactsViewAs);
    },
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

  if (!groups?.length) return <EmptyScreenGroups />;

  const sortBy = filter.sortBy === "displayname" ? "AZ" : filter.sortBy;
  const sorted = filter.sortOrder === "descending";

  return (
    <Table
      className={styles.groupsTableContainer}
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
    </Table>
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
