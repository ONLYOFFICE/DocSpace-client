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

export const FILE_EXTENSIONS = {
  DOCX: ".docx",
  XLSX: ".xlsx",
  PPTX: ".pptx",
  PDF: ".pdf",
} as const;

export type FileExtension =
  (typeof FILE_EXTENSIONS)[keyof typeof FILE_EXTENSIONS];

export const TAB_IDS = {
  DOCUMENTS: "documents",
  SPREADSHEET: "spreadsheet",
  PRESENTATION: "presentation",
  FORMS: "forms",
} as const;

export type TabId = (typeof TAB_IDS)[keyof typeof TAB_IDS];

export const TAB_CONFIG = {
  [TAB_IDS.DOCUMENTS]: {
    id: TAB_IDS.DOCUMENTS,
    extension: FILE_EXTENSIONS.DOCX,
    translationKey: "Common:Documents",
    smallPreview: false,
  },
  [TAB_IDS.SPREADSHEET]: {
    id: TAB_IDS.SPREADSHEET,
    extension: FILE_EXTENSIONS.XLSX,
    translationKey: "Common:Spreadsheets",
    smallPreview: true,
  },
  [TAB_IDS.PRESENTATION]: {
    id: TAB_IDS.PRESENTATION,
    extension: FILE_EXTENSIONS.PPTX,
    translationKey: "Common:Presentations",
    smallPreview: true,
  },
  [TAB_IDS.FORMS]: {
    id: TAB_IDS.FORMS,
    extension: FILE_EXTENSIONS.PDF,
    translationKey: "Common:PDFs",
    smallPreview: false,
  },
} as const;

export const SCROLL_HEIGHTS = {
  MOBILE: "calc(100vh - 227px)",
  DESKTOP: "calc(100vh - 286px)",
  MOBILE_FORMS_ONLY: "calc(100vh - 190px)",
  DESKTOP_FORMS_ONLY: "calc(100vh - 244px)",
} as const;

export const LANGUAGE_CULTURE_MAP: Record<string, string> = {
  ar: "ar-SA",
  en: "en-US",
  el: "el-GR",
  hy: "hy-AM",
  ko: "ko-KR",
  lo: "lo-LA",
  pt: "pt-BR",
  uk: "uk-UA",
  ja: "ja-JP",
  zh: "zh-CN",
  sq: "sq-AL",
} as const;
