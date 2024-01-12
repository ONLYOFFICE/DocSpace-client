import { useEffect, useState } from "react";

import TableHeader from "@docspace/components/table-container/TableHeader";

const TABLE_VERSION = "5";
const TABLE_COLUMNS = `SessionsColumns_ver-${TABLE_VERSION}`;

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
    setHideColumns,
    containerRef,
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
      onChange: onColumnChange,
    },
    {
      key: "Status",
      title: t("Common:UserStatus"),
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
      enable: false,
      resizable: true,
      onChange: onColumnChange,
    },
  ];

  const [columns, setColumns] = useState(getColumns(defaultColumns, userId));

  useEffect(() => {
    setColumns(getColumns(defaultColumns));
  }, []);

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

  return (
    <TableHeader
      checkboxSize="48px"
      containerRef={containerRef}
      columns={columns}
      columnStorageName={columnStorageName}
      columnInfoPanelStorageName={columnInfoPanelStorageName}
      sectionWidth={sectionWidth}
      checkboxMargin="12px"
      showSettings={true}
      useReactWindow
      setHideColumns={setHideColumns}
      infoPanelVisible={false}
    />
  );
};

export default SessionsTableHeader;
