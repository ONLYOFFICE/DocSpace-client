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

import type { TFile, TFolder } from "@docspace/shared/api/files/types";

/** A row of the files list: a file or a folder, as `filesStore.filesList` gives it. */
export type TFilesTableItem = (TFile | TFolder) & {
  icon?: string;
  isFolder?: boolean;
  fileExst?: string;
  contentLength?: string;
  daysRemaining?: number;
  isThirdPartyFolder?: boolean;
  /** Filled in by `filesStore` for the row menu. */
  contextOptions?: unknown[];
};

/**
 * Whether each column of the section is on, by column id, as `tableStore`
 * holds it.
 */
export type TFilesColumnFlags = Record<string, boolean>;

export type TFilesColumnsOptions = {
  t: TFunction;
  /** Colour of the secondary cells. */
  sideColor: string;
  flags: TFilesColumnFlags;
  /** A public room shows no author. */
  isPublicRoom: boolean;
  /** Read-only "My documents" shows when each item is erased. */
  isPersonalReadOnly: boolean;
  /** False in the SDK frame when its config hides the column settings. */
  showSettings: boolean;
  /** Width of the "#" column, wide enough for the longest order loaded. */
  indexColumnSize: number;
  /** The rows are being reordered: no resizing, column settings or row menus. */
  isIndexEditingMode: boolean;
};
