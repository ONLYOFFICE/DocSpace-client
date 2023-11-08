import styled, { css } from "styled-components";

import { tablet, mobile } from "@docspace/components/utils/device";
import Headline from "@docspace/common/components/Headline";
import ComboBox from "@docspace/components/combobox";
import { Base } from "@docspace/components/themes";
import { Button } from "@docspace/components";
import DropDownItem from "@docspace/components/drop-down-item";

const StyledContainer = styled.div`
  height: 69px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  display: grid;
  align-items: center;
  grid-template-columns: ${({ isInfoPanelVisible }) =>
    isInfoPanelVisible
      ? "29px min-content auto"
      : "29px min-content auto 52px"};

  .arrow-button {
    width: 17px;
    min-width: 17px;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
  }

  @media ${tablet} {
    height: 69px;
    padding: 0;
    grid-template-columns: 29px min-content auto;
  }

  @media ${mobile} {
    height: 53px;
    padding: 0;
    display: flex;
  }
`;

const StyledHeading = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  ${({ isInfoPanelVisible }) =>
    isInfoPanelVisible &&
    css`
      max-width: calc(100vw - 320px - 440px);
    `};

  @media ${tablet} {
    width: 100%;
    max-width: calc(100vw - 320px);
  }

  @media ${mobile} {
    margin: ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? "0 12px 0 0 " : "0 0 0 12px"};
    width: 100%;
    max-width: calc(100vw - 68px);
  }
`;

const StyledHeadline = styled(Headline)`
  width: 100%;
  max-width: min-content;
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  box-sizing: border-box;

  @media ${tablet} {
    font-size: 21px;
    line-height: 28px;
  }

  @media ${mobile} {
    font-size: 18px;
    line-height: 24px;
  }
`;

const StyledNavigationDrodown = styled(ComboBox)`
  width: 12px;
  margin: ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? "0 4px 0 0 " : "0 0 0 4px"};
  box-sizing: border-box;
  background: transparent;
`;

const StyledNavigationDrodownItem = styled(DropDownItem)`
  height: 30px;
  font-size: 12px;
  font-weight: 600;
  line-height: 30px;
`;

const StyledSubmitToGalleryButton = styled(Button)`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: auto;
        `
      : css`
          margin-left: auto;
        `}

  @media ${mobile} {
    display: none;
  }
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
  StyledHeading,
  StyledHeadline,
  StyledContainer,
  StyledNavigationDrodown,
  StyledNavigationDrodownItem,
  StyledSubmitToGalleryButton,
  StyledInfoPanelToggleWrapper,
};
