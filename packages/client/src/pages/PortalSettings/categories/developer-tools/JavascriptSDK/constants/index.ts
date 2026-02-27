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

export const FILE_TYPE_CATEGORIES = [
  { key: "document", labelKey: "Common:Documents" },
  { key: "spreadsheet", labelKey: "Common:Spreadsheets" },
  { key: "presentation", labelKey: "Common:Presentations" },
  { key: "image", labelKey: "Common:Images" },
  { key: "video", labelKey: "Common:Video" },
  { key: "audio", labelKey: "Common:Audio" },
  { key: "archive", labelKey: "Common:Archives" },
  { key: "pdf", labelKey: "PDF" },
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
