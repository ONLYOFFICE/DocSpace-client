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
import { useTranslation } from "react-i18next";

import {
  useAiChatStore,
  useApi as useAiChatApi,
  useStores as useAiChatStores,
} from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { AnimationEvents } from "@onlyoffice/apps-ui-kit/hooks/useAnimation";

import { useStore } from "SRC_DIR/store/useStore";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import {
  isAiChatPageAt,
  readAiChatPage,
  type TAiChatPageMemory,
  writeAiChatPage,
} from "./aiChatPageMemory";

/** How many conversations the sidebar's Recent lists. */
const RECENT_THREADS_COUNT = 5;

/**
 * How many conversations one read of Recent asks for. More than it shows:
 * the ones without a title among the latest are not listed.
 */
const RECENT_READ_COUNT = 20;

/**
 * How long a change of the general chat's list waits before Recent is read
 * again: a round changes the list more than once, and on the way between
 * two agents the list changes with no general chat behind it.
 */
export const RECENT_REFRESH_DELAY_MS = 500;

// The chat's settings on the default agent: no model and no rooms of an agent.
const DEFAULT_AGENT = {
  profileId: null,
  profileName: null,
  contextRooms: [],
  knowledgeRooms: [],
};

type AiChatPageBridgeProps = {
  /**
   * The session may use the AI API (Shell's `canUseAi`). Without it the
   * conversations are not read: guests and anonymous sessions have none.
   */
  canLoadThreads?: boolean;
  /**
   * The agent the chat is scoped to (Shell's `chatEntityId`): on its page,
   * or picked in the chat panel. The chat then lists that agent's
   * conversations; Recent is read apart from the chat's list either way.
   */
  chatEntityId?: string;
};

/**
 * Connects the sidebar's AI Chat section to the chat library's stores, which
 * exist only inside `AiAgentProviders` (mounted once inside them):
 *
 * - fulfils the requests recorded by `dialogsStore.requestAiChatPage` - AI
 *   Chat, a conversation under it and All chats open the chat fullscreen, on
 *   a new conversation, on that conversation or on its history. A
 *   conversation and All chats open on the default agent, whatever agent the
 *   chat ran on. A request with a draft opens a new conversation on the
 *   default agent with that text in the composer;
 * - mirrors the latest conversations and the open one into `dialogsStore`
 *   for Recent's entries. They are read even while the chat is closed, since
 *   the sidebar shows them all the time. Recent lists the conversations of
 *   no agent, by a read of its own, and reads them again only when the
 *   general chat changed - never because an agent was opened or left;
 * - remembers the fullscreen chat for the tab and opens it again after a
 *   reload: the chat has no address, so the reload would show the page it
 *   covered - the agents list - in its place;
 * - titles the browser tab after the fullscreen chat while it is shown.
 */
const AiChatPageBridgeComponent = ({
  canLoadThreads = false,
  chatEntityId,
}: AiChatPageBridgeProps) => {
  const { t } = useTranslation(["Common"]);
  const dialogsStore = useStore("dialogsStore");
  const request = dialogsStore.aiChatPageRequest;
  const userId = useStore("userStore").user?.id;
  const { isAiProjectRoomRoot } = useStore("treeFoldersStore");
  const aiPresetsStore = useStore("aiPresetsStore");

  const location = useLocation();
  const address = `${location.pathname}${location.search}`;
  const addressRef = React.useRef(address);
  addressRef.current = address;
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
  const activeThreadId = useThreadsStore((s) => s.threadId);
  const threadsLoaded = useThreadsStore((s) => s.threadsLoaded);

  // The chat a reload interrupted: `undefined` until it is read - the user
  // and the right to use AI may arrive after the first render - and `null`
  // once it is reopened or there was none. Until then the chat being closed
  // is not a reason to forget it. A chat remembered over another page than
  // the one the tab loaded (another address of the section opened by URL)
  // is forgotten: that page is shown, with no chat over it.
  const [interrupted, setInterrupted] = React.useState<
    TAiChatPageMemory | null | undefined
  >(undefined);
  const isRestoring = interrupted !== null;
  React.useEffect(() => {
    if (!userId || !canLoadThreads) return;
    setInterrupted((current) => {
      if (current !== undefined) return current;
      const saved = readAiChatPage(userId);
      if (!saved || isAiChatPageAt(saved, addressRef.current)) return saved;
      writeAiChatPage(userId, null);
      return null;
    });
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
            address,
          }
        : null,
    );
  }, [
    isRestoring,
    userId,
    isChatPage,
    isOnHistoryPage,
    activeThreadId,
    address,
  ]);

  // The tab is titled after the fullscreen chat, not after the page under
  // it - whose own reads title it again meanwhile (the agents list loading
  // after the chat opened over it): their title is kept for when the chat
  // goes, and the chat's put back.
  React.useEffect(() => {
    if (!isChatPage) return undefined;
    let underlying = document.title;
    setDocumentTitle(t("Common:AIChat"));
    const chatTitle = document.title;
    const observer = new MutationObserver(() => {
      if (document.title === chatTitle) return;
      underlying = document.title;
      document.title = chatTitle;
    });
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => {
      observer.disconnect();
      if (document.title === chatTitle) document.title = underlying;
    };
  }, [isChatPage, t]);

  // The chat's own list is read while the chat is on no agent, even closed:
  // the chat a reload interrupted is looked up in it, and the chat reads it
  // the same way when it opens, so this costs it nothing then.
  React.useEffect(() => {
    if (!canLoadThreads || chatEntityId !== undefined) return;
    useThreadsStore
      .getState()
      .ensureThreads(undefined)
      .catch(() => {
        // AI may be unavailable to the caller: there is no chat to reopen.
        setInterrupted(null);
      });
  }, [canLoadThreads, chatEntityId, useThreadsStore]);

  // Recent lists the conversations of no agent, and only a read of its own
  // fills it: the chat's list is an agent's while the chat is on one, and
  // on the way from one agent to another it may hold either's under no
  // agent at all. A conversation without a title has not had its first
  // message yet. A read that fails keeps what Recent lists.
  const recentReadRef = React.useRef(0);
  const readRecent = React.useCallback(() => {
    recentReadRef.current += 1;
    const read = recentReadRef.current;
    chatApiRef.current.threads
      .list(undefined, RECENT_READ_COUNT)
      .then((list) => {
        if (read !== recentReadRef.current) return;
        const titled = list.filter((thread) => thread.title);
        dialogsStore.setAiChatRecentThreads(
          titled
            .slice(0, RECENT_THREADS_COUNT)
            .map((thread) => ({ id: thread.threadId, title: thread.title ?? "" })),
          titled.length > RECENT_THREADS_COUNT ||
            list.length >= RECENT_READ_COUNT,
        );
      })
      .catch(() => {});
  }, [dialogsStore]);

  React.useEffect(() => {
    if (!canLoadThreads) {
      recentReadRef.current += 1;
      dialogsStore.setAiChatRecentThreads([]);
      return;
    }
    readRecent();
  }, [canLoadThreads, readRecent, dialogsStore]);

  // Recent is read again only when the general chat changed: a conversation
  // of no agent got its first message, another one, a new name, or is gone.
  // The chat's list tells it while the chat is on no agent - by its latest
  // titled conversations, compared with what it showed on no agent before,
  // so opening an agent, another one or leaving one reads nothing. The list
  // only says when to read, never what Recent shows.
  const generalThreadsKey =
    chatEntityId === undefined && threadsLoaded
      ? JSON.stringify(
          threads
            .filter((thread) => thread.title)
            .slice(0, RECENT_THREADS_COUNT + 1)
            .map((thread) => [thread.threadId, thread.title]),
        )
      : null;
  const seenGeneralThreadsKeyRef = React.useRef<string | null>(null);
  const recentRefreshRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  React.useEffect(() => {
    if (!canLoadThreads || generalThreadsKey === null) return;
    const seen = seenGeneralThreadsKeyRef.current;
    seenGeneralThreadsKeyRef.current = generalThreadsKey;
    // The first list seen is what the first read of Recent covers.
    if (seen === null || seen === generalThreadsKey) return;
    if (recentRefreshRef.current) clearTimeout(recentRefreshRef.current);
    recentRefreshRef.current = setTimeout(() => {
      recentRefreshRef.current = null;
      readRecent();
    }, RECENT_REFRESH_DELAY_MS);
  }, [canLoadThreads, generalThreadsKey, readRecent]);
  React.useEffect(
    () => () => {
      if (recentRefreshRef.current) clearTimeout(recentRefreshRef.current);
    },
    [],
  );

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

    // Recent and the conversations under it are the default agent's: the
    // history it opens never lists an agent's conversations. A chat that
    // runs on an agent picked in the panel is taken off it first, its
    // conversation left in that agent's history, and the request waits for
    // the chat's scope to follow. An agent's page releases its own chat as
    // the navigation leaves it.
    const isRecentRequest = request.page === "history" || !!request.threadId;
    if (isRecentRequest && chatEntityId !== undefined) {
      if (aiPresetsStore.activePreset && !isAiProjectRoomRoot) {
        const chatThreads = useThreadsStore.getState();
        if (chatThreads.threadId)
          chatThreads.onSwitchToNewThread({ keepSessionProfile: true });
        aiPresetsStore.cancelApply();
        aiPresetsStore.setActivePreset(null);
        aiChatStore.applyPreset(DEFAULT_AGENT);
      }
      return;
    }

    const consumed = dialogsStore.consumeAiChatPageRequest();
    if (!consumed) return;

    const openChat = () => {
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
      if (consumed.draft && consumed.page === "chat") {
        // A chat opened for one job: a new conversation on the default
        // agent, with nothing connected, whose composer holds the draft.
        aiPresetsStore.cancelApply();
        aiPresetsStore.setActivePreset(null);
        aiPresetsStore.setChatSkillRooms(null);
        aiChatStore.openPreset({ ...DEFAULT_AGENT, draft: consumed.draft });
        aiChatStore.setFullscreen(true);
        goToChat();
        return;
      }
      // A closed panel starts a fresh conversation by itself.
      const wasOpen = aiChatStore.isVisible;
      aiChatStore.openNewChat();
      aiChatStore.setFullscreen(true);
      if (consumed.page === "history") {
        void openHistory();
        return;
      }
      // AI Chat starts a new conversation every time: an open chat is taken
      // off the conversation it shows, which stays in the history. One that
      // has no message yet is new already. The agent picked in the panel
      // stays, and its model with it.
      const chatThreads = useThreadsStore.getState();
      if (wasOpen && chatThreads.threadId)
        chatThreads.onSwitchToNewThread({
          keepSessionProfile: !!aiPresetsStore.activePreset,
        });
      goToChat();
    };

    // A request that waits for no navigation opens the chat at once, before
    // the page under it is painted: the sidebar asks so wherever nothing on
    // the way closes the chat. One that waited for a navigation opens after
    // that navigation's effects have run: leaving an AI project releases its
    // chat and closes the panel, and on a phone a section change closes it
    // too. Opened before them, the chat would be closed again. Not cleared
    // on re-run: the request is consumed already, so a re-run has nothing
    // else to do it with.
    if (consumed.afterLocationKey === null) openChat();
    else window.setTimeout(openChat, 0);
  }, [
    request,
    location.key,
    dialogsStore,
    aiChatStore,
    aiPresetsStore,
    chatEntityId,
    isAiProjectRoomRoot,
    useThreadsStore,
    goToChat,
    openHistory,
    switchToThread,
  ]);

  return null;
};

export const AiChatPageBridge = observer(AiChatPageBridgeComponent);

export default AiChatPageBridge;
