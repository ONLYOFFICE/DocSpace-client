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

import { TFilterSortBy } from "@docspace/shared/api/people/types";
import { TableHeader, TTableColumn } from "@docspace/ui-kit/components/table";

import { Events, SortByFieldName } from "@docspace/shared/enums";

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
      isRoomAdmin,
    } = this.props;

    const isGuests = contactsTab === "guests";

    const nameColumn: TableHeaderColumn = {
      key: "Name",
      title: t!("Common:Label"),
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
    } else if (!isRoomAdmin) {
      defaultColumns.push(inviterColumn);
      defaultColumns.push(invitedDateColumn);
    }

    const columns: TableHeaderColumn[] = getColumns!(defaultColumns);
    const storageColumns = localStorage.getItem(tableStorageName!);
    const splitColumns = storageColumns && storageColumns.split(",");

    const resetColumnsSize =
      (splitColumns && splitColumns.length !== columns.length) || !splitColumns;

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
      columnStorageName,
      columnInfoPanelStorageName,
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
        columnStorageName={columnStorageName!}
        columnInfoPanelStorageName={columnInfoPanelStorageName!}
        sectionWidth={sectionWidth}
        resetColumnsSize={resetColumnsSize}
        infoPanelVisible={infoPanelVisible}
        useReactWindow
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
    userStore,
    currentQuotaStore,
    tableStore,
  }: TableHeaderStores) => {
    const { filter, setFilter, contactsTab } = peopleStore.usersStore!;

    const { isVisible: infoPanelVisible } = infoPanelStore;

    const { isDefaultUsersQuotaSet, showStorageInfo } = currentQuotaStore;

    const { getColumns, setColumnEnable, tableStorageName } = tableStore;

    return {
      filter,
      setFilter,

      setIsLoading: clientLoadingStore.setIsSectionBodyLoading,

      isRoomAdmin: userStore.user?.isRoomAdmin,

      infoPanelVisible,

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
