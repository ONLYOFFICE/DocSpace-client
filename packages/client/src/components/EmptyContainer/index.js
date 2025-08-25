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
