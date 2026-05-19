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
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { NavigateFunction, Location } from "react-router";

import { TableHeader, TTableColumn } from "@docspace/ui-kit/components/table";
import { Events } from "@docspace/shared/enums";
import { Nullable, TTranslation } from "@docspace/shared/types";

import TableStore from "SRC_DIR/store/TableStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";

import { TableHeaderColumn } from "../../Users/TableView/TableView.types";

type GroupsTableHeaderProps = {
  t?: TTranslation;

  peopleGroupsColumnIsEnabled?: boolean;
  managerGroupsColumnIsEnabled?: boolean;

  getColumns?: TableStore["getColumns"];
  setColumnEnable?: TableStore["setColumnEnable"];
  tableStorageName?: TableStore["tableStorageName"];
  columnStorageName?: TableStore["columnStorageName"];
  columnInfoPanelStorageName?: TableStore["columnInfoPanelStorageName"];

  sectionWidth: number;

  filter?: GroupsStore["groupsFilter"];
  setFilter?: GroupsStore["setGroupsFilter"];

  setIsLoading?: ClientLoadingStore["setIsSectionBodyLoading"];

  infoPanelVisible?: InfoPanelStore["isVisible"];

  navigate: NavigateFunction;
  location: Location;

  containerRef: React.RefObject<Nullable<React.ForwardedRef<HTMLDivElement>>>;
};

type GroupTableHeaderState = { columns: TableHeaderColumn[] };

class GroupsTableHeader extends React.Component<
  GroupsTableHeaderProps,
  GroupTableHeaderState
> {
  constructor(props: GroupsTableHeaderProps) {
    super(props);

    const { getColumns } = props;

    const defaultColumns = this.getDefaultColumns();
    const columns: TableHeaderColumn[] = getColumns!(defaultColumns);

    this.state = { columns };
  }

  getDefaultColumns = () => {
    const { t, peopleGroupsColumnIsEnabled, managerGroupsColumnIsEnabled } =
      this.props;

    const defaultColumns = [
      {
        key: "Name",
        title: t!("Common:Title"),
        resizable: true,
        enable: true,
        default: true,
        sortBy: "title",
        minWidth: 210,
        onClick: this.onFilter,
      },
      {
        key: "People",
        title: t!("Common:Members"),
        enable: peopleGroupsColumnIsEnabled,
        sortBy: "membersCount",
        onClick: this.onFilter,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "Head of Group",
        title: t!("Common:HeadOfGroup"),
        enable: managerGroupsColumnIsEnabled,
        sortBy: "manager",
        onClick: this.onFilter,
        resizable: true,
        onChange: this.onColumnChange,
      },
    ];

    return defaultColumns;
  };

  onColumnChange = (key: string) => {
    const { columns } = this.state;
    const { setColumnEnable } = this.props;

    const columnIndex = columns.findIndex((c) => c.key === key);
    if (columnIndex === -1) return;

    setColumnEnable!(key);

    columns[columnIndex].enable = !columns[columnIndex].enable;
    this.setState({ columns });

    const tableColumns = columns.map((c) => c.enable && c.key);

    this.setTableColumns(tableColumns as string[]);

    const event = new Event(Events.CHANGE_COLUMN);
    window.dispatchEvent(event);
  };

  onFilter = (sortBy: string) => {
    const { filter, setFilter, setIsLoading, navigate, location } = this.props;

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
  };

  setTableColumns = (tableColumns: string[]) => {
    const { tableStorageName } = this.props;

    localStorage.setItem(tableStorageName!, tableColumns.toString());
  };

  render() {
    const { columns } = this.state;

    const {
      containerRef,
      filter,
      sectionWidth,
      infoPanelVisible,
      columnStorageName,
      columnInfoPanelStorageName,
    } = this.props;

    const sortBy = filter!.sortBy === "displayname" ? "AZ" : filter!.sortBy;
    const sorted = filter!.sortOrder === "descending";

    return (
      <TableHeader
        sorted={sorted}
        sortBy={sortBy}
        containerRef={containerRef as unknown as { current: HTMLDivElement }}
        columns={columns as TTableColumn[]}
        columnStorageName={columnStorageName!}
        columnInfoPanelStorageName={columnInfoPanelStorageName!}
        sectionWidth={sectionWidth}
        infoPanelVisible={infoPanelVisible}
        useReactWindow
        showSettings
      />
    );
  }
}

export default inject(
  ({
    peopleStore,
    clientLoadingStore,
    userStore,
    infoPanelStore,
    tableStore,
  }: TStore) => ({
    filter: peopleStore.groupsStore!.groupsFilter,
    setFilter: peopleStore.groupsStore!.setGroupsFilter,
    setIsLoading: clientLoadingStore.setIsSectionBodyLoading,
    userId: userStore.user?.id,
    infoPanelVisible: infoPanelStore.isVisible,
    getColumns: tableStore.getColumns,
    setColumnEnable: tableStore.setColumnEnable,
    managerGroupsColumnIsEnabled: tableStore.managerGroupsColumnIsEnabled,
    peopleGroupsColumnIsEnabled: tableStore.peopleGroupsColumnIsEnabled,
    tableStorageName: tableStore.tableStorageName,
  }),
)(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    observer(GroupsTableHeader),
  ),
);
