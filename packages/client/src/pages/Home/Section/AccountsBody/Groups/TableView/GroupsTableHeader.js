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
        enable: true,
        default: true,
        sortBy: "title",
        minWidth: 210,
        onClick: this.onFilter,
        onIconClick: this.onIconClick,
      },
      {
        key: "Head of Group",
        title: props.t("Head of Group"),
        enable: true,
        resizable: true,
        onChange: this.onColumnChange,
      },
    ];

    const columns = this.getColumns(defaultColumns);

    this.state = { columns };
  }

  getColumns = (defaultColumns) => {
    const columns = [];
    const storageColumns = localStorage.getItem(
      `${TABLE_COLUMNS}=${this.props.userId}`,
    );

    if (storageColumns) {
      const splitColumns = storageColumns.split(",");

      for (let col of defaultColumns) {
        const column = splitColumns.find((key) => key === col.key);
        column ? (col.enable = true) : (col.enable = false);
        columns.push(col);
      }
      return columns;
    }

    return defaultColumns;
  };

  onColumnChange = (key) => {
    const { columns } = this.state;

    const columnIndex = columns.findIndex((c) => c.key === key);
    if (columnIndex === -1) return;
    columns[columnIndex].enable = !columns[columnIndex].enable;
    this.setState({ columns });

    const tableColumns = columns.map((c) => c.enable && c.key);
    localStorage.setItem(`${TABLE_COLUMNS}=${this.props.userId}`, tableColumns);

    const event = new Event(Events.CHANGE_COLUMN);
    window.dispatchEvent(event);
    console.log("event", event);
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

  onIconClick = () => {
    const { filter, setIsLoading, navigate, location } = this.props;
    const newFilter = filter.clone();

    newFilter.sortOrder =
      newFilter.sortOrder === "ascending" ? "descending" : "ascending";

    setIsLoading(true);

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
  }) => ({
    filter: peopleStore.groupsStore.groupsFilter,
    setFilter: peopleStore.groupsStore.setGroupsFilter,
    setIsLoading: clientLoadingStore.setIsSectionBodyLoading,
    userId: userStore.user?.id,
    infoPanelVisible: infoPanelStore.isVisible,
    withPaging: settingsStore,
  }),
)(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    observer(GroupsTableHeader),
  ),
);
