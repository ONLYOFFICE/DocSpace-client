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

import { useState } from "react";
import { TableHeader as TableHeaderComponent } from "@docspace/ui-kit/components/table";

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { TableHeaderColumn, TableHeaderProps } from "../../types";

const TABLE_VERSION = "1";
const TABLE_COLUMNS = `apiKeysColumns_ver-${TABLE_VERSION}`;

const TableHeader = (props: TableHeaderProps) => {
  const {
    userId,
    tableRef,
    columnStorageName,
    setHideColumns,
    sectionWidth,
    columnInfoPanelStorageName,
  } = props;
  const { t } = useTranslation(["Webhooks", "Common", "Files", "Settings"]);

  const defaultColumns: TableHeaderColumn[] = [
    {
      key: "Name",
      title: t("Common:Label"),
      resizable: true,
      enable: true,
      default: true,
      minWidth: 110,
    },
    {
      key: "SecretKey",
      title: t("SecretKey"),
      enable: true,
      resizable: true,
    },
    {
      key: "Created",
      title: t("Files:ByCreation"),
      enable: true,
      resizable: true,
    },
    {
      key: "LastUsed",
      title: t("Common:LastUsed"),
      enable: true,
      resizable: true,
    },
    {
      key: "CreatedBy",
      title: t("Common:CreatedBy"),
      enable: true,
      resizable: true,
    },
    {
      key: "Permissions",
      title: t("Common:Permissions"),
      enable: true,
      resizable: true,
    },
    {
      key: "State",
      title: t("State"),
      enable: true,
      resizable: true,
    },
  ];

  const getColumns = (
    columnsList: TableHeaderColumn[],
    id: TableHeaderProps["userId"],
  ) => {
    const storageColumns = localStorage.getItem(`${TABLE_COLUMNS}=${id}`);

    if (storageColumns) {
      const splitColumns = storageColumns.split(",");

      const newColumns = columnsList.map((col) => {
        const column = splitColumns.find((key) => key === col.key);
        return { ...(col || {}), enable: !!column };
      });

      return newColumns;
    }
    return columnsList;
  };

  const storageColumns = getColumns(defaultColumns, userId);
  const [columns] = useState<TableHeaderColumn[]>(storageColumns ?? []);

  return (
    <TableHeaderComponent
      containerRef={tableRef}
      sectionWidth={sectionWidth}
      columns={columns}
      columnStorageName={columnStorageName}
      showSettings={false}
      useReactWindow
      setHideColumns={setHideColumns}
      infoPanelVisible={false}
      columnInfoPanelStorageName={columnInfoPanelStorageName}
      withoutWideColumn
    />
  );
};

export default inject(({ userStore }: TStore) => {
  return {
    userId: userStore.user!.id,
  };
})(observer(TableHeader));
