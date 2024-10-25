// (c) Copyright Ascensio System SIA 2009-2024
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
  Svg = "svg.svg",
  Text = "text.svg",
  Video = "video.svg",
  File = "file.svg",
  Folder = "folder.svg",
  FolderComplete = "folderComplete.svg",
  FolderInProgress = "folderInProgress.svg",
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
  ],
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
  ],
  [IconNames.Pdf]: [".pdf"],
  [IconNames.Form]: [".docxf", ".oform"],
  [IconNames.Archive]: ["archive"],
  [IconNames.Calendar]: [".ics"],
  [IconNames.Ebook]: ["ebook"],
  [IconNames.Html]: ["html", ".xps", ".md", ".xml", ".oxps"],
  [IconNames.Letter]: [".iaf"],
  [IconNames.Svg]: [".svg"],
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
};

const getSvgByName = (name: string): string => `${name.replace(/^\./, "")}.svg`;

const getUrlByName = (name: string, size: number): string =>
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(`PUBLIC_DIR/images/icons/${size}/${name}?url`);

const findIconKey = (format: string): string =>
  Object.keys(iconsMap).find((icon) =>
    iconsMap[icon as IconNames]?.includes(format),
  ) || IconNames.File;

const generateSvgUrlPair = (format: string, size: number): [string, string] => {
  const key = findIconKey(format);
  return [getSvgByName(format), getUrlByName(key, size)];
};

const getIconsMap = (size: number): Map<string, string> => {
  const iconMap = new Map<string, string>();
  const formats = Object.values(iconsMap).flat();

  formats.forEach((format) => {
    const [svg, url] = generateSvgUrlPair(format, size);
    iconMap.set(svg, url);
  });

  return iconMap;
};

export const iconSize24 = getIconsMap(24);

export const iconSize32 = getIconsMap(32);

export const iconSize64 = getIconsMap(64);

export const iconSize96 = getIconsMap(96);
