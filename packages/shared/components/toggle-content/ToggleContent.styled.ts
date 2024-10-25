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

import { globalColors } from "../../themes";
import { injectDefaultTheme } from "../../utils";

const StyledContainer = styled.div.attrs(injectDefaultTheme)<{
  enableToggle?: boolean;
  isOpen?: boolean;
}>`
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  .toggle-container {
    display: inline-block;
  }

  .span-toggle-content {
    cursor: pointer;
    user-select: none;

    display: grid;
    grid-template-columns: ${(props) =>
      props.enableToggle ? "16px 1fr" : "1fr"};
    grid-column-gap: 9px;
    max-width: 660px;

    svg {
      ${(props) =>
        !props.enableToggle &&
        css`
          display: none;
        `}

      path {
        fill: ${(props) => props.theme.toggleContent.iconColor};
      }
    }
  }

  .arrow-toggle-content {
    margin: auto 0;
    transform: ${(props) =>
      props.isOpen && props.theme.toggleContent.transform};
  }

  .heading-toggle-content {
    display: inline-block;
    height: ${(props) => props.theme.toggleContent.headingHeight};
    line-height: ${(props) => props.theme.toggleContent.headingHeight};
    box-sizing: border-box;
    font-style: normal;

    ${(props) =>
      props.enableToggle
        ? css`
            &:hover {
              border-bottom: ${props.theme.toggleContent.hoverBorderBottom};
            }
          `
        : css`
            cursor: default;
          `}
  }
`;

const StyledContent = styled.div.attrs(injectDefaultTheme)<{
  isOpen?: boolean;
}>`
  color: ${(props) => props.theme.toggleContent.childrenContent.color};
  padding-top: ${(props) =>
    props.theme.toggleContent.childrenContent.paddingTop};
  display: ${(props) => (props.isOpen ? "block" : "none")};
`;

export { StyledContent, StyledContainer };
