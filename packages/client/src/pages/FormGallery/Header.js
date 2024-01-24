﻿import PanelReactSvgUrl from "PUBLIC_DIR/images/panel.react.svg?url";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { IconButton } from "@docspace/shared/components/icon-button";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  StyledContainer,
  StyledHeading,
  StyledHeadline,
  StyledSubmitToGalleryButton,
  StyledInfoPanelToggleWrapper,
} from "./StyledGallery";
import config from "PACKAGE_FILE";
import FilesFilter from "@docspace/shared/api/files/filter";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { getCategoryTypeByFolderType } from "SRC_DIR/helpers/utils";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";

const SectionHeaderContent = ({
  t,
  canSubmitToFormGallery,
  getCategoryTitle,
  oformFromFolderId,

  setGallerySelected,
  setSubmitToGalleryDialogVisible,

  currentCategory,

  isInfoPanelVisible,
  setIsInfoPanelVisible,

  setIsLoading,
  oformsLoadError,

  getFolderInfo,
}) => {
  const navigate = useNavigate();

  const onNavigateBack = async () => {
    setGallerySelected(null);

    const filter = FilesFilter.getDefault();
    filter.folder = oformFromFolderId;
    const folderInfo = await getFolderInfo(oformFromFolderId);
    const categoryType = getCategoryTypeByFolderType(
      folderInfo.rootFolderType,
      folderInfo.parentId
    );
    const url = getCategoryUrl(categoryType, oformFromFolderId);
    const filterParamsStr = filter.toUrlParams();

    setIsLoading();

    navigate(
      combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
        `${url}?${filterParamsStr}`
      )
    );
  };

  const onOpenSubmitToGalleryDialog = () =>
    setSubmitToGalleryDialogVisible(true);

  const onToggleInfoPanel = () => setIsInfoPanelVisible(!isInfoPanelVisible);

  return (
    <StyledContainer isInfoPanelVisible={isInfoPanelVisible}>
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size="17"
        isFill
        onClick={onNavigateBack}
        className="arrow-button"
      />
      <StyledHeading
        className="oform-header"
        isInfoPanelVisible={isInfoPanelVisible}
      >
        <StyledHeadline type="content" truncate>
          {(!oformsLoadError && getCategoryTitle(currentCategory)) ||
            t("Common:OFORMsGallery")}
        </StyledHeadline>
      </StyledHeading>

      {!oformsLoadError && canSubmitToFormGallery() && (
        <StyledSubmitToGalleryButton
          primary
          size="small"
          onClick={onOpenSubmitToGalleryDialog}
          label={t("Common:SubmitToFormGallery")}
        />
      )}

      {!oformsLoadError && (
        <StyledInfoPanelToggleWrapper isInfoPanelVisible={isInfoPanelVisible}>
          <div className="info-panel-toggle-bg">
            <IconButton
              className="info-panel-toggle"
              iconName={PanelReactSvgUrl}
              size="16"
              isFill={true}
              onClick={onToggleInfoPanel}
              title={t("Common:InfoPanel")}
            />
          </div>
        </StyledInfoPanelToggleWrapper>
      )}
    </StyledContainer>
  );
};

export default inject(
  ({
    auth,
    filesStore,
    oformsStore,
    accessRightsStore,
    dialogsStore,
    clientLoadingStore,
  }) => {
    return {
      getCategoryTitle: oformsStore.getCategoryTitle,

      oformFromFolderId: oformsStore.oformFromFolderId,

      currentCategory: oformsStore.currentCategory,
      fetchCurrentCategory: oformsStore.fetchCurrentCategory,

      setGallerySelected: oformsStore.setGallerySelected,

      canSubmitToFormGallery: accessRightsStore.canSubmitToFormGallery,
      setSubmitToGalleryDialogVisible:
        dialogsStore.setSubmitToGalleryDialogVisible,

      isInfoPanelVisible: auth.infoPanelStore.isVisible,
      setIsInfoPanelVisible: auth.infoPanelStore.setIsVisible,

      setIsLoading: () => {
        clientLoadingStore.setIsSectionHeaderLoading(true, false);
        clientLoadingStore.setIsSectionFilterLoading(true, false);
        clientLoadingStore.setIsSectionBodyLoading(true, false);
      },

      oformsLoadError: oformsStore.oformsLoadError,
      getFolderInfo: filesStore.getFolderInfo,
    };
  }
)(withTranslation("Common")(observer(SectionHeaderContent)));
