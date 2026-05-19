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
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";

import Navigation from "@docspace/ui-kit/components/navigation";
import api from "@docspace/shared/api";
import { DeviceType } from "@docspace/shared/enums";

import useDeviceType from "@/hooks/useDeviceType";
import { FormsSection } from "@/types/forms";

import { sectionFromPathname } from "../../_utils/sectionFromPathname";
import { useFormsNavigationStore } from "../../_store/FormsNavigationStore";
import { useFormsListStore } from "../../_store/FormsListStore";
import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import { useLibraryParams } from "../../_hooks/useLibraryParams";
import { libraryUrl } from "../../_utils/libraryUrl";
import ActionsUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import FormPlusReactSvgUrl from "PUBLIC_DIR/images/form.plus.react.svg?url";
import MenuIcon from "PUBLIC_DIR/images/menu.react.svg";

import styles from "../forms-layout/FormsLayout.module.scss";

type FormsHeaderProps = {
  onUploadFiles: () => void;
  onCreateBlankForm: () => void;
  showMenu: boolean;
  headerOffset?: number;
};

const BurgerButton = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    className={styles.burgerButton}
    onClick={onClick}
    aria-label={label}
  >
    <MenuIcon className={styles.burgerIcon} />
  </button>
);

const FormsHeader = ({
  onUploadFiles,
  onCreateBlankForm,
  showMenu,
  headerOffset = 0,
}: FormsHeaderProps) => {
  const { t } = useTranslation(["Common"]);
  const pathname = usePathname();
  const activeSection = sectionFromPathname(pathname);

  const {
    editingFile,
    completedFolder,
    inProgressFolder,
    closeEditor,
    goBackToCompletedRoot,
    goBackToInProgressRoot,
    toggleSidebar,
  } = useFormsNavigationStore();

  const router = useRouter();
  const libParams = useLibraryParams();

  // Fetch folder titles for library breadcrumbs (header is outside route layout providers)
  const [libLangTitle, setLibLangTitle] = React.useState("");
  const [libCategoryTitle, setLibCategoryTitle] = React.useState("");

  React.useEffect(() => {
    if (!libParams.langId) {
      setLibLangTitle("");
      return;
    }
    api.files
      .getFolderInfo(libParams.langId)
      .then((info) => setLibLangTitle(info.title))
      .catch(() => setLibLangTitle(String(libParams.langId)));
  }, [libParams.langId]);

  React.useEffect(() => {
    if (!libParams.categoryId) {
      setLibCategoryTitle("");
      return;
    }
    api.files
      .getFolderInfo(libParams.categoryId)
      .then((info) => setLibCategoryTitle(info.title))
      .catch(() => setLibCategoryTitle(String(libParams.categoryId)));
  }, [libParams.categoryId]);

  const { items, folders } = useFormsListStore();
  const formsSettingsStore = useFormsSettingsStore();
  const { currentDeviceType } = useDeviceType();

  const isMyForms = activeSection === FormsSection.MyForms;
  const isLibrary = activeSection === FormsSection.Library;
  const canCreateForms = isMyForms && !!formsSettingsStore.folderSecurity?.Create;
  const isSettings = activeSection === FormsSection.Settings;
  const isEditing = Boolean(editingFile);
  const isInsideCompletedFolder =
    activeSection === FormsSection.CompletedForms && !!completedFolder;
  const isInsideInProgressFolder =
    activeSection === FormsSection.InProgress && !!inProgressFolder;
  const isInsideLibrary = isLibrary && libParams.depth > 0;
  const activeSubfolder = completedFolder ?? inProgressFolder;

  const getSectionTitle = React.useCallback(() => {
    switch (activeSection) {
      case FormsSection.MyForms:
        return t("Common:MyForms");
      case FormsSection.Library:
        return t("Common:Library");
      case FormsSection.InProgress:
        return t("Common:InProgress");
      case FormsSection.CompletedForms:
        return t("Common:CompletedForms");
      case FormsSection.Settings:
        return t("Common:Settings");
      default:
        return "";
    }
  }, [activeSection, t]);

  const navigationItems = React.useMemo(() => {
    if (isEditing && activeSubfolder) {
      const isCompleted = activeSection === FormsSection.CompletedForms;
      return [
        {
          id: `folder-${activeSubfolder.id}`,
          title: activeSubfolder.title,
          isRootRoom: false,
        },
        {
          id: isCompleted ? "completed-root" : "in-progress-root",
          title: isCompleted
            ? t("Common:CompletedForms")
            : t("Common:InProgress"),
          isRootRoom: true,
        },
      ];
    }

    if (isEditing) {
      return [
        {
          id: "home",
          title: getSectionTitle(),
          isRootRoom: true,
        },
      ];
    }

    if (isInsideCompletedFolder) {
      return [
        {
          id: "completed-root",
          title: t("Common:CompletedForms"),
          isRootRoom: true,
        },
      ];
    }

    if (isInsideInProgressFolder) {
      return [
        {
          id: "in-progress-root",
          title: t("Common:InProgress"),
          isRootRoom: true,
        },
      ];
    }

    if (isInsideLibrary) {
      const crumbs: { id: string | number; title: string; isRootRoom: boolean }[] = [];

      // Category breadcrumb (when at Level 2+ or template detail)
      if (libParams.categoryId && libCategoryTitle) {
        crumbs.push({
          id: `category-${libParams.categoryId}`,
          title: libCategoryTitle,
          isRootRoom: false,
        });
      }

      // Language breadcrumb
      if (libParams.langId) {
        crumbs.push({
          id: `lang-${libParams.langId}`,
          title: libLangTitle || String(libParams.langId),
          isRootRoom: false,
        });
      }

      crumbs.push({
        id: "library-root",
        title: t("Common:Library"),
        isRootRoom: true,
      });

      return crumbs;
    }

    return [];
  }, [
    isEditing,
    activeSection,
    activeSubfolder,
    isInsideCompletedFolder,
    isInsideInProgressFolder,
    isInsideLibrary,
    libParams.langId,
    libParams.categoryId,
    libParams.templateId,
    libLangTitle,
    libCategoryTitle,
    getSectionTitle,
    t,
  ]);

  const [navDropdownMinWidth, setNavDropdownMinWidth] = React.useState(0);
  React.useEffect(() => {
    if (!navigationItems.length) {
      setNavDropdownMinWidth(0);
      return;
    }
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = '600 13px "Open Sans", sans-serif';
    let max = 0;
    for (const item of navigationItems) {
      max = Math.max(max, ctx.measureText(item.title).width);
    }
    setNavDropdownMinWidth(Math.ceil(max + 67));
  }, [navigationItems]);

  const headerStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    if (!navDropdownMinWidth && !headerOffset) return undefined;
    const style: React.CSSProperties = {};
    if (navDropdownMinWidth) {
      (style as Record<string, string>)["--nav-dropdown-min-width"] =
        `${navDropdownMinWidth}px`;
    }
    if (headerOffset) {
      style.paddingInlineStart = `${headerOffset}px`;
    }
    return style;
  }, [navDropdownMinWidth, headerOffset]);

  const editingWrapperStyle = React.useMemo<
    React.CSSProperties | undefined
  >(() => {
    if (!headerOffset) return undefined;
    return {
      position: "relative",
      marginInlineStart: `${headerOffset}px`,
      height: "100%",
    };
  }, [headerOffset]);

  const getContextOptionsPlus = React.useCallback(() => {
    const security = formsSettingsStore.folderSecurity;
    if (!security?.Create) return [];

    return [
      {
        id: "upload-forms",
        key: "upload-forms",
        label: t("Common:UploadPDFForm"),
        icon: ActionsUploadReactSvgUrl,
        onClick: onUploadFiles,
      },
      {
        id: "create-blank-form",
        key: "create-blank-form",
        label: t("Common:NewPDFForm"),
        icon: FormPlusReactSvgUrl,
        onClick: onCreateBlankForm,
      },
    ];
  }, [formsSettingsStore.folderSecurity, t, onUploadFiles, onCreateBlankForm]);

  const handleEditorBack = React.useCallback(() => {
    closeEditor();
  }, [closeEditor]);

  const handleEditorBreadcrumbClick = React.useCallback(
    (itemId?: string | number) => {
      if (itemId === "completed-root") {
        closeEditor();
        goBackToCompletedRoot();
        return;
      }
      if (itemId === "in-progress-root") {
        closeEditor();
        goBackToInProgressRoot();
        return;
      }
      closeEditor();
    },
    [closeEditor, goBackToCompletedRoot, goBackToInProgressRoot],
  );

  const handleLibraryBreadcrumbClick = React.useCallback(
    (itemId?: string | number) => {
      if (itemId === undefined) return;

      const rid = libParams.roomId || undefined;
      const lid = libParams.libraryId || undefined;

      if (itemId === "library-root") {
        router.push(libraryUrl({ roomId: rid, libraryId: lid }));
        return;
      }
      if (typeof itemId === "string" && itemId.startsWith("lang-")) {
        const langId = itemId.replace("lang-", "");
        router.push(libraryUrl({ langId, roomId: rid, libraryId: lid }));
        return;
      }
      if (typeof itemId === "string" && itemId.startsWith("category-")) {
        const categoryId = itemId.replace("category-", "");
        router.push(
          libraryUrl({
            langId: libParams.langId ?? undefined,
            categoryId,
            roomId: rid,
            libraryId: lid,
          }),
        );
        return;
      }
    },
    [libParams, router],
  );

  if (isSettings) {
    return (
      <div
        className={styles.headerRow}
        style={headerStyle}
      >
        {showMenu && (
          <BurgerButton
            onClick={toggleSidebar}
            label={t("Common:ShowArticleMenu")}
          />
        )}
        <div className={styles.headerNavigation}>
          <Navigation
            showText
            isRootFolder
            canCreate={false}
            title={getSectionTitle()}
            rootRoomTitle=""
            isDesktop={currentDeviceType === DeviceType.desktop}
            isFrame
            navigationItems={[]}
            getContextOptionsPlus={() => []}
            getContextOptionsFolder={() => []}
            onClickFolder={() => {}}
            isTrashFolder={false}
            isEmptyPage={false}
            isEmptyFilesList={false}
            onBackToParentFolder={() => {}}
            showRootFolderTitle={false}
            withLogo=""
            burgerLogo=""
            withMenu={false}
            currentDeviceType={currentDeviceType}
            titleIcon=""
            titleIconTooltip=""
            showNavigationButton={false}
            isCurrentFolderInfo={false}
            showTitle
            isPublicRoom={false}
            isRoom={false}
            isInfoPanelVisible={false}
            toggleInfoPanel={() => {}}
            onLogoClick={() => {}}
            hideInfoPanel={() => {}}
            clearTrash={() => {}}
            showFolderInfo={() => {}}
          />
        </div>
      </div>
    );
  }

  if (isEditing) {
    const editingNavigation = (
      <Navigation
        showText
        isRootFolder={false}
        canCreate={false}
        title={editingFile?.title || ""}
        rootRoomTitle=""
        isDesktop={currentDeviceType === DeviceType.desktop}
        isFrame
        navigationItems={navigationItems}
        getContextOptionsPlus={() => []}
        getContextOptionsFolder={() => []}
        onClickFolder={handleEditorBreadcrumbClick}
        isTrashFolder={false}
        isEmptyPage={false}
        isEmptyFilesList={false}
        onBackToParentFolder={handleEditorBack}
        showRootFolderTitle={false}
        withLogo=""
        burgerLogo=""
        withMenu={false}
        currentDeviceType={currentDeviceType}
        titleIcon=""
        titleIconTooltip=""
        showNavigationButton={false}
        isCurrentFolderInfo={false}
        showTitle
        isPublicRoom={false}
        isRoom={false}
        isInfoPanelVisible={false}
        toggleInfoPanel={() => {}}
        onLogoClick={() => {}}
        hideInfoPanel={() => {}}
        clearTrash={() => {}}
        showFolderInfo={() => {}}
      />
    );

    return (
      <div className={styles.headerEditing}>
        {editingWrapperStyle ? (
          <div style={editingWrapperStyle}>{editingNavigation}</div>
        ) : (
          editingNavigation
        )}
      </div>
    );
  }

  if (isInsideCompletedFolder) {
    return (
      <div
        className={styles.headerRow}
        style={headerStyle}
      >
        <div className={styles.headerNavigation}>
          <Navigation
            showText
            isRootFolder={false}
            canCreate={false}
            title={completedFolder?.title || ""}
            rootRoomTitle=""
            isDesktop={currentDeviceType === DeviceType.desktop}
            isFrame
            navigationItems={navigationItems}
            getContextOptionsPlus={() => []}
            getContextOptionsFolder={() => []}
            onClickFolder={() => goBackToCompletedRoot()}
            isTrashFolder={false}
            isEmptyPage={items.length === 0}
            isEmptyFilesList={items.length === 0}
            onBackToParentFolder={() => goBackToCompletedRoot()}
            showRootFolderTitle={false}
            withLogo=""
            burgerLogo=""
            withMenu={false}
            currentDeviceType={currentDeviceType}
            titleIcon=""
            titleIconTooltip=""
            showNavigationButton={false}
            isCurrentFolderInfo={false}
            showTitle
            isPublicRoom={false}
            isRoom={false}
            isInfoPanelVisible={false}
            toggleInfoPanel={() => {}}
            onLogoClick={() => {}}
            hideInfoPanel={() => {}}
            clearTrash={() => {}}
            showFolderInfo={() => {}}
          />
        </div>
      </div>
    );
  }

  if (isInsideInProgressFolder) {
    return (
      <div
        className={styles.headerRow}
        style={headerStyle}
      >
        <div className={styles.headerNavigation}>
          <Navigation
            showText
            isRootFolder={false}
            canCreate={false}
            title={inProgressFolder?.title || ""}
            rootRoomTitle=""
            isDesktop={currentDeviceType === DeviceType.desktop}
            isFrame
            navigationItems={navigationItems}
            getContextOptionsPlus={() => []}
            getContextOptionsFolder={() => []}
            onClickFolder={() => goBackToInProgressRoot()}
            isTrashFolder={false}
            isEmptyPage={items.length === 0}
            isEmptyFilesList={items.length === 0}
            onBackToParentFolder={() => goBackToInProgressRoot()}
            showRootFolderTitle={false}
            withLogo=""
            burgerLogo=""
            withMenu={false}
            currentDeviceType={currentDeviceType}
            titleIcon=""
            titleIconTooltip=""
            showNavigationButton={false}
            isCurrentFolderInfo={false}
            showTitle
            isPublicRoom={false}
            isRoom={false}
            isInfoPanelVisible={false}
            toggleInfoPanel={() => {}}
            onLogoClick={() => {}}
            hideInfoPanel={() => {}}
            clearTrash={() => {}}
            showFolderInfo={() => {}}
          />
        </div>
      </div>
    );
  }

  if (isInsideLibrary) {
    // Derive title from URL depth
    let libraryTitle = "";
    if (libParams.hasTemplate) {
      // Will be set by the template page — for now use category title or breadcrumb
      libraryTitle = libCategoryTitle || "";
    } else if (libParams.categoryId) {
      libraryTitle = libCategoryTitle || "";
    } else {
      libraryTitle = libLangTitle || "";
    }

    if (currentDeviceType === DeviceType.mobile && libParams.depth >= 2) {
      libraryTitle = libraryTitle ? `... / ${libraryTitle}` : "...";
    }

    return (
      <div
        className={styles.headerRow}
        style={headerStyle}
      >
        <div className={styles.headerNavigation}>
          <Navigation
            showText
            isRootFolder={false}
            canCreate={false}
            title={libraryTitle}
            rootRoomTitle=""
            isDesktop={currentDeviceType === DeviceType.desktop}
            isFrame
            navigationItems={navigationItems}
            getContextOptionsPlus={() => []}
            getContextOptionsFolder={() => []}
            onClickFolder={handleLibraryBreadcrumbClick}
            isTrashFolder={false}
            isEmptyPage={items.length === 0 && folders.length === 0}
            isEmptyFilesList={items.length === 0 && folders.length === 0}
            onBackToParentFolder={() => router.back()}
            showRootFolderTitle={false}
            withLogo=""
            burgerLogo=""
            withMenu={false}
            currentDeviceType={currentDeviceType}
            titleIcon=""
            titleIconTooltip=""
            showNavigationButton={false}
            isCurrentFolderInfo={false}
            showTitle
            isPublicRoom={false}
            isRoom={false}
            isInfoPanelVisible={false}
            toggleInfoPanel={() => {}}
            onLogoClick={() => {}}
            hideInfoPanel={() => {}}
            clearTrash={() => {}}
            showFolderInfo={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.headerRow}
      style={headerStyle}
    >
      {showMenu && (
        <BurgerButton
          onClick={toggleSidebar}
          label={t("Common:ShowArticleMenu")}
        />
      )}
      <div className={styles.headerNavigation}>
        <span data-tour={`section-${activeSection}`} className={styles.tourAnchor}>
          {getSectionTitle()}
        </span>
        <Navigation
          showText
          isRootFolder
          canCreate={canCreateForms}
          isPlusButtonVisible={canCreateForms}
          title={getSectionTitle()}
          rootRoomTitle=""
          isDesktop={currentDeviceType === DeviceType.desktop}
          isFrame
          navigationItems={[]}
          getContextOptionsPlus={getContextOptionsPlus}
          getContextOptionsFolder={() => []}
          onClickFolder={() => {}}
          isTrashFolder={false}
          isEmptyPage={items.length === 0 && folders.length === 0}
          isEmptyFilesList={items.length === 0 && folders.length === 0}
          onBackToParentFolder={() => {}}
          showRootFolderTitle={false}
          withLogo=""
          burgerLogo=""
          withMenu
          currentDeviceType={currentDeviceType}
          titleIcon=""
          titleIconTooltip=""
          showNavigationButton={false}
          isCurrentFolderInfo={false}
          showTitle
          isPublicRoom={false}
          isRoom={false}
          isInfoPanelVisible={false}
          toggleInfoPanel={() => {}}
          onLogoClick={() => {}}
          hideInfoPanel={() => {}}
          clearTrash={() => {}}
          showFolderInfo={() => {}}
        />
      </div>
    </div>
  );
};

export default observer(FormsHeader);
