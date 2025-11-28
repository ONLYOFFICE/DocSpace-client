/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React, { Activity } from "react";
import { inject, observer } from "mobx-react";

import { TFile } from "@docspace/shared/api/files/types";
import type useToolsSettings from "@docspace/shared/components/chat/hooks/useToolsSettings";
import type useInitChats from "@docspace/shared/components/chat/hooks/useInitChats";
import type useInitMessages from "@docspace/shared/components/chat/hooks/useInitMessages";
import Chat from "@docspace/shared/components/chat";
import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { TUser } from "@docspace/shared/api/people/types";

import NoAccessContainer, {
  NoAccessContainerType,
} from "SRC_DIR/components/EmptyContainer/NoAccessContainer";
import { SectionBodyContent } from "SRC_DIR/pages/Home/Section";
import type FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import type SelectedFolderStore from "SRC_DIR/store/SelectedFolderStore";
import type FilesStore from "SRC_DIR/store/FilesStore";
import type ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import type DialogsStore from "SRC_DIR/store/DialogsStore";

type Props = {
  currentView: string;
  isViewLoading: boolean;
  roomId: null | string;
  attachmentFile: null | TFile;
  getResultStorageId: () => null | number;
  onClearAttachmentFile: VoidFunction;
  toolsSettings: ReturnType<typeof useToolsSettings>;
  initChats: ReturnType<typeof useInitChats>;
  messagesSettings: Omit<ReturnType<typeof useInitMessages>, "initMessages">;

  isErrorAIAgentNotAvailable?: FilesStore["isErrorAIAgentNotAvailable"];
  showArticleLoader?: ClientLoadingStore["showArticleLoader"];
  showHeaderLoader?: ClientLoadingStore["showHeaderLoader"];
  showBodyLoader?: ClientLoadingStore["showBodyLoader"];
  userAvatar?: TUser["avatar"];
  getIcon?: FilesSettingsStore["getIcon"];
  chatSettings?: SelectedFolderStore["chatSettings"];
  isAdmin?: AuthStore["isAdmin"];
  aiConfig?: SettingsStore["aiConfig"];
  setIsAIAgentChatDelete?: DialogsStore["setIsAIAgentChatDelete"];
  setDeleteDialogVisible?: DialogsStore["setDeleteDialogVisible"];
  folderFormValidation?: RegExp;
};

const AIAgentViewComponent = ({
  currentView,
  isErrorAIAgentNotAvailable,
  showArticleLoader,
  showHeaderLoader,
  showBodyLoader,
  userAvatar,
  isViewLoading,
  roomId,
  getIcon,
  chatSettings,
  attachmentFile,
  onClearAttachmentFile,
  toolsSettings,
  initChats,
  messagesSettings,
  isAdmin,
  aiConfig,
  getResultStorageId,
  setIsAIAgentChatDelete,
  setDeleteDialogVisible,
  folderFormValidation,
}: Props) => {
  if (
    currentView === "chat" &&
    isErrorAIAgentNotAvailable &&
    !showArticleLoader
  ) {
    return <NoAccessContainer type={NoAccessContainerType.Agent} />;
  }

  const shouldRenderChat = !isErrorAIAgentNotAvailable || showArticleLoader;
  const shouldRenderFiles = currentView !== "chat";

  return (
    <>
      {shouldRenderChat ? (
        <Activity mode={currentView === "chat" ? "visible" : "hidden"}>
          <Chat
            userAvatar={userAvatar!}
            roomId={isViewLoading && !showHeaderLoader ? "-1" : roomId!}
            getIcon={getIcon!}
            selectedModel={chatSettings?.modelId ?? ""}
            isLoading={showBodyLoader}
            attachmentFile={attachmentFile}
            clearAttachmentFile={onClearAttachmentFile}
            toolsSettings={toolsSettings}
            initChats={initChats}
            messagesSettings={messagesSettings}
            isAdmin={isAdmin}
            aiReady={aiConfig?.aiReady || false}
            standalone // NOTE: AI SaaS same as AI Standalone in v.4.0
            getResultStorageId={getResultStorageId}
            setIsAIAgentChatDelete={setIsAIAgentChatDelete}
            setDeleteDialogVisible={setDeleteDialogVisible}
            folderFormValidation={folderFormValidation!}
          />
        </Activity>
      ) : null}

      {shouldRenderFiles ? <SectionBodyContent /> : null}
    </>
  );
};

export const AIAgentView = inject(
  ({
    filesStore,
    clientLoadingStore,
    userStore,
    filesSettingsStore,
    selectedFolderStore,
    authStore,
    settingsStore,
    dialogsStore,
  }: TStore) => {
    const { isErrorAIAgentNotAvailable } = filesStore;

    const { showArticleLoader, showHeaderLoader, showBodyLoader } =
      clientLoadingStore;

    const { user } = userStore;

    const { getIcon } = filesSettingsStore;

    const { chatSettings } = selectedFolderStore;

    const { isAdmin } = authStore;

    const { aiConfig, folderFormValidation } = settingsStore;

    const { setIsAIAgentChatDelete, setDeleteDialogVisible } = dialogsStore;

    return {
      isErrorAIAgentNotAvailable,
      showArticleLoader,
      showHeaderLoader,
      showBodyLoader,
      userAvatar: user?.avatar,
      getIcon,
      chatSettings,
      isAdmin,
      aiConfig,
      setIsAIAgentChatDelete,
      setDeleteDialogVisible,
      folderFormValidation,
    };
  },
)(observer(AIAgentViewComponent));
