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

import styled, { css } from "styled-components";

import { tablet, size, injectDefaultTheme } from "../../utils";

const truncateCss = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const commonCss = css`
  margin: ${(props) => props.theme.rowContent.margin};
  font-family: ${(props) => props.theme.fontFamily};
  font-size: ${(props) => props.theme.rowContent.fontSize};
  font-style: ${(props) => props.theme.rowContent.fontStyle};
  font-weight: ${(props) => props.theme.rowContent.fontWeight};
`;

const containerTabletStyle = css`
  display: block;
  height: ${(props) => props.theme.rowContent.height};
`;

const mainWrapperTabletStyle = css`
  min-width: ${(props) => props.theme.rowContent.mainWrapper.minWidth};

  margin-top: ${(props) => props.theme.rowContent.mainWrapper.marginTop};
  width: ${(props) => props.theme.rowContent.mainWrapper.width};
  margin-inline-end: ${({ theme }) => theme.rowContent.mainWrapper.marginRight};
`;

const mainContainerTabletStyle = css`
  ${truncateCss};
  max-width: ${(props) => props.theme.rowContent.maxWidth};
`;

const sideInfoTabletStyle = css<{ color?: string }>`
  display: block;
  min-width: ${(props) => props.theme.rowContent.sideInfo.minWidth};
  margin: ${(props) => props.theme.rowContent.sideInfo.margin};
  ${commonCss};
  color: ${(props) => props.color && props.color};
  ${truncateCss};
`;

const StyledRowContent = styled.div.attrs(injectDefaultTheme)<{
  disableSideInfo?: boolean;
  widthProp?: number;
  isMobile: boolean;
}>`
  width: 100%;
  display: inline-flex;

  ${(props) =>
    (!props.disableSideInfo &&
      props.widthProp &&
      props.widthProp <= size.desktop) ||
    props.isMobile
      ? `${containerTabletStyle}`
      : `
    @media ${tablet} {
      ${containerTabletStyle}
    }
  `}
`;

const MainContainerWrapper = styled.div.attrs(injectDefaultTheme)<{
  disableSideInfo?: boolean;
  widthProp?: number;
  isMobile: boolean;
  mainContainerWidth?: string;
}>`
  ${commonCss};

  display: flex;
  align-self: center;

  margin-inline-start: 0;
  margin-inline-end: auto;

  width: ${(props) =>
    props.mainContainerWidth ? props.mainContainerWidth : "140px"};
  min-width: 140px;

  ${(props) =>
    (!props.disableSideInfo &&
      props.widthProp &&
      props.widthProp <= size.desktop) ||
    props.isMobile
      ? css`
          ${mainWrapperTabletStyle}
        `
      : `
  `}
  @media ${tablet} {
    ${mainWrapperTabletStyle}
  }
`;

const MainContainer = styled.div.attrs(injectDefaultTheme)<{
  widthProp?: number;
  isMobile: boolean;
  mainContainerWidth?: string;
}>`
  height: 20px;

  max-width: 100%;

  margin-inline-end: 8px;

  ${(props) =>
    (props.widthProp && props.widthProp <= size.desktop) || props.isMobile
      ? `${mainContainerTabletStyle}`
      : `
    @media ${tablet} {
      ${mainContainerTabletStyle}
    }
  `}
`;

const MainIcons = styled.div.attrs(injectDefaultTheme)`
  height: ${(props) => props.theme.rowContent.icons.height};
  align-self: center;
  white-space: nowrap;
`;

const SideContainerWrapper = styled.div.attrs(injectDefaultTheme)<{
  disableSideInfo?: boolean;
  widthProp?: number;
  isMobile: boolean;
  mainContainerWidth?: string;
  containerWidth?: string;
  containerMinWidth?: string;
}>`
  ${commonCss};

  ${(props) =>
    (props.widthProp && props.widthProp <= size.desktop) || props.isMobile
      ? `${truncateCss}`
      : `
    @media ${tablet} {
      ${truncateCss}
    }
  `}

  align-self: center;
  align-items: center;

  > a {
    vertical-align: middle;
  }

  width: ${(props) => (props.containerWidth ? props.containerWidth : "40px")};
  min-width: ${(props) =>
    props.containerMinWidth ? props.containerMinWidth : "40px"};
  color: ${(props) => props.color && props.color};

  ${(props) =>
    (!props.disableSideInfo &&
      props.widthProp &&
      props.widthProp <= size.desktop) ||
    props.isMobile
      ? `display: none;`
      : `
    @media ${tablet} {
      display: none;
    }
  `}
`;

const TabletSideInfo = styled.div.attrs(injectDefaultTheme)<{
  color?: string;
  widthProp?: number;
  isMobile?: boolean;
}>`
  display: none;
  ${(props) => (props.color ? `color: ${props.color};` : null)}
  ${(props) =>
    (props.widthProp && props.widthProp <= size.desktop) || props.isMobile
      ? `${sideInfoTabletStyle}`
      : `
    @media ${tablet} {
      ${sideInfoTabletStyle}
    }
  `}
`;

export {
  TabletSideInfo,
  SideContainerWrapper,
  MainContainer,
  MainIcons,
  MainContainerWrapper,
  StyledRowContent,
};
