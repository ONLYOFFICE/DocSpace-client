export type TFunc = (key: string) => string;
export type TImage = {
  uploadedFile?: string | File;
  zoom: number;
  x: number;
  y: number;
};
export type TChangeImage = (image: TImage) => void;
export type TSetPreview = (preview: string) => void;

export interface ImageEditorProps {
  t: TFunc;
  image: TImage;
  onChangeImage: TChangeImage;
  Preview: React.ReactNode;
  setPreview: TSetPreview;
  isDisabled: boolean;
  classNameWrapperImageCropper?: string;
  className?: string;
}

export interface ImageCropperProps {
  t: TFunc;
  image: TImage;
  onChangeImage: TChangeImage;
  uploadedFile: File | string;
  setUploadedFile: (uploadedFile?: File) => void;
  setPreviewImage: TSetPreview;
  isDisabled: boolean;
}
