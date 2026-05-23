// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import { Activity } from "react";
import { observer } from "mobx-react";
import dynamic from "next/dynamic";

import NoAgentItem from "../no-agent-item";
import NoAccessAgent from "../no-access-agent";
import AliasFilesList from "../alias-files-list";
import {
  useAiRoomStore,
  useAgentLoadingStore,
  useAgentsAIConfigStore,
  useAgentsUserStore,
  useKnowledgeFilesStore,
  useResultFilesStore,
} from "../../_store";

import styles from "./AIAgentView.module.scss";

// Legacy Chat (`ui-kit/ai-agent/chat`) — kept as the chat UX for AI agents
// after the new-chat package was removed.
const Chat = dynamic(() => import("@docspace/ui-kit/ai-agent/chat"), {
  ssr: false,
});

const AiAgentView = () => {
  const aiRoomStore = useAiRoomStore();
  const loadingStore = useAgentLoadingStore();
  const aiConfigStore = useAgentsAIConfigStore();
  const userStore = useAgentsUserStore();

  const {
    currentTab,
    roomId,
    knowledgeId,
    resultId,
    isErrorAIAgentNotAvailable,
  } = aiRoomStore;

  // SDK analogue of `accessRightsStore.canUseChat`: chat requires a
  // configured AI provider and a non-visitor user.
  const canUseChat =
    aiConfigStore.aiReady && !!userStore.user && !userStore.user.isVisitor;

  // No room selected — show a no-agent placeholder (ported from client
  // NoAgentItem.tsx in InfoPanel).
  if (!roomId) {
    return <NoAgentItem />;
  }

  // Agent fetch failed / no access — match client `NoAccessContainer`
  // (Agent variant). Suppressed while the body loader is on, so we don't
  // flash the error during the initial fetch.
  if (
    currentTab === "chat" &&
    isErrorAIAgentNotAvailable &&
    !loadingStore.showBodyLoader
  ) {
    return <NoAccessAgent />;
  }

  const hasNoAccessToChat = !canUseChat && !loadingStore.showBodyLoader;
  const shouldRenderChat =
    !hasNoAccessToChat &&
    (!isErrorAIAgentNotAvailable || loadingStore.showBodyLoader);

  return (
    <>
      {shouldRenderChat ? (
        <Activity mode={currentTab === "chat" ? "visible" : "hidden"}>
          <div className={styles.aiAgentChat}>
            <Chat
              agentId={roomId}
              selectedModel=""
              standalone
              allowAttachFiles
              allowSelectChat
              attachmentFile={null}
              clearAttachmentFile={() => {}}
              width="100%"
              height="100%"
            />
          </div>
        </Activity>
      ) : null}

      {currentTab === "knowledge" && knowledgeId ? (
        <AliasFilesList useStore={useKnowledgeFilesStore} />
      ) : null}
      {currentTab === "result" && resultId ? (
        <AliasFilesList useStore={useResultFilesStore} />
      ) : null}
    </>
  );
};

export default observer(AiAgentView);
