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
import { injectDefaultTheme } from "../../utils";

const StyledDropdown = styled.div.attrs(injectDefaultTheme)<{
  maxHeight?: number;
  manualWidth?: string;
  directionY?: "top" | "bottom" | "both";
  directionX?: "left" | "right";
  manualY?: string;
  manualX?: string;
  directionXStylesDisabled?: boolean | null;
  columnCount?: string;
  isDropdownReady?: boolean;
  zIndex?: number;
  open?: boolean;
  isMobileView?: boolean;
  itemCount?: number;
}>`
  font-family: ${(props) => props.theme.fontFamily};
  font-style: normal;
  font-weight: ${(props) => props.theme.dropDown.fontWeight};
  font-size: ${(props) => props.theme.dropDown.fontSize};
  ${(props) =>
    props.maxHeight &&
    `
    max-height: ${props.maxHeight}px;
    overflow-y: auto;
  `}
  height: fit-content;
  position: absolute;
  overflow: hidden;

  ${(props) => props.manualWidth && `width: ${props.manualWidth};`}
  ${(props) =>
    props.directionY === "top" &&
    css`
      bottom: ${props.manualY ? props.manualY : "100%"};
    `}
  ${(props) =>
    props.directionY === "bottom" &&
    css`
      top: ${props.manualY ? props.manualY : "100%"};
    `}

  ${(props) =>
    props.directionX === "right" &&
    !props.directionXStylesDisabled &&
    `inset-inline-end: ${props.manualX || "0px"};`}

  ${(props) =>
    props.directionX === "left" &&
    !props.directionXStylesDisabled &&
    `inset-inline-start: ${props.manualX || "0px"};`}

  z-index: ${(props) =>
    props.zIndex ? props.zIndex : props.theme.dropDown.zIndex};
  display: ${(props) =>
    props.open ? (props.columnCount ? "block" : "table") : "none"};
  table-layout: fixed;

  ${(props) =>
    !props.isDropdownReady &&
    `
    visibility: hidden;
    top: 0;
  `}

  background: ${(props) => props.theme.dropDown.background};
  border: ${(props) => props.theme.dropDown.border};
  border-radius: ${(props) => props.theme.dropDown.borderRadius};
  -moz-border-radius: ${(props) => props.theme.dropDown.borderRadius};
  -webkit-border-radius: ${(props) => props.theme.dropDown.borderRadius};
  box-shadow: ${(props) => props.theme.dropDown.boxShadow};
  -moz-box-shadow: ${(props) => props.theme.dropDown.boxShadow};
  -webkit-box-shadow: ${(props) => props.theme.dropDown.boxShadow};

  ${(props) =>
    props.columnCount &&
    `
    -webkit-column-count: ${props.columnCount};
    -moz-column-count: ${props.columnCount};
    column-count: ${props.columnCount};
  `}

  .scroll-drop-down-item {
    .scroll-body {
      padding-inline-end: 0 !important;
    }
  }
  &.download-dialog-dropDown {
    margin-top: 4px;
  }

  padding: 8px 0;

  @media (orientation: portrait) {
    ${(props) =>
      props.isMobileView &&
      css`
        top: auto !important;
        bottom: 0;
        inset-inline-start: 0;
        width: 100%;
      `}
  }
`;

export default StyledDropdown;
