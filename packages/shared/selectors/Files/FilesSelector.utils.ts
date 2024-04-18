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
      //   roomType,
      filesCount,
      foldersCount,
      security,
      parentId,
      rootFolderType,
    } = folder;

    const folderIconPath = getIconPathByFolderType(rootFolderType);
    const icon = iconSize32.get(folderIconPath) as string;

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
      //   roomType,
      isDisabled: filterParam ? false : disabledItems?.includes(id),
    };
  });

  return items;
};

export const convertFilesToItems: (
  files: TFile[],
  getIcon: (fileExst: string) => string,
  filterParam?: string,
) => TSelectorItem[] = (
  files: TFile[],
  getIcon: (fileExst: string) => string,
  filterParam?: string,
) => {
  const items = files.map((file) => {
    const { id, title, security, folderId, rootFolderType, fileExst } = file;

    const icon = getIcon(fileExst || DEFAULT_FILE_EXTS);
    const label = title.replace(fileExst, "") || fileExst;

    return {
      id,
      label,
      title,
      icon,
      security,
      parentId: folderId,
      rootFolderType,
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
      shared,
    } = room;

    const icon = logo.medium || "";

    const iconProp = icon ? { icon } : { color: logo.color as string };

    return {
      id,
      label: title,
      title,
      filesCount,
      foldersCount,
      security,
      parentId,
      rootFolderType,
      isFolder: true,
      roomType,
      shared,
      ...iconProp,
    };
  });

  return items;
};
