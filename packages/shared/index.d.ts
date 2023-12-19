declare module "*.svg?url" {
  const content: string;
  export default content;
}
declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  import React from "react";

  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module "external-remotes-plugin" {}
declare module "csvjson-json_beautifier" {}

declare module "resize-image" {
  type ImageFormat = "png" | "gif" | "bmp" | "jpeg" | "webp";

  type ImageTypes = {
    [P in Uppercase<ImageFormat>]: Lowercase<P>;
  };

  interface ResizeImage extends ImageTypes {
    resize2Canvas: (
      img: HTMLImageElement,
      width: number,
      heigh: number,
    ) => HTMLCanvasElement;
    resize: (
      img: HTMLImageElement,
      width: number,
      height: number,
      type: ImageFormat,
    ) => string;
  }

  const value: ResizeImage;
  return value;
}
