// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useState, useEffect } from "react";
import { TableHeader } from "@docspace/shared/components/table";
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
