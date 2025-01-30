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

import { useTheme } from "styled-components";
import { useMemo, useCallback } from "react";
import { useNavigate, LinkProps } from "react-router-dom";

import {
  Events,
  FileExtensions,
  FilesSelectorFilterTypes,
  FilterType,
  RoomSearchArea,
} from "@docspace/shared/enums";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TTranslation } from "@docspace/shared/types";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";

import { isMobile } from "react-device-detect";
import { toastr } from "@docspace/shared/components/toast";
import {
  getDescription,
  getIcon,
  getOptions,
  getTitle,
} from "./EmptyViewContainer.helpers";

import type {
  CreateEvent,
  EmptyViewContainerProps,
  ExtensionType,
  UploadType,
} from "./EmptyViewContainer.types";

export const useEmptyView = (
  {
    type,
    access,
    isFolder,
    folderType,
    parentRoomType,
    isRootEmptyPage,
    isArchiveFolderRoot,
    rootFolderType,
    isPublicRoom,
  }: EmptyViewContainerProps,
  t: TTranslation,
) => {
  const theme = useTheme();

  const emptyViewOptions = useMemo(() => {
    const description = getDescription(
      type,
      t,
      access,
      isFolder,
      folderType,
      parentRoomType,
      isArchiveFolderRoot,
      isRootEmptyPage,
      rootFolderType,
      isPublicRoom,
    );
    const title = getTitle(
      type,
      t,
      access,
      isFolder,
      folderType,
      parentRoomType,
      isArchiveFolderRoot,
      isRootEmptyPage,
      rootFolderType,
    );
    const icon = getIcon(
      type,
      theme.isBase,
      access,
      isFolder,
      folderType,
      parentRoomType,
      isRootEmptyPage,
      rootFolderType,
    );

    return { description, title, icon };
  }, [
    type,
    t,
    theme.isBase,
    access,
    isFolder,
    folderType,
    parentRoomType,
    isRootEmptyPage,
    isArchiveFolderRoot,
    rootFolderType,
    isPublicRoom,
  ]);

  return emptyViewOptions;
};

export const useOptions = (
  {
    type,
    access,
    folderId,
    isFolder,
    security,
    folderType,
    selectedFolder,
    parentRoomType,
    isRootEmptyPage,
    isVisibleInfoPanel,
    isArchiveFolderRoot,
    rootFolderType,
    myFolderId,
    myFolder,
    roomsFolder,
    userId,
    isWarningRoomsDialog,
    setViewInfoPanel,
    onClickInviteUsers,
    setVisibleInfoPanel,
    onCreateAndCopySharedLink,
    setQuotaWarningDialogVisible,
    setSelectFileFormRoomDialogVisible,
    inviteUser: inviteRootUser,
    isVisitor,
    isFrame,
    logoText,
  }: EmptyViewContainerProps,
  t: TTranslation,
) => {
  const navigate = useNavigate();

  const onGoToShared = useCallback(() => {
    const newFilter = RoomsFilter.getDefault(userId, RoomSearchArea.Active);

    newFilter.searchArea = RoomSearchArea.Active;

    const state = {
      title: roomsFolder?.title,
      isRoot: true,
      rootFolderType: roomsFolder?.rootFolderType,
    };

    const path = getCategoryUrl(CategoryType.Shared);
    return {
      to: {
        pathname: path,
        search: newFilter.toUrlParams(),
      },
      state,
    };
  }, [roomsFolder?.rootFolderType, roomsFolder?.title, userId]);

  const onGoToPersonal = useCallback((): LinkProps => {
    const newFilter = FilesFilter.getDefault();

    newFilter.folder = myFolderId?.toString() ?? "";

    const state = {
      title: myFolder?.title,
      isRoot: true,
      rootFolderType: myFolder?.rootFolderType,
    };

    const path = getCategoryUrl(CategoryType.Personal);

    return {
      to: {
        pathname: path,
        search: newFilter.toUrlParams(),
      },
      state,
    };
  }, [myFolder?.rootFolderType, myFolder?.title, myFolderId]);

  const onCreateRoom = useCallback(() => {
    if (isWarningRoomsDialog) {
      setQuotaWarningDialogVisible(true);
      return;
    }

    const event = new Event(Events.ROOM_CREATE);
    window.dispatchEvent(event);
  }, [isWarningRoomsDialog, setQuotaWarningDialogVisible]);

  const openInfoPanel = useCallback(() => {
    if (!isVisibleInfoPanel) setVisibleInfoPanel?.(true);

    setViewInfoPanel?.("info_members");
  }, [setViewInfoPanel, setVisibleInfoPanel, isVisibleInfoPanel]);

  const onUploadAction = useCallback((uploadType: UploadType) => {
    const element =
      uploadType === "file"
        ? (document.querySelector(".custom-file-input-article") as HTMLElement)
        : uploadType === "pdf"
          ? document.getElementById("customPDFInput")
          : document.getElementById("customFolderInput");

    element?.click();
  }, []);

  const inviteUser = useCallback(() => {
    onClickInviteUsers?.(folderId, type);
  }, [onClickInviteUsers, folderId, type]);

  const uploadFromDocspace = useCallback(
    (
      filterParam: FilesSelectorFilterTypes | FilterType,
      openRoot: boolean = true,
    ) => {
      setSelectFileFormRoomDialogVisible?.(true, filterParam, openRoot);
    },
    [setSelectFileFormRoomDialogVisible],
  );

  const onCreate = useCallback(
    (extension: ExtensionType, withoutDialog?: boolean) => {
      const event: CreateEvent = new Event(Events.CREATE);

      const edit = extension === FileExtensions.PDF;

      if (isMobile && edit && t) {
        toastr.info(t("Files:MobileEditPdfNotAvailableInfo"));
        return;
      }

      const payload = {
        id: -1,
        extension,
        withoutDialog,
        edit,
      };
      event.payload = payload;

      window.dispatchEvent(event);
    },
    [],
  );

  const createAndCopySharedLink = useCallback(() => {
    if (!selectedFolder) return;

    onCreateAndCopySharedLink?.(selectedFolder, t);
  }, [selectedFolder, onCreateAndCopySharedLink, t]);

  const options = useMemo(
    () =>
      getOptions(
        type,
        security!,
        t,
        access,
        isFolder,
        folderType,
        parentRoomType,
        isArchiveFolderRoot,
        isRootEmptyPage,
        rootFolderType,
        {
          inviteUser,
          onCreate,
          uploadFromDocspace,
          onUploadAction,
          createAndCopySharedLink,
          openInfoPanel,
          onCreateRoom,
          inviteRootUser,
          navigate,
          onGoToPersonal,
          onGoToShared,
        },
        isVisitor,
        isFrame,
        logoText,
      ),
    [
      type,
      access,
      security,
      isFolder,
      folderType,
      parentRoomType,
      isArchiveFolderRoot,
      isRootEmptyPage,
      rootFolderType,
      t,
      inviteUser,
      uploadFromDocspace,
      onUploadAction,
      createAndCopySharedLink,
      onCreate,
      openInfoPanel,
      onCreateRoom,
      inviteRootUser,
      navigate,
      onGoToPersonal,
      onGoToShared,
      isVisitor,
      isFrame,
      logoText,
    ],
  );

  return options;
};
