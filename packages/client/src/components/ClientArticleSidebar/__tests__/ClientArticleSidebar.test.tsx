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

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { observable, runInAction } from "mobx";
import { Provider } from "mobx-react";
import { describe, expect, it, vi } from "vitest";

import { FolderType, RoomsType } from "@docspace/shared/enums";

const { navigateMock, chat, route } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  // The chat panel's store, or none (a host without the AI providers).
  chat: { store: null as null | Record<string, unknown> },
  route: { pathname: "/private/filter", search: "" },
}));

vi.mock("react-router", () => ({
  useLocation: () => route,
  useNavigate: () => navigateMock,
}));

vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store", () => ({
  useAiChatStoreOptional: () => chat.store,
}));

vi.mock("SRC_DIR/components/NewFilesBadge", () => ({
  default: ({
    newFilesCount,
    folderId,
  }: {
    newFilesCount: number;
    folderId: string | number;
  }) => (
    <span data-testid="new-files-badge" data-folder={folderId}>
      {newFilesCount}
    </span>
  ),
}));

vi.mock("SRC_DIR/components/BetaBadgeWrapper", () => ({
  default: ({
    title,
    description,
  }: {
    title?: string;
    description?: string;
  }) => (
    <span data-testid="beta-badge" data-title={title}>
      {description}
    </span>
  ),
}));

type TNavEntry = {
  id: string;
  onClick?: (item: TNavEntry, meta: { isLink: boolean }) => void;
  badgeComponent?: React.ReactNode;
  children?: TNavEntry[];
};

const flattenIds = (groups: { items: TNavEntry[] }[]) =>
  groups
    .flatMap((group) => group.items)
    .flatMap((item) => [item, ...(item.children ?? [])])
    .map((item) => item.id)
    .join(" ");

vi.mock("SRC_DIR/components/AppsSidebar", () => ({
  default: ({
    groups,
    activeId,
    collapsedGroups,
    collapsedActiveId,
  }: {
    groups: { items: TNavEntry[] }[];
    activeId?: string;
    collapsedGroups?: { items: TNavEntry[] }[];
    collapsedActiveId?: string;
  }) => (
    <ul
      data-testid="nav"
      data-active-id={activeId}
      data-collapsed-ids={collapsedGroups ? flattenIds(collapsedGroups) : undefined}
      data-collapsed-active-id={collapsedActiveId}
    >
      {groups
        .flatMap((group) => group.items)
        .flatMap((item) => [item, ...(item.children ?? [])])
        .map((item) => (
          <li
            key={item.id}
            data-testid={`nav-${item.id}`}
            data-item-id={item.id}
            onClick={() => item.onClick?.(item, { isLink: false })}
          >
            {item.badgeComponent}
          </li>
        ))}
    </ul>
  ),
}));

// Every prop comes from the stores of the Provider below.
const ClientArticleSidebar = (await import("../index"))
  .default as unknown as React.ComponentType;

type TRenderOptions = {
  pinnedProjects?: { id: string; name: string }[];
  recentThreads?: { id: string; title: string }[];
  hasMoreThreads?: boolean;
  selectedFolder?: Record<string, unknown>;
};

const sidebar = (
  extraFolders: unknown[] = [],
  {
    pinnedProjects = [],
    recentThreads = [],
    hasMoreThreads = false,
    selectedFolder = { id: 1, rootFolderType: FolderType.USER, isRootFolder: true },
  }: TRenderOptions = {},
) => (
    <Provider
      authStore={{ isAdmin: true, isRoomAdmin: false }}
      userStore={{ user: { id: "user-1", isVisitor: false } }}
      treeFoldersStore={{
        treeFolders: [
          { id: 1, title: "My documents", rootFolderType: FolderType.USER },
          { id: 2002, title: "Rooms", rootFolderType: FolderType.Rooms },
          { id: 2003, title: "Archive", rootFolderType: FolderType.Archive },
          ...extraFolders,
        ],
        roomsFolderId: 2002,
        archiveFolderId: 2003,
        myFolderId: 1,
        isTemplatesFolderRoot: false,
        isDocumentsFolder: false,
        pinnedAiProjects: pinnedProjects.map((project) => ({
          ...project,
          logo: { color: "" },
        })),
      }}
      filesStore={{ setSelection: vi.fn(), trashIsEmpty: true }}
      filesActionsStore={{ emptyTrashInProgress: false }}
      dialogsStore={{
        setEmptyTrashDialogVisible: vi.fn(),
        requestAiChatPage: vi.fn(),
        aiChatRecentThreads: recentThreads,
        aiChatHasMoreThreads: hasMoreThreads,
        aiChatActiveThreadId: "",
      }}
      selectedFolderStore={selectedFolder}
      clientLoadingStore={{
        showArticleLoader: false,
        setIsSectionBodyLoading: vi.fn(),
      }}
      settingsStore={{ aiServicesEnabled: true }}
      appsStore={{
        isInstalled: () => true,
        isPrivateRoomsSectionAvailable: true,
        ensureLoaded: vi.fn(),
      }}
    >
      <ClientArticleSidebar />
    </Provider>
);

const renderSidebar = (extraFolders: unknown[] = [], options: TRenderOptions = {}) =>
  render(sidebar(extraFolders, options));

describe("ClientArticleSidebar — Private section", () => {
  it("Private item rendered", () => {
    renderSidebar();

    expect(screen.getByTestId("nav-private-rooms")).toBeInTheDocument();
    expect(screen.getByTestId("nav-private-rooms-archive")).toBeInTheDocument();
  });

  it("Beta badge shown", () => {
    renderSidebar();

    expect(
      within(screen.getByTestId("nav-private-rooms")).getByTestId("beta-badge"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("nav-private-rooms-archive")).queryByTestId(
        "beta-badge",
      ),
    ).toBeNull();
  });

  it("Badge tooltip", () => {
    renderSidebar();

    const badge = within(screen.getByTestId("nav-private-rooms")).getByTestId(
      "beta-badge",
    );
    expect(badge).toHaveAttribute("data-title", "Common:PrivateRoomsBetaTitle");
    expect(badge).toHaveTextContent("Common:PrivateRoomsBetaDescription");
  });
});

describe("ClientArticleSidebar — AI Chat section", () => {
  it("lists AI Chat, then Agents, Recent, Skill sets and Knowledge bases", () => {
    renderSidebar([
      { id: 2010, title: "AI", rootFolderType: FolderType.AiHub },
    ]);

    const ids = screen
      .getAllByTestId(/^nav-ai-/)
      .map((item) => item.dataset.testid);

    expect(ids).toEqual([
      "nav-ai-chat",
      "nav-ai-rooms",
      "nav-ai-chat-recent",
      "nav-ai-rooms-skills",
      "nav-ai-rooms-knowledge",
    ]);
  });
});

describe("ClientArticleSidebar — an opened AI room on its short address", () => {
  const aiHub = [{ id: 2010, title: "AI", rootFolderType: FolderType.AiHub }];

  const renderAt = (search: string, selectedFolder: Record<string, unknown>) => {
    route.pathname = "/ai-rooms/32/filter";
    route.search = search;
    try {
      renderSidebar(aiHub, { selectedFolder });
    } finally {
      route.pathname = "/private/filter";
      route.search = "";
    }
    return screen.getByTestId("nav").dataset.activeId;
  };

  it("highlights Skill sets for an opened skill set and Knowledge bases inside a knowledge base", () => {
    expect(
      renderAt("?folder=32", {
        id: 32,
        rootFolderType: FolderType.AiHub,
        isRootFolder: false,
        roomType: RoomsType.InstructionsRoom,
      }),
    ).toBe("ai-rooms-skills");
    cleanup();
    expect(
      renderAt("?folder=40", {
        id: 40,
        rootFolderType: FolderType.AiHub,
        isRootFolder: false,
        roomType: null,
        parentRoomType: FolderType.KnowledgeRoom,
      }),
    ).toBe("ai-rooms-knowledge");
  });

  it("keeps to the address while the room being left is still in the store", () => {
    expect(
      renderAt("?folder=55", {
        id: 32,
        rootFolderType: FolderType.AiHub,
        isRootFolder: false,
        roomType: RoomsType.InstructionsRoom,
      }),
    ).toBe("ai-rooms");
  });

  it("stays on Skill sets while a skill set opened from its list is loading", () => {
    // Observable, as the store is: the sidebar follows what it holds.
    const selectedFolder = observable<Record<string, unknown>>({
      id: 2010,
      rootFolderType: FolderType.AiHub,
      isRootFolder: true,
      roomType: null,
    });
    const activeId = () => screen.getByTestId("nav").dataset.activeId;
    try {
      route.pathname = "/ai-rooms/filter";
      route.search = `?type=${RoomsType.InstructionsRoom}`;
      renderSidebar(aiHub, { selectedFolder });
      expect(activeId()).toBe("ai-rooms-skills");

      // The address names the room, which the store does not hold yet.
      route.pathname = "/ai-rooms/32/filter";
      route.search = "?folder=32";
      act(() =>
        runInAction(() => {
          selectedFolder.isRootFolder = false;
        }),
      );
      expect(activeId()).toBe("ai-rooms-skills");

      act(() =>
        runInAction(() => {
          selectedFolder.id = 32;
          selectedFolder.roomType = RoomsType.InstructionsRoom;
        }),
      );
      expect(activeId()).toBe("ai-rooms-skills");
    } finally {
      route.pathname = "/private/filter";
      route.search = "";
    }
  });
});

describe("ClientArticleSidebar — AI Chat section recent entries", () => {
  it("lists every pinned project under Agents, and the conversations under Recent with Show more", () => {
    const pinnedProjects = Array.from({ length: 7 }, (_, index) => ({
      id: String(100 + index),
      name: `Project ${index}`,
    }));
    renderSidebar(
      [{ id: 2010, title: "AI", rootFolderType: FolderType.AiHub }],
      {
        pinnedProjects,
        recentThreads: [
          { id: "t1", title: "First" },
          { id: "t2", title: "Second" },
        ],
        hasMoreThreads: true,
      },
    );

    const ids = screen
      .getAllByTestId(/^nav-ai-/)
      .map((item) => item.dataset.testid);

    expect(ids).toEqual([
      "nav-ai-chat",
      "nav-ai-rooms",
      "nav-ai-nested-project-100",
      "nav-ai-nested-project-101",
      "nav-ai-nested-project-102",
      "nav-ai-nested-project-103",
      "nav-ai-nested-project-104",
      "nav-ai-nested-project-105",
      "nav-ai-nested-project-106",
      "nav-ai-chat-recent",
      "nav-ai-nested-chat-t1",
      "nav-ai-nested-chat-t2",
      "nav-ai-nested-chats-more",
      "nav-ai-rooms-skills",
      "nav-ai-rooms-knowledge",
    ]);
  });
});

describe("ClientArticleSidebar — collapsed", () => {
  it("leaves the agents and conversations out of the collapsed sidebar, and highlights Agents on an agent's page", () => {
    route.pathname = "/ai-rooms/100/filter";
    route.search = "?folder=100";
    try {
      renderSidebar([{ id: 2010, title: "AI", rootFolderType: FolderType.AiHub }], {
        pinnedProjects: [{ id: "100", name: "Only" }],
        recentThreads: [{ id: "t1", title: "First" }],
        hasMoreThreads: true,
      });
    } finally {
      route.pathname = "/private/filter";
      route.search = "";
    }

    const nav = screen.getByTestId("nav");
    expect(nav.dataset.activeId).toBe("ai-nested-project-100");
    expect(nav.dataset.collapsedActiveId).toBe("ai-rooms");
    const collapsed = (nav.dataset.collapsedIds ?? "").split(" ");
    expect(collapsed.filter((id) => id.startsWith("ai-"))).toEqual([
      "ai-chat",
      "ai-rooms",
      "ai-chat-recent",
      "ai-rooms-skills",
      "ai-rooms-knowledge",
    ]);
  });
});

describe("ClientArticleSidebar — AI Chat section without more entries", () => {
  it("offers no Show more while everything is listed", () => {
    renderSidebar(
      [{ id: 2010, title: "AI", rootFolderType: FolderType.AiHub }],
      {
        pinnedProjects: [{ id: "100", name: "Only" }],
        recentThreads: [{ id: "t1", title: "First" }],
      },
    );

    expect(screen.queryByTestId("nav-ai-nested-chats-more")).toBeNull();
  });
});

describe("ClientArticleSidebar — AI Chat section full names", () => {
  it("shows a project's and a conversation's whole name on hover", () => {
    renderSidebar(
      [{ id: 2010, title: "AI", rootFolderType: FolderType.AiHub }],
      {
        pinnedProjects: [{ id: "100", name: "A project with a very long name" }],
        recentThreads: [{ id: "t1", title: "A conversation with a long title" }],
      },
    );

    expect(screen.getByTestId("nav-ai-nested-project-100")).toHaveAttribute(
      "title",
      "A project with a very long name",
    );
    expect(screen.getByTestId("nav-ai-nested-chat-t1")).toHaveAttribute(
      "title",
      "A conversation with a long title",
    );
  });
});

describe("ClientArticleSidebar — leaving the AI Chat page", () => {
  const renderWithChat = (effectiveFullscreen: boolean) => {
    const store = {
      isVisible: true,
      effectiveFullscreen,
      isOnHistoryPage: false,
      close: vi.fn(),
      setFullscreen: vi.fn(),
    };
    chat.store = store;
    renderSidebar([{ id: 2010, title: "AI", rootFolderType: FolderType.AiHub }]);
    return store;
  };

  // The name the ui-kit gives the event (`AnimationEvents.END_ANIMATION`).
  const pageShown = () => window.dispatchEvent(new CustomEvent("ANIMATION_END"));

  it("keeps the fullscreen chat over the page until the clicked entry's page is shown, then closes it", () => {
    const store = renderWithChat(true);

    fireEvent.click(screen.getByTestId("nav-ai-rooms"));

    expect(navigateMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\/ai-rooms\/filter\?/),
    );
    expect(store.close).not.toHaveBeenCalled();

    pageShown();
    expect(store.close).toHaveBeenCalledTimes(1);
    // The wait is over: a later page load closes nothing.
    pageShown();
    expect(store.close).toHaveBeenCalledTimes(1);
    chat.store = null;
  });

  it("closes the fullscreen chat anyway when the page never says it is shown", () => {
    vi.useFakeTimers();
    const store = renderWithChat(true);

    fireEvent.click(screen.getByTestId("nav-ai-rooms"));
    expect(store.close).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(store.close).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
    chat.store = null;
  });

  it("keeps a side-panel chat open across sections", () => {
    const store = renderWithChat(false);

    fireEvent.click(screen.getByTestId("nav-ai-rooms"));

    expect(store.close).not.toHaveBeenCalled();
    chat.store = null;
  });
});

describe("ClientArticleSidebar — New-items counter on the section item", () => {
  const privateRoot = (newItems: number) => ({
    id: 2004,
    title: "Private",
    rootFolderType: FolderType.PrivateRooms,
    newItems,
  });

  it("Counter shown", () => {
    renderSidebar([privateRoot(3)]);

    const item = within(screen.getByTestId("nav-private-rooms"));
    const counter = item.getByTestId("new-files-badge");

    expect(counter).toHaveTextContent("3");
    expect(counter).toHaveAttribute("data-folder", "private");
    expect(item.getByTestId("beta-badge")).toBeInTheDocument();
  });

  it("shows no counter while the Private root has nothing new", () => {
    renderSidebar([privateRoot(0)]);

    const item = within(screen.getByTestId("nav-private-rooms"));

    expect(item.queryByTestId("new-files-badge")).toBeNull();
    expect(item.getByTestId("beta-badge")).toBeInTheDocument();
  });

  it("shows no counter when the server lists no Private root", () => {
    renderSidebar();

    expect(
      within(screen.getByTestId("nav-private-rooms")).queryByTestId(
        "new-files-badge",
      ),
    ).toBeNull();
  });
});
