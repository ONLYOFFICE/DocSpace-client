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

"use client";

import styled, { css } from "styled-components";
import { ToastContainer } from "react-toastify";

import { Base, globalColors } from "../../themes";
import { tablet, mobile } from "../../utils";

import { IconButton } from "../icon-button";
import { ToastType } from "./Toast.enums";

const StyledToastContainer = styled(ToastContainer)<{ $topOffset: number }>`
  z-index: ${(props) => props.theme.toast.zIndex};
  -webkit-transform: translateZ(9999px);
  position: fixed;
  padding: ${(props) => props.theme.toast.padding};
  width: ${(props) => props.theme.toast.width};
  box-sizing: border-box;
  color: ${(props) => props.theme.toast.color};
  top: ${(props) =>
    `${parseInt(props.theme.toast.top, 10) + props.$topOffset}px`};
  inset-inline-end: ${(props) => props.theme.toast.right};
  margin-top: ${(props) => props.theme.toast.marginTop};
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  .Toastify__progress-bar--animated {
    animation: Toastify__trackProgress linear 1 forwards;
  }
  .Toastify__toast-body {
    overflow-wrap: anywhere;
    margin: auto 0;
    -ms-flex: 1;
    flex: 1;
  }

  .Toastify__close-button {
    color: ${(props) => props.theme.toast.closeButton.color};
    font-weight: ${(props) => props.theme.toast.closeButton.fontWeight};
    font-size: ${(props) => props.theme.toast.closeButton.fontSize};
    background: ${(props) => props.theme.toast.closeButton.background};
    outline: none;
    border: none;
    padding: ${(props) => props.theme.toast.closeButton.padding};
    cursor: pointer;
    opacity: ${(props) => props.theme.toast.closeButton.opacity};
    transition: ${(props) => props.theme.toast.closeButton.transition};
    -ms-flex-item-align: start;
    align-self: flex-start;
  }
  .Toastify__close-button:focus,
  .Toastify__close-button:hover {
    opacity: ${(props) => props.theme.toast.closeButton.hoverOpacity};
  }

  @keyframes SlideIn {
    from {
      transform: translate3d(150%, 0, 0);
      ${(props) =>
        props.theme.interfaceDirection === "rtl" &&
        css`
          transform: translate3d(-150%, 0, 0);
        `}
    }

    50% {
      visibility: hidden;
      transform: translate3d(0, 0, 0);
    }
  }

  .SlideIn {
    animation: SlideIn 0.7s ease-out;
  }

  @keyframes SlideOut {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

  .SlideOut {
    animation: SlideOut 0.3s ease-out both;
  }

  @keyframes Toastify__trackProgress {
    0% {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }

  .Toastify__toast--success {
    background-color: ${(props) => props.theme.toast.active.success};
    border: ${(props) => props.theme.toast.border.success};

    &:hover {
      background-color: ${(props) => props.theme.toast.hover.success};
    }
  }

  .Toastify__toast--error {
    background-color: ${(props) => props.theme.toast.active.error};
    border: ${(props) => props.theme.toast.border.error};

    &:hover {
      background-color: ${(props) => props.theme.toast.hover.error};
    }
  }

  .Toastify__toast--info {
    background-color: ${(props) => props.theme.toast.active.info};
    border: ${(props) => props.theme.toast.border.info};

    &:hover {
      background-color: ${(props) => props.theme.toast.hover.info};
    }
  }

  .Toastify__toast--warning {
    background-color: ${(props) => props.theme.toast.active.warning};
    border: ${(props) => props.theme.toast.border.warning};

    &:hover {
      background-color: ${(props) => props.theme.toast.hover.warning};
    }
  }

  .Toastify__toast {
    box-sizing: border-box;
    margin-bottom: ${(props) => props.theme.toast.main.marginBottom};
    box-shadow: ${(props) => props.theme.toast.main.boxShadow};
    display: flex;
    justify-content: space-between;
    max-height: ${(props) => props.theme.toast.main.maxHeight};
    overflow: ${(props) => props.theme.toast.main.overflow};
    cursor: pointer;

    border-radius: ${(props) => props.theme.toast.main.borderRadius};
    -moz-border-radius: ${(props) => props.theme.toast.main.borderRadius};
    -webkit-border-radius: ${(props) => props.theme.toast.main.borderRadius};
    color: ${(props) => props.theme.toast.main.color};
    margin: ${(props) => props.theme.toast.main.margin};
    padding: ${(props) => props.theme.toast.main.padding};
    min-height: ${(props) => props.theme.toast.main.minHeight};
    font: normal 12px ${(props) => props.theme.fontFamily};
    width: ${(props) => props.theme.toast.main.width};
    inset-inline-end: ${(props) => props.theme.toast.main.right};

    transition: ${(props) => props.theme.toast.main.transition};

    @media ${tablet} {
      // TODO: Discuss the behavior of notifications on mobile devices
      position: absolute;

      &:nth-child(1) {
        z-index: 3;
        top: 0px;
      }
      &:nth-child(2) {
        z-index: 2;
        top: 8px;
      }
      &:nth-child(3) {
        z-index: 1;
        top: 16px;
      }
    }
  }

  .Toastify__toast-body {
    display: flex;
    align-items: center;
  }

  @media ${tablet} {
    inset-inline-end: 16px;
  }

  @media only screen and (${mobile}) {
    inset-inline: 0;
    margin: auto;
    width: 100%;
    max-width: calc(100% - 32px);

    @keyframes SlideIn {
      from {
        transform: translate3d(0, -150%, 0);
      }

      50% {
        transform: translate3d(0, 0, 0);
      }
    }
  }
`;
StyledToastContainer.defaultProps = { theme: Base };

export default StyledToastContainer;

const IconWrapper = styled.div`
  align-self: start;
  display: flex;
  svg {
    width: ${(props) => props.theme.toastr.svg.width};
    min-width: ${(props) => props.theme.toastr.svg.minWidth};
    height: ${(props) => props.theme.toastr.svg.height};
    min-height: ${(props) => props.theme.toastr.svg.minHeight};
  }

  .toastr_success {
    path {
      fill: ${(props) => props.theme.toastr.svg.color.success};
    }
  }
  .toastr_error {
    path {
      fill: ${(props) => props.theme.toastr.svg.color.error};
    }
  }
  .toastr_warning {
    path {
      fill: ${(props) => props.theme.toastr.svg.color.warning};
    }
  }
  .toastr_info {
    path {
      fill: ${(props) => props.theme.toastr.svg.color.info};
    }
  }
`;
IconWrapper.defaultProps = { theme: Base };

const StyledDiv = styled.div<{ type: ToastType }>`
  margin: 0 15px;

  .toast-title {
    font-weight: ${(props) => props.theme.toastr.title.fontWeight};
    margin: ${(props) => props.theme.toastr.title.margin};
    margin-bottom: ${(props) => props.theme.toastr.title.marginBottom};
    line-height: ${(props) => props.theme.toastr.title.lineHeight};

    color: ${(props) => props.theme.toastr.title.color[props.type]};
    font-size: ${(props) => props.theme.toastr.title.fontSize};
  }

  .toast-text {
    line-height: ${(props) => props.theme.toastr.text.lineHeight};
    align-self: center;
    font-size: ${(props) => props.theme.toastr.text.fontSize};
    color: ${(props) => props.theme.toastr.text.color};
    word-break: break-word;
  }
`;
StyledDiv.defaultProps = { theme: Base };

const StyledCloseWrapper = styled.div`
  .closeButton {
    opacity: 0.5;
    padding-top: 2px;
    &:hover {
      opacity: 1;
    }
  }
`;

const StyledIconButton = styled(IconButton)`
  svg {
    path {
      fill: ${(props) => props.theme.toastr.closeButtonColor};
    }
  }
`;

StyledIconButton.defaultProps = { theme: Base };

export { StyledCloseWrapper, StyledDiv, IconWrapper, StyledIconButton };
