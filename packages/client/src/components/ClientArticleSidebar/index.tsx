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

import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import type {
  NavMenuGroup,
  NavMenuItem,
  NavSubItem,
} from "@onlyoffice/apps-ui-kit/components/nav-menu";
import { useAiChatStoreOptional } from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";
import { AnimationEvents } from "@onlyoffice/apps-ui-kit/hooks/useAnimation";

import { FolderType, RoomSearchArea, RoomsType } from "@docspace/shared/enums";
import { isDesktop } from "@docspace/shared/utils";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";
import FilesFilter from "@docspace/shared/api/files/filter";
import { CategoryType } from "@docspace/shared/constants";
import type { ValueOf } from "@docspace/shared/types";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { ROOMS_SECTION_FOLDER_TYPES } from "@docspace/shared/utils/rooms";

import CatalogOverviewReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-integration.svg?url";
import CatalogPrivateReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.private.react.svg?url";
import CatalogAiChatReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-chat-bubble.react.svg?url";
import CatalogAgentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-agents-bot.react.svg?url";
import CatalogSkillSetsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.skill-sets.react.svg?url";
import CatalogKnowledgeReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.knowledge-bases.react.svg?url";
import ClearTrashReactSvgUrl from "PUBLIC_DIR/images/clear.trash.react.svg?url";
import NewFilesBadge from "SRC_DIR/components/NewFilesBadge";
import BetaBadge from "SRC_DIR/components/BetaBadgeWrapper";
import AppsSidebar from "SRC_DIR/components/AppsSidebar";
import {
  buildFolderUrl,
  getClientActiveId,
  type TTreeFolder,
  type FolderIds,
} from "SRC_DIR/helpers/articleNavigation";
import { Section } from "SRC_DIR/helpers/plugins/enums";
import type { TAiChatRecentThread } from "SRC_DIR/store/DialogsStore";
import type { TAiHubRootProject } from "SRC_DIR/store/TreeFoldersStore";
import { ProjectLogo } from "SRC_DIR/pages/AiProjects/sub-components/list/ProjectLogo";

import styles from "./ClientArticleSidebar.module.scss";

type ClientArticleSidebarProps = FolderIds & {
  userId?: string;
  treeFolders: TTreeFolder[];
  isVisitor?: boolean;
  // Room admins / admins only — gates the Rooms → Templates item, matching the
  // former Rooms/Templates submenu (and the Use template quick action).
  canUseTemplates?: boolean;
  isTemplatesFolderRoot?: boolean;
  isDocumentsFolder?: boolean;
  // An AI project room is open: its chat fills the section, fullscreen, as
  // the project's own view - not the AI Chat entry.
  isAiProjectRoomRoot?: boolean;
  // The AI section room on screen (an opened skill set, knowledge base or
  // agent, or a folder inside one) and its room type: the entry that lists
  // it is highlighted even on its short address, which has no `type`.
  aiOpenFolderId?: number | string | null;
  aiOpenRoomType?: RoomsType | null;
  isNavLoading?: boolean;
  // AI Chat, a conversation under it and All chats open the chat fullscreen
  // on one of its pages; the chat library's router is switched by
  // AiChatPageBridge.
  requestAiChatPage?: (
    page: "chat" | "history",
    afterLocationKey?: string | null,
    threadId?: string,
  ) => void;
  // The latest conversations, listed under AI Chat with the one the chat
  // shows, and the AI projects listed under Agents: up to five, the pinned
  // ones first, as the server picks them.
  aiHubRootProjects?: TAiHubRootProject[];
  recentAiChats?: TAiChatRecentThread[];
  hasMoreAiChats?: boolean;
  activeAiChatId?: string;
  // The portal-wide AI switch (Settings -> Integration -> AI services). With it
  // off there is no AI in the portal at all, so the AI Projects app is dropped
  // from the catalog rather than left pointing at a section that cannot work.
  aiServicesEnabled?: boolean;
  // Settings -> Apps (standalone only): a switched-off app is not on offer, so
  // its section is left out of the sidebar altogether.
  roomsInstalled?: boolean;
  formsInstalled?: boolean;
  privateRoomsSectionAvailable?: boolean;
  ensureAppsLoaded?: () => void;
  // The Trash item offers "Empty trash" while there is something to empty.
  trashIsEmpty?: boolean;
  emptyTrashInProgress?: boolean;
  setEmptyTrashDialogVisible?: (visible: boolean) => void;
  onFolderNavigate: () => void;
};

// A stable empty default, so the memoized groups are not rebuilt each render.
const EMPTY_LIST: never[] = [];

// The room type of an AI section room told by the folder type of the room
// a folder inside it sits in.
const AI_ROOM_TYPES: Partial<Record<FolderType, RoomsType>> = {
  [FolderType.InstructionsRoom]: RoomsType.InstructionsRoom,
  [FolderType.KnowledgeRoom]: RoomsType.KnowledgeRoom,
  [FolderType.AiProjectRoom]: RoomsType.AiProjectRoom,
};

// How long a fullscreen chat waits for the page of a clicked entry to say
// it is shown before it closes anyway.
const CHAT_CLOSE_TIMEOUT = 10000;

// The path of the AI section's lists: Agents, and Skill sets and Knowledge
// bases, which narrow it with `type`.
const AI_AGENTS_PATH = "/ai-rooms/filter";

// Ids of the conversations listed under AI Chat and of the agents listed
// under Agents, the All chats and All agents links that close the two lists
// included.
// NavMenu has no third level: the agents are siblings of the Agents entry,
// and all of them are indented and spaced by the
// `[data-item-id^="ai-nested-"]` rules of the module's stylesheet.
const aiProjectItemId = (id: string | number) => `ai-nested-project-${id}`;
const aiChatItemId = (id: string) => `ai-nested-chat-${id}`;
const AI_ALL_CHATS_ID = "ai-nested-chats-more";
const AI_ALL_AGENTS_ID = "ai-nested-projects-more";
const isAiNestedItemId = (id: string) => id.startsWith("ai-nested-");

/**
 * The collapsed sidebar draws the entries as icons, one under the other: the
 * conversations listed under AI Chat and the agents listed under Agents (and
 * their All chats and All agents links) are left out there, so Skill sets
 * and Knowledge bases stay in reach without scrolling, and a conversation or
 * an agent on screen highlights the entry it is listed under.
 */
const toCollapsedGroups = (groups: NavMenuGroup[]): NavMenuGroup[] =>
  groups.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.children?.some((child) => isAiNestedItemId(child.id))
        ? {
            ...item,
            children: item.children.filter((child) => !isAiNestedItemId(child.id)),
          }
        : item,
    ),
  }));

const toCollapsedActiveId = (id: string | undefined) => {
  if (id?.startsWith("ai-nested-project-")) return "ai-rooms";
  if (id?.startsWith("ai-nested-chat-")) return "ai-chat";
  return id;
};

const ClientArticleSidebar = ({
  userId,
  treeFolders,
  isVisitor,
  canUseTemplates,
  isTemplatesFolderRoot,
  isDocumentsFolder,
  isAiProjectRoomRoot,
  aiOpenFolderId,
  aiOpenRoomType,
  requestAiChatPage,
  aiHubRootProjects = EMPTY_LIST,
  recentAiChats = EMPTY_LIST,
  hasMoreAiChats = false,
  activeAiChatId,
  isNavLoading,
  aiServicesEnabled = true,
  roomsInstalled = true,
  formsInstalled = true,
  privateRoomsSectionAvailable = false,
  ensureAppsLoaded,
  trashIsEmpty = true,
  emptyTrashInProgress,
  setEmptyTrashDialogVisible,
  onFolderNavigate,
  ...folderIds
}: ClientArticleSidebarProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const navigate = useNavigate();
  const { recentFolderId, favoritesFolderId, recycleBinFolderId } = folderIds;

  // `onFolderNavigate` is re-created on every inject render; keep a stable ref
  // so the memoized onClick handlers below don't go stale (which made nested
  // sub-items like Archive fall back to the parent's handler).
  const onFolderNavigateRef = React.useRef(onFolderNavigate);
  onFolderNavigateRef.current = onFolderNavigate;

  const aiChatStore = useAiChatStoreOptional();

  React.useEffect(() => {
    ensureAppsLoaded?.();
  }, [ensureAppsLoaded]);

  // Every sidebar entry is described by the URL it opens, so the same target
  // can be rendered as a real <a href> (Ctrl/Cmd-click and "Open link in new
  // tab" work) and still navigate in-app on a plain click. `nav()` builds the
  // { linkData, onClick } pair every item spreads in. An entry drawn as a link
  // navigates by itself (`meta.isLink`); navigating here too pushed the same
  // history entry twice. A section header with a sub-menu is a button and
  // still needs it.
  //
  // A fullscreen chat is the AI Chat page (or an AI project's own chat,
  // which its view releases on the way out): going to another entry leaves
  // it, so the chat closes rather than shrinking to the side panel over the
  // entry's page - Agents shows the projects list, not the chat beside it.
  // A side-panel chat stays open across sections, as before.
  //
  // The AI Chat page closes once the entry's page says it is shown
  // (`END_ANIMATION`), not at the click: closed at once, it uncovered the
  // agents list it lies over for as long as the entry's own list took to
  // load. A page that never says so is not waited for longer than
  // `CHAT_CLOSE_TIMEOUT`, and a chat asked for again meanwhile is left open.
  const pendingChatCloseRef = React.useRef<(() => void) | null>(null);
  const cancelChatClose = React.useCallback(() => {
    pendingChatCloseRef.current?.();
    pendingChatCloseRef.current = null;
  }, []);
  React.useEffect(() => cancelChatClose, [cancelChatClose]);
  const isAiProjectRoomRootRef = React.useRef(isAiProjectRoomRoot);
  isAiProjectRoomRootRef.current = isAiProjectRoomRoot;
  const leaveFullscreenChat = React.useCallback((path: string) => {
    if (!aiChatStore?.effectiveFullscreen) return;
    cancelChatClose();
    if (isAiProjectRoomRootRef.current) {
      // Another agent takes the chat over from this one; closed here, it
      // showed the default greeting until that agent was read. Any other
      // room of the section releases the chat once it is the one shown.
      if (!/^\/ai-rooms\/\d+\//.test(path)) aiChatStore.close();
      return;
    }
    const close = () => {
      cancelChatClose();
      if (aiChatStore.effectiveFullscreen) aiChatStore.close();
    };
    const timer = window.setTimeout(close, CHAT_CLOSE_TIMEOUT);
    window.addEventListener(AnimationEvents.END_ANIMATION, close);
    pendingChatCloseRef.current = () => {
      window.clearTimeout(timer);
      window.removeEventListener(AnimationEvents.END_ANIMATION, close);
    };
  }, [aiChatStore, cancelChatClose]);

  const nav = React.useCallback(
    (path: string): Pick<NavSubItem, "linkData" | "onClick"> => ({
      linkData: { path },
      onClick: (_item: unknown, meta?: { isLink?: boolean }) => {
        leaveFullscreenChat(path);
        onFolderNavigateRef.current?.();
        if (!meta?.isLink) navigate(path);
      },
    }),
    [navigate, leaveFullscreenChat],
  );

  const folderUrl = React.useCallback(
    (folderId: number, rootFolderType: TTreeFolder["rootFolderType"]) =>
      buildFolderUrl(folderId, rootFolderType, userId),
    [userId],
  );

  // Section-scoped Recent/Favorites/Trash: the same special files views,
  // constrained to the section's content via the `folderType` scope filter
  // (the folder types of the rooms/root the section is made of). The
  // recent/favorites folder ids are known up front (from the tree), so the URL
  // carries the concrete `folder=<id>` instead of the "@recent"/"@favorites"
  // alias FilesFilter.getDefault would otherwise set.
  const scopedUrl = React.useCallback(
    (
      categoryType: ValueOf<typeof CategoryType>,
      basePath: string,
      folderId: number | null | undefined,
      folderType: FolderType[],
    ) => {
      const filter = FilesFilter.getDefault({ categoryType });
      if (folderId != null) filter.folder = String(folderId);
      filter.folderType = folderType;
      return `${basePath}/filter?${filter.toUrlParams()}`;
    },
    [],
  );

  // Rooms list scoped to a search area — Templates replaces the former
  // Rooms/Templates submenu tabs (searchArea=Templates on /rooms/shared), and
  // Forms/FormTemplates do the same on /forms.
  const searchAreaUrl = React.useCallback(
    (basePath: string, searchArea: RoomSearchArea) => {
      const filter = RoomsFilter.getDefault(userId, searchArea);
      filter.searchArea = searchArea;
      return `${basePath}?${filter.toUrlParams(userId, false)}`;
    },
    [userId],
  );

  // The AI section's list narrowed to one of its room types: the Skill sets
  // (Instructions rooms) and Knowledge bases (Knowledge rooms) entries are
  // the same /ai-rooms list with the `type` filter preset.
  const aiHubTypeUrl = React.useCallback(
    (type: RoomsType) => {
      const filter = RoomsFilter.getDefault(userId, RoomSearchArea.AiHub);
      filter.searchArea = RoomSearchArea.AiHub;
      filter.type = [String(type)];
      return `/ai-rooms/filter?${filter.toUrlParams(userId, false)}`;
    },
    [userId],
  );

  // The AI section's list of agents (AI projects) - its root, unnarrowed.
  const aiAgentsUrl = React.useMemo(
    () => searchAreaUrl("/ai-rooms/filter", RoomSearchArea.AiHub),
    [searchAreaUrl],
  );

  // AI Chat, a conversation and All chats are the chat itself, not a list:
  // they open it fullscreen on the conversation or on its history, over the
  // agents list
  // (the section's root), which is what closing the chat goes back to. From
  // anywhere else - another section, a narrowed list - the click opens the
  // chat at once and goes to that list under it, so the list is never seen
  // on the way. Two navigations close a chat opened before them, and there
  // the chat waits for the navigation to land: leaving an AI project, whose
  // view releases its chat, and, below the desktop width, a change of the
  // path, which closes the chat that covers the main area.
  const locationRef = React.useRef(location);
  locationRef.current = location;
  const openAiChatPage = React.useCallback(
    (page: "chat" | "history", threadId?: string) => () => {
      // The chat is asked for again: a close still waiting for the entry
      // left before it is called off.
      cancelChatClose();
      const current = locationRef.current;
      const isOnAgentsList =
        current.pathname === AI_AGENTS_PATH &&
        !new URLSearchParams(current.search).has("type");
      if (isOnAgentsList) {
        requestAiChatPage?.(page, null, threadId);
        return;
      }
      const closesChat =
        !!isAiProjectRoomRootRef.current ||
        (!isDesktop() && current.pathname !== AI_AGENTS_PATH);
      requestAiChatPage?.(page, closesChat ? current.key : null, threadId);
      onFolderNavigateRef.current?.();
      navigate(aiAgentsUrl);
    },
    [requestAiChatPage, navigate, aiAgentsUrl, cancelChatClose],
  );

  // While the chat covers the page, fullscreen, the entry it was opened as
  // is the current one: the conversation when AI Chat lists it, AI Chat
  // otherwise - on the history too, which All chats opens as a link, with no
  // row of its own to highlight. An AI project's own fullscreen chat belongs
  // to the project (Agents).
  const getAiChatPageId = () => {
    if (
      !aiChatStore?.isVisible ||
      !aiChatStore.effectiveFullscreen ||
      isAiProjectRoomRoot
    )
      return undefined;
    if (
      !aiChatStore.isOnHistoryPage &&
      activeAiChatId &&
      recentAiChats.some((thread) => thread.id === activeAiChatId)
    )
      return aiChatItemId(activeAiChatId);
    return "ai-chat";
  };
  const aiChatPageId = getAiChatPageId();

  // An open AI project that Agents lists is its own entry.
  const openProjectId = /^\/ai-rooms\/(\d+)\//.exec(location.pathname)?.[1];
  const aiProjectPageId =
    openProjectId &&
    aiHubRootProjects.some((project) => project.id === openProjectId)
      ? aiProjectItemId(openProjectId)
      : undefined;

  // The open room counts only once it is the folder the address names: on
  // the way to another one the store still holds the room being left.
  const shownAiRoomType =
    aiOpenFolderId != null &&
    new URLSearchParams(location.search).get("folder") === String(aiOpenFolderId)
      ? aiOpenRoomType
      : null;

  const locationActiveId = React.useMemo(
    () =>
      getClientActiveId(
        location.pathname,
        folderIds,
        location.search,
        isTemplatesFolderRoot,
        isDocumentsFolder,
        shownAiRoomType,
      ),
    [
      location.pathname,
      location.search,
      folderIds,
      isTemplatesFolderRoot,
      isDocumentsFolder,
      shownAiRoomType,
    ],
  );

  // On the way into a room of the AI section the address already names it
  // and says nothing of its type, which only the loaded room tells: until
  // then the entry it was opened from stays the current one, so a skill set
  // or a knowledge base does not pass through Agents.
  const isAiRoomLoading =
    /^\/ai-rooms\/\d+\//.test(location.pathname) && shownAiRoomType == null;
  const lastActiveIdRef = React.useRef<string | undefined>(undefined);
  const settledActiveId = aiProjectPageId ?? locationActiveId;
  const activeId =
    aiChatPageId ??
    (isAiRoomLoading && !aiProjectPageId
      ? (lastActiveIdRef.current ?? settledActiveId)
      : settledActiveId);
  lastActiveIdRef.current = activeId;

  const groups = React.useMemo<NavMenuGroup[]>(() => {
    const find = (type: FolderType) =>
      treeFolders.find((f) => f.rootFolderType === type);

    // Build a clickable NavMenu item/sub-item from a tree folder.
    const navItem = (
      folder: TTreeFolder,
      extra?: Partial<NavSubItem>,
    ): NavSubItem => ({
      id: String(folder.id),
      label: folder.title,
      icon: getCatalogIconUrlByType(folder.rootFolderType),
      ...nav(folderUrl(folder.id, folder.rootFolderType)),
      ...extra,
    });

    const newCount = (folder?: TTreeFolder) => folder?.newItems ?? 0;

    const panelFolderId = (folder: TTreeFolder): string | number => {
      if (folder.rootFolderType === FolderType.Rooms) return "rooms";
      if (folder.rootFolderType === FolderType.Forms) return "forms";
      if (folder.rootFolderType === FolderType.PrivateRooms) return "private";
      return folder.id;
    };

    const sectionBadge = (
      folderId: string | number,
      count: number,
    ): Pick<NavSubItem, "showBadge" | "badgeComponent"> =>
      count > 0
        ? {
            showBadge: true,
            badgeComponent: (
              <NewFilesBadge newFilesCount={count} folderId={folderId} />
            ),
          }
        : {};

    const collapsedBadge = (
      parent: TTreeFolder | undefined,
      children: (TTreeFolder | undefined)[],
    ): Pick<NavMenuItem, "collapsedBadgeComponent"> => {
      if (!parent) return {};

      const counted = [parent, ...children].filter(
        (folder): folder is TTreeFolder => newCount(folder) > 0,
      );
      const total = counted.reduce((sum, folder) => sum + newCount(folder), 0);
      if (total <= 0) return {};

      const folderId = panelFolderId(parent);
      const folderIds =
        folderId === parent.id
          ? counted.map((folder) => folder.id)
          : undefined;

      return {
        collapsedBadgeComponent: (
          <NewFilesBadge
            newFilesCount={total}
            folderId={folderId}
            folderIds={folderIds}
          />
        ),
      };
    };

    const overview: NavMenuItem = {
      id: "dashboard",
      label: t("Common:Home"),
      icon: CatalogOverviewReactSvgUrl,
      ...nav("/dashboard"),
    };

    const roomsFolder = find(FolderType.Rooms);
    const myDocsFolder = find(FolderType.USER);
    const archiveFolder = find(FolderType.Archive);
    const sharedFolder = find(FolderType.SHARE);
    const recentFolder = find(FolderType.Recent);
    const favFolder = find(FolderType.Favorites);
    const trashFolder = find(FolderType.TRASH);
    const formsFolder = find(FolderType.Forms);
    const privateRoomsFolder = find(FolderType.PrivateRooms);
    const aiHubFolder = find(FolderType.AiHub);

    const mainItems: NavMenuItem[] = [];

    if (myDocsFolder || sharedFolder || recentFolder || favFolder) {
      const children: NavSubItem[] = [];
      if (sharedFolder)
        children.push(
          navItem(
            sharedFolder,
            sectionBadge(sharedFolder.id, newCount(sharedFolder)),
          ),
        );
      if (recentFolder)
        children.push(
          navItem(
            recentFolder,
            sectionBadge(recentFolder.id, newCount(recentFolder)),
          ),
        );
      if (favFolder)
        children.push(
          navItem(favFolder, sectionBadge(favFolder.id, newCount(favFolder))),
        );
      // Guests can't view or manage Files (their own files/Trash), so
      // that section is dropped and the top-level item opens Shared with me
      // instead of the (inaccessible) Files folder.
      if (!isVisitor && myDocsFolder && trashFolder) {
        const canEmptyTrash =
          !trashIsEmpty && !emptyTrashInProgress && !!setEmptyTrashDialogVisible;
        children.push(
          navItem(trashFolder, {
            withTopSeparator: true,
            ...(canEmptyTrash
              ? {
                  showBadge: true,
                  badgeComponent: (
                    <button
                      type="button"
                      className={styles.emptyTrashBadge}
                      title={t("Common:EmptyTrash")}
                      aria-label={t("Common:EmptyTrash")}
                      onClick={() => setEmptyTrashDialogVisible?.(true)}
                      data-testid="empty-trash-badge"
                    >
                      <ReactSVG src={ClearTrashReactSvgUrl} aria-hidden="true" />
                    </button>
                  ),
                }
              : sectionBadge(trashFolder.id, newCount(trashFolder))),
          }),
        );
      }

      const primaryFolder = myDocsFolder ?? sharedFolder;

      const childFolders = [sharedFolder, recentFolder, favFolder];
      if (!isVisitor && myDocsFolder) childFolders.push(trashFolder);

      mainItems.push({
        id: myDocsFolder ? String(myDocsFolder.id) : "files",
        label: myDocsFolder ? myDocsFolder.title : t("Common:Files"),
        icon: getCatalogIconUrlByType(FolderType.USER),
        ...(primaryFolder
          ? nav(folderUrl(primaryFolder.id, primaryFolder.rootFolderType))
          : {}),
        ...sectionBadge(
          myDocsFolder ? myDocsFolder.id : (primaryFolder?.id ?? ""),
          newCount(myDocsFolder),
        ),
        ...collapsedBadge(myDocsFolder ?? primaryFolder, childFolders),
        children,
      });
    }

    if (roomsFolder && roomsInstalled) {
      mainItems.push({
        ...navItem(roomsFolder),
        ...sectionBadge(panelFolderId(roomsFolder), newCount(roomsFolder)),
        ...collapsedBadge(roomsFolder, [archiveFolder]),
        children: [
          // Recent/Favorites under Rooms reuse the @recent/@favorites files
          // view, scoped to room content via the room folder types.
          {
            id: "rooms-recent",
            label: t("Common:Recent"),
            icon: getCatalogIconUrlByType(FolderType.Recent),
            ...nav(
              scopedUrl(
                CategoryType.Recent,
                "/rooms/recent",
                recentFolderId,
                ROOMS_SECTION_FOLDER_TYPES,
              ),
            ),
          },
          {
            id: "rooms-favorites",
            label: t("Common:Favorites"),
            icon: getCatalogIconUrlByType(FolderType.Favorites),
            ...nav(
              scopedUrl(
                CategoryType.Favorite,
                "/rooms/favorite",
                favoritesFolderId,
                ROOMS_SECTION_FOLDER_TYPES,
              ),
            ),
          },
          ...(canUseTemplates
            ? [
                {
                  id: "rooms-templates",
                  label: t("Common:Templates"),
                  icon: getCatalogIconUrlByType(FolderType.RoomTemplates),
                  ...nav(
                    searchAreaUrl(
                      "/rooms/shared/filter",
                      RoomSearchArea.Templates,
                    ),
                  ),
                },
              ]
            : []),
          ...(archiveFolder
            ? [
                navItem(archiveFolder, {
                  withTopSeparator: true,
                  ...sectionBadge(archiveFolder.id, newCount(archiveFolder)),
                }),
              ]
            : []),
          {
            id: "rooms-trash",
            label: t("Common:TrashSection"),
            icon: getCatalogIconUrlByType(FolderType.TRASH),
            ...nav(
              scopedUrl(
                CategoryType.Trash,
                "/rooms/trash",
                recycleBinFolderId,
                ROOMS_SECTION_FOLDER_TYPES,
              ),
            ),
          },
        ],
      });
    }

    // "Forms" is a top-level section that surfaces Form Filling Rooms (FFR).
    // The backend serves them via `searchArea=Forms` (they are excluded from the
    // Active rooms listing), so the item points at the dedicated /forms route
    // scoped to that search area.
    if (roomsFolder && formsInstalled) {
      mainItems.push({
        id: "forms",
        label: t("Common:Forms"),
        icon: getCatalogIconUrlByType(FolderType.FormRoom),
        ...nav(searchAreaUrl("/forms/filter", RoomSearchArea.Forms)),
        ...(formsFolder
          ? sectionBadge(panelFolderId(formsFolder), newCount(formsFolder))
          : {}),
        children: [
          {
            id: "forms-recent",
            label: t("Common:Recent"),
            icon: getCatalogIconUrlByType(FolderType.Recent),
            ...nav(
              scopedUrl(CategoryType.Recent, "/forms/recent", recentFolderId, [
                FolderType.FormRoom,
              ]),
            ),
          },
          {
            id: "forms-favorites",
            label: t("Common:Favorites"),
            icon: getCatalogIconUrlByType(FolderType.Favorites),
            ...nav(
              scopedUrl(
                CategoryType.Favorite,
                "/forms/favorites",
                favoritesFolderId,
                [FolderType.FormRoom],
              ),
            ),
          },
          ...(canUseTemplates
            ? [
                {
                  id: "forms-templates",
                  label: t("Common:Templates"),
                  icon: getCatalogIconUrlByType(FolderType.RoomTemplates),
                  ...nav(
                    searchAreaUrl(
                      "/forms/filter",
                      RoomSearchArea.FormTemplates,
                    ),
                  ),
                },
              ]
            : []),
          {
            id: "forms-trash",
            label: t("Common:TrashSection"),
            icon: getCatalogIconUrlByType(FolderType.TRASH),
            ...nav(
              scopedUrl(
                CategoryType.Trash,
                "/forms/trash",
                recycleBinFolderId,
                [FolderType.FormRoom],
              ),
            ),
            withTopSeparator: true,
          },
        ],
      });
    }

    // Spec: private-rooms/sidebar-section, "New-items counter on the section item"
    if (roomsFolder && privateRoomsSectionAvailable) {
      const privateNewCount = newCount(privateRoomsFolder);
      const betaBadge = (
        <BetaBadge
          place="right-start"
          title={t("Common:PrivateRoomsBetaTitle")}
          description={t("Common:PrivateRoomsBetaDescription")}
          dataTestId="private_rooms_beta_badge"
        />
      );

      mainItems.push({
        id: "private-rooms",
        label: t("Common:Private"),
        icon: CatalogPrivateReactSvgUrl,
        ...nav(searchAreaUrl("/private/filter", RoomSearchArea.PrivateRooms)),
        ...(privateRoomsFolder && privateNewCount > 0
          ? {
              showBadge: true,
              badgeComponent: (
                <>
                  <NewFilesBadge
                    newFilesCount={privateNewCount}
                    folderId={panelFolderId(privateRoomsFolder)}
                  />
                  {betaBadge}
                </>
              ),
            }
          : { badgeComponent: betaBadge }),
        children: [
          {
            id: "private-rooms-archive",
            label: t("Common:Archive"),
            icon: getCatalogIconUrlByType(FolderType.Archive),
            ...nav(
              searchAreaUrl("/private/archived/filter", RoomSearchArea.Archive),
            ),
          },
        ],
      });
    }

    // The AI section closes the apps, while the portal has AI switched on
    // (the server only serves its root then). It holds the AI projects,
    // Instructions rooms and Knowledge rooms (`FolderType.AiHub`). The
    // section itself is AI Chat: the chat, fullscreen. Right under it come
    // the latest conversations, closed by All chats (the chat's history).
    // Then Agents lists the AI projects (the section's root list; a project
    // opens as its chat), closed by All agents, and Skill sets and Knowledge
    // bases are the same list narrowed to Instructions and Knowledge rooms. There
    // is no Trash entry (its `/ai-rooms/trash` route stays) and no Archive
    // one - the server never archives these rooms. The bare `/ai-rooms` is
    // the Rooms app's SDK frame page: the section lives on the nested paths.
    if (aiHubFolder && aiServicesEnabled) {
      mainItems.push({
        id: "ai-chat",
        label: t("Common:AIChat"),
        icon: CatalogAiChatReactSvgUrl,
        onClick: openAiChatPage("chat"),
        ...sectionBadge(aiHubFolder.id, newCount(aiHubFolder)),
        children: [
          // The conversations have no icon: their titles start under the
          // section's own name.
          ...recentAiChats.map((thread) => ({
            id: aiChatItemId(thread.id),
            label: thread.title,
            onClick: openAiChatPage("chat", thread.id),
          })),
          // The rest, and the search over them, are in the chat's history.
          ...(recentAiChats.length > 0 || hasMoreAiChats
            ? [
                {
                  id: AI_ALL_CHATS_ID,
                  label: t("Common:AllChats"),
                  onClick: openAiChatPage("history"),
                },
              ]
            : []),
          {
            id: "ai-rooms",
            label: t("Common:Agents"),
            icon: CatalogAgentsReactSvgUrl,
            ...nav(aiAgentsUrl),
          },
          // A project opens as its room, which shows its chat. Its logo is
          // the one the projects list shows; without one, its initials.
          ...aiHubRootProjects.map((project) => ({
            id: aiProjectItemId(project.id),
            label: project.name,
            iconNode: (
              <ProjectLogo
                project={{
                  title: project.name,
                  logo: project.logo,
                }}
                size="20px"
                radius="4px"
                className={styles.agentLogo}
              />
            ),
            ...nav(`/ai-rooms/${project.id}/filter?folder=${project.id}`),
          })),
          // A few of them are listed: the rest are in the Agents list.
          ...(aiHubRootProjects.length > 0
            ? [
                {
                  id: AI_ALL_AGENTS_ID,
                  label: t("Common:AllAgents"),
                  ...nav(aiAgentsUrl),
                },
              ]
            : []),
          {
            id: "ai-rooms-skills",
            label: t("Common:SkillSets"),
            icon: CatalogSkillSetsReactSvgUrl,
            ...nav(aiHubTypeUrl(RoomsType.InstructionsRoom)),
          },
          {
            id: "ai-rooms-knowledge",
            label: t("Common:AIProjectKnowledgeRooms"),
            icon: CatalogKnowledgeReactSvgUrl,
            ...nav(aiHubTypeUrl(RoomsType.KnowledgeRoom)),
          },
        ],
      });
    }

    return [
      { id: "overview", items: [overview] },
      // The products themselves, captioned to set them apart from Home above.
      // In icon-only mode NavMenu renders the caption as a short divider dash
      // instead of text, so the collapsed sidebar keeps the same separation.
      ...(mainItems.length > 0
        ? [
            {
              id: "main",
              label: t("Common:AppsSectionTitle"),
              items: mainItems,
            },
          ]
        : []),
    ];
  }, [
    t,
    nav,
    folderUrl,
    scopedUrl,
    searchAreaUrl,
    aiHubTypeUrl,
    aiAgentsUrl,
    openAiChatPage,
    aiHubRootProjects,
    recentAiChats,
    hasMoreAiChats,
    treeFolders,
    isVisitor,
    canUseTemplates,
    aiServicesEnabled,
    roomsInstalled,
    formsInstalled,
    privateRoomsSectionAvailable,
    recentFolderId,
    favoritesFolderId,
    recycleBinFolderId,
    userId,
    trashIsEmpty,
    emptyTrashInProgress,
    setEmptyTrashDialogVisible,
  ]);

  // The projects and conversations are cut to the menu's width; hovering
  // one shows its whole name. NavMenu gives a sub-item no title of its own,
  // so it is set on the rendered entry, after every render (an entry the
  // menu drew anew has none).
  React.useEffect(() => {
    const titles: [string, string][] = [
      ...aiHubRootProjects.map(
        (project) => [aiProjectItemId(project.id), project.name] as [string, string],
      ),
      ...recentAiChats.map(
        (thread) => [aiChatItemId(thread.id), thread.title] as [string, string],
      ),
    ];
    for (const [id, title] of titles) {
      for (const entry of document.querySelectorAll<HTMLElement>(
        `[data-item-id="${id}"]`,
      ))
        entry.title = title;
    }
  });

  const collapsedGroups = React.useMemo(() => toCollapsedGroups(groups), [groups]);

  return (
    <AppsSidebar
      groups={groups}
      activeId={activeId}
      collapsedGroups={collapsedGroups}
      collapsedActiveId={toCollapsedActiveId(activeId)}
      isNavLoading={isNavLoading}
      pluginSection={Section.Files}
    />
  );
};

const ClientArticleSidebarConnected = inject<TStore>(
  ({
    authStore,
    userStore,
    treeFoldersStore,
    filesStore,
    filesActionsStore,
    dialogsStore,
    clientLoadingStore,
    settingsStore,
    appsStore,
    selectedFolderStore,
  }) => ({
    userId: userStore.user?.id,
    treeFolders: treeFoldersStore.treeFolders,
    roomsFolderId: treeFoldersStore.roomsFolderId,
    archiveFolderId: treeFoldersStore.archiveFolderId,
    myFolderId: treeFoldersStore.myFolderId,
    recentFolderId: treeFoldersStore.recentFolderId,
    favoritesFolderId: treeFoldersStore.favoritesFolderId,
    recycleBinFolderId: treeFoldersStore.recycleBinFolderId,
    sharedWithMeFolderId: treeFoldersStore.sharedWithMeFolderId,
    isVisitor: userStore.user?.isVisitor,
    // Matches Home's canCreateRooms — room admins and admins can use templates.
    canUseTemplates: authStore.isAdmin || authStore.isRoomAdmin,
    isTemplatesFolderRoot: treeFoldersStore.isTemplatesFolderRoot,
    isDocumentsFolder: treeFoldersStore.isDocumentsFolder,
    isAiProjectRoomRoot: treeFoldersStore.isAiProjectRoomRoot,
    ...(selectedFolderStore.rootFolderType === FolderType.AiHub &&
    !selectedFolderStore.isRootFolder
      ? {
          aiOpenFolderId: selectedFolderStore.id,
          aiOpenRoomType:
            selectedFolderStore.roomType ??
            (selectedFolderStore.parentRoomType != null
              ? AI_ROOM_TYPES[selectedFolderStore.parentRoomType]
              : undefined) ??
            null,
        }
      : {}),
    requestAiChatPage: dialogsStore.requestAiChatPage,
    aiHubRootProjects: treeFoldersStore.aiHubRootProjects,
    recentAiChats: dialogsStore.aiChatRecentThreads,
    hasMoreAiChats: dialogsStore.aiChatHasMoreThreads,
    activeAiChatId: dialogsStore.aiChatActiveThreadId,
    aiServicesEnabled: settingsStore.aiServicesEnabled,
    roomsInstalled: appsStore.isInstalled("ai-rooms"),
    formsInstalled: appsStore.isInstalled("ai-forms"),
    privateRoomsSectionAvailable: appsStore.isPrivateRoomsSectionAvailable,
    ensureAppsLoaded: appsStore.ensureLoaded,
    trashIsEmpty: filesStore.trashIsEmpty,
    emptyTrashInProgress: filesActionsStore.emptyTrashInProgress,
    setEmptyTrashDialogVisible: dialogsStore.setEmptyTrashDialogVisible,
    // Same signal the old article used to show <ArticleFolderLoader />.
    isNavLoading: clientLoadingStore.showArticleLoader,
    onFolderNavigate: () => {
      filesStore.setSelection?.([]);
      clientLoadingStore.setIsSectionBodyLoading(true, true);
    },
  }),
)(observer(ClientArticleSidebar));

export default ClientArticleSidebarConnected;
