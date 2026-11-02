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

import { SortByFieldName } from "@docspace/shared/enums";
import {
  contextMenuColumn,
  settingsColumn,
  type DataTableColumn,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import AuthorCell from "../../TableView/sub-components/AuthorCell";
import DateCell from "../../TableView/sub-components/DateCell";
import ErasureCell from "../../TableView/sub-components/ErasureCell";
import SizeCell from "../../TableView/sub-components/SizeCell";
import TypeCell from "../../TableView/sub-components/TypeCell";

import NameCell from "../cells/NameCell";
import { formatDate, ownerName } from "../cells/cellValues";
import type {
  TFilesColumnFlags,
  TFilesColumnsOptions,
  TFilesTableItem,
} from "../DataTableView.types";

/**
 * The column ids are the keys the old table stores visible columns under, so
 * both tables read and write the same record while they live side by side.
 */
export const FILES_COLUMN_FLAG: Record<string, keyof TFilesColumnFlags> = {
  Author: "author",
  Created: "created",
  Modified: "modified",
  Erasure: "erasure",
  Size: "size",
  Type: "type",
};

/**
 * The visible-columns record in the exact shape the old table writes: every
 * column of the section in its order, a disabled one as `false`, a column the
 * section does not have as an empty slot. The old table resets its column sizes
 * when the record's length differs from its column count, so the shape matters
 * as long as both tables share the key.
 */
export const filesColumnsRecord = (
  flags: TFilesColumnFlags,
  { isPublicRoom, isPersonalReadOnly }: TFilesColumnsOptions,
) =>
  [
    "Name",
    isPublicRoom ? undefined : flags.author && "Author",
    flags.created && "Created",
    flags.modified && "Modified",
    isPersonalReadOnly ? flags.erasure && "Erasure" : undefined,
    flags.size && "Size",
    flags.type && "Type",
  ].join(",");

export const getFilesColumns = (
  options: TFilesColumnsOptions,
): DataTableColumn<TFilesTableItem>[] => {
  const { t, flags, sideColor, isPublicRoom, isPersonalReadOnly } = options;

  const columns: (DataTableColumn<TFilesTableItem> | false)[] = [
    {
      id: "Name",
      title: t("Common:Label"),
      width: { type: "fill" },
      sortKey: SortByFieldName.Name,
      cell: (item) => <NameCell item={item} options={options} />,
    },
    !isPublicRoom && {
      id: "Author",
      title: t("Common:ByAuthor"),
      width: { type: "flex" },
      visible: flags.author,
      hideable: true,
      cell: (item) => (
        <AuthorCell
          item={item}
          sideColor={sideColor}
          fileOwner={ownerName(item, options)}
        />
      ),
    },
    {
      id: "Created",
      title: t("Common:ByCreation"),
      width: { type: "flex" },
      visible: flags.created,
      hideable: true,
      cell: (item) => (
        <DateCell
          create
          sideColor={sideColor}
          createdDate={formatDate(item.created, options)}
          updatedDate=""
          lastOpenedDate=""
          isRecentFolder={false}
        />
      ),
    },
    {
      id: "Modified",
      title: t("Common:ByLastModified"),
      width: { type: "flex" },
      visible: flags.modified,
      hideable: true,
      sortKey: SortByFieldName.ModifiedDate,
      cell: (item) => (
        <DateCell
          create={false}
          sideColor={sideColor}
          createdDate=""
          updatedDate={formatDate(item.updated, options)}
          lastOpenedDate=""
          isRecentFolder={false}
        />
      ),
    },
    isPersonalReadOnly && {
      id: "Erasure",
      title: t("Common:ByErasure"),
      width: { type: "flex" },
      visible: flags.erasure,
      hideable: true,
      sortKey: SortByFieldName.ModifiedDate,
      cell: (item) => <ErasureCell t={t} sideColor={sideColor} item={item} />,
    },
    {
      id: "Size",
      title: t("Common:Size"),
      width: { type: "flex" },
      visible: flags.size,
      hideable: true,
      sortKey: SortByFieldName.Size,
      cell: (item) => <SizeCell item={item} sideColor={sideColor} />,
    },
    {
      id: "Type",
      title: t("Common:Type"),
      width: { type: "flex" },
      visible: flags.type,
      hideable: true,
      cell: (item) => <TypeCell t={t} item={item} sideColor={sideColor} />,
    },
    options.showSettings
      ? settingsColumn<TFilesTableItem>({
          title: t("Common:TableSettingsTitle"),
          withContextMenu: true,
        })
      : contextMenuColumn<TFilesTableItem>(),
  ];

  return columns.filter(
    (column): column is DataTableColumn<TFilesTableItem> => !!column,
  );
};
