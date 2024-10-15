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

/* eslint-disable import/no-dynamic-require, global-require */
const getSvgByName = (name: string): string => `${name.replace(/^\./, "")}.svg`;

const getUrlByName = (name: string, size: string | number, type = "") =>
  require(`PUBLIC_DIR/images/icons/${size}${type}/${getSvgByName(name)}?url`);

const getIconsMap = (
  size: string | number,
  formats: string[],
  folders: string[],
  rooms: string[] = [],
): Map<string, string> => {
  const mapIcons = (icons: string[], type = ""): [string, string][] =>
    icons.map((icon) => [getSvgByName(icon), getUrlByName(icon, size, type)]);

  const formatsMap = mapIcons(formats);
  const foldersMap = mapIcons(folders, "/folder");
  const roomsMap = mapIcons(rooms, "/room");

  return new Map([...formatsMap, ...foldersMap, ...roomsMap]);
};

const formatIcons = [
  ".avi",
  ".csv",
  ".djvu",
  ".doc",
  ".docm",
  ".docx",
  ".docxf",
  ".dotx",
  ".dps",
  ".dpt",
  ".dvd",
  ".epub",
  ".et",
  ".ett",
  ".fb2",
  ".flv",
  ".fodt",
  ".iaf",
  ".ics",
  ".m2ts",
  ".mht",
  ".mhtml",
  ".mkv",
  ".mov",
  ".mp4",
  ".mpg",
  ".odp",
  ".ods",
  ".odt",
  ".oform",
  ".otp",
  ".ots",
  ".ott",
  ".pdf",
  ".pot",
  ".pps",
  ".ppsx",
  ".ppt",
  ".pptm",
  ".pptx",
  ".rtf",
  ".stw",
  ".svg",
  ".sxc",
  ".sxi",
  ".sxw",
  ".txt",
  ".webm",
  ".wps",
  ".wpt",
  ".xls",
  ".xlsm",
  ".xlsb",
  ".xlsx",
  ".xml",
  ".xps",
  "file_archive",
  "file",
  "folder",
  "html",
  "image",
  "sound",
];
const folderIcons = [
  "box",
  "done",
  "dropbox",
  "google",
  "inProgress",
  "kdrive",
  "nextcloud",
  "onedrive",
  "owncloud",
  "sharepoint",
  "webdav",
  "yandex",
];

const roomIcons = [
  "archive",
  "custom",
  "editing",
  "filling.form",
  "form",
  "public",
  "review",
  "view.only",
];

export const iconSize24 = getIconsMap(24, formatIcons, folderIcons);

export const iconSize32 = getIconsMap(32, formatIcons, folderIcons, roomIcons);

export const iconSize64 = getIconsMap(64, formatIcons, folderIcons);

export const iconSize96 = getIconsMap(96, formatIcons, folderIcons);
