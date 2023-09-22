import styled from "styled-components";
import { isMobileOnly } from "react-device-detect";
import { Base } from "@docspace/components/themes";

const StyledGalleryThumbnail = styled.div`
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  border-radius: 6px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  height: ${isMobileOnly ? "335px" : "346px"};
  border: ${(props) =>
    `solid 1px ${props.theme.infoPanel.gallery.borderColor}`};

  .info-panel_gallery-img {
    display: block;
    margin: 0 auto;
  }
`;

StyledGalleryThumbnail.defaultProps = { theme: Base };

const StyledGalleryNoThumbnail = styled.div`
  height: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  .no-thumbnail-img {
    height: 96px;
    width: 96px;
  }
`;

export { StyledGalleryThumbnail, StyledGalleryNoThumbnail };
