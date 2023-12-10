const getSvgByName = (name) => `${name.replace(/^\./, "")}.svg`;

const getUrlByName = (name, size, type = "") =>
  require(`PUBLIC_DIR/images/icons/${size}${type}/${getSvgByName(name)}?url`);

const getIconsMap = (size, formats, folders, rooms = []) => {
  const mapIcons = (icons, type = "") =>
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
