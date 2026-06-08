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

import { Activity, useCallback, useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import type { TFile } from "@docspace/ui-kit/types";
import type useToolsSettings from "@docspace/ui-kit/ai-agent/chat/hooks/useToolsSettings";
import type useInitChats from "@docspace/ui-kit/ai-agent/chat/hooks/useInitChats";
import type useInitMessages from "@docspace/ui-kit/ai-agent/chat/hooks/useInitMessages";
import Chat from "@docspace/ui-kit/ai-agent/chat";
import {
  getAIAgent,
  getAIUserConfig,
  updateAIUserConfig,
} from "@docspace/shared/api/ai";
import type { TAgent } from "@docspace/shared/api/ai/types";
import { Events } from "@docspace/shared/enums";
import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { TUser } from "@docspace/shared/api/people/types";

import NoAccessContainer, {
  NoAccessContainerType,
} from "SRC_DIR/components/EmptyContainer/NoAccessContainer";
import { AgentDialogContext } from "SRC_DIR/helpers/enums";
import { SectionBodyContent } from "SRC_DIR/pages/Home/Section";
import type FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import type SelectedFolderStore from "SRC_DIR/store/SelectedFolderStore";
import type FilesStore from "SRC_DIR/store/FilesStore";
import type ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import type AccessRightsStore from "SRC_DIR/store/AccessRightsStore";
import MediaViewerDataStore from "SRC_DIR/store/MediaViewerDataStore";
import AiRoomStore from "SRC_DIR/store/AiRoomStore";
import { useScroll } from "./useScroll";
import styles from "./AIAgentView.module.scss";

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
  canEditAgent?: boolean;
  aiConfig?: SettingsStore["aiConfig"];
  canUseChat?: AccessRightsStore["canUseChat"];

  setMediaViewerVisible?: MediaViewerDataStore["setMediaViewerVisible"];
  setAiPlaylistImages?: AiRoomStore["setAiPlaylistImages"];
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
  canEditAgent,
  aiConfig,
  getResultStorageId,
  canUseChat,
  setMediaViewerVisible,
  setAiPlaylistImages,
}: Props) => {
  const navigate = useNavigate();
  const scrollRef = useScroll();

  const [chatRecommendedModelVisible, setChatRecommendedModelVisible] =
    useState<boolean | undefined>(undefined);

  useEffect(() => {
    getAIUserConfig()
      .then((config) =>
        setChatRecommendedModelVisible(config.chatRecommendedModelVisible),
      )
      .catch(() => {});
  }, []);

  const onCloseRecomendation = useCallback(() => {
    setChatRecommendedModelVisible(false);
    updateAIUserConfig({ chatRecommendedModelVisible: false }).catch(() => {});
  }, []);

  const goToWebSearchSettings = useCallback(() => {
    navigate("/portal-settings/ai-settings/search");
  }, [navigate]);

  const goToAISettings = useCallback(() => {
    navigate("/portal-settings/ai-settings/providers");
  }, [navigate]);

  const onOpenEdit = useCallback(async () => {
    if (!roomId) return;

    const agent = await getAIAgent(roomId as unknown as TAgent["id"]);

    const event = new CustomEvent(Events.AGENT_EDIT, {
      detail: { context: AgentDialogContext.Chat },
    }) as unknown as CustomEvent & { item: TAgent };
    event.item = agent;

    window.dispatchEvent(event);
  }, [roomId]);

  if (
    currentView === "chat" &&
    isErrorAIAgentNotAvailable &&
    !showArticleLoader
  ) {
    return <NoAccessContainer type={NoAccessContainerType.Agent} />;
  }

  const hasNoAccessToChat = !canUseChat && !showBodyLoader;
  const shouldRenderChat =
    !hasNoAccessToChat && (!isErrorAIAgentNotAvailable || showArticleLoader);
  const shouldRenderFiles = currentView !== "chat";

  return (
    <>
      {shouldRenderChat ? (
        <Activity mode={currentView === "chat" ? "visible" : "hidden"}>
          <Chat
            className={styles.aiAgentChat}
            useExternalScroll={true}
            externalScrollRef={scrollRef}
            internalInit={false}
            userAvatar={userAvatar!}
            agentId={isViewLoading && !showHeaderLoader ? "-1" : roomId!}
            getIcon={getIcon!}
            selectedModel={chatSettings?.modelId ?? ""}
            isLoading={showBodyLoader}
            attachmentFile={attachmentFile}
            clearAttachmentFile={onClearAttachmentFile}
            toolsSettings={toolsSettings}
            initChats={initChats}
            messagesSettings={messagesSettings}
            isAdmin={isAdmin}
            canEditAgent={canEditAgent}
            chatRecommendedModelVisible={chatRecommendedModelVisible}
            onCloseRecomendation={onCloseRecomendation}
            aiReady={aiConfig?.aiReady || false}
            modelAliases={aiConfig?.modelAliases}
            recommendedModelForForms={aiConfig?.recommendedModelForForms}
            standalone // NOTE: AI SaaS same as AI Standalone in v.4.0
            getResultStorageId={getResultStorageId}
            multimodal={
              chatSettings?.capabilities?.vision !== false
                ? chatSettings?.multimodal
                : undefined
            }
            setMediaViewerVisible={setMediaViewerVisible}
            setAiPlaylistImages={setAiPlaylistImages}
            goToWebSearchSettings={goToWebSearchSettings}
            goToAISettings={goToAISettings}
            onOpenEdit={onOpenEdit}
            allowAttachFiles
            allowManageTools
            allowSelectChat
            persistDraft
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
    accessRightsStore,
    mediaViewerDataStore,
    aiRoomStore,
  }: TStore) => {
    const { isErrorAIAgentNotAvailable } = filesStore;

    const { showArticleLoader, showHeaderLoader, showBodyLoader } =
      clientLoadingStore;

    const { setMediaViewerVisible } = mediaViewerDataStore;

    const { user } = userStore;

    const { getIcon } = filesSettingsStore;

    const { chatSettings, security } = selectedFolderStore;

    const { isAdmin } = authStore;

    const canEditAgent = !!security?.EditRoom;

    const { aiConfig } = settingsStore;

    const { canUseChat } = accessRightsStore;

    const { setAiPlaylistImages } = aiRoomStore;

    return {
      isErrorAIAgentNotAvailable,
      showArticleLoader,
      showHeaderLoader,
      showBodyLoader,
      userAvatar: user?.avatar,
      getIcon,
      chatSettings,
      isAdmin,
      canEditAgent,
      aiConfig,
      canUseChat,

      setMediaViewerVisible,
      setAiPlaylistImages,
    };
  },
)(observer(AIAgentViewComponent));

