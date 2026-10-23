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

type TableHeaderProps = {
  tableRef: RefObject<HTMLDivElement | null>;
  sectionWidth: number;
  columnStorageName: string;
  columnInfoPanelStorageName: string;
  setHideColumns: (value: boolean) => void;
};

const TableHeader = ({ tableRef, ...rest }: TableHeaderProps) => {
  const { t } = useTranslation(["Metadata", "Common"]);

  const columns: TTableColumn[] = [
    {
      key: "Name",
      title: t("Common:Name"),
      enable: true,
      default: true,
      resizable: true,
      minWidth: 110,
    },
    {
      key: "Fields",
      title: t("Metadata:Fields"),
      enable: true,
      resizable: true,
    },
    {
      key: "Author",
      title: t("Common:ByAuthor"),
      enable: true,
      resizable: true,
    },
    {
      key: "Modified",
      title: t("Common:ByLastModified"),
      enable: true,
      resizable: true,
    },
    {
      key: "Visibility",
      title: t("Metadata:Visibility"),
      enable: true,
      resizable: true,
    },
  ];

  return (
    <TableHeaderComponent
      containerRef={tableRef}
      columns={columns}
      showSettings={false}
      infoPanelVisible={false}
      useReactWindow
      withoutWideColumn
      {...rest}
    />
  );
};

export default TableHeader;
