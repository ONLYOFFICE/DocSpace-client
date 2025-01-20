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
import { DropDown } from "../drop-down";
import { DropDownItem } from "../drop-down-item";
import { injectDefaultTheme } from "../../utils";

type StyledButtonScrollProps = {
  orientation: "left" | "right";
};

type StyledSwitchToolbarProps = {
  left?: boolean;
  isPDFFile?: boolean;
};

type StyledViewerContainerProps = {
  visible: boolean;
};

export const StyledDropDown = styled(DropDown)`
  background: ${globalColors.black};
  direction: ${({ theme }) => theme.interfaceDirection};
`;

export const StyledDropDownItem = styled(DropDownItem)`
  color: ${globalColors.white};

  .drop-down-item_icon svg {
    path {
      fill: ${globalColors.white} !important;
    }
  }

  &:hover {
    background: ${globalColors.lightDarkGrayHover};
  }
`;

export const StyledButtonScroll = styled.div<StyledButtonScrollProps>`
  z-index: 307;
  position: fixed;
  top: calc(50% - 20px);

  ${(props) => (props.orientation === "left" ? "left: 20px;" : "right: 20px;")}
`;

export const StyledSwitchToolbar = styled.div<StyledSwitchToolbarProps>`
  height: 100%;
  z-index: 306;
  position: fixed;
  width: 73px;
  background: inherit;
  display: block;
  opacity: 0;
  transition: all 0.3s;
  top: 0;

  ${(props) =>
    props.left ? "left: 0" : props.isPDFFile ? "right: 20px" : "right: 0"};

  &:hover {
    cursor: pointer;
    opacity: 1;
  }
`;

export const StyledViewerContainer = styled.div.attrs(
  injectDefaultTheme,
)<StyledViewerContainerProps>`
  color: ${(props) => props.theme.mediaViewer.color};
  display: ${(props) => (props.visible ? "block" : "none")};
  overflow: hidden;
  > span {
    position: fixed;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 0;
            margin-left: 10px;
          `
        : css`
            right: 0;
            margin-right: 10px;
          `}
    bottom: 5px;
    z-index: 305;
  }
  .deleteBtnContainer,
  .downloadBtnContainer {
    display: block;
    width: 16px;
    height: 16px;
    margin: 4px 12px;
    line-height: 19px;
    svg {
      path {
        fill: ${(props) => props.theme.mediaViewer.fill};
      }
    }
  }
  .details {
    z-index: 307;
    padding-top: 21px;
    height: 64px;
    width: 100%;
    background: linear-gradient(
      0deg,
      ${globalColors.tapHighlight} 0%,
      rgba(0, 0, 0, 0.8) 100%
    );
    position: fixed;
    top: 0;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            right: 0;
          `
        : css`
            left: 0;
          `}
    .title {
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      font-size: 20px;
      font-weight: 600;
      text-overflow: ellipsis;
      width: calc(100% - 50px);
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding-right: 16px;
            `
          : css`
              padding-left: 16px;
            `}
      box-sizing: border-box;
      color: ${(props) => props.theme.mediaViewer.titleColor};
    }
  }
  .mediaPlayerClose {
    position: fixed;
    top: 13px;
    inset-inline-end: 12px;
    height: 17px;
    &:hover {
      background-color: transparent;
    }
    svg {
      path {
        fill: ${(props) => props.theme.mediaViewer.iconColor};
      }
    }
  }

  .containerVideo {
    position: fixed;
    inset: 0;
  }
`;
