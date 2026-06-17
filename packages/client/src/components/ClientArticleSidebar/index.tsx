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

import type { NavMenuGroup, NavMenuItem, NavSubItem } from "@docspace/ui-kit/components/nav-menu";
import { FolderType } from "@docspace/shared/enums";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";

import CatalogOverviewReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-integration.svg?url";
import NewFilesBadge from "SRC_DIR/components/NewFilesBadge";
import AppsSidebar from "SRC_DIR/components/AppsSidebar";
import {
  buildFolderUrl,
  getClientActiveId,
  type TTreeFolder,
  type FolderIds,
} from "SRC_DIR/helpers/articleNavigation";

type ClientArticleSidebarProps = FolderIds & {
  userId?: string;
  treeFolders: TTreeFolder[];
  isVisitor?: boolean;
  onFolderNavigate: () => void;
};

const ClientArticleSidebar = ({
  userId,
  treeFolders,
  isVisitor,
  onFolderNavigate,
  ...folderIds
}: ClientArticleSidebarProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const navigate = useNavigate();
  const { myFolderId } = folderIds;

  // `onFolderNavigate` is re-created on every inject render; keep a stable ref
  // so the memoized onClick handlers below don't go stale (which made nested
  // sub-items like Archive fall back to the parent's handler).
  const onFolderNavigateRef = React.useRef(onFolderNavigate);
  onFolderNavigateRef.current = onFolderNavigate;

  const go = React.useCallback(
    (path: string) => () => {
      onFolderNavigateRef.current?.();
      navigate(path);
    },
    [navigate],
  );

  const goFolder = React.useCallback(
    (folderId: number, rootFolderType: TTreeFolder["rootFolderType"]) =>
      () => {
        onFolderNavigateRef.current?.();
        navigate(buildFolderUrl(folderId, rootFolderType, userId, myFolderId));
      },
    [navigate, userId, myFolderId],
  );

  // Agent-scoped Recent/Favorites/Trash: same alias data, routed under
  // /ai-agents/* so the sidebar keeps the selection under AI Agents.
  const goFolderAgent = React.useCallback(
    (folderId: number, rootFolderType: TTreeFolder["rootFolderType"]) =>
      () => {
        onFolderNavigateRef.current?.();
        navigate(
          buildFolderUrl(folderId, rootFolderType, userId, myFolderId, true),
        );
      },
    [navigate, userId, myFolderId],
  );

  const activeId = React.useMemo(
    () => getClientActiveId(location.pathname, folderIds),
    [location.pathname, folderIds],
  );

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
      onClick: goFolder(folder.id, folder.rootFolderType),
      ...extra,
    });

    const overview: NavMenuItem = {
      id: "dashboard",
      label: t("Common:Overview"),
      icon: CatalogOverviewReactSvgUrl,
      onClick: go("/dashboard"),
    };

    const roomsFolder = find(FolderType.Rooms);
    const myDocsFolder = find(FolderType.USER);
    const archiveFolder = find(FolderType.Archive);
    const sharedFolder = find(FolderType.SHARE);
    const recentFolder = find(FolderType.Recent);
    const favFolder = find(FolderType.Favorites);
    const trashFolder = find(FolderType.TRASH);
    const aiAgentsFolder = find(FolderType.AIAgents);

    const mainItems: NavMenuItem[] = [];

    if (myDocsFolder && !isVisitor) {
      const children: NavSubItem[] = [];
      if (sharedFolder) {
        const hasNew = (sharedFolder.newItems ?? 0) > 0;
        children.push(
          navItem(sharedFolder, {
            showBadge: hasNew,
            badgeComponent: hasNew ? (
              <NewFilesBadge
                newFilesCount={sharedFolder.newItems!}
                folderId={sharedFolder.id}
              />
            ) : undefined,
          }),
        );
      }
      if (recentFolder) children.push(navItem(recentFolder));
      if (favFolder) children.push(navItem(favFolder));
      if (trashFolder)
        children.push(navItem(trashFolder, { withTopSeparator: true }));

      mainItems.push({ ...navItem(myDocsFolder), children });
    }

    if (roomsFolder) {
      mainItems.push({
        ...navItem(roomsFolder),
        children: [
          // Recent/Favorites under Rooms are placeholders for now (no target).
          { id: "rooms-recent", label: t("Common:Recent"), icon: getCatalogIconUrlByType(FolderType.Recent) },
          { id: "rooms-favorites", label: t("Common:Favorites"), icon: getCatalogIconUrlByType(FolderType.Favorites) },
          ...(archiveFolder
            ? [navItem(archiveFolder, { withTopSeparator: true })]
            : []),
        ],
      });
    }

    // AI Agents sits right after Rooms as a top-level item, with the
    // Recent/Favorites/Trash sections nested beneath it. These reuse the
    // portal-wide aliases (@recent/@favorites/@trash) — the same targets as
    // the My Documents sections — mirroring the SDK agents sections. Unique
    // sidebar ids keep them distinct from the My Documents entries.
    if (aiAgentsFolder) {
      const agentChildren: NavSubItem[] = [];
      if (recentFolder)
        agentChildren.push({
          ...navItem(recentFolder, { id: "agents-recent" }),
          onClick: goFolderAgent(recentFolder.id, recentFolder.rootFolderType),
        });
      if (favFolder)
        agentChildren.push({
          ...navItem(favFolder, { id: "agents-favorites" }),
          onClick: goFolderAgent(favFolder.id, favFolder.rootFolderType),
        });
      if (trashFolder)
        agentChildren.push({
          ...navItem(trashFolder, {
            id: "agents-trash",
            withTopSeparator: true,
          }),
          onClick: goFolderAgent(trashFolder.id, trashFolder.rootFolderType),
        });

      mainItems.push(
        agentChildren.length > 0
          ? { ...navItem(aiAgentsFolder), children: agentChildren }
          : navItem(aiAgentsFolder),
      );
    }

    return [
      { id: "overview", items: [overview] },
      ...(mainItems.length > 0 ? [{ id: "main", items: mainItems }] : []),
    ];
  }, [t, go, goFolder, goFolderAgent, treeFolders, isVisitor]);

  return <AppsSidebar groups={groups} activeId={activeId} />;
};

const ClientArticleSidebarConnected = inject<TStore>(
  ({ userStore, treeFoldersStore, filesStore, clientLoadingStore }) => ({
    userId: userStore.user?.id,
    treeFolders: treeFoldersStore.treeFolders,
    roomsFolderId: treeFoldersStore.roomsFolderId,
    archiveFolderId: treeFoldersStore.archiveFolderId,
    myFolderId: treeFoldersStore.myFolderId,
    recentFolderId: treeFoldersStore.recentFolderId,
    favoritesFolderId: treeFoldersStore.favoritesFolderId,
    recycleBinFolderId: treeFoldersStore.recycleBinFolderId,
    sharedWithMeFolderId: treeFoldersStore.sharedWithMeFolderId,
    aiAgentsFolderId: treeFoldersStore.aiAgentsFolderId,
    isVisitor: userStore.user?.isVisitor,
    onFolderNavigate: () => {
      filesStore.setSelection?.([]);
      clientLoadingStore.setIsSectionBodyLoading(true, true);
    },
  }),
)(observer(ClientArticleSidebar));

export default ClientArticleSidebarConnected;
