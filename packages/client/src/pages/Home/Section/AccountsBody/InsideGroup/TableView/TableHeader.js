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

import { TableHeader } from "@docspace/shared/components/table";
import { Events } from "@docspace/shared/enums";
import { SortByFieldName } from "SRC_DIR/helpers/constants";

const TABLE_VERSION = "6";
const TABLE_COLUMNS = `insideGroupTableColumns_ver-${TABLE_VERSION}`;

class InsideGroupTableHeader extends React.Component {
  constructor(props) {
    super(props);

    const { t } = props;

    const defaultColumns = [
      {
        key: "Name",
        title: t("Common:Name"),
        resizable: true,
        enable: true,
        default: true,
        sortBy: "AZ",
        minWidth: 210,
        onClick: this.onFilter,
      },
      {
        key: "Type",
        title: t("Common:Type"),
        enable: props.typeAccountsInsideGroupColumnIsEnabled,
        sortBy: "type",
        resizable: true,
        onChange: this.onColumnChange,
        onClick: this.onFilter,
      },
      {
        key: "Department",
        title: t("Common:Group"),
        enable: props.groupAccountsInsideGroupColumnIsEnabled,
        sortBy: "department",
        resizable: true,
        onChange: this.onColumnChange,
        onClick: this.onFilter,
      },
      // {
      //   key: "Room",
      //   title: t("Common:Room"),
      //   enable: true,
      //   resizable: true,
      //   onChange: this.onColumnChange,
      // },
      {
        key: "Mail",
        title: t("Common:Email"),
        enable: props.emailAccountsInsideGroupColumnIsEnabled,
        resizable: true,
        sortBy: "email",
        onChange: this.onColumnChange,
        onClick: this.onFilter,
      },
    ];

    props.showStorageInfo &&
      defaultColumns.push({
        key: "Storage",
        title: props.isDefaultUsersQuotaSet
          ? t("Common:StorageAndQuota")
          : t("Common:Storage"),
        enable: props.storageAccountsColumnIsEnabled,
        sortBy: SortByFieldName.UsedSpace,
        resizable: true,
        onChange: this.onColumnChange,
        onClick: this.onFilter,
      });

    const columns = props.getColumns(defaultColumns);
    const tableColumns = columns.map((c) => c.enable && c.key);
    this.setTableColumns(tableColumns);

    this.state = { columns };
  }

  onColumnChange = (key, e) => {
    const { columns } = this.state;
    const columnIndex = columns.findIndex((c) => c.key === key);

    if (columnIndex === -1) return;

    this.props.setColumnEnable(key);

    columns[columnIndex].enable = !columns[columnIndex].enable;
    this.setState({ columns });

    const tableColumns = columns.map((c) => c.enable && c.key);
    this.setTableColumns(tableColumns);

    const event = new Event(Events.CHANGE_COLUMN);

    window.dispatchEvent(event);
  };

  onFilter = (sortBy) => {
    const { filter, setFilter, setIsLoading, navigate, location } = this.props;
    const newFilter = filter.clone();

    if (newFilter.sortBy === sortBy && sortBy !== "AZ") {
      newFilter.sortOrder =
        newFilter.sortOrder === "ascending" ? "descending" : "ascending";
    } else {
      newFilter.sortBy = sortBy;

      if (sortBy === "AZ") {
        if (newFilter.sortBy !== "displayname") {
          newFilter.sortBy = "displayname";
        }
        newFilter.sortOrder =
          newFilter.sortOrder === "ascending" ? "descending" : "ascending";
      }
    }

    setIsLoading(true);
    setFilter(newFilter);
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  };

  setTableColumns = (tableColumns) => {
    localStorage.setItem(`${TABLE_COLUMNS}=${this.props.userId}`, tableColumns);
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
      withPaging,
      setHideColumns,
    } = this.props;
    const { sortOrder } = filter;

    const sortBy = filter.sortBy === "displayname" ? "AZ" : filter.sortBy;

    return (
      <TableHeader
        checkboxSize="48px"
        sorted={sortOrder === "descending"}
        sortBy={sortBy}
        containerRef={containerRef}
        columns={columns}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        sectionWidth={sectionWidth}
        checkboxMargin="12px"
        infoPanelVisible={infoPanelVisible}
        useReactWindow={!withPaging}
        setHideColumns={setHideColumns}
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
    tableStore,
    currentQuotaStore,
  }) => {
    const { groupsStore } = peopleStore;

    const { insideGroupFilter: filter, setInsideGroupFilter: setFilter } =
      groupsStore;

    const { isVisible: infoPanelVisible } = infoPanelStore;
    const { withPaging } = settingsStore;

    const {
      getColumns,
      setColumnEnable,
      typeAccountsInsideGroupColumnIsEnabled,
      groupAccountsInsideGroupColumnIsEnabled,
      emailAccountsInsideGroupColumnIsEnabled,
      storageAccountsColumnIsEnabled,
    } = tableStore;

    const { showStorageInfo, isDefaultUsersQuotaSet } = currentQuotaStore;

    return {
      filter,
      setFilter,

      setIsLoading: clientLoadingStore.setIsSectionBodyLoading,
      userId: userStore.user?.id,
      infoPanelVisible,
      withPaging,

      getColumns,
      setColumnEnable,
      typeAccountsInsideGroupColumnIsEnabled,
      groupAccountsInsideGroupColumnIsEnabled,
      emailAccountsInsideGroupColumnIsEnabled,
      storageAccountsColumnIsEnabled,
      showStorageInfo,
      isDefaultUsersQuotaSet,
    };
  },
)(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    observer(InsideGroupTableHeader),
  ),
);
