import PanelReactSvgUrl from "PUBLIC_DIR/images/panel.react.svg?url";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import IconButton from "@docspace/components/icon-button";
import { withTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  StyledContainer,
  StyledHeadline,
  StyledNavigationDrodown,
  StyledSubmitToGalleryButton,
  StyledInfoPanelToggleWrapper,
} from "./StyledGallery";
import config from "PACKAGE_FILE";
import FilesFilter from "@docspace/common/api/files/filter";
import { combineUrl } from "@docspace/common/utils";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import TriangleNavigationDownReactSvgUrl from "PUBLIC_DIR/images/triangle.navigation.down.react.svg?url";
import api from "@docspace/common/api";
import { isMobileOnly } from "react-device-detect";
import DropDownItem from "@docspace/components/drop-down-item";
import { CategoryType } from "@docspace/client/src/helpers/constants";
import { getOformCategoryTitle } from "@docspace/client/src/helpers/utils";
import { getDefaultOformLocale } from "@docspace/common/utils";

const categoryLocale = getDefaultOformLocale();

const SectionHeaderContent = ({
  t,
  canSubmitToFormGallery,

  setGallerySelected,
  categoryType,
  setSubmitToGalleryDialogVisible,

  currentCategory,
  fetchCurrentCategory,

  oformsFilter,
  filterOformsByCategory,

  isInfoPanelVisible,
  setIsInfoPanelVisible,
}) => {
  const navigate = useNavigate();
  const { fromFolderId } = useParams();

  const [checkboxOptions, setCheckboxOptions] = useState(<>{[]}</>);

  const onNavigateBack = () => {
    setGallerySelected(null);

    const filter = FilesFilter.getDefault();
    filter.folder = fromFolderId;
    const url = getCategoryUrl(categoryType, fromFolderId);
    const filterParamsStr = filter.toUrlParams();

    navigate(
      combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
        `${url}?${filterParamsStr}`
      )
    );
  };

  const onViewAllTemplates = () => filterOformsByCategory("", "");

  const onToggleInfoPanel = () => setIsInfoPanelVisible(!isInfoPanelVisible);

  const onOpenSubmitToGalleryDialog = () => {
    setSubmitToGalleryDialogVisible(true);
  };

  useEffect(() => {
    if (currentCategory) return;
    fetchCurrentCategory();
  }, [oformsFilter.categorizeBy, oformsFilter.categoryId]);

  useEffect(() => {
    (async () => {
      const prevFolderId = fromFolderId || CategoryType.SharedRoom;
      const prevFolder = await api.files.getFolderInfo(prevFolderId);

      const newCheckboxOptions = [];
      if (oformsFilter.categorizeBy && oformsFilter.categoryId)
        newCheckboxOptions.push(
          <DropDownItem
            id={"view-all"}
            key={"view-all"}
            label={t("Common:OFORMsGallery")}
            data-key={"OFORMs gallery"}
            onClick={onViewAllTemplates}
          />
        );
      if (prevFolder)
        newCheckboxOptions.push(
          <DropDownItem
            id={"fromFolder"}
            key={"fromFolder"}
            label={prevFolder.title}
            data-key={prevFolder.title}
            onClick={onNavigateBack}
          />
        );

      setCheckboxOptions(<>{newCheckboxOptions}</>);
    })();
  }, [fromFolderId, oformsFilter.categorizeBy, oformsFilter.categoryId]);

  return (
    <StyledContainer isInfoPanelVisible={isInfoPanelVisible}>
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size="17"
        isFill
        onClick={onNavigateBack}
        className="arrow-button"
      />

      <StyledHeadline type="content" truncate>
        {getOformCategoryTitle(currentCategory, categoryLocale) ||
          t("Common:OFORMsGallery")}
      </StyledHeadline>

      <StyledNavigationDrodown
        id="oform-header-combobox"
        comboIcon={TriangleNavigationDownReactSvgUrl}
        noBorder
        advancedOptions={checkboxOptions}
        className="oform-header-combobox not-selectable"
        options={[]}
        selectedOption={{}}
        manualY="42px"
        manualX="-32px"
        title={t("Common:TitleSelectFile")}
        isMobileView={isMobileOnly}
      />

      {canSubmitToFormGallery() && (
        <StyledSubmitToGalleryButton
          primary
          size="small"
          onClick={onOpenSubmitToGalleryDialog}
          label={t("Common:SubmitToFormGallery")}
        />
      )}
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
    </StyledContainer>
  );
};

export default inject(
  ({ auth, filesStore, oformsStore, accessRightsStore, dialogsStore }) => {
    return {
      categoryType: filesStore.categoryType,

      currentCategory: oformsStore.currentCategory,
      fetchCurrentCategory: oformsStore.fetchCurrentCategory,

      oformsFilter: oformsStore.oformsFilter,
      filterOformsByCategory: oformsStore.filterOformsByCategory,

      setGallerySelected: oformsStore.setGallerySelected,

      canSubmitToFormGallery: accessRightsStore.canSubmitToFormGallery,
      setSubmitToGalleryDialogVisible:
        dialogsStore.setSubmitToGalleryDialogVisible,

      isInfoPanelVisible: auth.infoPanelStore.isVisible,
      setIsInfoPanelVisible: auth.infoPanelStore.setIsVisible,
    };
  }
)(withTranslation("Common")(observer(SectionHeaderContent)));
