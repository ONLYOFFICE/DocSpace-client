import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import withLoader from "@docspace/client/src/HOCs/withLoader";
import Loaders from "@docspace/common/components/Loaders/index.js";

import { Text } from "@docspace/shared/components";

import { parseAndFormatDate } from "../../helpers/DetailsHelper.js";
import {
  StyledGalleryNoThumbnail,
  StyledGalleryThumbnail,
  StyledGalleryFormDescription,
} from "../../styles/gallery.js";
import {
  StyledLink,
  StyledProperties,
  StyledSubtitle,
} from "../../styles/common.js";
import { Link } from "@docspace/shared/components";

const Gallery = ({
  t,
  gallerySelected,
  getIcon,
  culture,
  personal,
  currentColorScheme,
}) => {
  const thumbnailBlank = getIcon(96, ".docxf");
  const thumbnailUrl =
    gallerySelected?.attributes?.template_image?.data?.attributes?.formats
      ?.small?.url;

  const formTitle = gallerySelected?.attributes?.name_form;

  return (
    <>
      {thumbnailUrl ? (
        <StyledGalleryThumbnail>
          <img className="info-panel_gallery-img" src={thumbnailUrl} alt="" />
        </StyledGalleryThumbnail>
      ) : (
        <StyledGalleryNoThumbnail className="no-thumbnail-img-wrapper">
          <ReactSVG className="no-thumbnail-img" src={thumbnailBlank} />
        </StyledGalleryNoThumbnail>
      )}

      <StyledLink>
        <Link
          className="link"
          href={`mailto:marketing@onlyoffice.com?subject=Suggesting changes for ${formTitle}&body=Suggesting changes for ${formTitle}.`}
          target="_blank"
          type="action"
          isHovered
          color={currentColorScheme.main.accent}
        >
          {t("FormGallery:SuggestChanges")}
        </Link>
      </StyledLink>

      <StyledSubtitle>
        <Text fontWeight="600" fontSize="14px">
          {t("Description")}
        </Text>
      </StyledSubtitle>

      <StyledGalleryFormDescription>
        {gallerySelected?.attributes?.template_desc ||
          gallerySelected?.attributes?.description_card}
      </StyledGalleryFormDescription>

      <StyledSubtitle>
        <Text fontWeight="600" fontSize="14px">
          {t("Properties")}
        </Text>
      </StyledSubtitle>

      <StyledProperties>
        <div className="property">
          <Text className="property-title">{t("InfoPanel:DateModified")}</Text>
          <Text className="property-content">
            {parseAndFormatDate(
              gallerySelected.attributes.updatedAt,
              personal,
              culture
            )}
          </Text>
        </div>
        <div className="property">
          <Text className="property-title">{t("Common:Size")}</Text>
          <Text className="property-content">
            {gallerySelected.attributes.file_size}
          </Text>
        </div>
        <div className="property">
          <Text className="property-title">{t("Common:Pages")}</Text>
          <Text className="property-content">
            {gallerySelected.attributes.file_pages}
          </Text>
        </div>
      </StyledProperties>
    </>
  );
};

export default inject(({ auth, settingsStore, oformsStore }) => {
  const { personal, culture, currentColorScheme } = auth.settingsStore;
  const { gallerySelected } = oformsStore;
  const { getIcon } = settingsStore;
  return {
    getIcon,
    gallerySelected,
    personal,
    culture,
    currentColorScheme,
  };
})(
  withTranslation(["InfoPanel", "FormGallery", "Common", "Translations"])(
    Gallery
    // withLoader(observer(Gallery))(
    //   <Loaders.InfoPanelViewLoader view="gallery" />
    // )
  )
);
