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

import PanelReactSvgUrl from "PUBLIC_DIR/images/panel.react.svg?url";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import { inject, observer } from "mobx-react";
import { IconButton } from "@docspace/shared/components/icon-button";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import config from "PACKAGE_FILE";
import FilesFilter from "@docspace/shared/api/files/filter";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import {
  StyledContainer,
  StyledHeading,
  StyledHeadline,
  StyledSubmitToGalleryButton,
  StyledInfoPanelToggleWrapper,
} from "./StyledGallery";

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
      folderInfo.parentId,
    );
    const url = getCategoryUrl(categoryType, oformFromFolderId);
    const filterParamsStr = filter.toUrlParams();

    setIsLoading();

    const state = { rootFolderType: folderInfo.rootFolderType };

    navigate(
      combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        `${url}?${filterParamsStr}`,
      ),
      { state },
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

      {!oformsLoadError && canSubmitToFormGallery() ? (
        <StyledSubmitToGalleryButton
          primary
          size="small"
          onClick={onOpenSubmitToGalleryDialog}
          label={t("Common:SubmitToFormGallery")}
        />
      ) : null}

      {!oformsLoadError ? (
        <StyledInfoPanelToggleWrapper isInfoPanelVisible={isInfoPanelVisible}>
          <div className="info-panel-toggle-bg">
            <IconButton
              className="info-panel-toggle"
              iconName={PanelReactSvgUrl}
              size="16"
              isFill
              onClick={onToggleInfoPanel}
              title={t("Common:InfoPanel")}
            />
          </div>
        </StyledInfoPanelToggleWrapper>
      ) : null}
    </StyledContainer>
  );
};

export default inject(
  ({
    filesStore,
    oformsStore,
    accessRightsStore,
    dialogsStore,
    clientLoadingStore,
    infoPanelStore,
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

      isInfoPanelVisible: infoPanelStore.isVisible,
      setIsInfoPanelVisible: infoPanelStore.setIsVisible,

      setIsLoading: () => {
        clientLoadingStore.setIsSectionHeaderLoading(true, false);
        clientLoadingStore.setIsSectionFilterLoading(true, false);
        clientLoadingStore.setIsSectionBodyLoading(true, false);
      },

      oformsLoadError: oformsStore.oformsLoadError,
      getFolderInfo: filesStore.getFolderInfo,
    };
  },
)(withTranslation("Common")(observer(SectionHeaderContent)));
