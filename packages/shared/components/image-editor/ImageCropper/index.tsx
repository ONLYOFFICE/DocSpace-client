import React, { useEffect } from "react";
import { ReactSVG } from "react-svg";
import throttle from "lodash/throttle";
import AvatarEditor, { Position } from "react-avatar-editor";

import ZoomMinusReactSvgUrl from "PUBLIC_DIR/images/zoom-minus.react.svg?url";
import ZoomPlusReactSvgUrl from "PUBLIC_DIR/images/zoom-plus.react.svg?url";
import IconCropperGridSvgUrl from "PUBLIC_DIR/images/icon-cropper-grid.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

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
}: ImageCropperProps) => {
  const editorRef = React.useRef<null | AvatarEditor>(null);
  const setEditorRef = (editor: AvatarEditor) => (editorRef.current = editor);

  const handlePositionChange = (position: Position) => {
    if (isDisabled) return;

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

  const handleDeleteImage = () => {
    if (isDisabled) return;
    setUploadedFile();
  };

  const handleImageChange = throttle(() => {
    try {
      if (!editorRef.current) return;
      const newPreveiwImage = editorRef.current
        .getImageScaledToCanvas()
        ?.toDataURL();
      setPreviewImage(newPreveiwImage);
    } catch (e) {
      // console.error(e);
    }
  }, 300);

  useEffect(() => {
    handleImageChange();
    return () => {
      setPreviewImage("");
    };
  }, [handleImageChange, image, setPreviewImage]);

  return (
    <StyledImageCropper className="icon_cropper">
      <div className="icon_cropper-crop_area">
        <ReactSVG className="icon_cropper-grid" src={IconCropperGridSvgUrl} />
        <AvatarEditor
          ref={setEditorRef}
          image={uploadedFile}
          width={216}
          height={216}
          position={{ x: image.x, y: image.y }}
          scale={image.zoom}
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
      <div
        className="icon_cropper-delete_button"
        onClick={handleDeleteImage}
        title={t("Common:Delete")}
      >
        <ReactSVG src={TrashReactSvgUrl} />
        <div className="icon_cropper-delete_button-text">
          {t("Common:Delete")}
        </div>
      </div>

      <div className="icon_cropper-zoom-container">
        <IconButton
          className="icon_cropper-zoom-container-button"
          size={16}
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
          isDisabled={isDisabled}
        />
        <IconButton
          className="icon_cropper-zoom-container-button"
          size={16}
          onClick={handleZoomInClick}
          iconName={ZoomPlusReactSvgUrl}
          isFill
          isClickable={false}
          isDisabled={isDisabled}
        />
      </div>
    </StyledImageCropper>
  );
};

export default ImageCropper;
