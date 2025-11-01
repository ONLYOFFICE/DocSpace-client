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

import CrossIcon from "PUBLIC_DIR/images/icons/17/cross.react.svg";

import styled from "styled-components";
import { desktop, tablet, mobile } from "@docspace/shared/utils";
import { TColorScheme } from "@docspace/shared/themes";

export const StyledArticle = styled.article<{
  showText?: boolean;
  articleOpen?: boolean;
}>`
  display: flex;
  flex-direction: column;

  background: ${(props) => props.theme.catalog.background};
  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `border-left: ${theme.catalog.verticalLine};`
      : `border-right: ${theme.catalog.verticalLine};`}

  min-width: 251px;
  max-width: 251px;
  height: 100dvh;

  .article__content {
    padding: 0 20px;
  }

  @media ${tablet} {
    min-width: ${(props) => (props.showText ? "243px" : "60px")};
    max-width: ${(props) => (props.showText ? "243px" : "60px")};
    .article__content {
      padding: 0 8px;
    }
  }

  @media ${mobile} {
    z-index: 204;
    display: ${(props) => (props.articleOpen ? "flex" : "none")};
    flex-direction: column;
    min-width: 100dvw;
    width: 100dvw;
    position: fixed;
    margin: 0;
    padding: 0;

    border: none;

    height: calc(100% - 64px) !important;

    position: absolute;
    top: 64px;
  }
`;

export const StyledArticleHeader = styled.h1<{ showText: boolean }>`
  padding: 12px 4px;
  font-size: 17px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
  ${(props) => !props.showText && "text-align: center"}
`;

export const StyledCrossIcon = styled(CrossIcon)`
  position: absolute;
  top: 37px;
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `left: 10px` : `right: 10px`};
  border-radius: 100px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 290;
  width: 17px;
  height: 17px;
  path {
    stroke: ${(props) => props.theme.catalog.control.fill};
  }
`;

export const StyledHideButtonWrapper = styled.div<{ showText: boolean }>`
  min-width: ${({ showText }) => (showText ? "243px" : "60px")};
  max-width: ${({ showText }) => (showText ? "243px" : "60px")};
  height: 44px;

  position: fixed;
  bottom: 16px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  @media ${desktop} {
    display: none;
  }

  @media ${mobile} {
    display: none;
  }
`;

export const StyledShowButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    path {
      fill: ${(props) => props.theme.article.catalogShowText};
    }
  }
`;

export const StyledHideButton = styled.div<{
  currentColorScheme?: TColorScheme;
}>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;

  .article-hide-menu-text {
    color: ${({ currentColorScheme }) => currentColorScheme?.main?.accent};
  }

  svg {
    path {
      fill: ${({ currentColorScheme }) => currentColorScheme?.main?.accent};
    }
  }

  .article-hide-menu-icon {
    display: flex;
    align-items: center;
  }
`;
