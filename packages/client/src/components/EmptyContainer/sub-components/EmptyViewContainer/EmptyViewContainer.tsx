import { useTheme } from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import React, { useMemo, useCallback } from "react";

import { Events } from "@docspace/shared/enums";
import { EmptyView } from "@docspace/shared/components/empty-view";

import {
  getDescription,
  getIcon,
  getOptions,
  getTitle,
} from "./EmptyViewContainer.helpers";

import type { EmptyViewContainerProps } from "./EmptyViewContainer.types";

const EmptyViewContainer = observer(
  ({
    type,
    folderId,
    security,
    onClickInviteUsers,
    setSelectFileDialogVisible,
  }: EmptyViewContainerProps) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const inviteUser = useCallback(() => {
      onClickInviteUsers?.(folderId, type);
    }, [onClickInviteUsers, folderId, type]);

    const createFormFromFile = useCallback(() => {
      setSelectFileDialogVisible?.(true);
    }, [setSelectFileDialogVisible]);

    const onCreateDocumentForm = useCallback(() => {
      const event: Event & {
        payload?: { extension: string; id: number; withoutDialog: boolean };
      } = new Event(Events.CREATE);

      const payload = {
        id: -1,
        extension: "docxf",
        withoutDialog: true,
      };
      event.payload = payload;

      window.dispatchEvent(event);
    }, []);

    const emptyViewOptions = useMemo(() => {
      const description = t(getDescription(type));
      const title = t(getTitle(type));
      const icon = getIcon(type, theme.isBase);

      return { description, title, icon };
    }, [type, t, theme.isBase]);

    const options = useMemo(
      () =>
        getOptions(type, security!, t, {
          inviteUser,
          createFormFromFile,
          onCreateDocumentForm,
        }),
      [type, t, inviteUser, createFormFromFile, onCreateDocumentForm, security],
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

    const { setSelectFileDialogVisible } = dialogsStore;

    const { security } = selectedFolderStore;

    return { onClickInviteUsers, security, setSelectFileDialogVisible };
  },
)(EmptyViewContainer);

export default injectedEmptyViewContainer;
