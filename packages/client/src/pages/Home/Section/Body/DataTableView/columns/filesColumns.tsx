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
import classNames from "classnames";

import { SortByFieldName } from "@docspace/shared/enums";
import {
  DATA_TABLE_SETTINGS_WIDTH,
  contextMenuColumn,
  settingsColumn,
  type DataTableColumn,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import {
  AccessLevelColumnCell,
  AuthorColumnCell,
  DateColumnCell,
  ErasureColumnCell,
  IndexColumnCell,
  LastOpenedColumnCell,
  LocationColumnCell,
  NameCell,
  SharedByColumnCell,
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
  sharedBy: SharedByColumnCell,
  accessLevel: AccessLevelColumnCell,
};

// The old rows' class on the last column's cells: its text keeps 8px from the
// end instead of 12px (`StyledTable.module.scss`).
const LAST_COLUMN_CLASS = "no-extra-space";

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
    // Never hidden: the old header had no setting for it.
    ...(section.withIndex ? ["Index"] : []),
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
  const { t, flags, sideColor, isIndexEditingMode } = options;
  const { quickButtons } = section;

  // The old table's cell test ids, which the client's specs find cells by.
  const cellTestId = (part: string) => (_: TFilesTableItem, index: number) =>
    section.cellTestId(part, index);

  const sectionColumns = columnsOf(section, options);
  // Never Name, as in the old rows; in compact the column is not drawn anyway.
  const lastId = sectionColumns.findLast((column) => flags[column.id])?.id;

  // While the rows are reordered the old header ignored drags on its handles.
  const resizable = !isIndexEditingMode;

  const index: DataTableColumn<TFilesTableItem>[] = section.withIndex
    ? [
        {
          id: "Index",
          cellTestId: cellTestId("order"),
          title: "#",
          width: { type: "fixed", size: options.indexColumnSize },
          // The selected-row styles reach into the gutter from this cell, the
          // row's first, as they do from the name cell elsewhere.
          cellClassName: "table-container_index-cell",
          cell: () => <IndexColumnCell sideColor={sideColor} />,
        },
      ]
    : [];

  return [
    ...index,
    {
      id: "Name",
      cellTestId: cellTestId("name"),
      title: t("Common:Label"),
      width: { type: "fill" },
      resizable,
      sortKey: section.nameSortable ? SortByFieldName.Name : undefined,
      // The old table's name-cell class: drag and drop and the selected-row
      // styles of `StyledTable.module.scss` look for it.
      cellClassName: classNames("table-container_file-name-cell", {
        // The reorder arrows at the end of Name reach into the gutter.
        "index-buttons-name": isIndexEditingMode && !lastId,
      }),
      cell: (_, { isLast }) => <NameCell isLast={isLast && quickButtons} />,
    },
    ...sectionColumns.map((column): DataTableColumn<TFilesTableItem> => {
      const Cell = CELLS[column.cell];
      const isLastColumn = column.id === lastId;

      return {
        id: column.id,
        cellTestId: cellTestId(column.testId),
        title: column.title(t),
        width: { type: "flex" },
        resizable,
        visible: flags[column.id],
        hideable: true,
        sortKey: column.sortKey,
        sortable: column.sortable,
        cellClassName: classNames({
          [LAST_COLUMN_CLASS]: isLastColumn,
          "index-buttons": isLastColumn && isIndexEditingMode,
        }),
        cell: (_, { isLast }) => (
          <Cell isLast={isLast && quickButtons} sideColor={sideColor} />
        ),
      };
    }),
    lastColumn(options),
  ];
};

/**
 * The settings button with the row menus, or the row menus alone in the SDK
 * frame that hides the settings. While the rows are reordered the old rows
 * dropped their menu cell and the header greyed the settings out.
 */
const lastColumn = ({
  t,
  showSettings,
  isIndexEditingMode,
}: TFilesColumnsOptions): DataTableColumn<TFilesTableItem> => {
  if (!showSettings && isIndexEditingMode)
    return {
      id: "ContextMenu",
      title: "",
      width: { type: "fixed", size: DATA_TABLE_SETTINGS_WIDTH },
      cell: () => null,
    };

  return showSettings
    ? settingsColumn<TFilesTableItem>({
        title: t("Common:TableSettingsTitle"),
        withContextMenu: !isIndexEditingMode,
        disabled: isIndexEditingMode,
      })
    : contextMenuColumn<TFilesTableItem>();
};
