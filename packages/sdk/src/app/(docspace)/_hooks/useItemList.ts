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

"use client";

import { useCallback, useRef } from "react";

import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { FileStatus } from "@docspace/shared/enums";

import getItemUrl from "../_utils/get-item-url";

import useItemIcon from "./useItemIcon";
import useItemContextMenu from "./useItemContextMenu";

type useItemListProps = {
  shareKey?: string;
  isFavoritesSection?: boolean;
  isRecentSection?: boolean;
  isTrashSection?: boolean;
  isDocsSection?: boolean;

  getIcon: ReturnType<typeof useItemIcon>["getIcon"];
};

export default function useItemList({
  shareKey,
  getIcon,
  isFavoritesSection,
  isRecentSection,
  isTrashSection,
  isDocsSection,
}: useItemListProps) {
  const { getFilesContextMenu, getFoldersContextMenu } = useItemContextMenu({
    isFavoritesSection,
    isRecentSection,
    isTrashSection,
    isDocsSection,
  });

  const getFilesContextMenuRef = useRef(getFilesContextMenu);
  getFilesContextMenuRef.current = getFilesContextMenu;

  const convertFileToItem = useCallback(
    (
      file: TFile,
      overrides?: { isRecentSection?: boolean; isFavoritesSection?: boolean },
    ) => {
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

      const contextOptions = overrides
        ? getFilesContextMenuRef.current(file, overrides)
        : getFilesContextMenuRef.current(file);

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
    [getIcon, shareKey],
  );

  const convertFolderToItem = useCallback(
    (folder: TFolder) => {
      const isFolder = true as const;

      const folderUrl = getItemUrl(folder.id, isFolder, false, false);

      const icon = getIcon();

      const contextOptions = getFoldersContextMenu(folder);

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
