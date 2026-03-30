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

import styles from "../forms-layout/FormsLayout.module.scss";

type FormsHeaderProps = {
  onUploadFiles: () => void;
  onCreateBlankForm: () => void;
};

const FormsHeader = ({ onUploadFiles, onCreateBlankForm }: FormsHeaderProps) => {
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
        style={navDropdownMinWidth ? { "--nav-dropdown-min-width": `${navDropdownMinWidth}px` } as React.CSSProperties : undefined}
      >
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
    return (
      <div className={styles.headerEditing}>
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
      </div>
    );
  }

  if (isInsideCompletedFolder) {
    return (
      <div
        className={styles.headerRow}
        style={navDropdownMinWidth ? { "--nav-dropdown-min-width": `${navDropdownMinWidth}px` } as React.CSSProperties : undefined}
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
        style={navDropdownMinWidth ? { "--nav-dropdown-min-width": `${navDropdownMinWidth}px` } as React.CSSProperties : undefined}
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

    return (
      <div
        className={styles.headerRow}
        style={navDropdownMinWidth ? { "--nav-dropdown-min-width": `${navDropdownMinWidth}px` } as React.CSSProperties : undefined}
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
      style={navDropdownMinWidth ? { "--nav-dropdown-min-width": `${navDropdownMinWidth}px` } as React.CSSProperties : undefined}
    >
      <div className={styles.headerNavigation}>
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
