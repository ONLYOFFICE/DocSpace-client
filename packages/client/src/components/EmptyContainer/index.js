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
import { observer, inject } from "mobx-react";

import { isFolder as isFolderUtil } from "@docspace/shared/utils/typeGuards";

import EmptyFilterContainer from "./EmptyFilterContainer";
import EmptyViewContainer from "./sub-components/EmptyViewContainer/EmptyViewContainer";

const linkStyles = {
  isHovered: true,
  type: "action",
  fontWeight: "600",
  className: "empty-folder_link",
  display: "flex",
};

const EmptyContainer = ({
  isFiltered,
  // isLoading,
  parentId,
  theme,
  type,

  isRoot,
  isPublicRoom,
  // isEmptyPage,
  roomType,
  parentRoomType,
  folderId,
  isArchiveFolderRoot,
  isFolder,
}) => {
  linkStyles.color = theme.filesEmptyContainer.linkColor;

  const isRootEmptyPage = parentId === 0 || (isPublicRoom && isRoot);

  if (isFiltered) return <EmptyFilterContainer linkStyles={linkStyles} />;

  return (
    <EmptyViewContainer
      type={roomType}
      folderType={type}
      isFolder={isFolder}
      folderId={folderId}
      isRootEmptyPage={isRootEmptyPage}
      parentRoomType={parentRoomType}
      isArchiveFolderRoot={isArchiveFolderRoot}
    />
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    selectedFolderStore,
    clientLoadingStore,
    publicRoomStore,
    treeFoldersStore,
  }) => {
    const { isErrorRoomNotAvailable, isFiltered } = filesStore;
    const { isLoading } = clientLoadingStore;

    const { isPublicRoom } = publicRoomStore;

    const isRoomNotFoundOrMoved =
      isFiltered === null && isErrorRoomNotAvailable;

    const { roomType, id: folderId, parentRoomType } = selectedFolderStore;
    const { isArchiveFolderRoot } = treeFoldersStore;

    const isFolder = isFolderUtil(selectedFolderStore.getSelectedFolder());

    const isRoot = selectedFolderStore.pathParts?.length === 1 && !isFolder;

    return {
      theme: settingsStore.theme,
      isFiltered,
      isLoading,

      parentId: selectedFolderStore.parentId,
      isRoomNotFoundOrMoved,
      type: selectedFolderStore.type,
      isRoot,
      isPublicRoom,
      roomType,
      parentRoomType,
      folderId,
      isArchiveFolderRoot,
      isFolder,
    };
  },
)(observer(EmptyContainer));
