import styled, { css } from "styled-components";

import { tablet, mobile } from "@docspace/components/utils/device";
import Headline from "@docspace/common/components/Headline";
import ComboBox from "@docspace/components/combobox";
import { Base } from "@docspace/components/themes";
import { Button } from "@docspace/components";

const calculateContainerGridColumns = (isRootFolder, isInfoPanelVisible) => {
  let result = "min-content 12px auto";
  if (!isRootFolder) result = "29px " + result;
  if (!isInfoPanelVisible) result += " 52px";
  return result;
};

const StyledHeadline = styled(Headline)`
  width: 100%;
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  @media ${tablet} {
    font-size: 21px;
    line-height: 28px;
  }
  @media ${mobile} {
    font-size: 18px;
    line-height: 24px;
  }
`;

const StyledContainer = styled.div`
  width: 100%;
  height: 32px;
  display: grid;

  grid-template-columns: ${({ isRootFolder, isInfoPanelVisible }) =>
    calculateContainerGridColumns(isRootFolder, isInfoPanelVisible)};

  @media ${tablet} {
    grid-template-columns: ${({ isRootFolder }) =>
      isRootFolder ? "min-content 12px auto" : "29px min-content 12px auto"};
  }

  align-items: center;

  .arrow-button {
    width: 17px;
    min-width: 17px;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
  }

  @media ${tablet} {
    width: 100%;
    padding: 16px 0 16px;
  }

  @media ${mobile} {
    width: 100%;
    padding: 12px 0 12px;
  }
`;

// const StyledHeadline = styled(Headline)`
//   width: fit-content;
//   font-weight: 700;
//   font-size: ${isMobile ? "21px !important" : "18px"};
//   line-height: ${isMobile ? "28px !important" : "24px"};
//   @media ${tablet} {
//     font-size: 21px;
//     line-height: 28px;
//   }
// `;

const StyledNavigationDrodown = styled(ComboBox)`
  width: 12px;
  margin-left: 4px;
  box-sizing: border-box;
  background: transparent;
`;
const StyledSubmitToGalleryButton = styled(Button)`
  margin-left: auto;

  @media ${mobile} {
    display: none;
  }

  ${(props) =>
    props.theme.interfaceDirection === "ltr"
      ? css`
          margin-left: auto;
        `
      : css`
          margin-right: auto;
        `}
`;
StyledSubmitToGalleryButton.defaultProps = { theme: Base };

const StyledInfoPanelToggleWrapper = styled.div`
  box-sizing: border-box;
  display: ${(props) => (props.isInfoPanelVisible ? "none" : "flex")};
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;

  margin: ${({ theme }) =>
    theme.interfaceDirection !== "rtl" ? "0 8px 0 28px" : "0 28px 0 8px"};

  @media ${tablet} {
    display: none;
  }

  .info-panel-toggle-bg {
    height: 16px;
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-bottom: 1px;

    background-color: ${(props) =>
      props.isInfoPanelVisible
        ? props.theme.infoPanel.sectionHeaderToggleBgActive
        : props.theme.infoPanel.sectionHeaderToggleBg};

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }

    path {
      fill: ${(props) =>
        props.isInfoPanelVisible
          ? props.theme.infoPanel.sectionHeaderToggleIconActive
          : props.theme.infoPanel.sectionHeaderToggleIcon};
    }
  }
`;
StyledInfoPanelToggleWrapper.defaultProps = { theme: Base };

export {
  StyledHeadline,
  StyledContainer,
  StyledNavigationDrodown,
  StyledSubmitToGalleryButton,
  StyledInfoPanelToggleWrapper,
};
