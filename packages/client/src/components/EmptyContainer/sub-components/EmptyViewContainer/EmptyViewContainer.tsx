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
    "AIRoom",
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
    settingsStore,
    authStore,
  }): InjectedEmptyViewContainerProps => {
    const { isWarningRoomsDialog } = currentQuotaStore;
    const { isPublicRoom } = publicRoomStore;
    const { isFrame, logoText, aiConfig, standalone } = settingsStore;

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

    const {
      setSelectFileFormRoomDialogVisible,
      setQuotaWarningDialogVisible,
      setSelectFileAiKnowledgeDialogVisible,
      setTemplateAccessSettingsVisible,
    } = dialogsStore;

    const {
      security,
      access,
      rootFolderType,
      isInsideKnowledge,
      isInsideResultStorage,
    } = selectedFolderStore;

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
      setSelectFileAiKnowledgeDialogVisible,
      setTemplateAccessSettingsVisible,
      isVisitor: userStore?.user?.isVisitor,
      isFrame,
      logoText,
      isKnowledgeTab: isInsideKnowledge,
      isResultsTab: isInsideResultStorage,
      isPortalAdmin: authStore.isAdmin,
      aiReady: aiConfig?.aiReady,
      standalone,
    };
  },
)(EmptyViewContainer as React.FC<OutEmptyViewContainerProps>);

export default InjectedEmptyViewContainer;
