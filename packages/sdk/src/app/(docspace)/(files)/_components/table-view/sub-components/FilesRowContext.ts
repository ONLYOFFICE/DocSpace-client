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
import { createContext, use } from "react";

/**
 * What a table row knows about its item and its cells render: the row reads
 * the stores once, the cells only lay it out.
 */
export type TFilesRowValue = {
  /** The item's icon, which turns into the row's checkbox. */
  icon: React.ReactNode;
  checked: boolean;
  /** An operation on the item runs: a loader in place of the icon. */
  loading?: boolean;
  selectLabel: string;
  onSelect: () => void;
  onOpen: (e: React.MouseEvent) => void;
  titleWithoutExt: string;
  /** The extension after the title, when the portal shows it. */
  fileExst: string;
  badges: React.ReactNode;
  quickButtons: React.ReactNode;
  /** The content of a column after Name. */
  renderCell: (columnKey: string) => React.ReactNode;
};

export const FilesRowContext = createContext<TFilesRowValue | null>(null);

export const useFilesRow = () => use(FilesRowContext);
