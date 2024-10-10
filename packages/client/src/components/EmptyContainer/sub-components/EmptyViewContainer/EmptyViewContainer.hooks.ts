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

    // setIsSectionFilterLoading(true);

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
        ? document.getElementById("customFileInput")
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
    ],
  );

  return options;
};