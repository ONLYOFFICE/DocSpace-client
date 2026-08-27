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

// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import type { CSSProperties } from "react";

/**
 * Columns the apps grid uses at its widest.
 *
 * The grid stretches its cards across the whole row however many there are -
 * the quick actions above it do the same - so the column count follows the
 * number of cards instead of being fixed at four: a portal with AI services off
 * has three apps and no reason to leave a fourth column's worth of empty space.
 * Past four the cards wrap onto a second row rather than getting narrower.
 */
export const MODULES_GRID_MAX_COLUMNS = 4;

/**
 * Feeds `--modules-columns`, which `.modulesGrid` builds its columns from. The
 * narrower container widths override the count with their own (two columns,
 * then one), so this only decides the widest layout.
 */
export const modulesGridStyle = (moduleCount: number): CSSProperties =>
  ({
    "--modules-columns": Math.min(moduleCount, MODULES_GRID_MAX_COLUMNS),
  }) as CSSProperties;

export const getGreetingKey = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "GoodMorning";
  if (hour >= 12 && hour < 18) return "GoodAfternoon";
  return "GoodEvening";
};

export const NEW_FILE_NAMES = {
  document: "New document.docx",
  spreadsheet: "New spreadsheet.xlsx",
  presentation: "New presentation.pptx",
  pdf: "New PDF form.pdf",
} as const;

export const makeCreateUrl = (
  fileTitle: string,
  parentId: number | null,
): string => {
  const params = new URLSearchParams({ fileTitle });
  if (parentId) params.set("parentId", String(parentId));
  return `/doceditor/create?${params.toString()}`;
};

export type AiFormsSettings = {
  roomId: number;
  libraryId?: number;
};
