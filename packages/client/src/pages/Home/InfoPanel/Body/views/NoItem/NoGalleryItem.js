import FormGalleryEmptyInfoReactSvgUrl from "PUBLIC_DIR/images/form-gallery-empty-info.react.svg?url";
import styled from "styled-components";
import { Text } from "@docspace/shared/components";

const StyledGalleryEmptyScreen = styled.div`
  .info-panel_gallery-empty-screen-img {
    display: block;
    margin: 0 auto;
    padding: 80px 0 32px 0;
  }

  .info-panel_gallery-empty-screen-text {
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    font-weight: 700;
    line-height: 22px;
    text-align: center;
  }
`;

const NoGalleryItem = ({ t }) => {
  return (
    <StyledGalleryEmptyScreen className="info-panel_gallery-empty-screen">
      <img
        className="info-panel_gallery-empty-screen-img"
        src={FormGalleryEmptyInfoReactSvgUrl}
        alt="Empty Screen Gallery image"
      />
      <Text className="info-panel_gallery-empty-screen-text">
        {t("InfoPanel:GalleryEmptyScreenText")}
      </Text>
    </StyledGalleryEmptyScreen>
  );
};
export default NoGalleryItem;
