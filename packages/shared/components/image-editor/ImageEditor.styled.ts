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
import { mobile } from "../../utils";
import { Base } from "../../themes";

const StyledImageCropper = styled.div<{ disableImageRescaling?: boolean }>`
  max-width: 368px;

  .icon_cropper-crop_area {
    width: 368px;
    height: 368px;
    margin-bottom: 4px;
    position: relative;
    .icon_cropper-grid {
      pointer-events: none;
      position: absolute;
      width: 368px;
      height: 368px;
      top: 0;
      bottom: 0;
      inset-inline: 0;
      svg {
        opacity: 1;
        width: 368px;
        height: 368px;
        path {
          fill: ${(props) =>
            props.theme.createEditRoomDialog.iconCropper.gridColor};
        }
      }
    }

    ${(props) =>
      props.disableImageRescaling &&
      css`
        .icon_cropper-avatar-editor {
          cursor: default !important;
        }
      `};
  }

  .icon_cropper-delete_button {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 6px 0;
    background: ${(props) =>
      props.theme.createEditRoomDialog.iconCropper.deleteButton.background};
    border-radius: 3px;
    margin-bottom: 12px;

    transition: all 0.2s ease;
    &:hover {
      background: ${(props) =>
        props.theme.createEditRoomDialog.iconCropper.deleteButton
          .hoverBackground};
      color: ${(props) =>
        props.theme.createEditRoomDialog.iconCropper.deleteButton.color};
    }

    &-text {
      user-select: none;
      font-weight: 600;
      line-height: 20px;
      color: ${(props) =>
        props.theme.createEditRoomDialog.iconCropper.deleteButton.hoverColor};
    }

    div:first-child {
      height: 16px;
    }

    svg {
      path {
        fill: ${(props) =>
          props.theme.createEditRoomDialog.iconCropper.deleteButton.iconColor};
      }
    }
  }

  .icon_cropper-zoom-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 24px;
    gap: 12px;

    &-slider {
      margin: 0;
    }

    &-button {
      user-select: none;
    }
  }
`;

const StyledPreviewTile = styled.div<{ isGeneratedPreview?: boolean }>`
  background: ${(props) =>
    props.theme.createEditRoomDialog.previewTile.background};
  width: 214px;
  border: 1px solid
    ${(props) => props.theme.createEditRoomDialog.previewTile.borderColor};
  height: 120px;
  border-radius: 12px;

  @media ${mobile} {
    display: none;
  }

  .tile-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 15px;
    border-bottom: 1px solid
      ${(props) => props.theme.createEditRoomDialog.previewTile.borderColor};

    &-icon {
      width: 32px;
      height: 32px;
      border: 1px solid
        ${(props) =>
          props.theme.createEditRoomDialog.previewTile.iconBorderColor};
      border-radius: 6px;
      img {
        user-select: none;
        height: 32px;
        width: ${(props) => (props.isGeneratedPreview ? "32px" : "auto")};
        border-radius: 6px;
      }
    }
    &-title {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
    }
  }
  .tile-tags {
    box-sizing: border-box;
    max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: start;
    padding: 15px;

    .type_tag {
      user-select: none;
      box-sizing: border-box;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;
StyledPreviewTile.defaultProps = { theme: Base };

StyledImageCropper.defaultProps = { theme: Base };

export { StyledImageCropper, StyledPreviewTile };
