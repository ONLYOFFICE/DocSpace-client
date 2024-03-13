import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { TableHeader } from "@docspace/shared/components/table";
import { Events } from "@docspace/shared/enums";

const TABLE_VERSION = "5";
const TABLE_COLUMNS = `groupsTableColumns_ver-${TABLE_VERSION}`;

class GroupsTableHeader extends React.Component {
  constructor(props) {
    super(props);

    const defaultColumns = [
      {
        key: "Name",
        title: props.t("Common:Title"),
        resizable: true,
        enable: props.managerAccountsGroupsColumnIsEnabled,
        default: true,
        sortBy: "title",
        minWidth: 210,
        onClick: this.onFilter,
      },
      {
        key: "Head of Group",
        title: props.t("Common:HeadOfGroup"),
        enable: true,
        sortBy: "manager",
        onClick: this.onFilter,
        resizable: true,
        onChange: this.onColumnChange,
      },
    ];

    const columns = props.getColumns(defaultColumns);

    this.state = { columns };
  }

  onColumnChange = (key) => {
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
    console.log(filter);

    const newFilter = filter.clone();
    const reverseSortOrder =
      newFilter.sortOrder === "ascending" ? "descending" : "ascending";

    if (newFilter.sortBy === sortBy && sortBy !== "AZ")
      newFilter.sortOrder = reverseSortOrder;
    else {
      newFilter.sortBy = sortBy;
      if (sortBy === "AZ") newFilter.sortOrder = reverseSortOrder;
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

    return (
      <TableHeader
        checkboxSize="48px"
        sorted={sortOrder === "descending"}
        sortBy={filter.sortBy}
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
    userStore,
    infoPanelStore,
    settingsStore,
    tableStore,
  }) => ({
    filter: peopleStore.groupsStore.groupsFilter,
    setFilter: peopleStore.groupsStore.setGroupsFilter,
    setIsLoading: clientLoadingStore.setIsSectionBodyLoading,
    userId: userStore.user?.id,
    infoPanelVisible: infoPanelStore.isVisible,
    withPaging: settingsStore.withPaging,
    getColumns: tableStore.getColumns,
    setColumnEnable: tableStore.setColumnEnable,
    managerAccountsGroupsColumnIsEnabled:
      tableStore.managerAccountsGroupsColumnIsEnabled,
  }),
)(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    observer(GroupsTableHeader),
  ),
);
