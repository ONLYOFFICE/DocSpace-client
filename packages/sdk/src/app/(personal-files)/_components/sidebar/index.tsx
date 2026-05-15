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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import articleStyles from "@docspace/ui-kit/components/article/Article.module.scss";
import { FolderType, DeviceType } from "@docspace/shared/enums";
import FilesFilter from "@docspace/shared/api/files/filter";

import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CatalogDocumentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import CatalogFavoritesReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.favorites.react.svg?url";
import CatalogSettingsRestoreReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-restore.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { DocsSection, DOCS_SECTION_FOLDER_ALIAS } from "@/types/docs";
import { PAGE_COUNT } from "@/utils/constants";

import { useSDKConfig } from "@/providers/SDKConfigProvider";
import { useSidebar } from "../../_contexts/SidebarContext";
import DocsMainButton from "../main-button";
import SidebarNavItem from "./SidebarNavItem";
import styles from "./DocsSidebar.module.scss";

const FOLDER_TYPE_TO_SECTION: Partial<Record<FolderType, DocsSection>> = {
  [FolderType.USER]: DocsSection.MyDocuments,
  [FolderType.Favorites]: DocsSection.Favorites,
  [FolderType.Recent]: DocsSection.Recent,
  [FolderType.TRASH]: DocsSection.Trash,
};

const DocsSidebar = () => {
  const { t } = useTranslation(["Common"]);
  const navigationStore = useNavigationStore();
  const filesSelectionStore = useFilesSelectionStore();
  const { rootFolderType } = useFilesListStore();
  const activeSection = rootFolderType != null ? FOLDER_TYPE_TO_SECTION[rootFolderType] : undefined;
  const { showText, currentDeviceType, toggleShowText } = useSidebar();
  const { sdkConfig } = useSDKConfig();

  const router = useRouter();
  const pathname = usePathname();

  const isSettings = pathname === "/personal-files/settings";
  const showMainButton = currentDeviceType === DeviceType.desktop;
  const isMainButtonDisabled = isSettings || activeSection !== DocsSection.MyDocuments || !!sdkConfig?.disableActionButton;

  const handleSectionClick = React.useCallback(
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
    [
      activeSection,
      navigationStore,
      filesSelectionStore,
      pathname,
      router,
    ],
  );

  const onSettingsClick = React.useCallback(() => {
    if (isSettings) return;
    router.push("/personal-files/settings");
  }, [router, isSettings]);

  const sections = React.useMemo(
    () => [
      {
        key: DocsSection.MyDocuments,
        label: t("Common:Documents"),
        icon: CatalogDocumentsReactSvgUrl,
      },
      {
        key: DocsSection.Favorites,
        label: t("Common:Favorites"),
        icon: CatalogFavoritesReactSvgUrl,
      },
      {
        key: DocsSection.Recent,
        label: t("Common:Recent"),
        icon: CatalogSettingsRestoreReactSvgUrl,
      },
      {
        key: DocsSection.Trash,
        label: t("Common:TrashSection"),
        icon: CatalogTrashReactSvgUrl,
      },
    ],
    [t],
  );

  return (
    <div
      id="article-container"
      className={`${articleStyles.article} ${styles.articleFlex}`}
      data-show-text={showText ? "true" : "false"}
      data-open="true"
      data-with-main-button={showMainButton ? "true" : "false"}
    >
      <div style={{ height: "16px", flexShrink: 0 }} />
      {showMainButton && <DocsMainButton mode="desktop" isDisabled={isMainButtonDisabled} />}
      <Scrollbar
        className={`article-body__scrollbar ${styles.scrollbar}`}
        scrollClass="article-scroller"
      >
        {sections.map((section) => (
          <SidebarNavItem
            key={section.key}
            id={`docs-nav-${section.key}`}
            label={section.label}
            icon={section.icon}
            isActive={!isSettings && activeSection === section.key}
            onClick={() => handleSectionClick(section.key)}
            showText={showText}
          />
        ))}
      </Scrollbar>
      <div className={styles.navBottom}>
        <SidebarNavItem
          id="docs-nav-settings"
          label={t("Common:Settings")}
          icon={SettingsReactSvgUrl}
          isActive={isSettings}
          onClick={onSettingsClick}
          showText={showText}
        />
      </div>
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
          showText
            ? t("Common:HideArticleMenu")
            : t("Common:ShowArticleMenu")
        }
      />
      <Tooltip id="sidebar-toggle-tooltip" place="right" float />
    </div>
  );
};

export default observer(DocsSidebar);
