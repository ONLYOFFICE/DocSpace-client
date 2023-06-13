import { useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";

import TableContainer from "@docspace/components/table-container";
import TableHeader from "@docspace/components/table-container/TableHeader";
import TableBody from "@docspace/components/table-container/TableBody";

import TableRow from "./TableRow";
import TableProps from "./Table.porps";
import { TableColumnType } from "../types";

const TABLE_VERSION = "3";
const TABLE_COLUMNS = `boardTableColumns_ver=${TABLE_VERSION}`;
const TABLE_COLUMNS_SIZE = `boardTableColumnsSize_ver=${TABLE_VERSION}`;

const userId = 1;

function Table({ roles }: TableProps) {
  const { t } = useTranslation();

  const tableLocalStorageKey = useMemo(
    () => `${TABLE_COLUMNS}=${userId}`,
    [userId]
  );

  const tableSizeLocalStorageKey = useMemo(
    () => `${TABLE_COLUMNS_SIZE}=${userId}`,
    [userId]
  );

  const containerRef = useRef();

  const getColumns = (defaultColumns: TableColumnType[]) => {
    const storageColumns = localStorage.getItem(tableLocalStorageKey);
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

  const onColumnChange = (key: string) => {
    const tempColumns = [...columns];

    const columnIndex = tempColumns.findIndex((c) => c.key === key);

    if (columnIndex === -1) return;

    tempColumns[columnIndex].enable = !tempColumns[columnIndex].enable;

    setColumns(tempColumns);

    const tableColumns = tempColumns.map((c) => c.enable && c.key);
    localStorage.setItem(tableLocalStorageKey, tableColumns.toString());
  };

  const [columns, setColumns] = useState(() => {
    const defaultColumns: TableColumnType[] = [
      {
        key: "Name",
        title: t("Common:Name"),
        resizable: true,
        enable: true,
        default: true,
        sortBy: "AZ",
        minWidth: 210,
        onClick: () => {},
        onIconClick: () => {},
      },
      {
        key: "Queue",
        title: "Queue number",
        enable: true,
        resizable: true,
        sortBy: "Queue",
        onChange: onColumnChange,
        onClick: () => {},
      },
    ];
    return getColumns(defaultColumns);
  });

  return (
    <TableContainer useReactWindow forwardedRef={containerRef}>
      <TableHeader
        sorted
        sortBy={"AZ"}
        useReactWindow
        columns={columns}
        checkboxSize="48px"
        checkboxMargin="12px"
        containerRef={containerRef}
        columnStorageName={tableSizeLocalStorageKey}
        // columnInfoPanelStorageName={columnInfoPanelStorageName}
        // sectionWidth={sectionWidth}
        infoPanelVisible={false}
        // setHideColumns={setHideColumns}
      />
      <TableBody
        useReactWindow
        itemHeight={49}
        infoPanelVisible={false}
        columnStorageName={tableSizeLocalStorageKey}
        fetchMoreFiles={() => {}}
        hasMoreFiles={false}
        itemCount={3}
        filesLength={3}
      >
        {roles.map((role) => (
          <TableRow
            id={role.id}
            key={role.id}
            title={role.title}
            queue={role.queue}
            color={role.color}
            roleType={role.roleType}
          />
        ))}
      </TableBody>
    </TableContainer>
  );
}

export default Table;
