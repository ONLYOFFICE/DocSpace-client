// (c) Copyright Ascensio System SIA 2009-2025
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

import styled, { css, keyframes } from "styled-components";
import { Row } from "@docspace/shared/components/rows";
import { isMobile } from "react-device-detect";
import { NoUserSelect } from "@docspace/shared/utils";
import { IconButton } from "@docspace/shared/components/icon-button";

import LoadErrorIcon from "PUBLIC_DIR/images/load.error.react.svg";

const circularRotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  40% {
    transform: rotate(-180deg);
  }
  50% {
    transform: rotate(-180deg);
  }
  90% {
    transform: rotate(-360deg);
  }
  100% {
    transform: rotate(-360deg);
  }
`;

export const StyledIconButton = styled(IconButton)`
  svg {
    animation: ${circularRotate} 2s ease-in-out infinite;
    transform-origin: center;
  }
`;

export const StyledLoadErrorIcon = styled(LoadErrorIcon)`
  outline: none !important;
  path {
    fill: ${(props) => props.theme.filesPanels.upload.iconColor};
  }
`;

export const StyledFileRow = styled(Row)`
  width: 100%;
  box-sizing: border-box;

  .row_context-menu-wrapper {
    width: auto;
    display: none;
  }

  ${!isMobile && "min-height: 48px;"}

  height: 100%;

  padding-inline-end: 16px;

  .styled-element,
  .row_content {
    ${(props) =>
      props.showPasswordInput &&
      css`
        margin-top: -36px;
      `}
  }

  .styled-element {
    margin-inline-end: 8px !important;
  }

  .upload-panel_file-name {
    max-width: 412px;
    overflow: hidden;
    text-overflow: ellipsis;
    align-items: center;
    display: flex;
  }

  .enter-password {
    white-space: nowrap;
    max-width: 97px;
    overflow: hidden;
    ${NoUserSelect}
  }
  .password-input {
    position: absolute;
    top: 37px;
    ${(props) =>
      props.showPasswordInput &&
      css`
        top: 48px;
      `}
    inset-inline: 0;
    max-width: 470px;
    width: calc(100% - 16px);
    display: flex;
  }

  .conversion-button {
    margin-inline-start: 8px;
    width: 100%;
    max-width: 78px;
  }
  .row_content > a,
  .row_content > p {
    margin: auto 0;
    line-height: 16px;
  }

  .upload_panel-icon {
    margin-inline-start: auto;
    padding-inline-start: 16px;

    line-height: 24px;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;

    svg {
      width: 16px;
      height: 16px;
    }

    .enter-password {
      color: ${(props) => props.theme.filesPanels.upload.color};
      margin-inline-end: 8px;
      text-decoration: underline dashed;
      cursor: pointer;
    }
  }

  .img_error {
    filter: grayscale(1);
  }

  .convert_icon {
    color: ${(props) => props.theme.filesPanels.upload.iconFill};
    padding-inline-end: 12px;
  }

  .upload-panel_file-row-link {
    ${(props) =>
      !props.isMediaActive &&
      css`
        cursor: default;
      `}
    :hover {
      cursor: pointer;
    }
  }

  .upload-panel-file-error_text {
    ${(props) =>
      props.isError &&
      css`
        color: ${props.theme.filesPanels.upload.color};
      `}
  }

  .file-exst {
    color: ${(props) => props.theme.filesPanels.upload.color};
  }

  .actions-wrapper {
    display: flex;
    margin-inline-start: auto;
    padding-inline-start: 16px;

    align-items: center;

    .upload-panel_percent-text {
      margin-left: 16px;
      color: ${(props) => props.theme.filesPanels.upload.progressColor};
    }
    .upload-panel_close-button,
    .upload-panel_check-button {
      margin-left: 16px;
    }
    .upload-panel_check-button {
      path {
        fill: ${(props) => props.theme.filesPanels.upload.positiveStatusColor};
      }
    }
  }
`;
