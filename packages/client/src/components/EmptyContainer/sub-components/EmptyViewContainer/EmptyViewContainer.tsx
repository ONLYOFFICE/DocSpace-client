import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { EmptyView } from "@docspace/shared/components/empty-view";

import { useEmptyView, useOptions } from "./EmptyViewContainer.hooks";
import type {
  EmptyViewContainerProps,
  InjectedEmptyViewContainerProps,
  OutEmptyViewContainerProps,
} from "./EmptyViewContainer.types";

const EmptyViewContainer = observer((props: EmptyViewContainerProps) => {
  const { t } = useTranslation([
    "EmptyView",
    "Files",
    "Common",
    "Translations",
  ]);

  const options = useOptions(props, t);
  const emptyViewOptions = useEmptyView(props, t);

  const { description, title, icon } = emptyViewOptions;

  return (
    <EmptyView
      icon={icon}
      title={title}
      options={options}
      description={description}
    />
  );
});

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
    treeFoldersStore,
    clientLoadingStore,
    userStore,
    currentQuotaStore,
    publicRoomStore,
    peopleStore,
  }): InjectedEmptyViewContainerProps => {
    const { isWarningRoomsDialog } = currentQuotaStore;
    const { isPublicRoom } = publicRoomStore;

    const { myFolderId, myFolder, roomsFolder } = treeFoldersStore;

    const { setIsSectionFilterLoading } = clientLoadingStore;

    const { onClickInviteUsers, onCreateAndCopySharedLink } =
      contextOptionsStore;

    const { inviteUser } = peopleStore.contextOptionsStore!;

    const {
      setIsVisible: setVisibleInfoPanel,
      isVisible: isVisibleInfoPanel,
      setView: setViewInfoPanel,
    } = infoPanelStore;

    const { setSelectFileFormRoomDialogVisible, setQuotaWarningDialogVisible } =
      dialogsStore;

    const { security, access, rootFolderType } = selectedFolderStore;

    const selectedFolder = selectedFolderStore.getSelectedFolder();

    const userId = userStore?.user?.id;

    return {
      access,
      security,
      selectedFolder,
      isVisibleInfoPanel,
      rootFolderType,
      myFolderId,
      myFolder,
      roomsFolder,
      userId,
      isPublicRoom,
      isWarningRoomsDialog,
      inviteUser,
      setViewInfoPanel,
      onClickInviteUsers,
      setVisibleInfoPanel,
      setIsSectionFilterLoading,
      onCreateAndCopySharedLink,
      setSelectFileFormRoomDialogVisible,
      setQuotaWarningDialogVisible,
      isVisitor: userStore?.user?.isVisitor,
    };
  },
)(EmptyViewContainer as React.FC<OutEmptyViewContainerProps>);

export default InjectedEmptyViewContainer;
