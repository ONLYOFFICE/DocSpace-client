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

import React, { useEffect } from "react";
import { ReactSVG } from "react-svg";
import throttle from "lodash/throttle";
import AvatarEditor, { Position } from "react-avatar-editor";

import ZoomMinusReactSvgUrl from "PUBLIC_DIR/images/zoom-minus.react.svg?url";
import ZoomPlusReactSvgUrl from "PUBLIC_DIR/images/zoom-plus-test.react.svg?url";
import IconCropperGridSvgUrl from "PUBLIC_DIR/images/subtract.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";

import { Slider } from "../../slider";
import { IconButton } from "../../icon-button";
import { StyledImageCropper } from "../ImageEditor.styled";
import { ImageCropperProps } from "../ImageEditor.types";

const ImageCropper = ({
  t,
  image,
  onChangeImage,
  uploadedFile,
  setUploadedFile,
  setPreviewImage,
  isDisabled,
  disableImageRescaling,
  onChangeFile,
}: ImageCropperProps) => {
  const editorRef = React.useRef<null | AvatarEditor>(null);
  const inputFilesElement = React.useRef(null);
  const setEditorRef = (editor: AvatarEditor) => (editorRef.current = editor);

  const handlePositionChange = (position: Position) => {
    if (isDisabled || disableImageRescaling) return;

    onChangeImage({ ...image, x: position.x, y: position.y });
  };

  const handleSliderChange = (
    e?: React.ChangeEvent<HTMLInputElement>,
    newZoom: null | number = null,
  ) => {
    if (isDisabled) return;

    const val = e ? e?.target.value : 0;

    onChangeImage({ ...image, zoom: newZoom || +val });
  };

  const handleZoomInClick = () => {
    if (isDisabled) return;

    handleSliderChange(undefined, image.zoom <= 4.5 ? image.zoom + 0.5 : 5);
  };

  const handleZoomOutClick = () => {
    if (isDisabled) return;

    handleSliderChange(undefined, image.zoom >= 1.5 ? image.zoom - 0.5 : 1);
  };

  const handleChangeImage = (e) => {
    if (isDisabled) return;
    onChangeFile(e);
  };

  const onInputClick = () => {
    if (inputFilesElement.current) {
      inputFilesElement.current.value = null;
    }
  };

  const handleImageChange = throttle(() => {
    try {
      if (!editorRef.current) return;
      const newPreviewImage = editorRef.current
        .getImageScaledToCanvas()
        ?.toDataURL();
      setPreviewImage(newPreviewImage);
    } catch (e) {
      // console.error(e);
    }
  }, 300);

  useEffect(() => {
    handleImageChange();
    return () => {
      // setPreviewImage("");
    };
  }, [handleImageChange, image, setPreviewImage]);

  return (
    <StyledImageCropper
      className="icon_cropper"
      disableImageRescaling={disableImageRescaling}
    >
      <div className="icon_cropper-crop_area">
        <ReactSVG className="icon_cropper-grid" src={IconCropperGridSvgUrl} />
        <AvatarEditor
          className="icon_cropper-avatar-editor"
          ref={setEditorRef}
          image={uploadedFile}
          width={648}
          height={648}
          position={{ x: image.x, y: image.y }}
          scale={image.zoom}
          color={[6, 22, 38, 0.2]}
          border={0}
          rotate={0}
          borderRadius={108}
          style={{ width: "368px", height: "367px" }}
          onPositionChange={handlePositionChange}
          onImageReady={handleImageChange}
          disableHiDPIScaling={false}
          crossOrigin="anonymous"
        />
      </div>
      <div
        className="icon_cropper-delete_button"
        onClick={() => inputFilesElement.current.click()}
        title={t("Common:ChooseAnother")}
      >
        <ReactSVG src={RefreshReactSvgUrl} />
        <div className="icon_cropper-delete_button-text">
          {t("Common:ChooseAnother")}
        </div>
        <input
          id="customFileInput"
          className="custom-file-input"
          type="file"
          onChange={handleChangeImage}
          accept="image/png, image/jpeg"
          onClick={onInputClick}
          ref={inputFilesElement}
          style={{ display: "none" }}
        />
      </div>

      {typeof uploadedFile !== "string" &&
        uploadedFile?.name &&
        !disableImageRescaling && (
          <div className="icon_cropper-zoom-container">
            <IconButton
              className="icon_cropper-zoom-container-button"
              size={20}
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
              value={image.zoom}
              withPouring={true}
              isDisabled={isDisabled}
            />
            <IconButton
              className="icon_cropper-zoom-container-button"
              size={20}
              onClick={handleZoomInClick}
              iconName={ZoomPlusReactSvgUrl}
              isFill
              isClickable={false}
              isDisabled={isDisabled}
            />
          </div>
        )}
    </StyledImageCropper>
  );
};

export default ImageCropper;
