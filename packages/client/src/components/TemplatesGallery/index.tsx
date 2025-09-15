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
import { useState, useEffect, SetStateAction } from "react";
import { Portal } from "@docspace/shared/components/portal";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Tabs } from "@docspace/shared/components/tabs";
import { isMobile } from "@docspace/shared/utils";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Button } from "@docspace/shared/components/button";
import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";

import TilesContainer from "./TilesContainer";
import ErrorView from "./ErrorView";
import styles from "./TemplatesGallery.module.scss";

const TemplateGallery = (props: {
  templatesGalleryVisible: boolean;
  setTemplatesGalleryVisible: (isVisible: boolean) => void;
  setCurrentExtensionGallery: (extension: string) => void;
  resetFilters: (ext: string) => Promise<void>;
  initTemplateGallery: () => Promise<void>;
  oformsLoadError: boolean;
  setSubmitToGalleryDialogVisible: (isVisible: boolean) => void;
}) => {
  const {
    templatesGalleryVisible,
    setTemplatesGalleryVisible,
    setCurrentExtensionGallery,
    resetFilters,
    initTemplateGallery,
    oformsLoadError,
    setSubmitToGalleryDialogVisible,
  } = props;
  const [viewMobile, setViewMobile] = useState(false);
  const [currentTabId, setCurrentTabId] = useState("documents");
  const [isInitLoading, setIsInitLoading] = useState(true);

  const getData = async (ext: string) => resetFilters(ext);

  useEffect(() => {
    initTemplateGallery().then(() => setIsInitLoading(false));
  }, []);

  const tabs = [
    {
      id: "documents",
      name: "Documents",
      content: <TilesContainer ext=".docx" isInitLoading={isInitLoading} />,
      onClick: async () => {
        await getData(".docx");
      },
    },
    {
      id: "spreadsheet",
      name: "Spreadsheet",
      content: <TilesContainer ext=".xlsx" isInitLoading={false} />,
      onClick: async () => {
        await getData(".xlsx");
      },
    },
    {
      id: "presentation",
      name: "Presentation",
      content: <TilesContainer ext=".pptx" isInitLoading={false} />,
      onClick: async () => {
        await getData(".pptx");
      },
    },
    {
      id: "forms",
      name: "Forms",
      content: <TilesContainer ext=".pdf" isInitLoading={false} />,
      onClick: async () => {
        await getData(".pdf");
      },
    },
  ];

  const onCheckView = () => {
    if (isMobile()) {
      setViewMobile(true);
    } else {
      setViewMobile(false);
    }
  };

  useEffect(() => {
    onCheckView();
    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, [onCheckView]);

  const onSelect = (e: { id: SetStateAction<string> }) => {
    setCurrentTabId(e.id);
    const fileExtension =
      e.id === "forms"
        ? ".pdf"
        : e.id === "documents"
          ? ".docx"
          : e.id === "spreadsheet"
            ? ".xlsx"
            : e.id === "presentation"
              ? ".pptx"
              : "";
    setCurrentExtensionGallery(fileExtension);
  };

  const onCloseClick = () => setTemplatesGalleryVisible(false);
  const onOpenSubmitToGalleryDialog = () =>
    setSubmitToGalleryDialogVisible(true);

  const nodeTemplatesGallery = (
    <>
      <Backdrop visible withBackground zIndex={309} />
      <div className={styles.container}>
        <div className={styles.templatesGallery}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerText}>Template gallery</div>
              <Button
                className={styles.headerButton}
                onClick={onOpenSubmitToGalleryDialog}
                label="Submit to Template Gallery"
              />
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

          {oformsLoadError ? (
            <ErrorView onCloseClick={onCloseClick} />
          ) : (
            <div className={styles.templatesGalleryWrapper}>
              <Tabs
                items={tabs}
                selectedItemId={currentTabId}
                onSelect={onSelect}
                withAnimation
              />
            </div>
          )}
        </div>
      </div>
    </>
  );

  const nodeTemplatesGalleryMobile = (
    <>
      <Backdrop visible withBackground />
      <div className={styles.containerMobile}>
        <div className={styles.templatesGalleryMobile}>
          <div className={styles.header}>
            <div className={styles.headerText}>Template gallery</div>
            <IconButton
              size={17}
              className={styles.closeButton}
              iconName={CrossReactSvgUrl}
              onClick={onCloseClick}
              isClickable
              isStroke
            />
          </div>

          {oformsLoadError ? (
            <ErrorView onCloseClick={onCloseClick} />
          ) : (
            <div className={styles.templatesGalleryWrapper}>
              <Tabs
                items={tabs}
                selectedItemId={currentTabId}
                onSelect={onSelect}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <Portal
      visible={templatesGalleryVisible}
      element={viewMobile ? nodeTemplatesGalleryMobile : nodeTemplatesGallery}
    />
  );
};

export default inject<TStore>(({ oformsStore, dialogsStore }) => {
  const {
    templatesGalleryVisible,
    setTemplatesGalleryVisible,
    setCurrentExtensionGallery,
    resetFilters,
    initTemplateGallery,
    oformsLoadError,
  } = oformsStore;

  const { setSubmitToGalleryDialogVisible } = dialogsStore;

  return {
    templatesGalleryVisible,
    setTemplatesGalleryVisible,
    setCurrentExtensionGallery,
    resetFilters,
    initTemplateGallery,
    oformsLoadError,
    setSubmitToGalleryDialogVisible,
  };
})(observer(TemplateGallery));
