/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState, useEffect } from "react";

import { TableHeader, TTableColumn } from "@docspace/ui-kit/components/table";
import { UsersTableHeaderProps } from "../../../../types";

const TABLE_VERSION = "6";
const TABLE_COLUMNS = `nextcloudFourthColumns_ver-${TABLE_VERSION}`;

const getColumns = (defaultColumns: TTableColumn[], userId?: string) => {
  const storageColumns = localStorage.getItem(`${TABLE_COLUMNS}=${userId}`);

  if (storageColumns) {
    const splitColumns = storageColumns?.split(",");

    return defaultColumns.map((col) => ({
      ...col,
      enable: splitColumns.includes(col.key),
    }));
  }

  return defaultColumns;
};

const UsersTableHeader = (props: UsersTableHeaderProps) => {
  const {
    t,
    sectionWidth,
    userId,
    tableRef,
    columnStorageName,
    columnInfoPanelStorageName,
    isIndeterminate,
    isChecked,
  } = props;

  const [columns, setColumns] = useState<TTableColumn[]>([
    {
      key: "Name",
      title: t("Common:Name"),
      resizable: true,
      enable: true,
      default: true,
      active: true,
      minWidth: 180,
    },
  ]);

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

  const defaultColumns = [
    {
      key: "Name",
      title: t("Common:Name"),
      resizable: true,
      enable: true,
      default: true,
      active: true,
      minWidth: 180,
      onChange: onColumnChange,
    },
    {
      key: "Type",
      title: t("Common:Type"),
      enable: true,
      resizable: true,
      minWidth: 100,
      onChange: onColumnChange,
    },
    {
      key: "Email",
      title: t("Common:Email"),
      enable: true,
      resizable: true,
      onChange: onColumnChange,
    },
  ];

  useEffect(() => {
    setColumns(getColumns(defaultColumns));
  }, [isIndeterminate, isChecked]);

  return (
    <TableHeader
      containerRef={tableRef as { current: HTMLDivElement }}
      columns={columns}
      columnStorageName={columnStorageName}
      columnInfoPanelStorageName={columnInfoPanelStorageName}
      sectionWidth={sectionWidth!}
      showSettings={false}
      useReactWindow
      infoPanelVisible={false}
    />
  );
};

export default UsersTableHeader;
