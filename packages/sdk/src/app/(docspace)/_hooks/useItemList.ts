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

"use client";

import { useCallback } from "react";

import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { FileStatus } from "@docspace/shared/enums";

import getItemUrl from "../_utils/get-item-url";

import useItemIcon from "./useItemIcon";
import useItemContextMenu from "./useItemContextMenu";

type useItemListProps = {
  shareKey?: string;

  getIcon: ReturnType<typeof useItemIcon>["getIcon"];
};

export default function useItemList({ shareKey, getIcon }: useItemListProps) {
  const { getFilesContextMenu, getFoldersContextMenu } = useItemContextMenu();

  const convertFileToItem = useCallback(
    (file: TFile) => {
      const canOpenPlayer =
        file.viewAccessibility?.CanConvert || file.viewAccessibility.MediaView;
      const needConvert = file.viewAccessibility?.MustConvert;
      const isEditing =
        (file.fileStatus & FileStatus.IsEditing) === FileStatus.IsEditing;

      const isFolder = false as const;

      const previewUrl = canOpenPlayer
        ? getItemUrl(file.id, isFolder, needConvert, canOpenPlayer, shareKey)
        : null;
      const docUrl =
        !canOpenPlayer &&
        getItemUrl(file.id, isFolder, needConvert, false, shareKey);

      const href = previewUrl || docUrl;

      const icon = getIcon(file.fileExst, 32, file.contentLength);

      const isForm = file.fileExst === ".oform";

      const contextOptions = getFilesContextMenu(file);

      return {
        ...file,
        icon,
        isForm,
        href,
        isEditing,
        isFolder,
        previewUrl,
        docUrl,
        needConvert,
        contextOptions,
      };
    },
    [getIcon, getFilesContextMenu, shareKey],
  );

  const convertFolderToItem = useCallback(
    (folder: TFolder) => {
      const isFolder = true as const;

      const folderUrl = getItemUrl(folder.id, isFolder, false, false);

      const icon = getIcon();

      const contextOptions = getFoldersContextMenu();

      return { ...folder, isFolder, folderUrl, icon, contextOptions };
    },
    [getFoldersContextMenu, getIcon],
  );

  return { convertFileToItem, convertFolderToItem };
}

export type TFileItem = ReturnType<
  ReturnType<typeof useItemList>["convertFileToItem"]
>;
export type TFolderItem = ReturnType<
  ReturnType<typeof useItemList>["convertFolderToItem"]
>;
