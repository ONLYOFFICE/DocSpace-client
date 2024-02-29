import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { TableHeader } from "@docspace/shared/components/table";
import { Events } from "@docspace/shared/enums";

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
        onIconClick: this.onIconClick,
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
    tableStore,
  }) => {
    const { filterStore } = peopleStore;

    const { filter, setFilter } = filterStore;

    const { isVisible: infoPanelVisible } = infoPanelStore;
    const { withPaging } = settingsStore;

    const {
      getColumns,
      setColumnEnable,
      typeAccountsInsideGroupColumnIsEnabled,
      groupAccountsInsideGroupColumnIsEnabled,
      emailAccountsInsideGroupColumnIsEnabled,
    } = tableStore;

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
    };
  },
)(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    observer(InsideGroupTableHeader),
  ),
);
