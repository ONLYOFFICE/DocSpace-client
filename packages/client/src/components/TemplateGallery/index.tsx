// (c) Copyright Ascensio System SIA 2009-2025
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

import { inject, observer } from "mobx-react";
import { useState, useEffect, useMemo } from "react";
import { withTranslation } from "react-i18next";
import type { Key } from "react";

import { Portal } from "@docspace/shared/components/portal";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Tabs, TTabItem } from "@docspace/shared/components/tabs";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Button } from "@docspace/shared/components/button";
import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";
import { TTranslation } from "@docspace/shared/types";
import { useEventListener } from "@docspace/shared/hooks/useEventListener";
import TilesContainer from "./TilesContainer";
import ErrorView from "./ErrorView";
import { useMobileDetection } from "./hooks/useMobileDetection";
import { FILE_EXTENSIONS, TAB_IDS, TabId } from "./constants";

import { getExtensionFromTabId } from "./utils/tabUtils";
import styles from "./TemplateGallery.module.scss";

const TemplateGallery = (props: {
  templateGalleryVisible: boolean;
  setTemplateGalleryVisible: (isVisible: boolean) => void;
  setCurrentExtensionGallery: (extension: string) => void;
  resetFilters: (ext: string) => Promise<void>;
  initTemplateGallery: () => Promise<void>;
  oformsLoadError: boolean;
  oformsNetworkError: boolean;
  setSubmitToGalleryDialogVisible: (isVisible: boolean) => void;
  t: TTranslation;
  filterOformsByLocaleIsLoading: boolean;
  categoryFilterLoaded: boolean;
  languageFilterLoaded: boolean;
  setIsVisibleInfoPanelTemplateGallery: (visible: boolean) => void;
  setGallerySelected: (item: { id: Key | null | undefined } | null) => void;
}) => {
  const {
    templateGalleryVisible,
    setTemplateGalleryVisible,
    setCurrentExtensionGallery,
    resetFilters,
    initTemplateGallery,
    oformsLoadError,
    oformsNetworkError,
    setSubmitToGalleryDialogVisible,
    t,
    filterOformsByLocaleIsLoading,
    categoryFilterLoaded,
    languageFilterLoaded,
    setIsVisibleInfoPanelTemplateGallery,
    setGallerySelected,
  } = props;

  const isMobileView = useMobileDetection();
  const [currentTabId, setCurrentTabId] = useState<TabId>(TAB_IDS.DOCUMENTS);
  const [isInitLoading, setIsInitLoading] = useState(true);
  const [isShowInitSkeleton, setShowInitSkeleton] = useState(true);

  useEffect(() => {
    initTemplateGallery().then(() => setIsInitLoading(false));
    setCurrentExtensionGallery(FILE_EXTENSIONS.DOCX);
  }, []);

  useEffect(() => {
    if (!templateGalleryVisible) return;

    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Disable the main section scroll to prevent scroll chaining (desktop)
    const sectionScroll = document.querySelector(
      ".section-scroll",
    ) as HTMLElement | null;
    const originalSectionOverflow = sectionScroll?.style.overflow;
    if (sectionScroll) {
      sectionScroll.style.overflow = "hidden";
    }

    // Disable the mobile scroll container
    const mobileScroll = document.querySelector(
      "#customScrollBar > .scroll-wrapper > .scroller",
    ) as HTMLElement | null;
    const originalMobileOverflow = mobileScroll?.style.overflow;
    if (mobileScroll) {
      mobileScroll.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      if (sectionScroll) {
        sectionScroll.style.overflow = originalSectionOverflow || "";
      }
      if (mobileScroll) {
        mobileScroll.style.overflow = originalMobileOverflow || "";
      }
    };
  }, [templateGalleryVisible]);

  useEffect(() => {
    if (
      !isInitLoading &&
      !filterOformsByLocaleIsLoading &&
      categoryFilterLoaded &&
      languageFilterLoaded
    )
      setShowInitSkeleton(false);
  }, [
    isInitLoading,
    filterOformsByLocaleIsLoading,
    categoryFilterLoaded,
    languageFilterLoaded,
  ]);

  const onCloseClick = () => {
    setIsVisibleInfoPanelTemplateGallery(false);
    setGallerySelected(null);
    setTemplateGalleryVisible(false);
  };

  useEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape") onCloseClick();
  });

  const tabs = useMemo(
    () => [
      {
        id: "documents",
        name: t("Common:Documents"),
        content: (
          <TilesContainer
            ext={FILE_EXTENSIONS.DOCX}
            isShowInitSkeleton={isShowInitSkeleton}
          />
        ),
        onClick: async () => await resetFilters(FILE_EXTENSIONS.DOCX),
      },
      {
        id: "spreadsheet",
        name: t("Common:Spreadsheets"),
        content: (
          <TilesContainer
            ext={FILE_EXTENSIONS.XLSX}
            isShowInitSkeleton={false}
          />
        ),
        onClick: async () => await resetFilters(FILE_EXTENSIONS.XLSX),
      },
      {
        id: "presentation",
        name: t("Common:Presentations"),
        content: (
          <TilesContainer
            ext={FILE_EXTENSIONS.PPTX}
            isShowInitSkeleton={false}
          />
        ),
        onClick: async () => await resetFilters(FILE_EXTENSIONS.PPTX),
      },
      {
        id: "forms",
        name: t("Common:PDFs"),
        content: (
          <TilesContainer
            ext={FILE_EXTENSIONS.PDF}
            isShowInitSkeleton={false}
          />
        ),
        onClick: async () => await resetFilters(FILE_EXTENSIONS.PDF),
      },
    ],
    [t, isShowInitSkeleton],
  );

  const onSelect = (element: TTabItem) => {
    const tabId = element.id as TabId;
    setCurrentTabId(tabId);
    const fileExtension = getExtensionFromTabId(tabId);
    setCurrentExtensionGallery(fileExtension);
  };

  const onOpenSubmitToGalleryDialog = () =>
    setSubmitToGalleryDialogVisible(true);

  const renderHeader = useMemo(
    () => (
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>{t("Common:TemplateGallery")}</div>
          {!oformsLoadError && !oformsNetworkError ? (
            <Button
              className={styles.headerButton}
              onClick={onOpenSubmitToGalleryDialog}
              label={t("Common:SubmitToTemplateGallery")}
            />
          ) : null}
        </div>
        <IconButton
          size={17}
          className={styles.closeButton}
          iconName={CrossReactSvgUrl}
          onClick={onCloseClick}
          isClickable
          isStroke
        />
      </div>
    ),
    [
      t,
      oformsLoadError,
      oformsNetworkError,
      onOpenSubmitToGalleryDialog,
      onCloseClick,
    ],
  );

  const renderContent = useMemo(() => {
    if (oformsLoadError || oformsNetworkError) {
      const descriptionText = oformsNetworkError
        ? t("FormGallery:ErrorViewDescriptionNetworkError")
        : t("FormGallery:ErrorViewDescription");

      return (
        <ErrorView
          onCloseClick={onCloseClick}
          descriptionText={descriptionText}
        />
      );
    }

    return (
      <div className={styles.templateGalleryWrapper}>
        <Tabs
          items={tabs}
          selectedItemId={currentTabId}
          onSelect={onSelect}
          withAnimation
        />
      </div>
    );
  }, [
    oformsLoadError,
    oformsNetworkError,
    onCloseClick,
    tabs,
    currentTabId,
    onSelect,
  ]);

  const templateGalleryNode = useMemo(() => {
    const containerClass = isMobileView
      ? styles.containerMobile
      : styles.container;
    const galleryClass = isMobileView
      ? styles.templateGalleryMobile
      : styles.templateGallery;
    const backdropZIndex = isMobileView ? 203 : 309;

    const mobileHeader = (
      <div className={styles.header}>
        <div className={styles.headerText}>{t("Common:TemplateGallery")}</div>
        <IconButton
          size={17}
          className={styles.closeButton}
          iconName={CrossReactSvgUrl}
          onClick={onCloseClick}
          isClickable
          isStroke
        />
      </div>
    );

    return (
      <>
        <Backdrop visible withBackground zIndex={backdropZIndex} />
        <div className={containerClass}>
          <div className={galleryClass}>
            {isMobileView ? mobileHeader : renderHeader}
            {renderContent}
          </div>
        </div>
      </>
    );
  }, [isMobileView, renderHeader, renderContent, t, onCloseClick]);

  return (
    <Portal visible={templateGalleryVisible} element={templateGalleryNode} />
  );
};

export default inject<TStore>(({ oformsStore, dialogsStore }) => {
  const {
    templateGalleryVisible,
    setTemplateGalleryVisible,
    setCurrentExtensionGallery,
    resetFilters,
    initTemplateGallery,
    oformsLoadError,
    filterOformsByLocaleIsLoading,
    categoryFilterLoaded,
    languageFilterLoaded,
    oformsNetworkError,
    setIsVisibleInfoPanelTemplateGallery,
    setGallerySelected,
  } = oformsStore;

  const { setSubmitToGalleryDialogVisible } = dialogsStore;

  return {
    templateGalleryVisible,
    setTemplateGalleryVisible,
    setCurrentExtensionGallery,
    resetFilters,
    initTemplateGallery,
    oformsLoadError,
    setSubmitToGalleryDialogVisible,
    filterOformsByLocaleIsLoading,
    categoryFilterLoaded,
    languageFilterLoaded,
    oformsNetworkError,
    setIsVisibleInfoPanelTemplateGallery,
    setGallerySelected,
  };
})(withTranslation("Common")(observer(TemplateGallery)));
