import PanelReactSvgUrl from "PUBLIC_DIR/images/panel.react.svg?url";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import IconButton from "@docspace/components/icon-button";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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

const SectionHeaderContent = ({
  t,
  canSubmitToFormGallery,
  getCategoryTitle,
  oformFromFolderId,

  setGallerySelected,
  categoryType,
  setSubmitToGalleryDialogVisible,

  currentCategory,

  oformsFilter,
  filterOformsByCategory,

  isInfoPanelVisible,
  setIsInfoPanelVisible,

  setIsLoading,
}) => {
  const navigate = useNavigate();

  const [checkboxOptions, setCheckboxOptions] = useState({
    fromFolder: null,
    viewAll: null,
  });

  const onNavigateBack = () => {
    setGallerySelected(null);

    const filter = FilesFilter.getDefault();
    filter.folder = oformFromFolderId;
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

  const onViewAllTemplates = () => filterOformsByCategory("", "");

  const onOpenSubmitToGalleryDialog = () =>
    setSubmitToGalleryDialogVisible(true);

  const onToggleInfoPanel = () => setIsInfoPanelVisible(!isInfoPanelVisible);

  useEffect(() => {
    (async () => {
      const prevFolder =
        oformFromFolderId && (await api.files.getFolderInfo(oformFromFolderId));

      if (prevFolder)
        setCheckboxOptions((prev) => ({
          ...prev,
          fromFolder: (
            <DropDownItem
              id={"fromFolder"}
              key={"fromFolder"}
              label={prevFolder.title}
              data-key={prevFolder.title}
              onClick={onNavigateBack}
            />
          ),
        }));
    })();
  }, [oformFromFolderId]);

  useEffect(() => {
    let viewAll = null;
    if (oformsFilter.categorizeBy && oformsFilter.categoryId)
      viewAll = (
        <DropDownItem
          id={"view-all"}
          key={"view-all"}
          label={t("Common:OFORMsGallery")}
          data-key={"OFORMs gallery"}
          onClick={onViewAllTemplates}
        />
      );

    setCheckboxOptions((prev) => ({ ...prev, viewAll }));
  }, [oformsFilter.categorizeBy, oformsFilter.categoryId]);

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
        {getCategoryTitle(currentCategory) || t("Common:OFORMsGallery")}
      </StyledHeadline>

      <StyledNavigationDrodown
        id="oform-header-combobox"
        comboIcon={TriangleNavigationDownReactSvgUrl}
        noBorder
        className="oform-header-combobox not-selectable"
        options={[]}
        selectedOption={{}}
        manualY="42px"
        manualX="-32px"
        title={t("Common:TitleSelectFile")}
        isMobileView={isMobileOnly}
        advancedOptions={
          <>
            {!!checkboxOptions.fromFolder && checkboxOptions.fromFolder}
            {!!checkboxOptions.viewAll && checkboxOptions.viewAll}
          </>
        }
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
  ({
    auth,
    filesStore,
    oformsStore,
    accessRightsStore,
    dialogsStore,
    clientLoadingStore,
  }) => {
    return {
      categoryType: filesStore.categoryType,
      getCategoryTitle: oformsStore.getCategoryTitle,

      oformFromFolderId: oformsStore.oformFromFolderId,

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

      setIsLoading: () => {
        clientLoadingStore.setIsSectionHeaderLoading(true, false);
        clientLoadingStore.setIsSectionFilterLoading(true, false);
        clientLoadingStore.setIsSectionBodyLoading(true, false);
      },
    };
  }
)(withTranslation("Common")(observer(SectionHeaderContent)));
