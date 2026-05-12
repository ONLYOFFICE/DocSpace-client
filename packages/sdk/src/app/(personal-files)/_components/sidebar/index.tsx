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
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import type { NavMenuGroup } from "@docspace/ui-kit/components/nav-menu";
import { toastr } from "@docspace/ui-kit/components/toast";
import { DeviceType, FolderType } from "@docspace/shared/enums";
import FilesFilter from "@docspace/shared/api/files/filter";

import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import CatalogFavoritesReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.favorites.react.svg?url";
import CatalogSettingsRestoreReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-restore.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";
import CatalogDocumentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg?url";
import CatalogAiAgentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-agents.react.svg?url";

import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { DocsSection, DOCS_SECTION_FOLDER_ALIAS } from "@/types/docs";
import { PAGE_COUNT } from "@/utils/constants";
import AppsSidebar from "@/components/apps-sidebar";

import { useSidebar } from "../../_contexts/SidebarContext";

const FOLDER_TYPE_TO_SECTION: Partial<Record<FolderType, DocsSection>> = {
  [FolderType.USER]: DocsSection.MyDocuments,
  [FolderType.Favorites]: DocsSection.Favorites,
  [FolderType.Recent]: DocsSection.Recent,
  [FolderType.TRASH]: DocsSection.Trash,
};

const SETTINGS_ID = "settings";
const AI_FORMS_ID = "ai-forms";
const AI_ROOMS_ID = "ai-rooms";
const AI_AGENTS_ID = "ai-agents";

const DocsSidebar = () => {
  const { t } = useTranslation(["Common"]);
  const navigationStore = useNavigationStore();
  const filesSelectionStore = useFilesSelectionStore();
  const { rootFolderType } = useFilesListStore();
  const activeSection =
    rootFolderType != null ? FOLDER_TYPE_TO_SECTION[rootFolderType] : undefined;
  const {
    showText,
    toggleShowText,
    currentDeviceType,
    isSidebarOpen,
    closeSidebar,
  } = useSidebar();
  const isMobile = currentDeviceType === DeviceType.mobile;

  const router = useRouter();
  const pathname = usePathname();

  const isSettings = pathname === "/personal-files/settings";

  const navigateToSection = React.useCallback(
    (section: DocsSection) => {
      if (section === activeSection && pathname === "/personal-files") {
        if (isMobile) closeSidebar();
        return;
      }

      const folderAlias = DOCS_SECTION_FOLDER_ALIAS[section];
      const filter = FilesFilter.getDefault();
      filter.folder = folderAlias;
      filter.pageCount = PAGE_COUNT;

      navigationStore.setNavigationItems([]);
      navigationStore.setCurrentFolderId(folderAlias);
      navigationStore.setCurrentIsRootRoom(true);
      filesSelectionStore.setSelection([]);

      const filterUrl = `?${filter.toUrlParams()}`;

      if (pathname !== "/personal-files") {
        router.push(`/personal-files${filterUrl}`);
      } else {
        router.replace(`/personal-files${filterUrl}`);
      }
      if (isMobile) closeSidebar();
    },
    [
      activeSection,
      navigationStore,
      filesSelectionStore,
      pathname,
      router,
      isMobile,
      closeSidebar,
    ],
  );

  const onSettingsClick = React.useCallback(() => {
    if (isSettings) {
      if (isMobile) closeSidebar();
      return;
    }
    router.push("/personal-files/settings");
    if (isMobile) closeSidebar();
  }, [router, isSettings, isMobile, closeSidebar]);

  const onAIFormsClick = React.useCallback(() => {
    router.push("/forms");
    if (isMobile) closeSidebar();
  }, [router, isMobile, closeSidebar]);

  const groups = React.useMemo<NavMenuGroup[]>(
    () => [
      {
        id: "enabled",
        label: t("Common:EnabledApps"),
        items: [
          {
            id: DocsSection.MyDocuments,
            label: t("Common:DashboardAIFilesTitle"),
            icon: CatalogFolderReactSvgUrl,
            onClick: () => navigateToSection(DocsSection.MyDocuments),
            children: [
              {
                id: DocsSection.Recent,
                label: t("Common:Recent"),
                icon: CatalogSettingsRestoreReactSvgUrl,
                onClick: () => navigateToSection(DocsSection.Recent),
              },
              {
                id: DocsSection.Favorites,
                label: t("Common:Favorites"),
                icon: CatalogFavoritesReactSvgUrl,
                onClick: () => navigateToSection(DocsSection.Favorites),
              },
              {
                id: DocsSection.Trash,
                label: t("Common:TrashSection"),
                icon: CatalogTrashReactSvgUrl,
                onClick: () => navigateToSection(DocsSection.Trash),
              },
              {
                id: SETTINGS_ID,
                label: t("Common:Settings"),
                icon: SettingsReactSvgUrl,
                onClick: onSettingsClick,
              },
            ],
          },
          {
            id: AI_FORMS_ID,
            label: t("Common:DashboardAIFormsTitle"),
            icon: CatalogDocumentsReactSvgUrl,
            onClick: onAIFormsClick,
          },
        ],
      },
      {
        id: "available",
        label: t("Common:AvailableApps"),
        items: [
          {
            id: AI_ROOMS_ID,
            label: t("Common:DashboardAIRoomsTitle"),
            icon: CatalogRoomsReactSvgUrl,
            onClick: () => toastr.info(t("Common:UnderDevelopment")),
          },
          {
            id: AI_AGENTS_ID,
            label: t("Common:DashboardAIChatAgentsTitle"),
            icon: CatalogAiAgentsReactSvgUrl,
            onClick: () => toastr.info(t("Common:UnderDevelopment")),
          },
        ],
      },
    ],
    [t, navigateToSection, onSettingsClick, onAIFormsClick],
  );

  const activeId = isSettings
    ? SETTINGS_ID
    : (activeSection as string | undefined);

  return (
    <AppsSidebar
      groups={groups}
      activeId={activeId}
      defaultExpandedId={DocsSection.MyDocuments}
      showText={showText}
      toggleShowText={toggleShowText}
      isOpen={isSidebarOpen}
      currentDeviceType={currentDeviceType}
      tooltipId="docs-sidebar-toggle-tooltip"
    />
  );
};

export default observer(DocsSidebar);
