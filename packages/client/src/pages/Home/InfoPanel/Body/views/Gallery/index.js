// (c) Copyright Ascensio System SIA 2009-2024
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

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import withLoader from "@docspace/client/src/HOCs/withLoader";

import { Text } from "@docspace/shared/components/text";

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
import { Link } from "@docspace/shared/components/link";

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
          color={currentColorScheme.main?.accent}
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
              culture,
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

export default inject(({ settingsStore, filesSettingsStore, oformsStore }) => {
  const { personal, culture, currentColorScheme } = settingsStore;
  const { gallerySelected } = oformsStore;
  const { getIcon } = filesSettingsStore;
  return {
    getIcon,
    gallerySelected,
    personal,
    culture,
    currentColorScheme,
  };
})(
  withTranslation(["InfoPanel", "FormGallery", "Common", "Translations"])(
    Gallery,
    // withLoader(observer(Gallery))(
    //   <Loaders.InfoPanelViewLoader view="gallery" />
    // )
  ),
);
