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

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { NavigateFunction, Location } from "react-router";

import { TableHeader, TTableColumn } from "@docspace/shared/components/table";
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

    const tableColumns = columns.map((c) => c.enable && c.key);

    this.setTableColumns(tableColumns as string[]);

    this.state = { columns };
  }

  componentDidUpdate(prevProps: GroupsTableHeaderProps) {
    const { columnStorageName, columnInfoPanelStorageName } = this.props;
    if (
      columnStorageName !== prevProps.columnStorageName ||
      columnInfoPanelStorageName !== prevProps.columnInfoPanelStorageName
    ) {
      return this.updateTableColumns();
    }
  }

  updateTableColumns = () => {
    const { getColumns } = this.props;
    const defaultColumns = this.getDefaultColumns();
    const columns: TableHeaderColumn[] = getColumns!(defaultColumns);

    const tableColumns = columns.map((c) => c.enable && c.key);

    this.setTableColumns(tableColumns as string[]);

    this.setState({ columns });
  };

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
