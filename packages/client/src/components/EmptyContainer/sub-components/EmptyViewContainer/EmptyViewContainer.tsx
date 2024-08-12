import { useTheme } from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import React, { useMemo, useCallback } from "react";
import { useNavigate, LinkProps } from "react-router-dom";

import {
  Events,
  FilesSelectorFilterTypes,
  FilterType,
} from "@docspace/shared/enums";
import { EmptyView } from "@docspace/shared/components/empty-view";
import FilesFilter from "@docspace/shared/api/files/filter";

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
  ExtensiontionType,
  InjectedEmptyViewContainerProps,
  OutEmptyViewContainerProps,
  UploadType,
} from "./EmptyViewContainer.types";

const EmptyViewContainer = observer(
  ({
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
    isGracePeriod,
    myFolderId,
    myFolder,
    setViewInfoPanel,
    onClickInviteUsers,
    setVisibleInfoPanel,
    onCreateAndCopySharedLink,
    // setIsSectionFilterLoading,
    setSelectFileFormRoomDialogVisible,
    setInviteUsersWarningDialogVisible,
    inviteUser: inviteRootUser,
  }: EmptyViewContainerProps) => {
    const navigate = useNavigate();

    const { t } = useTranslation([
      "EmptyView",
      "Files",
      "Common",
      "Translations",
    ]);

    const theme = useTheme();

    const onGoToPersonal = useCallback((): LinkProps => {
      const newFilter = FilesFilter.getDefault();

      newFilter.folder = myFolderId?.toString() ?? "";

      const state = {
        title: myFolder.title,
        isRoot: true,
        rootFolderType: myFolder.rootFolderType,
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
    }, [
      myFolder.rootFolderType,
      myFolder.title,
      myFolderId,
      // setIsSectionFilterLoading,
    ]);

    const onCreateRoom = useCallback(() => {
      if (isGracePeriod) {
        setInviteUsersWarningDialogVisible(true);
        return;
      }

      const event = new Event(Events.ROOM_CREATE);
      window.dispatchEvent(event);
    }, [isGracePeriod, setInviteUsersWarningDialogVisible]);

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
      (extension: ExtensiontionType, withoutDialog?: boolean) => {
        const event: CreateEvent = new Event(Events.CREATE);

        const payload = {
          id: -1,
          extension,
          withoutDialog,
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
    ]);

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
      ],
    );

    const { description, title, icon } = emptyViewOptions;

    return (
      <EmptyView
        icon={icon}
        title={title}
        options={options}
        description={description}
      />
    );
  },
);

const InjectedEmptyViewContainer = inject<
  TStore,
  OutEmptyViewContainerProps,
  InjectedEmptyViewContainerProps
>(
  ({
    contextOptionsStore,
    selectedFolderStore,
    dialogsStore,
    infoPanelStore,
    currentTariffStatusStore,
    treeFoldersStore,
    clientLoadingStore,
  }): InjectedEmptyViewContainerProps => {
    const { myFolderId, myFolder } = treeFoldersStore;

    const { setIsSectionFilterLoading } = clientLoadingStore;

    const { onClickInviteUsers, onCreateAndCopySharedLink, inviteUser } =
      contextOptionsStore;

    const { isGracePeriod } = currentTariffStatusStore;

    const {
      setIsVisible: setVisibleInfoPanel,
      isVisible: isVisibleInfoPanel,
      setView: setViewInfoPanel,
    } = infoPanelStore;

    const {
      setSelectFileFormRoomDialogVisible,
      setInviteUsersWarningDialogVisible,
    } = dialogsStore;

    const { security, access, rootFolderType } = selectedFolderStore;

    const selectedFolder = selectedFolderStore.getSelectedFolder();

    return {
      access,
      security,
      selectedFolder,
      isVisibleInfoPanel,
      rootFolderType,
      isGracePeriod,
      myFolderId,
      myFolder,
      inviteUser,
      setViewInfoPanel,
      onClickInviteUsers,
      setVisibleInfoPanel,
      setIsSectionFilterLoading,
      onCreateAndCopySharedLink,
      setSelectFileFormRoomDialogVisible,
      setInviteUsersWarningDialogVisible,
    };
  },
)(EmptyViewContainer as React.FC<OutEmptyViewContainerProps>);

export default InjectedEmptyViewContainer;
