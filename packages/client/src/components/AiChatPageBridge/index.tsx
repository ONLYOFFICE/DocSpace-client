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
  useApi as useAiChatApi,
  useStores as useAiChatStores,
} from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { AnimationEvents } from "@onlyoffice/apps-ui-kit/hooks/useAnimation";

import { useStore } from "SRC_DIR/store/useStore";

import {
  readAiChatPage,
  type TAiChatPageMemory,
  writeAiChatPage,
} from "./aiChatPageMemory";

/** How many conversations the sidebar's Recent lists. */
const RECENT_THREADS_COUNT = 5;

type AiChatPageBridgeProps = {
  /**
   * The session may use the AI API (Shell's `canUseAi`). Without it the
   * conversations are not read: guests and anonymous sessions have none.
   */
  canLoadThreads?: boolean;
  /**
   * The agent the chat is scoped to (Shell's `chatEntityId`): on its page,
   * or picked in the chat panel. The chat then lists that agent's
   * conversations, and Recent is read apart from it.
   */
  chatEntityId?: string;
};

/** The conversations Recent lists, as one read of them answered. */
type TRecentSource = {
  threads: { threadId: string; title?: string }[];
  hasMore: boolean;
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
 *   the sidebar shows them all the time. Recent lists the conversations of
 *   no agent: while the chat is scoped to an agent, they are read apart from
 *   the chat's own list;
 * - remembers the fullscreen chat for the tab and opens it again after a
 *   reload: the chat has no address, so the reload would show the page it
 *   covered - the agents list - in its place.
 */
const AiChatPageBridgeComponent = ({
  canLoadThreads = false,
  chatEntityId,
}: AiChatPageBridgeProps) => {
  const dialogsStore = useStore("dialogsStore");
  const request = dialogsStore.aiChatPageRequest;
  const userId = useStore("userStore").user?.id;
  const { isAiProjectRoomRoot } = useStore("treeFoldersStore");

  const location = useLocation();
  const aiChatStore = useAiChatStore();
  const chatStores = useAiChatStores();
  // Read through a ref: a rebuilt API is no reason to read Recent again.
  const chatApi = useAiChatApi();
  const chatApiRef = React.useRef(chatApi);
  chatApiRef.current = chatApi;
  const { useRouter, useThreadsStore } = chatStores;
  const goToChat = useRouter((s) => s.goToChat);
  // Waits for the threads to be read, as the chat toolbar's history button.
  const openHistory = useRouter((s) => s.openHistory);
  const switchToThread = useThreadsStore((s) => s.onSwitchToThread);
  const threads = useThreadsStore((s) => s.threads);
  // More pages may be stored than the store has read.
  const hasMoreThreads = useThreadsStore((s) => s.hasMoreThreads);
  const activeThreadId = useThreadsStore((s) => s.threadId);
  const threadsLoaded = useThreadsStore((s) => s.threadsLoaded);

  // The chat a reload interrupted: `undefined` until it is read - the user
  // and the right to use AI may arrive after the first render - and `null`
  // once it is reopened or there was none. Until then the chat being closed
  // is not a reason to forget it.
  const [interrupted, setInterrupted] = React.useState<
    TAiChatPageMemory | null | undefined
  >(undefined);
  const isRestoring = interrupted !== null;
  React.useEffect(() => {
    if (!userId || !canLoadThreads) return;
    setInterrupted((current) =>
      current === undefined ? readAiChatPage(userId) : current,
    );
  }, [userId, canLoadThreads]);

  // Reopened once the conversations are read: one that is gone, or was never
  // sent a message, is not asked for - the chat starts a fresh one.
  React.useEffect(() => {
    if (!interrupted || !threadsLoaded) return;
    const threadId = threads.some(
      (thread) => thread.threadId === interrupted.threadId && thread.title,
    )
      ? interrupted.threadId
      : undefined;
    dialogsStore.requestAiChatPage(interrupted.page, null, threadId);
    setInterrupted(null);
  }, [interrupted, threadsLoaded, threads, dialogsStore]);

  // The chat as the sidebar's AI Chat section shows it: fullscreen, and not
  // an AI project's own, which the project's address brings back.
  const { isVisible, effectiveFullscreen, isOnHistoryPage } = aiChatStore;
  const isChatPage = isVisible && effectiveFullscreen && !isAiProjectRoomRoot;
  React.useEffect(() => {
    if (isRestoring) return;
    writeAiChatPage(
      userId,
      isChatPage
        ? {
            page: isOnHistoryPage ? "history" : "chat",
            ...(activeThreadId ? { threadId: activeThreadId } : {}),
          }
        : null,
    );
  }, [isRestoring, userId, isChatPage, isOnHistoryPage, activeThreadId]);

  // Recent lists the conversations of no agent. Outside an agent they are
  // the chat's own list, read once per scope (the chat reads it the same way
  // when it opens, so this costs it nothing then); `isListUnscoped` is set
  // once the list is that one, not an agent's left over. While the chat is
  // scoped to an agent, they are read apart, once per scope.
  const [isListUnscoped, setIsListUnscoped] = React.useState(false);
  const [unscopedRead, setUnscopedRead] = React.useState<TRecentSource | null>(
    null,
  );
  React.useEffect(() => {
    if (!canLoadThreads) return undefined;
    let cancelled = false;
    if (chatEntityId === undefined) {
      setUnscopedRead(null);
      useThreadsStore
        .getState()
        .ensureThreads(undefined)
        .then(() => {
          if (!cancelled) setIsListUnscoped(true);
        })
        .catch(() => {
          // AI may be unavailable to the caller: Recent lists nothing, and
          // there is no chat to reopen.
          setInterrupted(null);
        });
    } else {
      setIsListUnscoped(false);
      chatApiRef.current.threads
        .list(undefined, RECENT_THREADS_COUNT + 1)
        .then((list) => {
          if (cancelled) return;
          setUnscopedRead({
            threads: list,
            hasMore: list.length > RECENT_THREADS_COUNT,
          });
        })
        .catch(() => {
          // Recent keeps what it lists.
        });
    }
    return () => {
      cancelled = true;
    };
  }, [canLoadThreads, chatEntityId, useThreadsStore]);

  // The store keeps them most recent first. A conversation without a title
  // has not had its first message yet. Until a scope's list is read, Recent
  // keeps what it lists.
  React.useEffect(() => {
    if (!canLoadThreads) {
      dialogsStore.setAiChatRecentThreads([]);
      return;
    }
    const source: TRecentSource | null =
      chatEntityId === undefined && isListUnscoped
        ? { threads, hasMore: hasMoreThreads }
        : unscopedRead;
    if (!source) return;
    const titled = source.threads.filter((thread) => thread.title);
    dialogsStore.setAiChatRecentThreads(
      titled
        .slice(0, RECENT_THREADS_COUNT)
        .map((thread) => ({ id: thread.threadId, title: thread.title ?? "" })),
      titled.length > RECENT_THREADS_COUNT || source.hasMore,
    );
  }, [
    threads,
    hasMoreThreads,
    canLoadThreads,
    chatEntityId,
    isListUnscoped,
    unscopedRead,
    dialogsStore,
  ]);

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
      // The entry's highlight fills to the end once its page is shown. A
      // section does that when its list has loaded; the chat has no list,
      // and from the agents list it is opened without a navigation at all,
      // so it is done here, or the fill stops short of the end.
      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
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
