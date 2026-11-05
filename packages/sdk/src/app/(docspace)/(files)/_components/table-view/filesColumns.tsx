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

import type { TFunction } from "i18next";

import {
  settingsColumn,
  type DataTableColumn,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import { SDK_TABLE_TEST_IDS } from "@/app/(docspace)/_components/data-table/constants";

import type { ColumnKey, SectionColumn, TableItem } from "./columns";
import { ColumnCell, NameCell } from "./sub-components/FilesCells";

// Resolve a column's header title. Literal `t()` calls (not a dynamic key) so
// the i18n usage scanner sees every key. All keys live in the Common namespace
// (the only namespace the SDK bundles).
const getColumnTitle = (key: ColumnKey, t: TFunction): string => {
  switch (key) {
    case "Name":
      return t("Common:Label");
    case "Author":
      return t("Common:ByAuthor");
    case "Created":
      return t("Common:ByCreation");
    case "Modified":
      return t("Common:LastModifiedDate");
    case "Size":
      return t("Common:Size");
    case "Type":
      return t("Common:Type");
    case "Location":
      return t("Common:Location");
    case "LastOpened":
      return t("Common:LastOpened");
    case "Erasure":
      return t("Common:ByErasure");
    case "AccessLevel":
      return t("Common:AccessLevel");
    case "SharedBy":
      return t("Common:SharedBy");
    default:
      return "";
  }
};

const cellTestId = () => SDK_TABLE_TEST_IDS.cell;

/**
 * The section's columns on the DataTable, in its order: Name, which is never
 * hidden, the section's other columns, then the settings button with the row
 * menus. A column sorts from its header only when the section gives it a
 * `sortBy`.
 */
export const getFilesColumns = (
  sectionColumns: SectionColumn[],
  t: TFunction,
  isVisible: (key: string) => boolean,
): DataTableColumn<TableItem>[] => [
  ...sectionColumns.map((column): DataTableColumn<TableItem> => {
    const common = {
      id: column.key,
      title: getColumnTitle(column.key, t),
      sortKey: column.sortBy,
      cellTestId,
    };

    if (column.key === "Name")
      return {
        ...common,
        width: { type: "fill" },
        // The old name-cell class, which drag and drop looks for.
        cellClassName: "table-container_file-name-cell",
        cell: (_, { isLast }) => <NameCell isLast={isLast} />,
      };

    return {
      ...common,
      width: { type: "flex" },
      visible: isVisible(column.key),
      hideable: true,
      cell: (_, { isLast }) => (
        <ColumnCell columnKey={column.key} isLast={isLast} />
      ),
    };
  }),
  settingsColumn<TableItem>({
    title: t("Common:TableSettingsTitle"),
    withContextMenu: true,
    contextMenuButtonTestId: SDK_TABLE_TEST_IDS.contextMenuButton,
  }),
];
