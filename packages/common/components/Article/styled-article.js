import styled, { css } from "styled-components";

import {
  mobile,
  tablet,
  getCorrectFourValuesStyle,
} from "@docspace/shared/utils";

import { Base } from "@docspace/shared/themes";
import MenuIcon from "PUBLIC_DIR/images/menu.react.svg";
import CrossIcon from "PUBLIC_DIR/images/icons/17/cross.react.svg";

const StyledArticle = styled.article`
  position: relative;
  overflow: hidden;
  background: ${(props) => props.theme.catalog.background};

  min-width: 251px;
  max-width: 251px;

  box-sizing: border-box;

  user-select: none;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `border-left: ${theme.catalog.verticalLine};`
      : `border-right: ${theme.catalog.verticalLine};`}

  @media ${tablet} {
    min-width: ${(props) => (props.showText ? "243px" : "60px")};
    max-width: ${(props) => (props.showText ? "243px" : "60px")};

    height: ${(props) =>
      props.correctTabletHeight ? `${props.correctTabletHeight}px` : `100%`};
  }

  @media ${mobile} {
    display: ${(props) => (props.articleOpen ? "flex" : "none")};
    flex-direction: column;
    min-width: 100%;
    width: 100%;
    position: fixed;
    margin: 0;

    border: none;

    height: calc(100% - 64px) !important;

    position: absolute;
    top: 64px;
  }

  z-index: ${(props) => (props.showText && props.isMobile ? "230" : "205")};

  .article-body__scrollbar {
    height: ${(props) =>
      `calc(100% - ${props.$withMainButton ? "190px" : "150px"})`} !important;

    @media ${tablet} {
      height: calc(100% - 184px) !important;
    }

    @media ${mobile} {
      height: 100% !important;
      margin-top: 32px;
    }

    .article-scroller {
      @media ${tablet} {
        height: 100%;
        height: 100% !important;
      }

      @media ${mobile} {
        height: 100%;
      }
    }

    .scroll-body {
      display: flex;
      flex-direction: column;

      overflow-x: hidden !important;

      padding: 0 20px !important;
      margin-bottom: 0px !important;

      @media ${tablet} {
        padding: 0 8px !important;
      }

      @media ${mobile} {
        display: block;
        padding-bottom: 20px;
      }
    }
  }
`;

StyledArticle.defaultProps = { theme: Base };

const StyledArticleHeader = styled.div`
  height: 24px;
  padding: ${({ theme }) =>
    getCorrectFourValuesStyle("22px 21px 23px 20px", theme.interfaceDirection)};
  margin: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  @media ${tablet} {
    padding: 18px 8px 19px;
    margin: 0;
    justify-content: ${(props) => (props.showText ? "flex-start" : "center")};

    height: 61px;
    min-height: 61px;
    max-height: 61px;
    box-sizing: border-box;
  }

  @media ${mobile} {
    border-bottom: ${(props) => props.theme.catalog.header.borderBottom};
    padding: 12px 0 12px;
  }

  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
`;

StyledArticleHeader.defaultProps = { theme: Base };

const StyledHeading = styled.div`
  height: 24px;

  margin: 0;
  padding: 0;
  cursor: pointer;

  img.logo-icon_svg {
    height: 24px;
    width: 211px;
  }

  .logo-icon_svg {
    svg {
      path:last-child {
        fill: ${(props) => props.theme.client.home.logoColor};
      }
    }
  }

  @media ${tablet} {
    display: ${(props) => (props.showText ? "block" : "none")};
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 9px;`
        : `margin-left: 9px;`}
  }

  @media ${mobile} {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 0;`
        : `margin-left: 0;`}
  }
`;

const StyledIconBox = styled.div`
  cursor: pointer;
  display: none;
  align-items: center;

  img {
    height: 28px;
    width: 28px;
  }

  @media ${tablet} {
    display: ${(props) => (props.showText ? "none" : "flex")};
  }

  @media ${mobile} {
    display: none;
  }
`;

const StyledMenuIcon = styled(MenuIcon)`
  display: block;
  width: 20px;
  height: 20px;

  cursor: pointer;

  path {
    fill: ${(props) => props.theme.catalog.header.iconFill};
  }
`;

StyledMenuIcon.defaultProps = { theme: Base };

const StyledArticleMainButton = styled.div`
  padding: 0px 20px 16px;
  max-width: 100%;

  @media ${tablet} {
    padding: 0;
    margin: 0;
  }
`;

const StyledControlContainer = styled.div`
  width: 17px;
  height: 17px;
  position: absolute;
  top: 37px;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `left: 10px;` : `right: 10px;`}
  border-radius: 100px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 290;
`;

StyledControlContainer.defaultProps = { theme: Base };

const StyledCrossIcon = styled(CrossIcon)`
  width: 17px;
  height: 17px;
  path {
    stroke: ${(props) => props.theme.catalog.control.fill};
  }
`;

StyledCrossIcon.defaultProps = { theme: Base };

const StyledArticleProfile = styled.div`
  padding: 16px 20px;
  height: 40px !important;
  display: flex;
  align-items: center;
  justify-content: center;

  border-top: ${(props) => props.theme.catalog.profile.borderTop};

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `border-left: ${theme.catalog.verticalLine};`
      : `border-right: ${theme.catalog.verticalLine};`}
  background-color: ${(props) => props.theme.catalog.profile.background};

  @media ${tablet} {
    padding: 16px 14px;
  }

  .profile-avatar {
    cursor: pointer;
  }

  .option-button {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: auto;`
        : `margin-left: auto;`}
    height: 32px;
    width: 32px;

    .injected-svg {
      width: 16px;
      height: 16px;
    }

    .option-button-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

StyledArticleProfile.defaultProps = { theme: Base };

const StyledUserName = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 131px;
  min-width: 131px;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding-right: 12px;
        `
      : css`
          padding-left: 12px;
        `}
  cursor: pointer;
`;

const StyledProfileWrapper = styled.div`
  z-index: 209;
  position: ${(props) => (props.isVirtualKeyboardOpen ? "absolute" : "fixed")};
  bottom: 0;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          right: 0;
        `
      : css`
          left: 0;
        `}
  min-width: 251px;
  max-width: 251px;
  background-color: ${(props) => props.theme.catalog.profile.background};

  @media ${tablet} {
    min-width: ${(props) => (props.showText ? "243px" : "60px")};
    max-width: ${(props) => (props.showText ? "243px" : "60px")};
  }
`;

const StyledArticleAlertsComponent = styled.div`
  margin: 32px 0;

  display: flex;
  flex-wrap: wrap;
  row-gap: 20px;

  &:empty {
    display: none;
  }
`;

export {
  StyledArticle,
  StyledArticleHeader,
  StyledHeading,
  StyledIconBox,
  StyledMenuIcon,
  StyledArticleMainButton,
  StyledControlContainer,
  StyledCrossIcon,
  StyledArticleProfile,
  StyledUserName,
  StyledProfileWrapper,
  StyledArticleAlertsComponent,
};
