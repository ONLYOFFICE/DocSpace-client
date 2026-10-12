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

import { FolderType, SortByFieldName } from "@docspace/shared/enums";

import type { TFileItem, TFolderItem } from "../../../_hooks/useItemList";

/**
 * Every column the SDK files table can render. The visible set and order is
 * section-specific (see {@link getSectionColumns}); this union is the closed
 * set of cell kinds the header and the row both understand.
 */
export type ColumnKey =
  | "Name"
  | "Author"
  | "Created"
  | "Modified"
  | "Size"
  | "Type"
  | "Location"
  | "LastOpened"
  | "Erasure"
  | "AccessLevel"
  | "SharedBy";

export type SectionColumn = {
  key: ColumnKey;
  /**
   * Present only for sortable columns. The client model: a column is sortable
   * iff it carries a `sortBy`; display-only columns omit it. The visible title
   * is resolved from `key` in the header via literal `t()` calls (so the i18n
   * usage scanner can see the keys) — see `getColumnTitle`.
   */
  sortBy?: SortByFieldName;
};

const NAME_SORTABLE: SectionColumn = {
  key: "Name",
  sortBy: SortByFieldName.Name,
};
const NAME_PLAIN: SectionColumn = { key: "Name" };

// Each section's ordered columns, mirroring the main client. `Name` is always
// first; `sortBy` marks the sortable columns for that section.
const FILES_COLUMNS: SectionColumn[] = [
  NAME_SORTABLE,
  { key: "Author", sortBy: SortByFieldName.Author },
  { key: "Created", sortBy: SortByFieldName.CreationDate },
  { key: "Modified", sortBy: SortByFieldName.ModifiedDate },
  { key: "Size", sortBy: SortByFieldName.Size },
  { key: "Type", sortBy: SortByFieldName.Type },
];

const FAVORITES_COLUMNS: SectionColumn[] = [
  NAME_PLAIN,
  { key: "Author" },
  { key: "Location" },
  { key: "Modified", sortBy: SortByFieldName.ModifiedDate },
  { key: "Size" },
  { key: "Type" },
];

const RECENT_COLUMNS: SectionColumn[] = [
  NAME_PLAIN,
  { key: "Author" },
  { key: "Location" },
  { key: "LastOpened" },
  { key: "Size" },
  { key: "Type" },
];

const TRASH_COLUMNS: SectionColumn[] = [
  NAME_SORTABLE,
  { key: "Location", sortBy: SortByFieldName.Location },
  { key: "Author", sortBy: SortByFieldName.Author },
  { key: "Created", sortBy: SortByFieldName.CreationDate },
  // Erasure (auto-delete countdown) sorts by modified date in the client.
  { key: "Erasure", sortBy: SortByFieldName.ModifiedDate },
  { key: "Size", sortBy: SortByFieldName.Size },
  { key: "Type", sortBy: SortByFieldName.Type },
];

const SHARE_COLUMNS: SectionColumn[] = [
  NAME_SORTABLE,
  { key: "SharedBy" },
  { key: "Author" },
  { key: "AccessLevel" },
  { key: "Modified", sortBy: SortByFieldName.ModifiedDate },
  { key: "Size", sortBy: SortByFieldName.Size },
  { key: "Type" },
];

/**
 * Ordered columns for the given section. Single source of truth consumed by
 * both the table header and the row, so columns and cells never drift.
 */
export const getSectionColumns = (
  rootFolderType: FolderType | null | undefined,
): SectionColumn[] => {
  switch (rootFolderType) {
    case FolderType.Favorites:
      return FAVORITES_COLUMNS;
    case FolderType.Recent:
      return RECENT_COLUMNS;
    case FolderType.TRASH:
      return TRASH_COLUMNS;
    case FolderType.SHARE:
      return SHARE_COLUMNS;
    default:
      return FILES_COLUMNS;
  }
};

/**
 * Per-section localStorage key for column visibility, so toggling a column in
 * one section never affects another (matches the client's per-section keys).
 */
export const getColumnStorageKey = (
  baseKey: string,
  rootFolderType: FolderType | null | undefined,
): string => `${baseKey}_${rootFolderType ?? "default"}`;

/**
 * `lastOpened` (Recent) and `daysRemaining` (Trash/Erasure) are returned by the
 * backend at runtime but are not declared on TFile/TFolder. Narrow to this
 * shape at the cell instead of casting ad hoc.
 */
export type WithRuntimeFields = {
  /** Recent: last access time (ISO). */
  lastOpened?: string;
  /** Trash: auto-deletion date (ISO) the erasure countdown is derived from. */
  autoDelete?: string;
};

export type TableItem = TFileItem | TFolderItem;
