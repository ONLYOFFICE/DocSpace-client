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

enum IconNames {
  Word = "word.svg",
  WordCommon = "wordCommon.svg",
  Cell = "cell.svg",
  CellCommon = "cellCommon.svg",
  Diagram = "diagram.svg",
  Slide = "slide.svg",
  SlideCommon = "slideCommon.svg",
  Pdf = "pdf.svg",
  Form = "form.svg",
  Archive = "archive.svg",
  Calendar = "calendar.svg",
  Ebook = "ebook.svg",
  Html = "html.svg",
  Image = "image.svg",
  Letter = "letter.svg",
  Sound = "sound.svg",
  Text = "text.svg",
  Video = "video.svg",
  File = "file.svg",
  Folder = "folder.svg",
  FolderComplete = "folderComplete.svg",
  FolderInProgress = "folderInProgress.svg",
  CustomRoom = "room/custom.svg",
  EditingRoom = "room/editing.svg",
  FormRoom = "room/form.svg",
  PublicRoom = "room/public.svg",
  VirtualRoom = "room/virtual-data.svg",
  ArchiveRoom = "room/archive.svg",
  AIRoom = "room/ai.svg",
}

const iconsMap: Record<IconNames, string[]> = {
  [IconNames.Word]: [".docx", ".dotx", ".docm", ".dotm"],
  [IconNames.WordCommon]: [
    ".fodt",
    ".doc",
    ".ott",
    ".odt",
    ".rtf",
    ".stw",
    ".sxw",
    ".wps",
    ".wpt",
    ".pages",
    ".hwp",
    ".hwpx",
  ],
  [IconNames.Cell]: [".xlsx", ".xltx", ".xlsb", ".xltm", ".xlsm"],
  [IconNames.CellCommon]: [
    ".xls",
    ".ods",
    ".csv",
    ".fods",
    ".et",
    ".ett",
    ".ots",
    ".sxc",
    ".numbers",
  ],
  [IconNames.Diagram]: [".vsdx", ".vssx", ".vstx", ".vsdm", ".vssm", ".vstm"],
  [IconNames.Slide]: [".pptx", ".potx", ".ppsx", ".pptm", ".ppsm", ".potm"],
  [IconNames.SlideCommon]: [
    ".ppt",
    ".odp",
    ".otp",
    ".pps",
    ".fodp",
    ".dps",
    ".dpt",
    ".sxi",
    ".pot",
    ".key",
    ".odg",
  ],
  [IconNames.Pdf]: [".pdf"],
  [IconNames.Form]: [".docxf", ".oform"],
  [IconNames.Archive]: ["archive"],
  [IconNames.Calendar]: [".ics"],
  [IconNames.Ebook]: ["ebook"],
  [IconNames.Html]: ["html", ".xps", ".md", ".xml", ".oxps"],
  [IconNames.Letter]: [".iaf"],
  [IconNames.Text]: [".txt"],
  [IconNames.Video]: [
    ".3gp",
    ".asf",
    ".avi",
    ".f4v",
    ".fla",
    ".flv",
    ".m2ts",
    ".m4v",
    ".mkv",
    ".mov",
    ".mp4",
    ".mpeg",
    ".mpg",
    ".mts",
    ".ogv",
    ".svi",
    ".vob",
    ".webm",
    ".wmv",
  ],
  [IconNames.Image]: ["image"],
  [IconNames.Sound]: ["sound"],
  [IconNames.File]: ["file"],
  [IconNames.Folder]: ["folder"],
  [IconNames.FolderComplete]: ["folderComplete"],
  [IconNames.FolderInProgress]: ["folderInProgress"],
  [IconNames.CustomRoom]: ["customRoom"],
  [IconNames.AIRoom]: ["aiRoom"],
  [IconNames.EditingRoom]: ["editingRoom"],
  [IconNames.FormRoom]: ["formRoom"],
  [IconNames.PublicRoom]: ["publicRoom"],
  [IconNames.VirtualRoom]: ["virtualRoom"],
  [IconNames.ArchiveRoom]: ["archiveRoom"],
};

const createIconEntries = (icons: Record<string, string[]>) => {
  const all = Object.entries(icons).flatMap(([iconName, formats]) =>
    formats.map((format): [string, string] => [format, iconName]),
  );
  const nonRoom = all.filter(([, iconName]) => !iconName.startsWith("room/"));

  return { all, nonRoom };
};

const { all, nonRoom } = createIconEntries(iconsMap);

const getUrlByName = (size: number, name: string): string =>
  `/static/images/icons/${size}/${name}`;

const generateMapForSize = (
  size: number,
  entries: [string, string][],
): Map<string, string> =>
  new Map(
    entries.map(([format, iconName]) => {
      const svg = `${format.replace(/^\./, "")}.svg`;
      const url = getUrlByName(size, iconName);

      return [svg, url];
    }),
  );

export const iconSize24 = generateMapForSize(24, nonRoom);
export const iconSize32 = generateMapForSize(32, all);
export const iconSize64 = generateMapForSize(64, nonRoom);
export const iconSize96 = generateMapForSize(96, nonRoom);
