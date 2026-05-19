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

import React, { useState, useEffect } from "react";
import { TableHeader } from "@docspace/ui-kit/components/table";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

const TABLE_VERSION = "5";
const TABLE_COLUMNS = `webhooksHistoryColumns_ver-${TABLE_VERSION}`;

const getColumns = (defaultColumns, userId) => {
  const storageColumns = localStorage.getItem(`${TABLE_COLUMNS}=${userId}`);

  if (storageColumns) {
    const splitColumns = storageColumns.split(",");

    const columns = defaultColumns.map((col) => {
      const column = splitColumns.find((key) => key === col.key);
      return { ...(col || {}), enable: !!column };
    });

    return columns;
  }
  return defaultColumns;
};

const HistoryTableHeader = (props) => {
  const {
    userId,
    sectionWidth,
    tableRef,
    columnStorageName,
    columnInfoPanelStorageName,
    setHideColumns,
  } = props;
  const { t } = useTranslation(["Webhooks", "People"]);

  const [columns, setColumns] = useState(getColumns([], userId));

  function onColumnChange(key) {
    const columnIndex = columns.findIndex((c) => c.key === key);

    if (columnIndex === -1) return;

    setColumns((prevColumns) =>
      prevColumns.map((item, index) =>
        index === columnIndex ? { ...item, enable: !item.enable } : item,
      ),
    );

    const tableColumns = columns.map((c) => c.enable && c.key);
    localStorage.setItem(`${TABLE_COLUMNS}=${userId}`, tableColumns.join(","));
  }

  const defaultColumns = [
    {
      key: "Event ID",
      title: t("EventID"),
      resizable: true,
      enable: true,
      default: true,
      active: true,
      minWidth: 210,
      onChange: onColumnChange,
    },
    {
      key: "Status",
      title: t("People:UserStatus"),
      enable: true,
      resizable: true,
      onChange: onColumnChange,
    },
    {
      key: "Trigger",
      title: t("EventType"),
      enable: true,
      resizable: true,
      onChange: onColumnChange,
    },
    {
      key: "Delivery",
      title: t("Delivery"),
      enable: true,
      resizable: true,
      onChange: onColumnChange,
    },
  ];

  useEffect(() => {
    setColumns(getColumns(defaultColumns, userId));
  }, []);

  return (
    <TableHeader
      checkboxSize="32px"
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

export default inject(({ userStore }) => {
  return {
    userId: userStore.user.id,
  };
})(observer(HistoryTableHeader));
