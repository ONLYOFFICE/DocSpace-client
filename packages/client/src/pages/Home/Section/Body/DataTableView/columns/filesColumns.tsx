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

import type React from "react";

import { SortByFieldName } from "@docspace/shared/enums";
import {
  contextMenuColumn,
  settingsColumn,
  type DataTableColumn,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import {
  AuthorColumnCell,
  DateColumnCell,
  ErasureColumnCell,
  LastOpenedColumnCell,
  LocationColumnCell,
  NameCell,
  SizeColumnCell,
  TypeColumnCell,
} from "../cells/FilesCells";
import type {
  TFilesColumnFlags,
  TFilesColumnsOptions,
  TFilesTableItem,
} from "../DataTableView.types";
import type { TCellKind, TSection, TSectionColumn } from "./sections";

type TCellProps = { isLast: boolean; sideColor: string };

const CELLS: Record<TCellKind, (props: TCellProps) => React.ReactNode> = {
  author: AuthorColumnCell,
  created: (props) => <DateColumnCell create {...props} />,
  modified: (props) => <DateColumnCell create={false} {...props} />,
  lastOpened: LastOpenedColumnCell,
  erasure: ErasureColumnCell,
  size: SizeColumnCell,
  type: TypeColumnCell,
  location: LocationColumnCell,
};

/** The columns the section has, given where it is shown. */
const columnsOf = (section: TSection, options: TFilesColumnsOptions) =>
  section.columns.filter((column) => column.when?.(options) ?? true);

/**
 * The visible-columns record in the exact shape the old header writes: every
 * column of the section in its order, a disabled one as `false`, a column the
 * section does not have here as an empty slot. The old table resets its column
 * sizes when the record's length differs from its column count, so the shape
 * matters as long as both tables share the key.
 */
export const filesColumnsRecord = (
  section: TSection,
  flags: TFilesColumnFlags,
  options: TFilesColumnsOptions,
) =>
  [
    "Name",
    ...section.columns.map((column) =>
      (column.when?.(options) ?? true) ? flags[column.id] && column.id : "",
    ),
  ].join(",");

/** The section's column with this id, among those it has. */
export const findSectionColumn = (
  section: TSection,
  options: TFilesColumnsOptions,
  id: string,
): TSectionColumn | undefined =>
  columnsOf(section, options).find((column) => column.id === id);

export const getFilesColumns = (
  section: TSection,
  options: TFilesColumnsOptions,
): DataTableColumn<TFilesTableItem>[] => {
  const { t, flags, sideColor } = options;
  const { testIdPrefix, quickButtons } = section;

  // The old table's cell test ids, which the client's specs find cells by.
  const cellTestId = (part: string) => (_: TFilesTableItem, index: number) =>
    `${testIdPrefix}-cell-${part}-${index}`;

  return [
    {
      id: "Name",
      cellTestId: cellTestId("name"),
      title: t("Common:Label"),
      width: { type: "fill" },
      sortKey: section.nameSortable ? SortByFieldName.Name : undefined,
      // The old table's name-cell class: drag and drop and the selected-row
      // styles of `StyledTable.module.scss` look for it.
      cellClassName: "table-container_file-name-cell",
      cell: (_, { isLast }) => <NameCell isLast={isLast && quickButtons} />,
    },
    ...columnsOf(section, options).map(
      (column): DataTableColumn<TFilesTableItem> => {
        const Cell = CELLS[column.cell];

        return {
          id: column.id,
          cellTestId: cellTestId(column.testId),
          title: column.title(t),
          width: { type: "flex" },
          visible: flags[column.id],
          hideable: true,
          sortKey: column.sortKey,
          sortable: column.sortable,
          cell: (_, { isLast }) => (
            <Cell isLast={isLast && quickButtons} sideColor={sideColor} />
          ),
        };
      },
    ),
    options.showSettings
      ? settingsColumn<TFilesTableItem>({
          title: t("Common:TableSettingsTitle"),
          withContextMenu: true,
        })
      : contextMenuColumn<TFilesTableItem>(),
  ];
};
