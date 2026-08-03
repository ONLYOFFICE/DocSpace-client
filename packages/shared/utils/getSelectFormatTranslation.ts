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

import { FilterType } from "../enums";
import type { TTranslation } from "../types";

import { getManyPDFTitle } from "./getPDFTite";

export const getSelectFormatTranslation = (
  t: TTranslation,
  filterParam: string | number,
  logoText: string,
): string => {
  const getTranslatedType = (key: string, typeToLowerCase = true) => {
    let type = t(key);

    if (typeToLowerCase) type = type.toLowerCase();

    return t("Common:SelectTypeFiles", { type });
  };

  switch (filterParam) {
    case FilterType.DocumentsOnly:
      return getTranslatedType("Common:Documents");

    case FilterType.SpreadsheetsOnly:
      return getTranslatedType("Common:Spreadsheets");

    case FilterType.PresentationsOnly:
      return getTranslatedType("Common:Presentations");

    case FilterType.DiagramsOnly:
      return getTranslatedType("Common:Diagrams");

    case FilterType.ImagesOnly:
      return getTranslatedType("Common:Images");

    case FilterType.ArchiveOnly:
      return getTranslatedType("Common:Archives");

    case FilterType.FoldersOnly:
      return getTranslatedType("Common:Folders");

    case FilterType.MediaOnly:
      return t("Common:SelectExtensionFiles", {
        extension: t("Common:Media").toLowerCase(),
      });

    case FilterType.Pdf:
      return getTranslatedType(getManyPDFTitle(t, false));

    case FilterType.PDFForm:
      return getTranslatedType(getManyPDFTitle(t, true));

    case "EditorSupportedTypes":
      return getTranslatedType(
        t("Common:AllTypesAvailableForEditing", { organizationName: logoText }),
        false,
      );

    default:
      return "";
  }
};
