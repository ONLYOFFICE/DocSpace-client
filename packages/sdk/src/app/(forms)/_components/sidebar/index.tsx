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

import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import articleStyles from "@docspace/ui-kit/components/article/Article.module.scss";
import { DeviceType } from "@docspace/shared/enums";

import useDeviceType from "@/hooks/useDeviceType";

import styles from "./FormsSidebar.module.scss";

import FormFileReactSvgUrl from "PUBLIC_DIR/images/form.file.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import FormGalleryReactSvgUrl from "PUBLIC_DIR/images/form.gallery.react.svg?url";
import TemplateGalleryReactSvgUrl from "PUBLIC_DIR/images/template.gallery.react.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";

import { FormsSection, DEFAULT_SETTINGS_SUBSECTION } from "@/types/forms";

import {
  sectionFromPathname,
  sectionToPath,
  settingsSubSectionToPath,
} from "../../_utils/sectionFromPathname";
import { useFormsNavigationStore } from "../../_store/FormsNavigationStore";
import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import { libraryUrl } from "../../_utils/libraryUrl";
import { useFormsUserStore } from "../../_store/FormsUserStore";
import SidebarNavItem from "./SidebarNavItem";

const SHOW_SIDEBAR_TEXT_KEY = "forms_showSidebarText";

const FormsSidebar = () => {
  const { t } = useTranslation(["Common"]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeSection = sectionFromPathname(pathname);
  const {
    editingFile,
    completedFolder,
    inProgressFolder,
    closeEditor,
    goBackToCompletedRoot,
    goBackToInProgressRoot,
    isSidebarOpen,
    closeSidebar,
  } = useFormsNavigationStore();
  const { currentDeviceType } = useDeviceType();
  const isMobile = currentDeviceType === DeviceType.mobile;
  const isTablet = currentDeviceType === DeviceType.tablet;
  const formsSettingsStore = useFormsSettingsStore();
  const { hasLibrary } = formsSettingsStore;
  const showLibrary = hasLibrary && !!formsSettingsStore.folderSecurity?.Create;
  // Library navigation is URL-based now
  const { user } = useFormsUserStore();
  const showSettings = user?.isOwner || user?.isAdmin;

  const [userShowText, setUserShowText] = React.useState(true);

  React.useEffect(() => {
    const saved = localStorage.getItem(SHOW_SIDEBAR_TEXT_KEY);
    if (saved === "false") setUserShowText(false);
  }, []);

  const showText = isTablet ? false : isMobile ? true : userShowText;

  const toggleShowText = React.useCallback(() => {
    setUserShowText((prev) => {
      const next = !prev;
      localStorage.setItem(SHOW_SIDEBAR_TEXT_KEY, String(next));
      return next;
    });
  }, []);

  const sections = [
    {
      key: FormsSection.MyForms,
      label: t("Common:MyForms"),
      icon: FormFileReactSvgUrl,
    },
    {
      key: FormsSection.InProgress,
      label: t("Common:InProgress"),
      icon: FormFillRectSvgUrl,
    },
    {
      key: FormsSection.CompletedForms,
      label: t("Common:CompletedForms"),
      icon: FormGalleryReactSvgUrl,
    },
  ];

  const onSettingsClick = React.useCallback(() => {
    if (activeSection === FormsSection.Settings) {
      setTimeout(() => window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION)), 0);
      if (isMobile) closeSidebar();
      return;
    }
    const params = new URLSearchParams();
    const rid = searchParams.get("roomId") ?? "";
    const lid = searchParams.get("libraryId") ?? "";
    if (rid) params.set("roomId", rid);
    if (lid) params.set("libraryId", lid);
    const qs = params.toString();
    router.replace(`${settingsSubSectionToPath(DEFAULT_SETTINGS_SUBSECTION)}${qs ? `?${qs}` : ""}`);
    if (isMobile) closeSidebar();
  }, [router, searchParams, activeSection, isMobile, closeSidebar]);

  return (
    <div
      id="article-container"
      className={`${articleStyles.article} ${styles.articleFlex}`}
      data-show-text={showText ? "true" : "false"}
      data-open="true"
      data-with-main-button="false"
      data-sidebar-open={isSidebarOpen ? "true" : "false"}
      aria-hidden={isMobile && !isSidebarOpen}
    >
      <div style={{ height: "16px", flexShrink: 0 }} />
      <Scrollbar
        className={`article-body__scrollbar ${styles.scrollbar}`}
        scrollClass="article-scroller"
      >
        {sections.map((section) => (
          <SidebarNavItem
            key={section.key}
            id={`forms-nav-${section.key}`}
            label={section.label}
            icon={section.icon}
            isActive={activeSection === section.key}
            onClick={() => {
              if (activeSection === section.key) {
                let handled = false;
                if (editingFile) {
                  closeEditor();
                  handled = true;
                }
                if (section.key === FormsSection.CompletedForms && completedFolder) {
                  goBackToCompletedRoot();
                  handled = true;
                }
                if (section.key === FormsSection.InProgress && inProgressFolder) {
                  goBackToInProgressRoot();
                  handled = true;
                }
                if (!handled) {
                  setTimeout(() => window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION)), 0);
                }
                if (isMobile) closeSidebar();
                return;
              }
              const params = new URLSearchParams();
              const rid = searchParams.get("roomId") ?? "";
              const lid = searchParams.get("libraryId") ?? "";
              if (rid) params.set("roomId", rid);
              if (lid) params.set("libraryId", lid);
              const qs = params.toString();
              router.replace(`${sectionToPath(section.key)}${qs ? `?${qs}` : ""}`);
              if (isMobile) closeSidebar();
            }}
            showText={showText}
          />
        ))}
        {showLibrary && (
          <>
            <div style={{ height: "12px", flexShrink: 0 }} />
            <SidebarNavItem
              id="forms-nav-library"
              label={t("Common:Library")}
              icon={TemplateGalleryReactSvgUrl}
              isActive={activeSection === FormsSection.Library}
              onClick={() => {
                if (activeSection === FormsSection.Library) {
                  // Navigate to library root (country list)
                  const rid = searchParams.get("roomId") ?? "";
                  const lid = searchParams.get("libraryId") ?? "";
                  router.push(libraryUrl({ roomId: rid || undefined, libraryId: lid || undefined }));
                  if (isMobile) closeSidebar();
                  return;
                }
                const params = new URLSearchParams();
                const rid = searchParams.get("roomId") ?? "";
                const lid = searchParams.get("libraryId") ?? "";
                if (rid) params.set("roomId", rid);
                if (lid) params.set("libraryId", lid);
                const qs = params.toString();
                router.replace(`${sectionToPath(FormsSection.Library)}${qs ? `?${qs}` : ""}`);
                if (isMobile) closeSidebar();
              }}
              showText={showText}
            />
          </>
        )}
      </Scrollbar>
      {showSettings && (
        <div className={styles.navBottom}>
          <SidebarNavItem
            id="forms-nav-settings"
            label={t("Common:Settings")}
            icon={SettingsReactSvgUrl}
            isActive={activeSection === FormsSection.Settings}
            onClick={onSettingsClick}
            showText={showText}
          />
        </div>
      )}
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
        data-tooltip-content={showText ? t("Common:HideArticleMenu") : t("Common:ShowArticleMenu")}
      />
      <Tooltip id="sidebar-toggle-tooltip" place="right" float />
    </div>
  );
};

export default observer(FormsSidebar);
