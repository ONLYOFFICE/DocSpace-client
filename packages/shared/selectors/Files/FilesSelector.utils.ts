import { TSelectorItem } from "../../components/selector";
import { TFile, TFolder } from "../../api/files/types";
import { TRoom } from "../../api/rooms/types";
import { getIconPathByFolderType } from "../../utils/common";
import { iconSize32 } from "../../utils/image-helpers";
import { DEFAULT_FILE_EXTS } from "./FilesSelector.constants";

export const convertFoldersToItems: (
  folders: TFolder[],
  disabledItems: (number | string)[],
  filterParam?: string,
) => TSelectorItem[] = (
  folders: TFolder[],
  disabledItems: (number | string)[],
  filterParam?: string,
) => {
  const items = folders.map((folder: TFolder) => {
    const {
      id,
      title,
      roomType,
      filesCount,
      foldersCount,
      security,
      parentId,
      rootFolderType,
    } = folder;

    const folderIconPath = getIconPathByFolderType(rootFolderType);
    const icon = iconSize32.get(folderIconPath);

    return {
      id,
      label: title,
      title,
      icon,
      filesCount,
      foldersCount,
      security,
      parentId,
      rootFolderType,
      isFolder: true,
      roomType,
      isDisabled: filterParam ? false : disabledItems.includes(id),
    };
  });

  return items;
};

export const convertFilesToItems: (
  files: TFile[],
  getIcon: (size: number, fileExst: string) => string,
  filterParam?: string,
) => TSelectorItem[] = (
  files: TFile[],
  getIcon: (size: number, fileExst: string) => string,
  filterParam?: string,
) => {
  const items = files.map((file) => {
    const { id, title, security, folderId, rootFolderType, fileExst } = file;

    const icon = getIcon(32, fileExst || DEFAULT_FILE_EXTS);
    const label = title.replace(fileExst, "") || fileExst;

    return {
      id,
      label,
      title,
      icon,
      security,
      parentId: folderId,
      rootFolderType,
      isFolder: false,
      isDisabled: !filterParam,
      fileExst,
    };
  });
  return items;
};

export const convertRoomsToItems: (rooms: TRoom[]) => TSelectorItem[] = (
  rooms: TRoom[],
) => {
  const items = rooms.map((room) => {
    const {
      id,
      title,
      roomType,
      logo,
      filesCount,
      foldersCount,
      security,
      parentId,
      rootFolderType,
    } = room;

    const icon = logo.medium || "";

    return {
      id,
      label: title,
      title,
      icon,
      filesCount,
      foldersCount,
      security,
      parentId,
      rootFolderType,
      isFolder: true,
      roomType,
      color: logo.color,
    };
  });

  return items;
};
