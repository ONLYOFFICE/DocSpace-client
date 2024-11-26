// (c) Copyright Ascensio System SIA 2009-2024
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

import styled from "styled-components";

import MenuIcon from "PUBLIC_DIR/images/menu.react.svg";
import CrossIcon from "PUBLIC_DIR/images/icons/17/cross.react.svg";

import { mobile, tablet, desktop, injectDefaultTheme } from "../../utils";

import { TColorScheme, globalColors } from "../../themes";

const StyledArticle = styled.article.attrs(injectDefaultTheme)<{
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
  border-inline-end: ${({ theme }) => theme.catalog.verticalLine};

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

const StyledArticleHeader = styled.div.attrs(injectDefaultTheme)<{
  showText?: boolean;
}>`
  height: 24px;
  padding-block: 23px 22px;
  padding-inline: 20px 21px;
  margin: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  @media ${tablet} {
    padding: 20px 8px 17px;
    margin: 0;
    justify-content: ${(props) => (props.showText ? "flex-start" : "center")};

    height: 61px;
    min-height: 61px;
    max-height: 61px;
    box-sizing: border-box;
  }

  @media ${mobile} {
    border-bottom: ${(props) => props.theme.catalog.header.borderBottom};
    padding: 12px 0;
  }

  -webkit-tap-highlight-color: ${globalColors.tapHighlight};
`;

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
    margin-inline-start: 9px;
  }

  @media ${mobile} {
    margin-inline-start: 0;
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

const StyledMenuIcon = styled(MenuIcon).attrs(injectDefaultTheme)`
  display: block;
  width: 20px;
  height: 20px;

  cursor: pointer;

  path {
    fill: ${(props) => props.theme.catalog.header.iconFill};
  }
`;

const StyledArticleMainButton = styled.div`
  padding: 0px 20px 16px;
  max-width: 100%;

  @media ${tablet} {
    padding: 0;
    margin: 0;
  }
`;

const StyledCrossIcon = styled(CrossIcon).attrs(injectDefaultTheme)`
  width: 17px;
  height: 17px;
  path {
    stroke: ${(props) => props.theme.catalog.control.fill};
  }
`;

const StyledArticleProfile = styled.div.attrs(injectDefaultTheme)`
  padding: 16px 20px;
  height: 40px !important;
  display: flex;
  align-items: center;
  justify-content: center;

  border-top: ${(props) => props.theme.catalog.profile.borderTop};

  border-inline-end: ${({ theme }) => theme.catalog.verticalLine};
  background-color: ${(props) => props.theme.catalog.profile.background};

  @media ${tablet} {
    padding: 16px 14px;
  }

  .profile-avatar {
    cursor: pointer;
  }

  .option-button {
    margin-inline-start: auto;
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

const StyledUserName = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 131px;
  min-width: 131px;
  padding-inline-start: 12px;
  cursor: pointer;
`;

const StyledProfileWrapper = styled.div<{
  showText?: boolean;
}>`
  z-index: 209;
  position: absolute;
  bottom: 0;
  inset-inline-start: 0;
  min-width: 251px;
  max-width: 251px;
  background-color: ${(props) => props.theme.catalog.profile.background};

  @media ${tablet} {
    min-width: ${(props) => (props.showText ? "243px" : "60px")};
    max-width: ${(props) => (props.showText ? "243px" : "60px")};
  }
`;

const StyledArticleApps = styled.div.attrs(injectDefaultTheme)<{
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
    ${(props) => props.showText && "margin-inline-start: 8px;"}
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

const StyledHideArticleMenuButton = styled.div.attrs(injectDefaultTheme)<{
  currentColorScheme: TColorScheme;
  hideProfileBlock: boolean;
  showText: boolean;
}>`
  display: flex;
  align-items: center;
  position: absolute;
  height: 44px;
  z-index: 209;
  bottom: ${(props) => (props.hideProfileBlock ? "16px" : "89px")};
  background: ${(props) => props.theme.catalog.background};

  inset-inline-start: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

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
    margin-inline-start: 16px;
    .article-hide-menu-text {
      margin-inline-start: 8px;
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
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
  }

  .article-hide-menu-icon_svg {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
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

export {
  StyledHideArticleMenuButton,
  StyledArticleApps,
  StyledArticle,
  StyledArticleHeader,
  StyledHeading,
  StyledIconBox,
  StyledMenuIcon,
  StyledArticleMainButton,
  StyledCrossIcon,
  StyledArticleProfile,
  StyledUserName,
  StyledProfileWrapper,
  StyledWrapper,
};
