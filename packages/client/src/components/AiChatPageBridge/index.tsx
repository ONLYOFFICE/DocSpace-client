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
import { observer } from "mobx-react";
import { useLocation } from "react-router";

import {
  useAiChatStore,
  useStores as useAiChatStores,
} from "@onlyoffice/apps-ui-kit/ai-agent/providers";

import { useStore } from "SRC_DIR/store/useStore";

/** How many conversations the sidebar's Recent lists. */
const RECENT_THREADS_COUNT = 5;

type AiChatPageBridgeProps = {
  /**
   * The session may use the AI API (Shell's `canUseAi`). Without it the
   * conversations are not read: guests and anonymous sessions have none.
   */
  canLoadThreads?: boolean;
};

/**
 * Connects the sidebar's AI Chat section to the chat library's stores, which
 * exist only inside `AiAgentProviders` (mounted once inside them):
 *
 * - fulfils the requests recorded by `dialogsStore.requestAiChatPage` - AI
 *   Chat, Recent and a conversation under it open the chat fullscreen, on the
 *   conversation, on its history or on that conversation;
 * - mirrors the latest conversations and the open one into `dialogsStore`
 *   for Recent's entries. They are read even while the chat is closed, since
 *   the sidebar shows them all the time.
 */
const AiChatPageBridgeComponent = ({
  canLoadThreads = false,
}: AiChatPageBridgeProps) => {
  const dialogsStore = useStore("dialogsStore");
  const request = dialogsStore.aiChatPageRequest;

  const location = useLocation();
  const aiChatStore = useAiChatStore();
  const chatStores = useAiChatStores();
  const { useRouter, useThreadsStore } = chatStores;
  const goToChat = useRouter((s) => s.goToChat);
  // Waits for the threads to be read, as the chat toolbar's history button.
  const openHistory = useRouter((s) => s.openHistory);
  const switchToThread = useThreadsStore((s) => s.onSwitchToThread);
  const threads = useThreadsStore((s) => s.threads);
  const activeThreadId = useThreadsStore((s) => s.threadId);

  // The list is read once per scope; the chat reads it the same way when it
  // opens, so this costs it nothing then.
  React.useEffect(() => {
    if (!canLoadThreads) return;
    void useThreadsStore
      .getState()
      .ensureThreads(chatStores.getEntityId())
      .catch(() => {
        // AI may be unavailable to the caller: Recent lists nothing.
      });
  }, [canLoadThreads, useThreadsStore, chatStores]);

  // The store keeps them most recent first. A conversation without a title
  // has not had its first message yet.
  React.useEffect(() => {
    dialogsStore.setAiChatRecentThreads(
      canLoadThreads
        ? threads
            .filter((thread) => thread.title)
            .slice(0, RECENT_THREADS_COUNT)
            .map((thread) => ({ id: thread.threadId, title: thread.title ?? "" }))
        : [],
    );
  }, [threads, canLoadThreads, dialogsStore]);

  React.useEffect(() => {
    dialogsStore.setAiChatActiveThreadId(activeThreadId);
  }, [activeThreadId, dialogsStore]);

  React.useEffect(() => {
    if (!request) return;
    // The click also navigated: wait for that navigation to land.
    if (
      request.afterLocationKey !== null &&
      request.afterLocationKey === location.key
    )
      return;

    const consumed = dialogsStore.consumeAiChatPageRequest();
    if (!consumed) return;

    // After the effects of the navigation have run: leaving an AI project
    // releases its chat and closes the panel, and on a phone a section change
    // closes it too. Opened before them, the chat would be closed again.
    // Not cleared on re-run: the request is consumed already, so a re-run
    // has nothing else to do it with.
    window.setTimeout(() => {
      if (consumed.threadId) {
        // A chosen conversation: opening must not start a fresh one.
        aiChatStore.open();
        aiChatStore.setFullscreen(true);
        goToChat();
        switchToThread(consumed.threadId);
        return;
      }
      // A closed panel starts a fresh conversation, an open one keeps its
      // thread - the same as every other way to open the chat.
      aiChatStore.openNewChat();
      aiChatStore.setFullscreen(true);
      if (consumed.page === "history") void openHistory();
      else goToChat();
    }, 0);
  }, [
    request,
    location.key,
    dialogsStore,
    aiChatStore,
    goToChat,
    openHistory,
    switchToThread,
  ]);

  return null;
};

export const AiChatPageBridge = observer(AiChatPageBridgeComponent);

export default AiChatPageBridge;
