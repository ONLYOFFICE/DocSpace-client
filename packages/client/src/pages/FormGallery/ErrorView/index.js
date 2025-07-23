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

import { Button } from "@docspace/shared/components/button";
import ErrorImageSvgUrl from "PUBLIC_DIR/images/errors/error500.svg?url";
import { isMobile as isMobileUtils } from "@docspace/shared/utils";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import config from "PACKAGE_FILE";
import FilesFilter from "@docspace/shared/api/files/filter";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import * as Styled from "./index.styled";

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
        window.ClientConfig?.proxy?.url,
        config.homepage,
        `${url}?${filterParamsStr}`,
      ),
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
