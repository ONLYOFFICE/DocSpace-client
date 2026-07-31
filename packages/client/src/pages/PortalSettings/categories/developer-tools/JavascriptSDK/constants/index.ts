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

export const showPreviewThreshold = 720;

export const dimensionsModel = [
  { key: "percent", label: "%", default: true },
  { key: "pixel", label: "px" },
];

export const defaultSize = {
  width: "100",
  height: "100",
};

export const sdkVersion = {
  "101": "1.0.1",
  "200": "2.0.0",
  "210": "2.1.0",
  "220": "2.2.0",
} as const;

export const sdkSource = {
  Package: "package",
  Script: "script",
} as const;

export const defaultDimension = dimensionsModel[0];

export type FileTypeCategory =
  | { key: string; labelKey: string; constLabelKey?: never }
  | { key: string; labelKey?: never; constLabelKey: string };

export const FILE_TYPE_CATEGORIES: FileTypeCategory[] = [
  { key: "document", labelKey: "Common:Documents" },
  { key: "spreadsheet", labelKey: "Common:Spreadsheets" },
  { key: "presentation", labelKey: "Common:Presentations" },
  { key: "image", labelKey: "Common:Images" },
  { key: "video", labelKey: "Common:Video" },
  { key: "audio", labelKey: "Common:Audio" },
  { key: "archive", labelKey: "Common:Archives" },
  { key: "pdf", constLabelKey: "PDF" },
];

export const FILE_TYPE_EXTENSIONS = {
  document: [".doc", ".docx", ".odt", ".rtf", ".txt"],
  spreadsheet: [".xls", ".xlsx", ".ods", ".csv"],
  presentation: [".ppt", ".pptx", ".odp"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".tiff"],
  video: [".mp4", ".avi", ".mov", ".mkv", ".webm", ".wmv"],
  audio: [".mp3", ".wav", ".ogg", ".flac", ".aac", ".wma"],
  archive: [".zip", ".rar", ".7z", ".tar", ".gz"],
  pdf: [".pdf"],
};

export const UNIT_MULTIPLIERS = {
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
} as const;

export const UNIT_ORDER = ["kb", "mb", "gb"] as const;
