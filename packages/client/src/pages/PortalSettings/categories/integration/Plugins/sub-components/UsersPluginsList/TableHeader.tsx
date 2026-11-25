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

import type { RefObject } from "react";
import { useTranslation } from "react-i18next";

import {
  TableHeader as TableHeaderComponent,
  type TTableColumn,
} from "@onlyoffice/apps-ui-kit/components/table";

import type { THideableColumn, TUsersPluginsSort } from "./utils";

type TableHeaderProps = {
  tableRef: RefObject<HTMLDivElement | null>;
  sectionWidth: number;
  columnStorageName: string;
  columnInfoPanelStorageName: string;
  setHideColumns: (value: boolean) => void;
  hiddenColumns: THideableColumn[];
  onColumnChange: (key: string) => void;
  sort: TUsersPluginsSort;
  onSort: (sortBy: string) => void;
};

const TableHeader = ({
  tableRef,
  hiddenColumns,
  onColumnChange,
  sort,
  onSort,
  ...rest
}: TableHeaderProps) => {
  const { t } = useTranslation(["WebPlugins", "Common"]);

  const hideable = (key: THideableColumn) => ({
    key,
    enable: !hiddenColumns.includes(key),
    onChange: onColumnChange,
    resizable: true,
  });

  const columns: TTableColumn[] = [
    {
      key: "Name",
      title: t("Plugin"),
      enable: true,
      default: true,
      resizable: true,
      minWidth: 160,
      sortBy: "plugin",
      onClick: onSort,
    },
    {
      ...hideable("User"),
      title: t("Common:User"),
      sortBy: "user",
      onClick: onSort,
    },
    { ...hideable("Version"), title: t("Common:Version") },
    { ...hideable("Domains"), title: t("Domains") },
    {
      ...hideable("Uploaded"),
      title: t("Uploaded"),
      sortBy: "uploaded",
      onClick: onSort,
    },
    { ...hideable("Enabled"), title: t("Common:Enabled") },
  ];

  return (
    <TableHeaderComponent
      containerRef={tableRef}
      columns={columns}
      sortBy={sort.sortBy}
      sorted={sort.descending}
      showSettings
      settingsTitle={t("Common:TableSettingsTitle")}
      infoPanelVisible={false}
      useReactWindow
      withoutWideColumn
      {...rest}
    />
  );
};

export default TableHeader;
