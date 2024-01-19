import { Button } from "@docspace/shared/components/button";
import * as Styled from "./index.styled";
import ErrorImageSvgUrl from "PUBLIC_DIR/images/form-gallery-error.svg?url";
import { isMobile as isMobileUtils } from "@docspace/shared/utils";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import config from "PACKAGE_FILE";
import FilesFilter from "@docspace/shared/api/files/filter";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";

const ErrorView = ({
  t,
  oformFromFolderId,
  setGallerySelected,
  categoryType,
  setIsLoading,
}) => {
  const navigate = useNavigate();
  const isMobile = isMobileUtils();

  const onGoBack = () => {
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

  return (
    <Styled.ErrorView
      imageSrc={ErrorImageSvgUrl}
      imageAlt="Error Screen Gallery image"
      headerText={t("FormGallery:ErrorViewHeader")}
      descriptionText={t("FormGallery:ErrorViewDescription")}
      buttons={
        <Button
          primary
          label={t("Common:GoBack")}
          scale={isMobile}
          size={!isMobile ? "small" : "normal"}
          onClick={onGoBack}
        />
      }
    />
  );
};

export default inject(({ oformsStore, filesStore, clientLoadingStore }) => ({
  oformFromFolderId: oformsStore.oformFromFolderId,
  setGallerySelected: oformsStore.setGallerySelected,
  categoryType: filesStore.categoryType,
  setIsLoading: () => {
    clientLoadingStore.setIsSectionHeaderLoading(true, false);
    clientLoadingStore.setIsSectionFilterLoading(true, false);
    clientLoadingStore.setIsSectionBodyLoading(true, false);
  },
}))(withTranslation("Common", "FormGallery")(observer(ErrorView)));
