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
import { MemoryRouter } from "react-router";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type TThread = { threadId: string; title?: string };

const chat = vi.hoisted(() => ({
  // The chat library's threads store, as the bridge reads it.
  threads: {
    threads: [] as TThread[],
    hasMoreThreads: false,
    threadId: "",
    threadsLoaded: true,
    onSwitchToThread: () => {},
    ensureThreads: async (_entityId?: string) => {},
  },
  list: async (_entityId?: string, _count?: number): Promise<TThread[]> => [],
  store: {
    isVisible: false,
    effectiveFullscreen: false,
    isOnHistoryPage: false,
    open: () => {},
    openNewChat: () => {},
    setFullscreen: () => {},
  },
}));

const dialogsStore = vi.hoisted(() => ({
  aiChatPageRequest: null,
  setAiChatRecentThreads: vi.fn(),
  setAiChatActiveThreadId: vi.fn(),
  requestAiChatPage: vi.fn(),
  consumeAiChatPageRequest: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers", () => {
  const useThreadsStore = Object.assign(
    (select: (s: typeof chat.threads) => unknown) => select(chat.threads),
    { getState: () => chat.threads },
  );
  // The library hands out the same API and stores on every render.
  const api = { threads: { list: (...args: [string?, number?]) => chat.list(...args) } };
  const router = { goToChat: () => {}, openHistory: async () => {} };
  const stores = {
    useRouter: (select: (s: object) => unknown) => select(router),
    useThreadsStore,
  };
  return {
    useAiChatStore: () => chat.store,
    useApi: () => api,
    useStores: () => stores,
  };
});

vi.mock("@onlyoffice/apps-ui-kit/hooks/useAnimation", () => ({
  AnimationEvents: { END_ANIMATION: "end-animation" },
}));

vi.mock("SRC_DIR/helpers/utils", () => ({
  setDocumentTitle: (subTitle: string) => {
    document.title = `${subTitle} - Product`;
  },
}));

vi.mock("SRC_DIR/store/useStore", () => ({
  useStore: (name: string) =>
    name === "dialogsStore"
      ? dialogsStore
      : name === "userStore"
        ? { user: { id: "u1" } }
        : { isAiProjectRoomRoot: false },
}));

import AiChatPageBridge from "../index";

const titled = (count: number, prefix: string) =>
  Array.from({ length: count }, (_, index) => ({
    threadId: `${prefix}${index}`,
    title: `${prefix} ${index}`,
  }));

const renderBridge = (chatEntityId?: string) =>
  render(
    <MemoryRouter initialEntries={["/rooms/shared"]}>
      <AiChatPageBridge canLoadThreads chatEntityId={chatEntityId} />
    </MemoryRouter>,
  );

const flush = () => act(async () => {});

describe("AiChatPageBridge — Recent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    chat.threads.threads = [];
    chat.threads.hasMoreThreads = false;
  });

  afterEach(cleanup);

  it("lists the chat's own conversations outside an agent, the five latest with Show more", async () => {
    chat.threads.threads = [...titled(6, "plain"), { threadId: "draft" }];
    const ensureThreads = vi.spyOn(chat.threads, "ensureThreads");
    renderBridge();
    await flush();

    expect(ensureThreads).toHaveBeenCalledWith(undefined);
    expect(dialogsStore.setAiChatRecentThreads).toHaveBeenLastCalledWith(
      titled(5, "plain").map((thread) => ({ id: thread.threadId, title: thread.title })),
      true,
    );
  });

  it("lists the conversations of no agent while the chat is scoped to an agent", async () => {
    // The chat's own list is the agent's.
    chat.threads.threads = titled(2, "agent");
    const list = vi.spyOn(chat, "list").mockResolvedValue(titled(2, "plain"));
    renderBridge("42");
    await flush();

    expect(list).toHaveBeenCalledWith(undefined, 6);
    expect(dialogsStore.setAiChatRecentThreads).toHaveBeenLastCalledWith(
      titled(2, "plain").map((thread) => ({ id: thread.threadId, title: thread.title })),
      false,
    );
    expect(dialogsStore.setAiChatRecentThreads).not.toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: "agent0" })]),
      expect.anything(),
    );
  });
});

describe("AiChatPageBridge — tab title", () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    chat.store.isVisible = false;
    chat.store.effectiveFullscreen = false;
  });

  it("titles the tab after the fullscreen chat, keeps it over the page's own title and gives it back", async () => {
    document.title = "Agents - Product";
    chat.store.isVisible = true;
    chat.store.effectiveFullscreen = true;
    const { unmount } = renderBridge();
    expect(document.title).toBe("Common:AIChat - Product");

    // The list under the chat finishes loading and titles the tab.
    document.title = "Agents - Product";
    await act(async () => {});
    expect(document.title).toBe("Common:AIChat - Product");

    unmount();
    expect(document.title).toBe("Agents - Product");
  });

  it("leaves the title to the page under a side-panel chat", () => {
    document.title = "Rooms - Product";
    chat.store.isVisible = true;
    renderBridge();
    expect(document.title).toBe("Rooms - Product");
  });
});
