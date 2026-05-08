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

import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { NavMenu } from "@docspace/ui-kit/components/nav-menu";
import type { NavMenuGroup } from "@docspace/ui-kit/components/nav-menu";
import articleStyles from "@docspace/ui-kit/components/article/Article.module.scss";
import { FolderType } from "@docspace/shared/enums";
import FilesFilter from "@docspace/shared/api/files/filter";

import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import CatalogFavoritesReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.favorites.react.svg?url";
import CatalogSettingsRestoreReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-restore.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { DocsSection, DOCS_SECTION_FOLDER_ALIAS } from "@/types/docs";
import { PAGE_COUNT } from "@/utils/constants";

import { useSidebar } from "../../_contexts/SidebarContext";
import styles from "./DocsSidebar.module.scss";

const FOLDER_TYPE_TO_SECTION: Partial<Record<FolderType, DocsSection>> = {
  [FolderType.USER]: DocsSection.MyDocuments,
  [FolderType.Favorites]: DocsSection.Favorites,
  [FolderType.Recent]: DocsSection.Recent,
  [FolderType.TRASH]: DocsSection.Trash,
};

const SETTINGS_ID = "settings";

const DocsSidebar = () => {
  const { t } = useTranslation(["Common"]);
  const navigationStore = useNavigationStore();
  const filesSelectionStore = useFilesSelectionStore();
  const { rootFolderType } = useFilesListStore();
  const activeSection =
    rootFolderType != null ? FOLDER_TYPE_TO_SECTION[rootFolderType] : undefined;
  const { showText, toggleShowText } = useSidebar();

  const router = useRouter();
  const pathname = usePathname();

  const isSettings = pathname === "/personal-files/settings";

  const navigateToSection = React.useCallback(
    (section: DocsSection) => {
      if (section === activeSection && pathname === "/personal-files") return;

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
    },
    [activeSection, navigationStore, filesSelectionStore, pathname, router],
  );

  const onSettingsClick = React.useCallback(() => {
    if (isSettings) return;
    router.push("/personal-files/settings");
  }, [router, isSettings]);

  const groups = React.useMemo<NavMenuGroup[]>(
    () => [
      {
        id: "main",
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
        ],
      },
    ],
    [t, navigateToSection, onSettingsClick],
  );

  const activeId = isSettings
    ? SETTINGS_ID
    : (activeSection as string | undefined);

  const expandedId =
    isSettings ||
    activeSection === DocsSection.MyDocuments ||
    activeSection === DocsSection.Recent ||
    activeSection === DocsSection.Favorites ||
    activeSection === DocsSection.Trash
      ? DocsSection.MyDocuments
      : undefined;

  return (
    <div
      id="article-container"
      className={`${articleStyles.article} ${styles.articleFlex}`}
      data-show-text={showText ? "true" : "false"}
      data-open="true"
      data-with-main-button="false"
    >
      <div style={{ height: "16px", flexShrink: 0 }} />
      <Scrollbar
        className={`article-body__scrollbar ${styles.scrollbar}`}
        scrollClass="article-scroller"
      >
        <NavMenu
          groups={groups}
          activeItemId={activeId}
          defaultExpandedId={expandedId}
        />
      </Scrollbar>
      <div
        className={styles.borderToggle}
        onClick={toggleShowText}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleShowText();
          }
        }}
        data-tooltip-id="sidebar-toggle-tooltip"
        data-tooltip-content={
          showText ? t("Common:HideArticleMenu") : t("Common:ShowArticleMenu")
        }
      />
      <Tooltip id="sidebar-toggle-tooltip" place="right" float />
    </div>
  );
};

export default observer(DocsSidebar);

