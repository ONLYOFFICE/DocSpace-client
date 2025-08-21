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
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(`PUBLIC_DIR/images/icons/${size}/${name}?url`);

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
