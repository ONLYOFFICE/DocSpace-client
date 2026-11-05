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

import type { DataTableVirtualize } from "@onlyoffice/apps-ui-kit/components/data-table";

/**
 * Class of the list that holds every row of a virtualised SDK DataTable. The
 * selection area measures the rows from its top, as it did from
 * react-virtualized's inner container for the old table.
 */
export const SDK_DATA_TABLE_LIST_CLASS = "sdk-data-table_list";

export const SDK_DATA_TABLE_VIRTUALIZE: DataTableVirtualize = {
  innerClassName: SDK_DATA_TABLE_LIST_CLASS,
};

/** The old table's element ids. */
export const SDK_TABLE_IDS = {
  table: "table-container",
  header: "table-container_caption-header",
} as const;

/** The old table's test ids, which the SDK's specs look for. */
export const SDK_TABLE_TEST_IDS = {
  table: "table-container",
  header: "table-header",
  body: "table-body",
  row: "table-row",
  cell: "table-cell",
  contextMenuButton: "context-menu-button",
} as const;

/**
 * Key of a table's DataTable widths, one per table, section and user. The old
 * pixel records (`<prefix>Columns`, `<prefix>InfoPanelColumns`) are not read.
 */
export const getColumnWidthsStorageName = (
  prefix: string,
  userId?: string | null,
  section?: string,
) =>
  `${prefix}ColumnsWidths_ver-1${section ? `_${section}` : ""}=${userId || "guest"}`;
