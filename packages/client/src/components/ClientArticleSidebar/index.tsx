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

import type {
  NavMenuGroup,
  NavMenuItem,
  NavSubItem,
} from "@docspace/ui-kit/components/nav-menu";
import { FolderType, RoomSearchArea } from "@docspace/shared/enums";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";
import FilesFilter from "@docspace/shared/api/files/filter";
import { CategoryType } from "@docspace/shared/constants";
import type { ValueOf } from "@docspace/shared/types";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { ROOMS_SECTION_FOLDER_TYPES } from "@docspace/shared/utils/rooms";

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
  // Room admins / admins only — gates the Rooms → Templates item, matching the
  // former Rooms/Templates submenu (and the Use template quick action).
  canUseTemplates?: boolean;
  isTemplatesFolderRoot?: boolean;
  isNavLoading?: boolean;
  onFolderNavigate: () => void;
};

const ClientArticleSidebar = ({
  userId,
  treeFolders,
  isVisitor,
  canUseTemplates,
  isTemplatesFolderRoot,
  isNavLoading,
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

  const go = React.useCallback(
    (path: string) => () => {
      onFolderNavigateRef.current?.();
      navigate(path);
    },
    [navigate],
  );

  const goFolder = React.useCallback(
    (folderId: number, rootFolderType: TTreeFolder["rootFolderType"]) => () => {
      onFolderNavigateRef.current?.();
      navigate(buildFolderUrl(folderId, rootFolderType, userId));
    },
    [navigate, userId],
  );

  // Agent-scoped Recent/Favorites/Trash: same alias data, routed under
  // /ai-agents/* so the sidebar keeps the selection under AI Agents.
  const goFolderAgent = React.useCallback(
    (folderId: number, rootFolderType: TTreeFolder["rootFolderType"]) => () => {
      onFolderNavigateRef.current?.();
      navigate(buildFolderUrl(folderId, rootFolderType, userId, true));
    },
    [navigate, userId],
  );

  // Section-scoped Recent/Favorites/Trash: the same special files views,
  // constrained to the section's content via the `folderType` scope filter
  // (the folder types of the rooms/root the section is made of). The
  // recent/favorites folder ids are known up front (from the tree), so we
  // navigate with the concrete `folder=<id>` instead of the "@recent"/
  // "@favorites" alias FilesFilter.getDefault would otherwise set.
  const goScoped = React.useCallback(
    (
      categoryType: ValueOf<typeof CategoryType>,
      basePath: string,
      folderId: number | null | undefined,
      folderType: FolderType[],
    ) =>
      () => {
        onFolderNavigateRef.current?.();
        const filter = FilesFilter.getDefault({ categoryType });
        if (folderId != null) filter.folder = String(folderId);
        filter.folderType = folderType;
        navigate(`${basePath}/filter?${filter.toUrlParams()}`);
      },
    [navigate],
  );

  // Templates: the Rooms list scoped to the Templates search area. Replaces the
  // former Rooms/Templates submenu tabs (searchArea=Templates on /rooms/shared).
  const goTemplates = React.useCallback(() => {
    onFolderNavigateRef.current?.();
    const filter = RoomsFilter.getDefault(userId, RoomSearchArea.Templates);
    filter.searchArea = RoomSearchArea.Templates;
    navigate(`/rooms/shared/filter?${filter.toUrlParams(userId, false)}`);
  }, [navigate, userId]);

  const goFormsTemplates = React.useCallback(() => {
    onFolderNavigateRef.current?.();
    const filter = RoomsFilter.getDefault(userId, RoomSearchArea.FormTemplates);
    filter.searchArea = RoomSearchArea.FormTemplates;
    navigate(`/forms/filter?${filter.toUrlParams(userId, false)}`);
  }, [navigate, userId]);

  const activeId = React.useMemo(
    () =>
      getClientActiveId(
        location.pathname,
        folderIds,
        location.search,
        isTemplatesFolderRoot,
      ),
    [location.pathname, location.search, folderIds, isTemplatesFolderRoot],
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

    if (myDocsFolder || sharedFolder || recentFolder || favFolder) {
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
      // Guests can't view or manage Files (their own files/Trash), so
      // that section is dropped and the top-level item opens Shared with me
      // instead of the (inaccessible) Files folder.
      if (!isVisitor && myDocsFolder && trashFolder)
        children.push(navItem(trashFolder, { withTopSeparator: true }));

      const primaryFolder = myDocsFolder ?? sharedFolder;

      mainItems.push({
        id: myDocsFolder ? String(myDocsFolder.id) : "files",
        label: myDocsFolder ? myDocsFolder.title : t("Common:Files"),
        icon: getCatalogIconUrlByType(FolderType.USER),
        onClick: primaryFolder
          ? goFolder(primaryFolder.id, primaryFolder.rootFolderType)
          : undefined,
        children,
      });
    }

    if (roomsFolder) {
      mainItems.push({
        ...navItem(roomsFolder),
        children: [
          // Recent/Favorites under Rooms reuse the @recent/@favorites files
          // view, scoped to room content via the room folder types.
          {
            id: "rooms-recent",
            label: t("Common:Recent"),
            icon: getCatalogIconUrlByType(FolderType.Recent),
            onClick: goScoped(
              CategoryType.Recent,
              "/rooms/recent",
              recentFolderId,
              ROOMS_SECTION_FOLDER_TYPES,
            ),
          },
          {
            id: "rooms-favorites",
            label: t("Common:Favorites"),
            icon: getCatalogIconUrlByType(FolderType.Favorites),
            onClick: goScoped(
              CategoryType.Favorite,
              "/rooms/favorite",
              favoritesFolderId,
              ROOMS_SECTION_FOLDER_TYPES,
            ),
          },
          ...(canUseTemplates
            ? [
                {
                  id: "rooms-templates",
                  label: t("Common:Templates"),
                  icon: getCatalogIconUrlByType(FolderType.RoomTemplates),
                  onClick: goTemplates,
                },
              ]
            : []),
          ...(archiveFolder
            ? [navItem(archiveFolder, { withTopSeparator: true })]
            : []),
          {
            id: "rooms-trash",
            label: t("Common:TrashSection"),
            icon: getCatalogIconUrlByType(FolderType.TRASH),
            onClick: goScoped(
              CategoryType.Trash,
              "/rooms/trash",
              recycleBinFolderId,
              ROOMS_SECTION_FOLDER_TYPES,
            ),
          },
        ],
      });
    }

    // "Forms" is a top-level section that surfaces Form Filling Rooms (FFR).
    // The backend serves them via `searchArea=Forms` (they are excluded from the
    // Active rooms listing), so the item points at the dedicated /forms route
    // scoped to that search area.
    if (roomsFolder) {
      const formsFilter = RoomsFilter.getDefault(userId, RoomSearchArea.Forms);
      formsFilter.searchArea = RoomSearchArea.Forms;

      mainItems.push({
        id: "forms",
        label: t("Common:Forms"),
        icon: getCatalogIconUrlByType(FolderType.FormRoom),
        onClick: go(`/forms/filter?${formsFilter.toUrlParams(userId, false)}`),
        children: [
          {
            id: "forms-recent",
            label: t("Common:Recent"),
            icon: getCatalogIconUrlByType(FolderType.Recent),
            onClick: goScoped(
              CategoryType.Recent,
              "/forms/recent",
              recentFolderId,
              [FolderType.FormRoom],
            ),
          },
          {
            id: "forms-favorites",
            label: t("Common:Favorites"),
            icon: getCatalogIconUrlByType(FolderType.Favorites),
            onClick: goScoped(
              CategoryType.Favorite,
              "/forms/favorites",
              favoritesFolderId,
              [FolderType.FormRoom],
            ),
          },
          ...(canUseTemplates
            ? [
                {
                  id: "forms-templates",
                  label: t("Common:Templates"),
                  icon: getCatalogIconUrlByType(FolderType.RoomTemplates),
                  onClick: goFormsTemplates,
                },
              ]
            : []),
          {
            id: "forms-trash",
            label: t("Common:TrashSection"),
            icon: getCatalogIconUrlByType(FolderType.TRASH),
            onClick: goScoped(
              CategoryType.Trash,
              "/forms/trash",
              recycleBinFolderId,
              [FolderType.FormRoom],
            ),
            withTopSeparator: true,
          },
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

      const agentsItem = navItem(aiAgentsFolder);
      mainItems.push(
        agentChildren.length > 0
          ? { ...agentsItem, children: agentChildren }
          : agentsItem,
      );
    }

    return [
      { id: "overview", items: [overview] },
      ...(mainItems.length > 0 ? [{ id: "main", items: mainItems }] : []),
    ];
  }, [
    t,
    go,
    goFolder,
    goFolderAgent,
    goScoped,
    goTemplates,
    goFormsTemplates,
    treeFolders,
    isVisitor,
    canUseTemplates,
    recentFolderId,
    favoritesFolderId,
    recycleBinFolderId,
    userId,
  ]);

  return (
    <AppsSidebar
      groups={groups}
      activeId={activeId}
      isNavLoading={isNavLoading}
    />
  );
};

const ClientArticleSidebarConnected = inject<TStore>(
  ({
    authStore,
    userStore,
    treeFoldersStore,
    filesStore,
    clientLoadingStore,
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
    aiAgentsFolderId: treeFoldersStore.aiAgentsFolderId,
    isVisitor: userStore.user?.isVisitor,
    // Matches Home's canCreateRooms — room admins and admins can use templates.
    canUseTemplates: authStore.isAdmin || authStore.isRoomAdmin,
    isTemplatesFolderRoot: treeFoldersStore.isTemplatesFolderRoot,
    // Same signal the old article used to show <ArticleFolderLoader />.
    isNavLoading: clientLoadingStore.showArticleLoader,
    onFolderNavigate: () => {
      filesStore.setSelection?.([]);
      clientLoadingStore.setIsSectionBodyLoading(true, true);
    },
  }),
)(observer(ClientArticleSidebar));

export default ClientArticleSidebarConnected;

