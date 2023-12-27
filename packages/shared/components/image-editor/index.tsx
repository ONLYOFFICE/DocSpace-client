import React from "react";
import Dropzone from "./Dropzone";
import ImageCropper from "./ImageCropper";
import { ImageEditorProps } from "./ImageEditor.types";
import AvatarPreview from "./AvatarPreview";

const ImageEditor = ({
  t,
  image,
  onChangeImage,
  Preview,
  setPreview,
  isDisabled,
  classNameWrapperImageCropper,
  className,
}: ImageEditorProps) => {
  const setUploadedFile = (uploadedFile?: File) => {
    if (uploadedFile) onChangeImage({ ...image, uploadedFile });
  };

  const isDefaultAvatar =
    typeof image.uploadedFile === "string" &&
    image.uploadedFile.includes("default_user_photo");

  return (
    <div className={className}>
      {image.uploadedFile && !isDefaultAvatar && (
        <div className={classNameWrapperImageCropper}>
          <ImageCropper
            t={t}
            image={image}
            onChangeImage={onChangeImage}
            uploadedFile={image.uploadedFile}
            setUploadedFile={setUploadedFile}
            setPreviewImage={setPreview}
            isDisabled={isDisabled}
          />
          {Preview}
        </div>
      )}
      <Dropzone
        t={t}
        setUploadedFile={setUploadedFile}
        isDisabled={isDisabled}
      />
    </div>
  );
};

export { ImageEditor, AvatarPreview };
