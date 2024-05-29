import { useTheme } from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import React, { useMemo, useCallback } from "react";

import { Events, FilesSelectorFilterTypes } from "@docspace/shared/enums";
import { EmptyView } from "@docspace/shared/components/empty-view";

import {
  getDescription,
  getIcon,
  getOptions,
  getTitle,
} from "./EmptyViewContainer.helpers";

import type {
  EmptyViewContainerProps,
  UploadType,
} from "./EmptyViewContainer.types";

const EmptyViewContainer = observer(
  ({
    type,
    access,
    folderId,
    security,
    onClickInviteUsers,
    setSelectFileFormRoomDialogVisible,
  }: EmptyViewContainerProps) => {
    const { t } = useTranslation(["EmptyView"]);
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

    const createFormFromFile = useCallback(() => {
      setSelectFileFormRoomDialogVisible?.(
        true,
        FilesSelectorFilterTypes.DOCX,
        true,
      );
    }, [setSelectFileFormRoomDialogVisible]);

    const uploadPDFForm = useCallback(() => {
      setSelectFileFormRoomDialogVisible?.(
        true,
        FilesSelectorFilterTypes.PDF,
        true,
      );
    }, [setSelectFileFormRoomDialogVisible]);

    const onCreateDocumentForm = useCallback(() => {
      const event: Event & {
        payload?: { extension: string; id: number; withoutDialog: boolean };
      } = new Event(Events.CREATE);

      const payload = {
        id: -1,
        extension: "pdf",
        withoutDialog: true,
      };
      event.payload = payload;

      window.dispatchEvent(event);
    }, []);

    const emptyViewOptions = useMemo(() => {
      const description = getDescription(type, t, access);
      const title = getTitle(type, t, access);
      const icon = getIcon(type, theme.isBase);

      return { description, title, icon };
    }, [type, t, theme.isBase, access]);

    const options = useMemo(
      () =>
        getOptions(type, security!, t, access, {
          inviteUser,
          createFormFromFile,
          onCreateDocumentForm,
          uploadPDFForm,
          onUploadAction,
        }),
      [
        type,
        access,
        security,

        t,
        inviteUser,
        uploadPDFForm,
        onUploadAction,
        createFormFromFile,
        onCreateDocumentForm,
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
    const { onClickInviteUsers } = contextOptionsStore;

    const { setSelectFileFormRoomDialogVisible } = dialogsStore;

    const { security, access } = selectedFolderStore;

    return {
      access,
      security,
      onClickInviteUsers,
      setSelectFileFormRoomDialogVisible,
    };
  },
)(EmptyViewContainer);

export default injectedEmptyViewContainer;
