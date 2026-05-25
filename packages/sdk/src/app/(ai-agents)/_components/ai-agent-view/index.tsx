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

import React from "react";
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

  // Chat uses Section's own Scrollbar (`<Scrollbar id="sectionScroll">`)
  // as its scroll viewport — passed to Chat via `externalScrollRef` so
  // ChatContainer skips its internal <Scrollbar> (and the
  // `--chat-content-padding` it injects onto .chatScrollBody).
  // Mirrors the client's `useScroll`: resolves the scroller lazily on
  // mount because the section may render before this component does.
  const chatScrollRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    const el = document.querySelector<HTMLElement>(
      "#sectionScroll .scroll-wrapper > .scroller",
    );
    if (el) chatScrollRef.current = el;
  }, []);

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

  // Chat stays mounted across tab switches (preserving scroll position and
  // message-stream effects). We toggle visibility via CSS instead of
  // React's experimental `<Activity>`, which unmounts effects on
  // `hidden` and didn't reliably re-attach them on `visible` after the
  // tab switch was moved to `history.replaceState` (no full Next.js
  // re-render to repopulate the subtree).
  //
  // The inline `display: none` is applied to BOTH the wrapper and the inner
  // `.chat-container` (via Chat's `style` prop). Section's
  // `:has(.chat-container:not([style*="display: none"]))` rule zeros out
  // `padding-block` whenever a chat-container exists in the DOM without an
  // inline `display: none` — putting it only on the wrapper used to leave
  // the inner div unflagged, so the rule kept matching on Knowledge/Result
  // tabs and clipped the table column header above the visible viewport.
  const chatHidden = currentTab !== "chat";
  return (
    <>
      {shouldRenderChat ? (
        <div
          className={styles.aiAgentChat}
          style={chatHidden ? { display: "none" } : undefined}
        >
          <Chat
            agentId={roomId}
            selectedModel=""
            standalone
            allowAttachFiles
            allowSelectChat
            attachmentFile={null}
            clearAttachmentFile={() => {}}
            width="100%"
            useExternalScroll
            externalScrollRef={chatScrollRef}
            style={chatHidden ? { display: "none" } : undefined}
          />
        </div>
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
