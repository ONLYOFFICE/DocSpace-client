import EmptyScreenFilterAltSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt.svg?url";
import EmptyScreenFilterAltDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt_dark.svg?url";

import { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { withTranslation } from "react-i18next";
import TileContainer from "./TilesView/sub-components/TileContainer";
import FileTile from "./TilesView/FileTile";
import { TilesSkeleton } from "@docspace/shared/skeletons/tiles";
import SubmitToGalleryTile from "./TilesView/sub-components/SubmitToGalleryTile";
import { Link } from "@docspace/shared/components/link";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import { IconButton } from "@docspace/shared/components/icon-button";
import styled from "styled-components";

const StyledEmptyContainerLinks = styled.div`
  display: grid;
  margin: 13px 0;
  grid-template-columns: 12px 1fr;
  grid-column-gap: 8px;

  .icon {
    height: 20px;
    width: 12px;
    margin: ${({ theme }) =>
      theme.interfaceDirection !== "rtl" ? "4px 4px 0 0;" : "4px 0 0 4px;"};
    cursor: pointer;
  }

  .link {
    color: ${({ theme }) => theme.filesEmptyContainer.linkColor};
    margin: ${({ theme }) =>
      theme.interfaceDirection !== "rtl" ? "0 7px 0 0" : "0 0 0 7px;"};
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
      !e.target.closest(".info-panel")
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
            className={"icon"}
            size="12"
            onClick={resetFilters}
            iconName={ClearEmptyFilterSvgUrl}
            isFill
          />
          <Link
            className={"link"}
            onClick={resetFilters}
            isHovered={true}
            type={"action"}
            fontWeight={"600"}
            display={"flex"}
          >
            {t("Common:ClearFilter")}
          </Link>
        </StyledEmptyContainerLinks>
      }
    />
  ) : (
    <TileContainer className="tile-container">
      {submitToGalleryTileIsVisible && canSubmitToFormGallery() && (
        <SubmitToGalleryTile />
      )}
      {oformFiles.map((item, index) => (
        <FileTile key={`${item.id}_${index}`} item={item} />
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
}))(withTranslation("Common, FormGallery")(observer(SectionBodyContent)));
