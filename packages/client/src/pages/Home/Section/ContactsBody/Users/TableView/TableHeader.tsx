// (c) Copyright Ascensio System SIA 2009-2024
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

import { TFilterSortBy } from "@docspace/shared/api/people/types";
import { TableHeader, TTableColumn } from "@docspace/shared/components/table";
import { Events } from "@docspace/shared/enums";

import { SortByFieldName } from "SRC_DIR/helpers/constants";

import {
  TableHeaderColumn,
  TableHeaderProps,
  TableHeaderState,
  TableHeaderStores,
} from "./TableView.types";

class PeopleTableHeader extends React.Component<
  TableHeaderProps,
  TableHeaderState
> {
  constructor(props: TableHeaderProps) {
    super(props);

    const { t } = props;

    const {
      isDefaultUsersQuotaSet,
      showStorageInfo,
      typeColumnIsEnabled,
      groupColumnIsEnabled,
      storageColumnIsEnabled,
      invitedDateColumnIsEnabled,
      inviterColumnIsEnabled,
      emailColumnIsEnabled,
      getColumns,
      contactsTab,
      tableStorageName,
    } = this.props;

    const isGuests = contactsTab === "guests";

    const nameColumn: TableHeaderColumn = {
      key: "Name",
      title: t!("Common:Name"),
      resizable: true,
      enable: true,
      default: true,
      sortBy: "AZ",
      minWidth: 210,
      onClick: this.onFilter,
    };

    const typeColumn: TableHeaderColumn = {
      key: "Type",
      title: t!("Common:Type"),
      enable: typeColumnIsEnabled,
      sortBy: "type",
      resizable: true,
      onChange: this.onColumnChange,
      onClick: this.onFilter,
    };

    const departmentColumn: TableHeaderColumn = {
      key: "Department",
      title: t!("Common:Group"),
      enable: groupColumnIsEnabled,
      sortBy: "department",
      resizable: true,
      onChange: this.onColumnChange,
      onClick: this.onFilter,
    };

    const mailColumn: TableHeaderColumn = {
      key: "Mail",
      title: t!("Common:Email"),
      enable: emailColumnIsEnabled,
      resizable: true,
      sortBy: "email",
      onChange: this.onColumnChange,
      onClick: this.onFilter,
    };

    const inviterColumn: TableHeaderColumn = {
      key: "Inviter",
      title: t!("Common:Inviter"),
      enable: inviterColumnIsEnabled,
      resizable: true,
      sortBy: "createdby",
      onChange: this.onColumnChange,
      onClick: this.onFilter,
    };

    const invitedDateColumn: TableHeaderColumn = {
      key: "InvitedDate",
      title: t!("PeopleTranslations:RegistrationDate"),
      enable: invitedDateColumnIsEnabled,
      resizable: true,
      sortBy: "registrationDate",
      onChange: this.onColumnChange,
      onClick: this.onFilter,
    };

    const userQuotaColumn: TableHeaderColumn = {
      key: "Storage",
      title: isDefaultUsersQuotaSet
        ? t!("Common:StorageAndQuota")
        : t!("Common:Storage"),
      enable: storageColumnIsEnabled,
      sortBy: SortByFieldName.UsedSpace,
      resizable: true,
      onChange: this.onColumnChange,
      onClick: this.onFilter,
    };

    const defaultColumns: TableHeaderColumn[] = [nameColumn, mailColumn];

    if (!isGuests) {
      defaultColumns.splice(1, 0, typeColumn);
      defaultColumns.splice(2, 0, departmentColumn);
      if (showStorageInfo) defaultColumns.push(userQuotaColumn);
    } else {
      defaultColumns.push(inviterColumn);
      defaultColumns.push(invitedDateColumn);
    }

    const columns: TableHeaderColumn[] = getColumns!(defaultColumns);
    const storageColumns = localStorage.getItem(tableStorageName!);
    const splitColumns = storageColumns && storageColumns.split(",");

    const resetColumnsSize =
      (splitColumns && splitColumns.length !== columns.length) || !splitColumns;

    const tableColumns = columns.map((c) => c.enable && c.key);
    this.setTableColumns(tableColumns as string[]);

    this.state = { columns, resetColumnsSize };
  }

  onColumnChange = (key: string) => {
    const { columns } = this.state;
    const { setColumnEnable } = this.props;
    const columnIndex = columns.findIndex((c) => c.key === key);

    if (columnIndex === -1) return;

    setColumnEnable!(key);

    columns[columnIndex].enable = !columns[columnIndex].enable;
    this.setState({ columns });

    const tableColumns = columns.map((c) => c.enable && c.key).filter((c) => c);
    this.setTableColumns(tableColumns as string[]);

    const event = new Event(Events.CHANGE_COLUMN);

    window.dispatchEvent(event);
  };

  onFilter = (sortBy: TFilterSortBy) => {
    const { filter, setFilter, setIsLoading, navigate, location } = this.props;
    const newFilter = filter!.clone();

    if (
      newFilter.sortBy === sortBy ||
      (sortBy === "AZ" && newFilter.sortBy === "displayname")
    ) {
      newFilter.sortOrder =
        newFilter.sortOrder === "ascending" ? "descending" : "ascending";
    } else {
      newFilter.sortBy = sortBy;

      if (sortBy === "AZ") {
        newFilter.sortBy = "displayname";
      }
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
    const { columns, resetColumnsSize } = this.state;
    const {
      containerRef,
      filter,
      sectionWidth,
      infoPanelVisible,
      tableStorageName,
      columnStorageName,
      columnInfoPanelStorageName,
      withPaging,
      setHideColumns,
    } = this.props;

    const sortBy = filter!.sortBy === "displayname" ? "AZ" : filter!.sortBy;
    const sorted = filter!.sortOrder === "descending";

    return (
      <TableHeader
        sorted={sorted}
        sortBy={sortBy}
        // fix types for table header and remove this
        containerRef={containerRef as unknown as { current: HTMLDivElement }}
        columns={columns as TTableColumn[]}
        tableStorageName={tableStorageName!}
        columnStorageName={columnStorageName!}
        columnInfoPanelStorageName={columnInfoPanelStorageName!}
        sectionWidth={sectionWidth}
        resetColumnsSize={resetColumnsSize}
        infoPanelVisible={infoPanelVisible}
        useReactWindow={!withPaging}
        setHideColumns={setHideColumns}
        showSettings
      />
    );
  }
}

export default inject(
  ({
    peopleStore,
    clientLoadingStore,
    infoPanelStore,
    settingsStore,
    userStore,
    currentQuotaStore,
    tableStore,
  }: TableHeaderStores) => {
    const { filter, setFilter, contactsTab } = peopleStore.usersStore!;

    const { isVisible: infoPanelVisible } = infoPanelStore;
    const { withPaging } = settingsStore;

    const { isDefaultUsersQuotaSet, showStorageInfo } = currentQuotaStore;

    const { getColumns, setColumnEnable, tableStorageName } = tableStore;

    return {
      filter,
      setFilter,

      setIsLoading: clientLoadingStore.setIsSectionBodyLoading,

      userId: userStore.user?.id,

      infoPanelVisible,

      withPaging,

      isDefaultUsersQuotaSet,
      showStorageInfo,

      getColumns,
      setColumnEnable,

      contactsTab,
      tableStorageName,
    };
  },
)(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    observer(PeopleTableHeader),
  ),
);
