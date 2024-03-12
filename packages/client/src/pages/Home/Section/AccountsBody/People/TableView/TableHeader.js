import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { SortByFieldName } from "SRC_DIR/helpers/constants";

import { TableHeader } from "@docspace/shared/components/table";
import { Events } from "@docspace/shared/enums";

const TABLE_VERSION = "3";
const TABLE_COLUMNS = `peopleTableColumns_ver-${TABLE_VERSION}`;

class PeopleTableHeader extends React.Component {
  constructor(props) {
    super(props);

    const { t } = props;
    const { isDefaultUsersQuotaSet, showStorageInfo } = this.props;

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
        enable: props.typeAccountsColumnIsEnabled,
        sortBy: "type",
        resizable: true,
        onChange: this.onColumnChange,
        onClick: this.onFilter,
      },
      {
        key: "Department",
        title: t("Common:Group"),
        enable: props.groupAccountsColumnIsEnabled,
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
        enable: props.emailAccountsColumnIsEnabled,
        resizable: true,
        sortBy: "email",
        onChange: this.onColumnChange,
        onClick: this.onFilter,
      },
    ];

    showStorageInfo &&
      defaultColumns.push({
        key: "Storage",
        title: isDefaultUsersQuotaSet
          ? t("Common:StorageAndQuota")
          : t("Common:Storage"),
        enable: props.storageAccountsColumnIsEnabled,
        sortBy: SortByFieldName.UsedSpace,
        resizable: true,
        onChange: this.onColumnChange,
        onClick: this.onFilter,
      });

    const columns = props.getColumns(defaultColumns);
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
    localStorage.setItem(`${TABLE_COLUMNS}=${this.props.userId}`, tableColumns);

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
        if (
          newFilter.sortBy !== "lastname" &&
          newFilter.sortBy !== "firstname"
        ) {
          newFilter.sortBy = "firstname";
        } else if (newFilter.sortBy === "lastname") {
          newFilter.sortBy = "firstname";
        } else {
          newFilter.sortBy = "lastname";
        }
        newFilter.sortOrder =
          newFilter.sortOrder === "ascending" ? "descending" : "ascending";
      }
    }

    setIsLoading(true);
    setFilter(newFilter);
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
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

    const sortBy =
      filter.sortBy === "firstname" || filter.sortBy === "lastname"
        ? "AZ"
        : filter.sortBy;

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
    currentQuotaStore,
    tableStore,
  }) => {
    const { filterStore } = peopleStore;

    const { filter, setFilter } = filterStore;

    const { isVisible: infoPanelVisible } = infoPanelStore;
    const { withPaging } = settingsStore;

    const { isDefaultUsersQuotaSet, showStorageInfo } = currentQuotaStore;

    const {
      getColumns,
      setColumnEnable,
      typeAccountsColumnIsEnabled,
      emailAccountsColumnIsEnabled,
      groupAccountsColumnIsEnabled,
      storageAccountsColumnIsEnabled,
    } = tableStore;

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
      typeAccountsColumnIsEnabled,
      emailAccountsColumnIsEnabled,
      groupAccountsColumnIsEnabled,
      storageAccountsColumnIsEnabled,
    };
  },
)(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    observer(PeopleTableHeader),
  ),
);
