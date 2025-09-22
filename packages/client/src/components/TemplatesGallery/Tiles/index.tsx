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

import { Key, useEffect } from "react";
import { observer, inject } from "mobx-react";

import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { FC } from "react";
import type { TilesProps } from "./Tiles.types";
import FileTile from "./FileTile";

import { StyledTileContainer } from "./StyledTileView";
import InfiniteGrid from "../InfiniteGrid";
import SubmitToGalleryTile from "./SubmitToGalleryTile";

const Tiles: FC<TilesProps> = ({
  tReady,
  oformFiles,
  setGallerySelected,
  submitToGalleryTileIsVisible,
  canSubmitToFormGallery,
  setOformFilesLoaded,
  isShowOneTile,
  smallPreview,
  setIsVisibleInfoPanelTemplateGallery,
  viewMobile,
  onCreateOform,
  setTemplatesGalleryVisible,
  isShowInitSkeleton,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    setOformFilesLoaded(tReady && oformFiles?.length > 0);
  }, [tReady, oformFiles]);

  const onClickInfo = (item: { id: Key | null | undefined }) => {
    if (!item) return;
    setIsVisibleInfoPanelTemplateGallery(true);
    setGallerySelected(item);
  };

  const onClick = (item: { id: Key | null | undefined }) => {
    setGallerySelected(item);
    onCreateOform(navigate);
    setTemplatesGalleryVisible(false);
  };

  const submitToGalleryTileNode =
    submitToGalleryTileIsVisible &&
    canSubmitToFormGallery() &&
    oformFiles?.length > 0 ? (
      <SubmitToGalleryTile
        viewMobile={viewMobile}
        smallPreview={smallPreview}
        isSubmitTile
      />
    ) : null;

  return (
    <StyledTileContainer className="tile-container">
      {viewMobile && !isShowInitSkeleton ? submitToGalleryTileNode : null}
      <InfiniteGrid
        isShowOneTile={isShowOneTile}
        smallPreview={smallPreview}
        showLoading={isShowInitSkeleton}
      >
        {viewMobile && !isShowInitSkeleton ? null : submitToGalleryTileNode}
        {isShowInitSkeleton
          ? null
          : oformFiles.map((item: { id: Key | null | undefined }) => {
              return (
                <FileTile
                  key={item.id}
                  item={item}
                  smallPreview={smallPreview}
                  onClickInfo={() => onClickInfo(item)}
                  onClick={() => onClick(item)}
                />
              );
            })}
      </InfiniteGrid>
    </StyledTileContainer>
  );
};

export default inject<TStore>(
  ({ settingsStore, accessRightsStore, oformsStore, contextOptionsStore }) => ({
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
    onCreateOform: contextOptionsStore.onCreateOform,
    setTemplatesGalleryVisible: oformsStore.setTemplatesGalleryVisible,
    setIsVisibleInfoPanelTemplateGallery:
      oformsStore.setIsVisibleInfoPanelTemplateGallery,
  }),
)(withTranslation(["Common", "FormGallery"])(observer(Tiles)));
