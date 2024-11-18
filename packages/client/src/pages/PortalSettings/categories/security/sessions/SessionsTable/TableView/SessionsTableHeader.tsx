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

import { useState, useEffect } from "react";
import { useTheme } from "styled-components";

import {
  TableHeader,
  type TTableColumn,
} from "@docspace/shared/components/table";

import type { SessionsTableHeaderProps } from "../../SecuritySessions.types";

const TABLE_VERSION = "4";
const TABLE_COLUMNS = `securitySessionsColumns_ver-${TABLE_VERSION}`;

const getColumns = (defaultColumns: TTableColumn[], userId: string) => {
  const storageColumns = localStorage.getItem(`${TABLE_COLUMNS}=${userId}`);

  if (storageColumns) {
    const splitColumns = storageColumns.split(",");

    return defaultColumns.map((col) => ({
      ...col,
      enable: splitColumns.includes(col.key),
    }));
  }
  return defaultColumns;
};

const SessionsTableHeader = (props: SessionsTableHeaderProps) => {
  const {
    t,
    userId = "" as string,
    sectionWidth,
    setHideColumns,
    containerRef,
    columnStorageName,
    columnInfoPanelStorageName,
  } = props;

  const theme = useTheme();

  const defaultColumns = [
    {
      key: "User",
      title: t("Common:User"),
      resizable: true,
      enable: true,
      default: true,
      active: true,
      minWidth: 180,
      isDisabled: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      onChange: onColumnChange,
    },
    {
      key: "Status",
      title: t("Common:UserStatus"),
      enable: true,
      resizable: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      onChange: onColumnChange,
    },
    {
      key: "Platform",
      title: t("Common:Platform"),
      enable: true,
      resizable: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      onChange: onColumnChange,
    },
    {
      key: "Location",
      title: t("Common:Location"),
      enable: true,
      resizable: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      onChange: onColumnChange,
    },
  ];

  const [columns, setColumns] = useState(getColumns(defaultColumns, userId));

  useEffect(() => {
    setColumns(getColumns(defaultColumns, userId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function onColumnChange(key: string) {
    const columnIndex = columns.findIndex((c) => c.key === key);

    if (columnIndex === -1) return;

    setColumns((prevColumns: TTableColumn[]) =>
      prevColumns.map((item, index) =>
        index === columnIndex ? { ...item, enable: !item.enable } : item,
      ),
    );

    const tableColumns = columns.map((c) => c.enable && c.key);
    localStorage.setItem(`${TABLE_COLUMNS}=${userId}`, tableColumns.toString());
  }

  return (
    <TableHeader
      containerRef={containerRef as { current: HTMLDivElement }}
      columns={columns}
      columnStorageName={columnStorageName}
      columnInfoPanelStorageName={columnInfoPanelStorageName}
      sectionWidth={sectionWidth}
      showSettings
      useReactWindow
      setHideColumns={setHideColumns}
      infoPanelVisible={false}
      sortBy=""
      sorted={false}
      tableStorageName=""
      onClick={() => {}}
      resetColumnsSize={false}
      isLengthenHeader={false}
      sortingVisible={false}
      tagRef={null}
      theme={theme}
    />
  );
};

export default SessionsTableHeader;
