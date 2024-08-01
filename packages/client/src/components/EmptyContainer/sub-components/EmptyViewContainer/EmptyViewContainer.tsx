import { useTheme } from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import React, { useMemo, useCallback } from "react";

import {
  Events,
  FilesSelectorFilterTypes,
  FilterType,
} from "@docspace/shared/enums";
import { EmptyView } from "@docspace/shared/components/empty-view";

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
    isArchiveFolderRoot,
    onClickInviteUsers,
    onCreateAndCopySharedLink,
    setSelectFileFormRoomDialogVisible,
  }: EmptyViewContainerProps) => {
    const { t } = useTranslation([
      "EmptyView",
      "Files",
      "Common",
      "Translations",
    ]);

    const theme = useTheme();

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
      );
      const title = getTitle(
        type,
        t,
        access,
        isFolder,
        folderType,
        parentRoomType,
        isArchiveFolderRoot,
      );
      const icon = getIcon(
        type,
        theme.isBase,
        access,
        isFolder,
        folderType,
        parentRoomType,
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
      isArchiveFolderRoot,
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
          {
            inviteUser,
            onCreate,
            uploadFromDocspace,
            onUploadAction,
            createAndCopySharedLink,
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
        t,
        inviteUser,
        uploadFromDocspace,
        onUploadAction,
        createAndCopySharedLink,
        onCreate,
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

const injectedEmptyViewContainer = inject<TStore>(
  ({ contextOptionsStore, selectedFolderStore, dialogsStore }) => {
    const { onClickInviteUsers, onCreateAndCopySharedLink } =
      contextOptionsStore;

    const { setSelectFileFormRoomDialogVisible } = dialogsStore;

    const { security, access } = selectedFolderStore;

    const selectedFolder = selectedFolderStore.getSelectedFolder();

    return {
      access,
      security,
      selectedFolder,
      onClickInviteUsers,
      onCreateAndCopySharedLink,
      setSelectFileFormRoomDialogVisible,
    };
  },
)(EmptyViewContainer);

export default injectedEmptyViewContainer;
