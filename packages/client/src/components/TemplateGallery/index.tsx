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

import { Portal } from "@docspace/shared/components/portal";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Tabs, TTabItem } from "@docspace/shared/components/tabs";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Button } from "@docspace/shared/components/button";
import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";
import { TTranslation } from "@docspace/shared/types";

import TilesContainer from "./TilesContainer";
import ErrorView from "./ErrorView";
import { useMobileDetection } from "./hooks/useMobileDetection";
import { TAB_CONFIG, TAB_IDS, FileExtension, TabId } from "./constants";
import { getExtensionFromTabId } from "./utils/tabUtils";
import styles from "./TemplateGallery.module.scss";

const TemplateGallery = (props: {
  templateGalleryVisible: boolean;
  setTemplateGalleryVisible: (isVisible: boolean) => void;
  setCurrentExtensionGallery: (extension: string) => void;
  resetFilters: (ext: string) => Promise<void>;
  initTemplateGallery: () => Promise<void>;
  oformsLoadError: boolean;
  setSubmitToGalleryDialogVisible: (isVisible: boolean) => void;
  t: TTranslation;
  filterOformsByLocaleIsLoading: boolean;
  categoryFilterLoaded: boolean;
  languageFilterLoaded: boolean;
}) => {
  const {
    templateGalleryVisible,
    setTemplateGalleryVisible,
    setCurrentExtensionGallery,
    resetFilters,
    initTemplateGallery,
    oformsLoadError,
    setSubmitToGalleryDialogVisible,
    t,
    filterOformsByLocaleIsLoading,
    categoryFilterLoaded,
    languageFilterLoaded,
  } = props;

  const isMobileView = useMobileDetection();
  const [currentTabId, setCurrentTabId] = useState<TabId>(TAB_IDS.DOCUMENTS);
  const [isInitLoading, setIsInitLoading] = useState(true);
  const [isShowInitSkeleton, setShowInitSkeleton] = useState(true);

  const handleTabClick = async (extension: FileExtension) => {
    await resetFilters(extension);
  };

  useEffect(() => {
    initTemplateGallery().then(() => setIsInitLoading(false));
  }, []);

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

  const tabs = useMemo(() => {
    return Object.values(TAB_CONFIG).map((config) => ({
      id: config.id,
      name: t(config.translationKey),
      content: (
        <TilesContainer
          ext={config.extension}
          isShowInitSkeleton={
            config.id === TAB_IDS.DOCUMENTS ? isShowInitSkeleton : false
          }
        />
      ),
      onClick: async () => await handleTabClick(config.extension),
    }));
  }, [t, isShowInitSkeleton, handleTabClick]);

  const onSelect = (element: TTabItem) => {
    const tabId = element.id as TabId;
    setCurrentTabId(tabId);
    const fileExtension = getExtensionFromTabId(tabId);
    setCurrentExtensionGallery(fileExtension);
  };

  const onCloseClick = () => setTemplateGalleryVisible(false);

  const onOpenSubmitToGalleryDialog = () =>
    setSubmitToGalleryDialogVisible(true);

  const renderHeader = useMemo(
    () => (
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>{t("Common:TemplateGallery")}</div>
          {!oformsLoadError ? (
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
    [t, oformsLoadError, onOpenSubmitToGalleryDialog, onCloseClick],
  );

  const renderContent = useMemo(() => {
    if (oformsLoadError) {
      return <ErrorView onCloseClick={onCloseClick} />;
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
  }, [oformsLoadError, onCloseClick, tabs, currentTabId, onSelect]);

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
  };
})(withTranslation("Common")(observer(TemplateGallery)));
