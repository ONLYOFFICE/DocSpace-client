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

import EmptyScreenFilterAltSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt.svg?url";
import EmptyScreenFilterAltDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt_dark.svg?url";

import { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { withTranslation } from "react-i18next";
import { TilesSkeleton } from "@docspace/shared/skeletons/tiles";
import { Link } from "@docspace/shared/components/link";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import { IconButton } from "@docspace/shared/components/icon-button";
import styled from "styled-components";
import SubmitToGalleryTile from "./TilesView/sub-components/SubmitToGalleryTile";
import FileTile from "./TilesView/FileTile";
import TileContainer from "./TilesView/sub-components/TileContainer";

const StyledEmptyContainerLinks = styled.div`
  display: grid;
  margin: 13px 0;
  grid-template-columns: 12px 1fr;
  grid-column-gap: 8px;

  .icon {
    height: 20px;
    width: 12px;
    margin-block: 4px 0;
    margin-inline: 0 4px;
    cursor: pointer;
  }

  .link {
    color: ${({ theme }) => theme.filesEmptyContainer.linkColor};
    margin-block: 0;
    margin-inline: 0 7px;
  }
`;

const SectionBodyContent = ({
  t,
  tReady,
  theme,
  oformFiles,
  hasGalleryFiles,
  setGallerySelected,
  resetFilters,
  submitToGalleryTileIsVisible,
  canSubmitToFormGallery,
  setOformFilesLoaded,
  categoryFilterLoaded,
  languageFilterLoaded,
  oformFilesLoaded,
}) => {
  const onMouseDown = (e) => {
    if (
      e.target.closest(".scroll-body") &&
      !e.target.closest(".files-item") &&
      !e.target.closest(".not-selectable") &&
      !e.target.closest(".info-panel") &&
      !e.target.closest(".info-panel-toggle-bg")
    ) {
      setGallerySelected(null);
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);
    setGallerySelected(null);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [onMouseDown]);

  useEffect(() => {
    setOformFilesLoaded(tReady && oformFiles);
  }, [tReady, oformFiles]);

  return !(categoryFilterLoaded && languageFilterLoaded && oformFilesLoaded) ? (
    <TilesSkeleton foldersCount={0} withTitle={false} />
  ) : !hasGalleryFiles ? (
    <EmptyScreenContainer
      imageSrc={
        theme.isBase
          ? EmptyScreenFilterAltSvgUrl
          : EmptyScreenFilterAltDarkSvgUrl
      }
      imageAlt="Empty Screen Gallery image"
      headerText={t("Common:NotFoundTitle")}
      descriptionText={t("FormGallery:EmptyFormGalleryScreenDescription")}
      buttons={
        <StyledEmptyContainerLinks theme={theme}>
          <IconButton
            className="icon"
            size="12"
            onClick={resetFilters}
            iconName={ClearEmptyFilterSvgUrl}
            isFill
          />
          <Link
            className="link"
            onClick={resetFilters}
            isHovered
            type="action"
            fontWeight="600"
            display="flex"
          >
            {t("Common:ClearFilter")}
          </Link>
        </StyledEmptyContainerLinks>
      }
    />
  ) : (
    <TileContainer className="tile-container">
      {submitToGalleryTileIsVisible && canSubmitToFormGallery() ? (
        <SubmitToGalleryTile />
      ) : null}
      {oformFiles.map((item, index) => (
        <FileTile
          key={item.id}
          item={item}
          dataTestId={`form_gallery_tile_${index}`}
        />
      ))}
    </TileContainer>
  );
};

export default inject(({ settingsStore, accessRightsStore, oformsStore }) => ({
  theme: settingsStore.theme,
  oformFiles: oformsStore.oformFiles,
  hasGalleryFiles: oformsStore.hasGalleryFiles,
  setGallerySelected: oformsStore.setGallerySelected,
  resetFilters: oformsStore.resetFilters,
  submitToGalleryTileIsVisible: oformsStore.submitToGalleryTileIsVisible,
  canSubmitToFormGallery: accessRightsStore.canSubmitToFormGallery,
  setOformFilesLoaded: oformsStore.setOformFilesLoaded,
  categoryFilterLoaded: oformsStore.categoryFilterLoaded,
  languageFilterLoaded: oformsStore.languageFilterLoaded,
  oformFilesLoaded: oformsStore.oformFilesLoaded,
}))(withTranslation("Common", "FormGallery")(observer(SectionBodyContent)));
