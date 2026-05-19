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
