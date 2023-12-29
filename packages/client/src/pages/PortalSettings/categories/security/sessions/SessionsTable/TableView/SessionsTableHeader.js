import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";

import TableHeader from "@docspace/components/table-container/TableHeader";

const TABLE_VERSION = "5";
const TABLE_COLUMNS = `GoogleWorkspaceColumns_ver-${TABLE_VERSION}`;

const getColumns = (defaultColumns, userId) => {
  const storageColumns = localStorage.getItem(`${TABLE_COLUMNS}=${userId}`);
  const columns = [];

  if (storageColumns) {
    const splitColumns = storageColumns.split(",");

    for (let col of defaultColumns) {
      const column = splitColumns.find((key) => key === col.key);
      column ? (col.enable = true) : (col.enable = false);

      columns.push(col);
    }
    return columns;
  } else {
    return defaultColumns;
  }
};

const SessionsTableHeader = (props) => {
  const {
    t,
    userId,
    sectionWidth,
    tableRef,
    columnStorageName,
    columnInfoPanelStorageName,
  } = props;

  const defaultColumns = [
    {
      key: "User",
      title: t("Common:User"),
      resizable: true,
      enable: true,
      default: true,
      active: true,
      minWidth: 180,
      //   checkbox: {
      //     value: isChecked,
      //     isIndeterminate,
      //     onChange: toggleAll,
      //   },
      onChange: onColumnChange,
    },
    {
      key: "Status",
      title: t("Common:Status"),
      enable: true,
      resizable: true,
      onChange: onColumnChange,
    },
    {
      key: "Platform",
      title: t("Common:Platform"),
      enable: true,
      resizable: true,
      onChange: onColumnChange,
    },
    {
      key: "Country",
      title: t("Common:Country"),
      enable: true,
      resizable: true,
      onChange: onColumnChange,
    },
    {
      key: "IpAddress",
      title: t("Common:IpAddress"),
      enable: true,
      resizable: true,
      onChange: onColumnChange,
    },
  ];

  const [columns, setColumns] = useState(getColumns(defaultColumns, userId));

  function onColumnChange(key, e) {
    const columnIndex = columns.findIndex((c) => c.key === key);

    if (columnIndex === -1) return;

    setColumns((prevColumns) =>
      prevColumns.map((item, index) =>
        index === columnIndex ? { ...item, enable: !item.enable } : item
      )
    );

    const tableColumns = columns.map((c) => c.enable && c.key);
    localStorage.setItem(`${TABLE_COLUMNS}=${userId}`, tableColumns);
  }

  useEffect(() => {
    setColumns(getColumns(defaultColumns));
  }, []);

  return (
    <TableHeader
      checkboxSize="48px"
      containerRef={tableRef}
      columns={columns}
      columnStorageName={columnStorageName}
      columnInfoPanelStorageName={columnInfoPanelStorageName}
      sectionWidth={sectionWidth}
      checkboxMargin="12px"
      showSettings={true}
      useReactWindow
      infoPanelVisible={false}
    />
  );
};

export default inject(({ auth }) => {
  return {
    userId: auth.userStore.user.id,
  };
})(observer(SessionsTableHeader));
