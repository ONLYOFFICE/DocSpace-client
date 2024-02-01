import styled, { css } from "styled-components";

import MenuIcon from "PUBLIC_DIR/images/menu.react.svg";
import CrossIcon from "PUBLIC_DIR/images/icons/17/cross.react.svg";

import {
  mobile,
  tablet,
  getCorrectFourValuesStyle,
  desktop,
} from "../../utils";

import { Base, TColorScheme } from "../../themes";

const StyledArticle = styled.article<{
  showText?: boolean;
  correctTabletHeight?: number;
  articleOpen?: boolean;
  isMobile?: boolean;
  $withMainButton?: boolean;
}>`
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

const StyledArticleHeader = styled.div<{ showText?: boolean }>`
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

const StyledHeading = styled.div<{ showText?: boolean }>`
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

const StyledIconBox = styled.div<{ showText?: boolean }>`
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

const StyledProfileWrapper = styled.div<{
  showText?: boolean;
  isVirtualKeyboardOpen?: boolean;
}>`
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

const StyledArticleApps = styled.div<{
  withDevTools: boolean;
  showText: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  margin-top: ${(props) => (props.withDevTools ? "0" : "auto")};
  margin-bottom: 16px;

  @media ${tablet} {
    ${(props) =>
    props.showText &&
    css`
        ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `margin-right: 8px;`
          : `margin-left: 8px;`}
      `}
  }

  @media ${mobile} {
    position: relative;
    bottom: 0px;
    margin-top: ${(props) => (props.withDevTools ? "16px" : "32px")};
  }

  .download-app-text {
    color: ${(props) => props.theme.filesArticleBody.downloadAppList.textColor};
  }

  .download-app-list {
    display: flex;
    gap: 8px;
  }
`;

StyledArticleApps.defaultProps = { theme: Base };

const StyledWrapper = styled.div`
  cursor: pointer;
  position: relative;
  margin-top: auto;
  margin-bottom: 16px;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  border: ${(props) => props.theme.filesArticleBody.devTools.border};
  border-radius: 6px;

  @media ${mobile} {
    bottom: 0px;
    margin-top: 32px;
  }

  .icon {
    height: 16px;
  }

  .arrow {
    height: 16px;
    margin-inline-start: auto;

    svg {
      ${({ theme }) =>
    theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }
  }

  .label {
    color: ${(props) => props.theme.filesArticleBody.devTools.color};
  }

  svg {
    path {
      fill: ${(props) => props.theme.filesArticleBody.devTools.color};
    }
  }
`;

const StyledHideArticleMenuButton = styled.div<{
  currentColorScheme: TColorScheme;
  isVirtualKeyboardOpen: boolean;
  hideProfileBlock: boolean;
  showText: boolean;
}>`
  display: flex;
  align-items: center;
  position: ${(props) => (props.isVirtualKeyboardOpen ? "absolute" : "fixed")};
  height: 44px;
  z-index: 209;
  bottom: ${(props) => (props.hideProfileBlock ? "16px" : "89px")};

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          right: 0;
        `
      : css`
          left: 0;
        `}
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  min-width: ${({ showText }) => (showText ? "243px" : "60px")};
  max-width: ${({ showText }) => (showText ? "243px" : "60px")};

  @media ${desktop} {
    display: none;
  }

  @media ${mobile} {
    display: none;
  }

  .article-hide-menu-container {
    align-items: center;
    ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
            margin-right: 16px;
          `
      : css`
            margin-left: 16px;
          `}
    .article-hide-menu-text {
      ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
              margin-right: 8px;
            `
      : css`
              margin-left: 8px;
            `}
      color: ${({ currentColorScheme }) => currentColorScheme?.main?.accent};
    }

    @media ${tablet} {
      display: ${({ showText }) => (showText ? "flex" : "none")};
    }
  }

  .article-show-menu-container {
    justify-content: center;
    width: 100%;

    @media ${tablet} {
      display: ${({ showText }) => (showText ? "none" : "flex")};
    }
  }

  .article-hide-menu-icon_svg,
  .article-show-menu-icon_svg {
    height: 20px;
    ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
        transform: scaleX(-1);
      `}
  }

  .article-hide-menu-icon_svg {
    ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
        transform: scaleX(-1);
      `}
    svg {
      path {
        fill: ${({ currentColorScheme }) => currentColorScheme?.main?.accent};
      }
    }
  }

  .article-show-menu-icon_svg {
    svg {
      path {
        fill: ${(props) => props.theme.article.catalogShowText};
      }
    }
  }
`;

StyledHideArticleMenuButton.defaultProps = { theme: Base };

export {
  StyledHideArticleMenuButton,
  StyledArticleApps,
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
  StyledWrapper,
};
