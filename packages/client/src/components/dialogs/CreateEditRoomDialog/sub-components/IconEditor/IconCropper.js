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

import IconCropperGridSvgUrl from "PUBLIC_DIR/images/icon-cropper-grid.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import ZoomMinusReactSvgUrl from "PUBLIC_DIR/images/zoom-minus.react.svg?url";
import ZoomPlusReactSvgUrl from "PUBLIC_DIR/images/zoom-plus.react.svg?url";
import React, { useEffect } from "react";
import styled from "styled-components";
import { ReactSVG } from "react-svg";
import throttle from "lodash/throttle";
import AvatarEditor from "react-avatar-editor";

import { IconButton } from "@docspace/shared/components/icon-button";
import { Slider } from "@docspace/shared/components/slider";
import { DivWithTooltip } from "@docspace/shared/components/tooltip";

import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledIconCropper = styled.div.attrs(injectDefaultTheme)`
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
      inset: 0;
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

const IconCropper = ({
  t,
  icon,
  onChangeIcon,
  uploadedFile,
  setUploadedFile,
  setPreviewIcon,
  isDisabled,
}) => {
  let editorRef = null;
  const setEditorRef = (editor) => (editorRef = editor);

  const handlePositionChange = (position) => {
    if (isDisabled) return;

    onChangeIcon({ ...icon, x: position.x, y: position.y });
  };

  const handleSliderChange = (e, newZoom = null) => {
    if (isDisabled) return;

    onChangeIcon({ ...icon, zoom: newZoom || +e.target.value });
  };

  const handleZoomInClick = () => {
    if (isDisabled) return;

    handleSliderChange({}, icon.zoom <= 4.5 ? icon.zoom + 0.5 : 5);
  };
  const handleZoomOutClick = () => {
    if (isDisabled) return;

    handleSliderChange({}, icon.zoom >= 1.5 ? icon.zoom - 0.5 : 1);
  };
  const handleDeleteImage = () => {
    if (isDisabled) return;
    setUploadedFile(null);
  };

  const handleImageChange = throttle(() => {
    try {
      if (!editorRef) return;
      const newPreveiwImage = editorRef.getImageScaledToCanvas()?.toDataURL();
      setPreviewIcon(newPreveiwImage);
    } catch (e) {
      console.error(e);
    }
  }, 300);

  useEffect(() => {
    handleImageChange();
    return () => {
      setPreviewIcon("");
    };
  }, [icon]);

  return (
    <StyledIconCropper className="icon_cropper">
      <div className="icon_cropper-crop_area">
        <ReactSVG className="icon_cropper-grid" src={IconCropperGridSvgUrl} />
        <AvatarEditor
          ref={setEditorRef}
          image={uploadedFile}
          width={368}
          height={368}
          position={{ x: icon.x, y: icon.y }}
          scale={icon.zoom}
          color={[6, 22, 38, 0.2]}
          border={0}
          rotate={0}
          borderRadius={108}
          onPositionChange={handlePositionChange}
          onImageReady={handleImageChange}
          disableHiDPIScaling
          crossOrigin="anonymous"
        />
      </div>

      <DivWithTooltip
        className="icon_cropper-delete_button"
        onClick={handleDeleteImage}
        title={t("Common:Delete")}
      >
        <ReactSVG src={TrashReactSvgUrl} />
        <div className="icon_cropper-delete_button-text">
          {t("Common:Delete")}
        </div>
      </DivWithTooltip>

      <div className="icon_cropper-zoom-container">
        <IconButton
          className="icon_cropper-zoom-container-button"
          size="16"
          onClick={handleZoomOutClick}
          iconName={ZoomMinusReactSvgUrl}
          isFill
          isClickable={false}
          isDisabled={isDisabled}
        />
        <Slider
          className="icon_cropper-zoom-container-slider"
          max={5}
          min={1}
          onChange={handleSliderChange}
          step={0.01}
          value={icon.zoom}
          isDisabled={isDisabled}
        />
        <IconButton
          className="icon_cropper-zoom-container-button"
          size="16"
          onClick={handleZoomInClick}
          iconName={ZoomPlusReactSvgUrl}
          isFill
          isClickable={false}
          isDisabled={isDisabled}
        />
      </div>
    </StyledIconCropper>
  );
};

export default IconCropper;
