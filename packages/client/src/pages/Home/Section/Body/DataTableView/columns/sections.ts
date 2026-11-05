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

import { SortByFieldName } from "@docspace/shared/enums";

import type TableStore from "SRC_DIR/store/TableStore";
import type { TTableScope } from "SRC_DIR/store/TableStore";

import type { TFilesColumnsOptions } from "../DataTableView.types";

/** What a column's cells show; each kind is one of the old table's cells. */
export type TCellKind =
  | "author"
  | "created"
  | "modified"
  | "lastOpened"
  | "erasure"
  | "size"
  | "type"
  | "location"
  | "sharedBy"
  | "accessLevel";

/** The `tableStore` property that says whether a column is on. */
type TColumnFlag = {
  [K in keyof TableStore]: TableStore[K] extends boolean ? K : never;
}[keyof TableStore];

/** One column of a section, as the old header described it. */
export type TSectionColumn = {
  /** The old header's key: the visible-columns record and `setColumnEnable` use it. */
  id: string;
  flag: TColumnFlag;
  title: (t: TFunction) => string;
  cell: TCellKind;
  /** The column's part of the old cell test id (`TSection.cellTestId`). */
  testId: string;
  /** The old header's `sortBy`: the sort it shows, and turns the column on for. */
  sortKey?: SortByFieldName;
  /** Whether a click on the header sorts, the old header's `onClick`. */
  sortable?: boolean;
  /** Whether the section has the column at all; it always has by default. */
  when?: (options: TFilesColumnsOptions) => boolean;
};

/** A section of the documents table: its columns after Name, and how its rows differ. */
export type TSection = {
  /** The old table's test id of a cell, from the column's part and the row index. */
  cellTestId: (part: string, index: number) => string;
  /** Whether a click on Name sorts by name. */
  nameSortable: boolean;
  /** Whether a fixed "#" column with each item's order comes before Name. */
  withIndex?: boolean;
  /** Whether the last column carries the row's quick buttons. */
  quickButtons: boolean;
  columns: TSectionColumn[];
};

/** The scopes the DataTable draws, and so the ones `SECTIONS` describes. */
export type TFilesSection = Extract<
  TTableScope,
  | "files"
  | "trash"
  | "recent"
  | "favorites"
  | "sharedWithMe"
  | "inSharedFolder"
  | "vdrIndexing"
>;

/** `<section>-cell-<part>-<index>`, the test ids of most old rows. */
const dashed = (section: string) => (part: string, index: number) =>
  `${section}-cell-${part}-${index}`;

/**
 * Shared with me and the folders inside it: one set of columns, but only the
 * section's own list says who shared each item.
 */
const sharedColumns = (inFolder: boolean): TSectionColumn[] => [
  {
    id: "SharedByShareWithMe",
    flag: "sharedByShareWithMeColumnIsEnabled",
    title: (t) => t("Common:SharedBy"),
    cell: "sharedBy",
    testId: "shared-by",
    when: ({ isPublicRoom }) => !inFolder && !isPublicRoom,
  },
  {
    id: "AuthorShareWithMe",
    flag: "authorShareWithMeColumnIsEnabled",
    title: (t) => t("Common:ByAuthor"),
    cell: "author",
    testId: "author",
    when: ({ isPublicRoom }) => !isPublicRoom,
  },
  {
    id: "AccessLevelShareWithMe",
    flag: "accessLevelShareWithMeColumnIsEnabled",
    title: (t) => t("Common:AccessLevel"),
    cell: "accessLevel",
    testId: "access-level",
  },
  {
    id: "ModifiedShareWithMe",
    flag: "modifiedShareWithMeColumnIsEnabled",
    title: (t) => t("Common:ByLastModified"),
    cell: "modified",
    testId: "modified",
    sortKey: SortByFieldName.ModifiedDate,
  },
  {
    id: "SizeShareWithMe",
    flag: "sizeShareWithMeColumnIsEnabled",
    title: (t) => t("Common:Size"),
    cell: "size",
    testId: "size",
    sortKey: SortByFieldName.Size,
  },
  {
    id: "TypeShareWithMe",
    flag: "typeShareWithMeColumnIsEnabled",
    title: (t) => t("Common:Type"),
    cell: "type",
    testId: "type",
  },
];

/**
 * The old header's columns for each section (`getFilesColumns`,
 * `getTrashFolderColumns`, `getRecentFolderColumns`,
 * `getFavoritesFolderColumns`, `getSharedWithMeFolderColumns`,
 * `getIndexingColumns` in `TableView/TableHeader.js`), in their order.
 */
export const SECTIONS: Record<TFilesSection, TSection> = {
  files: {
    cellTestId: dashed("files"),
    nameSortable: true,
    quickButtons: true,
    columns: [
      {
        id: "Author",
        flag: "authorColumnIsEnabled",
        title: (t) => t("Common:ByAuthor"),
        cell: "author",
        testId: "author",
        sortKey: SortByFieldName.Author,
        sortable: false,
        when: ({ isPublicRoom }) => !isPublicRoom,
      },
      {
        id: "Created",
        flag: "createdColumnIsEnabled",
        title: (t) => t("Common:ByCreation"),
        cell: "created",
        testId: "created",
        sortKey: SortByFieldName.CreationDate,
        sortable: false,
      },
      {
        id: "Modified",
        flag: "modifiedColumnIsEnabled",
        title: (t) => t("Common:ByLastModified"),
        cell: "modified",
        testId: "modified",
        sortKey: SortByFieldName.ModifiedDate,
      },
      {
        id: "Erasure",
        flag: "erasureColumnIsEnabled",
        title: (t) => t("Common:ByErasure"),
        cell: "erasure",
        testId: "erasure",
        sortKey: SortByFieldName.ModifiedDate,
        when: ({ isPersonalReadOnly }) => isPersonalReadOnly,
      },
      {
        id: "Size",
        flag: "sizeColumnIsEnabled",
        title: (t) => t("Common:Size"),
        cell: "size",
        testId: "size",
        sortKey: SortByFieldName.Size,
      },
      {
        id: "Type",
        flag: "typeColumnIsEnabled",
        title: (t) => t("Common:Type"),
        cell: "type",
        testId: "type",
        sortKey: SortByFieldName.Type,
        sortable: false,
      },
    ],
  },

  trash: {
    cellTestId: dashed("trash"),
    nameSortable: true,
    // The old trash row never drew them.
    quickButtons: false,
    columns: [
      {
        id: "Location",
        flag: "locationColumnIsEnabled",
        title: (t) => t("Common:Location"),
        cell: "location",
        testId: "location",
        sortKey: SortByFieldName.Location,
        sortable: false,
      },
      {
        id: "AuthorTrash",
        flag: "authorTrashColumnIsEnabled",
        title: (t) => t("Common:ByAuthor"),
        cell: "author",
        testId: "author",
        sortKey: SortByFieldName.Author,
        sortable: false,
      },
      {
        id: "CreatedTrash",
        flag: "createdTrashColumnIsEnabled",
        title: (t) => t("Common:ByCreation"),
        cell: "created",
        testId: "created",
        sortKey: SortByFieldName.CreationDate,
        sortable: false,
      },
      {
        id: "Erasure",
        flag: "erasureColumnIsEnabled",
        title: (t) => t("Common:ByErasure"),
        cell: "erasure",
        testId: "erasure",
        sortKey: SortByFieldName.ModifiedDate,
      },
      {
        id: "SizeTrash",
        flag: "sizeTrashColumnIsEnabled",
        title: (t) => t("Common:Size"),
        cell: "size",
        testId: "size",
        sortKey: SortByFieldName.Size,
      },
      {
        id: "TypeTrash",
        flag: "typeTrashColumnIsEnabled",
        title: (t) => t("Common:Type"),
        cell: "type",
        testId: "type",
        sortKey: SortByFieldName.Type,
        sortable: false,
      },
    ],
  },

  // Recent is ordered by when each item was last opened; nothing in its
  // header sorts.
  recent: {
    cellTestId: dashed("recent"),
    nameSortable: false,
    quickButtons: true,
    columns: [
      {
        id: "AuthorRecent",
        flag: "authorRecentColumnIsEnabled",
        title: (t) => t("Common:ByAuthor"),
        cell: "author",
        testId: "author",
      },
      {
        id: "LocationRecent",
        flag: "locationRecentColumnIsEnabled",
        title: (t) => t("Common:Location"),
        cell: "location",
        testId: "location",
      },
      {
        id: "LastOpenedRecent",
        flag: "lastOpenedRecentColumnIsEnabled",
        title: (t) => t("Common:LastOpened"),
        cell: "lastOpened",
        testId: "lastopened",
      },
      {
        id: "SizeRecent",
        flag: "sizeRecentColumnIsEnabled",
        title: (t) => t("Common:Size"),
        cell: "size",
        testId: "size",
      },
      {
        id: "TypeRecent",
        flag: "typeRecentColumnIsEnabled",
        title: (t) => t("Common:Type"),
        cell: "type",
        testId: "type",
      },
    ],
  },

  favorites: {
    cellTestId: dashed("favorites"),
    nameSortable: false,
    quickButtons: true,
    columns: [
      {
        id: "AuthorFavorites",
        flag: "authorFavoritesColumnIsEnabled",
        title: (t) => t("Common:ByAuthor"),
        cell: "author",
        testId: "author",
      },
      {
        id: "LocationFavorites",
        flag: "locationFavoritesColumnIsEnabled",
        title: (t) => t("Common:Location"),
        cell: "location",
        testId: "location",
      },
      {
        id: "ModifiedFavorites",
        flag: "modifiedFavoritesColumnIsEnabled",
        title: (t) => t("Common:ByLastModified"),
        cell: "modified",
        testId: "modified",
        sortKey: SortByFieldName.ModifiedDate,
      },
      {
        id: "SizeFavorites",
        flag: "sizeFavoritesColumnIsEnabled",
        title: (t) => t("Common:Size"),
        cell: "size",
        testId: "size",
      },
      {
        id: "TypeFavorites",
        flag: "typeFavoritesColumnIsEnabled",
        title: (t) => t("Common:Type"),
        cell: "type",
        testId: "type",
      },
    ],
  },

  // The old table drew both with one row component, so the cell test ids are
  // the same.
  sharedWithMe: {
    cellTestId: dashed("shared-with-me"),
    nameSortable: true,
    quickButtons: true,
    columns: sharedColumns(false),
  },

  inSharedFolder: {
    cellTestId: dashed("shared-with-me"),
    nameSortable: true,
    quickButtons: true,
    columns: sharedColumns(true),
  },

  // A room with indexing: the items keep the order the room gives them, so
  // nothing in its header sorts.
  vdrIndexing: {
    cellTestId: (part, index) => `index_cell_${part}_${index}`,
    nameSortable: false,
    withIndex: true,
    quickButtons: true,
    columns: [
      {
        id: "AuthorIndexing",
        flag: "authorVDRColumnIsEnabled",
        title: (t) => t("Common:ByAuthor"),
        cell: "author",
        testId: "author",
        when: ({ isPublicRoom }) => !isPublicRoom,
      },
      {
        id: "CreatedIndexing",
        flag: "createdVDRColumnIsEnabled",
        title: (t) => t("Common:ByCreation"),
        cell: "created",
        testId: "created",
      },
      {
        id: "ModifiedIndexing",
        flag: "modifiedVDRColumnIsEnabled",
        title: (t) => t("Common:ByLastModified"),
        cell: "modified",
        testId: "modified",
      },
      {
        id: "SizeIndexing",
        flag: "sizeVDRColumnIsEnabled",
        title: (t) => t("Common:Size"),
        cell: "size",
        testId: "size",
      },
      {
        id: "TypeIndexing",
        flag: "typeVDRColumnIsEnabled",
        title: (t) => t("Common:Type"),
        cell: "type",
        testId: "type",
      },
    ],
  },
};

/** Whether the scope is one the DataTable draws. */
export const isFilesSection = (scope: TTableScope): scope is TFilesSection =>
  scope in SECTIONS;

/** Whether each column of the section is on, read from `tableStore`. */
export const readColumnFlags = (section: TSection, tableStore: TableStore) =>
  Object.fromEntries(
    section.columns.map((column) => [column.id, !!tableStore[column.flag]]),
  );
