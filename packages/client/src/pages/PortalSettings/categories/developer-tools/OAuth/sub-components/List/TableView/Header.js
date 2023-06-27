import React, { useState } from "react";
import TableHeader from "@docspace/components/table-container/TableHeader";

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

const TABLE_VERSION = "1";
const TABLE_COLUMNS = `oauthConfigColumns_ver-${TABLE_VERSION}`;

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

const Header = (props) => {
  const {
    userId,
    sectionWidth,
    tableRef,
    columnStorageName,
    columnInfoPanelStorageName,
    setHideColumns,
  } = props;
  const { t } = useTranslation(["Webhooks", "Common"]);

  const defaultColumns = [
    {
      key: "Logo",
      title: "Logo",
      enable: true,
      active: true,
      resizable: false,
      defaultSize: 64,
      onChange: onColumnChange,
    },
    {
      key: "Name",
      title: t("Common:Name"),
      resizable: true,
      enable: true,
      default: true,
      active: true,
      minWidth: 150,
      onChange: onColumnChange,
    },
    {
      key: "Description",
      title: "Description",
      resizable: true,
      enable: true,
      minWidth: 150,
      onChange: onColumnChange,
    },
    {
      key: "Enable",
      title: "Enable",
      enable: true,
      resizable: false,
      defaultSize: 64,
      onChange: onColumnChange,
    },
  ];

  const [columns, setColumns] = useState(getColumns(defaultColumns, userId));

  function onColumnChange(key, e) {
    const columnIndex = columns.findIndex((c) => c.key === key);

    if (columnIndex === -1) return;

    setColumns((prevColumns) =>
      prevColumns.map((item, index) =>
        index === columnIndex ? { ...item, enabled: !item.enabled } : item
      )
    );

    const tableColumns = columns.map((c) => c.enabled && c.key);
    localStorage.setItem(`${TABLE_COLUMNS}=${userId}`, tableColumns);
  }

  return (
    <TableHeader
      checkboxSize="48px"
      containerRef={tableRef}
      columns={columns}
      columnStorageName={columnStorageName}
      columnInfoPanelStorageName={columnInfoPanelStorageName}
      sectionWidth={sectionWidth}
      checkboxMargin="12px"
      showSettings={false}
      useReactWindow
      setHideColumns={setHideColumns}
      infoPanelVisible={false}
    />
  );
};

export default inject(({ auth }) => {
  return {
    userId: auth.userStore.user.id,
  };
})(observer(Header));
