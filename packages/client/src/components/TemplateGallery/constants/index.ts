// (c) Copyright Ascensio System SIA 2009-2025
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
    translationKey: "Common:Spreadsheet",
    smallPreview: true,
  },
  [TAB_IDS.PRESENTATION]: {
    id: TAB_IDS.PRESENTATION,
    extension: FILE_EXTENSIONS.PPTX,
    translationKey: "Common:Presentation",
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
