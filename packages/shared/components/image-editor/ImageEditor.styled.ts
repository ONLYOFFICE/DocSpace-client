// (c) Copyright Ascensio System SIA 2010-2024
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
import { mobile } from "../../utils";
import { Base } from "../../themes";

const StyledDropzone = styled.div<{ $isLoading?: boolean }>`
  cursor: pointer;
  box-sizing: border-box;
  width: 100%;
  height: 150px;
  border: 2px dashed
    ${(props) => props.theme.createEditRoomDialog.dropzone.borderColor};
  border-radius: 6px;

  position: relative;

  .dropzone_loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .dropzone {
    height: 100%;
    width: 100%;
    visibility: ${(props) => (props.$isLoading ? "hidden" : "visible")};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;

    user-select: none;

    &-link {
      display: flex;
      flex-direction: row;
      gap: 4px;

      font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
      line-height: 20px;
      &-main {
        font-weight: 600;
        text-decoration: underline;
        text-decoration-style: dashed;
        text-underline-offset: 1px;
      }
      &-secondary {
        font-weight: 400;
        color: ${(props) =>
          props.theme.createEditRoomDialog.dropzone.linkSecondaryColor};
      }

      @media ${mobile} {
        &-secondary {
          display: none;
        }
      }
    }

    &-exsts {
      font-weight: 600;
      font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
      line-height: 16px;
      color: ${(props) => props.theme.createEditRoomDialog.dropzone.exstsColor};
    }
  }
`;

const StyledImageCropper = styled.div`
  max-width: 216px;

  .icon_cropper-crop_area {
    width: 216px;
    height: 216px;
    margin-bottom: 4px;
    position: relative;
    .icon_cropper-grid {
      pointer-events: none;
      position: absolute;
      width: 216px;
      height: 216px;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      svg {
        opacity: 0.2;
        path {
          fill: ${(props) =>
            props.theme.createEditRoomDialog.iconCropper.gridColor};
        }
      }
    }
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
    border: 1px solid
      ${(props) =>
        props.theme.createEditRoomDialog.iconCropper.deleteButton.borderColor};
    border-radius: 3px;
    margin-bottom: 12px;

    transition: all 0.2s ease;
    &:hover {
      background: ${(props) =>
        props.theme.createEditRoomDialog.iconCropper.deleteButton
          .hoverBackground};
      border: 1px solid
        ${(props) =>
          props.theme.createEditRoomDialog.iconCropper.deleteButton
            .hoverBorderColor};
    }

    &-text {
      user-select: none;
      font-weight: 600;
      line-height: 20px;
      color: ${(props) =>
        props.theme.createEditRoomDialog.iconCropper.deleteButton.color};
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
    gap: 12px;
    margin-bottom: 20px;

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
      font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
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

StyledDropzone.defaultProps = { theme: Base };

export { StyledDropzone, StyledImageCropper, StyledPreviewTile };
