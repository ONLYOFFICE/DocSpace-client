import FormGallerySearchReactSvgUrl from "PUBLIC_DIR/images/form-gallery-search.react.svg?url";
import React from "react";
import styled from "styled-components";
import Text from "@docspace/components/text";

const StyledGalleryEmptyScreen = styled.div`
  .info-panel_gallery-empty-screen-img {
    display: block;
    margin: 0 auto;
    padding: 56px 0 48px 0;
  }

  .info-panel_gallery-empty-screen-text {
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    text-align: center;
  }
`;

const NoGalleryItem = ({ t }) => {
  return (
    <StyledGalleryEmptyScreen className="info-panel_gallery-empty-screen">
      <img
        className="info-panel_gallery-empty-screen-img"
        src={FormGallerySearchReactSvgUrl}
        alt="Empty Screen Gallery image"
      />
      <Text className="info-panel_gallery-empty-screen-text">
        {t("FormGallery:GalleryEmptyScreenDescription")}
      </Text>
    </StyledGalleryEmptyScreen>
  );
};
export default NoGalleryItem;
