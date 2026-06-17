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
 * source code, which remains granted under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { NavMenu } from "@docspace/ui-kit/components/nav-menu";
import type {
  NavMenuGroup,
  NavMenuItem,
  NavSubItem,
} from "@docspace/ui-kit/components/nav-menu";
import { FolderType, DeviceType } from "@docspace/shared/enums";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";

import CatalogOverviewReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-integration.svg?url";
import NewFilesBadge from "SRC_DIR/components/NewFilesBadge";

type TTreeFolder = {
  id: number;
  title: string;
  rootFolderType: (typeof FolderType)[keyof typeof FolderType];
  newItems?: number;
};

type NavMenuItemsProps = {
  treeFolders: TTreeFolder[];
  activeItemId?: number | string | null;
  showText: boolean;
  currentDeviceType: DeviceType;
  isVisitor?: boolean;
  onFolderNavigate: (path: string) => void;
};

const NavMenuItems = ({
  treeFolders,
  activeItemId,
  showText,
  isVisitor,
  onFolderNavigate,
}: NavMenuItemsProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const navigate = useNavigate();

  const activeId = React.useMemo(() => {
    if (location.pathname.startsWith("/dashboard")) return "dashboard";
    if (activeItemId != null) return String(activeItemId);
    return undefined;
  }, [location.pathname, activeItemId]);

  const go = React.useCallback(
    (path: string) => (_item?: unknown) => {
      onFolderNavigate(path);
      navigate(path);
    },
    [onFolderNavigate, navigate],
  );

  const groups = React.useMemo<NavMenuGroup[]>(() => {
    const overviewItem: NavMenuItem = {
      id: "dashboard",
      label: t("Common:Overview"),
      icon: CatalogOverviewReactSvgUrl,
      onClick: go("/dashboard"),
    };

    const folderToNavItem = (folder: TTreeFolder): NavMenuItem | null => {
      const { id, title, rootFolderType } = folder;
      const icon = getCatalogIconUrlByType(rootFolderType);
      if (!icon) return null;

      switch (rootFolderType) {
        case FolderType.Rooms: {
          const archiveFolder = treeFolders.find(
            (f) => f.rootFolderType === FolderType.Archive,
          );
          const children: NavSubItem[] = [];
          if (archiveFolder) {
            children.push({
              id: String(archiveFolder.id),
              label: archiveFolder.title,
              icon: getCatalogIconUrlByType(FolderType.Archive) ?? icon,
              onClick: go(`/rooms/archived/filter`),
              withTopSeparator: true,
            });
          }
          return {
            id: String(id),
            label: title,
            icon,
            onClick: go(`/rooms/shared/filter`),
            children: children.length > 0 ? children : undefined,
          };
        }

        case FolderType.Archive:
          // rendered as child of Rooms — skip at top level
          return null;

        case FolderType.USER: {
          if (isVisitor) return null;
          const sharedFolder = treeFolders.find(
            (f) => f.rootFolderType === FolderType.SHARE,
          );
          const recentFolder = treeFolders.find(
            (f) => f.rootFolderType === FolderType.Recent,
          );
          const favFolder = treeFolders.find(
            (f) => f.rootFolderType === FolderType.Favorites,
          );
          const trashFolder = treeFolders.find(
            (f) => f.rootFolderType === FolderType.TRASH,
          );
          const children: NavSubItem[] = [];
          if (sharedFolder) {
            const hasNew = (sharedFolder.newItems ?? 0) > 0;
            children.push({
              id: String(sharedFolder.id),
              label: sharedFolder.title,
              icon: getCatalogIconUrlByType(FolderType.SHARE) ?? icon,
              onClick: go(`/shared-with-me/filter`),
              showBadge: hasNew,
              badgeComponent: hasNew ? (
                <NewFilesBadge
                  newFilesCount={sharedFolder.newItems!}
                  folderId={sharedFolder.id}
                />
              ) : undefined,
            });
          }
          if (recentFolder) {
            children.push({
              id: String(recentFolder.id),
              label: recentFolder.title,
              icon: getCatalogIconUrlByType(FolderType.Recent) ?? icon,
              onClick: go(`/recent/filter`),
            });
          }
          if (favFolder) {
            children.push({
              id: String(favFolder.id),
              label: favFolder.title,
              icon: getCatalogIconUrlByType(FolderType.Favorites) ?? icon,
              onClick: go(`/files/favorite/filter`),
            });
          }
          if (trashFolder) {
            children.push({
              id: String(trashFolder.id),
              label: trashFolder.title,
              icon: getCatalogIconUrlByType(FolderType.TRASH) ?? icon,
              onClick: go(`/files/trash/filter`),
              withTopSeparator: true,
            });
          }
          return {
            id: String(id),
            label: title,
            icon,
            onClick: go(`/rooms/personal/filter`),
            children: children.length > 0 ? children : undefined,
          };
        }

        case FolderType.SHARE:
        case FolderType.Recent:
        case FolderType.Favorites:
        case FolderType.TRASH:
          // rendered as children of USER — skip at top level
          return null;

        case FolderType.AIAgents:
          return {
            id: String(id),
            label: title,
            icon,
            onClick: go(`/rooms/shared/filter?type=AIAgents`),
          };

        default:
          return {
            id: String(id),
            label: title,
            icon,
            onClick: go(`/rooms/shared/filter`),
          };
      }
    };

    const mainItems: NavMenuItem[] = treeFolders
      .map(folderToNavItem)
      .filter((item): item is NavMenuItem => item !== null);

    return [
      { id: "overview", items: [overviewItem] },
      ...(mainItems.length > 0 ? [{ id: "main", items: mainItems }] : []),
    ];
  }, [t, go, treeFolders, isVisitor]);

  return (
    <NavMenu
      groups={groups}
      activeItemId={activeId}
      iconOnly={!showText}
      withAnimation
    />
  );
};

export default inject(({ treeFoldersStore, settingsStore, userStore }: TStore) => {
  const { treeFolders } = treeFoldersStore;
  const { showText, currentDeviceType } = settingsStore;

  return {
    treeFolders,
    showText,
    currentDeviceType,
    isVisitor: userStore.user?.isVisitor,
  };
})(observer(NavMenuItems));
